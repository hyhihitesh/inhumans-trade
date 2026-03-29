-- Sprint 5.5: platform integrity completion
-- - real broker auth storage for Zerodha
-- - entitlement-aware public profile trade history
-- - community module v1 tables and query paths

create unique index if not exists broker_connections_user_broker_uidx
  on public.broker_connections (user_id, broker_name);

alter table public.broker_connections
  add column if not exists broker_user_id text,
  add column if not exists account_label text,
  add column if not exists access_token_ciphertext text,
  add column if not exists refresh_token_ciphertext text,
  add column if not exists token_expires_at timestamptz,
  add column if not exists last_error text,
  add column if not exists last_error_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.broker_connections enable row level security;

drop policy if exists "Users read own broker connections" on public.broker_connections;
create policy "Users read own broker connections"
on public.broker_connections
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users manage own broker connections" on public.broker_connections;
create policy "Users manage own broker connections"
on public.broker_connections
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (length(trim(content)) >= 2 and length(content) <= 1000),
  status text not null default 'active' check (status in ('active', 'hidden', 'reported')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists community_comments_post_created_idx
  on public.community_comments (post_id, created_at asc);

create table if not exists public.community_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('conviction', 'insightful')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (post_id, user_id)
);

create index if not exists community_reactions_post_idx
  on public.community_reactions (post_id);

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (reason in ('spam', 'abuse', 'misleading', 'other')),
  details text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (post_id, reporter_id)
);

create index if not exists community_reports_post_idx
  on public.community_reports (post_id);

alter table public.community_comments enable row level security;
alter table public.community_reactions enable row level security;
alter table public.community_reports enable row level security;

drop policy if exists "Authenticated read community comments" on public.community_comments;
create policy "Authenticated read community comments"
on public.community_comments
for select
to authenticated
using (true);

drop policy if exists "Authenticated insert own community comments" on public.community_comments;
create policy "Authenticated insert own community comments"
on public.community_comments
for insert
to authenticated
with check (author_id = auth.uid());

drop policy if exists "Authors update own active comments" on public.community_comments;
create policy "Authors update own active comments"
on public.community_comments
for update
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

drop policy if exists "Authenticated read community reactions" on public.community_reactions;
create policy "Authenticated read community reactions"
on public.community_reactions
for select
to authenticated
using (true);

drop policy if exists "Authenticated manage own community reactions" on public.community_reactions;
create policy "Authenticated manage own community reactions"
on public.community_reactions
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Authenticated read community reports" on public.community_reports;
create policy "Authenticated read community reports"
on public.community_reports
for select
to authenticated
using (reporter_id = auth.uid());

drop policy if exists "Authenticated insert own community reports" on public.community_reports;
create policy "Authenticated insert own community reports"
on public.community_reports
for insert
to authenticated
with check (reporter_id = auth.uid());

drop trigger if exists community_comments_touch_updated_at on public.community_comments;
create trigger community_comments_touch_updated_at
before update on public.community_comments
for each row execute function public.touch_updated_at();

