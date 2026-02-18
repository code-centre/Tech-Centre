-- Allow admins and instructors to insert/update/delete attendance
-- Run this in Supabase SQL Editor if attendance changes don't save
--
-- Instructors need to record attendance for their cohort students.
-- This policy allows admin and instructor roles to manage attendance.

CREATE POLICY "Admins and instructors can manage attendance"
ON attendance
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'instructor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'instructor')
  )
);
