"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Candidate, IdentityStatus, WorkReference } from "@/lib/types";
import {
  addWorkReference,
  requestIdentityVerification,
  signOut,
  updateCandidatePrefs,
} from "@/app/actions";

// Medidor de perfil: cada dato completado mejora la visibilidad del candidato.
function profileCompleteness(c: Candidate, hasCv: boolean) {
  const checks: { label: string; done: boolean }[] = [
    { label: "Nombre completo", done: !!c.full_name },
    { label: "WhatsApp", done: !!c.phone_whatsapp },
    { label: "Ciudad", done: !!c.location_city },
    { label: "Rubros de interés", done: c.preferences_industry.length > 0 },
    { label: "WhatsApp verificado", done: c.phone_verified },
    { label: "CV cargado", done: hasCv },
  ];
  const pct = Math.round(
    (checks.filter((x) => x.done).length / checks.length) * 100
  );
  return { checks, pct };
}

export default function ProfileClient({
  candidate,
  references: initialReferences = [],
}: {
  candidate: Candidate;
  references?: WorkReference[];
}) {
  const [firstJobMode, setFirstJobMode] = useState(candidate.first_job_mode);
  const [alertsEnabled, setAlertsEnabled] = useState(candidate.alerts_enabled);
  const [visibleToCompanies, setVisibleToCompanies] = useState(
    candidate.visible_to_companies
  );
  const [publicProfile, setPublicProfile] = useState(candidate.public_profile);
  const [identityStatus, setIdentityStatus] = useState<IdentityStatus>(
    candidate.identity_status
  );
  const [references, setReferences] = useState(initialReferences);
  const [refDraft, setRefDraft] = useState({
    referrer_name: "",
    referrer_phone: "",
    relationship: "",
  });
  const [refFormOpen, setRefFormOpen] = useState(false);
  const [hasCv, setHasCv] = useState(!!candidate.cv_url);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [, startTransition] = useTransition();

  function togglePref(
    key: "visible_to_companies" | "public_profile",
    value: boolean,
    set: (v: boolean) => void
  ) {
    set(value);
    startTransition(() => {
      updateCandidatePrefs({ [key]: value });
    });
  }

  function requestIdentity() {
    setIdentityStatus("pending");
    startTransition(() => {
      requestIdentityVerification();
    });
  }

  function submitReference() {
    if (!refDraft.referrer_name || !refDraft.referrer_phone) return;
    const local: WorkReference = {
      id: `local-${Date.now()}`,
      candidate_id: candidate.id,
      ...refDraft,
      status: "pendiente",
      created_at: new Date().toISOString(),
    };
    setReferences((prev) => [local, ...prev]);
    setRefFormOpen(false);
    setRefDraft({ referrer_name: "", referrer_phone: "", relationship: "" });
    startTransition(() => {
      addWorkReference(refDraft);
    });
  }

  const { checks, pct } = profileCompleteness(candidate, hasCv);

  function toggleFirstJob(value: boolean) {
    setFirstJobMode(value);
    startTransition(() => {
      updateCandidatePrefs({ first_job_mode: value });
    });
  }

  function toggleAlerts(value: boolean) {
    setAlertsEnabled(value);
    startTransition(() => {
      updateCandidatePrefs({ alerts_enabled: value });
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg lg:text-2xl font-bold text-primary-dark">
        Mi perfil
      </h1>

      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-6 lg:items-start space-y-4 lg:space-y-0">
        {/* Columna principal */}
        <div className="space-y-4">
          <div className="card p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shrink-0">
                {candidate.full_name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-primary-dark text-lg">
                  {candidate.full_name}
                </h2>
                <p className="text-sm text-gray-500">
                  📍 {candidate.location_city} · 💬 {candidate.phone_whatsapp}{" "}
                  {candidate.phone_verified && (
                    <span className="chip bg-emerald-50 text-emerald-700 align-middle">
                      ✓ verificado
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Buscando: {candidate.preferences_industry.join(", ") || "—"}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">
                  Tu perfil está al {pct}%
                </span>
                {pct < 100 && (
                  <span className="text-gray-400 text-xs">
                    Completalo y aparecé primero
                  </span>
                )}
              </div>
              <div className="h-2.5 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <ul className="mt-3 grid sm:grid-cols-2 gap-x-4 gap-y-1">
                {checks.map((c) => (
                  <li
                    key={c.label}
                    className={`text-sm flex items-center gap-2 ${
                      c.done ? "text-gray-500" : "text-gray-700 font-medium"
                    }`}
                  >
                    <span>{c.done ? "✅" : "⬜"}</span> {c.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-primary-dark">Mi CV</h2>
            {hasCv ? (
              <div className="flex items-center justify-between gap-3 bg-surface rounded-xl px-4 py-3">
                <p className="text-sm text-gray-700 font-medium">
                  📄 CV cargado
                </p>
                <div className="flex gap-3">
                  <Link href="/cv" className="text-sm text-primary font-medium">
                    Ver / editar
                  </Link>
                  <button
                    className="text-sm text-gray-500 font-medium"
                    onClick={() => setHasCv(false)}
                  >
                    Reemplazar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  Todavía no cargaste tu CV. Podés subir un PDF o{" "}
                  <span className="font-medium text-primary-dark">
                    generar uno gratis con Worka
                  </span>{" "}
                  usando los datos de tu perfil.
                </p>
                <div className="flex gap-2">
                  <button
                    className="btn-secondary flex-1"
                    onClick={() => setHasCv(true)}
                  >
                    Subir PDF
                  </button>
                  <Link href="/cv" className="btn-primary flex-1">
                    ✨ Generar mi CV
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-primary-dark">Preferencias</h2>

            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  ✨ Modo primer empleo
                </p>
                <p className="text-xs text-gray-500">
                  Solo vacantes que no piden experiencia.
                </p>
              </div>
              <input
                type="checkbox"
                checked={firstJobMode}
                onChange={(e) => toggleFirstJob(e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
            </label>

            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  💬 Alertas por WhatsApp
                </p>
                <p className="text-xs text-gray-500">
                  Te avisamos cuando haya vacantes de{" "}
                  {candidate.preferences_industry.join(" y ") || "tus rubros"} en{" "}
                  {candidate.location_city}.
                </p>
              </div>
              <input
                type="checkbox"
                checked={alertsEnabled}
                onChange={(e) => toggleAlerts(e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
            </label>

            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  🔎 Visible para empresas
                </p>
                <p className="text-xs text-gray-500">
                  Las empresas pueden encontrarte en la búsqueda de talento y
                  contactarte aunque no te hayas postulado.
                </p>
              </div>
              <input
                type="checkbox"
                checked={visibleToCompanies}
                onChange={(e) =>
                  togglePref(
                    "visible_to_companies",
                    e.target.checked,
                    setVisibleToCompanies
                  )
                }
                className="w-5 h-5 accent-primary"
              />
            </label>

            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  🔗 Perfil público
                </p>
                <p className="text-xs text-gray-500">
                  Tu página compartible para mandar por WhatsApp a cualquier
                  empleador.
                </p>
              </div>
              <input
                type="checkbox"
                checked={publicProfile}
                onChange={(e) =>
                  togglePref("public_profile", e.target.checked, setPublicProfile)
                }
                className="w-5 h-5 accent-primary"
              />
            </label>
            {publicProfile && (
              <div className="flex gap-2">
                <Link
                  href={`/p/${candidate.id}`}
                  className="btn-secondary flex-1 text-xs"
                >
                  Ver mi perfil público
                </Link>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Mirá mi perfil laboral en Worka: worka.com.py/p/${candidate.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex-1 text-xs"
                >
                  💬 Compartir
                </a>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">
                Rubros de interés
              </p>
              <div className="flex flex-wrap gap-1.5">
                {candidate.preferences_industry.map((ind) => (
                  <span key={ind} className="chip bg-blue-50 text-primary">
                    {ind}
                  </span>
                ))}
                <button className="chip bg-surface text-gray-500">
                  + Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Referencias laborales */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-primary-dark">
                🤝 Referencias laborales
              </h2>
              <button
                className="text-sm text-primary font-medium"
                onClick={() => setRefFormOpen((v) => !v)}
              >
                {refFormOpen ? "Cancelar" : "+ Agregar"}
              </button>
            </div>
            <p className="text-xs text-gray-400 -mt-1">
              Un ex-jefe o encargado confirma por WhatsApp que trabajaste con
              él. Las referencias confirmadas aparecen en tu perfil público.
            </p>
            {refFormOpen && (
              <div className="space-y-2 bg-surface rounded-xl p-3">
                <input
                  className="input text-sm"
                  placeholder="Nombre de la persona (ej: Rosa Duarte)"
                  value={refDraft.referrer_name}
                  onChange={(e) =>
                    setRefDraft((d) => ({ ...d, referrer_name: e.target.value }))
                  }
                />
                <input
                  className="input text-sm"
                  placeholder="Su WhatsApp (ej: 0985 777 888)"
                  value={refDraft.referrer_phone}
                  onChange={(e) =>
                    setRefDraft((d) => ({
                      ...d,
                      referrer_phone: e.target.value,
                    }))
                  }
                />
                <input
                  className="input text-sm"
                  placeholder="Relación (ej: Fue mi encargada en…)"
                  value={refDraft.relationship}
                  onChange={(e) =>
                    setRefDraft((d) => ({ ...d, relationship: e.target.value }))
                  }
                />
                <button
                  className="btn-primary w-full text-sm"
                  disabled={!refDraft.referrer_name || !refDraft.referrer_phone}
                  onClick={submitReference}
                >
                  Enviar solicitud por WhatsApp
                </button>
              </div>
            )}
            {references.length === 0 && !refFormOpen && (
              <p className="text-sm text-gray-400 text-center py-2">
                Todavía no agregaste referencias.
              </p>
            )}
            {references.map((r) => (
              <div
                key={r.id}
                className="flex items-start justify-between gap-2 bg-surface rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {r.referrer_name}
                  </p>
                  <p className="text-xs text-gray-500">{r.relationship}</p>
                </div>
                <span
                  className={`chip shrink-0 ${
                    r.status === "confirmada"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {r.status === "confirmada" ? "✓ confirmada" : "⏳ pendiente"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Columna lateral: configuración */}
        <div className="space-y-4">
          {/* Identidad verificada */}
          <div className="card p-5">
            <h2 className="font-semibold text-primary-dark">
              🪪 Identidad verificada
            </h2>
            {identityStatus === "verified" ? (
              <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2.5 mt-2">
                ✓ Tu identidad está verificada. El sello aparece en tu perfil y
                tus postulaciones.
              </p>
            ) : identityStatus === "pending" ? (
              <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-3 py-2.5 mt-2">
                ⏳ Solicitud en revisión. Te avisamos en menos de 48 h.
              </p>
            ) : (
              <>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Subí una foto de tu cédula y ganá el sello 🪪. Los perfiles
                  verificados destacan frente a las empresas. Es opcional y tus
                  datos no se comparten.
                </p>
                <button
                  className="btn-primary w-full mt-3 text-sm"
                  onClick={requestIdentity}
                >
                  Verificar mi identidad
                </button>
              </>
            )}
          </div>

          <div id="configuracion" className="card p-5 space-y-1 scroll-mt-24">
            <h2 className="font-semibold text-primary-dark mb-2">
              ⚙️ Configuración
            </h2>
            {[
              { icon: "✏️", label: "Editar mis datos" },
              { icon: "🔔", label: "Notificaciones" },
              { icon: "🔒", label: "Privacidad y datos" },
              { icon: "❓", label: "Ayuda y contacto" },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm text-gray-700 hover:bg-surface text-left"
              >
                <span>
                  <span className="mr-2.5" aria-hidden>
                    {item.icon}
                  </span>
                  {item.label}
                </span>
                <span className="text-gray-300">→</span>
              </button>
            ))}
            <div className="border-t border-gray-100 my-2" />
            <button
              className="w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-surface text-left"
              onClick={() => signOut()}
            >
              <span className="mr-2.5" aria-hidden>
                🚪
              </span>
              Cerrar sesión
            </button>
            <button
              className="w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium text-danger hover:bg-red-50 text-left"
              onClick={() => setDeleteOpen(true)}
            >
              <span className="mr-2.5" aria-hidden>
                🗑️
              </span>
              Eliminar mi cuenta
            </button>
          </div>

          <div className="card p-5 bg-blue-50 border-blue-100">
            <p className="text-sm font-medium text-primary-dark">
              💡 Consejo de Worka
            </p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Los perfiles con CV cargado reciben el doble de contactos. Si no
              tenés uno, generalo gratis desde &ldquo;Mi CV&rdquo;.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmación de borrado de cuenta */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 animate-fade-up">
            <h4 className="font-semibold text-primary-dark">
              ¿Eliminar tu cuenta?
            </h4>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Borramos de forma permanente tu perfil, tu CV y todas tus
              postulaciones, conforme a la ley de protección de datos
              personales. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2 mt-5">
              <button
                className="btn-secondary flex-1"
                onClick={() => setDeleteOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="btn bg-danger text-white hover:bg-red-600 flex-1"
                onClick={() => setDeleteOpen(false)}
              >
                Sí, eliminar todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
