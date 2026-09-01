"use client";

import { useState, useTransition } from "react";
import type { CompanyMember, CompanyRole } from "@/lib/types";
import { COMPANY_ROLES } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import {
  inviteTeamMember,
  removeTeamMember,
  setTeamMemberRole,
} from "@/app/actions";

const COLOR: Record<CompanyRole, { texto: string; fondo: string; borde: string }> =
  {
    administrador: {
      texto: "text-blue-700",
      fondo: "bg-blue-50",
      borde: "border-blue-200",
    },
    reclutador: {
      texto: "text-emerald-700",
      fondo: "bg-emerald-50",
      borde: "border-emerald-200",
    },
    observador: {
      texto: "text-slate-500",
      fondo: "bg-slate-50",
      borde: "border-slate-200",
    },
  };

function iniciales(email: string) {
  const nombre = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  return nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function Tarjeta({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-100 ${className}`}>
      {children}
    </div>
  );
}

export default function CompanyTeam({
  members: initial,
  companyId,
  puedeGestionar,
}: {
  members: CompanyMember[];
  companyId: string;
  /* Quien no administra ve el equipo pero no lo toca. La base lo impide de
     todos modos (migración 039); esconder los controles es para no ofrecer
     un botón que va a fallar. */
  puedeGestionar: boolean;
}) {
  const [members, setMembers] = useState(initial);
  const [invitando, setInvitando] = useState(false);
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<CompanyRole>("reclutador");
  const [aviso, setAviso] = useState<{ txt: string; mal?: boolean } | null>(
    null
  );
  const [quitar, setQuitar] = useState<CompanyMember | null>(null);
  const [pending, startTransition] = useTransition();

  function flash(txt: string, mal = false) {
    setAviso({ txt, mal });
    setTimeout(() => setAviso(null), 6000);
  }

  function invitar() {
    const limpio = email.trim().toLowerCase();
    if (!limpio) return;
    startTransition(async () => {
      const r = await inviteTeamMember(limpio, rol);
      if (!r.ok) return flash(r.error ?? "No pudimos invitar.", true);
      setMembers((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          company_id: companyId,
          email: limpio,
          member_id: null,
          status: "invitada",
          role: rol,
          created_at: new Date().toISOString(),
        },
      ]);
      setInvitando(false);
      setEmail("");
      flash(
        `📨 Invitación registrada. Cuando ${limpio} ingrese a Worka con ese email, entra directo a este panel.`
      );
    });
  }

  function cambiarRol(m: CompanyMember, role: CompanyRole) {
    const antes = m.role;
    setMembers((prev) =>
      prev.map((x) => (x.id === m.id ? { ...x, role } : x))
    );
    startTransition(async () => {
      const r = await setTeamMemberRole(m.id, role);
      if (!r.ok) {
        // Vuelve atrás: dejar el select en el valor nuevo después de un error
        // haría creer que el cambio se guardó.
        setMembers((prev) =>
          prev.map((x) => (x.id === m.id ? { ...x, role: antes } : x))
        );
        flash(r.error ?? "No pudimos cambiar el rol.", true);
      }
    });
  }

  function confirmarQuitar() {
    if (!quitar) return;
    const m = quitar;
    setQuitar(null);
    setMembers((prev) => prev.filter((x) => x.id !== m.id));
    startTransition(async () => {
      const r = await removeTeamMember(m.id);
      if (!r.ok) {
        setMembers((prev) =>
          [...prev, m].sort((a, b) => a.created_at.localeCompare(b.created_at))
        );
        flash(r.error ?? "No pudimos quitar a esa persona.", true);
      } else {
        flash(`${m.email} ya no tiene acceso al panel.`);
      }
    });
  }

  const activos = members.filter((m) => m.status === "activa");
  const pendientes = members.filter((m) => m.status !== "activa");

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Equipo</h1>
          <p className="text-sm text-slate-500">
            Quién entra a tu panel y qué puede hacer
          </p>
        </div>
        {puedeGestionar && (
          <button
            onClick={() => setInvitando(true)}
            className="flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-semibold text-white bg-gradient-to-br from-blue-600 to-blue-700 hover:opacity-90 transition-opacity cursor-pointer"
          >
            + Invitar
          </button>
        )}
      </div>

      {aviso && (
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm animate-fade-up ${
            aviso.mal
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-emerald-50 border border-emerald-200 text-emerald-800"
          }`}
        >
          <span className="font-medium">{aviso.txt}</span>
          <button
            onClick={() => setAviso(null)}
            aria-label="Cerrar aviso"
            className="ml-4 text-lg leading-none opacity-50 hover:opacity-100 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Los tres roles explicados arriba y no dentro de un tooltip: la
          decisión de qué rol darle a alguien se toma en el momento de
          invitarlo, no después de equivocarse. */}
      <div className="grid sm:grid-cols-3 gap-3">
        {COMPANY_ROLES.map((r) => {
          const c = COLOR[r.id];
          return (
            <div
              key={r.id}
              className={`rounded-xl p-4 border ${c.fondo} ${c.borde}`}
            >
              <p className={`text-xs font-bold mb-1.5 ${c.texto}`}>{r.label}</p>
              <p className="text-xs leading-relaxed text-slate-600">{r.desc}</p>
            </div>
          );
        })}
      </div>

      <Tarjeta className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <h2 className="text-sm font-bold text-slate-900">
            Con acceso ({activos.length + 1})
          </h2>
        </div>

        {/* El dueño no tiene fila en la tabla de miembros, pero es quien más
            acceso tiene: omitirlo haría parecer que el panel no es de nadie. */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-50 bg-slate-50/40">
          <div className="w-9 h-9 rounded-full shrink-0 grid place-items-center text-xs font-bold text-white bg-gradient-to-br from-slate-600 to-slate-800">
            ★
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">
              Dueño de la cuenta
            </p>
            <p className="text-xs text-slate-400">
              Acceso total. No se puede cambiar ni quitar.
            </p>
          </div>
        </div>

        {activos.length === 0 && (
          <p className="px-5 py-6 text-sm text-slate-400">
            Todavía no hay nadie más con acceso.
          </p>
        )}

        {activos.map((m) => (
          <div
            key={m.id}
            className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full shrink-0 grid place-items-center text-xs font-bold text-white bg-slate-400">
                {iniciales(m.email) || "?"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {m.email}
                </p>
                <p className="text-xs text-slate-400">
                  Se sumó {timeAgo(m.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {puedeGestionar ? (
                <select
                  value={m.role}
                  disabled={pending}
                  onChange={(e) =>
                    cambiarRol(m, e.target.value as CompanyRole)
                  }
                  aria-label={`Rol de ${m.email}`}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold border border-slate-200 bg-white cursor-pointer outline-none disabled:opacity-50 ${COLOR[m.role].texto}`}
                >
                  {COMPANY_ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${COLOR[m.role].fondo} ${COLOR[m.role].texto}`}
                >
                  {COMPANY_ROLES.find((r) => r.id === m.role)?.label}
                </span>
              )}
              {puedeGestionar && (
                <button
                  onClick={() => setQuitar(m)}
                  disabled={pending}
                  className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-50 cursor-pointer"
                >
                  Quitar
                </button>
              )}
            </div>
          </div>
        ))}
      </Tarjeta>

      {pendientes.length > 0 && (
        <Tarjeta className="overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50">
            <h2 className="text-sm font-bold text-slate-900">
              Invitaciones pendientes ({pendientes.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Entran solas apenas la persona ingrese a Worka con ese email.
            </p>
          </div>
          {pendientes.map((m) => (
            <div
              key={m.id}
              className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-50"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">
                  {m.email}
                </p>
                <p className="text-xs text-slate-400">
                  Invitada como{" "}
                  {COMPANY_ROLES.find((r) => r.id === m.role)?.label} ·{" "}
                  {timeAgo(m.created_at)}
                </p>
              </div>
              {puedeGestionar && (
                <button
                  onClick={() => setQuitar(m)}
                  disabled={pending}
                  className="text-xs font-semibold text-slate-400 hover:text-red-500 disabled:opacity-50 cursor-pointer"
                >
                  Cancelar
                </button>
              )}
            </div>
          ))}
        </Tarjeta>
      )}

      {/* ── Invitar ───────────────────────────────────────────────────── */}
      {invitando && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55"
          onClick={(e) => {
            if (e.target === e.currentTarget) setInvitando(false);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl p-6 bg-white shadow-2xl animate-fade-up">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Invitar al equipo
            </h3>
            <label className="text-xs font-semibold block mb-1.5 text-slate-500">
              Email
            </label>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && invitar()}
              placeholder="nombre@tuempresa.com.py"
              className="input mb-4"
            />
            <label className="text-xs font-semibold block mb-1.5 text-slate-500">
              Rol
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value as CompanyRole)}
              className="input mb-2 cursor-pointer"
            >
              {COMPANY_ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 leading-relaxed">
              {COMPANY_ROLES.find((r) => r.id === rol)?.desc}
            </p>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setInvitando(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={invitar}
                disabled={!email.trim() || pending}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-blue-600 to-blue-700 disabled:opacity-50 cursor-pointer"
              >
                Enviar invitación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Quitar ────────────────────────────────────────────────────── */}
      {quitar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55"
          onClick={(e) => {
            if (e.target === e.currentTarget) setQuitar(null);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl p-6 bg-white shadow-2xl animate-fade-up">
            <h3 className="text-base font-bold text-slate-900">
              {quitar.status === "activa"
                ? "¿Quitar el acceso?"
                : "¿Cancelar la invitación?"}
            </h3>
            <p className="text-sm mt-2 text-slate-500 leading-relaxed">
              {quitar.status === "activa" ? (
                <>
                  <strong>{quitar.email}</strong> deja de ver tus vacantes,
                  candidatos y mensajes. Las notas y los cambios que ya hizo
                  quedan.
                </>
              ) : (
                <>
                  <strong>{quitar.email}</strong> ya no va a entrar al panel
                  cuando ingrese a Worka.
                </>
              )}
            </p>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setQuitar(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                No
              </button>
              <button
                onClick={confirmarQuitar}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 cursor-pointer"
              >
                Sí, quitar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
