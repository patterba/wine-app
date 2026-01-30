# AutographHero App - Development Plan

## Overview

**Mission:** Alert autograph collectors when their favorite teams or players have in-person signing events near them.

**Current State:**
- WordPress site at autographhero.com
- Data scraped from a single competitor source

**Target State:**
- React Native mobile apps (iOS + Android)
- Multi-source data aggregation
- User & business event submissions
- Personalized push notifications

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                   │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  React Native   │  React Native   │   React Web (future)        │
│  iOS App        │  Android App    │   (replace WordPress)       │
└────────┬────────┴────────┬────────┴──────────────┬──────────────┘
         │                 │                       │
         └─────────────────┼───────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER                                   │
│                  Node.js + Express                               │
│         (or Next.js API routes / Fastify)                       │
├─────────────────────────────────────────────────────────────────┤
│  • Auth (JWT + OAuth)                                           │
│  • Events CRUD                                                   │
│  • User preferences                                              │
│  • Push notification triggers                                    │
│  • Business submission portal                                    │
└─────────────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────────┐
│  PostgreSQL │   │   Redis     │   │  Push Service   │
│  (primary   │   │  (caching,  │   │  (Firebase FCM  │
│   database) │   │   queues)   │   │   or OneSignal) │
└─────────────┘   └─────────────┘   └─────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATA INGESTION LAYER                          │
│              (Background Jobs / Workers)                         │
├─────────────────────────────────────────────────────────────────┤
│  • Multi-source web scrapers (Node.js + Puppeteer/Playwright)   │
│  • Deduplication engine                                          │
│  • Data normalization (player/team name matching)               │
│  • Event expiration cleanup                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Model

### Core Entities

