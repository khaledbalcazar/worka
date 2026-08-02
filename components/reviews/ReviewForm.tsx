"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { createCompanyReview } from "@/app/actions";

// Formulario para dejar una reseña de una empresa.
export default function ReviewForm({
  companyName,
  companyId,
  country,
  loggedIn,
}: {
  companyName: string;
  companyId: string | null;
  country: string;
  loggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [hover, setHover] = useState(0);
  const [form, setForm] = useState({
    rating: 0,
    role: "",
    employment_type: "ex" as "actual" | "ex" | "entrevista",
    title: "",
    body: "",
    pros: "",
    cons: "",
    would_recommend: null as boolean | null,
  });

  if (!loggedIn) {
    return (
      <div className="card p-5 text-center">
        <p className="text-sm text-gray-600">
          Iniciá sesión para dejar tu opinión sobre {companyName}.
        </p>
        <Link href="/ingresar" className="btn-primary mt-3 inline-block">
          Ingresar
        </Link>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="card p-5 text-center">
        <p className="text-3xl mb-1">🙌</p>
        <p className="font-semibold text-primary-dark">¡Gracias por tu reseña!</p>
        <p className="text-sm text-gray-500">Ya es visible para la comunidad.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary w-full">
        Escribir una reseña
      </button>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.rating < 1) {
      setError("Elegí una calificación.");
      return;
    }
    start(async () => {
      const res = await createCompanyReview({
        company_name: companyName,
        company_id: companyId,
        country,
        ...form,
      });
      if (res.ok) setSent(true);
      else setError(res.error ?? "No pudimos guardar tu reseña.");
    });
  }

  return (
    <form onSubmit={submit} className="card p-5 space-y-3">
      <h3 className="font-semibold text-primary-dark">Tu reseña de {companyName}</h3>

      {/* Estrellas */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setForm({ ...form, rating: i })}
            aria-label={`${i} estrellas`}
          >
            <Star
              className={`w-7 h-7 ${
                i <= (hover || form.rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="input"
          placeholder="Tu puesto (ej: Cajero)"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        />
        <select
          className="input"
          value={form.employment_type}
          onChange={(e) =>
            setForm({
              ...form,
              employment_type: e.target.value as typeof form.employment_type,
            })
          }
        >
          <option value="actual">Trabajo ahí actualmente</option>
          <option value="ex">Ex empleado/a</option>
          <option value="entrevista">Solo entrevista</option>
        </select>
      </div>

      <input
        className="input"
        placeholder="Título (ej: Buen lugar para empezar)"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <textarea
        className="input min-h-[80px]"
        placeholder="Tu experiencia general"
        value={form.body}
        onChange={(e) => setForm({ ...form, body: e.target.value })}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <textarea
          className="input min-h-[70px]"
          placeholder="Lo bueno (pros)"
          value={form.pros}
          onChange={(e) => setForm({ ...form, pros: e.target.value })}
        />
        <textarea
          className="input min-h-[70px]"
          placeholder="Lo mejorable (contras)"
          value={form.cons}
          onChange={(e) => setForm({ ...form, cons: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-500">¿La recomendarías?</span>
        {[
          { v: true, l: "Sí" },
          { v: false, l: "No" },
        ].map((o) => (
          <button
            key={o.l}
            type="button"
            onClick={() => setForm({ ...form, would_recommend: o.v })}
            className={`px-3 py-1 rounded-full border text-sm ${
              form.would_recommend === o.v
                ? "bg-primary text-white border-primary"
                : "border-gray-200 text-gray-600"
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
          {pending ? "Publicando…" : "Publicar reseña"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
          Cancelar
        </button>
      </div>
      <p className="text-xs text-gray-400">
        Sé honesto y respetuoso. Las reseñas ofensivas o falsas se eliminan.
      </p>
    </form>
  );
}
