-- Sprint 5 hotfix: ensure DB-level feed gating exists in production.
-- This is intentionally idempotent and mirrors the original Sprint 5 migration logic.

create index if not exists creator_subscriptions_creator_follower_status_idx
  on public.creator_subscriptions (creator_id, follower_id, status);

create index if not exists creator_tiers_id_name_active_idx
  on public.creator_tiers (id, tier_name, active);

create index if not exists feed_items_published_at_desc_idx
  on public.feed_items (published_at desc);

alter table public.feed_items enable row level security;
alter table public.trades enable row level security;
alter table public.profiles enable row level security;
alter table public.creator_subscriptions enable row level security;
alter table public.creator_tiers enable row level security;

drop policy if exists "Authenticated can read profiles" on public.profiles;
create policy "Authenticated can read profiles"
on public.profiles
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

drop policy if exists "Users read own subscriptions" on public.creator_subscriptions;
create policy "Users read own subscriptions"
on public.creator_subscriptions
for select
to authenticated
using (creator_id = auth.uid() or follower_id = auth.uid());

drop policy if exists "Creator tiers readable by authenticated" on public.creator_tiers;
create policy "Creator tiers readable by authenticated"
on public.creator_tiers
for select
to authenticated
using (true);

create or replace function public.list_feed_items_for_viewer(
  p_limit integer default 30
)
returns table(
  id uuid,
  type text,
  creator_id uuid,
  trade_id uuid,
  content text,
  cta_label text,
  published_at timestamptz,
  metadata jsonb,
  visibility_tier text,
  is_locked boolean
)
language sql
security invoker
set search_path = public
as $$
  with viewer as (
    select auth.uid() as viewer_id
  ),
  base_feed as (
    select
      fi.id,
      fi.type,
      fi.creator_id,
      fi.trade_id,
      fi.content,
      fi.cta_label,
      fi.published_at,
      fi.metadata,
      lower(coalesce(fi.metadata->>'visibilityTier', 'free')) as visibility_tier
    from public.feed_items fi
    order by fi.published_at desc
    limit greatest(1, least(coalesce(p_limit, 30), 200))
  ),
  viewer_tiers as (
    select
      cs.creator_id,
      lower(coalesce(ct.tier_name, 'free')) as viewer_tier
    from public.creator_subscriptions cs
    join public.creator_tiers ct on ct.id = cs.tier_id
    join viewer v on true
    where cs.follower_id = v.viewer_id
      and cs.status = 'active'
      and ct.active = true
  ),
  ranked as (
    select
      bf.*,
      coalesce(vt.viewer_tier, 'free') as viewer_tier,
      case
        when bf.visibility_tier = 'premium' then 3
        when bf.visibility_tier = 'pro' then 2
        else 1
      end as required_rank,
      case
        when coalesce(vt.viewer_tier, 'free') = 'premium' then 3
        when coalesce(vt.viewer_tier, 'free') = 'pro' then 2
        else 1
      end as viewer_rank
    from base_feed bf
    left join viewer_tiers vt on vt.creator_id = bf.creator_id
  )
  select
    r.id,
    r.type,
    r.creator_id,
    r.trade_id,
    case
      -- Enforce gating for commentary only. Keep row, hide content if locked.
      when r.type = 'commentary'
        and r.visibility_tier in ('pro', 'premium')
        and r.creator_id <> (select viewer_id from viewer)
        and r.viewer_rank < r.required_rank
      then null
      else r.content
    end as content,
    r.cta_label,
    r.published_at,
    r.metadata,
    case
      when r.visibility_tier in ('free', 'pro', 'premium') then r.visibility_tier
      else 'free'
    end as visibility_tier,
    (
      r.type = 'commentary'
      and r.visibility_tier in ('pro', 'premium')
      and r.creator_id <> (select viewer_id from viewer)
      and r.viewer_rank < r.required_rank
    ) as is_locked
  from ranked r
  order by r.published_at desc;
$$;

revoke all on function public.list_feed_items_for_viewer(integer) from public;
revoke all on function public.list_feed_items_for_viewer(integer) from anon;
grant execute on function public.list_feed_items_for_viewer(integer) to authenticated;
