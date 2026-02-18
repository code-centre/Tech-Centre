-- Allow students to read sessions and attendance for cohorts they are enrolled in
-- Run this in Supabase SQL Editor if students cannot see class material
--
-- Sessions: the existing policy allows admin/instructor to manage sessions.
-- This policy adds SELECT for students enrolled in the cohort.
--
-- Attendance: students need to read their own attendance records.

-- 1. Sessions: students can read sessions of cohorts they're enrolled in
CREATE POLICY "Students can read sessions of enrolled cohorts"
ON sessions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.cohort_id = sessions.cohort_id
    AND e.student_id = auth.uid()
  )
);

-- 2. Attendance: students can read their own attendance (via their enrollment)
-- If this fails (e.g. attendance has no RLS), run only the sessions policy above.
CREATE POLICY "Students can read own attendance"
ON attendance
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.id = attendance.enrollment_id
    AND e.student_id = auth.uid()
  )
);
