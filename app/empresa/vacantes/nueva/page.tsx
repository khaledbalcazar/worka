"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CITIES, CONTRACT_TYPES, INDUSTRIES } from "@/lib/mock-data";
import type { ContractType, Modality } from "@/lib/types";
import { createJob } from "@/app/actions";

// Plantillas de vacante: publicar en 2 minutos en vez de 15.
const TEMPLATES = [
  {
    name: "Vendedor/a de salón",
    industry: "Ventas",
    description:
      "Atención al cliente en salón, asesoramiento sobre productos, manejo de caja y reposición. Buscamos personas proactivas con buen trato. Horario comercial de lunes a sábado.",
    questions: ["¿Podés trabajar fines de semana?", "¿Tenés experiencia en ventas?"],
    requirements: ["Mayor de 18 años", "Secundaria completa"],
    benefits: ["IPS", "Comisiones por venta"],
  },
  {
    name: "Repartidor/a",
    industry: "Logística",
    description:
      "Reparto de productos en moto o camioneta de la empresa. Registro de conducir al día. Conocimiento de la zona. Combustible a cargo de la empresa.",
    questions: ["¿Tenés registro de conducir vigente?", "¿Conocés bien la zona?"],
    requirements: ["Registro de conducir vigente"],
    benefits: ["Combustible a cargo de la empresa", "IPS"],
  },
  {
    name: "Atención al cliente",
    industry: "Atención al Cliente",
    description:
      "Recepción de consultas por teléfono y WhatsApp, resolución de reclamos y derivación de casos. Buena comunicación escrita y oral. Manejo básico de computadora.",
    questions: ["¿Tenés manejo básico de computadora?"],
    requirements: ["Manejo básico de computadora", "Buena comunicación"],
    benefits: ["IPS", "Horario fijo"],
  },
  {
    name: "Ayudante de cocina",
    industry: "Gastronomía",
    description:
      "Preparación de ingredientes, limpieza de estación de trabajo y apoyo general en cocina. Se valora ganas de aprender. No se requiere experiencia.",
    questions: ["¿Podés trabajar en horario nocturno?"],
    requirements: ["Ganas de aprender"],
    benefits: ["Comida incluida", "IPS"],
  },
];

// Patrones típicos de estafa laboral: se revisan antes de publicar.
const SCAM_PATTERNS = [
  "inversión inicial",
  "pequeña inversión",
  "depósito previo",
  "pagar para empezar",
  "kit de arranque",
  "ganancias ilimitadas",
];

// Descripción mínima recomendada. No bloquea la publicación —eso lo decide
// canPublish—, pero por debajo de esto el aviso no le dice gran cosa a nadie.
const DESC_RECOMENDADA = 80;

/* ── Piezas ─────────────────────────────────────────────────────────────── */

function Seccion({
  titulo,
  ayuda,
  extra,
  children,
}: {
  titulo: string;
  ayuda?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border border-slate-100 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{titulo}</h2>
          {ayuda && <p className="text-xs text-slate-400 mt-0.5">{ayuda}</p>}
        </div>
        {extra}
      </div>
      {children}
    </section>
  );
}

function Campo({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold block mb-1.5 text-slate-500">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs mt-1 text-slate-400">{hint}</p>}
    </div>
  );
}

