# User Flows & Experience Design

## Overview

This document outlines the key user journeys for our three primary user types: Wine Tourists, Winery Owners/Managers, and Platform Admins.

---

## 1. Wine Tourist User Flows

### Flow 1A: Discovery → Booking (First-Time User)

```
1. Landing Page
   ├─> Browse regions (map view or list)
   ├─> Featured wineries carousel
   └─> Search bar (location, date, keywords)

2. Region Page (e.g., "Napa Valley")
   ├─> Region hero image & description
   ├─> Filter sidebar:
   │   ├─> Price range
   │   ├─> Wine varietals
   │   ├─> Amenities (food, tours, views)
   │   └─> Availability (date picker)
   └─> Winery grid/list results

3. Winery Detail Page
   ├─> Photo gallery
   ├─> About & description
   ├─> Location map
   ├─> Reviews & ratings
   ├─> Tasting experiences (cards with pricing)
   └─> [Book Now] CTA button

4. Booking Flow - Step 1: Experience Selection
   ├─> Select tasting experience
   ├─> View details (price, duration, included wines)
   └─> [Continue] button

5. Booking Flow - Step 2: Date & Time
   ├─> Calendar picker (shows availability)
   ├─> Time slot selection (dropdown or grid)
   ├─> Party size selector
   └─> [Continue] button

6. Booking Flow - Step 3: Guest Details
   ├─> First name, last name
   ├─> Email, phone
   ├─> Special requests (dietary, occasion, etc.)
   ├─> Create account checkbox (or login if returning)
   └─> [Continue to Payment] button

7. Payment Page
   ├─> Booking summary (experience, date/time, total)
   ├─> Stripe payment form (card details)
   ├─> Cancellation policy (checkbox to accept)
   └─> [Confirm & Pay] button

8. Confirmation Page
   ├─> Success message
   ├─> Booking details & confirmation number
   ├─> Add to calendar button (.ics download)
   ├─> Email confirmation sent (show message)
   ├─> Share on social (optional)
   └─> [View My Bookings] or [Explore More Wineries]

9. Email Confirmation (Automated)
   ├─> Booking confirmation email
   ├─> Calendar invite attachment
   ├─> Winery contact info
   ├─> Directions/map link
   └─> Modify/cancel booking link
```

**Key Design Principles:**
- **Minimize friction**: 3 steps max before payment
- **Visual clarity**: Large, high-quality photos
- **Availability transparency**: Show real-time open slots
- **Trust signals**: Reviews, ratings, cancellation policy upfront
- **Mobile-first**: 60%+ traffic expected on mobile

---

### Flow 1B: Returning User - Quick Booking

```
1. User Dashboard (logged in)
   └─> "Book Again" section (past wineries)
       ├─> Click winery card
       └─> Pre-filled guest details (skip Step 3)
           └─> Fast checkout

OR

1. Favorites Page
   └─> Browse saved wineries
       └─> Quick book with saved preferences
```

---

### Flow 1C: Itinerary Planning (Multi-Winery Day)

```
1. Region Page
   ├─> Select multiple wineries
   └─> "Add to Itinerary" button

2. Itinerary Planner
   ├─> Drag to reorder stops
   ├─> View on map (optimized route)
   ├─> Time estimates between wineries
   ├─> Book all tastings at once
   └─> Add car service (optional)

3. Checkout
   ├─> Multiple bookings in one transaction
   └─> Combined confirmation
```

---

### Flow 1D: Post-Visit Review Submission

```
1. Email Reminder (sent 1 day after visit)
   └─> [Leave a Review] button

2. Review Form
   ├─> Star rating (1-5)
   ├─> Title (optional)
   ├─> Written review
   ├─> Upload photos (optional)
   └─> [Submit Review]

3. Confirmation
   ├─> Thank you message
   └─> Review goes live (or pending moderation)
```

---

## 2. Winery Owner/Manager Flows

### Flow 2A: Winery Onboarding

