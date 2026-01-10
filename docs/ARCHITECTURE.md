# Technical Architecture: Wine Tourism Platform

## 1. System Overview

### Architecture Pattern
**Monolithic Web Application** (MVP) → **Modular Monolith** (Phase 2) → **Microservices** (Future Scale)

For MVP, we'll build a monolithic application with clear module boundaries to enable future extraction into microservices.

---

## 2. Technology Stack Recommendations

### Frontend
- **Framework**: **React 18+** with TypeScript
  - Modern, excellent ecosystem, strong typing
  - Server-side rendering capability for SEO
- **Meta-Framework**: **Next.js 14+**
  - Built-in SSR/SSG for SEO (critical for discovery)
  - API routes for backend
  - File-based routing
  - Image optimization
- **UI Library**: **Tailwind CSS** + **Shadcn/ui**
  - Rapid development
  - Consistent design system
  - Accessible components
- **State Management**: **React Query** (server state) + **Zustand** (client state)
- **Forms**: **React Hook Form** + **Zod** (validation)
- **Maps**: **Google Maps JavaScript API** or **Mapbox**

### Backend
- **Runtime**: **Node.js 20 LTS** with **TypeScript**
- **Framework**: **Next.js API Routes** (MVP) or **NestJS** (if separate backend preferred)
  - NestJS offers better structure for complex backend logic
  - Next.js API routes simpler for MVP, same codebase
- **API Design**: **RESTful API** with resource-based endpoints
  - Consider GraphQL for Phase 2 (reduces over-fetching)

### Database
- **Primary Database**: **PostgreSQL 15+**
  - ACID compliance (critical for bookings/payments)
  - Excellent performance
  - JSON support for flexible data
  - PostGIS extension for geospatial queries
- **Schema Management**: **Prisma** (ORM + migrations)
  - Type-safe database access
  - Excellent DX with TypeScript
  - Auto-generated types
  - Migration system
- **Caching**: **Redis**
  - Session storage
  - Rate limiting
  - Cache frequently accessed data (regions, winery lists)

### Authentication & Authorization
- **Auth Provider**: **NextAuth.js** (Auth.js)
  - Email/password + social login (Google, Apple)
  - JWT session management
  - Built-in Next.js integration
- **Authorization**: **Role-Based Access Control (RBAC)**
  - Roles: User, Winery, Admin
  - Permission middleware

### Payment Processing
- **Provider**: **Stripe**
  - **Stripe Connect**: Marketplace payments (platform + wineries)
  - PCI compliance handled
  - Strong API, webhooks
  - Support for holds/captures
  - **Payment Flow**:
    1. User pays tasting fee
    2. Platform holds funds
    3. After tasting completion, platform takes 2% fee
    4. Remaining 98% transferred to winery
    5. Refunds handled via Stripe refund API

### File Storage
- **Provider**: **AWS S3** or **Cloudflare R2**
  - Winery photos, user uploads
  - CDN integration for performance
  - Presigned URLs for secure uploads

### Email & Notifications
- **Transactional Email**: **Resend** or **Postmark**
  - High deliverability
  - Template management
  - Webhook tracking
- **SMS** (Optional): **Twilio**
  - Booking reminders

### Hosting & Infrastructure
- **Application Hosting**: **Vercel** (Next.js optimized)
  - Alternatives: AWS (ECS/Fargate), Railway, Render
- **Database Hosting**: **Supabase** (Postgres + auth + storage) or **Neon**
  - Managed PostgreSQL with connection pooling
- **CDN**: Vercel Edge Network (built-in) or **Cloudflare**
- **Monitoring**: **Sentry** (error tracking) + **Vercel Analytics**

### Development Tools
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Testing**:
  - **Vitest** (unit tests)
  - **Playwright** (E2E tests)
  - **React Testing Library** (component tests)
- **API Documentation**: **OpenAPI/Swagger** (if separate backend)

---

## 3. Database Schema Design

### Core Entities

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- null if social login only
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'user', 'winery', 'admin'
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Wine Regions
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL, -- 'napa-valley'
  country VARCHAR(100) NOT NULL,
  state_province VARCHAR(100),
  description TEXT,
  image_url VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Wineries
