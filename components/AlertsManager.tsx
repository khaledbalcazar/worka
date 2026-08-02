"use client";

import { useState, useTransition } from "react";
import { Bell, Plus, Trash2, Mail, Smartphone } from "lucide-react";
import { CITIES, INDUSTRIES } from "@/lib/mock-data";
import {
  createJobAlert,
  updateJobAlert,
  deleteJobAlert,
} from "@/app/actions";
import type { JobAlert } from "@/lib/types";

const MODALITIES = ["Presencial", "Híbrido", "Remoto"];

export default function AlertsManager({
  alerts: initial,
  country,
}: {
  alerts: JobAlert[];
  country: string;
}) {
  const [alerts, setAlerts] = useState(initial);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    keyword: "",
    industry: "",
    city: "",
    modality: "",
    email_enabled: true,
    inapp_enabled: true,
  });

  function create() {
    setError(null);
    start(async () => {
      const res = await createJobAlert({ ...draft, country });
      if (!res.ok) {
        setError(res.error ?? "No pudimos crear la alerta.");
        return;
      }
      // Optimista: recargamos desde el server con un refresh suave.
      window.location.reload();
    });
  }

  function remove(id: string) {
    setAlerts((a) => a.filter((x) => x.id !== id));
    start(() => void deleteJobAlert(id));
  }

  function toggle(id: string, patch: Partial<JobAlert>) {
    setAlerts((a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    start(() => void updateJobAlert(id, patch));
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div>
        <h1 className="text-lg lg:text-2xl font-bold text-primary-dark flex items-center gap-2">
          <Bell className="w-6 h-6" /> Alertas de empleo
        </h1>
        <p className="text-sm text-gray-500">
          Guardá una búsqueda y te avisamos cuando entren vacantes nuevas —
          tanto de Worka como de otros portales.
        </p>
      </div>

      {/* Crear alerta */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-primary-dark">Nueva alerta</h2>
        <input
          className="input"
          placeholder="Palabra clave (ej: cajero, chofer, diseñador)"
          value={draft.keyword}
          onChange={(e) => setDraft({ ...draft, keyword: e.target.value })}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            className="input"
            value={draft.industry}
            onChange={(e) => setDraft({ ...draft, industry: e.target.value })}
          >
            <option value="">Todos los rubros</option>
            {INDUSTRIES.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
          <select
            className="input"
            value={draft.city}
            onChange={(e) => setDraft({ ...draft, city: e.target.value })}
          >
            <option value="">Todas las ciudades</option>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            className="input"
            value={draft.modality}
            onChange={(e) => setDraft({ ...draft, modality: e.target.value })}
          >
            <option value="">Cualquier modalidad</option>
            {MODALITIES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.inapp_enabled}
              onChange={(e) =>
                setDraft({ ...draft, inapp_enabled: e.target.checked })
              }
            />
            <Smartphone className="w-4 h-4 text-gray-400" /> En la app
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.email_enabled}
              onChange={(e) =>
                setDraft({ ...draft, email_enabled: e.target.checked })
              }
            />
            <Mail className="w-4 h-4 text-gray-400" /> Por email
          </label>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={create}
          disabled={pending}
          className="btn-primary inline-flex items-center gap-1.5 disabled:opacity-60"
        >
          <Plus className="w-4 h-4" /> Crear alerta
        </button>
      </div>

      {/* Mis alertas */}
      {alerts.length === 0 ? (
        <div className="card p-8 text-center text-sm text-gray-400">
          Todavía no tenés alertas. Creá la primera arriba 👆
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-primary-dark">
                    {[a.keyword, a.industry, a.city, a.modality]
                      .filter(Boolean)
                      .join(" · ") || "Todas las vacantes"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.active ? "Activa" : "Pausada"}
                  </p>
                </div>
                <button
                  onClick={() => remove(a.id)}
                  className="text-gray-300 hover:text-red-500"
                  aria-label="Borrar alerta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={a.inapp_enabled}
                    onChange={(e) =>
                      toggle(a.id, { inapp_enabled: e.target.checked })
                    }
                  />
                  <Smartphone className="w-4 h-4 text-gray-400" /> App
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={a.email_enabled}
                    onChange={(e) =>
                      toggle(a.id, { email_enabled: e.target.checked })
                    }
                  />
                  <Mail className="w-4 h-4 text-gray-400" /> Email
                </label>
                <label className="flex items-center gap-2 cursor-pointer ml-auto">
                  <input
                    type="checkbox"
                    checked={a.active}
                    onChange={(e) => toggle(a.id, { active: e.target.checked })}
                  />
                  Activa
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
