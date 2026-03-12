-- Update IA Engineer career: slug change + enriched content from PDF
UPDATE careers
SET
  slug = 'ai-engineer',
  name = 'AI Engineer',
  duration = '25 semanas',
  level = 'Desde cero hasta avanzado',
  modality = 'Presencial en Barranquilla',
  description = 'Programa intensivo de 25 semanas para convertirte en AI Engineer. Aprende desde los fundamentos de la programación hasta la construcción y despliegue de agentes inteligentes en la nube.',
  long_description = 'La industria está cambiando. Este programa te pone del lado correcto de la transición: construyendo con IA, no siendo reemplazado por ella. Con un currículo intensivo, práctico y diseñado para el mercado real, te lleva desde los fundamentos de la programación hasta la construcción y despliegue de agentes inteligentes en la nube — en 25 semanas.',
  target_audience = 'Profesionales en cambio de carrera, estudiantes universitarios, emprendedores y profesionales tech que quieren especializarse en IA',
  next_start_date = 'Julio 2026',
  learning_points = '[
    {"title":"Fundamentos Tech","url":"FT"},
    {"title":"Desarrollo con Python e Inteligencia Artificial","url":"PY-IA"},
    {"title":"Desarrollo web integrado con IA","url":"WEB-IA"},
    {"title":"Agentes y sistemas inteligentes","url":"AGENTES"},
    {"title":"Cloud Engineering","url":"CLOUD"}
  ]'::jsonb,
  modules = '[
    {"title":"Fundamentos Tech","duration":"1 semana","topics":["Terminal","Git","GitHub","Entorno de desarrollo"]},
    {"title":"Módulo 1A: Python & Programación","duration":"6 semanas","topics":["Variables, funciones, datos","Pandas, Matplotlib, Jupyter","Consumo de APIs públicas"]},
    {"title":"Módulo 1B: JavaScript & Programación","duration":"6 semanas","topics":["Variables, funciones, async/await","Node.js, npm, intro TypeScript","Consumo de APIs públicas"]},
    {"title":"Módulo 2A: APIs, Backend & Datos","duration":"6 semanas","topics":["APIs REST con FastAPI y Pydantic","SQLite/SQLAlchemy, Docker","Primera integración con LLM"]},
    {"title":"Módulo 2B: React & Full Stack","duration":"6 semanas","topics":["React, Tailwind CSS, Next.js","Node.js backend, Prisma ORM","App full stack desplegada"]},
    {"title":"Módulo 3: IA Aplicada - Agentes con Google ADK","duration":"6 semanas","topics":["Prompt engineering, function calling","RAG (Retrieval Augmented Generation)","Google Agent Development Kit","Agentes multi-step, guardrails"]},
    {"title":"Módulo 4: Cloud & Despliegue","duration":"6 semanas","topics":["Docker, GCP/AWS o Vercel","CI/CD con GitHub Actions","Proyecto integrador","Demo Day"]}
  ]'::jsonb,
  graduate_profile = '[
    "Construir y desplegar agentes inteligentes en la nube con frontend, CI/CD y documentación profesional",
    "Diseñar e implementar sistemas RAG con bases vectoriales",
    "Dominar arquitecturas de agentes autónomos con Google ADK",
    "Crear APIs REST profesionales con FastAPI o Next.js",
    "Portafolio en GitHub con 5+ proyectos funcionales desplegados",
    "Aplicar a roles de AI Engineer, ML Engineer o Full Stack AI Developer"
  ]'::jsonb,
  opportunities = '[
    {"title":"AI Engineer (local Colombia)","salaryRange":"$3M–$5M COP/mes","description":"Junior developer con IA en empresas locales"},
    {"title":"AI Engineer (nearshoring)","salaryRange":"$12M–$20M COP/mes","description":"Remoto para empresas de EE.UU. vía nearshoring"},
    {"title":"AI/ML Engineer (remoto senior)","salaryRange":"$20M–$38M COP/mes","description":"Roles remotos directos con empresas de EE.UU./Europa"},
    {"title":"Full Stack AI Developer","salaryRange":"$8M–$15M COP/mes","description":"Desarrollo de productos con IA integrada"},
    {"title":"Freelance / Consultor IA","salaryRange":"$5M–$17M COP/mes","description":"Consultoría independiente en inteligencia artificial"},
    {"title":"Fundador técnico","salaryRange":"Variable","description":"Construye tu propio MVP con autonomía técnica"}
  ]'::jsonb,
  admission_process = '[
    {"step":"1","title":"Inscripción","description":"Completa el formulario de inscripción en línea"},
    {"step":"2","title":"Contacto","description":"Te contactamos por WhatsApp para resolver dudas"},
    {"step":"3","title":"Pago","description":"Elige tu plan de pago y formaliza tu inscripción"},
    {"step":"4","title":"Inicio","description":"Comienza tu formación con la próxima cohorte"}
  ]'::jsonb,
  metadata = '{
    "title":"AI Engineer - Programa de Formación | Tech Centre",
    "description":"Conviértete en AI Engineer en 25 semanas. Programa intensivo y práctico en Barranquilla: Python o JavaScript, agentes de IA con Google ADK, RAG, cloud y despliegue. Desde $200,000 COP por módulo.",
    "keywords":["AI Engineer","carrera inteligencia artificial","programa IA Barranquilla","agentes IA","Google ADK","RAG","machine learning carrera","Python IA","JavaScript full stack IA","Tech Centre","AI Engineer Colombia","bootcamp IA LATAM","nearshoring IA"]
  }'::jsonb,
  is_visible = true
WHERE slug = 'ia-engineer';