```
1. Application Landing Page
   ├─> "List Your Winery" CTA
   └─> Benefits overview

2. Application Form - Part 1: Business Info
   ├─> Winery name
   ├─> Contact person
   ├─> Email, phone
   ├─> Business address
   └─> [Continue]

3. Application Form - Part 2: Verification
   ├─> Business license upload
   ├─> Tax ID (EIN)
   ├─> Website URL
   └─> [Continue]

4. Application Form - Part 3: Banking (Stripe Connect)
   ├─> Redirect to Stripe Connect onboarding
   ├─> Bank account details
   ├─> Identity verification
   └─> [Complete Stripe Setup]

5. Application Submitted
   ├─> "Under Review" message
   ├─> Expected review time (24-48hrs)
   └─> Email notification on approval

6. Approval Email
   ├─> Congratulations message
   └─> [Complete Your Profile] CTA

7. Profile Setup Wizard
   ├─> Upload winery photos (min 3)
   ├─> Write description
   ├─> Set operating hours
   ├─> Create first tasting experience
   │   ├─> Name (e.g., "Classic Tasting")
   │   ├─> Price
   │   ├─> Duration
   │   └─> Description
   ├─> Set capacity (max guests per slot)
   └─> [Go Live]

8. Dashboard (First Login)
   ├─> Welcome tour (tooltips)
   ├─> "You're Live!" message
   └─> Share profile link (social, email)
```

---

### Flow 2B: Daily Reservation Management

```
1. Dashboard (Daily View)
   ├─> Today's Stats
   │   ├─> Reservations today: 8
   │   ├─> Expected guests: 24
   │   ├─> Revenue today: $400
   │   └─> Capacity utilization: 60%
   │
   ├─> Upcoming Reservations (List View)
   │   ├─> 10:00 AM - John Smith (4 guests) - Classic Tasting
   │   ├─> 11:00 AM - Sarah Johnson (2 guests) - Reserve Tasting
   │   └─> ...
   │
   └─> Quick Actions
       ├─> [View Calendar]
       ├─> [Check In Guest] (opens QR scanner)
       └─> [Block Time Slot]

2. Reservation Detail (Click on reservation)
   ├─> Guest details (name, phone, email)
   ├─> Party size
   ├─> Special requests
   ├─> Payment status
   ├─> [Send Message to Guest]
   ├─> [Check In] button
   └─> [Cancel Booking] (refund flow)

3. Check-In Flow
   ├─> Option A: Scan QR Code (guest shows on phone)
   ├─> Option B: Search by name
   └─> Mark as "Arrived"
       ├─> Timestamp recorded
       └─> Notification to kitchen/host (if integrated)
```

---

### Flow 2C: Manage Tasting Experiences

```
1. Experiences Page
   ├─> List of current experiences
   │   ├─> Classic Tasting ($40, Active)
   │   ├─> Reserve Tasting ($75, Active)
   │   └─> Private Tour ($150, Inactive)
   │
   └─> [+ Create New Experience]

2. Create/Edit Experience Form
   ├─> Name
   ├─> Description (rich text)
   ├─> Upload photos
   ├─> Price
   ├─> Duration (minutes)
   ├─> Max party size
   ├─> Active/Inactive toggle
   └─> [Save]

3. Preview
   ├─> "This is how it appears to guests"
   └─> [Publish] or [Edit]
```

---

### Flow 2D: Capacity & Availability Management

```
1. Calendar View (Weekly)
   ├─> Grid showing all time slots
   ├─> Color-coded by availability:
   │   ├─> Green: Available
   │   ├─> Yellow: Partially booked
   │   └─> Red: Fully booked
   │
   └─> Click on time slot
       └─> See bookings or [Block This Slot]

2. Availability Settings
   ├─> Default capacity: 10 guests/slot
   ├─> Slot duration: 60 minutes
   ├─> Time slots per day: 10 AM - 5 PM (hourly)
   │
   ├─> Day-of-Week Overrides:
   │   ├─> Saturday: Increase to 15 guests/slot
   │   └─> Monday: Closed
   │
   └─> Date-Specific Overrides:
       ├─> Dec 25: Closed (Christmas)
       ├─> Aug 15: Private event (block all)
       └─> [+ Add Override]

3. Block Date/Time
   ├─> Select date range
   ├─> Reason (dropdown: Private Event, Maintenance, etc.)
   ├─> [Block] button
   └─> Confirmation + cancel existing bookings (with refund)
```

---

### Flow 2E: Analytics & Reporting

```
1. Analytics Dashboard
   ├─> Date range selector (Last 7 days, 30 days, Custom)
   │
   ├─> Revenue Chart (line graph)
   ├─> Bookings Chart (bar graph by day)
   ├─> Capacity Utilization (gauge)
   │
   ├─> Top Metrics Cards:
   │   ├─> Total Bookings: 142
   │   ├─> Total Revenue: $7,100
   │   ├─> Avg Party Size: 3.2
   │   ├─> Cancellation Rate: 8%
   │   └─> Repeat Customers: 22%
   │
   ├─> Customer Demographics:
   │   ├─> Age ranges (chart)
   │   ├─> Top zip codes
   │   └─> Booking lead time (avg days in advance)
   │
   └─> [Download CSV Report]
```

