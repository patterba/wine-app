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
└── nativewind           # Tailwind CSS for React Native
```

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

## Development Phases (iOS + Supabase)

### Phase 1: Project Setup (Week 1)
- [ ] Create Expo project: `npx create-expo-app@latest autograph-hero`
- [ ] Set up Supabase project (free tier)
- [ ] Run database migrations (create tables above)
- [ ] Configure Supabase client in app
- [ ] Set up Apple Developer account ($99/year) if not already
- [ ] Configure Apple Sign-In in Supabase

### Phase 2: Core App Screens (Weeks 2-4)
- [ ] **Onboarding flow**
  - [ ] Welcome/value prop screens
  - [ ] Sign up (email or Apple Sign-In)
  - [ ] Location permission request
  - [ ] Push notification permission
- [ ] **Favorites selection**
  - [ ] Sport category picker (NFL, MLB, NBA, etc.)
  - [ ] Team search/select
  - [ ] Player search/select
  - [ ] "Done" saves to Supabase
- [ ] **Event feed (home screen)**
  - [ ] List of upcoming events
  - [ ] Filter by: All / My Favorites / Near Me
  - [ ] Pull to refresh
  - [ ] Event card: signer photo, name, date, city
- [ ] **Event detail screen**
  - [ ] Full event info
  - [ ] Map preview
  - [ ] "Get Directions" button
  - [ ] "Add to Calendar" (future)
  - [ ] Ticket link (if paid event)
- [ ] **Profile/Settings**
  - [ ] Edit favorites
  - [ ] Change location / alert radius
  - [ ] Notification preferences
  - [ ] Sign out

### Phase 3: Data Pipeline (Weeks 5-7)
- [ ] **Set up scraper worker**
  - [ ] Create Node.js project
  - [ ] Deploy to Railway free tier
  - [ ] Connect to Supabase with service role key
- [ ] **Build first scraper**
  - [ ] Pick source (SigningsHotline?)
  - [ ] Parse event listings
  - [ ] Normalize signer names
  - [ ] Insert into Supabase
- [ ] **Deduplication logic**
  - [ ] Check existing events before insert
  - [ ] Match on: normalized_name + city + date
- [ ] **Seed initial data**
  - [ ] Populate teams table (all major sports)
  - [ ] Populate signers from first scrape
- [ ] **Schedule scraping**
  - [ ] Run every 6-12 hours via cron

### Phase 4: Push Notifications (Weeks 8-9)
- [ ] **Expo Push setup**
  - [ ] Request push token on app launch
  - [ ] Save token to profiles table
- [ ] **Supabase Edge Function: process-new-event**
  - [ ] Query users who favorite this signer/team
  - [ ] Filter by location radius
  - [ ] Send via Expo Push API
  - [ ] Log to notifications_sent table
- [ ] **Database webhook trigger**
  - [ ] Trigger Edge Function on new verified event
- [ ] **In-app notifications**
  - [ ] Notification history screen
  - [ ] Mark as read

### Phase 5: Polish & TestFlight (Weeks 10-12)
- [ ] UI polish and animations
- [ ] Error handling and loading states
- [ ] Offline support (cached events)
- [ ] App icon and splash screen
- [ ] Build with EAS: `eas build --platform ios`
- [ ] Submit to TestFlight
- [ ] Beta test with 10-20 users
- [ ] Iterate based on feedback

### Phase 6: App Store Launch (Weeks 13-14)
- [ ] App Store screenshots
- [ ] App Store description and keywords
- [ ] Privacy policy page
- [ ] Submit for review
- [ ] Launch!

### Future Enhancements (Post-Launch)
- [ ] Android app (reuse 95% of code)
- [ ] Map view of events
- [ ] Calendar sync
- [ ] User event submissions
- [ ] Business accounts
- [ ] Social features ("I'm going")
- [ ] Premium tier (unlimited favorites, no ads)
- [ ] Web app to replace WordPress

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

## Immediate Next Steps

### This Week
1. **Create Supabase project**
   - Go to supabase.com → New Project
   - Save the project URL and anon key
   - Run the SQL migrations above in SQL Editor

2. **Set up Expo project**
   ```bash
   npx create-expo-app@latest autograph-hero --template tabs
   cd autograph-hero
   npx expo install @supabase/supabase-js expo-notifications expo-location
   npm install @tanstack/react-query zustand nativewind
   ```

3. **Create Supabase client**
   ```typescript
   // lib/supabase.ts
   import { createClient } from '@supabase/supabase-js';

   const supabaseUrl = 'YOUR_PROJECT_URL';
   const supabaseAnonKey = 'YOUR_ANON_KEY';

   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```

4. **Seed teams data**
   - Add all NFL, MLB, NBA, NHL teams to the teams table
   - This gives users something to favorite immediately

### Next Week
5. **Build first screens**
   - Authentication (sign in / sign up)
   - Event feed with mock data
   - Favorites selection

6. **Start first scraper**
   - Analyze easiest source
   - Build Node.js script to parse and insert

---

## Remaining Questions

- [ ] Do you have UI designs, or should we use a component library (e.g., React Native Paper, Tamagui)?
- [ ] Do you want to migrate existing WordPress content/data?
- [ ] Any legal concerns about scraping competitors?
- [ ] What's your target launch timeframe?

---

*Document created: January 2026*
*Last updated: January 2026*
