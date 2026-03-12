-- Create careers table
CREATE TABLE IF NOT EXISTS careers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  duration TEXT,
  level TEXT,
  modality TEXT,
  description TEXT,
  long_description TEXT,
  image TEXT,
  hero_image TEXT,
  target_audience TEXT,
  next_start_date TEXT,
  learning_points JSONB DEFAULT '[]'::jsonb,
  modules JSONB DEFAULT '[]'::jsonb,
  graduate_profile JSONB DEFAULT '[]'::jsonb,
  opportunities JSONB DEFAULT '[]'::jsonb,
  admission_process JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on slug for fast lookups
CREATE INDEX IF NOT EXISTS careers_slug_idx ON careers (slug);

-- Index on is_visible for filtered public queries
CREATE INDEX IF NOT EXISTS careers_visible_idx ON careers (is_visible);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_careers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS careers_updated_at_trigger ON careers;
CREATE TRIGGER careers_updated_at_trigger
  BEFORE UPDATE ON careers
  FOR EACH ROW
  EXECUTE FUNCTION update_careers_updated_at();

-- Enable RLS
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;

-- Public can read visible careers
CREATE POLICY "Public can read visible careers"
  ON careers FOR SELECT
  USING (is_visible = true);

-- Authenticated users with admin role can do everything
CREATE POLICY "Admins have full access to careers"
  ON careers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Seed existing careers
