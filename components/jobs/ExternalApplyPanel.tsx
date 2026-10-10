"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Lock,
  Mail,
  ShieldAlert,
} from "lucide-react";
import type { ExternalApplication, ExternalApplicationStatus } from "@/lib/types";
import { getMyCvUrl, recordExternalApplication, updateExternalApplicationStatus } from "@/app/actions";
import { formatDate } from "@/lib/format";

export const EXTERNAL_STATUS_LABELS: Record<ExternalApplicationStatus, string> = {
  enviada: "Enviada",
  me_contactaron: "Me contactaron",
  entrevista: "Tengo entrevista",
  descartada: "No avanzó",
};

// Postulación a un aviso de otro portal. Worka no puede enviar la
// postulación por la persona (la empresa no está en la plataforma), así que
// el panel la acompaña paso a paso: tener el CV a mano, escribir o ir al
// aviso original sin depender de que el celular tenga una app de correo, y
// al volver, dejarla anotada en Mis postulaciones.
export default function ExternalApplyPanel({
  jobId,
  sourceName,
  applyEmail,
  applyUrl,
  sourceUrl,
  mailSubject,
  mailBody,
  loggedIn,
  hasCv,
  nextHref,
  initialApplication,
  anchorId,
}: {
  jobId: string;
  sourceName: string;
  applyEmail: string | null;
  applyUrl: string | null;
  sourceUrl: string | null;
  mailSubject: string;
  mailBody: string;
  loggedIn: boolean;
  hasCv: boolean;
  nextHref: string;
  initialApplication: Pick<ExternalApplication, "id" | "status" | "applied_at" | "method"> | null;
  anchorId?: string;
}) {
  const [application, setApplication] = useState(initialApplication);
  const [started, setStarted] = useState<"email" | "enlace" | null>(null);
  const [copied, setCopied] = useState<"email" | "mensaje" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!loggedIn) {
    return (
      <section id={anchorId} className="ext-apply" aria-labelledby="ext-apply-title">
        <span className="ext-apply-lock"><Lock size={20} /></span>
        <h2 id="ext-apply-title" className="job-block-title !mb-1 text-center">Creá tu cuenta gratis para postularte</h2>
        <p className="text-sm text-muted text-center">
          Te mostramos el contacto de la empresa, te armamos el mensaje y guardamos la postulación en tu cuenta.
        </p>
        <Link href={`/registro?next=${encodeURIComponent(nextHref)}`} className="btn-primary w-full mt-4">
          Crear cuenta gratis <ArrowRight size={16} />
        </Link>
        <Link href={`/ingresar?next=${encodeURIComponent(nextHref)}`} className="btn-secondary w-full mt-2">
          Ya tengo cuenta
        </Link>
      </section>
    );
  }

  const mailto = applyEmail
    ? `mailto:${applyEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`
    : null;

  function copy(kind: "email" | "mensaje") {
    const text = kind === "email" ? applyEmail ?? "" : `${mailSubject}\n\n${mailBody}`;
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(kind);
        setStarted((s) => s ?? "email");
        setTimeout(() => setCopied(null), 2500);
      })
      .catch(() => setError("No pudimos copiar. Seleccioná el texto a mano."));
  }

  function downloadCv() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await getMyCvUrl();
        if (result.ok && result.url && !result.url.startsWith("#")) window.open(result.url, "_blank", "noopener");
        else if (!result.ok) setError(result.error ?? "No pudimos abrir tu CV.");
      } catch {
        setError("No pudimos conectar. Probá de nuevo.");
      }
    });
  }

  function confirm(method: "email" | "enlace") {
    setError(null);
    startTransition(async () => {
      try {
        const result = await recordExternalApplication(jobId, method);
        if (result.ok) {
          setApplication({ id: result.id ?? "local", status: "enviada", applied_at: new Date().toISOString(), method });
        } else setError(result.error ?? "No pudimos guardar tu postulación.");
      } catch {
        setError("No pudimos conectar. Probá de nuevo.");
      }
    });
  }

  function changeStatus(status: ExternalApplicationStatus) {
    if (!application) return;
    const previous = application.status;
    setApplication({ ...application, status });
    startTransition(async () => {
      try {
        const result = await updateExternalApplicationStatus(application.id, status);
        if (!result.ok) {
          setApplication((a) => (a ? { ...a, status: previous } : a));
          setError(result.error ?? "No pudimos actualizar el estado.");
        }
      } catch {
        setApplication((a) => (a ? { ...a, status: previous } : a));
        setError("No pudimos conectar. Probá de nuevo.");
      }
    });
  }

  if (application) {
    return (
      <section id={anchorId} className="ext-apply" aria-labelledby="ext-apply-title">
        <div className="ext-apply-done">
          <span className="confirmation-icon !w-11 !h-11 !mx-0 shrink-0"><Check size={20} /></span>
          <div className="min-w-0">
            <h2 id="ext-apply-title" className="font-semibold">Te postulaste</h2>
            <p className="text-sm text-muted">
              El {formatDate(application.applied_at)}, {application.method === "email" ? "por correo" : `en ${sourceName}`}.
            </p>
          </div>
        </div>
        <label className="block mt-4">
          <span className="label">¿Cómo va?</span>
          <select
            className="input"
            value={application.status}
            disabled={pending}
            onChange={(e) => changeStatus(e.target.value as ExternalApplicationStatus)}
          >
            {(Object.keys(EXTERNAL_STATUS_LABELS) as ExternalApplicationStatus[]).map((s) => (
              <option key={s} value={s}>{EXTERNAL_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </label>
        <p className="text-xs text-muted mt-2">
          La empresa no está en Worka, así que el estado lo anotás vos.
        </p>
        {error && <p role="alert" className="text-sm text-danger mt-3">{error}</p>}
        <Link href="/postulaciones" className="profile-text-action mt-2">Ver en Mis postulaciones</Link>
      </section>
    );
  }

  return (
    <section id={anchorId} className="ext-apply" aria-labelledby="ext-apply-title">
      <h2 id="ext-apply-title" className="job-block-title !mb-1">Cómo postularte</h2>
      <p className="text-sm text-muted">
        Esta empresa recibe postulaciones fuera de Worka. Te acompañamos en cada paso.
      </p>

      <ol className="ext-steps">
        <li>
          <span className="ext-step-num">1</span>
          <div className="min-w-0 flex-1">
            <p className="ext-step-title">Tené tu CV a mano</p>
            {hasCv ? (
              <button type="button" className="profile-text-action" disabled={pending} onClick={downloadCv}>
                <Download size={14} /> Descargar mi CV para adjuntarlo
              </button>
            ) : (
              <Link href="/cv" className="profile-text-action">
                <FileText size={14} /> Crear mi CV gratis en Worka
              </Link>
            )}
          </div>
        </li>

        <li>
          <span className="ext-step-num">2</span>
          <div className="min-w-0 flex-1">
            <p className="ext-step-title">Enviá tu postulación</p>
            {mailto && (
              <>
                <a href={mailto} className="btn-primary w-full mt-2" onClick={() => setStarted("email")}>
                  <Mail size={16} /> Escribir a la empresa
                </a>
                <p className="text-xs text-muted mt-2">
                  Se abre tu correo con el mensaje listo. Adjuntá tu CV y enviá a <strong className="text-ink break-all">{applyEmail}</strong>.
                </p>
                <div className="flex flex-wrap gap-x-4 mt-1">
                  <button type="button" className="profile-text-action" onClick={() => copy("email")}>
                    {copied === "email" ? <Check size={14} /> : <Copy size={14} />} {copied === "email" ? "Email copiado" : "Copiar email"}
                  </button>
                  <button type="button" className="profile-text-action" onClick={() => copy("mensaje")}>
                    {copied === "mensaje" ? <Check size={14} /> : <Copy size={14} />} {copied === "mensaje" ? "Mensaje copiado" : "Copiar mensaje"}
                  </button>
                </div>
              </>
            )}
            {applyUrl && (
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className={`${mailto ? "btn-secondary" : "btn-primary"} w-full mt-2`}
                onClick={() => setStarted((s) => s ?? "enlace")}
              >
                <ExternalLink size={16} /> Postularme en {sourceName}
              </a>
            )}
            {!mailto && !applyUrl && (
              <p className="text-sm text-muted mt-1">
                El aviso no trae un contacto directo.{" "}
                {sourceUrl ? (
                  <a href={sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-primary font-semibold" onClick={() => setStarted("enlace")}>
                    Buscalo en {sourceName}
                  </a>
                ) : (
                  <>Buscalo en {sourceName}.</>
                )}
              </p>
            )}
          </div>
        </li>

        <li>
          <span className="ext-step-num">3</span>
          <div className="min-w-0 flex-1">
            <p className="ext-step-title">Anotala en Worka</p>
            <p className="text-xs text-muted">Así la seguís junto a tus otras postulaciones.</p>
            <button
              type="button"
              className={`${started ? "btn-primary" : "btn-secondary"} w-full mt-2`}
              disabled={pending}
              onClick={() => confirm(started ?? (mailto ? "email" : "enlace"))}
            >
              <Check size={16} /> {pending ? "Guardando…" : "Ya me postulé"}
            </button>
          </div>
        </li>
      </ol>

      <div className="ext-warning">
        <ShieldAlert size={18} className="shrink-0" />
        <p>
          <strong>Antes de enviar tus datos:</strong> desconfiá si te piden dinero, datos de tu tarjeta o fotos de tu cédula
          antes de una entrevista. Ninguna empresa seria cobra por contratar.
        </p>
      </div>

      {error && <p role="alert" className="text-sm text-danger mt-3">{error}</p>}
    </section>
  );
}
