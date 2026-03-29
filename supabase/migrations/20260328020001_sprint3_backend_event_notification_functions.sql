create or replace function public.activate_subscription_with_payment(
  p_subscription_id uuid,
  p_order_id text,
  p_payment_id text,
  p_signature text,
  p_activated_at timestamptz default timezone('utc', now())
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator_id uuid;
  v_follower_id uuid;
begin
  update public.creator_subscriptions
  set status = 'active',
      started_at = coalesce(started_at, p_activated_at),
      razorpay_order_id = coalesce(p_order_id, razorpay_order_id),
      razorpay_payment_id = coalesce(p_payment_id, razorpay_payment_id),
      razorpay_signature = coalesce(p_signature, razorpay_signature),
      updated_at = timezone('utc', now())
  where id = p_subscription_id
  returning creator_id, follower_id into v_creator_id, v_follower_id;

  if v_creator_id is null then
    raise exception 'Subscription % not found', p_subscription_id;
  end if;

  insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
  values (
    v_follower_id,
    'subscription_event',
    'Subscription active',
    'Your subscription is now active.',
    'subscription',
    p_subscription_id::text
  );

  insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
  values (
    v_creator_id,
    'subscription_event',
    'New subscriber joined',
    'A follower has successfully subscribed to your tier.',
    'subscription',
    p_subscription_id::text
  );
end;
$$;
revoke all on function public.activate_subscription_with_payment(uuid, text, text, text, timestamptz) from public;
revoke all on function public.activate_subscription_with_payment(uuid, text, text, text, timestamptz) from anon;
revoke all on function public.activate_subscription_with_payment(uuid, text, text, text, timestamptz) from authenticated;
grant execute on function public.activate_subscription_with_payment(uuid, text, text, text, timestamptz) to service_role;
create or replace function public.ingest_trade_webhook(
  p_webhook_id text,
  p_source text,
  p_broker_name text,
  p_broker_order_id text,
  p_broker_trade_id text,
  p_creator_id uuid,
  p_creator_handle text,
  p_creator_name text,
  p_instrument text,
  p_symbol text,
  p_side text,
  p_status text,
  p_entry_price numeric,
  p_exit_price numeric,
  p_quantity integer,
  p_current_pnl numeric,
  p_strategy text,
  p_executed_at timestamptz,
  p_received_at timestamptz,
  p_raw_payload jsonb,
  p_metadata jsonb,
  p_request_headers jsonb
) returns table(audit_id uuid, trade_record_id uuid, feed_record_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_audit_id uuid;
  v_trade_id uuid;
  v_feed_item_id uuid;
begin
  insert into public.webhook_audits (
    webhook_id,
    broker_name,
    broker_order_id,
    source,
    signature_valid,
    received_at,
    status,
    request_headers,
    raw_payload,
    normalized_payload
  ) values (
    p_webhook_id,
    p_broker_name,
    p_broker_order_id,
    p_source,
    true,
    p_received_at,
    'received',
    coalesce(p_request_headers, '{}'::jsonb),
    coalesce(p_raw_payload, '{}'::jsonb),
    jsonb_build_object(
      'source', p_source,
      'brokerName', p_broker_name,
      'brokerOrderId', p_broker_order_id,
      'creatorId', p_creator_id,
      'instrument', p_instrument,
      'side', p_side,
      'status', p_status,
      'quantity', p_quantity,
      'entryPrice', p_entry_price,
      'executedAt', p_executed_at
    )
  )
  on conflict (webhook_id) do update set
    broker_name = excluded.broker_name,
    broker_order_id = excluded.broker_order_id,
    source = excluded.source,
    signature_valid = true,
    received_at = excluded.received_at,
    status = 'received',
    request_headers = excluded.request_headers,
    raw_payload = excluded.raw_payload,
    normalized_payload = excluded.normalized_payload,
    processed_at = null,
    error_message = null,
    updated_at = timezone('utc', now())
  returning webhook_audits.id into v_audit_id;

  begin
    insert into public.creator_profiles (
      user_id, handle, display_name, broker_name, verification_status, last_verified_trade_at
    ) values (
      p_creator_id, p_creator_handle, p_creator_name, p_broker_name, 'verified', p_executed_at
    )
    on conflict (user_id) do update set
      handle = excluded.handle,
      display_name = excluded.display_name,
      broker_name = excluded.broker_name,
      verification_status = excluded.verification_status,
      last_verified_trade_at = excluded.last_verified_trade_at;

    insert into public.trades (
      creator_id, broker_name, broker_order_id, broker_trade_id, source, source_event_id,
      instrument, symbol, side, status, entry_price, exit_price, quantity, current_pnl, strategy,
      executed_at, raw_payload, metadata
    ) values (
      p_creator_id, p_broker_name, p_broker_order_id, p_broker_trade_id, p_source, p_webhook_id,
      p_instrument, p_symbol, p_side, p_status, p_entry_price, p_exit_price, p_quantity, p_current_pnl,
      coalesce(nullif(p_strategy, ''), 'discretionary'), p_executed_at,
      coalesce(p_raw_payload, '{}'::jsonb), coalesce(p_metadata, '{}'::jsonb)
    )
    on conflict (broker_name, broker_order_id) do update set
      broker_trade_id = excluded.broker_trade_id,
      source = excluded.source,
      source_event_id = excluded.source_event_id,
      instrument = excluded.instrument,
      symbol = excluded.symbol,
      side = excluded.side,
      status = excluded.status,
      entry_price = excluded.entry_price,
      exit_price = excluded.exit_price,
      quantity = excluded.quantity,
      current_pnl = excluded.current_pnl,
      strategy = excluded.strategy,
      executed_at = excluded.executed_at,
      raw_payload = excluded.raw_payload,
      metadata = excluded.metadata,
      updated_at = timezone('utc', now())
    returning trades.id into v_trade_id;

    insert into public.feed_items (
      creator_id, trade_id, type, content, cta_label, source, published_at, raw_payload, metadata
    ) values (
      p_creator_id, v_trade_id, 'trade',
      p_broker_name || ' verified ' || p_side || ' trade for ' || p_instrument,
      'View trade', p_source, p_executed_at,
      coalesce(p_raw_payload, '{}'::jsonb), coalesce(p_metadata, '{}'::jsonb)
    )
    on conflict (trade_id) do update set
      creator_id = excluded.creator_id,
      type = excluded.type,
      content = excluded.content,
      cta_label = excluded.cta_label,
      source = excluded.source,
      published_at = excluded.published_at,
      raw_payload = excluded.raw_payload,
      metadata = excluded.metadata,
      updated_at = timezone('utc', now())
    returning feed_items.id into v_feed_item_id;

    update public.webhook_audits
      set status = 'processed',
          processed_at = timezone('utc', now()),
          trade_id = v_trade_id,
          feed_item_id = v_feed_item_id
    where webhook_id = p_webhook_id;

    insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
    values (
      p_creator_id,
      'trade_alert',
      'Trade published',
      'Your verified trade was published successfully.',
      'trade',
      v_trade_id::text
    );

    insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
    select
      cs.follower_id,
      'trade_alert',
      'New verified trade',
      p_broker_name || ' ' || p_side || ' ' || p_instrument || ' was posted by a creator you follow.',
      'trade',
      v_trade_id::text
    from public.creator_subscriptions cs
    where cs.creator_id = p_creator_id
      and cs.status = 'active';

  exception when others then
    update public.webhook_audits
      set status = 'failed',
          processed_at = timezone('utc', now()),
          error_message = sqlerrm
    where webhook_audits.id = v_audit_id;
    return query select v_audit_id, null::uuid, null::uuid;
    return;
  end;

  return query select v_audit_id, v_trade_id, v_feed_item_id;
end;
$$;
