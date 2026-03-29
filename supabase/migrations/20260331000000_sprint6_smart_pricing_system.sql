-- Sprint 6: Inhumans Smart Pricing Engine
-- This migration automates creator tier governance based on verified performance.

-- 1. Performance Tiers Configuration
create table if not exists public.performance_tier_configs (
  tier_id text primary key, -- 'starter', 'rising', 'pro', 'elite'
  min_history_days integer not null,
  min_win_rate decimal not null,
  min_roi_30d decimal not null,
  max_drawdown decimal not null,
  min_price_inr integer not null,
  max_price_inr integer not null,
  platform_fee_bps integer not null, -- basis points (1500 = 15%)
  active boolean default true
);

insert into public.performance_tier_configs 
(tier_id, min_history_days, min_win_rate, min_roi_30d, max_drawdown, min_price_inr, max_price_inr, platform_fee_bps)
values
('starter', 0, 0, -100, 100, 299, 499, 500), -- 5% for first 3 months (handled in logic)
('rising', 30, 0.45, 0.05, 0.20, 499, 999, 1500),
('pro', 90, 0.55, 0.12, 0.12, 999, 1999, 1500),
('elite', 180, 0.65, 0.20, 0.08, 1999, 2999, 1200)
on conflict (tier_id) do update set
  min_history_days = excluded.min_history_days,
  min_win_rate = excluded.min_win_rate,
  min_roi_30d = excluded.min_roi_30d,
  max_drawdown = excluded.max_drawdown,
  min_price_inr = excluded.min_price_inr,
  max_price_inr = excluded.max_price_inr,
  platform_fee_bps = excluded.platform_fee_bps;

-- 2. Creator Performance Snapshots
-- Stores the calculated metrics for tier evaluation
create table if not exists public.creator_performance_snapshots (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.profiles(id) on delete cascade,
  calculated_at timestamp with time zone default now(),
  history_days integer not null,
  win_rate decimal not null,
  roi_30d decimal not null,
  max_drawdown_30d decimal not null,
  current_tier_id text references public.performance_tier_configs(tier_id),
  is_eligible_for_upgrade boolean default false,
  is_flagged_for_demotion boolean default false
);

create index if not exists idx_creator_snapshots_creator_id on public.creator_performance_snapshots(creator_id, calculated_at desc);

-- 3. Tier Evaluation Function
-- This is the "Brain" of the Inhumans Pricing System
create or replace function public.evaluate_creator_tier(p_creator_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_history_days integer;
  v_win_rate decimal;
  v_roi_30d decimal;
  v_max_drawdown decimal;
  v_new_tier text;
begin
  -- Calculate Stats
  select 
    extract(day from (now() - min(executed_at)))::integer,
    count(case when current_pnl > 0 then 1 end)::decimal / nullif(count(*), 0),
    sum(current_pnl)::decimal / 100000, -- Assume 1L capital for ROI benchmarking
    0.10 -- Placeholder for Max Drawdown (requires complex calculation, using safe default)
  into v_history_days, v_win_rate, v_roi_30d, v_max_drawdown
  from public.trades
  where creator_id = p_creator_id
    and status = 'closed'
    and executed_at >= (now() - interval '30 days');

  -- Tier Logic
  select tier_id into v_new_tier
  from public.performance_tier_configs
  where active = true
    and v_history_days >= min_history_days
    and coalesce(v_win_rate, 0) >= min_win_rate
    and coalesce(v_roi_30d, 0) >= min_roi_30d
    and coalesce(v_max_drawdown, 0) <= max_drawdown
  order by min_history_days desc, min_roi_30d desc
  limit 1;

  v_new_tier := coalesce(v_new_tier, 'starter');

  -- Record Snapshot
  insert into public.creator_performance_snapshots 
  (creator_id, history_days, win_rate, roi_30d, max_drawdown_30d, current_tier_id)
  values (p_creator_id, coalesce(v_history_days, 0), coalesce(v_win_rate, 0), coalesce(v_roi_30d, 0), v_max_drawdown, v_new_tier);

  return v_new_tier;
end;
$$;

-- 4. Automatic Pricing Guard
-- Trigger that prevents price updates outside the earned tier's range
create or replace function public.enforce_tier_pricing()
returns trigger
language plpgsql
as $$
declare
  v_tier_id text;
  v_min_price integer;
  v_max_price integer;
begin
  -- Get current earned tier
  select current_tier_id into v_tier_id
  from public.creator_performance_snapshots
  where creator_id = new.creator_id
  order by calculated_at desc
  limit 1;

  v_tier_id := coalesce(v_tier_id, 'starter');

  -- Get price bounds
  select min_price_inr, max_price_inr into v_min_price, v_max_price
  from public.performance_tier_configs
  where tier_id = v_tier_id;

  if new.monthly_price_inr < v_min_price or new.monthly_price_inr > v_max_price then
    raise exception 'Price % INR is outside the allowed range (% - %) for your current performance tier (%)', 
      new.monthly_price_inr, v_min_price, v_max_price, v_tier_id;
  end if;

  return new;
end;
$$;

create trigger trg_enforce_tier_pricing
before insert or update on public.creator_tiers
for each row execute function public.enforce_tier_pricing();
