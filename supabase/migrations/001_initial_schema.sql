-- AutographHero Initial Schema
-- Run this in Supabase Dashboard → SQL Editor
-- Order matters: tables with foreign keys come after their references

-----------------------------------------------------------
-- 1. CORE TABLES
-----------------------------------------------------------

-- Teams (no dependencies, create first)
create table teams (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  sport           text not null,  -- NFL, MLB, NBA, NHL
  city            text,
  logo_url        text,
  created_at      timestamptz default now()
);

-- Profiles (extends Supabase auth.users)
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text,
  location_lat    decimal,
  location_lng    decimal,
  alert_radius_mi integer default 100,
  push_token      text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Signers (references teams)
create table signers (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  normalized_name text not null,  -- lowercase, no accents for matching
  sport           text,           -- NFL, MLB, NBA, NHL, Celebrity, etc.
  team_id         uuid references teams(id),
  image_url       text,
  metadata        jsonb default '{}',
  created_at      timestamptz default now()
);

-- Events (references signers)
create table events (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  signer_id       uuid references signers(id),
  venue_name      text,
  address         text,
  city            text,
  state           text,
  lat             decimal,
  lng             decimal,
  event_date      date not null,
  start_time      time,
  end_time        time,
  is_free         boolean default false,
  price_min       decimal,
  price_max       decimal,
  ticket_url      text,
  source          text not null,  -- 'scraper_xyz', 'user', 'business'
  source_url      text,
  verified        boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- User Favorite Signers (junction table)
create table user_favorite_signers (
  user_id         uuid references profiles(id) on delete cascade,
  signer_id       uuid references signers(id) on delete cascade,
  created_at      timestamptz default now(),
  primary key (user_id, signer_id)
);

-- User Favorite Teams (junction table)
create table user_favorite_teams (
  user_id         uuid references profiles(id) on delete cascade,
  team_id         uuid references teams(id) on delete cascade,
  created_at      timestamptz default now(),
  primary key (user_id, team_id)
);

-- Notifications sent (for tracking)
create table notifications_sent (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade,
  event_id        uuid references events(id) on delete cascade,
  sent_at         timestamptz default now(),
  opened          boolean default false
);

-----------------------------------------------------------
-- 2. INDEXES
-----------------------------------------------------------

create index idx_events_date on events(event_date);
create index idx_events_signer on events(signer_id);
create index idx_events_location on events(lat, lng);
create index idx_events_city_state on events(city, state);
create index idx_signers_normalized on signers(normalized_name);
create index idx_signers_team on signers(team_id);
create index idx_teams_sport on teams(sport);

-----------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS)
-----------------------------------------------------------

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table events enable row level security;
alter table signers enable row level security;
alter table teams enable row level security;
alter table user_favorite_signers enable row level security;
alter table user_favorite_teams enable row level security;
alter table notifications_sent enable row level security;

-- Profiles: users can read/update their own
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Events: public read
create policy "Anyone can view events"
  on events for select using (true);

-- Signers: public read
create policy "Anyone can view signers"
  on signers for select using (true);

-- Teams: public read
create policy "Anyone can view teams"
  on teams for select using (true);

-- User Favorites (signers): users manage their own
create policy "Users can view own favorite signers"
  on user_favorite_signers for select using (auth.uid() = user_id);

create policy "Users can add favorite signers"
  on user_favorite_signers for insert with check (auth.uid() = user_id);

create policy "Users can remove favorite signers"
  on user_favorite_signers for delete using (auth.uid() = user_id);

-- User Favorites (teams): users manage their own
create policy "Users can view own favorite teams"
  on user_favorite_teams for select using (auth.uid() = user_id);

create policy "Users can add favorite teams"
  on user_favorite_teams for insert with check (auth.uid() = user_id);

create policy "Users can remove favorite teams"
  on user_favorite_teams for delete using (auth.uid() = user_id);

-- Notifications: users view their own
create policy "Users can view own notifications"
  on notifications_sent for select using (auth.uid() = user_id);

-----------------------------------------------------------
-- 4. AUTO-CREATE PROFILE ON USER SIGNUP
-----------------------------------------------------------

-- Function to create profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-----------------------------------------------------------
-- 5. UPDATED_AT TRIGGER
-----------------------------------------------------------

-- Function to auto-update updated_at column
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to profiles
create trigger profiles_updated_at
  before update on profiles
  for each row execute function public.update_updated_at();

-- Apply to events
create trigger events_updated_at
  before update on events
  for each row execute function public.update_updated_at();
