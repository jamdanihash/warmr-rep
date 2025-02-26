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
      connections: {
        Row: {
          id: string
          requester_id: string
          recipient_id: string
          status: 'pending' | 'accepted' | 'declined'
          request_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          recipient_id: string
          status: 'pending' | 'accepted' | 'declined'
          request_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          recipient_id?: string
          status?: 'pending' | 'accepted' | 'declined'
          request_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          thread_id: string
          sender_id: string
          recipient_id: string
          content: string
          is_read: boolean
          created_at: string
          updated_at: string
          reply_to_id: string | null
        }
        Insert: {
          id?: string
          thread_id?: string
          sender_id: string
          recipient_id: string
          content: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
          reply_to_id?: string | null
        }
        Update: {
          id?: string
          thread_id?: string
          sender_id?: string
          recipient_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
          reply_to_id?: string | null
        }
      }
      user_settings: {
        Row: {
          user_id: string
          email_notifications: boolean
          in_app_notifications: boolean
          sound_enabled: boolean
          show_read_receipts: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          email_notifications?: boolean
          in_app_notifications?: boolean
          sound_enabled?: boolean
          show_read_receipts?: boolean
          updated_at?: string
        }
        Update: {
          user_id?: string
          email_notifications?: boolean
          in_app_notifications?: boolean
          sound_enabled?: boolean
          show_read_receipts?: boolean
          updated_at?: string
        }
      }
    }
  }
}