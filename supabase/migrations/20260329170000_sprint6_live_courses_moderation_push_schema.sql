-- Sprint 6: live rooms, courses/cohorts, moderation, and push notifications

alter table public.community_posts
  add column if not exists comments_locked boolean not null default false,
  add column if not exists status text not null default 'active' check (status in ('active', 'hidden', 'reported'));

create table if not exists public.live_rooms (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (length(trim(title)) >= 3),
  description text,
  access_mode text not null default 'free' check (access_mode in ('free', 'free_preview', 'tier_gated')),
  visibility_tier text check (visibility_tier in ('free', 'pro', 'premium')),
  free_preview_minutes integer check (free_preview_minutes is null or free_preview_minutes between 1 and 120),
  provider text not null default 'youtube' check (provider in ('youtube')),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.live_rooms(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (length(trim(title)) >= 3),
  description text,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'ended', 'recording_available', 'canceled')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  live_url text,
  embed_url text,
  replay_url text,
  replay_embed_url text,
  access_mode text not null default 'free' check (access_mode in ('free', 'free_preview', 'tier_gated')),
  visibility_tier text check (visibility_tier in ('free', 'pro', 'premium')),
  free_preview_minutes integer check (free_preview_minutes is null or free_preview_minutes between 1 and 120),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists live_sessions_creator_status_idx on public.live_sessions (creator_id, status, starts_at desc);
create index if not exists live_sessions_room_idx on public.live_sessions (room_id, starts_at desc);

create table if not exists public.live_session_attendees (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default timezone('utc', now()),
  preview_ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (session_id, user_id)
);

create table if not exists public.live_session_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (length(trim(content)) >= 2 and length(content) <= 1000),
  status text not null default 'active' check (status in ('active', 'hidden', 'reported')),
  reported boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (length(trim(title)) >= 3),
  subtitle text,
  description text,
  price_inr integer not null default 0 check (price_inr >= 0),
  visibility_tier text check (visibility_tier in ('free', 'pro', 'premium')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  cover_image_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists courses_creator_status_idx on public.courses (creator_id, status, created_at desc);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null check (length(trim(title)) >= 3),
  description text,
  position integer not null check (position > 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (course_id, position)
);

create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null check (length(trim(title)) >= 3),
  description text,
  video_url text,
  duration_minutes integer,
  position integer not null check (position > 0),
  discussion_locked boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (module_id, position)
);

create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'active', 'completed', 'canceled')),
  enrolled_at timestamptz,
  progress_percent numeric not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (course_id, user_id)
);

create table if not exists public.course_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  completed_at timestamptz,
  last_watched_at timestamptz,
  progress_percent numeric not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (lesson_id, user_id)
);

create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null check (length(trim(title)) >= 3),
  starts_at timestamptz not null,
  seat_limit integer not null default 50 check (seat_limit > 0),
  waitlist_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cohort_enrollments (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'waitlisted', 'canceled')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (cohort_id, user_id)
);

create table if not exists public.cohort_waitlist (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (cohort_id, user_id)
);

