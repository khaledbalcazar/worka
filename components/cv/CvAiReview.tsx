"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Copy, Crown, Sparkles } from "lucide-react";
import { reviewCvWithAi, type CvReview } from "@/app/plans-actions";
import type { CvData } from "@/lib/cv";

// Revisión del CV con IA (Worka Pro): puntaje, fortalezas y mejoras con un
// texto de ejemplo listo para copiar.
export default function CvAiReview({ cv, isPro }: { cv: CvData; isPro: boolean }) {
  const [review, setReview] = useState<CvReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  if (!isPro) {
    return (
      <section id="revision-ia" className="cvb-ai is-locked">
        <Sparkles size={18} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Revisá tu CV con IA</p>
          <p className="text-sm text-muted">Puntaje y mejoras concretas para cada sección, con ejemplos listos para pegar.</p>
        </div>
        <Link href="/pro" className="pro-chip !py-1 !px-2.5"><Crown size={11} /> Worka Pro</Link>
      </section>
    );
  }

  function run() {
    setError(null);
    startTransition(async () => {
      try {
        const r = await reviewCvWithAi(cv);
        if (!r.ok || !r.review) setError(r.error ?? "No pudimos revisar tu CV.");
        else setReview(r.review);
      } catch {
        setError("No pudimos conectar. Probá de nuevo.");
      }
    });
  }

  return (
    <section id="revision-ia" className="cvb-ai">
      <div className="flex items-start gap-3">
        <Sparkles size={18} className="text-primary shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Revisión con IA</p>
          <p className="text-sm text-muted">Lee tu CV como una reclutadora y te dice qué mejorar.</p>
        </div>
        <button type="button" className="btn-primary !min-h-9 shrink-0" disabled={pending} onClick={run}>
          {pending ? "Revisando…" : review ? "Revisar de nuevo" : "Revisar mi CV"}
        </button>
      </div>
      {error && <p role="alert" className="text-sm text-danger mt-3">{error}</p>}
      {review && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="cvb-ai-score" style={{ background: review.score >= 75 ? "#057642" : review.score >= 50 ? "#b45309" : "#b42318" }}>{review.score}</span>
            <p className="text-sm">{review.summary}</p>
          </div>
          {review.strengths.length > 0 && (
            <ul className="text-sm space-y-1">
              {review.strengths.map((s, i) => (
                <li key={i} className="flex gap-2"><Check size={15} className="text-success-ink shrink-0 mt-0.5" /> {s}</li>
              ))}
            </ul>
          )}
          {review.improvements.map((imp, i) => (
            <div key={i} className="rounded-lg border border-line p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{imp.section}</p>
              <p className="text-sm mt-1">{imp.tip}</p>
              {imp.example && (
                <div className="mt-2 rounded-md bg-[#f6f8fa] p-2 text-sm">
                  <p className="whitespace-pre-line">{imp.example}</p>
                  <button
                    type="button"
                    className="profile-text-action mt-1"
                    onClick={() => {
                      navigator.clipboard?.writeText(imp.example ?? "").then(() => {
                        setCopied(i);
                        setTimeout(() => setCopied(null), 2000);
                      }).catch(() => {});
                    }}
                  >
                    {copied === i ? <Check size={13} /> : <Copy size={13} />} {copied === i ? "Copiado" : "Copiar ejemplo"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
