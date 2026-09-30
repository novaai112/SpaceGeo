import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://nvcccxvkntntwgjknlux.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52Y2NjeHZrbnRudHdnamtubHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NzM1MDQsImV4cCI6MjEwNjI0OTUwNH0.XnmbwqM6iq_SsLxjdpbsRpFaYiikYPkdgu2ZPD9cqts"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      chat_sessions: {
        Row: {
          id: string
          user_id: string | null
          title: string
          cad_software: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          cad_software: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          cad_software?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          role: "user" | "assistant"
          content: string
          image_data: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: "user" | "assistant"
          content: string
          image_data?: string | null
          created_at?: string
        }
        Update: {
          content?: string
        }
      }
      daily_usage: {
        Row: {
          id: string
          user_id: string | null
          date: string
          requests_count: number
          daily_limit: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          date: string
          requests_count?: number
          daily_limit?: number
          created_at?: string
        }
        Update: {
          requests_count?: number
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string | null
          cad_software: string
          theme: string
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          cad_software?: string
          theme?: string
          language?: string
        }
        Update: {
          cad_software?: string
          theme?: string
          language?: string
          updated_at?: string
        }
      }
    }
  }
}
