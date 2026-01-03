/**
 * Tipos centralizados para Programas, Cursos y Eventos
 * Este archivo contiene todas las interfaces relacionadas con programas académicos
 * para evitar duplicación en el código.
 */

// ============================================================================
// Tipos base y enums
// ============================================================================

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'BÁSICO' | 'INTERMEDIO' | 'AVANZADO';

export type DifficultyLevel = Difficulty | string;

// ============================================================================
// Interfaces de Syllabus y Módulos
// ============================================================================

export interface Module {
  id: number;
  title: string;
  topics: string[];
}

export interface SyllabusItem {
  module: string;
  topics: Array<string>;
}

export interface SyllabusData {
  modules: Module[];
}

// ============================================================================
// Interface principal de Program (Supabase)
// ============================================================================

/**
 * Interface principal para programas académicos desde Supabase
 * Esta es la versión más completa y actualizada
 */
export interface Program {
  id: number;
  code: string;
  name: string;
  kind?: string;
  difficulty?: DifficultyLevel;
  total_hours?: number;
  default_price?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  image: string;
  description: string;
  video: string;
  subtitle: string;
  duration: string;
  schedule?: string;
  faqs: any[];
  slug?: string;
  syllabus?: SyllabusData;
  [key: string]: any; // Para propiedades adicionales dinámicas
}


// ============================================================================
// Interfaces de Props para Componentes
// ============================================================================

/**
 * Props para CourseCardSupa
 */
export interface CourseCardProps {
  title?: string;
  subtitle?: string;
  kind?: string;
  description?: string;
  image?: string;
  level?: string;
  duration?: string;
  schedule?: string;
  instructor?: string;
  heroImage?: string;
  date?: string;
  slug?: string;
  isActive?: boolean;
  eventData?: any;
}

/**
 * Props para CourseCard (versión antigua)
 */
export interface CourseCardPropsLegacy {
  title?: string;
  description?: string;
  image?: string;
  level?: string;
  duration?: string;
  instructor?: string;
  heroImage?: string;
  date?: string;
  isShort?: boolean;
  slug?: string;
  isDraft?: boolean;
}

/**
 * Props para CourseListSupa
 */
export interface CourseListSupaProps {
  programs: Program[];
  showHeader?: boolean;
  backgroundColor?: string;
}

// ============================================================================
// Interfaces adicionales relacionadas
// ============================================================================

export interface ScheduleItem {
  date: string;
  timeline: Timeline[];
  title: string;
}

export interface Timeline {
  description: string;
  endHour: string;
  place: string;
  title: string;
  startHour: string;
  speakerId: string;
}

export interface Location {
  description: string;
  mapUrl: string;
  title: string;
}

export interface Ticket {
  benefits: string[];
  description: string;
  name: string;
  price: number;
  type: string;
}

export interface Faq {
  question: string;
  answer: string;
}

/**
 * Interface para eventos FCA (cursos cortos/eventos)
 */
export interface EventFCA {
  id?: string;
  title?: string;
  name?: string;
  date?: string;
  description?: string;
  image?: string;
  heroImage?: string;
  slug?: string;
  level?: string;
  type?: string;
  tickets?: Ticket[];
  eventId?: string;
  eventSlug?: string;
  ticketName?: string;
  isShort?: boolean;
  isDraft?: boolean;
  status?: string;
  [key: string]: any;
}

