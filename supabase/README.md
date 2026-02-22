# Supabase Migrations

Ejecuta las migraciones en el orden indicado para aplicar los cambios de esquema.

## Cómo aplicar

1. **Desde Supabase Dashboard**: Ve a SQL Editor y ejecuta cada archivo en `migrations/` en orden numérico.

2. **Desde Supabase CLI** (si está configurado):
   ```bash
   supabase db push
   ```

## Migraciones

- `20250222000001_add_cohort_slug.sql` - Agrega columna `slug` a `cohorts`, la puebla y crea trigger para nuevos registros.
- `20250222000002_create_grades_table.sql` - Crea tabla `grades` con RLS para calificaciones por módulo (0-5).
