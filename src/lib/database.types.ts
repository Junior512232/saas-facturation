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
      profiles: {
        Row: {
          id: string
          company_name: string
          email: string
          phone: string | null
          ninea: string | null
          role: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          company_name: string
          email: string
          phone?: string | null
          ninea?: string | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_name?: string
          email?: string
          phone?: string | null
          ninea?: string | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      clients: {
        Row: {
          id: string
          profile_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          ninea: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          ninea?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          ninea?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      invoices: {
        Row: {
          id: string
          profile_id: string
          client_id: string | null
          invoice_number: string
          status: string | null
          issue_date: string
          due_date: string | null
          subtotal: number | null
          tax_amount: number | null
          total: number | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          client_id?: string | null
          invoice_number: string
          status?: string | null
          issue_date?: string
          due_date?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          client_id?: string | null
          invoice_number?: string
          status?: string | null
          issue_date?: string
          due_date?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number | null
          unit_price: number
          amount: number
          created_at: string | null
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity?: number | null
          unit_price: number
          amount: number
          created_at?: string | null
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number | null
          unit_price?: number
          amount?: number
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: string
          invoice_id: string
          profile_id: string
          amount: number
          payment_method: string | null
          transaction_id: string | null
          payment_date: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          invoice_id: string
          profile_id: string
          amount: number
          payment_method?: string | null
          transaction_id?: string | null
          payment_date?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          invoice_id?: string
          profile_id?: string
          amount?: number
          payment_method?: string | null
          transaction_id?: string | null
          payment_date?: string | null
          status?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
