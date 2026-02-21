# Plantillas de correo para Supabase

## Cómo usar

1. Entra al **Supabase Dashboard** de tu proyecto
2. Ve a **Authentication** → **Email Templates**
3. Selecciona **Reset Password** (Recuperar contraseña)
4. Copia y pega el contenido de los archivos correspondientes

## Archivos

| Archivo | Uso en Supabase |
|---------|-----------------|
| `recuperar-contrasena.html` | Template completo de recuperar contraseña |
| `invite-user.html` | Template completo de invitación de usuario |

## Recuperar contraseña (con protección anti-prefetch)

El template usa una página intermedia (`/confirmar-reset`) para evitar que escáneres de correo (Outlook Safe Links, filtros corporativos) consuman el token antes de que el usuario haga clic. El correo enlaza a nuestra página; el usuario hace clic en el botón para ir al enlace real.

**Importante:** Asegúrate de que el **Site URL** en Supabase (Authentication → URL Configuration) sea tu dominio (ej. `https://www.techcentre.co`).

## Pasos para recuperar contraseña

1. En **Subject** (Asunto), pega:
   ```
   Restablece tu contraseña - Tech Centre
   ```

2. En **Body** (Cuerpo), pega todo el contenido HTML del archivo `recuperar-contrasena.html` (desde `<!DOCTYPE html>` hasta `</html>`), o solo la parte entre las etiquetas `<body>...</body>` si el editor lo requiere.

3. Haz clic en **Save** para guardar los cambios.

## Pasos para invitación de usuario

1. Selecciona **Invite user** en Email Templates.
2. En **Subject**, pega: `Te han invitado a Tech Centre`
3. En **Body**, pega el contenido HTML del archivo `invite-user.html`

## Variables del template

Supabase reemplaza automáticamente estas variables:

- `{{ .ConfirmationURL }}` — Enlace para aceptar la invitación / restablecer contraseña
- `{{ .Email }}` — Correo del usuario
- `{{ .SiteURL }}` — URL de tu sitio
- `{{ .RedirectTo }}` — URL de redirección tras aceptar
