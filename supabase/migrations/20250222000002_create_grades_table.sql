-- Grades table: one grade per enrollment per module (scale 0-5)
CREATE TABLE IF NOT EXISTS grades (
  id SERIAL PRIMARY KEY,
  enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL REFERENCES program_modules(id) ON DELETE CASCADE,
  value NUMERIC(3,1) NOT NULL CHECK (value >= 0 AND value <= 5),
  notes TEXT,
  graded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(enrollment_id, module_id)
);

-- Enable RLS
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Instructors can manage grades for cohorts they teach
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

-- Admins can manage all grades
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

-- Students can read their own grades
CREATE POLICY "Students can read own grades"
ON grades FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.id = grades.enrollment_id
    AND e.student_id = auth.uid()
  )
);
