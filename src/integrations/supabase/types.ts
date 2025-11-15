export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ad_settings: {
        Row: {
          ad_cost_banner: number | null
          ad_cost_native: number | null
          ad_cost_slider: number | null
          created_at: string | null
          id: string
          max_ads_per_user: number | null
          min_wallet_balance: number | null
          updated_at: string | null
        }
        Insert: {
          ad_cost_banner?: number | null
          ad_cost_native?: number | null
          ad_cost_slider?: number | null
          created_at?: string | null
          id?: string
          max_ads_per_user?: number | null
          min_wallet_balance?: number | null
          updated_at?: string | null
        }
        Update: {
          ad_cost_banner?: number | null
          ad_cost_native?: number | null
          ad_cost_slider?: number | null
          created_at?: string | null
          id?: string
          max_ads_per_user?: number | null
          min_wallet_balance?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_published: boolean
          priority: string
          published_at: string | null
          summary: string | null
          target_audience: string[] | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_published?: boolean
          priority?: string
          published_at?: string | null
          summary?: string | null
          target_audience?: string[] | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_published?: boolean
          priority?: string
          published_at?: string | null
          summary?: string | null
          target_audience?: string[] | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      anonymous_messages: {
        Row: {
          content: string
          created_at: string
          expires_at: string
          id: string
          sender_email: string
        }
        Insert: {
          content: string
          created_at?: string
          expires_at?: string
          id?: string
          sender_email: string
        }
        Update: {
          content?: string
          created_at?: string
          expires_at?: string
          id?: string
          sender_email?: string
        }
        Relationships: []
      }
      anonymous_page_analytics: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          ip_address: unknown
          page_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: unknown
          page_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          page_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_page_analytics_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "anonymous_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_pages: {
        Row: {
          created_at: string
          email: string
          expires_at: string | null
          id: string
          page_name: string
          page_token: string
          public_link: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          page_name: string
          page_token: string
          public_link?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          page_name?: string
          page_token?: string
          public_link?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      anonymous_submissions: {
        Row: {
          content: string
          created_at: string
          expires_at: string | null
          id: string
          is_paid: boolean
          media_paid: boolean | null
          media_url: string | null
          page_id: string
        }
        Insert: {
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_paid?: boolean
          media_paid?: boolean | null
          media_url?: string | null
          page_id: string
        }
        Update: {
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_paid?: boolean
          media_paid?: boolean | null
          media_url?: string | null
          page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_submissions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "anonymous_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_anonymous_submissions_page"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "anonymous_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          published: boolean
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_links: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          type?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          type?: string
          url?: string
        }
        Relationships: []
      }
      community_messages: {
        Row: {
          content: string
          created_at: string
          edited_at: string | null
          id: string
          image_url: string | null
          is_anonymous: boolean | null
          is_pinned: boolean | null
          mentions: string[] | null
          parent_id: string | null
          topic: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          edited_at?: string | null
          id?: string
          image_url?: string | null
          is_anonymous?: boolean | null
          is_pinned?: boolean | null
          mentions?: string[] | null
          parent_id?: string | null
          topic?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          image_url?: string | null
          is_anonymous?: boolean | null
          is_pinned?: boolean | null
          mentions?: string[] | null
          parent_id?: string | null
          topic?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          code: string
          created_at: string
          credit_units: number
          department_id: string
          description: string
          id: string
          image_url: string | null
          level: number
          semester: string
          title: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          credit_units: number
          department_id: string
          description: string
          id?: string
          image_url?: string | null
          level: number
          semester: string
          title: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          credit_units?: number
          department_id?: string
          description?: string
          id?: string
          image_url?: string | null
          level?: number
          semester?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_links: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          url: string
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          url: string
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          campus: string | null
          created_at: string
          description: string | null
          faculty_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          campus?: string | null
          created_at?: string
          description?: string | null
          faculty_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          campus?: string | null
          created_at?: string
          description?: string | null
          faculty_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_departments_faculty"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      event_analytics: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          revenue: number | null
          tickets_sold: number | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          revenue?: number | null
          tickets_sold?: number | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          revenue?: number | null
          tickets_sold?: number | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_analytics_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tickets: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          is_active: boolean
          price: number
          quantity_sold: number
          quantity_total: number
          ticket_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          is_active?: boolean
          price?: number
          quantity_sold?: number
          quantity_total?: number
          ticket_type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          is_active?: boolean
          price?: number
          quantity_sold?: number
          quantity_total?: number
          ticket_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          event_date: string
          event_type: string
          gallery: string[] | null
          id: string
          image_url: string | null
          location: string
          max_tickets: number | null
          price: number | null
          published: boolean
          requires_tickets: boolean | null
          slug: string | null
          ticket_price: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          event_date: string
          event_type: string
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          location: string
          max_tickets?: number | null
          price?: number | null
          published?: boolean
          requires_tickets?: boolean | null
          slug?: string | null
          ticket_price?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          event_date?: string
          event_type?: string
          gallery?: string[] | null
          id?: string
          image_url?: string | null
          location?: string
          max_tickets?: number | null
          price?: number | null
          published?: boolean
          requires_tickets?: boolean | null
          slug?: string | null
          ticket_price?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          course_code: string
          course_title: string
          created_at: string
          department: string
          exam_date: string
          exam_time: string
          exam_type: string
          id: string
          level: number
          status: string
          updated_at: string
          venue: string
        }
        Insert: {
          course_code: string
          course_title: string
          created_at?: string
          department: string
          exam_date: string
          exam_time: string
          exam_type?: string
          id?: string
          level: number
          status?: string
          updated_at?: string
          venue: string
        }
        Update: {
          course_code?: string
          course_title?: string
          created_at?: string
          department?: string
          exam_date?: string
          exam_time?: string
          exam_type?: string
          id?: string
          level?: number
          status?: string
          updated_at?: string
          venue?: string
        }
        Relationships: []
      }
      faculties: {
        Row: {
          campus: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          campus?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          campus?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      file_uploads: {
        Row: {
          created_at: string
          file_path: string
          file_size: number
          filename: string
          id: string
          is_public: boolean | null
          mime_type: string
          original_filename: string
          upload_context: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size: number
          filename: string
          id?: string
          is_public?: boolean | null
          mime_type: string
          original_filename: string
          upload_context?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number
          filename?: string
          id?: string
          is_public?: boolean | null
          mime_type?: string
          original_filename?: string
          upload_context?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      lectures: {
        Row: {
          academic_year: string
          campus: string
          color: string
          day: string
          department: string
          faculty: string
          id: number
          lecturer: string | null
          level: number
          room: string
          semester: string
          subject: string
          time: string
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          campus: string
          color?: string
          day: string
          department: string
          faculty: string
          id?: number
          lecturer?: string | null
          level: number
          room: string
          semester: string
          subject: string
          time: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          campus?: string
          color?: string
          day?: string
          department?: string
          faculty?: string
          id?: number
          lecturer?: string | null
          level?: number
          room?: string
          semester?: string
          subject?: string
          time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lost_and_found: {
        Row: {
          campus: string
          category: string
          contact_info: string | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          item_type: string
          location: string
          status: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          campus: string
          category: string
          contact_info?: string | null
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          item_type: string
          location: string
          status?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          campus?: string
          category?: string
          contact_info?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          item_type?: string
          location?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lost_and_found_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      message_ads: {
        Row: {
          ad_type: string
          clicks: number | null
          cost: number
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          impressions: number | null
          is_active: boolean | null
          link_preview_data: Json | null
          link_url: string
          message_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ad_type: string
          clicks?: number | null
          cost?: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          is_active?: boolean | null
          link_preview_data?: Json | null
          link_url: string
          message_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ad_type?: string
          clicks?: number | null
          cost?: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          is_active?: boolean | null
          link_preview_data?: Json | null
          link_url?: string
          message_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_ads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "community_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          id: string
          message_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "community_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_read_status: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_read_status_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "community_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          link: string | null
          message: string
          start_date: string | null
          target_audience: string[] | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          link?: string | null
          message: string
          start_date?: string | null
          target_audience?: string[] | null
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          link?: string | null
          message?: string
          start_date?: string | null
          target_audience?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      party_orders: {
        Row: {
          amount: number
          created_at: string
          email: string
          event_id: string | null
          full_name: string
          id: string
          payment_method: string | null
          payment_status: string | null
          phone: string | null
          ticket_count: number | null
          ticket_type: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          email: string
          event_id?: string | null
          full_name: string
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          phone?: string | null
          ticket_count?: number | null
          ticket_type?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          email?: string
          event_id?: string | null
          full_name?: string
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          phone?: string | null
          ticket_count?: number | null
          ticket_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_gateway_config: {
        Row: {
          business_name: string | null
          created_at: string | null
          enabled: boolean
          environment: string
          id: string
          provider: string
          public_key: string
          updated_at: string | null
          webhook_url: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          enabled?: boolean
          environment?: string
          id?: string
          provider: string
          public_key: string
          updated_at?: string | null
          webhook_url: string
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          enabled?: boolean
          environment?: string
          id?: string
          provider?: string
          public_key?: string
          updated_at?: string | null
          webhook_url?: string
        }
        Relationships: []
      }
      payment_gateways: {
        Row: {
          business_name: string | null
          created_at: string | null
          enabled: boolean
          encryption_key: string | null
          id: string
          merchant_id: string | null
          mode: string
          provider: string
          public_key: string
          secret_key: string
          updated_at: string | null
          webhook_url: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          enabled?: boolean
          encryption_key?: string | null
          id?: string
          merchant_id?: string | null
          mode?: string
          provider: string
          public_key: string
          secret_key: string
          updated_at?: string | null
          webhook_url: string
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          enabled?: boolean
          encryption_key?: string | null
          id?: string
          merchant_id?: string | null
          mode?: string
          provider?: string
          public_key?: string
          secret_key?: string
          updated_at?: string | null
          webhook_url?: string
        }
        Relationships: []
      }
      payment_providers: {
        Row: {
          config: Json
          created_at: string | null
          environment: string | null
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          environment?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          environment?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          created_at: string | null
          id: string
          payment_id: string | null
          provider: string
          provider_reference: string | null
          status: string | null
          verified_at: string | null
          webhook_data: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_id?: string | null
          provider: string
          provider_reference?: string | null
          status?: string | null
          verified_at?: string | null
          webhook_data?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_id?: string | null
          provider?: string
          provider_reference?: string | null
          status?: string | null
          verified_at?: string | null
          webhook_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          email: string
          full_name: string
          id: string
          metadata: Json | null
          payment_method: string | null
          payment_reference: string
          payment_status: string | null
          payment_type: string
          phone: string | null
          transaction_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          email: string
          full_name: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_reference: string
          payment_status?: string | null
          payment_type: string
          phone?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_reference?: string
          payment_status?: string | null
          payment_type?: string
          phone?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          campus: string | null
          created_at: string
          department: string | null
          email: string
          faculty: string | null
          full_name: string
          id: string
          level: number | null
          phone: string | null
          reg_number: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          campus?: string | null
          created_at?: string
          department?: string | null
          email: string
          faculty?: string | null
          full_name: string
          id: string
          level?: number | null
          phone?: string | null
          reg_number?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          campus?: string | null
          created_at?: string
          department?: string | null
          email?: string
          faculty?: string | null
          full_name?: string
          id?: string
          level?: number | null
          phone?: string | null
          reg_number?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          certifications: Json | null
          created_at: string
          education: Json
          email: string
          experience: Json
          full_name: string
          id: string
          objective: string | null
          pdf_url: string | null
          phone: string | null
          skills: string[]
          updated_at: string
        }
        Insert: {
          certifications?: Json | null
          created_at?: string
          education: Json
          email: string
          experience: Json
          full_name: string
          id?: string
          objective?: string | null
          pdf_url?: string | null
          phone?: string | null
          skills: string[]
          updated_at?: string
        }
        Update: {
          certifications?: Json | null
          created_at?: string
          education?: Json
          email?: string
          experience?: Json
          full_name?: string
          id?: string
          objective?: string | null
          pdf_url?: string | null
          phone?: string | null
          skills?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      role_requests: {
        Row: {
          created_at: string
          department_id: string | null
          faculty_id: string | null
          id: string
          justification: string | null
          level: number | null
          requested_role: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          faculty_id?: string | null
          id?: string
          justification?: string | null
          level?: number | null
          requested_role: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          faculty_id?: string | null
          id?: string
          justification?: string | null
          level?: number | null
          requested_role?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_requests_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_requests_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
        ]
      }
      system_configurations: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_encrypted: boolean | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      system_health: {
        Row: {
          id: string
          metric_name: string
          metric_unit: string | null
          metric_value: number
          recorded_at: string
          status: string | null
          threshold_critical: number | null
          threshold_warning: number | null
        }
        Insert: {
          id?: string
          metric_name: string
          metric_unit?: string | null
          metric_value: number
          recorded_at?: string
          status?: string | null
          threshold_critical?: number | null
          threshold_warning?: number | null
        }
        Update: {
          id?: string
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number
          recorded_at?: string
          status?: string | null
          threshold_critical?: number | null
          threshold_warning?: number | null
        }
        Relationships: []
      }
      system_reports: {
        Row: {
          created_at: string
          data: Json
          description: string | null
          expires_at: string | null
          generated_by: string | null
          id: string
          report_type: string
          title: string
        }
        Insert: {
          created_at?: string
          data: Json
          description?: string | null
          expires_at?: string | null
          generated_by?: string | null
          id?: string
          report_type: string
          title: string
        }
        Update: {
          created_at?: string
          data?: Json
          description?: string | null
          expires_at?: string | null
          generated_by?: string | null
          id?: string
          report_type?: string
          title?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          created_at: string
          email: string
          event_id: string | null
          full_name: string
          id: string
          is_used: boolean | null
          order_id: string | null
          phone: string | null
          qr_code: string | null
          recovery_token: string | null
          status: string | null
          ticket_code: string
          ticket_id: string | null
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          event_id?: string | null
          full_name: string
          id?: string
          is_used?: boolean | null
          order_id?: string | null
          phone?: string | null
          qr_code?: string | null
          recovery_token?: string | null
          status?: string | null
          ticket_code: string
          ticket_id?: string | null
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          event_id?: string | null
          full_name?: string
          id?: string
          is_used?: boolean | null
          order_id?: string | null
          phone?: string | null
          qr_code?: string | null
          recovery_token?: string | null
          status?: string | null
          ticket_code?: string
          ticket_id?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "party_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mfa: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          secret: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          secret: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          secret?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          department_id: string | null
          faculty_id: string | null
          id: string
          level: number | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          faculty_id?: string | null
          id?: string
          level?: number | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          faculty_id?: string | null
          id?: string
          level?: number | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_activity: string | null
          session_token: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          campus: string | null
          created_at: string
          department: string | null
          email: string
          faculty: string | null
          full_name: string | null
          id: string
          level: number | null
          phone: string | null
          reg_number: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          campus?: string | null
          created_at?: string
          department?: string | null
          email: string
          faculty?: string | null
          full_name?: string | null
          id: string
          level?: number | null
          phone?: string | null
          reg_number?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          campus?: string | null
          created_at?: string
          department?: string | null
          email?: string
          faculty?: string | null
          full_name?: string | null
          id?: string
          level?: number | null
          phone?: string | null
          reg_number?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          event_id: string | null
          id: string
          metadata: Json | null
          reference: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          event_id?: string | null
          id?: string
          metadata?: Json | null
          reference?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          event_id?: string | null
          id?: string
          metadata?: Json | null
          reference?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_anonymous_data: { Args: never; Returns: undefined }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      generate_short_link: { Args: never; Returns: string }
      generate_unique_public_link: { Args: never; Returns: string }
      get_current_user_role: { Args: never; Returns: string }
      get_faculty_id: { Args: { faculty_name: string }; Returns: string }
      get_user_roles: { Args: { user_uuid?: string }; Returns: string[] }
      has_role: {
        Args: { check_role: string; user_uuid?: string }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          action_type: string
          details?: Json
          record_id?: string
          table_name: string
        }
        Returns: undefined
      }
      migrate_payment_gateways: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
