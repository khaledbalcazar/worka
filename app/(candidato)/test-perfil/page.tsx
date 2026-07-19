"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { INDUSTRIES } from "@/lib/mock-data";
import { updateCandidatePrefs } from "@/app/actions";

// Test de perfil (match express): 4 preguntas rápidas que afinan el orden
// del feed. Las respuestas se guardan en el perfil y alimentan "Para vos".
const MODALITY_OPTIONS = [
  { value: "Presencial", label: "🏢 Presencial", hint: "Voy al lugar de trabajo" },
  { value: "Híbrido", label: "🔀 Híbrido", hint: "Mezcla de casa y oficina" },
  { value: "Remoto", label: "🏠 Remoto", hint: "Desde casa" },
  { value: "", label: "🤷 Me da igual", hint: "Cualquier modalidad" },
];

export default function ProfileTestPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [modality, setModality] = useState<string | null>(null);
  const [firstJob, setFirstJob] = useState<boolean | null>(null);
  const [otherCities, setOtherCities] = useState<boolean | null>(null);
  const [industries, setIndustries] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function finish() {
    startTransition(async () => {
      await updateCandidatePrefs({
        preferences_modality: modality || "Cualquiera",
        first_job_mode: firstJob ?? false,
        open_to_other_cities: otherCities ?? false,
        ...(industries.length > 0 ? { preferences_industry: industries } : {}),
      });
      setDone(true);
    });
  }

  const steps = [
    {
      title: "¿Cómo preferís trabajar?",
      content: (
        <div className="space-y-2">
          {MODALITY_OPTIONS.map((o) => (
            <button
              key={o.label}
              className={`card w-full p-4 text-left border-2 ${
                modality === o.value && modality !== null
                  ? "border-primary bg-blue-50"
                  : "border-transparent hover:border-gray-200"
              }`}
              onClick={() => {
                setModality(o.value);
                setStep(1);
              }}
            >
              <p className="font-medium text-primary-dark">{o.label}</p>
              <p className="text-xs text-gray-500">{o.hint}</p>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "¿Es tu primer empleo?",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {[
            { v: true, label: "✨ Sí, busco mi primera oportunidad" },
            { v: false, label: "💼 Ya tengo experiencia" },
          ].map((o) => (
            <button
              key={o.label}
              className={`card p-5 text-center border-2 ${
                firstJob === o.v
                  ? "border-primary bg-blue-50"
                  : "border-transparent hover:border-gray-200"
              }`}
              onClick={() => {
                setFirstJob(o.v);
                setStep(2);
              }}
            >
              <p className="font-medium text-primary-dark text-sm">{o.label}</p>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "¿Aceptarías trabajo en otra ciudad?",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {[
            { v: true, label: "🚌 Sí, me puedo mover" },
            { v: false, label: "📍 Solo en mi ciudad" },
          ].map((o) => (
            <button
              key={o.label}
              className={`card p-5 text-center border-2 ${
                otherCities === o.v
                  ? "border-primary bg-blue-50"
                  : "border-transparent hover:border-gray-200"
              }`}
              onClick={() => {
                setOtherCities(o.v);
                setStep(3);
              }}
            >
              <p className="font-medium text-primary-dark text-sm">{o.label}</p>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "¿En qué rubros te ves? (elegí hasta 4)",
      content: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((ind) => {
              const on = industries.includes(ind);
              return (
                <button
                  key={ind}
                  className={`chip min-h-10 px-4 ${
                    on ? "bg-primary text-white" : "bg-surface text-gray-600"
                  }`}
                  onClick={() =>
                    setIndustries((prev) =>
                      on
                        ? prev.filter((x) => x !== ind)
                        : prev.length < 4
                          ? [...prev, ind]
                          : prev
                    )
                  }
                >
                  {ind}
                </button>
              );
            })}
          </div>
          <button
            className="btn-primary w-full text-base"
            disabled={pending}
            onClick={finish}
          >
            {pending ? "Guardando…" : "Ver mis empleos recomendados 🎯"}
          </button>
        </div>
      ),
    },
  ];

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-3 animate-pop">
        <p className="text-5xl">🎯</p>
        <h1 className="text-xl font-bold text-primary-dark">
          ¡Listo! Tu feed ahora es para vos
        </h1>
        <p className="text-sm text-gray-500">
          Ordenamos las vacantes según tus respuestas. Cada empleo recomendado
          muestra su porcentaje de match con tu perfil.
        </p>
        <button
          className="btn-primary w-full text-base"
          onClick={() => router.push("/empleos")}
        >
          Ver empleos para mí
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div>
        <Link href="/empleos" className="text-sm text-primary font-medium">
          ← Volver al feed
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-xl font-bold text-primary-dark">
            🎯 Test de perfil
          </h1>
          <span className="text-xs text-gray-400">
            {step + 1} de {steps.length}
          </span>
        </div>
        <div className="h-1.5 bg-surface rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="font-semibold text-primary-dark">{steps[step].title}</h2>
      {steps[step].content}

      {step > 0 && (
        <button
          className="text-sm text-gray-400"
          onClick={() => setStep((s) => s - 1)}
        >
          ← Anterior
        </button>
      )}
    </div>
  );
}
