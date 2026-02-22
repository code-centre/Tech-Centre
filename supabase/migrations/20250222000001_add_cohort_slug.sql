-- Add slug column to cohorts (unique, human-readable identifier)
ALTER TABLE cohorts ADD COLUMN IF NOT EXISTS slug TEXT;

-- Populate slugs for existing cohorts: name-sanitized + id (e.g. desarrollo-web-fullstack-42)
UPDATE cohorts
SET slug = LOWER(
  REGEXP_REPLACE(REPLACE(COALESCE(name, 'cohort'), ' ', '-'), '[^a-z0-9-]', '', 'g')
) || '-' || id::TEXT
WHERE slug IS NULL;

-- Add unique constraint and make NOT NULL
ALTER TABLE cohorts ALTER COLUMN slug SET NOT NULL;
ALTER TABLE cohorts ADD CONSTRAINT cohorts_slug_key UNIQUE (slug);

-- Trigger to auto-generate slug on INSERT
CREATE OR REPLACE FUNCTION generate_cohort_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(
      REGEXP_REPLACE(REPLACE(COALESCE(NEW.name, 'cohort'), ' ', '-'), '[^a-z0-9-]', '', 'g')
    ) || '-' || NEW.id::TEXT;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cohort_slug_trigger ON cohorts;
CREATE TRIGGER cohort_slug_trigger
  BEFORE INSERT ON cohorts
  FOR EACH ROW
  EXECUTE FUNCTION generate_cohort_slug();
