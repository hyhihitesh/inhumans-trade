create or replace function public.list_live_sessions_for_viewer(
  p_limit integer default 20,
  p_creator_id uuid default null
)
returns table(
  id uuid,
  room_id uuid,
  creator_id uuid,
  title text,
  description text,
  status text,
  starts_at timestamptz,
  ends_at timestamptz,
  live_url text,
  embed_url text,
  replay_url text,
  replay_embed_url text,
  access_mode text,
  visibility_tier text,
  free_preview_minutes integer,
  can_view boolean,
  requires_upgrade boolean,
  created_at timestamptz
)
language sql
security invoker
set search_path = public
as $$
  with viewer as (
    select auth.uid() as viewer_id
  ),
  viewer_tiers as (
    select
      cs.creator_id,
      lower(ct.tier_name) as tier_name
    from public.creator_subscriptions cs
    join public.creator_tiers ct on ct.id = cs.tier_id
    join viewer v on v.viewer_id = cs.follower_id
    where cs.status = 'active'
      and ct.active = true
  )
  select
    s.id,
    s.room_id,
    s.creator_id,
    s.title,
    s.description,
    s.status,
    s.starts_at,
    s.ends_at,
    s.live_url,
    s.embed_url,
    s.replay_url,
    s.replay_embed_url,
    s.access_mode,
    s.visibility_tier,
    s.free_preview_minutes,
    case
      when s.creator_id = (select viewer_id from viewer) then true
      when s.access_mode = 'free' then true
      when s.access_mode = 'free_preview' then true
      when coalesce(vt.tier_name, 'free') = 'premium' then true
      when coalesce(vt.tier_name, 'free') = 'pro' and coalesce(s.visibility_tier, 'free') in ('free', 'pro') then true
      when coalesce(s.visibility_tier, 'free') = 'free' then true
      else false
    end as can_view,
    case
      when s.creator_id = (select viewer_id from viewer) then false
      when s.access_mode = 'tier_gated'
        and not (
          coalesce(vt.tier_name, 'free') = 'premium'
          or (coalesce(vt.tier_name, 'free') = 'pro' and coalesce(s.visibility_tier, 'free') in ('free', 'pro'))
          or coalesce(s.visibility_tier, 'free') = 'free'
        )
      then true
      else false
    end as requires_upgrade,
    s.created_at
  from public.live_sessions s
  left join viewer_tiers vt on vt.creator_id = s.creator_id
  where p_creator_id is null or s.creator_id = p_creator_id
  order by
    case s.status when 'live' then 1 when 'scheduled' then 2 when 'recording_available' then 3 else 4 end,
    s.starts_at asc
  limit greatest(1, least(coalesce(p_limit, 20), 50));
$$;

revoke all on function public.list_live_sessions_for_viewer(integer, uuid) from public, anon;
grant execute on function public.list_live_sessions_for_viewer(integer, uuid) to authenticated;

