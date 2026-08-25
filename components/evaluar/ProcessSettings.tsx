"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Palette, UserPlus, Users, X } from "lucide-react";
import type { ProcessDetail } from "@/lib/evaluar";
import { THEMES, readableOn } from "@/lib/evaluar/themes";
import {
  addProcessMember,
  removeProcessMember,
  updateProcess,
} from "@/app/evaluar/actions";

// ── Diseño de la evaluación ────────────────────────────────────

export function ProcessDesign({ detail }: { detail: ProcessDetail }) {
  const router = useRouter();
  const { process } = detail;
  const [theme, setTheme] = useState(process.theme ?? "sobrio");
  const [useBrand, setUseBrand] = useState(process.use_company_brand !== false);
  const [color, setColor] = useState(process.brand_color ?? "");
  const [deadline, setDeadline] = useState(
    process.deadline_at ? process.deadline_at.slice(0, 10) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function guardar() {
    setError(null);
    startTransition(async () => {
      const r = await updateProcess(process.id, {
        theme,
        use_company_brand: useBrand,
        brand_color: color.trim() || null,
        // Se guarda al final del día para que "hasta el 30" incluya el 30.
        deadline_at: deadline ? `${deadline}T23:59:59` : null,
      });
      if (r.ok) router.refresh();
      else setError(r.error ?? "No pudimos guardar.");
    });
  }

  const activo = THEMES[theme as keyof typeof THEMES] ?? THEMES.sobrio;
  const accent = color.trim() || activo.accent;

  return (
    <div className="card p-5 space-y-4">
      <div>
        <h2 className="font-semibold text-primary-dark flex items-center gap-2">
          <Palette size={17} /> Cómo ve el candidato la evaluación
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Con tu marca la gente siente que está con vos y no en una plataforma
          ajena. Eso sube la confianza y la cantidad que termina.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-2">
        {Object.values(THEMES).map((t) => (
          <button
            key={t.key}
            onClick={() => setTheme(t.key)}
            className={`text-left rounded-2xl border-2 p-3 press transition-colors ${
              theme === t.key
                ? "border-primary bg-blue-50/50"
                : "border-slate-200"
            }`}
          >
            {/* Miniatura del estilo */}
            <span className={`block h-12 rounded-xl ${t.page} border border-slate-200 relative overflow-hidden`}>
              <span
                className="absolute inset-x-0 top-0 h-4"
                style={{ background: color.trim() || t.accent }}
              />
              <span className="absolute left-2 bottom-1.5 right-2 h-3 rounded bg-white border border-slate-200" />
            </span>
            <span className="block text-sm font-medium text-primary-dark mt-2">
              {t.name}
            </span>
            <span className="block text-[11px] text-slate-500 leading-snug">
              {t.hint}
            </span>
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2.5 text-sm text-slate-700">
        <input
          type="checkbox"
          className="w-5 h-5 accent-primary"
          checked={useBrand}
          onChange={(e) => setUseBrand(e.target.checked)}
        />
        Mostrar el logo de mi empresa
      </label>

      <div>
        <label className="label">Color de tu marca (opcional)</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={accent}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-11 rounded-xl border border-slate-200 bg-white p-1 cursor-pointer"
            aria-label="Elegir color"
          />
          <input
            className="input flex-1 font-mono text-sm"
            placeholder="#2563eb"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          {color && (
            <button
              onClick={() => setColor("")}
              className="btn-secondary press text-xs shrink-0"
            >
              Quitar
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-2">
          <span
            className="chip"
            style={{ background: accent, color: readableOn(accent) }}
          >
            Así se ven los botones
          </span>
          El texto se aclara u oscurece solo para que se lea.
        </p>
      </div>

      <div>
        <label className="label flex items-center gap-1.5">
          <CalendarClock size={14} /> Fecha límite (opcional)
        </label>
        <input
          type="date"
          className="input"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <p className="text-xs text-slate-400 mt-1">
          Se le muestra al candidato y se controla en el servidor: pasada la
          fecha ya no puede enviar, aunque haya dejado la pestaña abierta.
        </p>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        onClick={guardar}
        disabled={pending}
        className="btn-primary press w-full"
      >
        {pending ? "Guardando…" : "Guardar diseño"}
      </button>
    </div>
  );
}

// ── Equipo evaluador ───────────────────────────────────────────

export function ProcessTeam({ detail }: { detail: ProcessDetail }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function sumar() {
    setError(null);
    startTransition(async () => {
      const r = await addProcessMember(detail.process.id, email);
      if (r.ok) {
        setEmail("");
        router.refresh();
      } else setError(r.error ?? "No pudimos sumar a esa persona.");
    });
  }

  function quitar(id: string) {
    startTransition(async () => {
      const r = await removeProcessMember(detail.process.id, id);
      if (r.ok) router.refresh();
      else setError(r.error ?? "No pudimos quitar a esa persona.");
    });
  }

  return (
    <div className="card p-5 space-y-3">
      <div>
        <h2 className="font-semibold text-primary-dark flex items-center gap-2">
          <Users size={17} /> Equipo evaluador
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Sumá al jefe del área para que vea a los candidatos y deje sus notas.
          Editar el proceso sigue siendo solo tuyo.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="input flex-1"
          type="email"
          placeholder="Email de su cuenta de Worka"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={sumar}
          disabled={pending || !email.trim()}
          className="btn-primary press disabled:opacity-40"
        >
          <UserPlus size={15} /> Sumar
        </button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {detail.members.length === 0 ? (
        <p className="text-sm text-slate-400">
          Por ahora evaluás solo vos.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {detail.members.map((m) => (
            <li
              key={m.id}
              className="py-2.5 flex items-center justify-between gap-3"
            >
              <span className="text-sm text-slate-700 font-mono truncate">
                {m.user_id.slice(0, 8)}…
              </span>
              <button
                onClick={() => quitar(m.id)}
                disabled={pending}
                aria-label="Quitar del equipo"
                className="w-8 h-8 grid place-items-center rounded-full text-slate-300 hover:text-danger press"
              >
                <X size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
