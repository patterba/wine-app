# Wine Tourism Platform

> A comprehensive booking platform connecting wine enthusiasts with wineries, enabling seamless tasting reservations while providing wineries with capacity management tools.

## 📋 Project Documentation

This repository contains the complete planning and architecture documentation for building a wine tourism booking platform from MVP to scale.

### Core Documentation

1. **[Product Requirements Document (PRD)](./PRD.md)**
   - Product vision and business model
   - User personas and core features
   - Success metrics and launch strategy
   - Competitive analysis

2. **[Technical Architecture](./ARCHITECTURE.md)**
   - Technology stack recommendations
   - Database schema design
   - API design and system architecture
   - Security and scalability considerations

3. **[Development Roadmap](./ROADMAP.md)**
   - 12-month development plan across 3 phases
   - Sprint-by-sprint breakdown
   - Team structure and resource planning
   - Risk mitigation strategies

4. **[Monetization Strategy](./MONETIZATION.md)**
   - Revenue model analysis (2% transaction fee)
   - Unit economics and break-even analysis
   - Secondary revenue streams
   - Competitive pricing analysis

5. **[User Flows & Experience Design](./USER_FLOWS.md)**
   - Detailed user journeys for all personas
   - UX patterns and UI components
   - Mobile optimization strategies
   - Accessibility requirements

---

## 🎯 Project Overview

### The Problem
Wine tourism is a $60B global industry, but booking wine tastings remains fragmented. Wineries struggle with manual reservation management and no-shows, while wine tourists face uncertainty about availability and disjointed planning.

### Our Solution
A specialized booking platform that:
- **For Wine Tourists**: Discover wineries by region, view real-time availability, and book prepaid tastings
- **For Wineries**: Manage capacity, reduce no-shows with prepaid bookings, and gain marketing exposure
- **For the Platform**: Earn 2% commission on bookings while keeping costs low for wineries

### Business Model
- **2% transaction fee** on all wine tasting bookings (most competitive in market)
- Secondary revenue: Featured listings, car service referrals, premium winery tools
- Target: $500K GMV in Year 1 → $10K platform revenue

---

## 🚀 Quick Start

### Phase 1: MVP (Months 1-3)
**Goal**: Launch in Napa Valley with 20 wineries, 500 users, 100 bookings

**Core Features:**
- User authentication (email/password, social login)
- Winery discovery and search
- Real-time availability calendar
- Booking and payment (Stripe)
- Winery portal (basic reservation management)
- Admin portal (winery approval, analytics)

**Tech Stack:**
- **Frontend**: Next.js 14+ (React + TypeScript), Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API Routes (or NestJS)
- **Database**: PostgreSQL (via Supabase/Neon) + Prisma ORM
- **Payments**: Stripe Connect (marketplace)
- **Hosting**: Vercel
- **Auth**: NextAuth.js

---

## 📐 Technical Architecture Highlights

### System Architecture
```
┌─────────────────┐
│   Next.js App   │  (React UI + API Routes)
│  (Vercel Edge)  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼────┐
│ Auth │  │ Redis │  (Caching & Sessions)
└──────┘  └───────┘
    │
┌───▼──────────┐
│  PostgreSQL  │  (Primary Database)
│   + Prisma   │
└──────────────┘
         │
    ┌────┴─────┐
    │          │
┌───▼───┐  ┌──▼────┐
│Stripe │  │ AWS S3│  (Photos)
└───────┘  └───────┘
```

### Database Schema (Simplified)
- **users** - Authentication and profiles
- **regions** - Wine regions (Napa, Sonoma, etc.)
- **wineries** - Winery details and settings
- **tasting_experiences** - Tasting options (Classic, Reserve, etc.)
- **time_slots** - Available booking slots
- **bookings** - Reservations with payment data
- **reviews** - User reviews and ratings

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete schema and indexes.

---

## 💰 Revenue Model

### Primary: Transaction Fees
- **2% commission** on all bookings
- Example: $50 tasting → $1 platform fee, $47.25 to winery (after Stripe fees)
- Most competitive in market (Tock: 10-15%, OpenTable: ~10%)

### Secondary Revenue Streams
1. **Featured Listings**: $100-200/month (wineries pay for top placement)
2. **Car Service Referrals**: $50/month listing fee or $10-20 per lead
3. **Hotel Affiliates**: 4% commission on bookings
4. **Premium Winery Tools**: $49-99/month (advanced analytics, marketing)
5. **Event Ticketing**: 5% commission on special events
6. **White-Label Regional Platforms**: $500-2,000/month licensing

### Path to Profitability
- **Year 1**: -$5K (investment phase, prove PMF)
- **Year 2**: $10K+ (break-even with secondary revenue)
- **Year 3**: $50K+ (profitable at scale)

See [MONETIZATION.md](./MONETIZATION.md) for detailed unit economics.

---

## 🗺️ Development Roadmap

### Phase 1: MVP (Months 1-3)
- ✅ Sprint 1-2: Foundation (Next.js, Prisma, Auth)
- ✅ Sprint 3-4: Discovery (winery listings, search, detail pages)
- ✅ Sprint 5-6: Booking system (availability, payment with Stripe)
- ✅ Sprint 7: Winery portal (reservations, profile management)
- ✅ Sprint 8: Admin portal (approval, analytics, refunds)

