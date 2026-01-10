# Wine Club Management Platform

## Executive Summary

The **Wine Club Management Platform** is a SaaS product for wineries to manage membership billing, shipments, and member communications. This feature has the potential to **become our primary revenue stream** by Year 3.

### Why This Matters
- Wine clubs generate 30-50% of winery DTC revenue
- Current solutions cost $300-1,000/month with high transaction fees
- We can offer better pricing, better UX, and integration with our booking platform
- **Projected Revenue**: $1M+ annually by Year 3

---

## Market Opportunity

### Current Wine Club Management Landscape

**Market Size:**
- 11,000 US wineries, ~3,000 have wine clubs
- Average wine club size: 200-500 members
- Average annual revenue per wine club: $500K-2M
- **Total market**: $1.5-6B in wine club sales annually

**Current Solutions:**

| Platform | Pricing | Pros | Cons |
|----------|---------|------|------|
| **WineDirect** | $500-1,000/mo | Comprehensive, established | Expensive, clunky UX, complex setup |
| **Commerce7** | $300-600/mo | Modern UI, good analytics | Still expensive, steep learning curve |
| **VinSuite** | $400+/mo | Enterprise features | Overkill for small wineries |
| **Vinoshipper** | Varies | Good shipping integration | Not full club management |
| **Spreadsheets** | Free | Flexible | Manual, error-prone, no automation |

**Pain Points:**
1. **High cost** - Small wineries can't afford $500/month
2. **Complex setup** - Takes weeks to onboard
3. **Poor UX** - Clunky interfaces from 2010
4. **No integration** - Separate from booking/tasting room systems
5. **Manual work** - Billing reminders, shipping notifications, member communications

**Our Opportunity:**
- ✅ **Lower pricing** ($199-799/month vs. $300-1,000)
- ✅ **Modern UX** (built with Next.js, same as booking platform)
- ✅ **Integrated** (members discovered via tastings → join club seamlessly)
- ✅ **Quick setup** (onboarding in 30 minutes, not weeks)
- ✅ **High-touch support** (small team, personal service)

---

## Product Features

### For Winery Administrators

#### 1. Membership Management
- **Member Database**:
  - Contact info (name, email, phone, shipping address)
  - Membership tier (Silver, Gold, Platinum, etc.)
  - Join date, status (active, paused, cancelled)
  - LTV and shipment history
  - Custom tags and notes

