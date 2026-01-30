# AutographHero App - Development Plan

## Overview

**Mission:** Alert autograph collectors when their favorite teams or players have in-person signing events near them.

**Current State:**
- WordPress site at autographhero.com
- Data scraped from a single competitor source

**Target State:**
- React Native iOS app (Android later)
- Supabase backend (free tier)
- Multi-source data aggregation
- User & business event submissions
- Personalized push notifications

**Key Decisions:**
- **Platform:** iOS first, Android after launch
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions + Realtime)
- **Hosting:** Supabase free tier + separate scraper host

---

## Architecture (Supabase + iOS)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                   │
│                  React Native iOS App                            │
│                    (Expo managed)                                │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SUPABASE                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │    Auth     │  │  PostgreSQL │  │    Edge Functions       │  │
│  │ • Email     │  │  • All data │  │  • Notification trigger │  │
│  │ • Apple     │  │  • RLS      │  │  • Event processing     │  │
│  │   Sign-In   │  │    policies │  │  • Deduplication        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Realtime   │  │   Storage   │  │    Database Webhooks    │  │
│  │ • Live feed │  │  • Images   │  │  • On new event →       │  │
│  │   updates   │  │  • Logos    │  │    trigger notifs       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                                   │
├──────────────────────────┬──────────────────────────────────────┤
│   Expo Push Notifications │   Scraper Worker (separate host)    │
│   • Free for iOS          │   • Railway/Render free tier        │
│   • Handles APNs          │   • Node.js + Puppeteer             │
│                           │   • Cron-scheduled jobs             │
│                           │   • Writes to Supabase              │
└──────────────────────────┴──────────────────────────────────────┘
```

### Why This Architecture Works

1. **Supabase Free Tier Limits (generous)**
   - 500 MB database
   - 5 GB bandwidth
   - 500 MB storage
   - 500K Edge Function invocations
   - Unlimited API requests

2. **Expo Push Notifications**
   - Free for iOS (uses APNs under the hood)
   - No Firebase needed for iOS-only
   - Simple integration with React Native

3. **Separate Scraper Worker**
   - Supabase Edge Functions have 2-minute timeout (not enough for scraping)
   - Run scrapers on Railway/Render free tier
   - Use Supabase service role key to write directly to database

---

## Data Model (Supabase PostgreSQL)

### Core Tables

```sql
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

-- Players/Celebrities (the people signing)
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

-- Teams
create table teams (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  sport           text not null,
  city            text,
  logo_url        text,
  created_at      timestamptz default now()
);

-- Signing Events
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

-- User Favorite Signers (many-to-many)
create table user_favorite_signers (
  user_id         uuid references profiles(id) on delete cascade,
  signer_id       uuid references signers(id) on delete cascade,
  created_at      timestamptz default now(),
  primary key (user_id, signer_id)
);

-- User Favorite Teams (many-to-many)
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

-- Indexes for performance
create index idx_events_date on events(event_date);
create index idx_events_signer on events(signer_id);
create index idx_events_location on events(lat, lng);
create index idx_signers_normalized on signers(normalized_name);
create index idx_signers_team on signers(team_id);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
alter table profiles enable row level security;
alter table events enable row level security;
alter table signers enable row level security;
alter table teams enable row level security;
alter table user_favorite_signers enable row level security;
alter table user_favorite_teams enable row level security;
alter table notifications_sent enable row level security;

-- Profiles: users can only read/update their own profile
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Events: anyone can read, only service role can write
create policy "Anyone can view events"
  on events for select using (true);

-- Signers & Teams: public read
create policy "Anyone can view signers"
  on signers for select using (true);

create policy "Anyone can view teams"
  on teams for select using (true);

-- Favorites: users can manage their own
create policy "Users can view own favorite signers"
  on user_favorite_signers for select using (auth.uid() = user_id);

create policy "Users can add favorite signers"
  on user_favorite_signers for insert with check (auth.uid() = user_id);

create policy "Users can remove favorite signers"
  on user_favorite_signers for delete using (auth.uid() = user_id);

-- Same for teams
create policy "Users can view own favorite teams"
  on user_favorite_teams for select using (auth.uid() = user_id);

create policy "Users can add favorite teams"
  on user_favorite_teams for insert with check (auth.uid() = user_id);

create policy "Users can remove favorite teams"
  on user_favorite_teams for delete using (auth.uid() = user_id);

-- Notifications: users can view their own
create policy "Users can view own notifications"
  on notifications_sent for select using (auth.uid() = user_id);
```

### Database Trigger for Notifications

```sql
-- Function to trigger notification processing when new event is added
create or replace function notify_new_event()
returns trigger as $$
begin
  -- Call Edge Function to process notifications
  perform net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/process-new-event',
    body := json_build_object('event_id', NEW.id)::text,
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
  );
  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger on new verified events
