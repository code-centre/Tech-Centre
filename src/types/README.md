# Tipos Centralizados

Este directorio contiene todas las definiciones de tipos centralizadas para evitar duplicación.

## Archivos de Tipos

### `programs.ts` ⭐ **ARCHIVO PRINCIPAL**
- **Uso**: Sistema basado en Supabase
- **Program.id**: `number` (Supabase)
- **Importación**: `import type { Program, EventFCA } from '@/types/programs'`
- **Cuándo usar**: Para todo código relacionado con programas académicos

### `supabase.ts`
- Tipos generados para la base de datos de Supabase
- Incluye tipos para `profiles`, `programs`, `cohorts`, etc.

## Estructura de Tipos

### Program (Supabase)
```typescript
interface Program {
  id: number;           // number en Supabase
  code: string;
  name: string;
  kind?: string;
  difficulty?: string;
  // ... más campos
}
```

## Nota sobre Firebase

⚠️ **Firebase ha sido eliminado del proyecto**. Todos los tipos relacionados con Firebase han sido removidos. El proyecto ahora usa exclusivamente Supabase.

