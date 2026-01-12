// Core domain types for the wine tourism platform

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'WINERY_OWNER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface Region {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  state: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Winery {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string;
  website: string | null;
  regionId: string;
  stripeAccountId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TastingExperience {
  id: string;
  wineryId: string;
  name: string;
  description: string | null;
  priceInCents: number;
  durationMinutes: number;
  maxPartySize: number;
  minPartySize: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  userId: string;
  wineryId: string;
  tastingExperienceId: string;
  bookingDate: Date;
  startTime: string; // Format: "HH:MM"
  partySize: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  totalAmountCents: number;
  platformFeeCents: number;
  stripePaymentIntentId: string | null;
  specialRequests: string | null;
  checkedInAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperatingHours {
  id: string;
  wineryId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  openTime: string; // Format: "HH:MM"
  closeTime: string; // Format: "HH:MM"
  isClosed: boolean;
}

export interface CapacitySetting {
  id: string;
  wineryId: string;
  maxGuestsPerSlot: number;
  slotIntervalMinutes: number;
  bufferMinutes: number;
  advanceBookingDays: number;
  minimumAdvanceHours: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form types
export interface BookingFormData {
  tastingExperienceId: string;
  bookingDate: Date;
  startTime: string;
  partySize: number;
  specialRequests?: string;
}

export interface WineryOnboardingData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  regionId: string;
}

// Wine Club Management types

export interface WineClub {
  id: string;
  wineryId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MembershipTier {
  id: string;
  wineClubId: string;
  name: string;
  description: string | null;
  priceInCents: number;
  billingFrequency: 'MONTHLY' | 'QUARTERLY' | 'BIANNUAL' | 'ANNUAL';
  bottlesPerShipment: number;
  shipmentsPerYear: number;
  discountPercent: number;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WineClubMembership {
  id: string;
  userId: string;
  wineClubId: string;
  tierId: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'PAST_DUE';
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingPhone: string | null;
  startDate: Date;
  nextBillingDate: Date | null;
  pausedUntil: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  referredBy: string | null;
  referralCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Shipment {
  id: string;
  wineClubId: string;
  name: string;
  scheduledDate: Date;
  description: string | null;
  status: 'SCHEDULED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'SKIPPED';
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipmentMembership {
  id: string;
  shipmentId: string;
  membershipId: string;
  status: 'SCHEDULED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'SKIPPED';
  isSkipped: boolean;
  skippedReason: string | null;
  trackingNumber: string | null;
  carrier: string | null;
  shippedDate: Date | null;
  deliveredDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipmentItem {
  id: string;
  shipmentId: string;
  wineName: string;
  vintage: string | null;
  varietal: string | null;
  quantity: number;
  bottleImageUrl: string | null;
  description: string | null;
}

// Member Portal types
export interface MemberDashboardData {
  membership: WineClubMembership;
  winery: Winery;
  tier: MembershipTier;
  upcomingShipments: ShipmentWithDetails[];
  pastShipments: ShipmentWithDetails[];
}

export interface ShipmentWithDetails extends Shipment {
  items: ShipmentItem[];
  membershipDetails: ShipmentMembership;
}

// Form types for wine club
export interface MembershipSignupData {
  tierId: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingPhone?: string;
  referralCode?: string;
}
