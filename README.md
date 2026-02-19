# Tech Centre - Centro de Tecnología del Caribe

Plataforma web de educación tecnológica para el Caribe colombiano. Ofrece programas académicos (diplomados, cursos), gestión de cohortes, inscripciones, pagos y panel administrativo.

## Stack tecnológico

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Lenguaje:** TypeScript
- **Base de datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **Estilos:** Tailwind CSS 4
- **Estado:** Zustand
- **Editor de texto:** TipTap, Jodit
- **Gráficos:** Recharts
- **Pagos:** Wompi
- **Storage:** Supabase Storage, Firebase

## Requisitos previos

- Node.js 20+
- npm o pnpm
- Cuenta de Supabase
- (Opcional) Claves de Google Maps, Google Places, Wompi

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd Tech-Centre

# Instalar dependencias
npm install

# Crear .env con las variables indicadas en la sección "Variables de entorno"
```

## Variables de entorno

Crea un archivo `.env` en la raíz con:

| Variable | Descripción | Requerido |
|---------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase | Sí |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (ej: https://techcentre.co) | Sí (producción) |
| `NEXT_PUBLIC_BASE_URL` | URL base para callbacks (ej: http://localhost:3000) | Sí |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | API Key de Google Maps (mapas) | Opcional |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | API Key de Google Places (reseñas) | Opcional |
| `WOMPI_SECRET_KEY` o `NEXT_PUBLIC_WOMPI_SECRET_KEY` | Clave secreta de Wompi (pagos) | Sí (checkout) |
| `NEXT_PUBLIC_PAYMENT_PROVIDER` | Proveedor de pagos (default: wompi) | Opcional |
| `NEXT_PUBLIC_MODE_WOMPI` | Modo Wompi: production o test | Opcional |

## Scripts

```bash
# Desarrollo (con Turbopack)
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linter
npm run lint
```

## Estructura del proyecto

```
Tech-Centre/
├── src/
│   ├── app/                    # Rutas Next.js (App Router)
│   │   ├── admin/              # Panel administrativo
│   │   ├── blog/               # Blog público
│   │   ├── checkout/           # Proceso de pago
│   │   ├── instructor/         # Panel de instructores
│   │   ├── perfil/             # Perfil de usuario
│   │   ├── programas-academicos/  # Catálogo y detalle de programas
│   │   └── api/                # API routes
│   ├── components/            # Componentes React
│   │   ├── adminspage/         # Componentes del admin
│   │   ├── checkout/           # Componentes de checkout
│   │   ├── seo/                # Schema.org, metadata
│   │   └── tech-foundaments/   # Hero, descripción, FAQs de programas
│   ├── sections/               # Secciones de la landing
│   ├── contexts/               # React contexts (tema, auth)
│   ├── lib/                    # Supabase client, pagos, utilidades
│   └── types/                  # Tipos TypeScript
├── supabase/
│   └── migrations/             # Migraciones SQL
├── public/                     # Assets estáticos
└── data/                       # Datos JSON (noticias, etc.)
```

## Rutas principales

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Landing page | Público |
| `/programas-academicos` | Listado de programas | Público |
| `/programas-academicos/[slug]` | Detalle de programa | Público |
| `/programas-academicos/[slug]/apartar-cupo` | Formulario de pre-inscripción | Público |
| `/checkout` | Proceso de pago | Autenticado |
| `/perfil` | Perfil del usuario | Autenticado |
| `/perfil/cursos` | Cursos inscritos | Autenticado |
| `/instructor` | Panel de instructores | Admin / Instructor |
| `/admin` | Dashboard administrativo | Admin |
| `/admin/programas` | Gestión de programas | Admin |
| `/admin/cohortes` | Gestión de cohortes | Admin |
| `/admin/estudiantes` | Gestión de estudiantes | Admin |
| `/admin/instructores` | Gestión de instructores | Admin |
| `/admin/pagos` | Gestión de pagos | Admin |
| `/admin/blog` | Gestión del blog | Admin / Instructor |
| `/iniciar-sesion` | Login | Público |
| `/registro` | Registro | Público |
| `/blog` | Blog público | Público |

## Modelo de datos (Supabase)

- **profiles:** Usuarios con roles (admin, instructor, student)
- **programs:** Programas académicos (diplomados, cursos)
- **cohorts:** Cohortes de cada programa (fechas, horario, offering, maximum_payments)
- **cohort_instructors:** Asignación instructor-cohorte
- **enrollments:** Inscripciones de estudiantes a cohortes
- **sessions:** Clases de cada cohorte
- **attendance:** Asistencia
- **invoices:** Facturas
- **blog_posts:** Artículos del blog
- **program_modules:** Módulos del syllabus

## Migraciones

Las migraciones están en `supabase/migrations/`. Para aplicarlas:

1. En Supabase Dashboard: SQL Editor → pegar el contenido del archivo
2. O con CLI: `supabase db push`

## Roles

- **admin:** Acceso completo al panel admin
- **instructor:** Acceso a /admin/blog y panel de instructor
- **student:** Acceso a perfil y cursos inscritos

## Despliegue

El proyecto está preparado para Vercel. Configura las variables de entorno en el dashboard y ejecuta el build. Asegúrate de que `NEXT_PUBLIC_SITE_URL` y `NEXT_PUBLIC_BASE_URL` apunten a tu dominio en producción.

## Licencia

Proyecto privado - Tech Centre.
