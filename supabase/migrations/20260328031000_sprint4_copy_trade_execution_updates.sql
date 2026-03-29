create or replace function public.process_copy_trade_execution(
  p_copy_trade_id uuid,
  p_status text,
  p_executed_quantity integer default null,
  p_execution_price numeric default null,
  p_realized_pnl numeric default null,
  p_failure_reason text default null
)
returns setof public.copy_trades
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.copy_trades%rowtype;
  v_title text;
  v_body text;
begin
  if p_status not in ('submitted', 'executed', 'failed', 'skipped') then
    raise exception 'Invalid status %. Allowed: submitted/executed/failed/skipped', p_status;
  end if;

  update public.copy_trades
  set status = p_status,
      executed_quantity = coalesce(p_executed_quantity, executed_quantity),
      execution_price = coalesce(p_execution_price, execution_price),
      realized_pnl = coalesce(p_realized_pnl, realized_pnl),
      failure_reason = case
        when p_status in ('failed', 'skipped') then coalesce(p_failure_reason, failure_reason)
        else null
      end,
      updated_at = timezone('utc', now())
  where id = p_copy_trade_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Copy trade % not found', p_copy_trade_id;
  end if;

  if p_status = 'submitted' then
    v_title := 'Copy trade submitted';
    v_body := 'Your copy-trade request was submitted to execution queue.';
  elsif p_status = 'executed' then
    v_title := 'Copy trade executed';
    v_body := 'Your copy-trade request executed successfully.';
  elsif p_status = 'failed' then
    v_title := 'Copy trade failed';
    v_body := coalesce(v_row.failure_reason, 'Execution failed. Please review and retry.');
  else
    v_title := 'Copy trade skipped';
    v_body := coalesce(v_row.failure_reason, 'Execution was skipped due to risk/market conditions.');
  end if;

  insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
  values (
    v_row.follower_id,
    'system',
    v_title,
    v_body,
    'copy_trade',
    v_row.id::text
  );

  return next v_row;
end;
$$;
revoke all on function public.process_copy_trade_execution(uuid, text, integer, numeric, numeric, text) from public;
revoke all on function public.process_copy_trade_execution(uuid, text, integer, numeric, numeric, text) from anon;
revoke all on function public.process_copy_trade_execution(uuid, text, integer, numeric, numeric, text) from authenticated;
grant execute on function public.process_copy_trade_execution(uuid, text, integer, numeric, numeric, text) to service_role;
