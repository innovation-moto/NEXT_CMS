// ============================================
// Innovation Music CMS — Supabase型定義
// @supabase/supabase-js v2 が期待する完全な形式
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          body: string | null
          excerpt: string | null
          type: string
          status: 'draft' | 'published' | 'archived'
          thumbnail: string | null
          author_id: string | null
          category_id: string | null
          notion_page_id: string | null
          published_at: string | null
          meta: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          body?: string | null
          excerpt?: string | null
          type?: string
          status?: 'draft' | 'published' | 'archived'
          thumbnail?: string | null
          author_id?: string | null
          category_id?: string | null
          notion_page_id?: string | null
          published_at?: string | null
          meta?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          body?: string | null
          excerpt?: string | null
          type?: string
          status?: 'draft' | 'published' | 'archived'
          thumbnail?: string | null
          author_id?: string | null
          category_id?: string | null
          notion_page_id?: string | null
          published_at?: string | null
          meta?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          type: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          slug: string
          type?: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          type?: string
          sort_order?: number
        }
        Relationships: []
      }
      sections: {
        Row: {
          id: string
          name: string
          label: string
          icon: string
          sort_order: number
          show_in_nav: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          label: string
          icon?: string
          sort_order?: number
          show_in_nav?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          label?: string
          icon?: string
          sort_order?: number
          show_in_nav?: boolean
        }
        Relationships: []
      }
      notion_config: {
        Row: {
          id: string
          api_key: string | null
          databases: Json
          updated_at: string
        }
        Insert: {
          id?: string
          api_key?: string | null
          databases?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          api_key?: string | null
          databases?: Json
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'editor'
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'editor'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'editor'
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          subject: string | null
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          subject?: string | null
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          subject?: string | null
          message?: string
          is_read?: boolean
        }
        Relationships: []
      }
      media: {
        Row: {
          id: string
          filename: string
          url: string
          size: number | null
          mime_type: string | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          filename: string
          url: string
          size?: number | null
          mime_type?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          filename?: string
          url?: string
          size?: number | null
          mime_type?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// 便利な型エイリアス
export type Post = Database['public']['Tables']['posts']['Row']
export type PostInsert = Database['public']['Tables']['posts']['Insert']
export type PostUpdate = Database['public']['Tables']['posts']['Update']
export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ContactMessage = Database['public']['Tables']['contact_messages']['Row']
export type Media = Database['public']['Tables']['media']['Row']
export type Section = Database['public']['Tables']['sections']['Row']
