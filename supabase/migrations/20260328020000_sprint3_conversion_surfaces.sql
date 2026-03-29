create extension if not exists "pgcrypto";
create table if not exists public.creator_tiers (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  tier_name text not null check (tier_name in ('free', 'pro', 'premium')),
  label text not null,
  monthly_price_inr integer not null default 0 check (monthly_price_inr >= 0),
  features jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create unique index if not exists creator_tiers_creator_name_unique on public.creator_tiers (creator_id, tier_name);
create index if not exists creator_tiers_creator_active_idx on public.creator_tiers (creator_id, active);
create table if not exists public.creator_subscriptions (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  follower_id uuid not null references public.profiles(id) on delete cascade,
  tier_id uuid not null references public.creator_tiers(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'active', 'canceled', 'expired')),
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  started_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists creator_subscriptions_creator_status_idx on public.creator_subscriptions (creator_id, status);
create index if not exists creator_subscriptions_follower_status_idx on public.creator_subscriptions (follower_id, status);
create unique index if not exists creator_subscriptions_razorpay_order_unique on public.creator_subscriptions (razorpay_order_id) where razorpay_order_id is not null;
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('trade_alert', 'subscription_event', 'system')),
  title text not null,
  body text not null,
  entity_type text,
  entity_id text,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists notifications_user_created_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_user_unread_idx on public.notifications (user_id, read_at) where read_at is null;
create or replace function public.activate_subscription_with_payment(
  p_subscription_id uuid,
  p_order_id text,
  p_payment_id text,
  p_signature text,
  p_activated_at timestamptz default timezone('utc', now())
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator_id uuid;
  v_follower_id uuid;
begin
  update public.creator_subscriptions
  set status = 'active',
      started_at = coalesce(started_at, p_activated_at),
      razorpay_order_id = coalesce(p_order_id, razorpay_order_id),
      razorpay_payment_id = coalesce(p_payment_id, razorpay_payment_id),
      razorpay_signature = coalesce(p_signature, razorpay_signature),
      updated_at = timezone('utc', now())
  where id = p_subscription_id
  returning creator_id, follower_id into v_creator_id, v_follower_id;

  if v_creator_id is null then
    raise exception 'Subscription % not found', p_subscription_id;
  end if;

  insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
  values (
    v_follower_id,
    'subscription_event',
    'Subscription active',
    'Your subscription is now active.',
    'subscription',
    p_subscription_id::text
  );

  insert into public.notifications (user_id, type, title, body, entity_type, entity_id)
  values (
    v_creator_id,
    'subscription_event',
    'New subscriber joined',
    'A follower has successfully subscribed to your tier.',
    'subscription',
    p_subscription_id::text
  );
end;
$$;
revoke all on function public.activate_subscription_with_payment(uuid, text, text, text, timestamptz) from public;
revoke all on function public.activate_subscription_with_payment(uuid, text, text, text, timestamptz) from anon;
revoke all on function public.activate_subscription_with_payment(uuid, text, text, text, timestamptz) from authenticated;
grant execute on function public.activate_subscription_with_payment(uuid, text, text, text, timestamptz) to service_role;
drop trigger if exists creator_tiers_touch_updated_at on public.creator_tiers;
create trigger creator_tiers_touch_updated_at
before update on public.creator_tiers
for each row execute function public.touch_updated_at();
drop trigger if exists creator_subscriptions_touch_updated_at on public.creator_subscriptions;
create trigger creator_subscriptions_touch_updated_at
before update on public.creator_subscriptions
for each row execute function public.touch_updated_at();
alter table public.creator_tiers enable row level security;
alter table public.creator_subscriptions enable row level security;
alter table public.notifications enable row level security;
drop policy if exists "Creator tiers readable by authenticated" on public.creator_tiers;
create policy "Creator tiers readable by authenticated"
on public.creator_tiers
for select
to authenticated
using (true);
drop policy if exists "Creators manage own tiers" on public.creator_tiers;
create policy "Creators manage own tiers"
on public.creator_tiers
for all
to authenticated
using (creator_id = auth.uid())
with check (creator_id = auth.uid());
drop policy if exists "Users read own subscriptions" on public.creator_subscriptions;
create policy "Users read own subscriptions"
on public.creator_subscriptions
for select
to authenticated
using (creator_id = auth.uid() or follower_id = auth.uid());
drop policy if exists "Followers create subscriptions" on public.creator_subscriptions;
create policy "Followers create subscriptions"
on public.creator_subscriptions
for insert
to authenticated
with check (follower_id = auth.uid());
drop policy if exists "Followers update own subscriptions" on public.creator_subscriptions;
create policy "Followers update own subscriptions"
on public.creator_subscriptions
for update
to authenticated
using (follower_id = auth.uid())
with check (follower_id = auth.uid());
drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications"
on public.notifications
for select
to authenticated
using (user_id = auth.uid());
drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications"
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
