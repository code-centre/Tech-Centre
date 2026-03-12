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

export interface Career {
  id: string
  name: string
  slug: string
  duration: string
  level: string
  modality: string
  description: string
  long_description: string

  image: string | null
  hero_image: string | null

  target_audience: string
  next_start_date: string

  learning_points: Array<{
    title: string
    url?: string
  }>
  modules: CareerModule[]

  graduate_profile: string[]
  opportunities: CareerOpportunity[]

  admission_process: AdmissionStep[]

  metadata: CareerMetadata

  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface CareerCardProps {
  career: Career
}

export interface CareersSectionProps {
  careers?: Career[]
}

export interface CareerPageProps {
  career: Career
}
