// ============================================
// Innovation Music CMS — Supabase型定義
// ============================================

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
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          body: string | null
          excerpt: string | null
          type: 'blog' | 'news'
          status: 'draft' | 'published' | 'archived'
          thumbnail: string | null
          author_id: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          body?: string | null
          excerpt?: string | null
          type?: 'blog' | 'news'
          status?: 'draft' | 'published' | 'archived'
          thumbnail?: string | null
          author_id?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          body?: string | null
          excerpt?: string | null
          type?: 'blog' | 'news'
          status?: 'draft' | 'published' | 'archived'
          thumbnail?: string | null
          author_id?: string | null
          published_at?: string | null
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          type: 'blog' | 'news' | 'both'
        }
        Insert: {
          id?: string
          name: string
          slug: string
          type?: 'blog' | 'news' | 'both'
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          type?: 'blog' | 'news' | 'both'
        }
      }
      post_categories: {
        Row: {
          post_id: string
          category_id: string
        }
        Insert: {
          post_id: string
          category_id: string
        }
        Update: {
          post_id?: string
          category_id?: string
        }
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
      }
    }
  }
}

// 便利な型エイリアス
export type Post = Database['public']['Tables']['posts']['Row']
export type PostInsert = Database['public']['Tables']['posts']['Insert']
export type PostUpdate = Database['public']['Tables']['posts']['Update']
export type Category = Database['public']['Tables']['categories']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ContactMessage = Database['public']['Tables']['contact_messages']['Row']
export type Media = Database['public']['Tables']['media']['Row']
