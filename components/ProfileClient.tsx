"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Bell, BriefcaseBusiness, Camera, Check, ChevronDown, Eye, FileText, Lightbulb, LogOut, MapPin, Pencil, Phone, Plus, Settings, ShieldCheck, Upload, X } from "lucide-react";
import MobileSheet from "@/components/MobileSheet";
import { countryByCode } from "@/lib/countries";
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
  type ActionResult,
} from "@/app/actions";
import { compressImage } from "@/lib/compress-image";
import { toPyWhatsapp } from "@/lib/format";
import { INDUSTRIES } from "@/lib/mock-data";

async function saveProfileAction(action: () => Promise<ActionResult>): Promise<ActionResult> {
  try { return await action(); }
  catch { return { ok: false, error: "No pudimos conectar. Tus cambios siguen disponibles para reintentar." }; }
}

function refWhatsAppUrl(ref: WorkReference, candidateName: string): string {
  // Formato internacional paraguayo: 0992… / 992… → 595992…
  const phone = toPyWhatsapp(ref.referrer_phone);
  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/ref/${ref.token}`;
  const text = `Hola ${ref.referrer_name.split(" ")[0]}! Soy ${candidateName}. ¿Me confirmás como referencia laboral en Worka? Solo tenés que tocar este link: ${link}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export default function ProfileClient({
  candidate: initialCandidate,
  references: initialReferences = [],
  settings = {},
}: {
  candidate: Candidate;
  references?: WorkReference[];
  settings?: Record<string, string>;
}) {
  const [candidate, setCandidate] = useState(initialCandidate);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savedBio, setSavedBio] = useState(initialCandidate.bio ?? "");
  const profileCities = [...new Set([...countryByCode(candidate.country ?? "py").cities, candidate.location_city])];
  const [configModal, setConfigModal] = useState<
    null | "editar" | "ayuda"
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
  // El pie de cada correo dice que se pueden apagar: tiene que ser cierto.
  const [emailsEnabled, setEmailsEnabled] = useState(
    candidate.email_notifications !== false
  );
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
  const [bioEditor, setBioEditor] = useState(false);
  const cvInput = useRef<HTMLInputElement>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function handleCvFile(file: File | undefined) {
    if (!file) return;
    setCvError(null);
    if (file.type !== "application/pdf" || file.size > 5 * 1024 * 1024) {
      setCvError("Elegí un PDF de hasta 5 MB. Tu CV anterior se conserva.");
      return;
    }
    const fd = new FormData();
    fd.append("cv", file);
    startTransition(async () => {
      const result = await saveProfileAction(() => uploadCv(fd));
      if (result.ok) setHasCv(true);
      else setCvError(result.error ?? "No pudimos subir el CV.");
    });
  }

  function handleAvatar(file: File | undefined) {
    if (!file) return;
    setProfileError(null);
    startTransition(async () => {
      try {
        const compressed = await compressImage(file, { maxSize: 512 });
        const fd = new FormData();
        fd.append("image", compressed);
        const result = await uploadAvatar(fd);
        if (!result.ok) { setProfileError(result.error ?? "No pudimos guardar la foto."); return; }
        if (result.url) setAvatarUrl(result.url);
        else if (result.demo) {
          const reader = new FileReader();
          reader.onload = () => setAvatarUrl(reader.result as string);
          reader.readAsDataURL(file);
        }
      } catch { setProfileError("No pudimos procesar la imagen. Probá con otra foto."); }
    });
  }

  function saveBio() {
    const draft = bio.trim();
    setProfileError(null);
    startTransition(async () => {
      try {
        const result = await updateCandidateProfile({ bio: draft });
        if (!result.ok) { setProfileError(result.error ?? "No pudimos guardar tu presentación."); return; }
        setSavedBio(draft);
        setCandidate((current) => ({ ...current, bio: draft }));
        setBioSaved(true);
        setBioEditor(false);
      } catch { setProfileError("No pudimos guardar. Conservamos tu texto para que reintentes."); }
    });
  }

  function viewCv() {
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    startTransition(async () => {
      const result = await getMyCvUrl();
      if (result.ok && result.url && tab) tab.location.href = result.url;
      else {
        tab?.close();
        setCvError(result.error ?? "Permití abrir ventanas emergentes para ver el CV.");
      }
    });
  }

  function removeCv() {
    startTransition(async () => {
      const result = await saveProfileAction(() => deleteCv());
      if (result.ok) setHasCv(false);
      else setCvError(result.error ?? "No pudimos eliminar tu CV.");
    });
  }

  function removeReference(id: string) {
    setProfileError(null);
    startTransition(async () => {
      const result = await saveProfileAction(() => deleteWorkReference(id));
      if (result.ok) setReferences((prev) => prev.filter((r) => r.id !== id));
      else setProfileError(result.error ?? "No pudimos eliminar la referencia.");
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
    setProfileError(null);
    startTransition(async () => {
      const result = await saveProfileAction(() => updateCandidatePrefs({ [key]: value }));
      if (result.ok) set(value);
      else setProfileError(result.error ?? "No pudimos guardar la preferencia.");
    });
  }

  function submitReference() {
    if (!refDraft.referrer_name || !refDraft.referrer_phone) return;
    const draft = { ...refDraft };
    setProfileError(null);
    startTransition(async () => {
      const result = await saveProfileAction(() => addWorkReference(draft));
      if (!result.ok) { setProfileError(result.error ?? "No pudimos crear la referencia."); return; }
      setRefFormOpen(false);
      setRefDraft({ referrer_name: "", referrer_phone: "", relationship: "" });
      const local: WorkReference = {
        id: result.id ?? `local-${Date.now()}`,
        candidate_id: candidate.id,
        ...draft,
        status: "generada",
        token: result.token ?? "",
        created_at: new Date().toISOString(),
      };
      setReferences((prev) => [local, ...prev]);
      // El enlace de envío queda visible en la referencia creada.
    });
  }


  function savePreference(key: "first_job_mode" | "alerts_enabled" | "email_notifications", value: boolean, set: (value: boolean) => void) {
    setProfileError(null);
    startTransition(async () => {
      const result = await saveProfileAction(() => updateCandidatePrefs({ [key]: value }));
      if (result.ok) set(value);
      else setProfileError(result.error ?? "No pudimos guardar la preferencia.");
    });
  }
  const toggleFirstJob = (value: boolean) => savePreference("first_job_mode", value, setFirstJobMode);
  const toggleAlerts = (value: boolean) => savePreference("alerts_enabled", value, setAlertsEnabled);

  function saveSearchPreference(key: "preferences_modality" | "open_to_other_cities", value: string | boolean) {
    setProfileError(null);
    startTransition(async () => {
      const result = await saveProfileAction(() => updateCandidatePrefs({ [key]: value }));
      if (result.ok) setCandidate((current) => ({ ...current, [key]: value }));
      else setProfileError(result.error ?? "No pudimos guardar tus preferencias de búsqueda.");
    });
  }

  const completed = [!!candidate.full_name && !!candidate.location_city, !!savedBio.trim(), hasCv, candidate.preferences_industry.length > 0];
  const completedCount = completed.filter(Boolean).length;
  const nextStep = !completed[0] ? { label: "Completá tus datos", href: "#datos" }
    : !completed[1] ? { label: "Contá un poco sobre vos", href: "#presentacion" }
    : !completed[2] ? { label: "Sumá tu currículum", href: "#curriculum" }
    : { label: "Elegí tus rubros", href: "#preferencias" };

  return (
    <div className="profile-page">
      <nav className="profile-section-nav" aria-label="Secciones de mi perfil">
        <span className="profile-nav-label"><span className="job-active-dot" /> Mi perfil</span>
        {[["datos", "Resumen"], ["presentacion", "Sobre mí"], ["curriculum", "Mi CV"], ["preferencias", "Preferencias"], ["referencias", "Referencias"]].map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>
      {profileError && <p role="alert" className="profile-error">{profileError}</p>}
      <div className="profile-layout">
        <div className="profile-main-column">
          <section id="datos" className="profile-hero card">
            <div className="profile-cover" aria-hidden="true"><span>Tu próximo paso empieza acá.</span><BriefcaseBusiness size={42} strokeWidth={1} /></div>
            <div className="profile-hero-content">
              <div className="profile-avatar-line">
                <button className="profile-avatar" onClick={() => avatarInput.current?.click()} disabled={pending} aria-label="Cambiar foto de perfil">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{candidate.full_name.split(" ").filter(Boolean).slice(0, 2).map((name) => name[0]).join("")}</span>}
                  <span className="profile-avatar-camera"><Camera size={13} /></span>
                </button>
                {identityStatus === "verified" && <span className="profile-verified"><BadgeCheck size={14} /> Identidad verificada</span>}
              </div>
              <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatar(e.target.files?.[0])} />
              <h1>{candidate.full_name}</h1>
              <p className="profile-headline">{candidate.preferences_industry.length ? `En búsqueda de oportunidades en ${candidate.preferences_industry.join(", ")}.` : "Completá tus intereses para orientar tu búsqueda laboral."}</p>
              <p className="profile-contact"><MapPin size={14} /> {candidate.location_city} · {countryByCode(candidate.country ?? "py").name}</p>
              <p className="profile-contact"><Phone size={14} /> {candidate.phone_whatsapp}{candidate.phone_verified && <Check size={13} className="text-emerald-700" />}</p>
              <div className="profile-primary-actions"><button className="btn-primary" onClick={() => { setEditSaved(false); setConfigModal("editar"); }}><Pencil size={14} /> Editar perfil</button>{publicProfile && <Link href={`/p/${candidate.id}`} className="btn-secondary"><Eye size={15} /> Ver perfil público</Link>}</div>
              <div className="profile-completion"><div><strong>{completedCount === 4 ? "Tu perfil está listo" : <a href={nextStep.href}>{nextStep.label} →</a>}</strong><p>{completedCount} de 4 secciones básicas completas</p></div><div role="progressbar" aria-label="Secciones básicas completas" aria-valuemin={0} aria-valuemax={4} aria-valuenow={completedCount} className="profile-progress-track"><span style={{ width: `${completedCount * 25}%` }} /></div></div>
            </div>
          </section>

          <section id="presentacion" className="card profile-section">
            <div className="profile-section-title"><h2>Sobre mí</h2><button className="job-save" aria-label="Editar presentación" onClick={() => setBioEditor(true)}><Pencil size={17} /></button></div>
            {bioEditor ? <div className="space-y-3"><label htmlFor="profile-bio" className="sr-only">Sobre mí</label><textarea id="profile-bio" aria-describedby="bio-help" className="input min-h-32" maxLength={280} value={bio} placeholder="Contá qué sabés hacer y qué oportunidad estás buscando." onChange={(e) => { setBio(e.target.value); setBioSaved(false); }} /><p id="bio-help" className="text-xs text-gray-500">{bio.length}/280 caracteres · Guardá para actualizar tu perfil.</p><div className="flex gap-2"><button className="btn-primary" disabled={pending || bio.trim() === savedBio} onClick={saveBio}>{pending ? "Guardando…" : "Guardar"}</button><button className="btn-secondary" onClick={() => { setBio(savedBio); setBioEditor(false); }}>Cancelar</button></div></div> : <><p className="profile-bio">{savedBio || "Tu experiencia también cuenta si es tu primer empleo. Contá qué aprendiste, qué te gusta hacer y qué estás buscando."}</p>{!savedBio && <button className="profile-text-action" onClick={() => setBioEditor(true)}>Agregar una presentación</button>}</>}
            {bioSaved && <p role="status" className="text-xs text-emerald-700 mt-3">Presentación guardada.</p>}
          </section>

          <section id="curriculum" className="card profile-section">
            <div className="profile-section-title"><h2><FileText size={18} /> Mi currículum</h2>{hasCv && <span className="profile-status">PDF cargado</span>}</div>
            <input ref={cvInput} type="file" accept="application/pdf" className="hidden" onChange={(e) => { handleCvFile(e.target.files?.[0]); e.target.value = ""; }} />
            {hasCv ? <div className="profile-cv-file"><span className="profile-pdf-icon"><FileText size={22} /></span><div><strong>Mi currículum.pdf</strong><p>Disponible para tus postulaciones</p></div><button className="profile-text-action" disabled={pending} onClick={viewCv}>Ver PDF</button></div> : <p className="profile-section-description">Sumá tu experiencia en un PDF para compartirlo con las empresas.</p>}
            <div className="profile-cv-actions"><button className="btn-secondary" disabled={pending} onClick={() => cvInput.current?.click()}><Upload size={15} />{hasCv ? "Reemplazar PDF" : "Subir PDF"}</button><Link href="/cv" className="profile-text-action">Crear CV con Worka <ArrowUpRight size={14} /></Link>{hasCv && <button className="profile-text-action text-danger" disabled={pending} onClick={() => { if (window.confirm("¿Eliminar el CV de tu perfil? Podés cargar otro después.")) removeCv(); }}>Eliminar</button>}</div>
            <p className="text-xs text-gray-500 mt-3">Formato PDF · Hasta 5 MB</p>
            {cvError && <p role="alert" className="text-sm text-danger mt-2">{cvError}</p>}
          </section>

          <section id="preferencias" className="card profile-section">
            <div className="profile-section-title"><h2><BriefcaseBusiness size={18} /> Preferencias laborales</h2></div>
            <fieldset><legend className="profile-field-label">Modalidad de trabajo</legend><div className="profile-modality-options">{["Presencial", "Híbrido", "Remoto", "Cualquiera"].map((value) => <button key={value} disabled={pending} aria-pressed={(candidate.preferences_modality === value) || (value === "Cualquiera" && !["Presencial", "Híbrido", "Remoto"].includes(candidate.preferences_modality))} onClick={() => saveSearchPreference("preferences_modality", value)}>{value === "Cualquiera" ? "Cualquiera" : value}</button>)}</div></fieldset>
            <div className="mt-5"><p className="profile-field-label">Rubros de interés</p><div className="profile-industry-list">{candidate.preferences_industry.map((industry) => <span key={industry}>{industry}</span>)}<button onClick={() => { setEditSaved(false); setConfigModal("editar"); }}><Plus size={13} /> Editar rubros</button></div></div>
            <div className="profile-toggle-list">
              <label className="profile-toggle"><span><strong>Puedo trabajar en otras ciudades</strong><small>Amplía las oportunidades fuera de {candidate.location_city}.</small></span><input type="checkbox" checked={candidate.open_to_other_cities} disabled={pending} onChange={(e) => saveSearchPreference("open_to_other_cities", e.target.checked)} /></label>
              <label className="profile-toggle"><span><strong>Estoy buscando mi primer empleo</strong><small>Orienta las novedades de empleo según tus intereses.</small></span><input type="checkbox" checked={firstJobMode} disabled={pending} onChange={(e) => toggleFirstJob(e.target.checked)} /></label>
            </div>
          </section>

          <section id="referencias" className="card profile-section">
            <div className="profile-section-title"><h2><BadgeCheck size={18} /> Referencias laborales</h2><button className="job-save" aria-label={refFormOpen ? "Cancelar referencia" : "Agregar referencia"} onClick={() => setRefFormOpen(!refFormOpen)}>{refFormOpen ? <X size={18} /> : <Plus size={18} />}</button></div>
            <p className="profile-section-description">Compartí un enlace con alguien que pueda confirmar tu experiencia. Es opcional.</p>
            {refFormOpen && <div className="profile-reference-form"><label><span className="label">Nombre de la persona</span><input className="input" value={refDraft.referrer_name} onChange={(e) => setRefDraft((current) => ({ ...current, referrer_name: e.target.value }))} /></label><label><span className="label">WhatsApp con código de país</span><input type="tel" className="input" placeholder="+595…" value={refDraft.referrer_phone} onChange={(e) => setRefDraft((current) => ({ ...current, referrer_phone: e.target.value }))} /></label><label><span className="label">Relación laboral</span><input className="input" placeholder="Ej.: Fue mi encargada" value={refDraft.relationship} onChange={(e) => setRefDraft((current) => ({ ...current, relationship: e.target.value }))} /></label><button className="btn-primary" disabled={pending || !refDraft.referrer_name.trim() || !refDraft.referrer_phone.trim()} onClick={submitReference}>{pending ? "Creando…" : "Crear enlace de referencia"}</button></div>}
            {references.map((ref) => <div className="profile-reference" key={ref.id}><span className="profile-reference-avatar">{ref.referrer_name.split(" ").slice(0, 2).map((part) => part[0]).join("")}</span><div><strong>{ref.referrer_name}</strong><span className={ref.status === "confirmada" ? "reference-confirmed" : "reference-pending"}>{ref.status === "confirmada" ? "Confirmada" : "Por confirmar"}</span><p>{ref.relationship}</p><div className="flex flex-wrap gap-3 mt-1">{ref.status !== "confirmada" && ref.token && <a href={refWhatsAppUrl(ref, candidate.full_name)} target="_blank" rel="noopener noreferrer" className="profile-text-action">Enviar enlace por WhatsApp</a>}<button className="profile-text-action text-gray-500" disabled={pending} onClick={() => removeReference(ref.id)}>Eliminar</button></div></div></div>)}
            {references.length === 0 && !refFormOpen && <button className="profile-text-action mt-3" onClick={() => setRefFormOpen(true)}><Plus size={14} /> Agregar una referencia</button>}
          </section>
        </div>

        <aside className="profile-sidebar">
          <section className="card profile-section profile-visibility"><h2><ShieldCheck size={18} /> Tu perfil en Worka</h2><p className="profile-section-description">Decidís cómo te encuentran y qué compartís con las empresas.</p><div className="profile-visibility-status"><span className={`job-active-dot ${visibleToCompanies ? "" : "is-private"}`} /><span>{visibleToCompanies ? "Visible en la búsqueda de talento" : "Oculto en la búsqueda de talento"}</span></div><p className="text-xs text-gray-500 mt-3">Al postularte, esa empresa recibe tu perfil aunque no estés visible en las búsquedas.</p></section>
          <details className="card profile-section profile-settings" id="privacidad"><summary><span><Bell size={17} /> Avisos y privacidad</span><ChevronDown size={16} /></summary><div className="profile-settings-body">
            <label className="profile-toggle"><span><strong>Visible para empresas</strong><small>Permite encontrarte sin una postulación.</small></span><input type="checkbox" checked={visibleToCompanies} disabled={pending} onChange={(e) => togglePref("visible_to_companies", e.target.checked, setVisibleToCompanies)} /></label>
            <label className="profile-toggle"><span><strong>Perfil público</strong><small>Una página que podés compartir por enlace.</small></span><input type="checkbox" checked={publicProfile} disabled={pending} onChange={(e) => togglePref("public_profile", e.target.checked, setPublicProfile)} /></label>
            <label className="profile-toggle"><span><strong>Avisos por email</strong><small>Novedades sobre tus postulaciones.</small></span><input type="checkbox" checked={emailsEnabled} disabled={pending} onChange={(e) => savePreference("email_notifications", e.target.checked, setEmailsEnabled)} /></label>
            <label className="profile-toggle"><span><strong>Novedades de empleo</strong><small>Vacantes por email según tus intereses.</small></span><input type="checkbox" checked={alertsEnabled} disabled={pending} onChange={(e) => toggleAlerts(e.target.checked)} /></label>
            <Link href="/alertas" className="profile-text-action">Administrar mis alertas <ArrowUpRight size={14} /></Link>
          </div></details>
          <section className="card profile-section profile-tip"><h2><Lightbulb size={18} /> Un perfil que te represente</h2><p>Contá tu experiencia con ejemplos concretos y mantené actualizado tu CV. Tu foto y tus referencias son opcionales.</p></section>
          <details className="card profile-section profile-settings" id="configuracion"><summary><span><Settings size={17} /> Ajustes de cuenta</span><ChevronDown size={16} /></summary><div className="profile-settings-body"><button className="profile-setting-link" onClick={() => setConfigModal("ayuda")}>Ayuda y contacto <ArrowUpRight size={15} /></button><Link href="/recuperar" className="profile-setting-link">Cambiar contraseña <ArrowUpRight size={15} /></Link>
            <details className="profile-identity"><summary>Verificación de identidad <ChevronDown size={14} /></summary><p className="text-xs text-gray-500 my-3">Es opcional. Los documentos solo los revisa el equipo de Worka.</p>
              {identityStatus === "verified" ? <p className="text-sm text-emerald-700">Identidad verificada</p> : identityStatus === "pending" ? <p className="text-sm text-primary">Documentos en revisión.</p> : <div className="space-y-3">{([ ["front", "Frente del documento"], ["back", "Dorso del documento"], ["selfie", "Selfie con el documento"] ] as const).map(([key, label]) => <label key={key} className="block"><span className="text-xs font-medium">{label}</span><input type="file" accept="image/*" className="block w-full text-xs mt-1" onChange={(e) => setIdFiles((current) => ({ ...current, [key]: e.target.files?.[0] ?? null }))} /></label>)}{idError && <p role="alert" className="text-xs text-danger">{idError}</p>}<button className="btn-secondary w-full" disabled={pending || !idFiles.front || !idFiles.back || !idFiles.selfie} onClick={submitIdentity}>{pending ? "Enviando…" : "Enviar a revisión"}</button></div>}
            </details><button className="profile-setting-link" onClick={() => signOut()}>Cerrar sesión <LogOut size={15} /></button><button className="profile-setting-link text-danger" onClick={() => setDeleteOpen(true)}>Eliminar mi cuenta</button>
          </div></details>
        </aside>
      </div>
      {/* Configuración accesible en móvil y escritorio. */}
      <MobileSheet desktop open={configModal !== null} onClose={() => setConfigModal(null)} label="Configuración del perfil" className="p-5 overflow-y-auto">
        <button className="btn-secondary ml-auto mb-3" onClick={() => setConfigModal(null)}>Cerrar configuración</button>
        {profileError && <p role="alert" className="text-sm text-danger mb-3">{profileError}</p>}
            {configModal === "editar" && (
              <div className="space-y-3" onChangeCapture={() => setEditSaved(false)}>
                <h4 className="font-semibold text-primary-dark">
                  ✏️ Editar mis datos
                </h4>
                <div>
                  <label htmlFor="edit-name" className="label">Nombre completo</label>
                  <input
                    id="edit-name"
                    className="input"
                    value={editDraft.full_name}
                    onChange={(e) =>
                      setEditDraft((d) => ({ ...d, full_name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label htmlFor="edit-phone" className="label">WhatsApp</label>
                  <input
                    id="edit-phone"
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
                  <label htmlFor="edit-city" className="label">Ciudad</label>
                  <select
                    id="edit-city"
                    className="input"
                    value={editDraft.location_city}
                    onChange={(e) =>
                      setEditDraft((d) => ({
                        ...d,
                        location_city: e.target.value,
                      }))
                    }
                  >
                    {profileCities.map((c) => (
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
                          aria-pressed={on}
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
                {profileError && <p role="alert" className="text-sm text-danger">{profileError}</p>}
                {editSaved && (
                  <p role="status" className="text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">
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
                        setProfileError(null);
                        setEditSaved(false);
                        if (!editDraft.full_name.trim() || !editDraft.location_city || !editDraft.phone_whatsapp.trim()) {
                          setProfileError("Completá tu nombre, ciudad y teléfono antes de guardar.");
                          return;
                        }
                        const result = await saveProfileAction(() => updateCandidateProfile({ ...editDraft, full_name: editDraft.full_name.trim(), phone_whatsapp: editDraft.phone_whatsapp.trim() }));
                        if (result.ok) { setCandidate((current) => ({ ...current, ...editDraft })); setEditSaved(true); }
                        else setProfileError(result.error ?? "No pudimos guardar tus datos.");
                      })
                    }
                  >
                    {pending ? "Guardando…" : "Guardar"}
                  </button>
                </div>
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
      </MobileSheet>

      {/* Confirmación de borrado de cuenta */}
      <MobileSheet desktop open={deleteOpen} onClose={() => setDeleteOpen(false)} label="Eliminar mi cuenta" className="p-5">
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
      </MobileSheet>
    </div>
  );
}
