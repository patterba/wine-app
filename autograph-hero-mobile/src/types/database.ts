export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string;
          name: string;
          category: string;
          city: string | null;
          logo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          city?: string | null;
          logo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          city?: string | null;
          logo_url?: string | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          location_lat: number | null;
          location_lng: number | null;
          alert_radius_mi: number;
          push_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          alert_radius_mi?: number;
          push_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          alert_radius_mi?: number;
          push_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      signers: {
        Row: {
          id: string;
          name: string;
          normalized_name: string;
          sport: string | null;
          team_id: string | null;
          image_url: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          normalized_name: string;
          sport?: string | null;
          team_id?: string | null;
          image_url?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          normalized_name?: string;
          sport?: string | null;
          team_id?: string | null;
          image_url?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          signer_id: string | null;
          venue_name: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          lat: number | null;
          lng: number | null;
          event_date: string;
          start_time: string | null;
          end_time: string | null;
          is_free: boolean;
          price_min: number | null;
          price_max: number | null;
          ticket_url: string | null;
          source: string;
          source_url: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          signer_id?: string | null;
          venue_name?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          lat?: number | null;
          lng?: number | null;
          event_date: string;
          start_time?: string | null;
          end_time?: string | null;
          is_free?: boolean;
          price_min?: number | null;
          price_max?: number | null;
          ticket_url?: string | null;
          source: string;
          source_url?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          signer_id?: string | null;
          venue_name?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          lat?: number | null;
          lng?: number | null;
          event_date?: string;
          start_time?: string | null;
          end_time?: string | null;
          is_free?: boolean;
          price_min?: number | null;
          price_max?: number | null;
          ticket_url?: string | null;
          source?: string;
          source_url?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_favorite_signers: {
        Row: {
          user_id: string;
          signer_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          signer_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          signer_id?: string;
          created_at?: string;
        };
      };
      user_favorite_teams: {
        Row: {
          user_id: string;
          team_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          team_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          team_id?: string;
          created_at?: string;
        };
      };
      notifications_sent: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          sent_at: string;
          opened: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          sent_at?: string;
          opened?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string;
          sent_at?: string;
          opened?: boolean;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Convenience type aliases
export type Team = Database['public']['Tables']['teams']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Signer = Database['public']['Tables']['signers']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type UserFavoriteSigner = Database['public']['Tables']['user_favorite_signers']['Row'];
export type UserFavoriteTeam = Database['public']['Tables']['user_favorite_teams']['Row'];
export type NotificationSent = Database['public']['Tables']['notifications_sent']['Row'];
