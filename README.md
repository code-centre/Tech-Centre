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
| `NEXT_PUBLIC_SITE_URL` | URL pública canónica del sitio (usar `https://www.techcentre.co` en producción) | Sí (producción) |
| `NEXT_PUBLIC_BASE_URL` | URL base para callbacks (ej: http://localhost:3000) | Sí |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | API Key de Google Maps (mapas) | Opcional |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | API Key de Google Places (reseñas) | Opcional |
| `WOMPI_SECRET_KEY` | Clave secreta de Wompi (solo servidor) | Sí (checkout) |
| `WOMPI_EVENTS_SECRET` | Secreto de eventos/webhooks de Wompi | Sí (producción) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (solo webhook de pagos) | Sí (producción) |
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
| `/oauth/consent` | Consentimiento OAuth para agentes MCP | Admin / Instructor |
| `/api/mcp/mcp` | Endpoint MCP (Model Context Protocol) | OAuth / Bearer |

## MCP (Model Context Protocol)

El servidor MCP expone herramientas para consultar cohortes, inscripciones y pagos según el rol del usuario autenticado.

### Host canónico (importante)

El endpoint MCP y todo el flujo OAuth deben usar **un solo host**. En Vercel el
dominio primario es `www.techcentre.co` y el ápex `techcentre.co` responde con un
**307 → www**. Los redirects entre hosts distintos **eliminan el header
`Authorization`**, así que un cliente configurado con el ápex pierde el token en
cada petición y la sesión "se cae" a `needsAuth` justo después de autenticar.

- Usa siempre `https://www.techcentre.co/api/mcp/mcp` en el cliente MCP.
- En Supabase, la **Site URL debe ser `https://www.techcentre.co`** (si es el
  ápex, el flujo OAuth mezcla ápex/www y el cliente reporta
  *"Protected resource … does not match expected …"*).
- El metadata `oauth-protected-resource` ahora se genera según el host de la
  petición, así que `resource` siempre coincide con el host que usó el cliente.

### Conectar desde Cursor

1. En Supabase Dashboard → **Authentication → OAuth Server**, activa el servidor OAuth y configura:
   - **Site URL:** `https://www.techcentre.co`
   - **Authorization Path:** `/oauth/consent`
   - **JWT signing keys:** asimétricas (RS256/ES256) recomendado. **No es
     obligatorio:** si el proyecto sigue en HS256 (el endpoint
     `/auth/v1/.well-known/jwks.json` devuelve `{"keys":[]}`), el servidor MCP
     valida el token contra el servidor Auth (`getUser`) en lugar de vía JWKS.
2. En **Authentication → URL Configuration**, agrega redirect URLs:
   - `https://www.techcentre.co/auth/callback`
   - `https://techcentre.co/auth/callback` (por si alguien entra sin `www`)
3. Registra un cliente OAuth estático (o activa **Dynamic Client Registration**,
   ya soportado: el metadata expone `registration_endpoint`) con estas
   **redirect URIs de MCP**:

```
https://www.cursor.com/agents/mcp/oauth/callback
http://localhost:8787/callback
cursor://anysphere.cursor-mcp/oauth/callback
```

   - **Grok Bot / Cloud Agents:** `https://www.cursor.com/agents/mcp/oauth/callback`
   - **Cursor Desktop:** `http://localhost:8787/callback`
   - **Cursor Desktop (legacy):** `cursor://anysphere.cursor-mcp/oauth/callback`

4. Despliega la app con `NEXT_PUBLIC_SITE_URL=https://www.techcentre.co` en Vercel.
5. En Cursor, agrega el servidor MCP sin token manual:

```json
{
  "mcpServers": {
    "tech-centre": {
      "url": "https://www.techcentre.co/api/mcp/mcp"
    }
  }
}
```

Cursor descubrirá OAuth vía `/.well-known/oauth-protected-resource` y abrirá el flujo de autorización. Solo cuentas **admin** o **instructor** pueden aprobar la conexión.

**Grok Bot:** el flujo OAuth con Dynamic Client Registration funciona; si tu
cliente no lo soporta, usa un Bearer token en el header `Authorization`
(ver sección abajo). Ambos caminos comparten la misma validación de token.

### Herramientas disponibles

| Tool | Scope | Roles |
|------|-------|-------|
| `list_cohorts`, `get_cohort` | `cohorts:read` | admin, instructor |
| `create_cohort`, `update_cohort` | `cohorts:write` | admin |
| `list_enrollments`, `enroll_student` | `enrollments:*` | read: ambos; write: admin |
| `get_payment_summary`, `mark_invoice_paid` | `payments:*` | read: ambos; write: admin |

### Webhook de pagos (Wompi)

Registra en el dashboard de Wompi la URL:

```
https://techcentre.co/api/payments/webhook
```

Variables requeridas: `WOMPI_EVENTS_SECRET`, `WOMPI_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

### Clientes sin OAuth (Grok Bot, scripts)

Si tu cliente no completa el flujo OAuth, usa un Bearer token estático:

| Campo | Valor |
|-------|-------|
| URL | `https://www.techcentre.co/api/mcp/mcp` |
| Header | `Authorization: Bearer <access_token>` |

Obtén el token desde la sesión en techcentre.co (Local Storage → `sb-*-auth-token` → `access_token`). Expira en horas; renueva cuando falle.

Cualquier access token de Supabase (sesión normal o emitido por el servidor
OAuth) es válido. El servidor MCP lo valida primero contra el JWKS asimétrico y,
si el proyecto usa HS256 (JWKS vacío), lo valida contra el servidor Auth. La
cuenta debe tener rol **admin** o **instructor**.

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