```sql
-- Users
users {
  id              UUID PRIMARY KEY
  email           VARCHAR UNIQUE
  password_hash   VARCHAR (nullable if OAuth only)
  created_at      TIMESTAMP
  location_lat    DECIMAL
  location_lng    DECIMAL
  alert_radius_mi INTEGER DEFAULT 100
  push_token      VARCHAR
}

-- Players/Celebrities (the people signing)
signers {
  id              UUID PRIMARY KEY
  name            VARCHAR
  normalized_name VARCHAR  -- lowercase, no accents for matching
  sport           VARCHAR  -- NFL, MLB, NBA, NHL, Celebrity, etc.
  team            VARCHAR  -- current team (nullable)
  image_url       VARCHAR
  metadata        JSONB    -- career stats, bio, etc.
}

-- Teams
teams {
  id              UUID PRIMARY KEY
  name            VARCHAR
  sport           VARCHAR
  city            VARCHAR
  logo_url        VARCHAR
}

-- Signing Events
events {
  id              UUID PRIMARY KEY
  title           VARCHAR
  description     TEXT
  signer_id       UUID REFERENCES signers
  venue_name      VARCHAR
  address         VARCHAR
  city            VARCHAR
  state           VARCHAR
  lat             DECIMAL
  lng             DECIMAL
  event_date      DATE
  start_time      TIME
  end_time        TIME
  is_free         BOOLEAN
  price_min       DECIMAL
  price_max       DECIMAL
  ticket_url      VARCHAR
  source          VARCHAR  -- which scraper or 'user_submission' or 'business'
  source_url      VARCHAR
  verified        BOOLEAN DEFAULT false
  created_at      TIMESTAMP
  updated_at      TIMESTAMP
}

-- User Favorites (many-to-many)
user_favorite_signers {
  user_id         UUID REFERENCES users
  signer_id       UUID REFERENCES signers
  PRIMARY KEY (user_id, signer_id)
}

user_favorite_teams {
  user_id         UUID REFERENCES users
  team_id         UUID REFERENCES teams
  PRIMARY KEY (user_id, team_id)
}

-- Notifications sent (for tracking/analytics)
notifications_sent {
  id              UUID PRIMARY KEY
  user_id         UUID REFERENCES users
  event_id        UUID REFERENCES events
  sent_at         TIMESTAMP
  opened          BOOLEAN DEFAULT false
}

-- Business accounts for submissions
businesses {
  id              UUID PRIMARY KEY
  name            VARCHAR
  email           VARCHAR
  verified        BOOLEAN DEFAULT false
  created_at      TIMESTAMP
}
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

## Tech Stack Recommendation

### Mobile Apps
- **React Native** with Expo (faster development, OTA updates)
- **React Navigation** for routing
- **Zustand** or **Redux Toolkit** for state management
- **React Query** for API data fetching/caching

### Backend API
- **Node.js** with **Express** or **Fastify**
- **PostgreSQL** via **Prisma** ORM
- **Redis** for caching and job queues
- **Bull** or **BullMQ** for background job processing

### Push Notifications
- **Firebase Cloud Messaging (FCM)** - free, reliable, cross-platform
- Alternative: **OneSignal** (easier setup, free tier)

### Scraping Infrastructure
- **Puppeteer** or **Playwright** for JS-heavy sites
- **Cheerio** for simple HTML parsing
- **node-cron** or **Agenda** for scheduling
- Run on separate worker process/server

### Hosting (Budget-Friendly Options)
- **Railway** or **Render** - API + database + workers
- **Supabase** - PostgreSQL + auth + realtime (generous free tier)
- **Vercel** - If using Next.js API routes
- **Expo EAS** - For app builds and OTA updates

---

## Development Phases

### Phase 1: Foundation (Weeks 1-4)
- [ ] Set up React Native project with Expo
- [ ] Design and implement core UI screens
  - [ ] Onboarding / sign up
  - [ ] Favorites selection (teams/players)
  - [ ] Event feed (list view)
  - [ ] Event detail screen
  - [ ] Profile / settings
- [ ] Set up backend API
  - [ ] User authentication (email + Google/Apple)
  - [ ] Events CRUD endpoints
  - [ ] Favorites management endpoints
- [ ] Set up PostgreSQL database with Prisma
- [ ] Seed database with initial signer/team data

### Phase 2: Data Pipeline (Weeks 5-8)
- [ ] Build first scraper (SigningsHotline or similar)
- [ ] Implement data normalization
- [ ] Build deduplication engine
- [ ] Add 2-3 more scraper sources
- [ ] Create admin dashboard for data review
- [ ] Set up scheduled scraping jobs

### Phase 3: Notifications (Weeks 9-10)
- [ ] Integrate Firebase Cloud Messaging
- [ ] Build notification matching engine
  - [ ] Match new events to user favorites
  - [ ] Check user location/radius preferences
  - [ ] Queue and send push notifications
- [ ] Notification preferences (frequency, quiet hours)
- [ ] In-app notification history

### Phase 4: User Submissions (Weeks 11-12)
- [ ] User event submission form
- [ ] Submission review queue
- [ ] Basic reputation system
- [ ] Business account applications

### Phase 5: Polish & Launch (Weeks 13-16)
- [ ] Beta testing with real users
- [ ] Performance optimization
- [ ] App Store / Play Store submission
- [ ] Marketing site updates
- [ ] Analytics integration

### Future Enhancements
- Map view of events
- Calendar sync
- Social features (friends, "I'm going")
- In-app ticket purchasing (affiliate revenue)
- Premium tier (advanced alerts, no ads)
- Web app to replace WordPress site

---

## Notification Matching Algorithm

```javascript
// Pseudo-code for notification engine
async function processNewEvent(event) {
  // 1. Find users who favorite this signer
  const signerFans = await db.userFavoriteSigners.findMany({
    where: { signerId: event.signerId }
  });

  // 2. Find users who favorite this signer's team
  const signer = await db.signers.findUnique({ where: { id: event.signerId }});
  const teamFans = await db.userFavoriteTeams.findMany({
    where: { team: { name: signer.team } }
  });

  // 3. Combine and dedupe users
  const interestedUsers = [...new Set([...signerFans, ...teamFans])];

  // 4. Filter by location
  const nearbyUsers = interestedUsers.filter(user => {
    const distance = calculateDistance(
      user.location_lat, user.location_lng,
      event.lat, event.lng
    );
    return distance <= user.alert_radius_mi;
  });

  // 5. Send notifications
  for (const user of nearbyUsers) {
    await sendPushNotification(user.push_token, {
      title: `${signer.name} signing near you!`,
      body: `${event.venue_name} on ${formatDate(event.event_date)}`,
      data: { eventId: event.id }
    });

    await db.notificationsSent.create({
      userId: user.id,
      eventId: event.id
    });
  }
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

1. **Validate the idea**
   - Share concept with collectors (Reddit, Facebook groups)
   - Gauge interest before building

2. **Set up development environment**
   - Initialize React Native + Expo project
   - Set up backend repo with Node.js
   - Provision PostgreSQL database

3. **Build a prototype**
   - Static event feed with mock data
   - Basic favorites selection
   - No backend yet - just prove the UX

4. **Start one scraper**
   - Pick easiest source to scrape
   - Get real data flowing

---

## Questions to Resolve

- [ ] What's your timeline for launch?
- [ ] iOS only first, or iOS + Android simultaneously?
- [ ] Do you have a designer, or will you use a UI kit?
- [ ] Budget for hosting/services?
- [ ] Do you want to migrate WordPress content to the new system?
- [ ] Any legal concerns about scraping competitors?

---

*Document created: January 2026*
*Last updated: January 2026*