create table if not exists public.course_discussion_messages (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (length(trim(content)) >= 2 and length(content) <= 1000),
  status text not null default 'active' check (status in ('active', 'hidden', 'reported')),
  reported boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.moderation_reports (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('community_post', 'community_comment', 'live_message', 'course_discussion')),
  subject_id uuid not null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (reason in ('spam', 'abuse', 'misleading', 'other')),
  details text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'actioned', 'dismissed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists moderation_reports_owner_status_idx on public.moderation_reports (owner_id, status, created_at desc);
create index if not exists moderation_reports_subject_idx on public.moderation_reports (subject_type, subject_id);

create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.moderation_reports(id) on delete set null,
  subject_type text not null check (subject_type in ('community_post', 'community_comment', 'live_message', 'course_discussion')),
  subject_id uuid not null,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  action_type text not null check (action_type in ('hide', 'unhide', 'lock_replies', 'unlock_replies', 'soft_remove')),
  reason text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.push_delivery_logs (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null,
  status text not null check (status in ('sent', 'failed', 'disabled')),
  response_code integer,
  error_message text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists push_delivery_logs_notification_idx on public.push_delivery_logs (notification_id, created_at desc);

alter table public.live_rooms enable row level security;
alter table public.live_sessions enable row level security;
alter table public.live_session_attendees enable row level security;
alter table public.live_session_messages enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.course_lessons enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.course_lesson_progress enable row level security;
alter table public.cohorts enable row level security;
alter table public.cohort_enrollments enable row level security;
alter table public.cohort_waitlist enable row level security;
alter table public.course_discussion_messages enable row level security;
alter table public.moderation_reports enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.push_delivery_logs enable row level security;

drop policy if exists "Authenticated read live rooms" on public.live_rooms;
create policy "Authenticated read live rooms" on public.live_rooms for select to authenticated using (active = true);
drop policy if exists "Creators manage own live rooms" on public.live_rooms;
create policy "Creators manage own live rooms" on public.live_rooms for all to authenticated using (creator_id = auth.uid()) with check (creator_id = auth.uid());

drop policy if exists "Authenticated read live sessions" on public.live_sessions;
create policy "Authenticated read live sessions" on public.live_sessions for select to authenticated using (true);
drop policy if exists "Creators manage own live sessions" on public.live_sessions;
create policy "Creators manage own live sessions" on public.live_sessions for all to authenticated using (creator_id = auth.uid()) with check (creator_id = auth.uid());

drop policy if exists "Users manage own live attendance" on public.live_session_attendees;
create policy "Users manage own live attendance" on public.live_session_attendees for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Authenticated read live messages" on public.live_session_messages;
create policy "Authenticated read live messages" on public.live_session_messages for select to authenticated using (status = 'active');
drop policy if exists "Users manage own live messages" on public.live_session_messages;
create policy "Users manage own live messages" on public.live_session_messages for all to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists "Authenticated read published courses" on public.courses;
create policy "Authenticated read published courses" on public.courses for select to authenticated using (status = 'published' or creator_id = auth.uid());
drop policy if exists "Creators manage own courses" on public.courses;
create policy "Creators manage own courses" on public.courses for all to authenticated using (creator_id = auth.uid()) with check (creator_id = auth.uid());

drop policy if exists "Authenticated read course modules" on public.course_modules;
create policy "Authenticated read course modules" on public.course_modules for select to authenticated using (true);
drop policy if exists "Creators manage own course modules" on public.course_modules;
create policy "Creators manage own course modules" on public.course_modules for all to authenticated using (
  exists (select 1 from public.courses c where c.id = course_id and c.creator_id = auth.uid())
) with check (
  exists (select 1 from public.courses c where c.id = course_id and c.creator_id = auth.uid())
);

drop policy if exists "Authenticated read course lessons" on public.course_lessons;
create policy "Authenticated read course lessons" on public.course_lessons for select to authenticated using (true);
drop policy if exists "Creators manage own course lessons" on public.course_lessons;
create policy "Creators manage own course lessons" on public.course_lessons for all to authenticated using (
  exists (select 1 from public.courses c where c.id = course_id and c.creator_id = auth.uid())
) with check (
  exists (select 1 from public.courses c where c.id = course_id and c.creator_id = auth.uid())
);

drop policy if exists "Users read own course enrollments" on public.course_enrollments;
create policy "Users read own course enrollments" on public.course_enrollments for select to authenticated using (user_id = auth.uid() or exists (
  select 1 from public.courses c where c.id = course_id and c.creator_id = auth.uid()
));
drop policy if exists "Users manage own course enrollments" on public.course_enrollments;
create policy "Users manage own course enrollments" on public.course_enrollments for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Users read own lesson progress" on public.course_lesson_progress;
create policy "Users read own lesson progress" on public.course_lesson_progress for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users manage own lesson progress" on public.course_lesson_progress;
create policy "Users manage own lesson progress" on public.course_lesson_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Authenticated read cohorts" on public.cohorts;
create policy "Authenticated read cohorts" on public.cohorts for select to authenticated using (true);
drop policy if exists "Creators manage own cohorts" on public.cohorts;
create policy "Creators manage own cohorts" on public.cohorts for all to authenticated using (
  exists (select 1 from public.courses c where c.id = course_id and c.creator_id = auth.uid())
) with check (
  exists (select 1 from public.courses c where c.id = course_id and c.creator_id = auth.uid())
);

drop policy if exists "Users read own cohort enrollments" on public.cohort_enrollments;
create policy "Users read own cohort enrollments" on public.cohort_enrollments for select to authenticated using (user_id = auth.uid() or exists (
  select 1 from public.cohorts ch join public.courses c on c.id = ch.course_id where ch.id = cohort_id and c.creator_id = auth.uid()
));
drop policy if exists "Users manage own cohort enrollments" on public.cohort_enrollments;
create policy "Users manage own cohort enrollments" on public.cohort_enrollments for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Users read own cohort waitlist" on public.cohort_waitlist;
create policy "Users read own cohort waitlist" on public.cohort_waitlist for select to authenticated using (user_id = auth.uid() or exists (
  select 1 from public.cohorts ch join public.courses c on c.id = ch.course_id where ch.id = cohort_id and c.creator_id = auth.uid()
));
drop policy if exists "Users manage own cohort waitlist" on public.cohort_waitlist;
create policy "Users manage own cohort waitlist" on public.cohort_waitlist for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Authenticated read course discussion messages" on public.course_discussion_messages;
create policy "Authenticated read course discussion messages" on public.course_discussion_messages for select to authenticated using (status = 'active');
drop policy if exists "Users manage own course discussion messages" on public.course_discussion_messages;
create policy "Users manage own course discussion messages" on public.course_discussion_messages for all to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists "Users read owned or reported moderation reports" on public.moderation_reports;
create policy "Users read owned or reported moderation reports" on public.moderation_reports for select to authenticated using (owner_id = auth.uid() or reporter_id = auth.uid());
drop policy if exists "Users create own moderation reports" on public.moderation_reports;
create policy "Users create own moderation reports" on public.moderation_reports for insert to authenticated with check (reporter_id = auth.uid());
drop policy if exists "Owners update own moderation reports" on public.moderation_reports;
create policy "Owners update own moderation reports" on public.moderation_reports for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "Actors read own moderation actions" on public.moderation_actions;
create policy "Actors read own moderation actions" on public.moderation_actions for select to authenticated using (actor_id = auth.uid());
drop policy if exists "Actors create moderation actions" on public.moderation_actions;
create policy "Actors create moderation actions" on public.moderation_actions for insert to authenticated with check (actor_id = auth.uid());

drop policy if exists "Users read own push subscriptions" on public.push_subscriptions;
create policy "Users read own push subscriptions" on public.push_subscriptions for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users manage own push subscriptions" on public.push_subscriptions;
create policy "Users manage own push subscriptions" on public.push_subscriptions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Users read own push delivery logs" on public.push_delivery_logs;
create policy "Users read own push delivery logs" on public.push_delivery_logs for select to authenticated using (user_id = auth.uid());

drop trigger if exists live_rooms_touch_updated_at on public.live_rooms;
create trigger live_rooms_touch_updated_at before update on public.live_rooms for each row execute function public.touch_updated_at();
drop trigger if exists live_sessions_touch_updated_at on public.live_sessions;
create trigger live_sessions_touch_updated_at before update on public.live_sessions for each row execute function public.touch_updated_at();
drop trigger if exists live_session_messages_touch_updated_at on public.live_session_messages;
create trigger live_session_messages_touch_updated_at before update on public.live_session_messages for each row execute function public.touch_updated_at();
drop trigger if exists courses_touch_updated_at on public.courses;
create trigger courses_touch_updated_at before update on public.courses for each row execute function public.touch_updated_at();
drop trigger if exists course_lessons_touch_updated_at on public.course_lessons;
create trigger course_lessons_touch_updated_at before update on public.course_lessons for each row execute function public.touch_updated_at();
drop trigger if exists course_enrollments_touch_updated_at on public.course_enrollments;
create trigger course_enrollments_touch_updated_at before update on public.course_enrollments for each row execute function public.touch_updated_at();
drop trigger if exists course_lesson_progress_touch_updated_at on public.course_lesson_progress;
create trigger course_lesson_progress_touch_updated_at before update on public.course_lesson_progress for each row execute function public.touch_updated_at();
drop trigger if exists cohorts_touch_updated_at on public.cohorts;
create trigger cohorts_touch_updated_at before update on public.cohorts for each row execute function public.touch_updated_at();
drop trigger if exists course_discussion_messages_touch_updated_at on public.course_discussion_messages;
create trigger course_discussion_messages_touch_updated_at before update on public.course_discussion_messages for each row execute function public.touch_updated_at();
drop trigger if exists moderation_reports_touch_updated_at on public.moderation_reports;
create trigger moderation_reports_touch_updated_at before update on public.moderation_reports for each row execute function public.touch_updated_at();
drop trigger if exists push_subscriptions_touch_updated_at on public.push_subscriptions;
create trigger push_subscriptions_touch_updated_at before update on public.push_subscriptions for each row execute function public.touch_updated_at();

