"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ContractType, JobWithCompany, Modality } from "@/lib/types";
import { CITIES, CONTRACT_TYPES, INDUSTRIES } from "@/lib/mock-data";
import { updateJob } from "@/app/actions";

// Edición de vacante: mismos campos clave que la publicación, prellenados.
export default function JobEditForm({ job }: { job: JobWithCompany }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: job.title,
    description: job.description,
    industry: job.industry,
    modality: job.modality as Modality,
    contract_type: (job.contract_type ?? "") as ContractType | "",
    salary_range: job.salary_range ?? "",
    schedule: job.schedule ?? "",
    address: job.address ?? "",
    nearby_transit: job.nearby_transit ?? "",
    vacancies_count: job.vacancies_count,
    urgent: job.urgent,
    requires_experience: job.requires_experience,
  });
  const [requirements, setRequirements] = useState<string[]>(job.requirements);
  const [benefits, setBenefits] = useState<string[]>(job.benefits);
  const [reqDraft, setReqDraft] = useState("");
  const [benDraft, setBenDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const customIndustry = !INDUSTRIES.includes(form.industry);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateJob(job.id, {
        ...form,
        contract_type: form.contract_type || null,
        salary_range: form.salary_range || null,
        schedule: form.schedule || null,
        address: form.address || null,
        nearby_transit: form.nearby_transit || null,
        requirements,
        benefits,
      });
      if (result.ok) {
        setSaved(true);
        setTimeout(() => router.push("/empresa"), 1200);
      } else setError(result.error ?? "No pudimos guardar.");
    });
  }

  return (
    <div className="max-w-3xl space-y-5 pb-10">
      <div>
        <Link href="/empresa" className="text-sm text-primary font-medium">
          ← Volver al panel
        </Link>
        <h1 className="text-2xl font-bold text-primary-dark mt-1">
          ✏️ Editar vacante
        </h1>
        <p className="text-sm text-gray-500">
          Los cambios se ven al instante en el feed y en Google.
        </p>
      </div>

      <section className="card p-5 space-y-4">
        <div>
          <label className="label">Título *</label>
          <input
            className="input"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Rubro</label>
            <select
              className="input"
              value={customIndustry ? "__custom" : form.industry}
              onChange={(e) =>
                e.target.value !== "__custom" && set("industry", e.target.value)
              }
            >
              {INDUSTRIES.map((i) => (
                <option key={i}>{i}</option>
              ))}
              {customIndustry && (
                <option value="__custom">{form.industry} (personalizado)</option>
              )}
            </select>
          </div>
          <div>
            <label className="label">Modalidad</label>
            <select
              className="input"
              value={form.modality}
              onChange={(e) => set("modality", e.target.value as Modality)}
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
              value={form.contract_type}
              onChange={(e) =>
                set("contract_type", e.target.value as ContractType | "")
              }
            >
              <option value="">Sin especificar</option>
              {CONTRACT_TYPES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Salario</label>
            <input
              className="input"
              value={form.salary_range}
              onChange={(e) => set("salary_range", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Horario</label>
            <input
              className="input"
              value={form.schedule}
              onChange={(e) => set("schedule", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Cantidad de puestos</label>
            <input
              type="number"
              min={1}
              className="input"
              value={form.vacancies_count}
              onChange={(e) =>
                set("vacancies_count", Math.max(1, Number(e.target.value) || 1))
              }
            />
          </div>
        </div>
        <div>
          <label className="label">Descripción *</label>
          <textarea
            className="input min-h-28"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
      </section>

      {form.modality !== "Remoto" && (
        <section className="card p-5 space-y-4">
          <h2 className="font-semibold text-primary-dark">📍 Cómo llegar</h2>
          <div>
            <label className="label">Dirección</label>
            <input
              className="input"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Líneas de colectivo</label>
            <input
              className="input"
              value={form.nearby_transit}
              onChange={(e) => set("nearby_transit", e.target.value)}
            />
          </div>
        </section>
      )}

      <section className="card p-5 space-y-5">
        {(
          [
            ["✅ Requisitos", requirements, setRequirements, reqDraft, setReqDraft],
            ["🎁 Beneficios", benefits, setBenefits, benDraft, setBenDraft],
          ] as const
        ).map(([title, items, setItems, draft, setDraft]) => (
          <div key={title}>
            <h2 className="font-semibold text-primary-dark mb-2">{title}</h2>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {items.map((item) => (
                <span
                  key={item}
                  className="chip bg-surface text-gray-700 border border-gray-200"
                >
                  {item}
                  <button
                    className="ml-1 text-gray-400 hover:text-danger"
                    onClick={() => {
                      setItems(items.filter((x) => x !== item));
                      setSaved(false);
                    }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Agregar…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && draft.trim()) {
                    e.preventDefault();
                    setItems([...items, draft.trim()]);
                    setDraft("");
                    setSaved(false);
                  }
                }}
              />
              <button
                className="btn-secondary shrink-0"
                onClick={() => {
                  if (draft.trim()) {
                    setItems([...items, draft.trim()]);
                    setDraft("");
                    setSaved(false);
                  }
                }}
              >
                Agregar
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="card p-5 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.urgent}
            onChange={(e) => set("urgent", e.target.checked)}
            className="w-5 h-5 accent-primary"
          />
          <span className="text-sm font-medium text-gray-700">
            Contratación inmediata
          </span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!form.requires_experience}
            onChange={(e) => set("requires_experience", !e.target.checked)}
            className="w-5 h-5 accent-primary"
          />
          <span className="text-sm font-medium text-gray-700">
            ✨ No se requiere experiencia
          </span>
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
          className={saved ? "btn-success px-8" : "btn-primary px-8"}
          disabled={pending || !form.title || !form.description}
          onClick={save}
        >
          {saved ? "✓ Guardado" : pending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
