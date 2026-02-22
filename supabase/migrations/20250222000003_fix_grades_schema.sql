-- Fix grades table: drop and recreate with correct schema
-- Run this if the grades table has wrong/missing columns (PGRST204 errors)

DROP TABLE IF EXISTS grades CASCADE;

CREATE TABLE grades (
  id SERIAL PRIMARY KEY,
  enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL REFERENCES program_modules(id) ON DELETE CASCADE,
  value NUMERIC(3,1) NOT NULL CHECK (value >= 0 AND value <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(enrollment_id, module_id)
);

ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can manage grades for their cohorts"
ON grades FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    JOIN cohort_instructors ci ON ci.cohort_id = e.cohort_id
    WHERE e.id = grades.enrollment_id
    AND ci.instructor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM enrollments e
    JOIN cohort_instructors ci ON ci.cohort_id = e.cohort_id
    WHERE e.id = grades.enrollment_id
    AND ci.instructor_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all grades"
ON grades FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Students can read own grades"
ON grades FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.id = grades.enrollment_id
    AND e.student_id = auth.uid()
  )
);
