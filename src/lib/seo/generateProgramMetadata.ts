import type { Metadata } from 'next'
import type { Program } from '@/types/programs'
import { SITE_NAME, SITE_URL, socialImages } from '@/lib/seo/site'

interface ProgramMetadataOptions {
  program: Program
  baseUrl?: string
}

/**
 * Genera keywords técnicas basadas en el contenido del programa
 */
function extractTechnicalKeywords(program: Program): string[] {
  const keywords: string[] = []
  const name = (program.name || '').toLowerCase()
  const description = (program.description || '').toLowerCase()
  const subtitle = (program.subtitle || '').toLowerCase()
  const kind = (program.kind || '').toLowerCase()
  
  const content = `${name} ${description} ${subtitle} ${kind}`

  // Keywords técnicas comunes
  if (content.includes('python') || content.includes('pyth')) {
    keywords.push('python', 'programación python', 'cursos python Barranquilla', 'python Caribe')
  }
  
  if (content.includes('javascript') || content.includes('js')) {
    keywords.push('javascript', 'js', 'programación javascript', 'cursos javascript Barranquilla')
  }
  
  if (content.includes('react')) {
    keywords.push('react', 'reactjs', 'desarrollo react', 'cursos react Caribe', 'react Barranquilla')
  }
  
  if (content.includes('inteligencia artificial') || content.includes('ia') || content.includes('ai') || content.includes('machine learning')) {
    keywords.push('inteligencia artificial', 'IA', 'AI', 'machine learning', 'inteligencia artificial Colombia', 'IA Caribe')
  }
  
  if (content.includes('agente')) {
    keywords.push('agentes IA', 'agentes inteligencia artificial', 'agentes AI')
  }
  
  if (content.includes('análisis') && content.includes('datos')) {
    keywords.push('análisis de datos', 'data analysis', 'análisis datos python', 'data science')
  }
  
  if (content.includes('data science') || content.includes('ciencia de datos')) {
    keywords.push('data science', 'ciencia de datos', 'data science Colombia')
  }
  
  if (content.includes('diseño') || content.includes('design') || content.includes('ui') || content.includes('ux')) {
    keywords.push('diseño', 'diseño UI/UX', 'diseño gráfico', 'diseño figma Barranquilla')
  }
  
  if (content.includes('figma')) {
    keywords.push('figma', 'diseño figma', 'diseño figma Barranquilla')
  }
  
  if (content.includes('desarrollo web') || content.includes('web development')) {
    keywords.push('desarrollo web', 'web development', 'desarrollo web Barranquilla')
  }

  return keywords
}

/**
 * Genera metadata optimizada para una página de programa académico
 */
export function generateProgramMetadata({ program, baseUrl = SITE_URL }: ProgramMetadataOptions): Metadata {
  const programName = program.name || 'Programa'
  const programDescription = program.description 
    ? (typeof program.description === 'string' 
        ? program.description.replace(/<[^>]*>/g, '').substring(0, 160)
        : String(program.description).substring(0, 160))
    : `${programName} en Tech Centre, la academia de tecnología del Caribe. Formación experiencial alineada a la industria, presencial en Barranquilla.`
  
  const programSlug = program.code || program.slug || ''
  const programUrl = `${baseUrl}/programas-academicos/${programSlug}`
  
  // Keywords base
  const baseKeywords = [
    'academia de tecnología Caribe',
    'formación experiencial tecnología',
    'cursos programación Barranquilla',
    'formación tech alineada a la industria',
    SITE_NAME,
  ]
  
  // Keywords técnicas específicas del programa
  const technicalKeywords = extractTechnicalKeywords(program)
  
  // Keywords específicas del programa
  const programKeywords = [
    programName.toLowerCase(),
    ...(program.subtitle ? [program.subtitle.toLowerCase()] : []),
    ...(program.kind ? [program.kind.toLowerCase()] : []),
  ]
  
  const allKeywords = [...baseKeywords, ...technicalKeywords, ...programKeywords]
  
  const title = `${programName} | ${SITE_NAME}`
  const description = `${programDescription} Formación experiencial en Casa Tech, Barranquilla.`
  const images = socialImages(program.image, `${programName} · ${SITE_NAME}`)

  return {
    title,
    description,
    keywords: allKeywords,
    alternates: {
      canonical: programUrl,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: programUrl,
      siteName: SITE_NAME,
      images,
      locale: 'es_CO',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((image) => image.url),
    },
  }
}
