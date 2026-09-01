"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import type { Company, JobStatus, JobWithCompany } from "@/lib/types";
import type { CompanyActivity } from "@/lib/data";
import { BOOST_PLANS } from "@/lib/types";
import { daysUntil, formatDate, isoEnDias, timeAgo } from "@/lib/format";
import {
  deleteJob,
  duplicateJob,
  requestBoost,
  setJobStatus,
  updateJobExpiry,
} from "@/app/actions";

const TIPS = [
  "Las vacantes que indican el rango salarial reciben en promedio 2,4 veces más postulaciones.",
  "Agregá hasta 3 preguntas de filtro: vas a leer solo los perfiles que realmente aplican.",
  "Respondé en menos de 72 h para conservar tu sello ⚡ Responde rápido: los candidatos filtran por él.",
  "Las vacantes con líneas de colectivo reciben más postulaciones de candidatos que sí pueden llegar.",
  "Publicá novedades en tu perfil de empresa: los candidatos las ven antes de postularse.",
  "¿Buscás el mismo puesto cada tanto? Usá «Duplicar» y publicá en 1 clic.",
];

interface DashStats {
  activeJobs: number;
  applicationsThisWeek: number;
  applicationsPrevWeek: number;
  totalViews: number;
  avgResponseHours: number | null;
  applicationsPerJob?: {
    jobId: string;
    title: string;
    count: number;
    status: JobStatus;
  }[];
}

const DIA = 86400000;

/* ── Piezas chicas ─────────────────────────────────────────────────────── */

function EstadoChip({ status }: { status: JobStatus }) {
  const cfg: Record<string, string> = {
    Activo: "bg-emerald-100 text-emerald-800",
    Pausado: "bg-amber-100 text-amber-800",
    Cerrado: "bg-slate-100 text-slate-600",
    Moderacion: "bg-blue-100 text-blue-800",
  };
  const punto: Record<string, string> = {
    Activo: "bg-emerald-500",
    Pausado: "bg-amber-500",
    Cerrado: "bg-slate-400",
    Moderacion: "bg-blue-500",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
        cfg[status] ?? cfg.Cerrado
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${punto[status] ?? punto.Cerrado}`}
      />
      {status === "Moderacion" ? "En revisión" : status}
    </span>
  );
}

// Rótulo chico de las tarjetas. Se repite ocho veces; como componente, el día
// que cambie el tamaño cambia en un solo lugar.
function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold tracking-[.08em] uppercase text-slate-400">
      {children}
    </p>
  );
}

function Tarjeta({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-100 ${className}`}
    >
      {children}
    </div>
  );
}