- **Membership Tiers**:
  - Create unlimited tier levels
  - Set pricing (monthly, quarterly, annually)
  - Define benefits (# bottles, discounts, exclusive access)
  - Automatic tier upgrades based on spend

- **Member Lifecycle**:
  - Onboarding emails (welcome series)
  - Pause/skip shipment requests
  - Cancellation flow with win-back offers
  - Re-activation campaigns

#### 2. Billing & Payments
- **Recurring Billing**:
  - Automatic credit card charging
  - Frequency options: monthly, quarterly, annually
  - Retry logic for failed payments (3 attempts over 7 days)
  - Automated dunning emails

- **Payment Methods**:
  - Credit/debit cards (via Stripe)
  - ACH/bank transfers (for high-value members)
  - Gift memberships (one-time purchases)

- **Invoicing**:
  - Automatic invoice generation
  - Email delivery with PDF attachment
  - Payment receipts
  - Tax calculation (varies by state)

#### 3. Shipment Management
- **Release Scheduling**:
  - Create seasonal releases (Spring, Summer, Fall, Winter)
  - Set shipment dates
  - Define wine selections per release
  - Bottle allocation by tier

- **Fulfillment Tracking**:
  - Mark shipments as prepared, shipped, delivered
  - Bulk actions (ship all Spring release)
  - Integration with ShipCompliant (alcohol shipping compliance)
  - Tracking number entry and automatic notifications

- **Shipping Rules**:
  - Calculate shipping costs by state
  - Free shipping thresholds
  - International shipping options
  - Hold shipments (weather, holidays)

#### 4. Member Portal (Customer-Facing)
- **Member Dashboard**:
  - Upcoming shipments
  - Order history
  - Membership tier and benefits
  - Total lifetime spend

- **Self-Service Actions**:
  - Update payment method
  - Change shipping address
  - Pause upcoming shipment (with deadline)
  - Skip one-time shipment
  - Refer a friend (referral program)

- **Wine Preferences**:
  - Red vs. white preference
  - Specific varietal preferences
  - Allergies/dietary restrictions (if food pairings)

- **Additional Purchases**:
  - Buy extra bottles from shipment
  - Browse winery catalog (member pricing)
  - One-click reorder favorites

#### 5. Communication Tools
- **Email Campaigns**:
  - Shipment notifications ("Your Fall release ships next week!")
  - Pick-up reminders (if local pickup option)
  - New release announcements
  - Exclusive event invitations
  - Segmentation by tier, preferences, tenure

- **SMS Notifications** (optional):
  - Payment processing alerts
  - Shipment tracking updates
  - Last-minute event reminders

- **Email Templates**:
  - Pre-built templates for common scenarios
  - Drag-and-drop email builder
  - Personalization tokens (first name, tier, etc.)

#### 6. Analytics & Reporting
- **Key Metrics Dashboard**:
  - Total active members
  - MRR (Monthly Recurring Revenue)
  - Churn rate (monthly)
  - New signups (monthly)
  - Average LTV per member

- **Financial Reports**:
  - Revenue by month/quarter/year
  - Revenue by tier
  - Projected revenue (based on active members)
  - Outstanding payments

- **Member Analytics**:
  - Cohort retention analysis
  - Member acquisition sources (tasting room, website, referral)
  - Top members by LTV
  - At-risk members (payment issues, low engagement)

- **Shipment Reports**:
  - Bottles shipped by release
  - Shipping costs by state
  - Fulfillment status tracking

---

### For Wine Club Members

#### Member Portal Features
- **Login** (email + password or magic link)
- **Dashboard** showing next shipment, order history
- **Manage Membership**:
  - Update payment method (without contacting winery)
  - Change shipping address
  - Pause or cancel membership
- **Track Shipments** (FedEx/UPS tracking integration)
- **Refer Friends** (earn rewards for referrals)
- **Shop Additional Wines** (member-exclusive pricing)

---

## Technical Architecture

### Database Schema (Additional Tables)

```sql
-- Wine Club Tiers
CREATE TABLE wine_club_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winery_id UUID REFERENCES wineries(id),
  name VARCHAR(100) NOT NULL, -- "Silver", "Gold", "Platinum"
  description TEXT,
  price_cents INT NOT NULL, -- monthly price in cents
  billing_frequency VARCHAR(20) NOT NULL, -- 'monthly', 'quarterly', 'annually'
  bottles_per_shipment INT NOT NULL,
  shipments_per_year INT NOT NULL,
  member_discount_percent DECIMAL(5, 2), -- 10%, 15%, 20%
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Wine Club Members
CREATE TABLE wine_club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winery_id UUID REFERENCES wineries(id),
  user_id UUID REFERENCES users(id), -- linked to platform user account
  tier_id UUID REFERENCES wine_club_tiers(id),

  -- Membership details
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'cancelled'
  joined_at TIMESTAMP DEFAULT NOW(),
  paused_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,

  -- Billing
  stripe_subscription_id VARCHAR(255), -- Stripe subscription for recurring billing
  next_billing_date DATE,
  last_payment_date DATE,

  -- Shipping
  shipping_first_name VARCHAR(100),
  shipping_last_name VARCHAR(100),
  shipping_address_line1 VARCHAR(255),
  shipping_address_line2 VARCHAR(255),
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(50),
  shipping_postal_code VARCHAR(20),
  shipping_country VARCHAR(50) DEFAULT 'USA',
  shipping_phone VARCHAR(20),

  -- Preferences
  wine_preferences JSONB, -- {"red_white_ratio": "75/25", "varietals": ["Cabernet", "Syrah"]}
  special_instructions TEXT,

  -- Metrics
  lifetime_value_cents INT DEFAULT 0,
  total_shipments_received INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Shipment Releases
CREATE TABLE shipment_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winery_id UUID REFERENCES wineries(id),
  name VARCHAR(100) NOT NULL, -- "Spring 2026 Release"
  release_date DATE NOT NULL,
  shipment_window_start DATE, -- when shipments begin
  shipment_window_end DATE, -- when shipments complete
  notes TEXT,
  status VARCHAR(20) DEFAULT 'planned', -- 'planned', 'in_progress', 'completed'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Shipment Release Wines (which wines in each release)
CREATE TABLE release_wines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES shipment_releases(id),
  wine_name VARCHAR(200) NOT NULL,
  vintage YEAR,
  quantity_bottles INT NOT NULL,
  tier_id UUID REFERENCES wine_club_tiers(id), -- which tier gets this wine
  created_at TIMESTAMP DEFAULT NOW()
);

-- Member Shipments (individual shipments to members)
CREATE TABLE member_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES wine_club_members(id),
  release_id UUID REFERENCES shipment_releases(id),

  -- Shipping details
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'prepared', 'shipped', 'delivered', 'skipped'
  tracking_number VARCHAR(100),
  carrier VARCHAR(50), -- 'FedEx', 'UPS', 'USPS'
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,

  -- Contents
  wines JSONB, -- [{"name": "2022 Cabernet", "quantity": 2}, {...}]

  -- Cost
  shipping_cost_cents INT,
  total_value_cents INT, -- value of wines + shipping

  -- Actions
  is_skipped BOOLEAN DEFAULT FALSE,
  skip_reason TEXT,
  skipped_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Billing Transactions
CREATE TABLE wine_club_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES wine_club_members(id),

  -- Transaction details
  type VARCHAR(50) NOT NULL, -- 'subscription', 'shipping', 'additional_purchase'
  amount_cents INT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'succeeded', 'failed', 'refunded'

  -- Stripe
  stripe_charge_id VARCHAR(255),
  stripe_invoice_id VARCHAR(255),

  -- Metadata
  description TEXT,
  failure_reason TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Referral Program
CREATE TABLE wine_club_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_member_id UUID REFERENCES wine_club_members(id),
  referred_email VARCHAR(255) NOT NULL,
  referred_member_id UUID REFERENCES wine_club_members(id), -- set when they join
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'joined', 'rewarded'
  reward_type VARCHAR(50), -- 'credit', 'free_bottle', 'discount'
  reward_value_cents INT,
  created_at TIMESTAMP DEFAULT NOW(),
  converted_at TIMESTAMP
);
```

### API Endpoints (Additional)

```
# Wine Club Management (Winery Portal)

GET    /api/winery/wine-club/tiers               # List membership tiers
POST   /api/winery/wine-club/tiers               # Create new tier
PATCH  /api/winery/wine-club/tiers/:id           # Update tier
DELETE /api/winery/wine-club/tiers/:id           # Delete tier

GET    /api/winery/wine-club/members             # List all members
GET    /api/winery/wine-club/members/:id         # Member details
PATCH  /api/winery/wine-club/members/:id         # Update member
POST   /api/winery/wine-club/members/:id/pause   # Pause membership
POST   /api/winery/wine-club/members/:id/cancel  # Cancel membership

GET    /api/winery/wine-club/releases            # List releases
POST   /api/winery/wine-club/releases            # Create release
PATCH  /api/winery/wine-club/releases/:id        # Update release
GET    /api/winery/wine-club/releases/:id/shipments  # All shipments for release

GET    /api/winery/wine-club/shipments           # All shipments
PATCH  /api/winery/wine-club/shipments/:id       # Update shipment status
POST   /api/winery/wine-club/shipments/:id/ship  # Mark as shipped (add tracking)

GET    /api/winery/wine-club/analytics           # Dashboard analytics
GET    /api/winery/wine-club/transactions        # Billing transactions

POST   /api/winery/wine-club/email-campaign      # Send email to members


# Member Portal (Customer-Facing)

GET    /api/wine-club/membership                 # My membership details
PATCH  /api/wine-club/membership/payment         # Update payment method
PATCH  /api/wine-club/membership/shipping        # Update shipping address
POST   /api/wine-club/membership/pause           # Pause membership
POST   /api/wine-club/membership/cancel          # Cancel membership

GET    /api/wine-club/shipments                  # My shipment history
POST   /api/wine-club/shipments/:id/skip         # Skip upcoming shipment

POST   /api/wine-club/refer                      # Refer a friend
GET    /api/wine-club/referrals                  # My referrals

GET    /api/wine-club/shop                       # Browse additional wines
POST   /api/wine-club/shop/purchase              # Purchase additional bottles


# Stripe Webhooks (for billing events)

POST   /api/webhooks/stripe/wine-club            # Handle subscription events
```

### Third-Party Integrations

1. **Stripe Subscriptions**
   - Recurring billing
   - Payment retry logic
   - Subscription lifecycle management

2. **ShipCompliant** (or ShipStation)
   - Alcohol shipping compliance (state laws)
   - Carrier rate shopping
   - Label printing
   - Tracking updates

3. **Email Service** (Resend or SendGrid)
   - Transactional emails (payment confirmations, shipping notifications)
   - Marketing campaigns

4. **SMS** (Twilio)
   - Optional SMS notifications

---

## Implementation Roadmap

### Phase 1: MVP Wine Club Features (Months 9-12)
**Goal**: Launch with 5 wineries, prove value

**Features**:
- ✅ Create membership tiers (winery portal)
- ✅ Member signup flow (public-facing)
- ✅ Recurring billing with Stripe Subscriptions
- ✅ Member database (winery can view members)
- ✅ Manual shipment tracking (winery marks as shipped)
- ✅ Member portal (update payment/shipping address)
- ✅ Basic email notifications (payment confirmed, shipment shipped)

**Development Time**: 3 months
**Development Cost**: $30-40K

### Phase 2: Automation & Communication (Months 13-15)
**Features**:
- ✅ Shipment release planning (winery creates releases)
- ✅ Automated shipment notifications
- ✅ Email campaign builder for wineries
- ✅ Member pause/skip functionality
- ✅ Payment retry logic and dunning
- ✅ Analytics dashboard (MRR, churn, LTV)

**Development Time**: 2 months
**Development Cost**: $20-30K

### Phase 3: Advanced Features (Months 16-18)
**Features**:
- ✅ ShipCompliant integration (compliance + shipping)
- ✅ Referral program
- ✅ Member shop (purchase additional bottles)
- ✅ Wine preference management
- ✅ Cohort retention analysis
- ✅ Mobile app (iOS/Android)

**Development Time**: 3 months
**Development Cost**: $30-40K

**Total Investment**: $80-110K over 9 months

---

## Go-to-Market Strategy

### Target Customers (Wineries)

**Ideal Profile:**
- 100-500 wine club members (sweet spot)
- Currently using spreadsheets or expensive legacy software
- Annual wine club revenue: $200K-1M
- Willing to try new technology
- Located in regions where we have booking platform presence

**Pricing Strategy:**
- **Starter**: $199/month (up to 100 members) - Target: Small wineries
- **Growth**: $399/month (up to 500 members) - Target: Mid-size wineries
- **Enterprise**: $799/month (unlimited) - Target: Large wineries or winery groups

Plus: **1.5% transaction fee** on all wine club charges

### Sales Process

**Month 1-2: Beta Program**
- Recruit 3-5 Walla Walla wineries for beta testing
- Offer 6 months free in exchange for feedback
- Iterate on product based on their input

**Month 3-6: Early Adopter Phase**
- Launch publicly to all wineries on booking platform
- Offer: "First 3 months at 50% off" promotion
- Target: 20 wineries by Month 6

**Month 7-12: Scale**
- Proven case studies from early adopters
- Expand to wineries in all regions where we operate
- Target: 40-50 wineries by Month 12

**Year 2: Market Penetration**
- Expand to wineries NOT on booking platform (standalone product)
- Partner with wine associations for member discounts
- Target: 150 wineries by end of Year 2

### Competitive Positioning

**vs. WineDirect:**
- ✅ 50% cheaper ($399 vs. $800/month for similar tier)
- ✅ Modern, intuitive UX (built 2025 vs. 2010)
- ✅ Faster setup (30 min vs. 2 weeks)
- ❌ Less features initially (they've had 15 years to build)

**vs. Commerce7:**
- ✅ 30% cheaper
- ✅ Integrated with booking platform (seamless tasting → wine club conversion)
- ✅ Better support (small team, high-touch)
- ❌ Slightly fewer integrations

**vs. Spreadsheets:**
- ✅ Automated billing (no manual invoicing)
- ✅ Professional member experience
- ✅ Compliance tools (ShipCompliant integration)
- ✅ Analytics and insights
- ❌ Costs money (vs. "free")

**Our Wedge:** "Switch from WineDirect and save $200/month with better UX"

---

## Financial Projections (Wine Club Management Only)

### Revenue Model

**Per Winery Revenue:**
- Subscription: $199-799/month avg = $400/month
- Transaction fees: 1.5% × avg $40,000/year in club sales = $600/year = $50/month
- **Total per winery**: $450/month = $5,400/year

### Revenue Projections

| Year | Wineries | Avg Rev/Winery/Year | Annual Revenue | Growth |
|------|----------|---------------------|----------------|--------|
| **Year 1** | 10 avg (launch Month 9) | $5,400 | $27,000 (4 months) | - |
| **Year 2** | 50 | $5,400 | $270,000 | 10× |
| **Year 3** | 150 | $6,800 (price increase) | $1,020,000 | 3.8× |
| **Year 4** | 350 | $7,200 | $2,520,000 | 2.5× |
| **Year 5** | 600 | $7,500 | $4,500,000 | 1.8× |

### Cost Structure

**Variable Costs (per winery):**
- Stripe fees: 2.9% + $0.30 per transaction
- Email/SMS costs: ~$20/month per winery
- ShipCompliant fees: ~$30/month per winery
- Support costs: ~$30/month per winery (amortized)
- **Total variable costs**: ~$80/month = $960/year

**Contribution Margin**: $5,400 - $960 = $4,440 per winery per year (82% margin!) ✅

**Fixed Costs:**
- Engineering team (3 engineers): $450K/year
- Customer success (2 people): $150K/year
- Infrastructure: $5,000/month = $60K/year
- **Total fixed costs**: $660K/year

**Break-Even Analysis:**
- Need revenue to cover $660K fixed costs
- At $5,400 revenue per winery/year
- **Break-even: ~125 wineries** (achievable in Year 2-3)

### Path to Profitability

| Year | Revenue | Variable Costs | Fixed Costs | Profit/Loss |
|------|---------|----------------|-------------|-------------|
| Year 1 | $27K | $5K | $300K (partial) | -$278K |
| Year 2 | $270K | $50K | $660K | -$440K |
| Year 3 | $1,020K | $180K | $750K | +$90K ✅ |
| Year 4 | $2,520K | $420K | $900K | +$1,200K 💰 |
| Year 5 | $4,500K | $720K | $1,100K | +$2,680K 🚀 |

**Profitable by Year 3, highly profitable by Year 4-5.**

---

## Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Wineries hesitant to switch** | High | High | Offer migration assistance, 3-month free trial, proven ROI |
| **Incumbent competition (WineDirect)** | Medium | Medium | Differentiate on price, UX, integration; they're slow to innovate |
| **Compliance complexity (alcohol shipping)** | Medium | High | Partner with ShipCompliant from day 1; hire compliance expert |
| **Development complexity underestimated** | Medium | Medium | Start with MVP, phase rollout, hire experienced dev |
| **Slow adoption (need 125 to break even)** | Medium | High | Aggressive sales, prove value with case studies |

---

## Success Metrics

### Product Metrics (What to Track)
- **Adoption**: # wineries using wine club management
- **Engagement**: % wineries actively using features (weekly)
- **Members managed**: Total wine club members on platform
- **Transaction volume**: $ in wine club sales processed
- **Churn**: % wineries canceling per month (target: <3%)

### Financial Metrics
- **MRR** (Monthly Recurring Revenue)
- **ARR** (Annual Recurring Revenue)
- **CAC** (Customer Acquisition Cost - per winery)
- **LTV** (Lifetime Value - per winery)
- **Payback Period**: How long to recover CAC
- **Gross Margin**: Revenue - variable costs

### Target Benchmarks (Year 2)
- ✅ 50 wineries using wine club management
- ✅ 10,000+ wine club members managed
- ✅ $8M+ in annual wine club sales processed
- ✅ <3% monthly winery churn
- ✅ 9:1 LTV/CAC ratio
- ✅ 80%+ gross margin

---

## Conclusion

**Wine Club Management could become our biggest revenue driver** within 2-3 years. Here's why:

1. **Massive TAM**: 3,000 US wineries with clubs, $1.5-6B market
2. **High willingness to pay**: Wineries pay $300-1,000/month today
3. **Sticky revenue**: High switching costs, low churn
4. **Great margins**: 80%+ gross margins, high LTV/CAC
5. **Natural fit**: Integrates seamlessly with booking platform
6. **Underserved market**: Incumbents are expensive and outdated

**This isn't just a "nice-to-have" feature—it's a potential standalone business.**

By Year 3, wine club management could generate **$1M+ in revenue** while booking commissions generate only $100K. This fundamentally changes the business model from "marketplace with thin margins" to "SaaS with great margins + marketplace."

**Recommendation**:
- Launch booking platform first (Months 1-6)
- Add premium listings immediately (Month 7) - easy revenue
- Build wine club management (Months 9-12) - game changer
- By Year 2, pivot messaging to position as "winery operating system" not just "booking platform"

This is how you build a $100M+ company. 🚀
