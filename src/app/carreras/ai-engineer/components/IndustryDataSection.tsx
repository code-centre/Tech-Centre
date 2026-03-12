"use client";

import { useState } from "react";

type Tab = "perfil" | "salarios" | "stack" | "proyeccion";

const tabs: { id: Tab; label: string }[] = [
  { id: "perfil", label: "Perfil" },
  { id: "salarios", label: "Salarios" },
  { id: "stack", label: "Tech Stack" },
  { id: "proyeccion", label: "Proyección" },
];

function SalaryBar({
  label,
  value,
  max,
  sub,
}: {
  label: string;
  value: number;
  max: number;
  sub?: string;
}) {
  const pct = (value / max) * 100;
  return (
    <div className="mb-3.5">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-text-muted">{label}</span>
        <span className="text-sm font-bold text-[var(--primary)] dark:text-[var(--secondary)] font-mono">
          {sub || `$${value.toLocaleString()}`}
        </span>
      </div>
      <div className="bg-[var(--primary)]/10 dark:bg-[var(--primary)]/10 rounded-md h-2.5 overflow-hidden">
        <div
          className="h-full rounded-md bg-gradient-to-r from-[var(--primary)] dark:from-[var(--secondary)] to-[var(--primary)]/60 dark:to-[var(--secondary)]/60 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({
  number,
  label,
  sub,
}: {
  number: string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex-1 min-w-[140px] text-center p-5 rounded-xl bg-[var(--card-background)] border border-border-color shadow-sm">
      <span className="block text-2xl font-extrabold text-[var(--primary)] dark:text-[var(--secondary)] font-mono leading-none">
        {number}
      </span>
      <span className="block text-xs text-text-muted mt-1.5">{label}</span>
      {sub && (
        <span className="block text-[10px] text-text-muted mt-1">{sub}</span>
      )}
    </div>
  );
}

function StackItem({
  name,
  desc,
  tag,
}: {
  name: string;
  desc: string;
  tag: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--card-background)] border border-border-color mb-2">
      <div>
        <span className="text-sm font-bold text-text-primary">{name}</span>
        <span className="block text-xs text-text-muted mt-0.5">{desc}</span>
      </div>
      <span className="text-[10px] font-bold text-[var(--primary)] dark:text-[var(--secondary)] bg-[var(--primary)]/10 dark:bg-[var(--secondary)]/12 px-2.5 py-1 rounded-full font-mono whitespace-nowrap ml-3">
        {tag}
      </span>
    </div>
  );
}

