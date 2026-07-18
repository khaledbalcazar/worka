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
    if (!value || items.length >= max) return;
    setItems([...items, value]);
    setDraft("");
  }
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((item) => (
          <span
            key={item}
            className="chip bg-surface text-gray-700 border border-gray-200"
          >
            {item}
            <button
              aria-label={`Quitar ${item}`}
              className="ml-1 text-gray-400 hover:text-danger"
              onClick={() => setItems(items.filter((x) => x !== item))}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
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
          <button className="btn-secondary shrink-0" onClick={add}>
            Agregar
          </button>
        </div>
      )}
    </div>
  );
}

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
  const canPublish =
    title &&
    industry &&
    city &&
    description &&
    (!transitRequired || transit) &&
    scamHits.length === 0;

  // Calidad del aviso: guía a la empresa a publicar completo.
  const quality = useMemo(() => {
    const checks = [
      { label: "Título y descripción", done: !!(title && description) },
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
  }, [title, description, salary, schedule, requirements, benefits, questions, modality, address, transit]);

  function applyTemplate(t: (typeof TEMPLATES)[number]) {
    setTitle(t.name);
    setIndustry(t.industry);
    setDescription(t.description);
    setQuestions(t.questions);
    setRequirements(t.requirements);
    setBenefits(t.benefits);
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
      <div className="max-w-xl mx-auto text-center py-16 space-y-3 animate-pop">
        <p className="text-5xl">🎉</p>
        <h1 className="text-2xl font-bold text-primary-dark">
          ¡Vacante publicada!
        </h1>
        <p className="text-gray-500">
          Ya está visible en el feed y optimizada para aparecer en Google. Te
          avisamos cuando lleguen las primeras postulaciones.
        </p>
        <div className="flex gap-3 justify-center mt-4">
          <Link href="/empresa" className="btn-primary">
            Volver al panel
          </Link>
          <Link href="/empleos" className="btn-secondary">
            Ver en el feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6 pb-10">
      <div>
        <Link href="/empresa" className="text-sm text-primary font-medium">
          ← Volver al panel
        </Link>
        <h1 className="text-2xl font-bold text-primary-dark mt-1">
          Publicar nueva vacante
        </h1>
        <p className="text-sm text-gray-500">
          Cuanto más completo el aviso, más rápido llega el candidato correcto.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-6 lg:items-start space-y-6 lg:space-y-0">
        <div className="space-y-6">
          {/* Plantillas */}
          <section className="card p-5">
            <h2 className="font-semibold text-primary-dark mb-3">
              ⚡ Empezá con una plantilla
            </h2>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  className="chip min-h-9 px-4 bg-surface text-gray-700 border border-gray-200 hover:border-primary hover:text-primary"
                  onClick={() => applyTemplate(t)}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </section>

          {/* Datos principales */}
          <section className="card p-5 space-y-4">
            <h2 className="font-semibold text-primary-dark">El puesto</h2>
            <div>
              <label className="label">Título del puesto *</label>
              <input
                className="input"
                placeholder="Ej: Cajero/a para sucursal centro"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Rubro *</label>
                <select
                  className="input"
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
              </div>
              <div>
                <label className="label">Ciudad *</label>
                <select
                  className="input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">Elegí la ciudad</option>
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Modalidad *</label>
                <select
                  className="input"
                  value={modality}
                  onChange={(e) => setModality(e.target.value as Modality)}
                >
                  <option>Presencial</option>
                  <option>Híbrido</option>
                  <option>Remoto</option>
                </select>
              </div>
              <div>
                <label className="label">Tipo de contrato</label>
                <select
                  className="input"
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
              </div>
              <div>
                <label className="label">Salario (recomendado)</label>
                <input
                  className="input"
                  placeholder="Ej: Gs. 2.800.000 + bonificaciones"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Horario</label>
                <input
                  className="input"
                  placeholder="Ej: Lunes a viernes de 8:00 a 17:00"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Cantidad de puestos</label>
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
              </div>
              <div>
                <label className="label">Vigencia (hasta cuándo se ve)</label>
                <input
                  type="date"
                  className="input"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Si no elegís fecha, vence en 30 días. La podés cambiar después.
                </p>
              </div>
            </div>
            <div>
              <label className="label">Descripción *</label>
              <textarea
                className="input min-h-32"
                placeholder="Contá qué va a hacer la persona, cómo es el equipo y qué buscás…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {scamHits.length > 0 && (
              <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3">
                ⚠️ El aviso menciona &ldquo;{scamHits[0]}&rdquo;. En Worka
                ninguna oferta puede pedir dinero al candidato; quitá esa parte
                para poder publicar.
              </p>
            )}
          </section>

          {/* Ubicación */}
          {modality !== "Remoto" && (
            <section className="card p-5 space-y-4">
              <h2 className="font-semibold text-primary-dark">
                📍 Cómo llegar
              </h2>
              <div>
                <label className="label">Dirección del lugar de trabajo</label>
                <input
                  className="input"
                  placeholder="Ej: Palma 850 casi Ayolas, Asunción"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Con la dirección, el candidato abre la ruta en Google Maps o
                  Moovit con un toque.
                </p>
              </div>
              <div>
                <label className="label">
                  Líneas de colectivo cercanas {transitRequired && "*"}
                </label>
                <input
                  className="input"
                  placeholder="Ej: Líneas 12, 30 y 56"
                  value={transit}
                  onChange={(e) => setTransit(e.target.value)}
                />
              </div>
            </section>
          )}

          {/* Requisitos y beneficios */}
          <section className="card p-5 space-y-5">
            <div>
              <h2 className="font-semibold text-primary-dark mb-1">
                ✅ Requisitos
              </h2>
              <p className="text-xs text-gray-400 mb-2">
                Cortos y concretos. Ej: &ldquo;Registro profesional
                vigente&rdquo;.
              </p>
              <ListEditor
                items={requirements}
                setItems={setRequirements}
                placeholder="Escribí un requisito y Enter"
              />
            </div>
            <div>
              <h2 className="font-semibold text-primary-dark mb-1">
                🎁 Beneficios
              </h2>
              <p className="text-xs text-gray-400 mb-2">
                IPS, comida, uniforme, comisiones… todo suma para atraer.
              </p>
              <ListEditor
                items={benefits}
                setItems={setBenefits}
                placeholder="Escribí un beneficio y Enter"
              />
            </div>
          </section>

          {/* Preguntas de filtro */}
          <section className="card p-5">
            <h2 className="font-semibold text-primary-dark mb-1">
              Preguntas de filtro (máx. 3)
            </h2>
            <p className="text-xs text-gray-400 mb-3">
              El candidato responde Sí/No al postularse: leés solo perfiles que
              aplican.
            </p>
            <div className="space-y-2">
              {questions.map((q) => {
                const isKnockout = knockouts.includes(q);
                return (
                  <div
                    key={q}
                    className="flex items-center justify-between gap-2 bg-surface rounded-xl px-4 py-2.5 text-sm"
                  >
                    <span className="text-gray-700 min-w-0 truncate">{q}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        className={`chip border ${
                          isKnockout
                            ? "bg-red-50 text-red-600 border-red-200"
                            : "bg-white text-gray-400 border-gray-200 hover:border-red-200 hover:text-red-500"
                        }`}
                        title='Eliminatoria: si responde "No", se descarta automáticamente'
                        onClick={() =>
                          setKnockouts((prev) =>
                            isKnockout
                              ? prev.filter((x) => x !== q)
                              : [...prev, q]
                          )
                        }
                      >
                        {isKnockout ? "🚫 Eliminatoria" : "Hacer eliminatoria"}
                      </button>
                      <button
                        aria-label="Quitar pregunta"
                        className="text-gray-400 hover:text-danger"
                        onClick={() =>
                          setQuestions(questions.filter((x) => x !== q))
                        }
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
              {questions.length < 3 && (
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="Ej: ¿Podés trabajar fines de semana?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newQuestion.trim()) {
                        e.preventDefault();
                        setQuestions([...questions, newQuestion.trim()]);
                        setNewQuestion("");
                      }
                    }}
                  />
                  <button
                    className="btn-secondary shrink-0"
                    onClick={() => {
                      if (newQuestion.trim()) {
                        setQuestions([...questions, newQuestion.trim()]);
                        setNewQuestion("");
                      }
                    }}
                  >
                    Agregar
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Extras */}
          <section className="card p-5 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={urgent}
                onChange={(e) => setUrgent(e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Contratación inmediata
                </p>
                <p className="text-xs text-gray-500">
                  La vacante se muestra con la etiqueta de urgente.
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={noExperience}
                onChange={(e) => setNoExperience(e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  ✨ No se requiere experiencia
                </p>
                <p className="text-xs text-gray-500">
                  Aparece en el modo primer empleo y llega a más candidatos.
                </p>
              </div>
            </label>
          </section>

          {error && (
            <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <Link href="/empresa" className="btn-secondary">
              Cancelar
            </Link>
            <button
              className="btn-primary px-8"
              disabled={!canPublish || pending}
              onClick={publish}
            >
              {pending ? "Publicando…" : "Publicar vacante"}
            </button>
          </div>
        </div>

        {/* Barra lateral: calidad del aviso */}
        <aside className="card p-5 lg:sticky lg:top-6">
          <h2 className="font-semibold text-primary-dark text-sm">
            Calidad del aviso
          </h2>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 h-2.5 bg-surface rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  quality.pct >= 70
                    ? "bg-success"
                    : quality.pct >= 40
                      ? "bg-amber-400"
                      : "bg-danger"
                }`}
                style={{ width: `${quality.pct}%` }}
              />
            </div>
            <span className="text-sm font-bold text-primary-dark">
              {quality.pct}%
            </span>
          </div>
          <ul className="mt-4 space-y-1.5">
            {quality.checks.map((c) => (
              <li
                key={c.label}
                className={`text-sm flex items-center gap-2 ${
                  c.done ? "text-gray-500" : "text-gray-700"
                }`}
              >
                <span>{c.done ? "✅" : "⬜"}</span> {c.label}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            Los avisos completos (70%+) reciben en promedio el doble de
            postulaciones y aparecen mejor posicionados en Google.
          </p>
        </aside>
      </div>
    </div>
  );
}
