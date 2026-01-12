# Updated MVP Development Plan
## Wine Booking + Wine Club Management Platform

**Updated:** January 2026
**Strategic Change:** Launch wine club management alongside booking platform

---

## Executive Summary

Based on financial projections showing wine club management will be **52% of Year 3 revenue** ($1.02M), we're updating the strategy to prioritize wine club as a core product rather than a future add-on.

### Two Approach Options:

#### **Option A: Phased Launch (Recommended)**
- **Months 1-6:** Booking platform MVP
- **Months 6-9:** Wine club management
- **Total to full launch:** 9 months
- **Cost:** $50-70K

#### **Option B: Simultaneous Launch**
- **Months 1-12:** Both products together
- **Total to full launch:** 12 months
- **Cost:** $80-100K

**Recommendation:** Option A (Phased) allows faster initial revenue, lower risk, and easier validation.

---

## Option A: Phased Launch (Recommended)

### Phase 1: Booking Platform (Months 1-6)

**Goal:** Launch core booking platform with 10-15 Walla Walla wineries

#### Month 1-2: Foundation & Design
- Week 1-2: Database setup (PostgreSQL + Prisma)
- Week 3-4: Authentication (NextAuth.js)
- Week 5-6: UX/UI design for booking flow
- Week 7-8: Winery admin portal design

**Deliverables:**
- ✅ Database schema (bookings only)
- ✅ Authentication system
- ✅ High-fidelity mockups
- ✅ Design system established

#### Month 3-4: Core Booking Features
- Week 9-10: Winery listing pages
- Week 11-12: Winery detail pages with calendar
- Week 13-14: Booking flow + Stripe payment
- Week 15-16: Confirmation emails & notifications

**Deliverables:**
- ✅ User can browse wineries
- ✅ User can book and pay for tastings
- ✅ Email confirmations working

