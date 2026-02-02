export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'ADMIN' | 'USER' | 'STUDENT' | 'TEACHER' | 'admin' | 'instructor' | 'student';
type IdType = 'CC' | 'TI' | 'CE' | 'PASAPORTE';

/**
 * Interface para usuarios del sistema
 */
export interface User {
  id: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  profile_image?: string | null;
  professional_title?: string | null;
  bio?: string | null;
  phone?: string;
  address?: string | null;
  birthdate?: string;
  id_type?: IdType;
  id_number?: string;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
  github_url?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface Database {
  public: {
    Enums: {
      user_role: UserRole;
      id_type: IdType;
    };
    Tables: {
      leads: {
        Row: {
          id: bigint;
          source: string;
          full_name: string;
          email: string;
          phone: string;
          interested_program_id: bigint;
          stage: string;
          notes: string;
          created_at: string;
        };
        Insert: {
          source?: string;
          full_name: string;
          email: string;
          phone: string;
          interested_program_id?: bigint;
          stage?: string;
          notes?: string;
        };
        Update: {
          source?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          interested_program_id?: bigint;
          stage?: string;
          notes?: string;
        };
      };
      profiles: {
        Row: {
          user_id: string;  // uuid
          first_name: string;
          last_name: string;
          birthdate: string; // date
          phone: string;
          email: string;
          address: string | null;
          id_type: IdType;
          id_number: string;
          role: UserRole;
          profile_image?: string | null;
          professional_title?: string | null;
          bio?: string | null;
          linkedin_url?: string | null;
          twitter_url?: string | null;
          instagram_url?: string | null;
          github_url?: string | null;
          created_at: string; // timestamptz
          updated_at: string; // timestamptz
        };
        Insert: {
          user_id: string;  // uuid
          first_name: string;
          last_name: string;
          birthdate: string; // date
          phone: string;
          email: string;
          address?: string | null;
          id_type: IdType;
          id_number: string;
          role?: UserRole; // Valor por defecto 'USER'
          profile_image?: string | null;
          professional_title?: string | null;
          bio?: string | null;
          linkedin_url?: string | null;
          twitter_url?: string | null;
          instagram_url?: string | null;
          github_url?: string | null;
          created_at?: string; // timestamptz
          updated_at?: string; // timestamptz
        };
        Update: {
          user_id?: string;  // uuid
          first_name?: string;
          last_name?: string;
          birthdate?: string; // date
          phone?: string;
          email?: string;
          address?: string | null;
          id_type?: IdType;
          id_number?: string;
          role?: UserRole;
          profile_image?: string | null;
          professional_title?: string | null;
          bio?: string | null;
          linkedin_url?: string | null;
          twitter_url?: string | null;
          instagram_url?: string | null;
          github_url?: string | null;
          created_at?: string; // timestamptz
          updated_at?: string; // timestamptz
        };
      };
    };
  };
}