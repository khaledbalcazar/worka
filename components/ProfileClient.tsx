"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { Candidate, IdentityStatus, WorkReference } from "@/lib/types";
import {
  addWorkReference,
  deleteAccount,
  deleteCv,
  deleteWorkReference,
  getMyCvUrl,
  signOut,
  submitIdentityDocs,
  updateCandidatePrefs,
  updateCandidateProfile,
  uploadAvatar,
  uploadCv,
} from "@/app/actions";
import { compressImage } from "@/lib/compress-image";
import { toPyWhatsapp } from "@/lib/format";
import { CITIES, INDUSTRIES } from "@/lib/mock-data";

function refWhatsAppUrl(ref: WorkReference, candidateName: string): string {
  // Formato internacional paraguayo: 0992… / 992… → 595992…
  const phone = toPyWhatsapp(ref.referrer_phone);
  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/ref/${ref.token}`;
  const text = `Hola ${ref.referrer_name.split(" ")[0]}! Soy ${candidateName}. ¿Me confirmás como referencia laboral en Worka? Solo tenés que tocar este link: ${link}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

// Medidor de perfil: cada dato completado mejora la visibilidad del candidato.
function profileCompleteness(c: Candidate, hasCv: boolean) {
  const checks: { label: string; done: boolean }[] = [
    { label: "Nombre completo", done: !!c.full_name },
    { label: "WhatsApp", done: !!c.phone_whatsapp },
    { label: "Ciudad", done: !!c.location_city },
    { label: "Rubros de interés", done: c.preferences_industry.length > 0 },
    { label: "Foto de perfil", done: !!c.avatar_url },
    { label: "Bio (sobre mí)", done: !!c.bio },
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
  settings = {},
}: {
  candidate: Candidate;
  references?: WorkReference[];
  settings?: Record<string, string>;
}) {
  const [configModal, setConfigModal] = useState<
    null | "editar" | "notificaciones" | "privacidad" | "ayuda"
  >(null);
  const [editDraft, setEditDraft] = useState({
    full_name: candidate.full_name,
    phone_whatsapp: candidate.phone_whatsapp,
    location_city: candidate.location_city,
    preferences_industry: candidate.preferences_industry,
  });
  const [editSaved, setEditSaved] = useState(false);
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
  const [cvError, setCvError] = useState<string | null>(null);
  const [idFiles, setIdFiles] = useState<{
    front: File | null;
    back: File | null;
    selfie: File | null;
  }>({ front: null, back: null, selfie: null });
  const [idError, setIdError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(candidate.avatar_url);
  const [bio, setBio] = useState(candidate.bio ?? "");
  const [bioSaved, setBioSaved] = useState(false);
  const cvInput = useRef<HTMLInputElement>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function handleCvFile(file: File | undefined) {
    if (!file) return;
    setCvError(null);
    const fd = new FormData();
    fd.append("cv", file);
    startTransition(async () => {
      const result = await uploadCv(fd);
      if (result.ok) setHasCv(true);
      else setCvError(result.error ?? "No pudimos subir el CV.");
    });
  }

  function handleAvatar(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
    startTransition(async () => {
      const compressed = await compressImage(file, { maxSize: 512 });
      const fd = new FormData();
      fd.append("image", compressed);
      const result = await uploadAvatar(fd);
      if (result.ok && result.url) setAvatarUrl(result.url);
    });
  }

  function saveBio() {
    startTransition(async () => {
      await updateCandidateProfile({ bio });
      setBioSaved(true);
      setTimeout(() => setBioSaved(false), 2500);
    });
  }

  function viewCv() {
    startTransition(async () => {
      const result = await getMyCvUrl();
      if (result.ok && result.url) window.open(result.url, "_blank");
      else setCvError(result.error ?? "No pudimos abrir el CV.");
    });
  }

  function removeCv() {
    startTransition(async () => {
      await deleteCv();
      setHasCv(false);
    });
  }

  function removeReference(id: string) {
    setReferences((prev) => prev.filter((r) => r.id !== id));
    startTransition(() => {
      deleteWorkReference(id);
    });
  }

  function submitIdentity() {
    if (!idFiles.front || !idFiles.back || !idFiles.selfie) return;
    setIdError(null);
    startTransition(async () => {
      // Comprimimos cada foto antes de subir: más rápido y menos carga.
      const [front, back, selfie] = await Promise.all([
        compressImage(idFiles.front!),
        compressImage(idFiles.back!),
        compressImage(idFiles.selfie!),
      ]);
      const fd = new FormData();
      fd.append("front", front);
      fd.append("back", back);
      fd.append("selfie", selfie);
      const result = await submitIdentityDocs(fd);
      if (result.ok) setIdentityStatus("pending");
      else setIdError(result.error ?? "No pudimos enviar la solicitud.");
    });
  }

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

  function submitReference() {
    if (!refDraft.referrer_name || !refDraft.referrer_phone) return;
    const draft = { ...refDraft };
    setRefFormOpen(false);
    setRefDraft({ referrer_name: "", referrer_phone: "", relationship: "" });
    startTransition(async () => {
      const result = await addWorkReference(draft);
      const local: WorkReference = {
        id: `local-${Date.now()}`,
        candidate_id: candidate.id,
        ...draft,
        status: "generada",
        token: result.token ?? "",
        created_at: new Date().toISOString(),
      };
      setReferences((prev) => [local, ...prev]);
      // Abre WhatsApp con el link único listo para enviar
      if (result.token) {
        window.open(refWhatsAppUrl(local, candidate.full_name), "_blank");
      }
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
              <button
                className="relative w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden group"
                onClick={() => avatarInput.current?.click()}
                title="Cambiar foto de perfil"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  candidate.full_name
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                )}
                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-all">
                  📷
                </span>
              </button>
              <input
                ref={avatarInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleAvatar(e.target.files?.[0])}
              />
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

            {/* Bio corta, visible para empresas y en tu perfil público */}
            <div className="mt-4">
              <label className="label">Sobre mí (bio)</label>
              <textarea
                className="input min-h-16 text-sm"
                maxLength={280}
                placeholder="Contá en pocas líneas quién sos y qué buscás. Lo ven las empresas."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                onBlur={saveBio}
              />
              <p className="text-xs text-gray-400 mt-0.5">
                {bioSaved ? "✓ Guardado" : `${bio.length}/280 · se guarda al salir del campo`}
              </p>
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
                <div className="flex flex-wrap gap-3">
                  <button
                    className="text-sm text-primary font-medium disabled:opacity-50"
                    disabled={pending}
                    onClick={viewCv}
                  >
                    Ver PDF
                  </button>
                  <Link href="/cv" className="text-sm text-primary font-medium">
                    Generar con Worka
                  </Link>
                  <button
                    className="text-sm text-gray-500 font-medium"
                    onClick={() => setHasCv(false)}
                  >
                    Reemplazar
                  </button>
                  <button
                    className="text-sm text-danger font-medium disabled:opacity-50"
                    disabled={pending}
                    onClick={removeCv}
                  >
                    Eliminar
                  </button>
                </div>
                {cvError && <p className="text-xs text-danger">{cvError}</p>}
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  Todavía no cargaste tu CV. Podés subir un PDF (máx. 5 MB) o{" "}
                  <span className="font-medium text-primary-dark">
                    generar uno gratis con Worka
                  </span>{" "}
                  usando los datos de tu perfil.
                </p>
                <input
                  ref={cvInput}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => handleCvFile(e.target.files?.[0])}
                />
                <div className="flex gap-2">
                  <button
                    className="btn-secondary flex-1"
                    disabled={pending}
                    onClick={() => cvInput.current?.click()}
                  >
                    {pending ? "Subiendo…" : "📤 Subir PDF"}
                  </button>
                  <Link href="/cv" className="btn-primary flex-1">
                    ✨ Generar mi CV
                  </Link>
                </div>
                {cvError && <p className="text-xs text-danger">{cvError}</p>}
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
                <button
                  className="chip bg-surface text-gray-500 hover:text-primary"
                  onClick={() => {
                    setEditSaved(false);
                    setConfigModal("editar");
                  }}
                >
                  ✏️ Editar rubros
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
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span
                    className={`chip ${
                      r.status === "confirmada"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-blue-50 text-primary"
                    }`}
                  >
                    {r.status === "confirmada"
                      ? "✓ confirmada"
                      : "📨 solicitud generada"}
                  </span>
                  {r.status !== "confirmada" && r.token && (
                    <a
                      href={refWhatsAppUrl(r, candidate.full_name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary font-medium"
                    >
                      📤 Enviar link por WhatsApp
                    </a>
                  )}
                  <button
                    className="text-xs text-gray-400 hover:text-danger"
                    onClick={() => removeReference(r.id)}
                  >
                    Eliminar
                  </button>
                </div>
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
              <div className="text-center py-4 animate-pop">
                <div className="w-10 h-10 mx-auto border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold text-amber-700 mt-3">
                  Tu solicitud está en revisión
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Nuestro equipo revisa tus fotos y te avisamos en menos de
                  48 h. Tus documentos no se comparten con nadie.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Subí 3 fotos: <strong>frente</strong> y{" "}
                  <strong>dorso</strong> de tu cédula, y una{" "}
                  <strong>selfie sosteniéndola</strong>. Ganás el sello 🪪 que
                  destaca tu perfil ante las empresas. Es opcional y solo lo ve
                  nuestro equipo de revisión.
                </p>
                <div className="space-y-2 mt-3">
                  {(
                    [
                      ["front", "🪪 Frente de la cédula"],
                      ["back", "🔄 Dorso de la cédula"],
                      ["selfie", "🤳 Selfie sosteniendo la cédula"],
                    ] as const
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm cursor-pointer ${
                        idFiles[key]
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 text-gray-600 hover:border-primary"
                      }`}
                    >
                      <span>{idFiles[key] ? `✓ ${label}` : label}</span>
                      <span className="text-xs text-primary font-medium">
                        {idFiles[key] ? "Cambiar" : "Cámara o galería"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          setIdFiles((f) => ({
                            ...f,
                            [key]: e.target.files?.[0] ?? null,
                          }))
                        }
                      />
                    </label>
                  ))}
                </div>
                {idError && (
                  <p className="text-xs text-danger mt-2">{idError}</p>
                )}
                <button
                  className="btn-primary w-full mt-3 text-sm"
                  disabled={
                    pending || !idFiles.front || !idFiles.back || !idFiles.selfie
                  }
                  onClick={submitIdentity}
                >
                  {pending ? "Enviando…" : "Enviar para revisión"}
                </button>
              </>
            )}
          </div>

          <div id="configuracion" className="card p-5 space-y-1 scroll-mt-24">
            <h2 className="font-semibold text-primary-dark mb-2">
              ⚙️ Configuración
            </h2>
            {(
              [
                { icon: "✏️", label: "Editar mis datos", key: "editar" },
                { icon: "🔔", label: "Notificaciones", key: "notificaciones" },
                { icon: "🔒", label: "Privacidad y datos", key: "privacidad" },
                { icon: "❓", label: "Ayuda y contacto", key: "ayuda" },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setEditSaved(false);
                  setConfigModal(item.key);
                }}
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

      {/* Modales de configuración */}
      {configModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setConfigModal(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 animate-fade-up max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {configModal === "editar" && (
              <div className="space-y-3">
                <h4 className="font-semibold text-primary-dark">
                  ✏️ Editar mis datos
                </h4>
                <div>
                  <label className="label">Nombre completo</label>
                  <input
                    className="input"
                    value={editDraft.full_name}
                    onChange={(e) =>
                      setEditDraft((d) => ({ ...d, full_name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="label">WhatsApp</label>
                  <input
                    className="input"
                    value={editDraft.phone_whatsapp}
                    onChange={(e) =>
                      setEditDraft((d) => ({
                        ...d,
                        phone_whatsapp: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="label">Ciudad</label>
                  <select
                    className="input"
                    value={editDraft.location_city}
                    onChange={(e) =>
                      setEditDraft((d) => ({
                        ...d,
                        location_city: e.target.value,
                      }))
                    }
                  >
                    {CITIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Rubros de interés</label>
                  <div className="flex flex-wrap gap-1.5">
                    {INDUSTRIES.map((ind) => {
                      const on = editDraft.preferences_industry.includes(ind);
                      return (
                        <button
                          key={ind}
                          onClick={() =>
                            setEditDraft((d) => ({
                              ...d,
                              preferences_industry: on
                                ? d.preferences_industry.filter(
                                    (x) => x !== ind
                                  )
                                : [...d.preferences_industry, ind],
                            }))
                          }
                          className={`chip min-h-9 px-3 ${
                            on
                              ? "bg-primary text-white"
                              : "bg-surface text-gray-600"
                          }`}
                        >
                          {ind}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {editSaved && (
                  <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">
                    ✅ Datos guardados.
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    className="btn-secondary flex-1"
                    onClick={() => setConfigModal(null)}
                  >
                    Cerrar
                  </button>
                  <button
                    className="btn-primary flex-1"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await updateCandidateProfile(editDraft);
                        if (result.ok) setEditSaved(true);
                      })
                    }
                  >
                    {pending ? "Guardando…" : "Guardar"}
                  </button>
                </div>
              </div>
            )}

            {configModal === "notificaciones" && (
              <div className="space-y-4">
                <h4 className="font-semibold text-primary-dark">
                  🔔 Notificaciones
                </h4>
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      💬 Alertas por WhatsApp
                    </p>
                    <p className="text-xs text-gray-500">
                      Vacantes nuevas de tus rubros y avisos de perfil visto.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertsEnabled}
                    onChange={(e) => toggleAlerts(e.target.checked)}
                    className="w-5 h-5 accent-primary"
                  />
                </label>
                <p className="text-xs text-gray-400">
                  Las notificaciones dentro de la app (🔔) están siempre
                  activas: son tu historial de avisos.
                </p>
                <button
                  className="btn-primary w-full"
                  onClick={() => setConfigModal(null)}
                >
                  Listo
                </button>
              </div>
            )}

            {configModal === "privacidad" && (
              <div className="space-y-4">
                <h4 className="font-semibold text-primary-dark">
                  🔒 Privacidad y datos
                </h4>
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      🔎 Visible para empresas
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
                  </div>
                  <input
                    type="checkbox"
                    checked={publicProfile}
                    onChange={(e) =>
                      togglePref(
                        "public_profile",
                        e.target.checked,
                        setPublicProfile
                      )
                    }
                    className="w-5 h-5 accent-primary"
                  />
                </label>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Tus datos se usan solo para conectarte con empresas. Nunca
                  vendemos tu información. Podés descargar o borrar todo cuando
                  quieras, conforme a la ley de protección de datos personales.
                </p>
                <button
                  className="w-full text-sm font-medium text-danger py-2 rounded-xl hover:bg-red-50"
                  onClick={() => {
                    setConfigModal(null);
                    setDeleteOpen(true);
                  }}
                >
                  🗑️ Eliminar mi cuenta y todos mis datos
                </button>
                <button
                  className="btn-primary w-full"
                  onClick={() => setConfigModal(null)}
                >
                  Listo
                </button>
              </div>
            )}

            {configModal === "ayuda" && (
              <div className="space-y-3 text-center">
                <h4 className="font-semibold text-primary-dark">
                  ❓ Ayuda y contacto
                </h4>
                <p className="text-sm text-gray-600">
                  {settings.help_text ??
                    "Escribinos y te respondemos en el día."}
                </p>
                {settings.contact_whatsapp && (
                  <a
                    href={`https://wa.me/${settings.contact_whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-success w-full"
                  >
                    💬 WhatsApp: {settings.contact_whatsapp}
                  </a>
                )}
                {settings.contact_email && (
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="btn-secondary w-full"
                  >
                    ✉️ {settings.contact_email}
                  </a>
                )}
                <p className="text-xs text-gray-400">
                  Recordá: nunca pagues para conseguir un trabajo, y denunciá
                  cualquier oferta sospechosa.
                </p>
                <button
                  className="btn-primary w-full"
                  onClick={() => setConfigModal(null)}
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteAccount();
                  })
                }
              >
                {pending ? "Eliminando…" : "Sí, eliminar todo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
