import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string; full_name: string; avatar_url: string | null; plan: 'free'|'creator'|'studio'; created_at: string }
        Insert: { id: string; email: string; full_name: string }
        Update: { full_name?: string; avatar_url?: string; plan?: string }
      }
      projects: {
        Row: {
          id: string; user_id: string; title: string; status: 'uploading'|'processing'|'ready'|'failed'
          original_url: string | null; duration: number | null; viral_score: number | null
          shorts_count: number; created_at: string; updated_at: string
        }
        Insert: { user_id: string; title: string; status?: string }
        Update: { title?: string; status?: string; viral_score?: number; shorts_count?: number }
      }
      shorts: {
        Row: {
          id: string; project_id: string; user_id: string; title: string
          video_url: string; thumbnail_url: string | null; platform: string
          viral_score: number; duration: number; status: string; created_at: string
        }
        Insert: { project_id: string; user_id: string; title: string; video_url: string; platform: string }
        Update: { thumbnail_url?: string; viral_score?: number; status?: string }
      }
    }
  }
}