create or replace function public.list_profile_trades_for_viewer(
  p_handle text,
  p_limit integer default 15
)
returns table(
  trade_id uuid,
  creator_id uuid,
  creator_handle text,
  instrument text,
  symbol text,
  side text,
  status text,
  broker_name text,
  broker_order_id text,
  entry_price numeric,
  quantity integer,
  current_pnl numeric,
  executed_at timestamptz,
  updated_at timestamptz,
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
  creator as (
    select id, handle
    from public.profiles
    where handle = p_handle
      and role = 'creator'
    limit 1
  ),
  creator_paid as (
    select
      c.id as creator_id,
      exists(
        select 1
        from public.creator_tiers ct
        where ct.creator_id = c.id
          and ct.active = true
          and ct.tier_name in ('pro', 'premium')
      ) as has_paid_tiers
    from creator c
  ),
  viewer_tier as (
    select
      cs.creator_id,
      lower(ct.tier_name) as tier_name
    from public.creator_subscriptions cs
    join public.creator_tiers ct on ct.id = cs.tier_id
    join viewer v on v.viewer_id = cs.follower_id
    where cs.status = 'active'
      and ct.active = true
  ),
  base as (
    select
      t.id as trade_id,
      t.creator_id,
      c.handle as creator_handle,
      t.instrument,
      t.symbol,
      t.side,
      t.status,
      t.broker_name,
      t.broker_order_id,
      t.entry_price,
      t.quantity,
      t.current_pnl,
      t.executed_at,
      t.updated_at,
      case
        when lower(coalesce(t.metadata->>'visibilityTier', '')) in ('free', 'pro', 'premium')
          then lower(t.metadata->>'visibilityTier')
        when cp.has_paid_tiers then 'pro'
        else 'free'
      end as required_tier,
      coalesce(vt.tier_name, 'free') as viewer_tier
    from public.trades t
    join creator c on c.id = t.creator_id
    join creator_paid cp on cp.creator_id = t.creator_id
    left join viewer_tier vt on vt.creator_id = t.creator_id
    order by t.executed_at desc
    limit greatest(1, least(coalesce(p_limit, 15), 100))
  ),
  ranked as (
    select
      b.*,
      case
        when b.required_tier = 'premium' then 3
        when b.required_tier = 'pro' then 2
        else 1
      end as required_rank,
      case
        when b.viewer_tier = 'premium' then 3
        when b.viewer_tier = 'pro' then 2
        else 1
      end as viewer_rank
    from base b
  )
  select
    r.trade_id,
    r.creator_id,
    r.creator_handle,
    r.instrument,
    r.symbol,
    r.side,
    r.status,
    r.broker_name,
    case
      when r.creator_id <> (select viewer_id from viewer)
        and r.viewer_rank < r.required_rank
      then null
      else r.broker_order_id
    end as broker_order_id,
    case
      when r.creator_id <> (select viewer_id from viewer)
        and r.viewer_rank < r.required_rank
      then null
      else r.entry_price
    end as entry_price,
    case
      when r.creator_id <> (select viewer_id from viewer)
        and r.viewer_rank < r.required_rank
      then null
      else r.quantity
    end as quantity,
    case
      when r.creator_id <> (select viewer_id from viewer)
        and r.viewer_rank < r.required_rank
      then null
      else r.current_pnl
    end as current_pnl,
    r.executed_at,
    r.updated_at,
    r.required_tier as visibility_tier,
    (
      r.creator_id <> (select viewer_id from viewer)
      and r.viewer_rank < r.required_rank
    ) as is_locked
  from ranked r
  order by r.executed_at desc;
$$;

revoke all on function public.list_profile_trades_for_viewer(text, integer) from public;
revoke all on function public.list_profile_trades_for_viewer(text, integer) from anon;
grant execute on function public.list_profile_trades_for_viewer(text, integer) to authenticated;

create or replace function public.list_community_posts_for_viewer(
  p_limit integer default 30,
  p_creator_id uuid default null
)
returns table(
  post_id uuid,
  creator_id uuid,
  creator_handle text,
  creator_name text,
  content text,
  visibility_tier text,
  is_locked boolean,
  created_at timestamptz,
  comment_count bigint,
  reaction_count bigint,
  viewer_reaction text
)
language sql
security invoker
set search_path = public
as $$
  with viewer as (
    select auth.uid() as viewer_id
  ),
  paid_creators as (
    select
      cp.id as creator_id,
      exists(
        select 1
        from public.creator_tiers ct
        where ct.creator_id = cp.id
          and ct.active = true
          and ct.tier_name in ('pro', 'premium')
      ) as has_paid_tiers
    from public.profiles cp
    where cp.role = 'creator'
  ),
  viewer_tiers as (
    select
      cs.creator_id,
      lower(ct.tier_name) as viewer_tier
    from public.creator_subscriptions cs
    join public.creator_tiers ct on ct.id = cs.tier_id
    join viewer v on v.viewer_id = cs.follower_id
    where cs.status = 'active'
      and ct.active = true
  ),
  base as (
    select
      p.id as post_id,
      p.creator_id,
      prof.handle as creator_handle,
      prof.name as creator_name,
      p.content,
      lower(p.visibility_tier) as visibility_tier,
      p.created_at,
      coalesce(vt.viewer_tier, 'free') as viewer_tier
    from public.community_posts p
    join public.profiles prof on prof.id = p.creator_id
    join paid_creators pc on pc.creator_id = p.creator_id
    left join viewer_tiers vt on vt.creator_id = p.creator_id
    where p_creator_id is null or p.creator_id = p_creator_id
    order by p.created_at desc
    limit greatest(1, least(coalesce(p_limit, 30), 100))
  ),
  ranked as (
    select
      b.*,
      case
        when b.visibility_tier = 'premium' then 3
        when b.visibility_tier = 'pro' then 2
        else 1
      end as required_rank,
      case
        when b.viewer_tier = 'premium' then 3
        when b.viewer_tier = 'pro' then 2
        else 1
      end as viewer_rank
    from base b
  ),
  comment_counts as (
    select post_id, count(*)::bigint as comment_count
    from public.community_comments
    where status = 'active'
    group by post_id
  ),
  reaction_counts as (
    select post_id, count(*)::bigint as reaction_count
    from public.community_reactions
    group by post_id
  )
  select
    r.post_id,
    r.creator_id,
    r.creator_handle,
    r.creator_name,
    case
      when r.creator_id <> (select viewer_id from viewer)
        and r.viewer_rank < r.required_rank
      then null
      else r.content
    end as content,
    r.visibility_tier,
    (
      r.creator_id <> (select viewer_id from viewer)
      and r.viewer_rank < r.required_rank
    ) as is_locked,
    r.created_at,
    coalesce(cc.comment_count, 0) as comment_count,
    coalesce(rc.reaction_count, 0) as reaction_count,
    (
      select reaction_type
      from public.community_reactions cr
      join viewer v on true
      where cr.post_id = r.post_id
        and cr.user_id = v.viewer_id
      limit 1
    ) as viewer_reaction
  from ranked r
  left join comment_counts cc on cc.post_id = r.post_id
  left join reaction_counts rc on rc.post_id = r.post_id
  order by r.created_at desc;
$$;

revoke all on function public.list_community_posts_for_viewer(integer, uuid) from public;
revoke all on function public.list_community_posts_for_viewer(integer, uuid) from anon;
grant execute on function public.list_community_posts_for_viewer(integer, uuid) to authenticated;

create or replace function public.list_community_comments_for_viewer(
  p_post_id uuid,
  p_limit integer default 50
)
returns table(
  comment_id uuid,
  post_id uuid,
  author_id uuid,
  author_handle text,
  author_name text,
  content text,
  created_at timestamptz
)
language sql
security invoker
set search_path = public
as $$
  with viewer as (
    select auth.uid() as viewer_id
  ),
  base as (
    select
      p.id as post_id,
      p.creator_id,
      lower(p.visibility_tier) as visibility_tier,
      coalesce(
        (
          select lower(ct.tier_name)
          from public.creator_subscriptions cs
          join public.creator_tiers ct on ct.id = cs.tier_id
          join viewer v on v.viewer_id = cs.follower_id
          where cs.creator_id = p.creator_id
            and cs.status = 'active'
            and ct.active = true
          limit 1
        ),
        'free'
      ) as viewer_tier
    from public.community_posts p
    where p.id = p_post_id
    limit 1
  ),
  accessible_post as (
    select
      b.post_id,
      (
        b.creator_id <> (select viewer_id from viewer)
        and
        case
          when b.viewer_tier = 'premium' then 3
          when b.viewer_tier = 'pro' then 2
          else 1
        end
        <
        case
          when b.visibility_tier = 'premium' then 3
          when b.visibility_tier = 'pro' then 2
          else 1
        end
      ) as is_locked
    from base b
  )
  select
    c.id as comment_id,
    c.post_id,
    c.author_id,
    p.handle as author_handle,
    p.name as author_name,
    c.content,
    c.created_at
  from public.community_comments c
  join public.profiles p on p.id = c.author_id
  join accessible_post ap on ap.post_id = c.post_id
  where c.post_id = p_post_id
    and c.status = 'active'
    and ap.is_locked = false
  order by c.created_at asc
  limit greatest(1, least(coalesce(p_limit, 50), 200));
$$;

revoke all on function public.list_community_comments_for_viewer(uuid, integer) from public;
revoke all on function public.list_community_comments_for_viewer(uuid, integer) from anon;
grant execute on function public.list_community_comments_for_viewer(uuid, integer) to authenticated;