create trigger on_new_event
  after insert on events
  for each row
  when (NEW.verified = true)
  execute function notify_new_event();
```

---

## Data Aggregation Strategy

### Scraping Sources (to research and implement)

| Source | Type | Data Available |
|--------|------|----------------|
| SigningsHotline.com | Competitor | Comprehensive athlete appearances |
| Crave the Auto | Competitor | Free + paid events |
| SigningsHub.com | Competitor | Multi-sport events |
| SWAU.com | Mail-in signings | Celebrity signings |
| FanExpo events | Conventions | Comic/entertainment guests |
| Individual team sites | Primary | Team-specific appearances |
| Sports card shows | Shows | Card show guest lists |
| Beckett events | Shows | Authentication events |

### Scraping Best Practices

1. **Respect robots.txt** - Check each site's policy
2. **Rate limiting** - Space requests (1-5 seconds between)
3. **User agent rotation** - Appear as normal browser traffic
4. **Error handling** - Graceful failures, retry logic
5. **Legal considerations** - Scrape public data only, no login walls
6. **Caching** - Don't re-scrape unchanged pages

### Deduplication Logic

Events from multiple sources need deduplication:
```
1. Normalize signer name (lowercase, remove Jr/Sr/III, etc.)
2. Match on: signer + city + date
3. If match found, merge data (keep most complete record)
4. Flag for manual review if confidence < 80%
```

### User & Business Submissions

**User Submissions:**
- Simple form: Who, Where, When, Source link
- Requires account
- Marked as "unverified" until confirmed
- Gamification: reputation points for verified submissions

**Business Submissions:**
- Verified business accounts (manual approval)
- Can submit events directly (auto-verified)
- Self-service portal for managing their events
- Future: paid featured placement

---

## Tech Stack (Confirmed)

### iOS App
```
React Native + Expo (managed workflow)
├── expo-router          # File-based navigation
├── @supabase/supabase-js # Database + auth client
├── expo-notifications   # Push notifications
├── @tanstack/react-query # Data fetching + caching
├── zustand              # Lightweight state management
├── expo-location        # User location for alerts
├── react-native-paper   # UI component library (Material Design 3)
└── react-native-paper/icons # Icon set
```

**Why React Native Paper:**
- Pre-built components (buttons, cards, lists, search bars, modals)
- Consistent Material Design 3 styling
- Dark mode support built-in
- Well-documented, actively maintained
- Faster development = hit 45-day deadline

### Supabase (Backend)
```
Supabase Free Tier
├── PostgreSQL           # All data storage
├── Auth                 # Email + Apple Sign-In
├── Row Level Security   # Secure data access
├── Edge Functions       # Notification triggers
├── Realtime             # Live event feed updates
├── Storage              # Player/team images
└── Database Webhooks    # Trigger on new events
```

### Scraper Worker (Separate Service)
```
Node.js on Railway/Render free tier
├── puppeteer            # Browser automation
├── cheerio              # HTML parsing
├── node-cron            # Scheduling
└── @supabase/supabase-js # Write to database
```

### Push Notifications
```
Expo Push Notifications (free)
├── Works with APNs for iOS
├── No Firebase needed for iOS-only
└── expo-notifications handles token management
```

### Development Tools
```
├── Expo Go              # Dev testing on device
├── Expo EAS             # Cloud builds for App Store
├── Supabase CLI         # Local development
└── Supabase Dashboard   # Database management
```

---

## 45-Day Development Sprint

**Timeline:** 45 days to working TestFlight build
**Start Date:** ___________
**Target Date:** ___________

### Week 1: Foundation (Days 1-7)

| Day | Task |
|-----|------|
| 1 | Create Supabase project, run all SQL migrations |
| 1 | Create Expo project, install dependencies |
| 2 | Set up Supabase client, configure auth |
| 2 | Apple Developer account setup (if needed) |
| 3 | Build auth screens (sign up / sign in with email) |
| 4 | Build onboarding flow (welcome, permissions) |
| 5 | Seed teams table (NFL, MLB, NBA, NHL) |
| 6-7 | Build favorites selection screen (teams only for MVP) |

**Deliverable:** User can sign up and select favorite teams

### Week 2: Core Screens (Days 8-14)

| Day | Task |
|-----|------|
| 8-9 | Build event feed screen (list view with Paper components) |
| 10 | Build event detail screen |
| 11 | Add "Near Me" filter (location permission + radius) |
| 12 | Build profile/settings screen |
| 13 | Connect all screens to Supabase (real data) |
| 14 | Buffer / bug fixes |

**Deliverable:** Complete app navigation, all screens functional

### Week 3: Data Pipeline (Days 15-21)

| Day | Task |
|-----|------|
| 15 | Analyze scraping target, plan extraction |
| 16-17 | Build first scraper (Node.js + Puppeteer) |
| 18 | Deploy scraper to Railway, connect to Supabase |
| 19 | Build signer normalization + deduplication |
| 20 | Set up cron schedule (every 12 hours) |
| 21 | Verify real data flowing into app |

**Deliverable:** Real events appearing in app from scraper

### Week 4: Notifications (Days 22-28)

| Day | Task |
|-----|------|
| 22 | Expo Push setup, save token to profile |
| 23-24 | Build Edge Function for notification matching |
| 25 | Set up database trigger on new events |
| 26 | Test end-to-end: new event → push notification |
| 27 | Add notification preferences to settings |
| 28 | Buffer / bug fixes |

**Deliverable:** Push notifications working for favorited teams

### Week 5: Polish & TestFlight (Days 29-35)

| Day | Task |
|-----|------|
| 29 | App icon and splash screen |
| 30 | Loading states, error handling |
| 31 | Pull-to-refresh, empty states |
| 32 | EAS build setup, first iOS build |
| 33 | Fix build issues, test on device |
| 34 | Privacy policy page (simple hosted page) |
| 35 | Submit to TestFlight |

**Deliverable:** App on TestFlight

### Week 6: Beta & Iterate (Days 36-42)

| Day | Task |
|-----|------|
| 36-38 | Invite 10-20 beta testers |
| 39-41 | Fix critical bugs from feedback |
| 42 | Prepare App Store assets |

**Deliverable:** Stable beta, ready for App Store

### Days 43-45: App Store Submission

| Day | Task |
|-----|------|
| 43 | App Store screenshots (6.7" and 5.5") |
| 44 | Write description, keywords, categories |
| 45 | Submit for review |

**Deliverable:** App submitted to App Store

---

## MVP Scope (What's IN for 45 days)

✅ Email authentication (Apple Sign-In can wait)
✅ Favorite teams (not individual players yet)
✅ Event feed with filters
✅ Event details
✅ Push notifications for favorite teams
✅ Location-based filtering
✅ One scraper source

## Post-Launch (What's OUT for 45 days)

❌ Apple Sign-In (add after launch)
❌ Favorite individual players (teams only for MVP)
❌ Multiple scraper sources (start with one)
❌ Map view
❌ Calendar sync
❌ User submissions
❌ Business accounts
❌ In-app notification history
❌ Android (reuse 95% code later)
❌ WordPress migration (not needed - start fresh)

---

## Notification Engine (Supabase Edge Function)

```typescript
// supabase/functions/process-new-event/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const { event_id } = await req.json();

  // 1. Get the event details
  const { data: event } = await supabase
    .from("events")
    .select("*, signer:signers(*)")
    .eq("id", event_id)
    .single();

  if (!event) return new Response("Event not found", { status: 404 });

  // 2. Find users who favorite this signer
  const { data: signerFans } = await supabase
    .from("user_favorite_signers")
    .select("user_id, profiles(*)")
    .eq("signer_id", event.signer_id);

  // 3. Find users who favorite this signer's team
  const { data: teamFans } = await supabase
    .from("user_favorite_teams")
    .select("user_id, profiles(*)")
    .eq("team_id", event.signer.team_id);

  // 4. Combine and dedupe
  const allFans = [...(signerFans || []), ...(teamFans || [])];
  const uniqueUsers = new Map();
  allFans.forEach((f) => {
    if (f.profiles?.push_token) {
      uniqueUsers.set(f.user_id, f.profiles);
    }
  });

  // 5. Filter by location (Haversine distance)
  const nearbyUsers = Array.from(uniqueUsers.values()).filter((user) => {
    if (!user.location_lat || !event.lat) return true; // No location = send anyway
    const distance = haversineDistance(
      user.location_lat, user.location_lng,
      event.lat, event.lng
    );
    return distance <= user.alert_radius_mi;
  });

  // 6. Send via Expo Push API
  const messages = nearbyUsers.map((user) => ({
    to: user.push_token,
    sound: "default",
    title: `${event.signer.name} signing near you!`,
    body: `${event.venue_name} on ${formatDate(event.event_date)}`,
    data: { eventId: event.id },
  }));

  // Expo Push API (batches of 100)
  const chunks = chunkArray(messages, 100);
  for (const chunk of chunks) {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chunk),
    });
  }

  // 7. Log notifications sent
  const logs = nearbyUsers.map((user) => ({
    user_id: user.id,
    event_id: event.id,
  }));
  await supabase.from("notifications_sent").insert(logs);

  return new Response(JSON.stringify({ sent: nearbyUsers.length }), {
    headers: { "Content-Type": "application/json" },
  });
});

