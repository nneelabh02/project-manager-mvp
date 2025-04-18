export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          user_id: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          user_id: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          user_id?: string
          updated_at?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          status: string
          project_id: string
          user_id: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          status?: string
          project_id: string
          user_id: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          status?: string
          project_id?: string
          user_id?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 