// Menú de acciones por vacante.
//
// Antes las nueve acciones vivían sueltas en la última columna de la tabla:
// la fila medía 860 px de ancho mínimo, en el celular había que arrastrar de
// costado para llegar a "Eliminar", y "Eliminar" quedaba a un dedo de
// "Duplicar". Acá las dos que se usan siempre quedan a la vista y el resto
// entra en un menú, con la destructiva separada por una línea y en rojo.
function MenuVacante({
  job,
  onEstado,
  onBoost,
  onDuplicar,
  onEliminar,
  onVigencia,
  disabled,
}: {
  job: JobWithCompany;
  onEstado: (s: JobStatus) => void;
  onBoost: () => void;
  onDuplicar: () => void;
  onEliminar: () => void;
  onVigencia: () => void;
  disabled: boolean;
}) {
  // El menú se dibuja en el <body> y no al lado del botón.
  //
  // La tabla vive dentro de un contenedor con overflow-x-auto para que en el
  // celular se pueda arrastrar de costado. Eso lo convierte en contexto de
  // recorte también en vertical: un menú posicionado en absolute quedaba
  // cortado a la altura del borde de la tabla y solo se veían las tres
  // primeras opciones. Con un portal y position:fixed nada lo recorta.
  const [caja, setCaja] = useState<{
    top?: number;
    bottom?: number;
    right: number;
  } | null>(null);
  const open = caja !== null;
  const botonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function fuera(e: MouseEvent) {
      const t = e.target as Node;
      // El menú ya no está adentro del botón, así que hay que preguntarle a
      // los dos: si solo mirásemos el botón, el primer clic sobre una opción
      // cerraría el menú antes de que su propio onClick llegue a correr.
      if (botonRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setCaja(null);
    }
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") setCaja(null);
    }
    // Al estar en coordenadas fijas, el menú no acompaña a la página cuando
    // se desplaza: se cierra, que es lo que hace cualquier menú del sistema.
    function cerrar() {
      setCaja(null);
    }
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", esc);
    window.addEventListener("scroll", cerrar, true);
    window.addEventListener("resize", cerrar);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", esc);
      window.removeEventListener("scroll", cerrar, true);
      window.removeEventListener("resize", cerrar);
    };
  }, [open]);

  // Alto máximo posible del menú: siete opciones más el separador. Se usa
  // como cota para decidir el lado, porque en el momento de abrirlo todavía
  // no existe en el DOM y no se le puede medir el alto real.
  const ALTO_MENU = 300;

  function alternar() {
    if (open) return setCaja(null);
    const r = botonRef.current?.getBoundingClientRect();
    if (!r) return;
    const derecha = window.innerWidth - r.right;
    const libreAbajo = window.innerHeight - r.bottom;
    // La última fila de la tabla suele quedar cerca del borde de abajo: si el
    // menú no entra ahí, se despliega hacia arriba en vez de quedar cortado.
    setCaja(
      libreAbajo < ALTO_MENU && r.top > libreAbajo
        ? { bottom: window.innerHeight - r.top + 4, right: derecha }
        : { top: r.bottom + 4, right: derecha }
    );
  }

  const item = (texto: string, onClick: () => void, danger = false) => (
    <button
      key={texto}
      disabled={disabled}
      onClick={() => {
        onClick();
        setCaja(null);
      }}
      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 disabled:opacity-50 cursor-pointer ${
        danger ? "text-red-500" : "text-slate-700"
      }`}
    >
      {texto}
    </button>
  );

  return (
    <>
      <button
        ref={botonRef}
        onClick={alternar}
        aria-label={`Más acciones para ${job.title}`}
        aria-expanded={open}
        className={`w-7 h-7 rounded-lg grid place-items-center text-base font-bold leading-none cursor-pointer ${
          open ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:bg-slate-50"
        }`}
      >
        ···
      </button>
      {caja &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-50 w-52 rounded-xl py-1 bg-white border border-slate-100 shadow-lg"
            style={{ top: caja.top, bottom: caja.bottom, right: caja.right }}
          >
            {item("📋 Duplicar vacante", onDuplicar)}
            {item("📅 Cambiar vigencia", onVigencia)}
            {job.status === "Activo" &&
              item("⏸ Pausar vacante", () => onEstado("Pausado"))}
            {job.status === "Pausado" &&
              item("▶ Activar vacante", () => onEstado("Activo"))}
            {(job.status === "Activo" || job.status === "Pausado") &&
              item("🔒 Cerrar búsqueda", () => onEstado("Cerrado"))}
            {job.status === "Activo" &&
              !job.featured &&
              item("⚡ Potenciar", onBoost)}
            <div className="border-t border-slate-100 my-1" />
            {item("🗑 Eliminar", onEliminar, true)}
          </div>,
          document.body
        )}
    </>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl p-6 bg-white shadow-2xl animate-fade-up">
        {children}
      </div>
    </div>
  );
}

/* ── Panel ─────────────────────────────────────────────────────────────── */

export default function CompanyDashboard({
  company,
  jobs: initialJobs,
  paymentLink = "",
  stats: realStats,
  activity = [],
}: {
  company: Company;
  jobs: JobWithCompany[];
  paymentLink?: string;
  stats?: DashStats;
  activity?: CompanyActivity[];
}) {
  const [jobs, setJobs] = useState(initialJobs);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingExpiry, setEditingExpiry] = useState<string | null>(null);
  const [expiryValue, setExpiryValue] = useState("");
  const [boosting, setBoosting] = useState<JobWithCompany | null>(null);
  const [boostSent, setBoostSent] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [filtro, setFiltro] = useState<"Todas" | JobStatus>("Todas");
  const [pending, startTransition] = useTransition();

  function flash(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(null), 5000);
  }

  /* ── Acciones ─────────────────────────────────────────────────────── */

  function handleBoost(plan: string, priceGs: number) {
    if (!boosting) return;
    startTransition(async () => {
      const result = await requestBoost(boosting.id, plan, priceGs);
      if (result.ok) setBoostSent(true);
      else {
        setBoosting(null);
        flash(result.error ?? "No pudimos registrar la solicitud.");
      }
    });
  }

  function handleDuplicate(job: JobWithCompany) {
    startTransition(async () => {
      const result = await duplicateJob(job.id);
      if (!result.ok) {
        flash(result.error ?? "No pudimos duplicar la vacante.");
        return;
      }
      // Reflejo local inmediato (en modo live el revalidate lo confirma).
      const copy: JobWithCompany = {
        ...job,
        id: `${job.id}-copy-${Date.now()}`,
        status: "Pausado",
        views_count: 0,
        featured: false,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * DIA).toISOString(),
      };
      setJobs((prev) => [copy, ...prev]);
      flash(
        "✅ Vacante duplicada como borrador (en pausa). Activala cuando quieras."
      );
    });
  }

  function handleStatus(jobId: string, status: JobStatus) {
    startTransition(async () => {
      const result = await setJobStatus(jobId, status);
      if (!result.ok) {
        flash(result.error ?? "No pudimos cambiar el estado.");
        return;
      }
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status } : j))
      );
      flash(
        status === "Pausado"
          ? "⏸️ Vacante pausada: dejó de aparecer en el feed."
          : status === "Activo"
            ? "▶️ Vacante activa de nuevo."
            : "🔒 Búsqueda cerrada. Mirá el resumen en la página de candidatos."
      );
    });
  }

  function handleDelete(jobId: string) {
    setConfirmDelete(null);
    startTransition(async () => {
      const result = await deleteJob(jobId);
      if (!result.ok) {
        flash(result.error ?? "No pudimos eliminar la vacante.");
        return;
      }
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      flash("🗑️ Vacante eliminada definitivamente.");
    });
  }

  function guardarVigencia(jobId: string, fecha: string) {
    if (!fecha) return;
    setEditingExpiry(null);
    startTransition(async () => {
      const result = await updateJobExpiry(jobId, fecha);
      if (!result.ok) {
        flash(result.error ?? "No pudimos actualizar la vigencia.");
        return;
      }
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId ? { ...j, expires_at: new Date(fecha).toISOString() } : j
        )
      );
      flash(`📅 Vigencia actualizada al ${formatDate(fecha)}.`);
    });
  }

  // Renovar: lo que la empresa quiere cuando ve "vence en 2 días" es "dame un
  // mes más", no un calendario. Se cuenta desde hoy y no desde el vencimiento
  // anterior, para que renovar una ya vencida sirva de algo.
  function renovar(job: JobWithCompany) {
    guardarVigencia(job.id, isoEnDias(30));
  }

  /* ── Derivados ────────────────────────────────────────────────────── */

  const semana = realStats?.applicationsThisWeek ?? 0;
  const semanaPrevia = realStats?.applicationsPrevWeek ?? 0;
  const delta = semana - semanaPrevia;

  const tarjetas = [
    {
      label: "Vacantes activas",
      value: String(
        realStats?.activeJobs ?? jobs.filter((j) => j.status === "Activo").length
      ),
      sub: `de ${jobs.length} publicada${jobs.length === 1 ? "" : "s"}`,
      pie: null as string | null,
      accent: "#2563eb",
    },
    {
      label: "Postulaciones esta semana",
      value: String(semana),
      sub: "en todas tus vacantes",
      // Sin semana previa con datos, no hay comparación honesta que mostrar.
      pie:
        semanaPrevia === 0 && semana === 0
          ? null
          : delta === 0
            ? "igual que la semana anterior"
            : `${delta > 0 ? "+" : ""}${delta} vs. semana anterior`,
      accent: "#10b981",
    },
    {
      label: "Vistas totales",
      value: (
        realStats?.totalViews ?? jobs.reduce((s, j) => s + j.views_count, 0)
      ).toLocaleString("es-PY"),
      sub: "acumuladas",
      pie: null,
      accent: "#8b5cf6",
    },
    {
      label: "Tiempo de respuesta",
      value:
        realStats?.avgResponseHours != null
          ? `${realStats.avgResponseHours} h`
          : "—",
      sub: "promedio",
      pie:
        realStats?.avgResponseHours == null
          ? "todavía sin postulaciones revisadas"
          : realStats.avgResponseHours <= 72
            ? "⚡ Sello activo: menos de 72 h"
            : "por encima de 72 h: perdés el sello ⚡",
      accent: "#f59e0b",
    },
  ];

  const porVacante = realStats?.applicationsPerJob ?? [];
  const maxApps = Math.max(...porVacante.map((r) => r.count), 1);
  const appsDe = new Map(porVacante.map((r) => [r.jobId, r.count]));

  const filtradas = filtro === "Todas" ? jobs : jobs.filter((j) => j.status === filtro);

  const porVencer = jobs
    .filter((j) => j.status !== "Cerrado")
    .map((j) => ({ job: j, dias: daysUntil(j.expires_at) }))
    .filter((x) => x.dias <= 7)
    .sort((a, b) => a.dias - b.dias);

  return (
    <div className="space-y-4">
      {notice && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl text-sm bg-emerald-50 border border-emerald-200 text-emerald-800 animate-fade-up">
          <span className="font-medium">{notice}</span>
          <button
            onClick={() => setNotice(null)}
            aria-label="Cerrar aviso"
            className="ml-4 text-lg leading-none opacity-50 hover:opacity-100 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Indicadores ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {tarjetas.map((c) => (
          <Tarjeta key={c.label} className="p-4 lg:p-5 space-y-3">
            {/* Alto mínimo en el rótulo: "Postulaciones esta semana" ocupa dos
                líneas y los otros tres una sola, así que sin esto los números
                grandes de las cuatro tarjetas no arrancan a la misma altura. */}
            <div className="flex items-start justify-between gap-2 min-h-[26px]">
              <Rotulo>{c.label}</Rotulo>
              <span
                className="w-2 h-2 rounded-full shrink-0 mt-0.5"
                style={{ background: c.accent }}
              />
            </div>
            <p className="font-mono-data font-bold leading-none text-[26px] lg:text-[28px] tracking-tight text-slate-900">
              {c.value}
            </p>
            <div>
              <p className="text-xs text-slate-400">{c.sub}</p>
              {c.pie && (
                <p
                  className="text-xs font-semibold mt-1"
                  style={{ color: c.accent }}
                >
                  {c.pie}
                </p>
              )}
            </div>
          </Tarjeta>
        ))}
      </div>

      {/* ── Gráfico + actividad ───────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-3 lg:gap-4">
        <Tarjeta className="lg:col-span-2 p-5 lg:p-6">
          <h2 className="text-sm font-bold text-slate-900">
            Postulaciones por vacante
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 mb-5">
            Totales acumuladas · ordenadas por volumen
          </p>
          {porVacante.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">
              Todavía no recibiste postulaciones.
            </p>
          ) : (
            <div className="space-y-3">
              {porVacante.map((row, i) => (
                <div key={row.jobId} className="flex items-center gap-3">
                  <span className="font-mono-data text-xs w-4 text-right shrink-0 text-slate-300">
                    {i + 1}
                  </span>
                  <Link
                    href={`/empresa/vacantes/${row.jobId}`}
                    title={row.title}
                    className="w-28 lg:w-44 text-xs font-medium truncate shrink-0 text-slate-700 hover:text-blue-600"
                  >
                    {row.title}
                  </Link>
                  <div className="flex-1 h-5 rounded-md overflow-hidden bg-slate-50">
                    <div
                      className={`h-full rounded-md transition-all ${
                        row.status === "Activo"
                          ? "bg-gradient-to-r from-blue-600 to-blue-400"
                          : row.status === "Pausado"
                            ? "bg-amber-500"
                            : "bg-slate-300"
                      }`}
                      style={{
                        width: `${Math.max((row.count / maxApps) * 100, row.count > 0 ? 4 : 0)}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono-data text-sm font-bold w-8 text-right shrink-0 text-slate-800">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Tarjeta>

        <Tarjeta className="p-5 flex flex-col">
          <h2 className="text-sm font-bold text-slate-900 mb-4">
            Actividad reciente
          </h2>
          {activity.length === 0 ? (
            <p className="text-sm text-slate-400 flex-1">
              Cuando alguien se postule, lo vas a ver acá.
            </p>
          ) : (
            <div className="space-y-3.5 flex-1">
              {activity.map((a) => (
                <div key={a.id} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full shrink-0 grid place-items-center text-[10px] font-bold text-white bg-slate-400">
                    {a.name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((p) => p[0]?.toUpperCase() ?? "")
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {a.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      se postuló a{" "}
                      <span className="font-medium text-slate-600">
                        {a.jobTitle}
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-300">{timeAgo(a.at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Tarjeta>
      </div>

      {/* ── Consejo · por vencer · potenciar ──────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-3 lg:gap-4">
        <Tarjeta className="p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-lg grid place-items-center text-sm bg-amber-50">
              💡
            </span>
            <Rotulo>Consejo</Rotulo>
          </div>
          <p className="text-sm leading-relaxed flex-1 text-slate-600">
            {TIPS[tipIndex]}
          </p>
          <button
            onClick={() => setTipIndex((i) => (i + 1) % TIPS.length)}
            className="text-xs font-semibold mt-4 text-left text-blue-600 hover:underline cursor-pointer"
          >
            Siguiente →
          </button>
        </Tarjeta>

        <Tarjeta className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-lg grid place-items-center text-sm bg-orange-50">
              📅
            </span>
            <Rotulo>Próximas a vencer</Rotulo>
          </div>
          {porVencer.length === 0 ? (
            <p className="text-xs text-slate-400">
              Ninguna vacante vence en los próximos 7 días.
            </p>
          ) : (
            <div className="space-y-2">
              {porVencer.map(({ job, dias }) => {
                const urgente = dias <= 3;
                return (
                  <div
                    key={job.id}
                    className={`flex items-center justify-between gap-2 p-2.5 rounded-lg ${
                      urgente ? "bg-orange-50" : "bg-slate-50"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate text-slate-700">
                        {job.title}
                      </p>
                      <p
                        className={`text-xs font-semibold ${
                          urgente ? "text-orange-700" : "text-amber-600"
                        }`}
                      >
                        {dias <= 0
                          ? "Ya venció"
                          : `Vence en ${dias} día${dias === 1 ? "" : "s"}`}
                      </p>
                    </div>
                    <button
                      disabled={pending}
                      onClick={() => renovar(job)}
                      title="Extender 30 días desde hoy"
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 text-white disabled:opacity-50 cursor-pointer ${
                        urgente ? "bg-orange-700" : "bg-amber-500"
                      }`}
                    >
                      Renovar
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Tarjeta>

        <div className="rounded-xl p-5 text-white bg-gradient-to-br from-blue-800 to-blue-600">
          <p className="text-[10px] font-bold tracking-[.08em] uppercase text-blue-200/70">
            Más visibilidad
          </p>
          <p className="text-sm font-semibold mt-1 mb-3 leading-snug">
            Potenciá tus vacantes y recibí{" "}
            <span className="text-blue-300">3× más vistas</span>
          </p>
          <button
            onClick={() => {
              const candidata =
                jobs.find((j) => j.status === "Activo" && !j.featured) ?? null;
              if (!candidata) {
                flash(
                  "Para potenciar necesitás una vacante activa que no esté ya destacada."
                );
                return;
              }
              setBoostSent(false);
              setBoosting(candidata);
            }}
            className="text-xs font-semibold px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
          >
            ⚡ Ver planes →
          </button>
        </div>
      </div>

      {/* ── Vacantes ──────────────────────────────────────────────────── */}
      <Tarjeta className="overflow-hidden">
        <div className="px-4 lg:px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-900">Mis vacantes</h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600">
              {filtradas.length}
            </span>
          </div>
          <div className="flex items-center p-0.5 rounded-lg gap-0.5 bg-slate-50">
            {(["Todas", "Activo", "Pausado", "Cerrado"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`text-xs px-2.5 lg:px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  filtro === f
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-500">
              Todavía no publicaste ninguna vacante.
            </p>
            <Link
              href="/empresa/vacantes/nueva"
              className="text-sm text-blue-600 font-semibold mt-1 inline-block"
            >
              Publicá la primera →
            </Link>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-400">
              No hay vacantes con ese estado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-50">
                  {["Puesto", "Estado", "Vistas", "Postulaciones", "Vence", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 lg:px-5 py-3 text-left text-[10px] font-bold tracking-[.07em] uppercase text-slate-400"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtradas.map((job) => {
                  const apps = appsDe.get(job.id) ?? 0;
                  const vencida = daysUntil(job.expires_at) <= 0;
                  return (
                    <tr
                      key={job.id}
                      className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-4 lg:px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/empresa/vacantes/${job.id}`}
                            className="text-sm font-semibold text-slate-800 hover:text-blue-600"
                          >
                            {job.title}
                          </Link>
                          {job.featured && (
                            <span
                              className="text-amber-400 text-xs shrink-0"
                              title="Vacante destacada"
                            >
                              ⭐
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5 text-slate-400">
                          {job.industry} · publicada {formatDate(job.created_at)}
                        </p>
                      </td>
                      <td className="px-4 lg:px-5 py-3.5 whitespace-nowrap">
                        <EstadoChip status={job.status} />
                      </td>
                      <td className="px-4 lg:px-5 py-3.5">
                        <span className="font-mono-data text-sm font-semibold text-slate-700">
                          {job.views_count.toLocaleString("es-PY")}
                        </span>
                      </td>
                      <td className="px-4 lg:px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full overflow-hidden bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{ width: `${(apps / maxApps) * 100}%` }}
                            />
                          </div>
                          <span className="font-mono-data text-xs font-bold text-slate-700">
                            {apps}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-5 py-3.5">
                        {editingExpiry === job.id ? (
                          <span className="flex items-center gap-1.5">
                            <input
                              type="date"
                              autoFocus
                              className="input py-1.5 px-2 text-xs w-36 min-h-0"
                              value={expiryValue}
                              onChange={(e) => setExpiryValue(e.target.value)}
                            />
                            <button
                              className="text-blue-600 font-semibold text-xs cursor-pointer"
                              onClick={() =>
                                guardarVigencia(job.id, expiryValue)
                              }
                            >
                              OK
                            </button>
                            <button
                              className="text-slate-400 text-xs cursor-pointer"
                              onClick={() => setEditingExpiry(null)}
                            >
                              ✕
                            </button>
                          </span>
                        ) : (
                          <span
                            className={`font-mono-data text-xs ${
                              vencida ? "text-red-500" : "text-slate-500"
                            }`}
                          >
                            {formatDate(job.expires_at)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 lg:px-5 py-3.5">
                        <div className="flex items-center gap-2 justify-end">
                          <Link
                            href={`/empresa/vacantes/${job.id}`}
                            className="text-xs font-semibold text-blue-600 hover:underline shrink-0"
                          >
                            Candidatos
                          </Link>
                          <span className="text-slate-200">·</span>
                          <Link
                            href={`/empresa/vacantes/${job.id}/editar`}
                            className="text-xs font-semibold text-slate-500 hover:underline shrink-0"
                          >
                            Editar
                          </Link>
                          <MenuVacante
                            job={job}
                            disabled={pending}
                            onEstado={(s) => handleStatus(job.id, s)}
                            onDuplicar={() => handleDuplicate(job)}
                            onEliminar={() => setConfirmDelete(job.id)}
                            onBoost={() => {
                              setBoostSent(false);
                              setBoosting(job);
                            }}
                            onVigencia={() => {
                              setEditingExpiry(job.id);
                              setExpiryValue(job.expires_at.slice(0, 10));
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Tarjeta>

      {/* ── Potenciar ─────────────────────────────────────────────────── */}
      {boosting && (
        <Modal onClose={() => setBoosting(null)}>
          {boostSent ? (
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-3 grid place-items-center text-2xl bg-amber-50">
                ⚡
              </div>
              <p className="font-bold text-slate-900">¡Solicitud registrada!</p>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {paymentLink
                  ? "Completá el pago con el botón de abajo. Apenas lo confirmemos, tu vacante aparece destacada arriba del feed."
                  : "Nuestro equipo te contacta para coordinar el pago. Apenas se confirme, tu vacante aparece destacada arriba del feed."}
              </p>
              {paymentLink && (
                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full mt-4"
                >
                  💳 Ir a pagar
                </a>
              )}
              <button
                className="w-full mt-2 py-2 text-sm text-slate-400 hover:text-slate-600 cursor-pointer"
                onClick={() => setBoosting(null)}
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 grid place-items-center text-2xl bg-amber-50">
                  ⚡
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Potenciar «{boosting.title}»
                </h3>
                <p className="text-sm mt-1 text-slate-500">
                  Aparece destacada arriba del feed y recibe en promedio{" "}
                  <strong>3× más vistas</strong>.
                </p>
              </div>
              <div className="space-y-2">
                {BOOST_PLANS.map((p) => (
                  <button
                    key={p.plan}
                    disabled={pending}
                    onClick={() => handleBoost(p.plan, p.price_gs)}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm border-[1.5px] border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800">
                      {p.plan}
                    </span>
                    <span className="font-mono-data font-bold text-slate-900">
                      Gs. {p.price_gs.toLocaleString("es-PY")}
                    </span>
                  </button>
                ))}
              </div>
              <button
                className="w-full mt-3 py-2 text-sm text-slate-400 hover:text-slate-600 cursor-pointer"
                onClick={() => setBoosting(null)}
              >
                Cancelar
              </button>
            </>
          )}
        </Modal>
      )}

      {/* ── Eliminar ──────────────────────────────────────────────────── */}
      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(null)}>
          <div className="w-11 h-11 rounded-xl grid place-items-center text-xl mb-4 bg-red-50">
            🗑
          </div>
          <h3 className="text-base font-bold text-slate-900">
            ¿Eliminar esta vacante?
          </h3>
          <p className="text-sm mt-2 text-slate-500 leading-relaxed">
            Se borra definitivamente junto con sus postulaciones. Si solo
            terminaste la búsqueda, usá <strong>«Cerrar»</strong>: conservás las
            métricas y podés duplicarla más adelante.
          </p>
          <div className="flex gap-2 mt-6">
            <button
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              onClick={() => setConfirmDelete(null)}
            >
              Cancelar
            </button>
            <button
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 cursor-pointer"
              onClick={() => handleDelete(confirmDelete)}
            >
              Sí, eliminar
            </button>
          </div>
        </Modal>
      )}

      {/* El nombre de la empresa lo muestra la barra lateral; acá abajo solo
          hace falta cuando no hay nada más en pantalla. */}
      <span className="sr-only">Panel de {company.trade_name}</span>
    </div>
  );
}