---

## 3. Admin User Flows

### Flow 3A: Review & Approve Winery Application

```
1. Admin Dashboard
   └─> "Pending Applications" widget (5 new)

2. Applications Queue
   ├─> List of pending wineries
   └─> Click to review

3. Application Review Page
   ├─> Winery details (name, location, contact)
   ├─> Uploaded documents (view/download)
   ├─> Stripe Connect status
   ├─> Notes field (internal)
   │
   └─> Actions:
       ├─> [Approve] → Email sent to winery
       ├─> [Reject] → Require reason → Email sent
       └─> [Request More Info] → Send message

4. Approval Confirmation
   ├─> Winery status = "Approved"
   ├─> Winery can now complete profile
   └─> Log entry created
```

---

### Flow 3B: Manage Platform Bookings

```
1. Bookings Overview
   ├─> Search bar (booking number, guest name, winery)
   ├─> Filters:
   │   ├─> Status (Confirmed, Cancelled, Completed)
   │   ├─> Date range
   │   └─> Winery
   │
   └─> Bookings table (sortable)
       ├─> Booking #
       ├─> Guest
       ├─> Winery
       ├─> Date
       ├─> Status
       └─> Actions (View, Refund, Cancel)

2. Booking Detail Page (Admin View)
   ├─> Full booking details
   ├─> Payment information
   ├─> Stripe transaction ID (link to Stripe)
   ├─> Communication log
   │
   └─> Admin Actions:
       ├─> [Issue Refund]
       ├─> [Cancel Booking]
       ├─> [Send Message to Guest]
       └─> [Contact Winery]

3. Refund Flow
   ├─> Refund amount (full or partial)
   ├─> Reason (dropdown)
   ├─> Notes
   └─> [Process Refund]
       ├─> Stripe refund initiated
       ├─> Email sent to guest
       ├─> Winery notified
       └─> Booking status updated
```

---

### Flow 3C: Platform Analytics

```
1. Analytics Dashboard
   ├─> KPI Cards (top-line metrics)
   │   ├─> Total GMV (Gross Merchandise Value)
   │   ├─> Platform Revenue
   │   ├─> Active Wineries
   │   ├─> Total Users
   │   └─> Bookings This Month
   │
   ├─> Charts:
   │   ├─> GMV over time (line chart)
   │   ├─> Bookings by region (bar chart)
   │   ├─> Top wineries by revenue (table)
   │   └─> User growth (line chart)
   │
   ├─> Regional Performance Table:
   │   ├─> Napa Valley: 50 wineries, 500 bookings, $25K GMV
   │   ├─> Sonoma: 30 wineries, 200 bookings, $10K GMV
   │   └─> ...
   │
   └─> [Export Report] (PDF or CSV)
```

---

### Flow 3D: Content Management

```
1. Content Dashboard
   ├─> Manage Regions
   ├─> Manage Car Services
   ├─> Manage Hotels
   └─> Moderate Reviews

2. Manage Regions
   ├─> List of regions (sortable by display order)
   └─> [+ Add New Region]
       ├─> Name, slug, description
       ├─> Upload hero image
       ├─> Set latitude/longitude
       ├─> Display order
       └─> [Save]

3. Moderate Reviews (if moderation enabled)
   ├─> Pending reviews queue
   ├─> Review content + rating
   ├─> Associated winery & user
   │
   └─> Actions:
       ├─> [Approve] → Goes live
       ├─> [Reject] → Provide reason
       └─> [Flag for Investigation] → Escalate
```

---

## 4. Key UX Patterns & Components

### Navigation Structure

**Public Site:**
```
Header:
- Logo (home link)
- Regions (dropdown mega-menu)
- How It Works
- For Wineries
- Search icon
- Login / Sign Up (or Profile icon if logged in)

Footer:
- About
- Contact
- Blog
- Privacy Policy
- Terms of Service
- Social links
```

**User Portal:**
```
Sidebar:
- My Bookings
- Favorites
- Profile Settings
- Logout
```

**Winery Portal:**
```
Sidebar:
- Dashboard
- Reservations
- Calendar
- Experiences
- Profile
- Analytics
- Settings
- Help
```

**Admin Portal:**
```
Sidebar:
- Overview
- Wineries
- Users
- Bookings
- Analytics
- Content
- Settings
```

---

### Critical UI Components

#### Availability Calendar Component
```
- Month view with selectable dates
- Disabled past dates
- Visual indicators:
  - Green dot: Available
  - Yellow dot: Limited availability
  - Red X: Fully booked
  - Gray: Closed/unavailable
- Click date → Show time slots
```