// Casilla dibujada a mano en vez de <input type="checkbox">: la nativa la
// pinta el sistema operativo y en Windows sale gris y cuadrada, al lado de
// botones azules redondeados.
function Casilla({
  on,
  onToggle,
  titulo,
  desc,
}: {
  on: boolean;
  onToggle: () => void;
  titulo: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className="w-full flex items-center gap-3 text-left cursor-pointer"
    >
      <span
        className={`w-5 h-5 rounded border-2 grid place-items-center shrink-0 transition-colors ${
          on ? "border-blue-600 bg-blue-600" : "border-slate-200"
        }`}
      >
        {on && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
            <path
              d="M1 4l3 3 5-6"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span>
        <span className="block text-sm font-semibold text-slate-800">
          {titulo}
        </span>
        <span className="block text-xs text-slate-400">{desc}</span>
      </span>
    </button>
  );
}

function Aviso({
  tono,
  titulo,
  children,
}: {
  tono: "rojo" | "ambar" | "verde";
  titulo: string;
  children: React.ReactNode;
}) {
  const c = {
    rojo: "bg-red-50 border-red-200 text-red-700",
    ambar: "bg-amber-50 border-amber-200 text-amber-800",
    verde: "bg-emerald-50 border-emerald-200 text-emerald-800",
  }[tono];
  return (
    <div className={`rounded-xl p-4 border ${c}`}>
      <p className="text-xs font-bold mb-1">{titulo}</p>
      <p className="text-xs leading-relaxed">{children}</p>
    </div>
  );
}

// Editor de listas simples (requisitos / beneficios)
function ListEditor({
  items,
  setItems,
  placeholder,
  max = 8,
}: {
  items: string[];
  setItems: (v: string[]) => void;
  placeholder: string;
  max?: number;
}) {
  const [draft, setDraft] = useState("");
  function add() {
    const value = draft.trim();
    if (!value || items.length >= max || items.includes(value)) return;
    setItems([...items, value]);
    setDraft("");
  }
  return (
    <div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200"
            >
              {item}
              <button
                aria-label={`Quitar ${item}`}
                className="leading-none hover:text-red-500 cursor-pointer"
                onClick={() => setItems(items.filter((x) => x !== item))}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {items.length < max && (
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <button
            className="px-3 rounded-xl text-sm font-semibold shrink-0 bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
            onClick={add}
          >
            + Agregar
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Página ─────────────────────────────────────────────────────────────── */

export default function NewJobPage() {
  const [title, setTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [customIndustryOpen, setCustomIndustryOpen] = useState(false);
  const [city, setCity] = useState("");
  const [modality, setModality] = useState<Modality>("Presencial");
  const [contractType, setContractType] = useState<ContractType | "">("");
  const [salary, setSalary] = useState("");
  const [schedule, setSchedule] = useState("");
  const [address, setAddress] = useState("");
  const [transit, setTransit] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [vacancies, setVacancies] = useState(1);
  const [expiresAt, setExpiresAt] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  // Preguntas eliminatorias: responder "No" descarta automáticamente.
  const [knockouts, setKnockouts] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [noExperience, setNoExperience] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const scamHits = useMemo(() => {
    const text = `${title} ${description}`.toLowerCase();
    return SCAM_PATTERNS.filter((p) => text.includes(p));
  }, [title, description]);

  const transitRequired = modality === "Presencial";
  const canPublish = !!(
    title &&
    industry &&
    city &&
    description &&
    (!transitRequired || transit) &&
    scamHits.length === 0
  );

  // Calidad del aviso: guía a la empresa a publicar completo.
  const quality = useMemo(() => {
    const checks = [
      { label: "Título del puesto", done: !!title },
      {
        label: "Descripción completa",
        done: description.length >= DESC_RECOMENDADA,
      },
      { label: "Rubro y ciudad", done: !!(industry && city) },
      { label: "Salario visible", done: !!salary },
      { label: "Horario", done: !!schedule },
      { label: "Requisitos", done: requirements.length > 0 },
      { label: "Beneficios", done: benefits.length > 0 },
      { label: "Preguntas de filtro", done: questions.length > 0 },
      {
        label: "Cómo llegar",
        done: modality === "Remoto" || !!(address || transit),
      },
    ];
    const pct = Math.round(
      (checks.filter((c) => c.done).length / checks.length) * 100
    );
    return { checks, pct };
  }, [
    title,
    description,
    industry,
    city,
    salary,
    schedule,
    requirements,
    benefits,
    questions,
    modality,
    address,
    transit,
  ]);

  const qColor =
    quality.pct >= 70 ? "#10b981" : quality.pct >= 40 ? "#f59e0b" : "#ef4444";
  const qLabel =
    quality.pct >= 70 ? "Excelente" : quality.pct >= 40 ? "Regular" : "Básico";

  function applyTemplate(t: (typeof TEMPLATES)[number]) {
    setTitle(t.name);
    setIndustry(t.industry);
    setCustomIndustryOpen(false);
    setDescription(t.description);
    setQuestions(t.questions);
    setRequirements(t.requirements);
    setBenefits(t.benefits);
  }

  function agregarPregunta() {
    const q = newQuestion.trim();
    if (!q || questions.length >= 3 || questions.includes(q)) return;
    setQuestions([...questions, q]);
    setNewQuestion("");
  }

  function publish() {
    setError(null);
    startTransition(async () => {
      const result = await createJob({
        title,
        description,
        industry,
        modality,
        contract_type: contractType || null,
        salary_range: salary || null,
        schedule: schedule || null,
        address: address || null,
        nearby_transit: transit || null,
        requirements,
        benefits,
        vacancies_count: vacancies,
        expires_at: expiresAt || null,
        urgent,
        requires_experience: !noExperience,
        questions: questions.map((q) => ({
          question: q,
          knockout: knockouts.includes(q),
        })),
      });
      if (result.ok) setPublished(true);
      else setError(result.error ?? "No pudimos publicar la vacante.");
    });
  }

  if (published) {
    return (
      <div className="grid place-items-center min-h-[400px]">
        <div className="text-center max-w-sm">
          <p className="text-5xl mb-5">🎉</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            ¡Vacante publicada!
          </h1>
          <p className="text-sm leading-relaxed text-slate-500 mb-6">
            <strong className="text-slate-800">{title}</strong> ya está visible
            en el feed y optimizada para aparecer en Google. Te avisamos cuando
            lleguen las primeras postulaciones.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/empresa"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Ir al panel
            </Link>
            <Link
              href="/empleos"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-blue-600 to-blue-700"
            >
              Ver en el feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* ── Encabezado ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <Link
            href="/empresa"
            className="text-xs font-semibold text-slate-500 hover:underline"
          >
            ← Volver al panel
          </Link>
          <h1 className="text-lg font-bold text-slate-900 mt-2">
            Nueva vacante
          </h1>
          <p className="text-sm text-slate-500">
            Cuanto más completo el aviso, más rápido llega el candidato correcto.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/empresa"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </Link>
          <button
            onClick={publish}
            disabled={!canPublish || pending}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              canPublish && !pending
                ? "text-white bg-gradient-to-br from-blue-600 to-blue-700 cursor-pointer"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {pending ? "Publicando…" : "✓ Publicar vacante"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-start">
        {/* ── Formulario ────────────────────────────────────────────────── */}
        <div className="flex-1 space-y-4 min-w-0 w-full">
          <Seccion titulo="Inicio rápido" ayuda="Cargá un aviso base y editalo">
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => applyTemplate(t)}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold border border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  {t.name}
                </button>
              ))}
            </div>
          </Seccion>

          <Seccion titulo="Datos principales">
            <Campo label="Título del puesto *">
              <input
                className="input"
                placeholder="Ej: Cajero/a para sucursal centro"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Campo>

            <div className="grid sm:grid-cols-2 gap-3">
              <Campo label="Rubro *">
                <select
                  className="input cursor-pointer"
                  value={customIndustryOpen ? "__otro" : industry}
                  onChange={(e) => {
                    if (e.target.value === "__otro") {
                      setCustomIndustryOpen(true);
                      setIndustry("");
                    } else {
                      setCustomIndustryOpen(false);
                      setIndustry(e.target.value);
                    }
                  }}
                >
                  <option value="">Elegí el rubro</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                  <option value="__otro">➕ Otro rubro (escribilo)</option>
                </select>
                {customIndustryOpen && (
                  <>
                    <input
                      className="input mt-2"
                      placeholder="Escribí el rubro (ej: Veterinaria)"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    />
                    <p className="text-xs text-amber-600 mt-1">
                      ⏳ Los rubros nuevos pasan a revisión del equipo de Worka
                      para convertirse en etiqueta oficial.
                    </p>
                  </>
                )}
              </Campo>

              <Campo label="Ciudad *">
                <select
                  className="input cursor-pointer"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">Elegí la ciudad</option>
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Campo>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Campo label="Modalidad *">
                {/* Tres botones y no un desplegable: son tres opciones fijas y
                    la modalidad decide si aparece la sección de ubicación, así
                    que conviene que se vea de un golpe cuál está elegida. */}
                <div className="flex gap-2">
                  {(["Presencial", "Híbrido", "Remoto"] as Modality[]).map(
                    (m) => (
                      <button
                        key={m}
                        onClick={() => setModality(m)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                          modality === m
                            ? "bg-blue-50 border-blue-600 text-blue-700"
                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        {m}
                      </button>
                    )
                  )}
                </div>
              </Campo>

              <Campo label="Tipo de contrato">
                <select
                  className="input cursor-pointer"
                  value={contractType}
                  onChange={(e) =>
                    setContractType(e.target.value as ContractType | "")
                  }
                >
                  <option value="">Sin especificar</option>
                  {CONTRACT_TYPES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Campo>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <Campo label="Salario" hint="Visible en la oferta">
                <input
                  className="input"
                  placeholder="Ej: Gs. 2.800.000"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
              </Campo>
              <Campo label="Cantidad de puestos">
                <input
                  type="number"
                  min={1}
                  max={50}
                  className="input"
                  value={vacancies}
                  onChange={(e) =>
                    setVacancies(Math.max(1, Number(e.target.value) || 1))
                  }
                />
              </Campo>
              <Campo label="Vence el" hint="Si no elegís, vence en 30 días">
                <input
                  type="date"
                  className="input"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </Campo>
            </div>

            <Campo label="Horario">
              <input
                className="input"
                placeholder="Ej: Lunes a viernes de 8:00 a 17:00"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              />
            </Campo>
          </Seccion>

          {modality !== "Remoto" && (
            <Seccion
              titulo="Cómo llegar"
              ayuda="Con la dirección, el candidato abre la ruta en Maps o Moovit con un toque"
            >
              <Campo label="Dirección del lugar de trabajo">
                <input
                  className="input"
                  placeholder="Ej: Palma 850 casi Ayolas, Asunción"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Campo>
              <Campo
                label={`Líneas de colectivo cercanas ${transitRequired ? "*" : ""}`}
                hint={
                  transitRequired
                    ? "Obligatorio para vacantes presenciales"
                    : undefined
                }
              >
                <input
                  className="input"
                  placeholder="Ej: Líneas 12, 30 y 56"
                  value={transit}
                  onChange={(e) => setTransit(e.target.value)}
                />
              </Campo>
            </Seccion>
          )}

          <Seccion titulo="Descripción del puesto *">
            <textarea
              rows={6}
              className="input min-h-32 resize-none"
              placeholder="Contá qué va a hacer la persona, cómo es el equipo y qué buscás…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex items-center justify-between -mt-2">
              <p
                className={`text-xs ${
                  description.length > 0 && description.length < DESC_RECOMENDADA
                    ? "text-amber-600"
                    : "text-slate-400"
                }`}
              >
                {description.length > 0 && description.length < DESC_RECOMENDADA
                  ? `Recomendado: ${DESC_RECOMENDADA} caracteres (faltan ${DESC_RECOMENDADA - description.length})`
                  : `${description.length} caracteres`}
              </p>
              {scamHits.length > 0 && (
                <p className="text-xs font-semibold text-red-500">
                  ⚠ Contenido sospechoso
                </p>
              )}
            </div>
            {scamHits.length > 0 && (
              <Aviso tono="rojo" titulo="⚠ No se puede publicar así">
                El aviso menciona «{scamHits[0]}». En Worka ninguna oferta puede
                pedirle dinero al candidato; quitá esa parte para poder publicar.
              </Aviso>
            )}
          </Seccion>

          <Seccion
            titulo="Requisitos y beneficios"
            ayuda="Cortos y concretos: se leen de un vistazo"
          >
            <Campo label="Requisitos">
              <ListEditor
                items={requirements}
                setItems={setRequirements}
                placeholder="Ej: Secundaria completa"
              />
            </Campo>
            <Campo label="Beneficios">
              <ListEditor
                items={benefits}
                setItems={setBenefits}
                placeholder="Ej: IPS, comida, comisiones"
              />
            </Campo>
          </Seccion>

          <Seccion
            titulo="Preguntas de filtro"
            ayuda="El candidato responde Sí/No al postularse"
            extra={
              <span className="font-mono-data text-xs font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                {questions.length}/3
              </span>
            }
          >
            {questions.length > 0 && (
              <div className="space-y-2">
                {questions.map((q) => {
                  const eliminatoria = knockouts.includes(q);
                  return (
                    <div
                      key={q}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <p className="text-sm flex-1 text-slate-700 min-w-0 truncate">
                        {q}
                      </p>
                      <button
                        onClick={() =>
                          setKnockouts((prev) =>
                            eliminatoria
                              ? prev.filter((x) => x !== q)
                              : [...prev, q]
                          )
                        }
                        title='Eliminatoria: si responde "No", se descarta automáticamente'
                        className={`text-xs px-2 py-1 rounded-lg font-semibold shrink-0 border transition-colors cursor-pointer ${
                          eliminatoria
                            ? "bg-red-50 text-red-600 border-red-200"
                            : "bg-white text-slate-400 border-slate-200 hover:text-red-500 hover:border-red-200"
                        }`}
                      >
                        {eliminatoria ? "🚫 Eliminatoria" : "Eliminatoria"}
                      </button>
                      <button
                        aria-label={`Quitar ${q}`}
                        onClick={() => {
                          setQuestions(questions.filter((x) => x !== q));
                          setKnockouts((prev) => prev.filter((x) => x !== q));
                        }}
                        className="text-slate-300 hover:text-red-400 shrink-0 text-base leading-none cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {questions.length < 3 && (
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="Ej: ¿Podés trabajar fines de semana?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      agregarPregunta();
                    }
                  }}
                />
                <button
                  onClick={agregarPregunta}
                  className="px-3 rounded-xl text-sm font-semibold shrink-0 bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                >
                  + Agregar
                </button>
              </div>
            )}
            {knockouts.length > 0 && (
              <Aviso tono="ambar" titulo="Ojo con las eliminatorias">
                Las preguntas marcadas descartan solas a quien responda «No».
                Usalas únicamente para requisitos que de verdad son excluyentes.
              </Aviso>
            )}
          </Seccion>

          <Seccion titulo="Extras">
            <Casilla
              on={urgent}
              onToggle={() => setUrgent((v) => !v)}
              titulo="⚡ Contratación inmediata"
              desc="La vacante se muestra con la etiqueta de urgente"
            />
            <Casilla
              on={noExperience}
              onToggle={() => setNoExperience((v) => !v)}
              titulo="✨ Primer empleo bienvenido"
              desc="Aparece en el modo primer empleo y llega a más candidatos"
            />
          </Seccion>

          {error && (
            <Aviso tono="rojo" titulo="No pudimos publicar">
              {error}
            </Aviso>
          )}
        </div>

        {/* ── Calidad ───────────────────────────────────────────────────── */}
        <aside className="w-full lg:w-56 shrink-0 space-y-3 lg:sticky lg:top-20">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[.08em] text-slate-400 mb-3">
              Calidad
            </p>
            <div className="flex items-end gap-2 mb-3">
              <p
                className="font-mono-data font-bold text-4xl leading-none tracking-tight"
                style={{ color: qColor }}
              >
                {quality.pct}%
              </p>
              <p
                className="text-sm font-semibold mb-0.5"
                style={{ color: qColor }}
              >
                {qLabel}
              </p>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-4 bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${quality.pct}%`, background: qColor }}
              />
            </div>
            <div className="space-y-2.5">
              {quality.checks.map((c) => (
                <div key={c.label} className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full shrink-0 grid place-items-center border-[1.5px] ${
                      c.done
                        ? "bg-emerald-50 border-emerald-500"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    {c.done && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden>
                        <path
                          d="M1 3l2 2 4-4"
                          stroke="#10b981"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <p
                    className={`text-xs ${c.done ? "text-slate-700" : "text-slate-400"}`}
                  >
                    {c.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {transitRequired && !transit && title && (
            <Aviso tono="ambar" titulo="⚠ Falta el transporte">
              Las vacantes presenciales tienen que decir cómo se llega. Sin eso
              no se puede publicar.
            </Aviso>
          )}

          <Aviso tono="verde" titulo="💡 Tip">
            Los avisos completos (70% o más) reciben en promedio el doble de
            postulaciones y aparecen mejor posicionados en Google.
          </Aviso>
        </aside>
      </div>
    </div>
  );
}
