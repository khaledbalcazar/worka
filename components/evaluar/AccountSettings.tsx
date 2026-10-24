"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  Building2,
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  KeyRound,
  Link2,
  LogOut,
  Palette,
  ShieldCheck,
  Users,
} from "lucide-react";
import { setCompanyEmailNotifications, signOut, updateCompanyProfile, updatePassword } from "@/app/actions";

// Ajustes de la cuenta de Worka Evaluar, en tarjetas por tema como un panel
// de configuración. Cada tarjeta guarda lo suyo (no hay un «Guardar» global
// que pise todo) y solo hay opciones que existen de verdad: el perfil de la
// empresa, la contraseña, los correos, el plan y los accesos a Worka
// Empresas, que es la misma cuenta.

export type SettingsData = {
  companyName: string;
  legalName: string;
  ruc: string;
  verified: boolean;
  logoUrl: string | null;
  description: string;
  city: string;
  website: string;
  email: string;
  emailNotifications: boolean;
  plan: { label: string; inTrial: boolean; active: boolean; daysLeft: number; limit: number | null; activeCount: number };
  processCount: number;
  linkedJobs: number;
  activeJobs: number;
};

function Card({
  title,
  Icon,
  children,
  className = "",
}: {
  title: string;
  Icon: typeof Bell;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`ev-set ${className}`}>
      <div className="flex items-center gap-3">
        <span className="ev-set-icon">
          <Icon size={20} />
        </span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Status({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null;
  return (
    <p role="status" className={`text-sm rounded-lg px-3 py-2 ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
      {msg.text}
    </p>
  );
}

export default function AccountSettings({ data }: { data: SettingsData }) {
  const router = useRouter();

  // Perfil
  const [tradeName, setTradeName] = useState(data.companyName);
  const [city, setCity] = useState(data.city);
  const [website, setWebsite] = useState(data.website);
  const [description, setDescription] = useState(data.description);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [savingProfile, startProfile] = useTransition();
  const profileDirty =
    tradeName !== data.companyName || city !== data.city || website !== data.website || description !== data.description;

  // Seguridad
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [passMsg, setPassMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [savingPass, startPass] = useTransition();
  const [copied, setCopied] = useState(false);

  // Notificaciones
  const [mails, setMails] = useState(data.emailNotifications);
  const [mailMsg, setMailMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [savingMail, startMail] = useTransition();

  function saveProfile() {
    setProfileMsg(null);
    const site = website.trim();
    if (site && !/^https?:\/\//i.test(site)) {
      setProfileMsg({ ok: false, text: "La web tiene que empezar con https://" });
      return;
    }
    startProfile(async () => {
      const r = await updateCompanyProfile({
        trade_name: tradeName.trim() || data.companyName,
        location_city: city.trim(),
        website_url: site || null,
        description: description.trim(),
      });
      setProfileMsg(r.ok ? { ok: true, text: "Perfil guardado." } : { ok: false, text: r.error ?? "No pudimos guardar." });
      if (r.ok) router.refresh();
    });
  }

  function savePassword() {
    setPassMsg(null);
    if (pass.length < 8) return setPassMsg({ ok: false, text: "Usá al menos 8 caracteres." });
    if (pass !== pass2) return setPassMsg({ ok: false, text: "Las dos contraseñas no coinciden." });
    startPass(async () => {
      const r = await updatePassword(pass);
      if (r.ok) {
        setPass("");
        setPass2("");
      }
      setPassMsg(r.ok ? { ok: true, text: "Contraseña actualizada." } : { ok: false, text: r.error ?? "No pudimos cambiarla." });
    });
  }

  function toggleMails() {
    const next = !mails;
    setMails(next);
    setMailMsg(null);
    startMail(async () => {
      const r = await setCompanyEmailNotifications(next);
      if (!r.ok) {
        setMails(!next);
        setMailMsg({ ok: false, text: r.error ?? "No pudimos guardar." });
      } else setMailMsg({ ok: true, text: next ? "Vas a recibir los avisos por correo." : "No te mandamos más avisos por correo." });
    });
  }

  const { plan } = data;
  const pct = plan.limit ? Math.min(100, Math.round((plan.activeCount / plan.limit) * 100)) : 12;
  const initials = data.companyName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="ev-settings">
      {/* ── Perfil de la empresa ── */}
      <Card title="Perfil de la empresa" Icon={Building2} className="xl:row-span-2">
        <div className="flex items-center gap-4">
          <span className="ev-avatar is-lg">
            {data.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.logoUrl} alt="" />
            ) : (
              initials || "W"
            )}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-primary-dark truncate">{data.companyName}</p>
            <p className="text-xs text-slate-500 truncate">{data.legalName}</p>
            <p className="text-xs mt-1 flex items-center gap-1.5 text-slate-600">
              <ShieldCheck size={13} className={data.verified ? "text-emerald-600" : "text-amber-600"} />
              {data.verified ? `RUC ${data.ruc} verificado` : `RUC ${data.ruc} · verificación pendiente`}
            </p>
          </div>
        </div>
        <label className="block">
          <span className="label">Nombre comercial</span>
          <input className="input" value={tradeName} onChange={(e) => setTradeName(e.target.value)} />
          <span className="text-xs text-slate-500">Es el que ven los candidatos en la evaluación.</span>
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="label">Ciudad</span>
            <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
          <label className="block">
            <span className="label">Sitio web</span>
            <input className="input" placeholder="https://" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
        </div>
        <label className="block">
          <span className="label">Sobre la empresa</span>
          <textarea className="input min-h-24" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <Status msg={profileMsg} />
        <div className="flex flex-col sm:flex-row gap-2">
          <button className="btn-primary press flex-1" disabled={!profileDirty || savingProfile} onClick={saveProfile}>
            {savingProfile ? "Guardando…" : "Guardar perfil"}
          </button>
          <Link href="/empresa/perfil" className="ev-set-btn flex-1">
            Logo y página pública <ExternalLink size={14} />
          </Link>
        </div>
      </Card>

      {/* ── Cuenta y seguridad ── */}
      <Card title="Cuenta y seguridad" Icon={KeyRound}>
        <div>
          <p className="label">Correo de acceso</p>
          <p className="flex items-center gap-2 text-sm text-primary-dark break-all">
            {data.email || "—"}
            {data.email && (
              <button
                type="button"
                aria-label="Copiar correo"
                className="text-slate-500 hover:text-primary"
                onClick={() => {
                  navigator.clipboard?.writeText(data.email);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
            )}
          </p>
          <p className="text-xs text-slate-500 mt-1">Es la misma cuenta de Worka Empresas.</p>
        </div>
        <div className="grid gap-2">
          <span className="label !mb-0">Cambiar contraseña</span>
          <input className="input" type="password" autoComplete="new-password" placeholder="Nueva contraseña" value={pass} onChange={(e) => setPass(e.target.value)} />
          <input className="input" type="password" autoComplete="new-password" placeholder="Repetila" value={pass2} onChange={(e) => setPass2(e.target.value)} />
        </div>
        <Status msg={passMsg} />
        <button className="ev-set-btn" disabled={!pass || savingPass} onClick={savePassword}>
          {savingPass ? "Guardando…" : "Actualizar contraseña"}
        </button>
        <form action={signOut}>
          <button type="submit" className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-red-700 min-h-10 rounded-full hover:bg-red-50">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </form>
      </Card>

      {/* ── Notificaciones ── */}
      <Card title="Notificaciones" Icon={Bell}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary-dark">Avisos por correo</p>
            <p className="text-sm text-slate-600 mt-0.5">
              Postulaciones nuevas a tus vacantes y vacantes por vencer. La campanita del panel de empresa sigue avisando igual.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={mails}
            aria-label="Avisos por correo"
            className="ev-switch-toggle mt-1"
            disabled={savingMail}
            onClick={toggleMails}
          />
        </div>
        <Status msg={mailMsg} />
      </Card>

      {/* ── Plan y facturación ── */}
      <Card title="Plan y facturación" Icon={CreditCard}>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-lg font-semibold text-primary-dark">Plan {plan.label}</p>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${plan.active ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
            {!plan.active ? "Vencido" : plan.inTrial ? `Prueba · ${plan.daysLeft} días` : "Activo"}
          </span>
        </div>
        <div>
          <div className="ev-meter" aria-hidden>
            <span style={{ width: `${pct}%` }} className={plan.limit && plan.activeCount >= plan.limit ? "is-full" : ""} />
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            {plan.limit === null
              ? `${plan.activeCount} ${plan.activeCount === 1 ? "proceso publicado" : "procesos publicados"} (sin límite)`
              : `${plan.activeCount} de ${plan.limit} procesos publicados`}{" "}
            · {data.processCount} en total
          </p>
        </div>
        <Link href="/evaluar/app/plan" className="ev-set-btn">
          {plan.inTrial || !plan.active ? "Ver planes y contratar" : "Ver plan y pagos"}
        </Link>
      </Card>

      {/* ── Worka Empresas ── */}
      <Card title="Conexión con Worka Empresas" Icon={Link2}>
        <p className="text-sm text-slate-600">
          Evaluar y el panel de empresa son la misma cuenta. Al enlazar un proceso con una vacante, quien se postula empieza la evaluación desde el aviso.
        </p>
        <ul className="text-sm space-y-1.5">
          <li className="flex justify-between gap-2">
            <span className="text-slate-600">Vacantes activas</span>
            <strong className="text-primary-dark">{data.activeJobs}</strong>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-slate-600">Enlazadas a un proceso</span>
            <strong className="text-primary-dark">{data.linkedJobs}</strong>
          </li>
        </ul>
        <div className="grid sm:grid-cols-2 gap-2">
          <Link href="/empresa" className="ev-set-btn">
            Panel de empresa
          </Link>
          <Link href="/empresa/vacantes/nueva" className="ev-set-btn">
            Publicar vacante
          </Link>
        </div>
      </Card>

      {/* ── Equipo ── */}
      <Card title="Equipo" Icon={Users}>
        <p className="text-sm text-slate-600">
          Sumá a tu equipo de selección a cada proceso desde <strong>Ajustes del proceso</strong>: pueden ver candidatos, dejar notas y
          opinar. Las personas de tu empresa se administran en Worka Empresas.
        </p>
        <Link href="/empresa/equipo" className="ev-set-btn">
          Equipo de la empresa <ExternalLink size={14} />
        </Link>
      </Card>

      {/* ── Diseño de las evaluaciones ── */}
      <Card title="Diseño de las evaluaciones" Icon={Palette}>
        <p className="text-sm text-slate-600">
          Cada proceso elige cómo lo ve el candidato: estilo sobrio, moderno o cálido, y el color de tu marca. Se configura en{" "}
          <strong>Ajustes del proceso</strong> y podés revisarlo antes de invitar.
        </p>
        <Link href="/evaluar/app/procesos" className="ev-set-btn">
          Ir a mis procesos
        </Link>
      </Card>

      {/* ── Ayuda ── */}
      <Card title="Ayuda y recursos" Icon={BookOpen}>
        <p className="text-sm text-slate-600">Guías para elegir pruebas, leer resultados y evaluar con criterio.</p>
        <div className="grid sm:grid-cols-2 gap-2">
          <Link href="/evaluar/recursos" className="ev-set-btn">
            Guías
          </Link>
          <Link href="/privacidad" className="ev-set-btn">
            Privacidad
          </Link>
        </div>
      </Card>
    </div>
  );
}
