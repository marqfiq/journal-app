// types.ts
import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;

  // Access & Subscription Fields
  trial_start_at?: Timestamp | null;
  trial_end_at?: Timestamp | null;
  subscription_status?: 'none' | 'trialing' | 'active' | 'expired' | 'canceled';
  has_written_first_entry?: boolean;
  pro_override?: boolean;

  // Stripe Fields (Future)
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  stripeCurrentPeriodEnd?: Timestamp | null;
  stripeCancelAtPeriodEnd?: boolean;

  // Account Management
  scheduledForDeletionAt?: Timestamp | null;
}

export interface JournalEntry {
  // Identifiers
  id: string;          // Firestore Document ID
  userId: string;      // Crucial for security rules (so only she sees her data)

  // Core Content
  text: string;        // HTML or Markdown from the editor


  // Time & Search
  date: number;        // Unix Timestamp (ms). Single source of truth for time.
  dayKey: string;      // "MM-DD" (e.g., "11-24"). CRITICAL for "On This Day" queries.

  // Metadata (Grouped for cleaner React props)
  mood: number;        // 0-5 or 1-10 scale

  // New fields for enhancements
  sticker_id?: string | null; // ID of the selected sticker
  image_urls?: string[]; // Additional images

  weather?: {          // Optional, as not every entry has weather
    temperature: number;
    condition: string; // e.g. "Broken Clouds"
    icon?: string;     // Keep the legacy icon code or map to a new one
  };

  location?: {         // Optional
    address: string;
    lat: number;
    lng: number;       // Note: Standardize on 'lng' or 'lon'. Google Maps uses 'lng'.
  };

  // Fun extras
  tags: string[];
  music?: {            // Optional legacy data
    artist: string;
    title: string;
  };
}

export interface Sticker {
  id: string;
  url: string;
  owner_id: string; // 'system' or userId
}

export interface BackLocationState {
  from: string; // '/journal', '/calendar', '/search', '/'
  label: string; // 'Journal', 'Calendar', 'Search', 'Home'
  context?: {
    // Journal context
    selectedEntryId?: string;

    // Calendar context
    date?: number; // timestamp
    view?: 'month' | 'year';

    // Search context
    query?: string;
    scrollPosition?: number;
  };
}

