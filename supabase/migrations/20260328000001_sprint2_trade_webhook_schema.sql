create extension if not exists "pgcrypto";
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;
drop view if exists public.users;
create view public.users as
select
  id,
  handle,
  name,
  role,
  created_at,
  updated_at
from public.profiles;
create table if not exists public.creator_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  handle text unique,
  display_name text,
  broker_name text,
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'reconnect_required', 'disabled')),
  bio text,
  last_verified_trade_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  broker_name text not null,
  broker_order_id text not null,
  broker_trade_id text,
  source text not null,
  source_event_id text not null,
  instrument text not null,
  symbol text not null,
  side text not null check (side in ('BUY', 'SELL')),
  status text not null check (status in ('open', 'closed', 'pending')),
  entry_price numeric(18,4) not null,
  exit_price numeric(18,4),
  quantity integer not null check (quantity > 0),
  current_pnl numeric(18,2) not null default 0,
  strategy text not null default 'discretionary',
  executed_at timestamptz not null,
  raw_payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (broker_name, broker_order_id),
  unique (source, source_event_id)
);
alter table public.trades alter column id set default gen_random_uuid();
create table if not exists public.feed_items (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  trade_id uuid unique references public.trades(id) on delete cascade,
  type text not null default 'trade' check (type in ('trade', 'commentary', 'announcement')),
  content text,
  cta_label text,
  source text not null default 'broker_webhook',
  published_at timestamptz not null default timezone('utc', now()),
  raw_payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
alter table public.feed_items alter column id set default gen_random_uuid();
create table if not exists public.webhook_audits (
  id uuid primary key default gen_random_uuid(),
  webhook_id text not null unique,
  broker_name text not null,
  broker_order_id text,
  source text not null,
  signature_valid boolean not null default false,
  received_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz,
  status text not null default 'received' check (status in ('received', 'processed', 'failed')),
  http_status integer,
  error_message text,
  request_headers jsonb not null default '{}'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,
  normalized_payload jsonb,
  trade_id uuid references public.trades(id) on delete set null,
  feed_item_id uuid references public.feed_items(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists creator_profiles_broker_name_idx on public.creator_profiles (broker_name);
create index if not exists trades_creator_id_executed_at_idx on public.trades (creator_id, executed_at desc);
create index if not exists trades_source_event_idx on public.trades (source, source_event_id);
create index if not exists feed_items_creator_published_idx on public.feed_items (creator_id, published_at desc);
create index if not exists webhook_audits_broker_name_idx on public.webhook_audits (broker_name, received_at desc);
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
)
returns table (audit_id uuid, trade_record_id uuid, feed_record_id uuid)
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

    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'notifications'
    ) then
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
    end if;

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
revoke all on function public.ingest_trade_webhook(
  text,
  text,
  text,
  text,
  text,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  numeric,
  numeric,
  integer,
  numeric,
  text,
  timestamptz,
  timestamptz,
  jsonb,
  jsonb,
  jsonb
) from public;
revoke all on function public.ingest_trade_webhook(
  text,
  text,
  text,
  text,
  text,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  numeric,
  numeric,
  integer,
  numeric,
  text,
  timestamptz,
  timestamptz,
  jsonb,
  jsonb,
  jsonb
) from anon;
revoke all on function public.ingest_trade_webhook(
  text,
  text,
  text,
  text,
  text,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  numeric,
  numeric,
  integer,
  numeric,
  text,
  timestamptz,
  timestamptz,
  jsonb,
  jsonb,
  jsonb
) from authenticated;
grant execute on function public.ingest_trade_webhook(
  text,
  text,
  text,
  text,
  text,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  numeric,
  numeric,
  integer,
  numeric,
  text,
  timestamptz,
  timestamptz,
  jsonb,
  jsonb,
  jsonb
) to service_role;
drop trigger if exists creator_profiles_touch_updated_at on public.creator_profiles;
create trigger creator_profiles_touch_updated_at
before update on public.creator_profiles
for each row execute function public.touch_updated_at();
drop trigger if exists trades_touch_updated_at on public.trades;
create trigger trades_touch_updated_at
before update on public.trades
for each row execute function public.touch_updated_at();
drop trigger if exists feed_items_touch_updated_at on public.feed_items;
create trigger feed_items_touch_updated_at
before update on public.feed_items
for each row execute function public.touch_updated_at();
drop trigger if exists webhook_audits_touch_updated_at on public.webhook_audits;
create trigger webhook_audits_touch_updated_at
before update on public.webhook_audits
for each row execute function public.touch_updated_at();
alter table public.creator_profiles enable row level security;
alter table public.trades enable row level security;
alter table public.feed_items enable row level security;
alter table public.webhook_audits enable row level security;
drop policy if exists "Authenticated can read creator profiles" on public.creator_profiles;
create policy "Authenticated can read creator profiles"
on public.creator_profiles
for select
to authenticated
using (true);
drop policy if exists "Authenticated can read trades" on public.trades;
create policy "Authenticated can read trades"
on public.trades
for select
to authenticated
using (true);
drop policy if exists "Authenticated can read feed items" on public.feed_items;
create policy "Authenticated can read feed items"
on public.feed_items
for select
to authenticated
using (true);
