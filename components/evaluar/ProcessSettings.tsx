"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Palette,
  Target,
  UserPlus,
  Users,
  X,
  Building2,
} from "lucide-react";
import type { ProcessDetail } from "@/lib/evaluar";
import { THEMES, readableOn } from "@/lib/evaluar/themes";
import { ALL_DIMENSIONS } from "@/lib/evaluar/templates";
import {
  addProcessMember,
  removeProcessMember,
  setIdealProfile,
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

// ── Perfil ideal del puesto ────────────────────────────────────

export function IdealProfile({ detail }: { detail: ProcessDetail }) {
  const router = useRouter();
  const [pesos, setPesos] = useState<Record<string, number>>(
    detail.process.ideal_profile ?? {}
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Solo los rasgos que este proceso realmente mide: ofrecer los 20 del
  // catálogo cuando el proceso mide 5 sería pedirle a la empresa que decida
  // sobre cosas que nadie va a responder.
  const disponibles = [
    ...new Set(
      detail.stages
        .flatMap((s) => s.questions.map((q) => q.dimension))
        .filter((d): d is string => !!d)
    ),
  ];

  if (disponibles.length === 0) {
    return (
      <div className="card p-5">
        <h2 className="font-semibold text-primary-dark flex items-center gap-2">
          <Target size={17} /> Perfil ideal del puesto
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Agregá un test de personalidad, estilo laboral o juicio situacional y
          acá vas a poder decir qué rasgos importan para este puesto.
        </p>
      </div>
    );
  }

  function guardar() {
    setError(null);
    startTransition(async () => {
      const limpio = Object.fromEntries(
        Object.entries(pesos).filter(([, v]) => v > 0)
      );
      const r = await setIdealProfile(detail.process.id, limpio);
      if (r.ok) router.refresh();
      else setError(r.error ?? "No pudimos guardar.");
    });
  }

  const elegidos = Object.values(pesos).filter((v) => v > 0).length;

  return (
    <div className="card p-5 space-y-4">
      <div>
        <h2 className="font-semibold text-primary-dark flex items-center gap-2">
          <Target size={17} /> Perfil ideal del puesto
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Decí qué rasgos importan para <strong>este</strong> puesto y cuánto.
          El tablero va a ordenar por ajuste real en vez de por puntaje bruto,
          que trata igual a un cajero y a un supervisor.
        </p>
      </div>

      <div className="space-y-2">
        {disponibles.map((key) => {
          const dim = ALL_DIMENSIONS[key];
          const peso = pesos[key] ?? 0;
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-800 truncate">
                  {dim?.label ?? key}
                </p>
                {dim && (
                  <p className="text-[11px] text-slate-400 truncate">
                    Alto: {dim.high}
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                {[
                  { v: 0, l: "No" },
                  { v: 1, l: "Suma" },
                  { v: 2, l: "Importa" },
                  { v: 3, l: "Clave" },
                ].map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setPesos((p) => ({ ...p, [key]: o.v }))}
                    className={`chip press ${
                      peso === o.v
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <p className="text-xs text-slate-400">
        {elegidos === 0
          ? "Sin rasgos elegidos, el tablero ordena por puntaje bruto."
          : `${elegidos} ${elegidos === 1 ? "rasgo elegido" : "rasgos elegidos"}. El ajuste se calcula solo sobre lo que cada persona ya rindió.`}
      </p>

      <button
        onClick={guardar}
        disabled={pending}
        className="btn-primary press w-full"
      >
        {pending ? "Guardando…" : "Guardar perfil ideal"}
      </button>
    </div>
  );
}

// ── Datos del concurso ─────────────────────────────────────────

// Para qué unidad y departamento se está llamando, y quién es el responsable.
//
// En una empresa de un local alcanza con el nombre del puesto. En una con
// sucursales, o en el sector público, no: "Cajero" no distingue nada, y el
// informe termina sobre el escritorio de alguien que no participó de la
// búsqueda y no sabe qué está mirando.
export function ProcessOrg({ detail }: { detail: ProcessDetail }) {
  const router = useRouter();
  const { process } = detail;
  const [orgUnit, setOrgUnit] = useState(process.org_unit ?? "");
  const [department, setDepartment] = useState(process.department ?? "");
  const [managerName, setManagerName] = useState(process.manager_name ?? "");
  const [managerEmail, setManagerEmail] = useState(process.manager_email ?? "");
  const [aviso, setAviso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function guardar() {
    setError(null);
    setAviso(null);
    startTransition(async () => {
      const r = await updateProcess(process.id, {
        org_unit: orgUnit.trim(),
        department: department.trim(),
        manager_name: managerName.trim(),
        manager_email: managerEmail.trim().toLowerCase(),
      });
      if (r.ok) router.refresh();
      else setError(r.error ?? "No pudimos guardar.");
    });
  }

  // Guardar el email del jefe y darle acceso son dos cosas distintas: se puede
  // querer dejarlo asentado en el informe sin que entre a mirar candidatos.
  function invitar() {
    setError(null);
    setAviso(null);
    startTransition(async () => {
      const r = await addProcessMember(process.id, managerEmail.trim());
      if (!r.ok) {
        setError(r.error ?? "No pudimos invitarlo.");
        return;
      }
      setAviso(
        r.emailReason ??
          `Le avisamos a ${managerEmail.trim()} que ya puede ver el concurso.`
      );
      router.refresh();
    });
  }

  const emailValido = /.+@.+\..+/.test(managerEmail.trim());

  return (
    <div className="card p-5 space-y-4">
      <div>
        <h2 className="font-semibold text-primary-dark flex items-center gap-2">
          <Building2 size={17} /> Para qué área es el concurso
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Aparece en el informe y en el correo al equipo. Sirve para no
          confundir dos búsquedas del mismo puesto en áreas distintas.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Unidad organizacional</label>
          <input
            className="input"
            placeholder="Ej: Sucursal Centro"
            value={orgUnit}
            onChange={(e) => setOrgUnit(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Departamento</label>
          <input
            className="input"
            placeholder="Ej: Atención al cliente"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Jefe o encargado</label>
          <input
            className="input"
            placeholder="Nombre y apellido"
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Su email</label>
          <input
            type="email"
            className="input"
            placeholder="jefe@empresa.com"
            value={managerEmail}
            onChange={(e) => setManagerEmail(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-danger bg-red-50 rounded-xl px-3.5 py-2.5">
          {error}
        </p>
      )}
      {aviso && (
        <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
          {aviso}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={guardar}
          disabled={pending}
          className="btn-primary press text-sm disabled:opacity-50"
        >
          Guardar
        </button>
        <button
          onClick={invitar}
          disabled={pending || !emailValido}
          title={
            emailValido
              ? "Le damos acceso para ver candidatos y dejar notas"
              : "Cargá primero un email válido"
          }
          className="btn-secondary press text-sm disabled:opacity-40"
        >
          <UserPlus size={15} /> Invitarlo a ver el concurso
        </button>
      </div>
    </div>
  );
}