### Phase 2: Regional Expansion (Months 4-6)
- ✅ Multi-region support (5 regions)
- ✅ Reviews & ratings
- ✅ Travel services directory (car services, hotels)
- ✅ Enhanced winery analytics
- ✅ Notifications & engagement (email, SMS)

### Phase 3: Scale (Months 7-12)
- ✅ Mobile apps (iOS/Android via React Native)
- ✅ International expansion (10+ regions)
- ✅ Loyalty program
- ✅ Advanced features (events, wine club integration)
- ✅ White-label regional platforms

See [ROADMAP.md](./ROADMAP.md) for sprint-by-sprint breakdown.

---

## 👥 User Personas

### 1. Wine Tourist (Sarah)
- **Age**: 30-55, household income $75K+
- **Behavior**: Plans wine trips 2-4x/year
- **Goals**: Discover wineries, book in advance, coordinate travel
- **Pain Points**: Fragmented booking, no availability transparency

### 2. Winery Owner (Michael)
- **Role**: Manages tasting room operations
- **Goals**: Maximize revenue, reduce no-shows, manage capacity
- **Pain Points**: Manual bookings, cancellations, overbooking

### 3. Platform Admin (Operations Team)
- **Role**: Oversee platform health, support users/wineries
- **Goals**: Ensure quality, track growth, resolve issues
- **Needs**: Analytics, moderation tools, support interfaces

---

## 🎨 Key Features by User Type

### For Wine Tourists
- 🔍 Browse by region with filters (price, varietals, ratings)
- 📅 Real-time availability calendar
- 💳 Secure booking with prepayment (Stripe)
- 📧 Booking confirmations & reminders
- ⭐ Reviews & ratings
- 🗺️ Itinerary planning (multi-winery days)
- 🚗 Integrated car services and hotels

### For Wineries
- 📊 Dashboard (today's reservations, revenue)
- 📆 Calendar view (weekly/monthly bookings)
- ⚙️ Capacity management (max guests, time slots, blackout dates)
- 🍷 Tasting experience management (pricing, descriptions)
- ✅ Check-in system (QR codes)
- 📈 Analytics (booking trends, customer demographics)
- 💰 Stripe Connect payouts (98% of booking value)

### For Admins
- 👔 Winery application approval workflow
- 📊 Platform-wide analytics (GMV, bookings, users)
- 💸 Refund processing tools
- 🛡️ Content moderation (reviews, listings)
- 👥 User & winery management

---

## 🔐 Security & Compliance

- **Authentication**: NextAuth.js with bcrypt password hashing
- **Payment Security**: PCI compliance via Stripe (no card data stored)
- **Data Encryption**: TLS 1.3 in transit, database encryption at rest
- **GDPR/CCPA**: Data export, deletion, consent management
- **SQL Injection Prevention**: Parameterized queries via Prisma
- **XSS Protection**: React auto-escaping + CSP headers
- **Rate Limiting**: Redis-based (100 req/min per IP)

---

## 📊 Success Metrics

### MVP Success (Month 3)
- ✅ 20 wineries onboarded (Napa Valley)
- ✅ 500 registered users
- ✅ 100 completed bookings
- ✅ < 5% payment failure rate
- ✅ 99.5% uptime

### Year 1 Targets
- 📍 200 wineries across 5+ regions
- 👥 10,000 registered users
- 📅 5,000 bookings
- 💵 $500K GMV → $10K platform revenue
- 🔁 30% repeat booking rate

### Year 3 Vision
- 🌎 10+ regions (US + international)
- 📱 Mobile apps with 5,000+ downloads
- 🏆 Loyalty program with member tiers
- 🤝 White-label partnerships with tourism boards
- 💰 $1M+ ARR

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 20+
- Docker (for local PostgreSQL)
- pnpm (package manager)
- Stripe account (test mode)

### Local Development
```bash
# Clone repository
git clone <repo-url>
cd wine-app

# Install dependencies
pnpm install

# Start local database (Docker)
docker-compose up -d

# Run database migrations
pnpm prisma migrate dev

# Seed database with sample data
pnpm prisma db seed

# Start development server
pnpm dev

# Open http://localhost:3000
```

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/wineapp"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Stripe
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY="re_..."

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza..."
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete setup instructions.

---

## 🤝 Contributing

This is currently a planning phase repository. Once development begins, contribution guidelines will be added.

---

## 📞 Contact & Next Steps

### Immediate Next Steps
1. ✅ Review and approve PRD, architecture, and roadmap
2. ⏭️ Create design mockups (Figma)
3. ⏭️ Set up development environment
4. ⏭️ Initialize Next.js project with tech stack
5. ⏭️ Begin Sprint 1 (Foundation setup)

### Open Questions
1. **MVP Scope**: Confirm 3-month timeline is acceptable
2. **Initial Region**: Napa Valley or alternative?
3. **Winery Onboarding**: Manual outreach or self-service?
4. **Cancellation Policy**: Confirm refund windows (suggest: 48hr full, 24hr 50%, <24hr none)
5. **Team**: Who's available for development? (FTE, contractors, agencies?)

---

## 📄 License

TBD - Likely proprietary for commercial platform

---

## 🙏 Acknowledgments

Built with modern web technologies:
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Stripe](https://stripe.com/) - Payment processing
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vercel](https://vercel.com/) - Hosting

---

**Let's build something amazing for wine lovers! 🍷**
