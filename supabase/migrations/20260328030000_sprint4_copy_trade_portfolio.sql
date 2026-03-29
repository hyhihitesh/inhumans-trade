create table if not exists public.copy_trades (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  trade_id uuid not null references public.trades(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'submitted', 'executed', 'failed', 'skipped')),
  side text not null check (side in ('BUY', 'SELL')),
  symbol text not null,
  instrument text not null,
  requested_quantity integer not null check (requested_quantity > 0),
  executed_quantity integer,
  requested_risk_percent numeric(5,2),
  requested_capital_inr numeric(12,2),
  execution_price numeric(12,2),
  realized_pnl numeric(12,2),
  failure_reason text,
  idempotency_key text not null,
  source text not null default 'follower_copy',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create unique index if not exists copy_trades_follower_idempotency_unique
  on public.copy_trades (follower_id, idempotency_key);
create index if not exists copy_trades_follower_created_idx
  on public.copy_trades (follower_id, created_at desc);
create index if not exists copy_trades_creator_created_idx
  on public.copy_trades (creator_id, created_at desc);
create index if not exists copy_trades_trade_idx
  on public.copy_trades (trade_id);
create table if not exists public.user_alert_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  trade_alerts_enabled boolean not null default true,
  subscription_alerts_enabled boolean not null default true,
  marketing_alerts_enabled boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create or replace function public.create_copy_trade_request(
  p_follower_id uuid,
  p_trade_id uuid,
  p_requested_quantity integer,
  p_requested_risk_percent numeric default null,
  p_requested_capital_inr numeric default null,
  p_idempotency_key text default null
)
returns setof public.copy_trades
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trade public.trades%rowtype;
  v_follower uuid;
  v_key text;
  v_row public.copy_trades%rowtype;
begin
  v_follower := coalesce(p_follower_id, auth.uid());
  if v_follower is null then
    raise exception 'Follower context is required';
  end if;

  if auth.uid() is not null and v_follower <> auth.uid() then
    raise exception 'Follower mismatch for copy trade request';
  end if;

  if p_requested_quantity is null or p_requested_quantity < 1 then
    raise exception 'requested_quantity must be >= 1';
  end if;

  if p_requested_risk_percent is not null and (p_requested_risk_percent <= 0 or p_requested_risk_percent > 100) then
    raise exception 'requested_risk_percent must be > 0 and <= 100';
  end if;

  if p_requested_capital_inr is not null and p_requested_capital_inr <= 0 then
    raise exception 'requested_capital_inr must be > 0';
  end if;

  select *
  into v_trade
  from public.trades
  where id = p_trade_id;

  if not found then
    raise exception 'Trade % not found', p_trade_id;
  end if;

  v_key := coalesce(nullif(trim(p_idempotency_key), ''), gen_random_uuid()::text);

  insert into public.copy_trades (
    follower_id,
    creator_id,
    trade_id,
    status,
    side,
    symbol,
    instrument,
    requested_quantity,
    requested_risk_percent,
    requested_capital_inr,
    idempotency_key
  ) values (
    v_follower,
    v_trade.creator_id,
    v_trade.id,
    'pending',
    v_trade.side,
    v_trade.symbol,
    v_trade.instrument,
    p_requested_quantity,
    p_requested_risk_percent,
    p_requested_capital_inr,
    v_key
  )
  on conflict (follower_id, idempotency_key) do update
  set updated_at = timezone('utc', now())
  returning * into v_row;

  return next v_row;
end;
$$;
revoke all on function public.create_copy_trade_request(uuid, uuid, integer, numeric, numeric, text) from public;
revoke all on function public.create_copy_trade_request(uuid, uuid, integer, numeric, numeric, text) from anon;
grant execute on function public.create_copy_trade_request(uuid, uuid, integer, numeric, numeric, text) to authenticated;
grant execute on function public.create_copy_trade_request(uuid, uuid, integer, numeric, numeric, text) to service_role;
drop trigger if exists copy_trades_touch_updated_at on public.copy_trades;
create trigger copy_trades_touch_updated_at
before update on public.copy_trades
for each row execute function public.touch_updated_at();
drop trigger if exists user_alert_preferences_touch_updated_at on public.user_alert_preferences;
create trigger user_alert_preferences_touch_updated_at
before update on public.user_alert_preferences
for each row execute function public.touch_updated_at();
alter table public.copy_trades enable row level security;
alter table public.user_alert_preferences enable row level security;
drop policy if exists "Followers read own copy trades" on public.copy_trades;
create policy "Followers read own copy trades"
on public.copy_trades
for select
to authenticated
using (follower_id = auth.uid());
drop policy if exists "Creators read copied trades of their signals" on public.copy_trades;
create policy "Creators read copied trades of their signals"
on public.copy_trades
for select
to authenticated
using (creator_id = auth.uid());
drop policy if exists "Followers create own copy trades" on public.copy_trades;
create policy "Followers create own copy trades"
on public.copy_trades
for insert
to authenticated
with check (follower_id = auth.uid());
drop policy if exists "Followers update own copy trades" on public.copy_trades;
create policy "Followers update own copy trades"
on public.copy_trades
for update
to authenticated
using (follower_id = auth.uid())
with check (follower_id = auth.uid());
drop policy if exists "Users read own alert preferences" on public.user_alert_preferences;
create policy "Users read own alert preferences"
on public.user_alert_preferences
for select
to authenticated
using (user_id = auth.uid());
drop policy if exists "Users insert own alert preferences" on public.user_alert_preferences;
create policy "Users insert own alert preferences"
on public.user_alert_preferences
for insert
to authenticated
with check (user_id = auth.uid());
drop policy if exists "Users update own alert preferences" on public.user_alert_preferences;
create policy "Users update own alert preferences"
on public.user_alert_preferences
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
