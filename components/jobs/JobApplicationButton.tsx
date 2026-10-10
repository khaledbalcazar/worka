"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, ArrowRight, Send } from "lucide-react";
import type { JobWithCompany } from "@/lib/types";
import { applyToJob } from "@/app/actions";
import MobileSheet from "@/components/MobileSheet";

export default function JobApplicationButton({ job, applied, loggedIn, requiresEvaluation, onApplied }: {
  job: JobWithCompany; applied: boolean; loggedIn: boolean; requiresEvaluation: boolean; onApplied: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const close = () => { setOpen(false); if (done) onApplied(); };
  function submit() {
    setError("");
    start(async () => {
      try {
        const result = await applyToJob(job.id, job.filter_questions.map((q) => ({ question_id: q.id, answer: answers[q.id] })));
        if (result.ok) setDone(true);
        else setError(result.error ?? "No pudimos enviar tu postulación. Intentá de nuevo.");
      } catch { setError("No pudimos conectar. Revisá tu conexión y volvé a intentar."); }
    });
  }
  if (applied) return <Link href="/postulaciones" className="btn-secondary job-applied"><Check size={16} /> Postulado</Link>;
  if (!loggedIn) return <Link href={`/ingresar?next=${encodeURIComponent(`/empleo/${job.id}`)}`} className="btn-primary"><ArrowRight size={16} /> Postularme</Link>;
  if (requiresEvaluation) return <Link href={`/empleo/${job.id}`} className="btn-primary"><ArrowRight size={16} /> Ver proceso</Link>;
  return <>
    <button className="btn-primary" onClick={() => setOpen(true)}><Send size={15} /> Postularme</button>
    <MobileSheet desktop open={open} onClose={close} label={`Postularme a ${job.title}`} className="p-5 overflow-y-auto">
      {done ? <div className="space-y-4 py-3 text-center">
        <span className="confirmation-icon"><Check size={26} /></span>
        <h2 className="text-xl font-semibold">¡Postulación enviada!</h2>
        <p className="text-sm text-gray-600">{job.company.trade_name} recibió tu perfil. Podés seguir el proceso desde Mis postulaciones.</p>
        <button className="btn-primary w-full" onClick={close}>Seguir buscando</button>
      </div> : <>
        <p className="text-xs text-gray-500 mb-1">POSTULACIÓN</p>
        <h2 className="text-lg font-semibold">{job.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{job.company.trade_name}</p>
        <p className="text-sm text-gray-600 my-4">Revisá las preguntas y confirmá el envío de tu perfil a esta empresa.</p>
        {job.filter_questions.map((q) => <fieldset key={q.id} className="mb-4">
          <legend className="text-sm font-medium mb-2">{q.question}</legend>
          <div className="flex gap-2">{[true, false].map((value) => <button key={String(value)} disabled={pending} aria-pressed={answers[q.id] === value}
            onClick={() => setAnswers((current) => ({ ...current, [q.id]: value }))}
            className={answers[q.id] === value ? "btn-primary flex-1" : "btn-secondary flex-1"}>{value ? "Sí" : "No"}</button>)}</div>
        </fieldset>)}
        {error && <p role="alert" className="text-sm text-danger mb-3">{error} {error.includes("perfil") && <Link href={`/onboarding?next=${encodeURIComponent(`/empleo/${job.id}`)}`} className="underline">Completar mi perfil</Link>}</p>}
        <div className="flex gap-2 mt-5"><button className="btn-secondary flex-1" onClick={close}>Cancelar</button><button className="btn-primary flex-1" onClick={submit} disabled={pending || !job.filter_questions.every((q) => answers[q.id] !== undefined)}>{pending ? "Enviando…" : "Enviar postulación"}</button></div>
      </>}
    </MobileSheet>
  </>;
}