// Haversine formula for distance in miles
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}
```

---

## Monetization Options

1. **Freemium Model**
   - Free: Basic alerts, limited favorites
   - Premium ($4.99/mo): Unlimited favorites, advanced filters, early alerts

2. **Affiliate Revenue**
   - Link to ticket purchases (Eventbrite, etc.)
   - Earn commission on conversions

3. **Featured Listings**
   - Businesses pay to promote their events
   - "Sponsored" placement in feed

4. **Ads**
   - Banner ads in free tier
   - Sports memorabilia advertisers

---

## Day 1 Checklist

### Morning: Supabase Setup
```bash
# 1. Go to supabase.com → New Project
# 2. Save these values:
#    - Project URL: https://xxx.supabase.co
#    - Anon Key: eyJhbGc...
#    - Service Role Key: eyJhbGc... (for scraper only, keep secret!)

# 3. In Supabase Dashboard → SQL Editor, run:
#    - All CREATE TABLE statements from "Core Tables" section above
#    - All RLS policies from "Row Level Security" section above
#    - Create indexes
```

### Afternoon: Expo Project Setup
```bash
# Create project
npx create-expo-app@latest autograph-hero --template tabs
cd autograph-hero

# Install dependencies
npx expo install @supabase/supabase-js expo-notifications expo-location expo-secure-store
npm install react-native-paper react-native-safe-area-context @tanstack/react-query zustand

