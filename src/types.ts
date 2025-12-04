// types.ts

export interface JournalEntry {
  // Identifiers
  id: string;          // Firestore Document ID
  userId: string;      // Crucial for security rules (so only she sees her data)

  // Core Content
  text: string;        // HTML or Markdown from the editor
  photos: string[];    // Array of public Firebase Storage URLs

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

