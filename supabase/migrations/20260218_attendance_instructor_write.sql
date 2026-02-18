-- Allow admins and instructors to insert/update/delete attendance
-- Run this in Supabase SQL Editor if attendance changes don't save
--
-- Admins: unrestricted. Instructors: only for attendance in sessions of cohorts
-- they are assigned to (via cohort_instructors).

-- Enable RLS on attendance so policies take effect
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if re-running migration
DROP POLICY IF EXISTS "Admins and instructors can manage attendance" ON attendance;

CREATE POLICY "Admins and instructors can manage attendance"
ON attendance
FOR ALL
TO authenticated
USING (
  -- Admin: unrestricted
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
  OR
  -- Instructor: only for sessions in cohorts they're assigned to
  EXISTS (
    SELECT 1 FROM sessions s
    INNER JOIN cohort_instructors ci ON ci.cohort_id = s.cohort_id AND ci.instructor_id = auth.uid()
    WHERE s.id = attendance.session_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM sessions s
    INNER JOIN cohort_instructors ci ON ci.cohort_id = s.cohort_id AND ci.instructor_id = auth.uid()
    WHERE s.id = attendance.session_id
  )
);
