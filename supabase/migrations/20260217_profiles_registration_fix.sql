-- Fix: Permitir registro con solo nombre, apellido y email
-- El índice único (id_type, id_number) bloqueaba múltiples usuarios con id_number vacío.
-- Cambiamos a un índice parcial: solo aplica cuando id_number está definido.

-- Eliminar el índice único existente
DROP INDEX IF EXISTS profiles_id_type_id_number_idx;

-- Crear índice parcial: solo exige unicidad cuando hay documento real
-- Múltiples perfiles pueden tener id_type='CC' e id_number='' durante el registro
CREATE UNIQUE INDEX profiles_id_type_id_number_idx
ON profiles (id_type, id_number)
WHERE id_number IS NOT NULL AND id_number != '';
