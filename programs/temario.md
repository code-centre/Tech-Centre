# **Curso: AI Engineering & Agentic Systems**

Este programa de **32 horas** transforma desarrolladores backend en **AI Engineers**. El enfoque central es construir sistemas de agentes autónomos utilizando **Google ADK**, priorizando la robustez arquitectónica, la observabilidad y la evaluación científica de resultados sobre el "hype".

---

## **1. Logística y Horarios**
El curso se adapta a dos modalidades de aprendizaje intensivo:

### **Modalidad Semanal (6h/semana)**

* **Días:** Lunes, Martes y Miércoles (2h por sesión).
* **Estructura:**
    * **Día 1: Concepto & Demo (2h):** Teoría profunda y demostración en vivo del instructor.
    * **Día 2: Lab & Debugging (2h):** Implementación activa por parte de los alumnos con soporte técnico directo.
    * **Día 3: Review & Red Teaming (2h):** Feedback grupal, revisión de arquitectura y pruebas de estrés a los agentes.

### **Modalidad Sabatina (4h/semana)**
* **Día:** Sábado.
* **Estructura:**
    * **09:00 - 10:00:** Teoría estratégica y objetivos de la sesión.
    * **10:00 - 12:00:** Laboratorio práctico intensivo (Hands-on).
    * **12:00 - 13:00:** Sharing & Critique (Análisis de fallos y lecciones aprendidas).

---

## **2. Perfil del Estudiante (Prerrequisitos)**
* **Python (v3.10+):** Intermedio (Asincronía, decoradores y tipado).
* **FastAPI:** Conocimientos básicos de rutas y esquemas Pydantic.
* **Docker:** Capacidad para gestionar contenedores y volúmenes básicos.

---

## **3. Temario Semana a Semana**

| Semana | Tema Principal | Hito Técnico |
| :--- | :--- | :--- |
| **W1** | **Fundamentos de GenAI** | Tokens, Contexto y Programación Probabilística. |
| **W2** | **Google ADK y ReAct** | Inicialización del agente y el loop Pensamiento-Acción. |
| **W3** | **Tools y MCP** | Conexión a APIs externas y estándar MCP. |
| **W4** | **Memoria y RAG** | Implementación de PostgreSQL y Vector DBs (Chroma). |
| **W5** | **Evals (QA)** | Medición de precisión con Golden Datasets y LLM-as-a-judge. |
| **W6** | **Despliegue y Obs** | Trazabilidad con Arize Phoenix y contenedores productivos. |
| **W7** | **Producción (Hardening)** | Seguridad (Prompt Injection), Costos y Latencia. |
| **W8** | **Multi-Agente** | Orquestación, Handoffs y patrones Supervisor/Worker. |

---

## **4. El Kit de Inicio (Boilerplate)**
Para garantizar que el enfoque sea la **IA** y no la configuración de entornos, se entrega un repositorio base que incluye:
* **Docker Compose:** PostgreSQL (Memoria), ChromaDB/FAISS (Vectores) y Arize Phoenix (Observabilidad).
* **Estructura FastAPI:** Rutas de salud, middleware de seguridad y orquestador de ADK.
* **Templates:** Carpeta de `/tools` con ejemplos de validación Pydantic y `/evals` con ejemplos.

---

## **5. Metodología de Feedback: "Engineering Critique"**
El bloque de feedback no es una presentación comercial. Se basa en:

1.  **Code Review:** Análisis de la eficiencia de los prompts y esquemas de herramientas.
2.  **Failure Analysis:** ¿Por qué falló el agente? (Hallucination check).
3.  **Red Teaming:** Compañeros intentan engañar al agente (Prompt Injection) para probar la robustez de la Semana 7.

---

## **6. Proyecto Final: "The Operations Agent"**
Los estudiantes eligen su dominio (Salud, DevOps, Legal, etc.) bajo un marco de **"Bounded Freedom"**:

* **Framework:** Google ADK (Python v1.29+).
* **Tools:** Mínimo 2 herramientas personalizadas conectadas a una DB o API externa.
* **RAG:** Búsqueda semántica funcional sobre documentos propios.
* **Evals:** Reporte de tasa de éxito basado en un Golden Dataset de 20 casos de prueba.

--

## **7. Ejemplos de Proyectos Sugeridos**
* **DevOps Assistant:** Diagnóstico de errores de servidor consultando logs y manuales técnicos.
* **Concierge Médico:** Agendamiento inteligente validando seguros y disponibilidad en SQL.
* **HR Onboarding Bot:** Resolución de dudas corporativas y automatización de tickets de acceso.
* **Legal Analyst:** Extracción de cláusulas de riesgo en contratos mediante búsqueda semántica.