create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (length(trim(content)) >= 10 and length(content) <= 2000),
  visibility_tier text not null default 'free' check (visibility_tier in ('free', 'pro', 'premium')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists community_posts_creator_created_idx
  on public.community_posts (creator_id, created_at desc);
create or replace function public.publish_creator_post(
  p_creator_id uuid,
  p_content text,
  p_visibility_tier text default 'free',
  p_published_at timestamptz default timezone('utc', now())
)
returns table(community_post_id uuid, feed_item_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator uuid;
  v_community_post_id uuid;
  v_feed_item_id uuid;
  v_cta text;
begin
  v_creator := coalesce(p_creator_id, auth.uid());
  if v_creator is null then
    raise exception 'Creator context is required';
  end if;

  if auth.uid() is not null and v_creator <> auth.uid() then
    raise exception 'Creator mismatch for publish action';
  end if;

  if p_visibility_tier not in ('free', 'pro', 'premium') then
    raise exception 'Invalid visibility_tier %', p_visibility_tier;
  end if;

  if p_content is null or length(trim(p_content)) < 10 then
    raise exception 'Post content must be at least 10 characters';
  end if;

  if length(p_content) > 2000 then
    raise exception 'Post content exceeds 2000 characters';
  end if;

  insert into public.community_posts (creator_id, content, visibility_tier)
  values (v_creator, trim(p_content), p_visibility_tier)
  returning id into v_community_post_id;

  v_cta := case when p_visibility_tier = 'free' then null else 'Subscribers only' end;

  insert into public.feed_items (
    creator_id,
    trade_id,
    type,
    content,
    cta_label,
    source,
    published_at,
    raw_payload,
    metadata
  ) values (
    v_creator,
    null,
    'commentary',
    trim(p_content),
    v_cta,
    'creator',
    p_published_at,
    '{}'::jsonb,
    jsonb_build_object(
      'visibilityTier', p_visibility_tier,
      'communityPostId', v_community_post_id
    )
  )
  returning id into v_feed_item_id;

  return query
  select v_community_post_id, v_feed_item_id;
end;
$$;
revoke all on function public.publish_creator_post(uuid, text, text, timestamptz) from public;
revoke all on function public.publish_creator_post(uuid, text, text, timestamptz) from anon;
grant execute on function public.publish_creator_post(uuid, text, text, timestamptz) to authenticated;
grant execute on function public.publish_creator_post(uuid, text, text, timestamptz) to service_role;
drop trigger if exists community_posts_touch_updated_at on public.community_posts;
create trigger community_posts_touch_updated_at
before update on public.community_posts
for each row execute function public.touch_updated_at();
alter table public.community_posts enable row level security;
drop policy if exists "Authenticated read community posts" on public.community_posts;
create policy "Authenticated read community posts"
on public.community_posts
for select
to authenticated
using (true);
drop policy if exists "Creators insert own community posts" on public.community_posts;
create policy "Creators insert own community posts"
on public.community_posts
for insert
to authenticated
with check (creator_id = auth.uid());
drop policy if exists "Creators update own community posts" on public.community_posts;
create policy "Creators update own community posts"
on public.community_posts
for update
to authenticated
using (creator_id = auth.uid())
with check (creator_id = auth.uid());