#### Time Slot Selector
```
- Grid or list of time slots
- Each slot shows:
  - Time (e.g., "2:00 PM")
  - Availability count (e.g., "4 spots left")
- Sold out slots grayed out
- Selected slot highlighted
```

#### Booking Summary Card (Sticky)
```
- Winery name
- Tasting experience
- Date & time
- Party size
- Price breakdown:
  - Experience: $50 × 2 = $100
  - Total: $100
- [Modify] or [Cancel] link
```

#### Review Card
```
- User avatar (or initials)
- Username
- Star rating (1-5)
- Date visited
- Review title
- Review text (truncated with "Read more")
- Photos (if uploaded)
- Helpful votes (optional for later)
```

---

## 5. Mobile-Specific Considerations

### Mobile Booking Flow Optimizations
1. **Single-column layout** - no sidebars
2. **Sticky CTA button** - "Book Now" always visible
3. **Simplified filters** - drawer/modal instead of sidebar
4. **Thumb-friendly tap targets** - min 44×44px
5. **Auto-advance forms** - move to next field automatically
6. **Mobile payment optimization** - Apple Pay / Google Pay support

### Mobile Winery Portal
1. **Bottom navigation** - easier thumb reach
2. **Swipe gestures** - swipe between tabs
3. **QR scanner integration** - native camera for check-ins
4. **Push notifications** - new booking alerts

---

## 6. Edge Cases & Error Handling

### Booking Conflicts
**Scenario**: User tries to book a slot that just filled up

**Solution**:
1. Real-time availability check before payment
2. If slot filled:
   - Show error message: "Sorry, this slot just filled up"
   - Suggest alternative times
   - Allow user to select new slot without re-entering info

### Payment Failures
**Scenario**: Stripe payment declined

**Solution**:
1. Display clear error message (from Stripe)
2. Suggest fixes:
   - Check card details
   - Try different card
   - Contact bank
3. Hold booking for 10 minutes (soft reservation)
4. Email user with retry link

### Last-Minute Cancellations
**Scenario**: User cancels within 24 hours

**Solution**:
1. Show cancellation policy before confirming
2. Calculate refund amount (e.g., 50% if <24hrs)
3. Require confirmation: "You'll receive a 50% refund. Continue?"
4. Process refund immediately
5. Notify winery of cancellation

### No-Shows
**Scenario**: Guest doesn't arrive for reservation

**Solution**:
1. Winery marks as "No Show" in portal
2. Funds still transferred to winery (policy enforced)
3. User can dispute within 48 hours if error
4. Admin can review disputes and issue refunds if valid

---

## 7. Accessibility (a11y) Requirements

- **Keyboard navigation**: All actions accessible via keyboard
- **Screen reader support**: Proper ARIA labels, semantic HTML
- **Color contrast**: WCAG AA compliance (4.5:1 minimum)
- **Focus indicators**: Clear visual focus states
- **Alt text**: All images have descriptive alt text
- **Form labels**: Every input has associated label
- **Error messages**: Clear, actionable error text

---

## 8. Performance Budgets

### Page Load Targets
- **Homepage**: < 1.5s (desktop), < 2.5s (mobile)
- **Winery listing**: < 2s
- **Winery detail**: < 2s
- **Booking flow**: < 1s per step

### Core Web Vitals Goals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Image Optimization
- Use Next.js Image component (auto WebP/AVIF)
- Lazy load below-the-fold images
- Responsive images (srcset)
- Max image size: 1MB per image

---

## Next Steps for Design

1. **Wireframes**: Create low-fidelity wireframes for key flows
2. **Design System**: Establish color palette, typography, spacing
3. **High-Fidelity Mockups**: Design main pages in Figma
4. **Prototype**: Create interactive prototype for user testing
5. **User Testing**: Test with 5-10 wine tourists and winery owners
6. **Iterate**: Refine based on feedback
7. **Developer Handoff**: Prepare design specs and assets

---

## Questions for Design Validation

1. **Booking flow length**: Is 4 steps too many? Can we combine date/time with experience?
2. **Filter complexity**: How many filters before users get overwhelmed?
3. **Photo gallery**: Fullscreen modal or inline carousel?
4. **Reviews**: Show all reviews or paginate? Sort by date or helpfulness?
5. **Mobile navigation**: Bottom nav bar or hamburger menu?
6. **Winery dashboard**: Calendar view or list view as default?
7. **Onboarding**: Guided tour or discovery-based for winery portal?
