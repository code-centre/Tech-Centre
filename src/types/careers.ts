/**
 * Tipos centralizados para Carreras Tecnológicas
 * Este archivo contiene todas las interfaces relacionadas con carreras
 * para mantener consistencia y validación de datos.
 */

// ============================================================================
// Interfaces de Datos de Carreras
// ============================================================================

export interface CareerModule {
  title: string
  duration: string
  topics: string[]
}

export interface CareerOpportunity {
  title: string
  salaryRange?: string
  description?: string
}

export interface AdmissionStep {
  step: string
  title: string
  description: string
}

export interface CareerMetadata {
  title: string
  description: string
  keywords: string[]
}

// ============================================================================
// Interface Principal de Career
// ============================================================================

/**
 * Interface principal para carreras tecnológicas
 * Contiene toda la información necesaria para generar páginas dinámicas
 */
export interface Career {
  // Información básica
  name: string
  slug: string
  duration: string
  level: string
  modality: string
  description: string
  longDescription: string
  
  // Imágenes
  image: string
  heroImage: string
  
  // Audiencia y fechas
  targetAudience: string
  nextStartDate: string
  
  // Contenido educativo
  learningPoints: Array<{
    title: string
    url?: string
  }>
  modules: CareerModule[]
  
  // Perfil y oportunidades
  graduateProfile: string[]
  opportunities: CareerOpportunity[]
  
  // Proceso de admisión
  admissionProcess: AdmissionStep[]
  
  // SEO y metadata
  metadata: CareerMetadata
  
  // Propiedades adicionales
  [key: string]: any
}

// ============================================================================
// Interfaces para Componentes
// ============================================================================

/**
 * Props para CareerCard
 */
export interface CareerCardProps {
  career: Career
}

/**
 * Props para CareersSection
 */
export interface CareersSectionProps {
  careers?: Career[]
}

/**
 * Props para página dinámica de carrera
 */
export interface CareerPageProps {
  career: Career
}
