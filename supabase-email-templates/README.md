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

## Pasos para recuperar contraseña

1. En **Subject** (Asunto), pega:
   ```
   Restablece tu contraseña - Tech Centre
   ```

2. En **Body** (Cuerpo), pega todo el contenido HTML del archivo `recuperar-contrasena.html` (desde `<!DOCTYPE html>` hasta `</html>`), o solo la parte entre las etiquetas `<body>...</body>` si el editor lo requiere.

3. Haz clic en **Save** para guardar los cambios.

## Variables del template

Supabase reemplaza automáticamente estas variables:

- `{{ .ConfirmationURL }}` — Enlace para restablecer la contraseña
- `{{ .Email }}` — Correo del usuario que solicitó el reset