INSERT INTO careers (name, slug, duration, level, modality, description, long_description, image, hero_image, target_audience, next_start_date, learning_points, modules, graduate_profile, opportunities, admission_process, metadata, is_visible)
VALUES
(
  'IA Engineer',
  'ia-engineer',
  '12 meses',
  'Intermedio-Avanzado',
  'Híbrido',
  'Formación integral para convertirte en un especialista en Inteligencia Artificial, dominando desde los fundamentos de Machine Learning hasta el despliegue de modelos a escala.',
  'Conviértete en un especialista en Inteligencia Artificial. Formación integral de 12 meses en Machine Learning, Deep Learning, NLP y MLOps. Carrera tecnológica de vanguardia en Barranquilla.',
  NULL,
  NULL,
  'Para profesionales que quieren especializarse en Inteligencia Artificial',
  'Enero 2024',
  '[{"title":"Fundamentos Tech","url":"/FT"},{"title":"Desarrollo con Python e Inteligencia Artificial","url":"/PY-IA"},{"title":"Desarrollo web integrado con IA","url":"/WEB-IA"},{"title":"Agentes y sistemas inteligentes","url":"/AGENTES"},{"title":"Cloud Engineering","url":"/CLOUD"}]'::jsonb,
  '[{"title":"Módulo 1: Fundamentos de Machine Learning","duration":"8 semanas","topics":["Algoritmos de clasificación y regresión","Árboles de decisión y ensemble methods","Validación cruzada y métricas de evaluación","Feature engineering y selección de variables"]},{"title":"Módulo 2: Deep Learning y Redes Neuronales","duration":"10 semanas","topics":["Perceptrones y arquitecturas básicas","Redes neuronales convolucionales (CNN)","Redes neuronales recurrentes (RNN, LSTM)","Transfer learning y fine-tuning"]},{"title":"Módulo 3: Procesamiento de Lenguaje Natural","duration":"8 semanas","topics":["Tokenización y embeddings","Modelos transformer (BERT, GPT)","Análisis de sentimiento y clasificación de texto","Generación de texto y chatbots"]},{"title":"Módulo 4: Computer Vision","duration":"8 semanas","topics":["Procesamiento de imágenes básico","Detección de objetos y segmentación","Reconocimiento facial","Aplicaciones en tiempo real"]},{"title":"Módulo 5: MLOps y Despliegue","duration":"8 semanas","topics":["Containerización con Docker","Orquestación con Kubernetes","CI/CD para modelos de ML","Monitorización y mantenimiento"]},{"title":"Módulo 6: Ética y Responsabilidad en IA","duration":"4 semanas","topics":["Sesgos en algoritmos de ML","IA explicable (XAI)","Privacidad y protección de datos","Regulaciones y cumplimiento"]}]'::jsonb,
  '["Diseñar y implementar modelos de Machine Learning y Deep Learning","Optimizar algoritmos para mejorar rendimiento y eficiencia","Desplegar soluciones de IA a escala con MLOps","Evaluar y mitigar sesgos en modelos de IA","Comunicar resultados técnicos a stakeholders no técnicos","Liderar equipos de desarrollo de IA"]'::jsonb,
  '[{"title":"Machine Learning Engineer","salaryRange":"$8M - $15M COP"},{"title":"Data Scientist","salaryRange":"$8M - $15M COP"},{"title":"AI Researcher","salaryRange":"$10M - $18M COP"},{"title":"MLOps Engineer","salaryRange":"$9M - $16M COP"},{"title":"Computer Vision Engineer","salaryRange":"$8M - $14M COP"},{"title":"NLP Specialist","salaryRange":"$8M - $15M COP"}]'::jsonb,
  '[{"step":"1","title":"Aplicación","description":"Completa el formulario de admisión"},{"step":"2","title":"Entrevista","description":"Evaluación de perfil y motivación"},{"step":"3","title":"Selección","description":"Notificación de resultados"},{"step":"4","title":"Matrícula","description":"Formaliza tu inscripción"}]'::jsonb,
  '{"title":"Carrera IA Engineer - Tech Centre","description":"Conviértete en un especialista en Inteligencia Artificial. Formación integral de 12 meses en Machine Learning, Deep Learning, NLP y MLOps. Carrera tecnológica de vanguardia en Barranquilla.","keywords":["carrera inteligencia artificial","IA Engineer","machine learning carrera","deep learning formación","carrera IA Barranquilla","MLOps Colombia","especialista IA","carrera tecnología","inteligencia artificial Colombia"]}'::jsonb,
  true
),
(
  'Test Engineer',
  'test-engineer',
  '6 meses',
  'Intermedio',
  'Presencial',
  'Conviértete en un especialista en testing y calidad de software, dominando desde pruebas unitarias hasta automatización avanzada y testing de aplicaciones con IA.',
  'Formación especializada en testing y calidad de software. Aprende a garantizar la calidad de aplicaciones mediante pruebas automatizadas, testing de rendimiento y estrategias de QA modernas.',
  NULL,
  NULL,
  'Para profesionales que quieren especializarse en calidad y testing de software',
  'Febrero 2024',
  '[{"title":"Fundamentos Test","url":"/FT-TEST"},{"title":"Desarrollo con test e Inteligencia Artificial","url":"/TEST-IA"},{"title":"Desarrollo web test","url":"/WEB-TEST"},{"title":"Agentes y sistemas test","url":"/AGENTES-TEST"},{"title":"Cloud test","url":"/CLOUD-TEST"}]'::jsonb,
  '[{"title":"Módulo 1: Fundamentos del Testing","duration":"4 semanas","topics":["Principios de testing y calidad","Tipos de pruebas: unitarias, integración, E2E","Pyramid testing strategy","Herramientas básicas de testing"]},{"title":"Módulo 2: Automatización de Pruebas","duration":"6 semanas","topics":["Frameworks de testing (Jest, Cypress, Playwright)","Testing de APIs con Postman y Supertest","Testing de bases de datos","Mocking y stubbing"]},{"title":"Módulo 3: Testing Avanzado","duration":"6 semanas","topics":["Testing de rendimiento con JMeter y k6","Testing de seguridad","Testing de usabilidad y accesibilidad","Visual testing"]},{"title":"Módulo 4: Testing con IA","duration":"4 semanas","topics":["IA para generación de casos de prueba","Testing de modelos de ML","Herramientas de testing basadas en IA","Validación de sistemas inteligentes"]},{"title":"Módulo 5: CI/CD y Testing","duration":"4 semanas","topics":["Integración de testing en pipelines","Testing en entornos de producción","Monitorización de calidad","Reporting y métricas de calidad"]}]'::jsonb,
  '["Diseñar estrategias completas de testing","Automatizar flujos de prueba complejos","Implementar testing de rendimiento y seguridad","Liderar equipos de calidad","Integrar testing en pipelines de CI/CD","Utilizar IA para mejorar procesos de testing"]'::jsonb,
  '[{"title":"QA Engineer","salaryRange":"$6M - $10M COP"},{"title":"Test Automation Engineer","salaryRange":"$7M - $12M COP"},{"title":"Performance Test Engineer","salaryRange":"$8M - $13M COP"},{"title":"QA Lead","salaryRange":"$9M - $15M COP"},{"title":"DevTest Engineer","salaryRange":"$7M - $12M COP"}]'::jsonb,
  '[{"step":"1","title":"Aplicación","description":"Completa el formulario de admisión"},{"step":"2","title":"Evaluación técnica","description":"Prueba de conocimientos básicos"},{"step":"3","title":"Entrevista","description":"Evaluación de perfil y motivación"},{"step":"4","title":"Selección","description":"Notificación de resultados"}]'::jsonb,
  '{"title":"Carrera Test Engineer - Tech Centre","description":"Conviértete en un especialista en testing y calidad de software. Formación de 6 meses en automatización, testing de rendimiento y QA moderno.","keywords":["carrera testing","Test Engineer","QA Engineer","automatización de pruebas","testing de software","calidad de software Colombia","carrera tecnología","testing con IA"]}'::jsonb,
  true
);