create or replace function public.register_live_session_attendance(
  p_session_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_preview_minutes integer;
begin
  select free_preview_minutes into v_preview_minutes
  from public.live_sessions
  where id = p_session_id;

  insert into public.live_session_attendees (session_id, user_id, preview_ends_at)
  values (
    p_session_id,
    p_user_id,
    case when v_preview_minutes is null then null else timezone('utc', now()) + make_interval(mins => v_preview_minutes) end
  )
  on conflict (session_id, user_id) do update
    set joined_at = timezone('utc', now());
end;
$$;

revoke all on function public.register_live_session_attendance(uuid, uuid) from public, anon;
grant execute on function public.register_live_session_attendance(uuid, uuid) to authenticated;

create or replace function public.list_courses_for_viewer(
  p_limit integer default 20,
  p_creator_id uuid default null
)
returns table(
  id uuid,
  creator_id uuid,
  title text,
  subtitle text,
  description text,
  price_inr integer,
  visibility_tier text,
  status text,
  cover_image_url text,
  module_count bigint,
  lesson_count bigint,
  enrollment_count bigint,
  is_enrolled boolean,
  created_at timestamptz,
  creator_handle text,
  creator_name text
)
language sql
security invoker
set search_path = public
as $$
  with viewer as (
    select auth.uid() as viewer_id
  )
  select
    c.id,
    c.creator_id,
    c.title,
    c.subtitle,
    c.description,
    c.price_inr,
    c.visibility_tier,
    c.status,
    c.cover_image_url,
    (select count(*) from public.course_modules m where m.course_id = c.id) as module_count,
    (select count(*) from public.course_lessons l where l.course_id = c.id) as lesson_count,
    (select count(*) from public.course_enrollments ce where ce.course_id = c.id and ce.status = 'active') as enrollment_count,
    exists(
      select 1
      from public.course_enrollments ce
      join viewer v on v.viewer_id = ce.user_id
      where ce.course_id = c.id
        and ce.status = 'active'
    ) as is_enrolled,
    c.created_at,
    p.handle as creator_handle,
    p.name as creator_name
  from public.courses c
  join public.profiles p on p.id = c.creator_id
  where c.status = 'published'
    and (p_creator_id is null or c.creator_id = p_creator_id)
  order by c.created_at desc
  limit greatest(1, least(coalesce(p_limit, 20), 50));
$$;

revoke all on function public.list_courses_for_viewer(integer, uuid) from public, anon;
grant execute on function public.list_courses_for_viewer(integer, uuid) to authenticated;

create or replace function public.list_course_cohorts(
  p_course_id uuid
)
returns table(
  id uuid,
  course_id uuid,
  title text,
  starts_at timestamptz,
  seat_limit integer,
  waitlist_enabled boolean,
  enrolled_count bigint
)
language sql
security invoker
set search_path = public
as $$
  select
    ch.id,
    ch.course_id,
    ch.title,
    ch.starts_at,
    ch.seat_limit,
    ch.waitlist_enabled,
    (select count(*) from public.cohort_enrollments ce where ce.cohort_id = ch.id and ce.status = 'active') as enrolled_count
  from public.cohorts ch
  where ch.course_id = p_course_id
  order by ch.starts_at asc;
$$;

revoke all on function public.list_course_cohorts(uuid) from public, anon;
grant execute on function public.list_course_cohorts(uuid) to authenticated;

create or replace function public.list_owner_moderation_queue(
  p_owner_id uuid
)
returns table(
  id uuid,
  subject_type text,
  subject_id uuid,
  owner_id uuid,
  reporter_count bigint,
  latest_reason text,
  status text,
  created_at timestamptz
)
language sql
security invoker
set search_path = public
as $$
  select
    (array_agg(mr.id order by mr.created_at asc))[1] as id,
    mr.subject_type,
    mr.subject_id,
    mr.owner_id,
    count(*)::bigint as reporter_count,
    (
      array_agg(mr.reason order by mr.created_at desc)
    )[1] as latest_reason,
    (
      array_agg(mr.status order by mr.updated_at desc)
    )[1] as status,
    min(mr.created_at) as created_at
  from public.moderation_reports mr
  where mr.owner_id = p_owner_id
  group by mr.subject_type, mr.subject_id, mr.owner_id
  order by min(mr.created_at) desc;
$$;

revoke all on function public.list_owner_moderation_queue(uuid) from public, anon;
grant execute on function public.list_owner_moderation_queue(uuid) to authenticated;

create or replace function public.list_admin_moderation_queue()
returns table(
  id uuid,
  subject_type text,
  subject_id uuid,
  owner_id uuid,
  reporter_count bigint,
  latest_reason text,
  status text,
  created_at timestamptz
)
language sql
security invoker
set search_path = public
as $$
  select
    (array_agg(mr.id order by mr.created_at asc))[1] as id,
    mr.subject_type,
    mr.subject_id,
    mr.owner_id,
    count(*)::bigint as reporter_count,
    (
      array_agg(mr.reason order by mr.created_at desc)
    )[1] as latest_reason,
    (
      array_agg(mr.status order by mr.updated_at desc)
    )[1] as status,
    min(mr.created_at) as created_at
  from public.moderation_reports mr
  group by mr.subject_type, mr.subject_id, mr.owner_id
  order by min(mr.created_at) desc;
$$;

revoke all on function public.list_admin_moderation_queue() from public, anon;
grant execute on function public.list_admin_moderation_queue() to authenticated;

create or replace function public.notify_live_session_published()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
  select
    cs.follower_id,
    'live_event',
    'Upcoming live session',
    'A creator you follow scheduled a live session: ' || new.title,
    'live_session',
    new.id::text
  from public.creator_subscriptions cs
  where cs.creator_id = new.creator_id
    and cs.status = 'active';
  return new;
end;
$$;

drop trigger if exists live_session_notify_insert on public.live_sessions;
create trigger live_session_notify_insert
after insert on public.live_sessions
for each row execute function public.notify_live_session_published();

create or replace function public.notify_course_published()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
    select
      cs.follower_id,
      'course_event',
      'New course available',
      'A creator you follow published a new course: ' || new.title,
      'course',
      new.id::text
    from public.creator_subscriptions cs
    where cs.creator_id = new.creator_id
      and cs.status = 'active';
  end if;
  return new;
end;
$$;

drop trigger if exists course_notify_publish on public.courses;
create trigger course_notify_publish
after insert or update on public.courses
for each row execute function public.notify_course_published();
