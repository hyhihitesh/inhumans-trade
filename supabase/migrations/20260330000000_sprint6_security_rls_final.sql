-- Sprint 6: Final Security Hardening (RLS & Data Privacy)
-- This migration enforces strict multi-tenancy and tier-based gating at the table level.

-- 1. Helper Function: Check Viewer Tier
-- returns true if viewer has a tier >= required_tier for a creator
create or replace function public.check_viewer_tier(
  p_creator_id uuid,
  p_required_tier text -- 'free', 'pro', 'premium'
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_viewer_id uuid := auth.uid();
  v_viewer_rank integer;
  v_required_rank integer;
begin
  if v_viewer_id = p_creator_id then
    return true;
  end if;

  v_required_rank := case lower(p_required_tier)
    when 'premium' then 3
    when 'pro' then 2
    else 1
  end;

  select 
    case lower(ct.tier_name)
      when 'premium' then 3
      when 'pro' then 2
      else 1
    end into v_viewer_rank
  from public.creator_subscriptions cs
  join public.creator_tiers ct on ct.id = cs.tier_id
  where cs.creator_id = p_creator_id
    and cs.follower_id = v_viewer_id
    and cs.status = 'active'
    and ct.active = true;

  return coalesce(v_viewer_rank, 1) >= v_required_rank;
end;
$$;

-- 2. Profiles Table: Prevent exposure of sensitive metadata
alter table public.profiles enable row level security;

drop policy if exists "Public profiles are readable by authenticated" on public.profiles;
create policy "Public profiles are readable by authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- 3. Trades Table: Enforce tier-based visibility
alter table public.trades enable row level security;

drop policy if exists "Authenticated can read trades" on public.trades;
-- Restrict trade visibility at the table level
create policy "Trades are visible to owners or qualified subscribers"
on public.trades
for select
to authenticated
using (
  creator_id = auth.uid() or
  exists (
    select 1 from public.feed_items fi
    where fi.trade_id = id
    and public.check_viewer_tier(creator_id, lower(coalesce(fi.metadata->>'visibilityTier', 'free')))
  )
);

-- 4. Feed Items Table: Enforce tier-based visibility
alter table public.feed_items enable row level security;

drop policy if exists "Authenticated can read feed items" on public.feed_items;
create policy "Feed items are visible to owners or qualified subscribers"
on public.feed_items
for select
to authenticated
using (
  creator_id = auth.uid() or
  public.check_viewer_tier(creator_id, lower(coalesce(metadata->>'visibilityTier', 'free')))
);

-- 5. Copy Trades Table: Privacy
alter table public.copy_trades enable row level security;

drop policy if exists "Users manage own copy trades" on public.copy_trades;
create policy "Followers can see own copy trades"
on public.copy_trades
for select
to authenticated
using (follower_id = auth.uid());

create policy "Creators can see copies of their trades"
on public.copy_trades
for select
to authenticated
using (creator_id = auth.uid());

create policy "Followers can insert own copy trades"
on public.copy_trades
for insert
to authenticated
with check (follower_id = auth.uid());

-- 6. Creator Subscriptions: Ensure users only see relevant subscriptions
alter table public.creator_subscriptions enable row level security;

drop policy if exists "Users read own subscriptions" on public.creator_subscriptions;
create policy "Users read own subscriptions"
on public.creator_subscriptions
for select
to authenticated
using (creator_id = auth.uid() or follower_id = auth.uid());

-- 7. Audit & Logs: Only readable by owners
alter table public.webhook_audits enable row level security;
drop policy if exists "Only service role can read audits" on public.webhook_audits;
-- Audits are sensitive (broker data), strictly service_role or owner if applicable
create policy "Creators read own trade audits"
on public.webhook_audits
for select
to authenticated
using (exists (select 1 from public.trades t where t.id = trade_id and t.creator_id = auth.uid()));

-- 8. Final touches on RLS for Sprint 6 tables
-- Live messages: only visible to attendees or creator
drop policy if exists "Authenticated read live messages" on public.live_session_messages;
create policy "Live messages are visible to session attendees"
on public.live_session_messages
for select
to authenticated
using (
  author_id = auth.uid() or 
  exists (select 1 from public.live_session_attendees where session_id = session_id and user_id = auth.uid()) or
  exists (select 1 from public.live_sessions where id = session_id and creator_id = auth.uid())
);
