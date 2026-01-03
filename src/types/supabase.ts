export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type UserRole = 'ADMIN' | 'USER' | 'STUDENT' | 'TEACHER';
type IdType = 'CC' | 'TI' | 'CE' | 'PASSPORT';

export interface Database {
  public: {
    Enums: {
      user_role: UserRole;
      id_type: IdType;
    };
    Tables: {
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