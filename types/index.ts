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