CREATE TABLE wineries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES regions(id),
  owner_user_id UUID REFERENCES users(id), -- primary contact
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state_province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  email VARCHAR(255),
  website_url VARCHAR(500),

  -- Business details
  is_active BOOLEAN DEFAULT FALSE, -- activated after approval
  onboarding_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  stripe_account_id VARCHAR(255), -- Stripe Connect account

  -- Settings
  default_slot_duration_minutes INT DEFAULT 60,
  default_max_guests_per_slot INT DEFAULT 10,
  booking_lead_time_hours INT DEFAULT 24, -- min notice for booking
  cancellation_hours INT DEFAULT 48, -- cancellation policy

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Winery Photos
CREATE TABLE winery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winery_id UUID REFERENCES wineries(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tasting Experiences (e.g., "Classic Tasting", "Reserve Tasting")
CREATE TABLE tasting_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winery_id UUID REFERENCES wineries(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price_cents INT NOT NULL, -- price in cents
  duration_minutes INT NOT NULL,
  max_party_size INT DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Operating Hours
CREATE TABLE winery_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winery_id UUID REFERENCES wineries(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL, -- 0=Sunday, 6=Saturday
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Availability Overrides (closures, special hours)
CREATE TABLE availability_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winery_id UUID REFERENCES wineries(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_closed BOOLEAN DEFAULT FALSE,
  custom_capacity INT, -- override default capacity
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Time Slots (generated dynamically or pre-generated)
-- Option 1: Dynamic calculation (no table, compute on-demand)
-- Option 2: Pre-generated table (better performance for complex logic)
CREATE TABLE time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winery_id UUID REFERENCES wineries(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  max_capacity INT NOT NULL,
  booked_count INT DEFAULT 0,
  is_available BOOLEAN GENERATED ALWAYS AS (booked_count < max_capacity) STORED,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(winery_id, start_time)
);

-- Bookings/Reservations
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number VARCHAR(20) UNIQUE NOT NULL, -- human-readable (e.g., "WB-2024-001234")

  -- Relationships
  user_id UUID REFERENCES users(id),
  winery_id UUID REFERENCES wineries(id),
  tasting_experience_id UUID REFERENCES tasting_experiences(id),
  time_slot_id UUID REFERENCES time_slots(id),

  -- Booking details
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  party_size INT NOT NULL,
  special_requests TEXT,

  -- Payment
  total_amount_cents INT NOT NULL, -- total paid by user
  platform_fee_cents INT NOT NULL, -- 2% fee
  winery_payout_cents INT NOT NULL, -- 98% to winery
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),

  -- Status
  status VARCHAR(50) DEFAULT 'confirmed', -- 'confirmed', 'cancelled', 'completed', 'no_show'
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP,

  -- Check-in
  checked_in_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reviews & Ratings
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  user_id UUID REFERENCES users(id),
  winery_id UUID REFERENCES wineries(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT,
  is_moderated BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Car Services
CREATE TABLE car_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES regions(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  website_url VARCHAR(500),
  service_types TEXT[], -- ['private-tour', 'shuttle', 'limousine']
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Hotels
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES regions(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  address_line1 VARCHAR(255),
  city VARCHAR(100),
  state_province VARCHAR(100),
  phone VARCHAR(20),
  website_url VARCHAR(500),
  booking_url VARCHAR(500), -- affiliate link
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications/Emails Log
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL, -- 'booking_confirmation', 'reminder', etc.
  channel VARCHAR(20) NOT NULL, -- 'email', 'sms'
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  body TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin Activity Log
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50), -- 'winery', 'booking', 'user'
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes (Performance Optimization)

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Winery queries
CREATE INDEX idx_wineries_region_id ON wineries(region_id);
CREATE INDEX idx_wineries_slug ON wineries(slug);
CREATE INDEX idx_wineries_is_active ON wineries(is_active);
CREATE INDEX idx_wineries_location ON wineries USING gist(ll_to_earth(latitude, longitude));

-- Booking queries
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_winery_id ON bookings(winery_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);

-- Time slot availability
CREATE INDEX idx_time_slots_winery_start ON time_slots(winery_id, start_time);
CREATE INDEX idx_time_slots_availability ON time_slots(winery_id, start_time) WHERE is_available = true;

-- Reviews
CREATE INDEX idx_reviews_winery_id ON reviews(winery_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
```

---

## 4. API Design

### RESTful Endpoints Structure

```
# Public API
GET    /api/regions                          # List all regions
GET    /api/regions/:slug                    # Region details
GET    /api/regions/:slug/wineries           # Wineries in region

GET    /api/wineries                         # Search/list wineries
GET    /api/wineries/:slug                   # Winery details
GET    /api/wineries/:slug/experiences       # Tasting experiences
GET    /api/wineries/:slug/availability      # Available time slots
GET    /api/wineries/:slug/reviews           # Reviews

POST   /api/bookings                         # Create booking
GET    /api/bookings/:id                     # Booking details

# User API (authenticated)
GET    /api/users/me                         # Current user profile
PATCH  /api/users/me                         # Update profile
GET    /api/users/me/bookings                # User's bookings
PATCH  /api/bookings/:id                     # Modify booking
DELETE /api/bookings/:id                     # Cancel booking
POST   /api/reviews                          # Submit review

# Winery Portal API (winery role)
GET    /api/winery/dashboard                 # Dashboard stats
GET    /api/winery/bookings                  # Winery's bookings
PATCH  /api/winery/bookings/:id              # Update booking (check-in, etc.)
GET    /api/winery/profile                   # Winery profile
PATCH  /api/winery/profile                   # Update profile
POST   /api/winery/experiences               # Create tasting experience
PATCH  /api/winery/experiences/:id           # Update experience
DELETE /api/winery/experiences/:id           # Delete experience
GET    /api/winery/hours                     # Operating hours
PATCH  /api/winery/hours                     # Update hours
POST   /api/winery/availability-overrides    # Block dates
GET    /api/winery/analytics                 # Analytics data

# Admin API (admin role)
GET    /api/admin/users                      # List users
PATCH  /api/admin/users/:id                  # Manage user
GET    /api/admin/wineries                   # List wineries
POST   /api/admin/wineries/:id/approve       # Approve winery
GET    /api/admin/bookings                   # All bookings
POST   /api/admin/bookings/:id/refund        # Process refund
GET    /api/admin/analytics                  # Platform analytics
GET    /api/admin/logs                       # Activity logs

# Webhooks
POST   /api/webhooks/stripe                  # Stripe events
```

---

## 5. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   User     │  │  Winery    │  │   Admin    │            │
│  │  Portal    │  │  Portal    │  │  Portal    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│         │                │               │                  │
└─────────┼────────────────┼───────────────┼──────────────────┘
          │                │               │
          └────────────────┴───────────────┘
                          │
                ┌─────────▼─────────┐
                │                   │
                │   Next.js App     │
                │   (React + API)   │
                │                   │
                └─────────┬─────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
  ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
  │              │ │             │ │            │
  │  Auth Layer  │ │  Business   │ │  External  │
  │ (NextAuth)   │ │   Logic     │ │   APIs     │
  │              │ │             │ │            │
  └───────┬──────┘ └──────┬──────┘ └─────┬──────┘
          │               │               │
          │      ┌────────▼────────┐      │
          │      │                 │      │
          └─────►│  Prisma ORM     │◄─────┘
                 │                 │
                 └────────┬────────┘
                          │
                 ┌────────▼────────┐
                 │                 │
                 │   PostgreSQL    │
                 │                 │
                 └─────────────────┘

External Services:
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Stripe  │  │  AWS S3  │  │  Resend  │  │  Google  │
│ Connect  │  │ (Photos) │  │  (Email) │  │   Maps   │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

## 6. Security Considerations

### Authentication & Authorization
- **Password Security**: bcrypt with cost factor 12+
- **JWT Tokens**: Short-lived (15 min) access tokens, longer refresh tokens
- **Role-Based Access**: Middleware enforces user/winery/admin permissions
- **Session Management**: Secure, httpOnly cookies

### Data Protection
- **Encryption in Transit**: TLS 1.3
- **Encryption at Rest**: Database-level encryption
- **PII Protection**: Minimal data collection, secure storage
- **Payment Data**: Never store card details (Stripe tokenization)

### Application Security
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection**: Parameterized queries via Prisma
- **XSS Protection**: React auto-escaping + CSP headers
- **CSRF Protection**: SameSite cookies + CSRF tokens
- **Rate Limiting**: Redis-based rate limiting (100 req/min per IP)
- **API Security**: API keys for service-to-service, JWT for user requests

### Compliance
- **GDPR**: Data export/deletion, consent management
- **CCPA**: Data disclosure, opt-out mechanisms
- **PCI DSS**: Via Stripe compliance

---

## 7. Scalability & Performance

### Caching Strategy
- **CDN**: Static assets (images, CSS, JS)
- **Redis Cache**:
  - Region/winery lists (5 min TTL)
  - User sessions
  - Rate limit counters
- **Database Query Optimization**: Proper indexes, connection pooling

### Database Scaling
- **Read Replicas**: For analytics and reporting queries
- **Connection Pooling**: PgBouncer or built-in pooling
- **Partitioning**: Partition bookings table by date (future)

### Horizontal Scaling
- **Stateless Application**: Enable load balancing across instances
- **Job Queue**: Bull/BullMQ for async tasks (email sending, analytics)

---

## 8. Deployment Architecture

### Environments
1. **Development**: Local (Docker Compose)
2. **Staging**: Vercel preview deployments
3. **Production**: Vercel production

### CI/CD Pipeline
```yaml
# .github/workflows/main.yml
name: CI/CD
on: [push, pull_request]

jobs:
  test:
    - Lint (ESLint, Prettier)
    - Type check (TypeScript)
    - Unit tests (Vitest)
    - E2E tests (Playwright)

  deploy-staging:
    - Deploy to Vercel staging
    - Run smoke tests

  deploy-production:
    - Manual approval
    - Deploy to Vercel production
    - Monitor error rates
```

### Infrastructure as Code
- **Database**: Managed Postgres (Supabase/Neon)
- **Secrets**: Environment variables in Vercel
- **Backups**: Daily automated DB backups

---

## 9. Monitoring & Observability

### Error Tracking
- **Sentry**: Frontend + backend error monitoring
- **Alerts**: Slack/email on critical errors

### Application Monitoring
- **Vercel Analytics**: Web vitals, performance
- **Custom Metrics**:
  - Booking conversion rate
  - Payment success rate
  - API response times

### Logging
- **Structured Logging**: JSON format
- **Log Levels**: error, warn, info, debug
- **Log Aggregation**: Vercel logs or external (LogDNA, Datadog)

### Uptime Monitoring
- **External Monitoring**: UptimeRobot, Pingdom
- **Health Check Endpoint**: `GET /api/health`

---

## 10. Development Workflow

### Local Development Setup
```bash
# Prerequisites
- Node.js 20+
- Docker (for local Postgres + Redis)
- pnpm (package manager)

# Setup
git clone <repo>
cd wine-app
pnpm install
docker-compose up -d  # Start Postgres + Redis
pnpm prisma migrate dev
pnpm dev  # Start Next.js dev server
```

### Code Organization
```
wine-app/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (public)/          # Public pages
│   │   ├── (auth)/            # Auth pages
│   │   ├── winery/            # Winery portal
│   │   ├── admin/             # Admin portal
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # Shadcn components
│   │   └── features/          # Feature components
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── auth.ts            # Auth config
│   │   ├── stripe.ts          # Stripe client
│   │   └── utils.ts
│   ├── services/              # Business logic
│   │   ├── bookings.ts
│   │   ├── wineries.ts
│   │   └── payments.ts
│   ├── types/
│   └── middleware.ts
├── tests/
├── .env.local
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## Next Steps

1. **Review & Approve Architecture**: Confirm tech stack choices
2. **Set Up Project**: Initialize Next.js + Prisma + dependencies
3. **Database Setup**: Create initial schema and seed data
4. **Design System**: Set up Tailwind + Shadcn components
5. **Authentication**: Implement NextAuth with email/password
6. **Core Features**: Start with user booking flow (MVP)
