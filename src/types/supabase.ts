export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'ADMIN' | 'USER' | 'STUDENT' | 'TEACHER' | 'admin' | 'instructor' | 'student';
type IdType = 'CC' | 'TI' | 'CE' | 'PASAPORTE';

/** Blog post - article written by admin or instructor */
export interface BlogPost {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Blog comment on a post */
export interface BlogComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

/** Blog like - one per user per post */
export interface BlogLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

/** Attendance status enum values */
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';

/** Session material item (stored in sessions.materials jsonb) */
export interface SessionMaterial {
  title: string;
  url: string;
  type: 'github' | 'youtube' | 'file' | 'link';
}

/** Program module - groups sessions within a program */
export interface ProgramModule {
  id: number;
  program_id: number;
  name: string;
  order_index: number;
  hours: number | null;
  content: Json | null;
  created_at: string;
}

/** Class session - belongs to a cohort, optionally to a module */
export interface Session {
  id: number;
  cohort_id: number;
  module_id: number | null;
  title: string | null;
  starts_at: string;
  ends_at: string;
  room: string | null;
  materials: SessionMaterial[] | null;
  created_at: string;
}

/** Attendance record - links session to enrollment with status */
export interface Attendance {
  id: number;
  session_id: number;
  enrollment_id: number;
  status: AttendanceStatus;
  notes: string | null;
  marked_at: string;
}

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
      blog_posts: {
        Row: BlogPost;
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content?: string | null;
          cover_image?: string | null;
          is_published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<BlogPost, 'id'>>;
      };
      blog_comments: {
        Row: BlogComment;
        Insert: Omit<BlogComment, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<BlogComment, 'id'>>;
      };
      blog_likes: {
        Row: BlogLike;
        Insert: Omit<BlogLike, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<BlogLike, 'id'>>;
      };
      invoices: {
        Row: {
          id: number;
          enrollment_id: number;
          label: string;
          amount: number;
          status: string;
          meta: Json | null;
          due_date?: string;
          paid_at?: string | null;
          url_recipe?: string | null;
        };
        Insert: {
          enrollment_id: number;
          label: string;
          amount: number;
          status?: string;
          meta?: Json | null;
          due_date?: string;
          paid_at?: string | null;
          url_recipe?: string | null;
        };
        Update: {
          enrollment_id?: number;
          label?: string;
          amount?: number;
          status?: string;
          meta?: Json | null;
          due_date?: string;
          paid_at?: string | null;
          url_recipe?: string | null;
        };
      };
      enrollments: {
        Row: {
          id: number;
          student_id: string;
        };
        Insert: {
          student_id: string;
        };
        Update: {
          student_id?: string;
        };
      };
    };
  };
}