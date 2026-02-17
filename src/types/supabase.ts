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
    };
  };
}