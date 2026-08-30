export interface RouteModule {
  title: string
  duration: string
  topics: string[]
}

export interface RouteOpportunity {
  title: string
  salaryRange?: string
  description?: string
}

export interface AdmissionStep {
  step: string
  title: string
  description: string
}

export interface RouteMetadata {
  title: string
  description: string
  keywords: string[]
}

export interface Route {
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
  modules: RouteModule[]

  graduate_profile: string[]
  opportunities: RouteOpportunity[]

  admission_process: AdmissionStep[]

  metadata: RouteMetadata

  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface RouteCardProps {
  route: Route
}

export interface RutasSectionProps {
  routes?: Route[]
}

export interface RoutePageProps {
  route: Route
}
