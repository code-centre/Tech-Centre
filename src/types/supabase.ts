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
          created_at?: string; // timestamptz
          updated_at?: string; // timestamptz
        };
      };
    };
  };
}