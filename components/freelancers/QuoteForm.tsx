"use client";

import { useState, useTransition } from "react";
import { requestQuote } from "@/app/actions";

// Formulario para pedir presupuesto a un freelancer.
export default function QuoteForm({
  freelancerId,
  accent,
}: {
  freelancerId: string;
  accent: string;
}) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [form, setForm] = useState({
    name: "",
    email: "",
    budget: "",
    message: "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await requestQuote({ freelancer_id: freelancerId, ...form });
      if (res.ok) setSent(true);
      else setError(res.error ?? "No pudimos enviar tu solicitud.");
    });
  }

  if (sent) {
    return (
      <div className="card p-6 text-center">
        <p className="text-3xl mb-2">✅</p>
        <p className="font-semibold text-primary-dark">¡Solicitud enviada!</p>
        <p className="text-sm text-gray-500 mt-1">
          El freelancer va a recibir tu pedido y te va a contactar por email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-5 space-y-3">
      <h3 className="font-semibold text-primary-dark">Pedir presupuesto</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="input"
          placeholder="Tu nombre"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="input"
          type="email"
          placeholder="Tu email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <input
        className="input"
        placeholder="Presupuesto estimado (opcional)"
        value={form.budget}
        onChange={(e) => setForm({ ...form, budget: e.target.value })}
      />
      <textarea
        className="input min-h-[100px]"
        placeholder="Contale sobre tu proyecto: qué necesitás, plazos, detalles…"
        required
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full disabled:opacity-60"
        style={{ background: accent, borderColor: accent }}
      >
        {pending ? "Enviando…" : "Enviar solicitud"}
      </button>
      <p className="text-xs text-gray-400 text-center">
        Worka conecta; el presupuesto y el pago los acuerdan directamente.
      </p>
    </form>
  );
}
