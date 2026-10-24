"use client";

import { useState, useTransition } from "react";
import { Check, CheckCircle2, FileText, Loader2, Lock, Mail, MapPin, Phone, User } from "lucide-react";
import { connectWorkaProfile, type WorkaConnectInfo } from "@/app/evaluar/actions";

// Tarjeta de consentimiento: qué se comparte, con quién y el botón de
// permitir. Después de permitir hay una confirmación breve antes de volver a
// la evaluación, para que el salto de dominio no se sienta como un error.
export default function WorkaConsent({
  token,
  info,
  returnUrl,
  evaluarBase,
}: {
  token: string;
  info: WorkaConnectInfo;
  returnUrl: string;
  evaluarBase: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  function permitir() {
    setError(null);
    start(async () => {
      const r = await connectWorkaProfile(token);
      if (!r.ok) {
        setError(r.error ?? "No pudimos conectar tu cuenta.");
        return;
      }
      setListo(true);
      const destino = `${evaluarBase}${r.token ?? token}?worka=1`;
      setTimeout(() => window.location.assign(destino), 1100);
    });
  }

  if (listo) {
    return (
      <div className="card p-8 text-center animate-rise">
        <span className="mx-auto w-14 h-14 rounded-full bg-emerald-50 grid place-items-center animate-pop">
          <CheckCircle2 size={30} className="text-emerald-600" />
        </span>
        <p className="font-semibold text-lg text-primary-dark mt-4">Listo, tus datos ya están cargados</p>
        <p className="text-sm text-slate-500 mt-1">Te llevamos de vuelta a tu evaluación…</p>
        <div className="h-1 rounded-full bg-[#ebe9e6] overflow-hidden mt-5">
          <div className="h-full bg-primary rounded-full ev-load-bar" />
        </div>
      </div>
    );
  }

  if (info.notCandidate || info.linkedToOther) {
    return (
      <div className="card p-6 text-center">
        <p className="font-semibold text-primary-dark">
          {info.notCandidate ? "Esta cuenta no es de postulante" : "Esta evaluación ya está conectada"}
        </p>
        <p className="text-sm text-slate-500 mt-1.5">
          {info.notCandidate
            ? "Entraste con una cuenta de empresa. Para compartir tu perfil, ingresá con tu cuenta personal de Worka Empleos."
            : "La conectó otra cuenta de Worka Empleos. Podés seguir con la evaluación sin conectar."}
        </p>
        <a href={returnUrl} className="btn-primary press w-full mt-5">Volver a la evaluación</a>
      </div>
    );
  }

  const u = info.user;
  const datos = [
    { Icon: User, label: "Nombre completo", value: u?.name },
    { Icon: Mail, label: "Email", value: u?.email },
    { Icon: Phone, label: "WhatsApp", value: u?.phone },
    { Icon: MapPin, label: "Ciudad", value: u?.city },
    { Icon: FileText, label: "CV", value: u?.hasCv ? "Tu CV en PDF" : null },
  ].filter((d) => d.value);

  return (
    <div className="card p-6 sm:p-7 animate-rise">
      <div className="flex items-center gap-2 text-xs font-semibold text-[#5d5294]">
        <span className="rounded-full bg-[#efedfb] px-2.5 py-0.5">Worka Evaluar</span>
        <span className="text-slate-400">·</span>
        <span className="text-slate-500 font-medium truncate">{info.company}</span>
      </div>
      <h1 className="text-xl font-bold text-primary-dark mt-3 leading-snug">
        {info.company} quiere usar tu perfil de Worka Empleos
      </h1>
      <p className="text-sm text-slate-500 mt-1.5">
        Para tu evaluación «{info.process}». Así no tenés que cargar tus datos de nuevo.
      </p>

      {u && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#e0dfdc] px-4 py-3 mt-5">
          <span className="w-10 h-10 rounded-full bg-brand text-white grid place-items-center font-semibold shrink-0">
            {u.name.trim()[0]?.toUpperCase() ?? "W"}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary-dark truncate">{u.name}</p>
            {u.email && <p className="text-xs text-slate-500 truncate">{u.email}</p>}
          </div>
        </div>
      )}

      <p className="text-xs font-semibold text-slate-500 mt-5 mb-2">Se va a compartir</p>
      <ul className="space-y-2">
        {datos.map(({ Icon, label, value }, i) => (
          <li
            key={label}
            className="flex items-center gap-3 text-sm animate-rise"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="w-8 h-8 rounded-full bg-[#eef5fc] text-primary grid place-items-center shrink-0">
              <Icon size={15} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-primary-dark">{label}</span>
              <span className="block text-xs text-slate-500 truncate">{value}</span>
            </span>
            <Check size={16} className="text-emerald-600 shrink-0" />
          </li>
        ))}
      </ul>

      <p className="text-xs text-slate-500 mt-4 flex items-start gap-2">
        <Lock size={13} className="shrink-0 mt-0.5" />
        No se comparten tus postulaciones, mensajes ni tu contraseña. Es opcional: podés rendir igual sin conectar.
      </p>

      {error && <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3 mt-4">{error}</p>}

      <button
        type="button"
        onClick={permitir}
        disabled={pending}
        className="w-full mt-5 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 press flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {pending ? (
          <>
            <Loader2 size={17} className="animate-spin" /> Conectando…
          </>
        ) : (
          <>Permitir y continuar{u ? ` como ${u.name.split(" ")[0]}` : ""}</>
        )}
      </button>
      <a href={returnUrl} className="block text-center text-sm font-medium text-primary mt-3 py-1.5">
        Cancelar y seguir sin conectar
      </a>
    </div>
  );
}