function PerfilTab() {
  return (
    <div>
      <h3 className="text-xl font-bold text-[var(--primary)] dark:text-[var(--secondary)] mb-4">
        ¿Qué es un AI Engineer?
      </h3>
      <p className="text-sm text-text-muted leading-relaxed mb-6">
        Un AI Engineer es un profesional híbrido entre ingeniero de software y
        científico de datos. Su rol consiste en diseñar, construir y desplegar
        sistemas inteligentes en producción: desde integrar modelos de lenguaje
        (LLMs) en aplicaciones hasta orquestar agentes autónomos y pipelines de
        RAG. LinkedIn lo posicionó como el puesto #1 de más rápido crecimiento
        en 2025.
      </p>

      <div className="rounded-xl bg-[var(--card-background)] border border-border-color p-5 mb-6 shadow-sm">
        <p className="text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] mb-3 font-mono">
          Responsabilidades clave
        </p>
        {[
          "Integración de LLMs en productos (APIs, function calling, prompting avanzado)",
          "Diseño e implementación de sistemas RAG con bases vectoriales",
          "Construcción y orquestación de agentes autónomos",
          "Despliegue y monitoreo de modelos en cloud (GCP, AWS, Azure)",
          "Evaluación de modelos: benchmarks, detección de alucinaciones, métricas",
          "MLOps: pipelines de CI/CD, versionado de modelos, observabilidad",
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2.5 mb-2.5">
            <span className="text-[var(--primary)] dark:text-[var(--secondary)] mt-0.5">→</span>
            <span className="text-sm text-text-muted">{item}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-[var(--card-background)] border border-border-color p-5 mb-6 shadow-sm">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 mb-3 font-mono">
          Diferencia con otros roles
        </p>
        <div className="space-y-3">
          {[
            {
              role: "Data Scientist",
              diff: "Analiza datos y crea modelos experimentales. El AI Engineer los lleva a producción.",
            },
            {
              role: "ML Engineer",
              diff: "Se enfoca en entrenamiento y optimización de modelos. El AI Engineer integra LLMs y agentes en aplicaciones.",
            },
            {
              role: "Software Engineer",
              diff: "Construye software general. El AI Engineer se especializa en sistemas inteligentes con IA generativa.",
            },
            {
              role: "Prompt Engineer",
              diff: "Diseña prompts. El AI Engineer construye el sistema completo alrededor del modelo.",
            },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/12 px-2.5 py-0.5 rounded-full font-mono whitespace-nowrap">
                vs
              </span>
              <p className="text-sm">
                <span className="font-bold text-text-primary">
                  {item.role}:{" "}
                </span>
                <span className="text-text-muted">{item.diff}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <StatCard number="78%" label="de roles IT piden skills de IA" />
        <StatCard
          number="#1"
          label="puesto de mayor crecimiento"
          sub="LinkedIn 2025"
        />
        <StatCard
          number="26%"
          label="crecimiento laboral proyectado"
          sub="BLS 2023–2033"
        />
      </div>
    </div>
  );
}

function SalariosTab() {
  return (
    <div>
      <h3 className="text-xl font-bold text-[var(--primary)] dark:text-[var(--secondary)] mb-1">
        Salarios Globales
      </h3>
      <p className="text-xs text-text-muted mb-5">
        Compensación anual promedio en USD (2025–2026)
      </p>

      <div className="rounded-xl bg-[var(--card-background)] border border-border-color p-5 mb-6 shadow-sm">
        <p className="text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] mb-4 font-mono">
          Por región — Promedio anual
        </p>
        <SalaryBar label="Estados Unidos" value={147524} max={210000} />
        <SalaryBar label="Canadá" value={129850} max={210000} />
        <SalaryBar label="Australia" value={128400} max={210000} />
        <SalaryBar label="Suiza" value={160300} max={210000} />
        <SalaryBar label="Reino Unido" value={72000} max={210000} />
        <SalaryBar label="Alemania" value={98748} max={210000} />
        <SalaryBar label="Singapur" value={115000} max={210000} />
        <SalaryBar label="India" value={22000} max={210000} />
      </div>

      <div className="rounded-xl bg-[var(--card-background)] border border-border-color p-5 mb-6 shadow-sm">
        <p className="text-xs font-bold tracking-widest uppercase text-rose-600 dark:text-rose-400 mb-4 font-mono">
          Latinoamérica — Detalle por país
        </p>
        <p className="text-xs text-text-muted mb-4">
          Salarios locales vs. remotos para empresas de EE.UU.
        </p>
        <SalaryBar label="México" value={58075} max={112000} sub="$58K local · $85K remoto US" />
        <SalaryBar label="Argentina" value={55900} max={112000} sub="$56K local · $93K remoto US" />
        <SalaryBar label="Brasil" value={54000} max={112000} sub="$41–54K local · $100K remoto US" />
        <SalaryBar label="Colombia" value={45000} max={112000} sub="$36–45K local · $91K remoto US" />
        <SalaryBar label="Chile" value={49000} max={112000} sub="$49K local · $94K remoto US" />
        <SalaryBar label="Uruguay" value={61000} max={112000} sub="$61K · mercado premium" />

        <div className="mt-4 p-3.5 rounded-lg bg-[var(--primary)]/8 dark:bg-[var(--secondary)]/10 border border-[var(--primary)]/20 dark:border-[var(--secondary)]/25">
          <p className="text-xs font-bold text-[var(--primary)] dark:text-[var(--secondary)] mb-1">
            Dato clave
          </p>
          <p className="text-xs text-text-muted leading-relaxed">
            El promedio de salario remoto para AI Engineers en LATAM contratados
            por empresas de EE.UU. es de ~$112K/año, un ahorro del 60–70%
            frente a contratar en EE.UU. Los salarios de AI/ML suben 12–18%
            anual en la región.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-[var(--card-background)] border border-border-color p-5 shadow-sm">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 mb-4 font-mono">
          EE.UU. por nivel de experiencia
        </p>
        <SalaryBar label="Junior (0–2 años)" value={120513} max={315000} />
        <SalaryBar label="Mid-level (2–5 años)" value={140678} max={315000} />
        <SalaryBar label="Senior (5–7 años)" value={194413} max={315000} />
        <SalaryBar label="Staff / Principal" value={314943} max={315000} />
      </div>
    </div>
  );
}

function StackTab() {
  return (
    <div>
      <h3 className="text-xl font-bold text-[var(--primary)] dark:text-[var(--secondary)] mb-1">
        Tech Stack del AI Engineer
      </h3>
      <p className="text-xs text-text-muted mb-5">
        Herramientas y tecnologías más demandadas en 2025–2026
      </p>

      <p className="text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] mb-2.5 font-mono">
        Lenguajes & Frameworks
      </p>
      <StackItem name="Python" desc="71% de las ofertas laborales lo requieren" tag="ESENCIAL" />
      <StackItem name="PyTorch" desc="55%+ de producción, estándar en deep learning" tag="37.7% JOBS" />
      <StackItem name="TensorFlow" desc="Escalabilidad y despliegue en producción" tag="32.9% JOBS" />
      <StackItem name="FastAPI" desc="APIs de alto rendimiento para servir modelos" tag="CRECIENDO" />
      <StackItem name="JavaScript/TypeScript" desc="Frontends de agentes, integraciones web" tag="COMPLEMENTO" />

      <p className="text-xs font-bold tracking-widest uppercase text-rose-600 dark:text-rose-400 mt-6 mb-2.5 font-mono">
        LLMs & Agentes
      </p>
      <StackItem name="OpenAI API / GPT-4" desc="Modelo más usado en producción empresarial" tag="DOMINANTE" />
      <StackItem name="Google Gemini SDK" desc="Multimodalidad, function calling, grounding" tag="EN AUGE" />
      <StackItem name="Anthropic Claude" desc="Context windows amplios, razonamiento complejo" tag="PREMIUM" />
      <StackItem name="LangChain / LangGraph" desc="Orquestación de agentes y cadenas de LLM" tag="ESTÁNDAR" />
      <StackItem name="CrewAI / Pydantic AI" desc="Sistemas multi-agente y tipado estricto" tag="2026 TREND" />

      <p className="text-xs font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 mt-6 mb-2.5 font-mono">
        Datos & RAG
      </p>
      <StackItem name="ChromaDB / Pinecone / Weaviate" desc="Bases de datos vectoriales para embeddings" tag="RAG CORE" />
      <StackItem name="PostgreSQL + pgvector" desc="Base relacional con capacidad vectorial" tag="VERSÁTIL" />
      <StackItem name="Neo4j + Graphiti" desc="Knowledge graphs para relaciones complejas" tag="AVANZADO" />

      <p className="text-xs font-bold tracking-widest uppercase text-violet-700 dark:text-violet-400 mt-6 mb-2.5 font-mono">
        Cloud & MLOps
      </p>
      <StackItem name="AWS (SageMaker, Lambda, S3)" desc="32.9% de ofertas piden AWS" tag="#1 CLOUD" />
      <StackItem name="Azure (ML, OpenAI Service)" desc="26% de ofertas piden Azure" tag="#2 CLOUD" />
      <StackItem name="GCP (Vertex AI, Cloud Run)" desc="Integración nativa con Gemini" tag="#3 CLOUD" />
      <StackItem name="Docker / Kubernetes" desc="Contenedorización y orquestación" tag="ESENCIAL" />
      <StackItem name="GitHub Actions" desc="CI/CD para pipelines de ML" tag="ESTÁNDAR" />

      <div className="mt-5 p-3.5 rounded-lg bg-violet-500/10 border border-violet-500/25">
        <p className="text-xs font-bold text-violet-700 dark:text-violet-400 mb-1">
          Skills que más pagan en 2026
        </p>
        <p className="text-xs text-text-muted leading-relaxed">
          LLM fine-tuning ($162K–$312K) · NLP avanzado ($162K) · Computer vision
          ($121K–$250K) · MLOps/Cloud AI ($130K–$220K) · Prompt Engineering
          ($110K–$250K).
        </p>
      </div>
    </div>
  );
}

function ProyeccionTab() {
  return (
    <div>
      <h3 className="text-xl font-bold text-[var(--primary)] dark:text-[var(--secondary)] mb-1">
        Proyección de Crecimiento
      </h3>
      <p className="text-xs text-text-muted mb-5">
        El futuro del AI Engineer: mercado global y LATAM
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        <StatCard number="~30%" label="CAGR mercado global IA" sub="Hasta 2030" />
        <StatCard number="78M" label="nuevos empleos netos por IA" sub="WEF 2030" />
        <StatCard number="22–37%" label="CAGR mercado IA en LATAM" sub="2025–2034" />
      </div>

      <div className="rounded-xl bg-[var(--card-background)] border border-border-color p-5 mb-6 shadow-sm">
        <p className="text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] mb-3 font-mono">
          Mercado global de IA
        </p>
        {[
          { year: "2023", val: "$136B", pct: 16 },
          { year: "2025", val: "$~300B", pct: 36 },
          { year: "2027", val: "$~500B", pct: 60 },
          { year: "2030", val: "$827B", pct: 100 },
        ].map((d) => (
          <div key={d.year} className="mb-2.5">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-text-muted font-mono">{d.year}</span>
              <span className="text-xs font-bold text-[var(--primary)] dark:text-[var(--secondary)] font-mono">{d.val}</span>
            </div>
            <div className="bg-[var(--primary)]/10 rounded-md h-2 overflow-hidden">
              <div
                className="h-full rounded-md bg-gradient-to-r from-[var(--primary)] dark:from-[var(--secondary)] to-sky-600 dark:to-sky-500 transition-all duration-700"
                style={{ width: `${d.pct}%` }}
              />
            </div>
          </div>
        ))}
        <p className="text-[10px] text-text-muted mt-2">
          Fuente: Statista, PwC, proyecciones de mercado
        </p>
      </div>

      <div className="rounded-xl bg-[var(--card-background)] border border-border-color p-5 mb-6 shadow-sm">
        <p className="text-xs font-bold tracking-widest uppercase text-rose-600 dark:text-rose-400 mb-3 font-mono">
          LATAM: El mercado emergente
        </p>
        {[
          "Mercado de IA en LATAM: de $5.8B (2025) a $34.6B (2034), CAGR 22%",
          "Brasil lidera con 25% del mercado regional; México crece a 27.8% CAGR",
          "76% de empresas de EE.UU. con talento nearshore planean contratar más en LATAM en 2026",
          "Salarios de AI/ML subiendo 12–18% anual en la región",
          "84% de empleadores LATAM aceleran upskilling en cloud, IA y datos",
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2.5 mb-2.5">
            <span className="text-rose-600 dark:text-rose-400 mt-0.5 text-sm">▸</span>
            <span className="text-sm text-text-muted">{item}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-[var(--card-background)] border border-border-color p-5 mb-6 shadow-sm">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 mb-3 font-mono">
          Tendencias 2026 y más allá
        </p>
        {[
          { trend: "De chatbots a agentes autónomos", desc: "2026 es el año de la IA agéntica: sistemas que planifican, razonan y ejecutan acciones de forma independiente." },
          { trend: "El 'AI Builder' emerge como rol", desc: "Empresas como Meta y Walmart ya contratan 'builders': perfiles que van de la idea al producto usando IA." },
          { trend: "Multi-modal AI", desc: "Ingenieros que trabajan con texto, imagen, audio y video simultáneamente serán los más demandados." },
          { trend: "Premium salarial por skills de IA: +30%", desc: "PwC encontró que trabajadores con skills de IA ganan en promedio 30% más que sus pares en el mismo puesto." },
          { trend: "LATAM como hub nearshore de IA", desc: "Alineación horaria con EE.UU., talento en crecimiento y ahorro del 60–70% posicionan la región como centro estratégico." },
        ].map((item, i) => (
          <div key={i} className="mb-4 last:mb-0">
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400">{item.trend}</p>
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-[var(--primary)]/8 dark:bg-[var(--secondary)]/10 border border-[var(--primary)]/20 dark:border-[var(--secondary)]/25">
        <p className="text-sm font-bold text-text-primary mb-2">
          ¿Por qué formar AI Engineers en LATAM ahora?
        </p>
        <p className="text-xs text-text-muted leading-relaxed">
          La combinación de un mercado global creciendo al 30% CAGR, un déficit
          masivo de talento (500K+ vacantes abiertas globalmente), salarios
          remotos de $60–112K/año accesibles desde LATAM, y una región donde el
          81% de empresas ya implementa IA, crea una ventana de oportunidad sin
          precedentes.
        </p>
      </div>
    </div>
  );
}

export default function IndustryDataSection() {
  const [activeTab, setActiveTab] = useState<Tab>("perfil");

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <p className="text-xs font-bold tracking-widest uppercase text-[var(--primary)] dark:text-[var(--secondary)] mb-3 font-mono">
            Investigación de Mercado · 2025–2026
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Datos de la Industria
          </h2>
          <p className="text-base text-text-muted max-w-xl mx-auto">
            Perfil profesional, rangos salariales globales y LATAM, stack
            tecnológico y proyección de crecimiento del rol más demandado en
            tecnología.
          </p>
        </header>

        {/* Tabs */}
        <nav className="flex gap-1 p-1.5 mb-8 rounded-xl bg-[var(--card-background)] border border-border-color shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[var(--primary)]/12 dark:bg-[var(--secondary)]/15 text-[var(--primary)] dark:text-[var(--secondary)] shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div>
          {activeTab === "perfil" && <PerfilTab />}
          {activeTab === "salarios" && <SalariosTab />}
          {activeTab === "stack" && <StackTab />}
          {activeTab === "proyeccion" && <ProyeccionTab />}
        </div>

        <p className="mt-8 pt-4 border-t border-border-color text-[10px] text-text-muted font-mono">
          Fuentes: Glassdoor, BLS, Coursera, LinkedIn, PwC AI Jobs Barometer,
          WEF Future of Jobs 2025, IMARC Group, 365 Data Science, InterviewQuery.
        </p>
      </div>
    </section>
  );
}
