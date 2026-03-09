import type { Career } from '@/types/careers'

/**
 * Datos centralizados de carreras tecnológicas
 * Este archivo es la única fuente de verdad para toda la información de carreras
 */
export const careersData: Career[] = [
  {
    // Información básica
    name: 'IA Engineer',
    slug: 'ia-engineer',
    duration: '12 meses',
    level: 'Intermedio-Avanzado',
    modality: 'Híbrido',
    description: 'Formación integral para convertirte en un especialista en Inteligencia Artificial, dominando desde los fundamentos de Machine Learning hasta el despliegue de modelos a escala.',
    longDescription: 'Conviértete en un especialista en Inteligencia Artificial. Formación integral de 12 meses en Machine Learning, Deep Learning, NLP y MLOps. Carrera tecnológica de vanguardia en Barranquilla.',
    
    // Imágenes
    image: '/images/careers/ia-engineer.jpg',
    heroImage: '/images/careers/ia-engineer-hero.jpg',
    
    // Audiencia y fechas
    targetAudience: 'Para profesionales que quieren especializarse en Inteligencia Artificial',
    nextStartDate: 'Enero 2024',
    
    // Contenido educativo
    learningPoints: [
      {
        title: 'Fundamentos Tech',
        url: '/FT'
      },
      {
        title: 'Desarrollo con Python e Inteligencia Artificial',
        url: '/PY-IA'
      },
      {
        title: 'Desarrollo web integrado con IA',
        url: '/WEB-IA'
      },
      {
        title: 'Agentes y sistemas inteligentes',
        url: '/AGENTES'
      },
      {
        title: 'Cloud Engineering',
        url: '/CLOUD'
      }
    ],
    modules: [
      {
        title: 'Módulo 1: Fundamentos de Machine Learning',
        duration: '8 semanas',
        topics: [
          'Algoritmos de clasificación y regresión',
          'Árboles de decisión y ensemble methods',
          'Validación cruzada y métricas de evaluación',
          'Feature engineering y selección de variables'
        ]
      },
      {
        title: 'Módulo 2: Deep Learning y Redes Neuronales',
        duration: '10 semanas',
        topics: [
          'Perceptrones y arquitecturas básicas',
          'Redes neuronales convolucionales (CNN)',
          'Redes neuronales recurrentes (RNN, LSTM)',
          'Transfer learning y fine-tuning'
        ]
      },
      {
        title: 'Módulo 3: Procesamiento de Lenguaje Natural',
        duration: '8 semanas',
        topics: [
          'Tokenización y embeddings',
          'Modelos transformer (BERT, GPT)',
          'Análisis de sentimiento y clasificación de texto',
          'Generación de texto y chatbots'
        ]
      },
      {
        title: 'Módulo 4: Computer Vision',
        duration: '8 semanas',
        topics: [
          'Procesamiento de imágenes básico',
          'Detección de objetos y segmentación',
          'Reconocimiento facial',
          'Aplicaciones en tiempo real'
        ]
      },
      {
        title: 'Módulo 5: MLOps y Despliegue',
        duration: '8 semanas',
        topics: [
          'Containerización con Docker',
          'Orquestación con Kubernetes',
          'CI/CD para modelos de ML',
          'Monitorización y mantenimiento'
        ]
      },
      {
        title: 'Módulo 6: Ética y Responsabilidad en IA',
        duration: '4 semanas',
        topics: [
          'Sesgos en algoritmos de ML',
          'IA explicable (XAI)',
          'Privacidad y protección de datos',
          'Regulaciones y cumplimiento'
        ]
      }
    ],
    
    // Perfil y oportunidades
    graduateProfile: [
      'Diseñar y implementar modelos de Machine Learning y Deep Learning',
      'Optimizar algoritmos para mejorar rendimiento y eficiencia',
      'Desplegar soluciones de IA a escala con MLOps',
      'Evaluar y mitigar sesgos en modelos de IA',
      'Comunicar resultados técnicos a stakeholders no técnicos',
      'Liderar equipos de desarrollo de IA'
    ],
    opportunities: [
      {
        title: 'Machine Learning Engineer',
        salaryRange: '$8M - $15M COP'
      },
      {
        title: 'Data Scientist',
        salaryRange: '$8M - $15M COP'
      },
      {
        title: 'AI Researcher',
        salaryRange: '$10M - $18M COP'
      },
      {
        title: 'MLOps Engineer',
        salaryRange: '$9M - $16M COP'
      },
      {
        title: 'Computer Vision Engineer',
        salaryRange: '$8M - $14M COP'
      },
      {
        title: 'NLP Specialist',
        salaryRange: '$8M - $15M COP'
      }
    ],
    
    // Proceso de admisión
    admissionProcess: [
      {
        step: '1',
        title: 'Aplicación',
        description: 'Completa el formulario de admisión'
      },
      {
        step: '2',
        title: 'Entrevista',
        description: 'Evaluación de perfil y motivación'
      },
      {
        step: '3',
        title: 'Selección',
        description: 'Notificación de resultados'
      },
      {
        step: '4',
        title: 'Matrícula',
        description: 'Formaliza tu inscripción'
      }
    ],
    
    // SEO y metadata
    metadata: {
      title: 'Carrera IA Engineer - Tech Centre',
      description: 'Conviértete en un especialista en Inteligencia Artificial. Formación integral de 12 meses en Machine Learning, Deep Learning, NLP y MLOps. Carrera tecnológica de vanguardia en Barranquilla.',
      keywords: [
        'carrera inteligencia artificial',
        'IA Engineer',
        'machine learning carrera',
        'deep learning formación',
        'carrera IA Barranquilla',
        'MLOps Colombia',
        'especialista IA',
        'carrera tecnología',
        'inteligencia artificial Colombia'
      ]
    }
  },
  {
    // Información básica
    name: 'Test Engineer',
    slug: 'test-engineer',
    duration: '6 meses',
    level: 'Intermedio',
    modality: 'Presencial',
    description: 'Conviértete en un especialista en testing y calidad de software, dominando desde pruebas unitarias hasta automatización avanzada y testing de aplicaciones con IA.',
    longDescription: 'Formación especializada en testing y calidad de software. Aprende a garantizar la calidad de aplicaciones mediante pruebas automatizadas, testing de rendimiento y estrategias de QA modernas.',
    
    // Imágenes
    image: '/images/careers/test-engineer.jpg',
    heroImage: '/images/careers/test-engineer-hero.jpg',
    
    // Audiencia y fechas
    targetAudience: 'Para profesionales que quieren especializarse en calidad y testing de software',
    nextStartDate: 'Febrero 2024',
    
    // Contenido educativo
    learningPoints: [
      {
        title: 'Fundamentos Test',
        url: '/FT-TEST'
      },
      {
        title: 'Desarrollo con test e Inteligencia Artificial',
        url: '/TEST-IA'
      },
      {
        title: 'Desarrollo web test',
        url: '/WEB-TEST'
      },
      {
        title: 'Agentes y sistemas test',
        url: '/AGENTES-TEST'
      },
      {
        title: 'Cloud test',
        url: '/CLOUD-TEST'
      }
    ],
    
    modules: [
      {
        title: 'Módulo 1: Fundamentos del Testing',
        duration: '4 semanas',
        topics: [
          'Principios de testing y calidad',
          'Tipos de pruebas: unitarias, integración, E2E',
          'Pyramid testing strategy',
          'Herramientas básicas de testing'
        ]
      },
      {
        title: 'Módulo 2: Automatización de Pruebas',
        duration: '6 semanas',
        topics: [
          'Frameworks de testing (Jest, Cypress, Playwright)',
          'Testing de APIs con Postman y Supertest',
          'Testing de bases de datos',
          'Mocking y stubbing'
        ]
      },
      {
        title: 'Módulo 3: Testing Avanzado',
        duration: '6 semanas',
        topics: [
          'Testing de rendimiento con JMeter y k6',
          'Testing de seguridad',
          'Testing de usabilidad y accesibilidad',
          'Visual testing'
        ]
      },
      {
        title: 'Módulo 4: Testing con IA',
        duration: '4 semanas',
        topics: [
          'IA para generación de casos de prueba',
          'Testing de modelos de ML',
          'Herramientas de testing basadas en IA',
          'Validación de sistemas inteligentes'
        ]
      },
      {
        title: 'Módulo 5: CI/CD y Testing',
        duration: '4 semanas',
        topics: [
          'Integración de testing en pipelines',
          'Testing en entornos de producción',
          'Monitorización de calidad',
          'Reporting y métricas de calidad'
        ]
      }
    ],
    
    // Perfil y oportunidades
    graduateProfile: [
      'Diseñar estrategias completas de testing',
      'Automatizar flujos de prueba complejos',
      'Implementar testing de rendimiento y seguridad',
      'Liderar equipos de calidad',
      'Integrar testing en pipelines de CI/CD',
      'Utilizar IA para mejorar procesos de testing'
    ],
    opportunities: [
      {
        title: 'QA Engineer',
        salaryRange: '$6M - $10M COP'
      },
      {
        title: 'Test Automation Engineer',
        salaryRange: '$7M - $12M COP'
      },
      {
        title: 'Performance Test Engineer',
        salaryRange: '$8M - $13M COP'
      },
      {
        title: 'QA Lead',
        salaryRange: '$9M - $15M COP'
      },
      {
        title: 'DevTest Engineer',
        salaryRange: '$7M - $12M COP'
      }
    ],
    
    // Proceso de admisión
    admissionProcess: [
      {
        step: '1',
        title: 'Aplicación',
        description: 'Completa el formulario de admisión'
      },
      {
        step: '2',
        title: 'Evaluación técnica',
        description: 'Prueba de conocimientos básicos'
      },
      {
        step: '3',
        title: 'Entrevista',
        description: 'Evaluación de perfil y motivación'
      },
      {
        step: '4',
        title: 'Selección',
        description: 'Notificación de resultados'
      }
    ],
    
    // SEO y metadata
    metadata: {
      title: 'Carrera Test Engineer - Tech Centre',
      description: 'Conviértete en un especialista en testing y calidad de software. Formación de 6 meses en automatización, testing de rendimiento y QA moderno.',
      keywords: [
        'carrera testing',
        'Test Engineer',
        'QA Engineer',
        'automatización de pruebas',
        'testing de software',
        'calidad de software Colombia',
        'carrera tecnología',
        'testing con IA'
      ]
    }
  }
]

/**
 * Función para obtener una carrera por su slug
 */
export function getCareerBySlug(slug: string): Career | undefined {
  return careersData.find(career => career.slug === slug)
}

/**
 * Función para obtener todos los slugs de carreras
 */
export function getCareerSlugs(): string[] {
  return careersData.map(career => career.slug)
}

/**
 * Función para obtener carreras filtradas
 */
export function getCareersByLevel(level: string): Career[] {
  return careersData.filter(career => 
    career.level.toLowerCase().includes(level.toLowerCase())
  )
}

/**
 * Función para obtener carreras por modalidad
 */
export function getCareersByModality(modality: string): Career[] {
  return careersData.filter(career => 
    career.modality.toLowerCase().includes(modality.toLowerCase())
  )
}