# Create Supabase client
mkdir lib
```

```typescript
// lib/supabase.ts
import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const supabaseUrl = 'YOUR_PROJECT_URL';
const supabaseAnonKey = 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Evening: Seed Teams Data
```sql
-- Run in Supabase SQL Editor
-- NFL Teams (sample - add all 32)
INSERT INTO teams (name, sport, city) VALUES
('Arizona Cardinals', 'NFL', 'Phoenix'),
('Atlanta Falcons', 'NFL', 'Atlanta'),
('Baltimore Ravens', 'NFL', 'Baltimore'),
('Buffalo Bills', 'NFL', 'Buffalo'),
('Carolina Panthers', 'NFL', 'Charlotte'),
('Chicago Bears', 'NFL', 'Chicago'),
('Cincinnati Bengals', 'NFL', 'Cincinnati'),
('Cleveland Browns', 'NFL', 'Cleveland'),
('Dallas Cowboys', 'NFL', 'Dallas'),
('Denver Broncos', 'NFL', 'Denver'),
('Detroit Lions', 'NFL', 'Detroit'),
('Green Bay Packers', 'NFL', 'Green Bay'),
('Houston Texans', 'NFL', 'Houston'),
('Indianapolis Colts', 'NFL', 'Indianapolis'),
('Jacksonville Jaguars', 'NFL', 'Jacksonville'),
('Kansas City Chiefs', 'NFL', 'Kansas City'),
('Las Vegas Raiders', 'NFL', 'Las Vegas'),
('Los Angeles Chargers', 'NFL', 'Los Angeles'),
('Los Angeles Rams', 'NFL', 'Los Angeles'),
('Miami Dolphins', 'NFL', 'Miami'),
('Minnesota Vikings', 'NFL', 'Minneapolis'),
('New England Patriots', 'NFL', 'Boston'),
('New Orleans Saints', 'NFL', 'New Orleans'),
('New York Giants', 'NFL', 'New York'),
('New York Jets', 'NFL', 'New York'),
('Philadelphia Eagles', 'NFL', 'Philadelphia'),
('Pittsburgh Steelers', 'NFL', 'Pittsburgh'),
('San Francisco 49ers', 'NFL', 'San Francisco'),
('Seattle Seahawks', 'NFL', 'Seattle'),
('Tampa Bay Buccaneers', 'NFL', 'Tampa'),
('Tennessee Titans', 'NFL', 'Nashville'),
('Washington Commanders', 'NFL', 'Washington');

-- MLB Teams (sample - add all 30)
INSERT INTO teams (name, sport, city) VALUES
('New York Yankees', 'MLB', 'New York'),
('Los Angeles Dodgers', 'MLB', 'Los Angeles'),
('Boston Red Sox', 'MLB', 'Boston'),
('Chicago Cubs', 'MLB', 'Chicago');
-- ... add remaining MLB, NBA, NHL teams
```

---

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Platform | iOS first | Faster to market, add Android post-launch |
| Backend | Supabase free tier | Auth + DB + Functions in one, $0 cost |
| UI Library | React Native Paper | Pre-built components, faster development |
| Timeline | 45 days | Aggressive but achievable for MVP |
| MVP Favorites | Teams only | Simpler than players, add players later |
| WordPress | Skip migration | Start fresh with scraped data |
| Auth | Email only for MVP | Apple Sign-In adds complexity, add later |

---

*Document created: January 2026*
*Last updated: January 2026*