#### Month 5: Winery Portal
- Week 17-18: Winery dashboard (today's bookings, revenue)
- Week 19: Capacity management settings
- Week 20: Operating hours configuration

**Deliverables:**
- ✅ Winery can see inbound bookings
- ✅ Winery can manage capacity
- ✅ Winery can set hours and availability

#### Month 6: Admin Portal & Launch
- Week 21: Admin dashboard (platform metrics)
- Week 22: Admin tools (approve wineries, refunds)
- Week 23: Testing with 3 founding wineries
- Week 24: Launch to 10 wineries

**Metrics by Month 6:**
- 10 wineries live
- 100+ users registered
- 25-50 bookings completed
- $1,000-2,500 GMV

**Revenue: ~$40-100 in booking commissions**

---

### Phase 2: Wine Club Management (Months 6-9)

**Goal:** Launch wine club SaaS with 3-5 wineries

#### Month 6-7: Wine Club Core Features
- Week 25-26: Wine club database models
- Week 27: Membership tier creation (winery portal)
- Week 28: Stripe Subscriptions integration
- Week 29-30: Recurring billing system

**Deliverables:**
- ✅ Wineries can create wine clubs
- ✅ Wineries can define membership tiers
- ✅ Recurring billing working

#### Month 8: Shipment Management
- Week 31: Shipment scheduling interface
- Week 32: Member list management
- Week 33: Shipment tracking
- Week 34: Email notifications for shipments

**Deliverables:**
- ✅ Wineries can schedule shipments
- ✅ Wineries can manage member list
- ✅ Members notified of shipments

#### Month 9: Member Portal
- Week 35: Member dashboard (view membership)
- Week 36: Update shipping/payment info
- Week 37: Skip shipment functionality
- Week 38: Beta launch with 3 wineries

**Deliverables:**
- ✅ Members can view membership details
- ✅ Members can manage their subscription
- ✅ Members can skip shipments
- ✅ 3 wineries testing wine club management

**Metrics by Month 9:**
- 3-5 wineries using wine club management
- 50-100 wine club members managed
- $600-1,500/month recurring revenue from SaaS

---

### Phase 3: Scale & Optimize (Months 9-12)

#### Month 10: Integration & Upsells
- Connect booking → wine club signup flow
- Add premium listings for wineries
- Build referral program for wine club members

#### Month 11: Analytics & Reporting
- Winery analytics dashboard
- Wine club retention reports
- Revenue forecasting tools

#### Month 12: Regional Expansion
- Onboard Willamette Valley wineries
- Improve onboarding automation
- Add mobile optimization

**Metrics by Month 12:**
- 30 wineries on booking platform
- 10 wineries on wine club management
- $5K/month total revenue ($2K bookings + $3K SaaS)

---

## Option B: Simultaneous Launch (12 Months)

### Pros:
- Stronger value prop from day 1
- Immediate recurring revenue
- Higher winery retention
- Differentiated offering

### Cons:
- Longer time to market (12 months vs 6 months)
- Higher development cost ($80-100K vs $50K)
- More complex to validate
- Need more experienced developers

### Timeline:
- **Months 1-3:** Foundation + booking features
- **Months 4-6:** Winery portal + booking launch
- **Months 7-9:** Wine club features
- **Months 10-12:** Member portal + full launch

### When to choose this:
- You have $80K+ budget
- You can find experienced developer(s)
- You're confident in wine club demand
- You want maximum differentiation

---

## Updated Project Structure

```
wine-app/
├── app/
│   ├── (public)/           # User-facing pages
│   │   ├── page.tsx        # Homepage
│   │   ├── regions/        # Browse by region
│   │   ├── wineries/       # Winery listings
│   │   │   └── [slug]/     # Winery detail page
│   │   └── book/           # Booking flow
│   │
│   ├── (member)/           # 🆕 Member portal for wine club members
│   │   ├── dashboard/      # Member dashboard
│   │   ├── membership/     # Manage membership
│   │   ├── shipments/      # View shipments
│   │   ├── settings/       # Update payment/shipping
│   │   └── refer/          # Referral program
│   │
│   ├── (winery)/           # Winery owner portal
│   │   ├── dashboard/      # Bookings dashboard
│   │   ├── bookings/       # Manage reservations
│   │   ├── experiences/    # Manage tasting experiences
│   │   ├── capacity/       # Capacity settings
│   │   ├── wine-club/      # 🆕 Wine club management
│   │   │   ├── setup/      # Create wine club
│   │   │   ├── tiers/      # Manage membership tiers
│   │   │   ├── members/    # Member list
│   │   │   ├── shipments/  # Schedule shipments
│   │   │   └── analytics/  # Wine club analytics
│   │   └── settings/       # Winery settings
│   │
│   ├── (admin)/            # Platform admin
│   │   ├── dashboard/      # Platform metrics
│   │   ├── wineries/       # Manage wineries
│   │   ├── users/          # Manage users
│   │   └── revenue/        # Revenue reporting
│   │
│   └── api/                # API routes
│       ├── auth/           # NextAuth
│       ├── bookings/       # Booking API
│       ├── wine-clubs/     # 🆕 Wine club API
│       ├── memberships/    # 🆕 Membership API
│       └── webhooks/       # Stripe webhooks
```

---

## Updated Cost Breakdown

### Option A: Phased Launch

**Phase 1 (Months 1-6): Booking Platform**
- Developer: $30-40K (6 months @ $5-7K/month)
- Designer: $3-5K (contractor)
- Infrastructure: $500
- Legal/setup: $1K
- **Subtotal: $35-46K**

**Phase 2 (Months 6-9): Wine Club Management**
- Developer: $15-24K (3 months @ $5-8K/month)
- Additional infrastructure: $300
- Stripe subscription setup: $500
- **Subtotal: $16-25K**

**Total (Option A): $51-71K**

### Option B: Simultaneous Launch

**Full Development (Months 1-12)**
- Senior developer: $60-80K (12 months @ $5-7K/month)
- OR 2 developers: $40K each = $80K
- Designer: $6-8K
- Infrastructure: $1K
- Legal/setup: $1K
- **Total (Option B): $68-90K**

---

## Updated Financial Projections

### With Phased Launch (Wine Club starts Month 9)

| Revenue Stream | Year 1 | Year 2 | Year 3 |
|----------------|--------|--------|--------|
| Booking Commissions | $30K | $120K | $300K |
| Premium Listings | $27K | $180K | $540K |
| Wine Club Management | **$18K** | **$350K** | **$1.02M** |
| Other | $6K | $40K | $105K |
| **TOTAL** | **$81K** | **$690K** | **$1.97M** |

**Wine club launches in Month 9:**
- Months 9-12: 3 wineries @ $300/mo avg = $3,600 (4 months)
- Plus transaction fees: ~$2K
- **Year 1 wine club: $18K** (4 months of revenue)

### Year 2 Acceleration

With wine club proven in Year 1:
- **40 wineries** adopt wine club @ $350/mo avg
- Plus transaction fees
- **Wine club becomes $350K** (58% of Year 2 revenue)

---

## Member Portal Features (Critical!)

### Member Dashboard
- Membership status and tier
- Next shipment date and details
- Billing history
- Upcoming charges

### Manage Membership
- View membership benefits
- Update payment method
- Update shipping address
- Pause membership (set resume date)
- Skip next shipment
- Cancel membership

### Shipment History
- View past shipments
- See wines received
- Reorder favorite wines (future)
- Share reviews (future)

### Referral Program
- Unique referral code
- Track referrals
- Earn credits ($25 per referral)

### Settings
- Email preferences
- Notification settings
- Dietary restrictions/preferences
- Wine preferences (reds vs whites, etc.)

---

## Integration Benefits

### Booking → Wine Club Funnel

1. **User books tasting** at winery
2. **After tasting**, winery offers wine club signup
3. **User receives email** post-visit with wine club offer
4. **One-click signup** (address already saved from booking)
5. **Discounted first shipment** for booking customers

**Expected conversion:** 10-15% of tasting customers join wine club

### Wine Club → Booking Loyalty

- Wine club members get **priority booking**
- Wine club members get **10% off tastings**
- Wine club members can **book exclusive experiences**

This creates a flywheel:
```
Booking → Join Wine Club → More Bookings → Referrals → More Members
```

---

## Technical Recommendations

### Must-Have for Member Portal

1. **Stripe Customer Portal Integration**
   - Let Stripe handle payment updates
   - Reduces PCI compliance burden
   - Better UX (Stripe's UI is polished)

2. **Email Notifications**
   - Shipment scheduled
   - Shipment shipped (with tracking)
   - Payment successful/failed
   - Membership status changes

3. **Mobile-First Design**
   - 70% of wine club members check on mobile
   - Make skip/pause easy on phone

4. **Self-Service First**
   - Reduce support tickets by letting members manage everything
   - Only escalate cancellations to winery

### Phase 2 Features (Add Later)

- SMS notifications
- Mobile app (native iOS/Android)
- Wine preferences quiz
- Tasting notes and ratings
- Shipment customization
- Gift memberships

---

## Key Risks & Mitigations

### Risk 1: Wine Club Too Complex
**Mitigation:** Start with MVP features only (billing, shipments, member portal). Add advanced features based on winery feedback.

### Risk 2: Longer Time to Market
**Mitigation:** Phase 1 launches in 6 months with booking revenue. Wine club adds 3 months, but with existing revenue.

### Risk 3: Higher Development Cost
**Mitigation:** Phase 1 costs $35-46K. Only invest in Phase 2 if Phase 1 succeeds.

### Risk 4: Wineries Don't Adopt Wine Club
**Mitigation:** Beta test with 2-3 wineries before full build. Get commitments upfront.

### Risk 5: Competing with WineDirect/Commerce7
**Mitigation:** Lower pricing ($199 vs $500), better UX, integrated with bookings (unique value prop).

---

## Recommended Next Steps

1. **Validate Wine Club Demand** (This Week)
   - Talk to 5-10 Walla Walla wineries
   - Ask: "Would you pay $199/month for wine club management software?"
   - Ask: "What features do you need?"
   - Get 2-3 commitments for beta testing

2. **Choose Approach** (Week 2)
   - **If 5+ wineries want wine club:** Consider Option B (simultaneous)
   - **If 2-3 wineries interested:** Go with Option A (phased)
   - **If 0-1 wineries interested:** Focus on bookings only, add wine club later

3. **Hire Developer** (Week 3-4)
   - If Option A: $5-7K/month developer
   - If Option B: $7-10K/month senior developer OR 2 mid-level developers

4. **Start Development** (Month 2)
   - Begin with Option A Phase 1
   - Can always accelerate to Option B if validation is strong

---

## My Strong Recommendation

**Go with Option A: Phased Launch**

**Why:**
1. ✅ **Faster initial revenue** (Month 6 vs Month 12)
2. ✅ **Lower initial risk** ($35K vs $80K)
3. ✅ **Validate before building** (prove bookings work before investing in wine club)
4. ✅ **Easier to hire** (6-month project vs 12-month project)
5. ✅ **Existing customers** make wine club easier to sell (wineries already trust you)

**But build wine club properly:**
- Don't rush it - 3 months is minimum
- Include member portal from day 1
- Beta test thoroughly with 2-3 wineries
- Launch when it's polished, not when it's "good enough"

The extra 3 months is worth it - wine club will be 52% of your revenue!
