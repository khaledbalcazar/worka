"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Briefcase,
  Check,
  FileText,
  GraduationCap,
  ListChecks,
  Map as MapIcon,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { seenKey, type WhatsNewConfig, type WhatsNewIcon } from "@/lib/whats-new";

const ICONS: Record<WhatsNewIcon, LucideIcon> = {
  search: Search,
  sparkles: Sparkles,
  map: MapIcon,
  "list-checks": ListChecks,
  "file-text": FileText,
  "shield-check": ShieldCheck,
  "graduation-cap": GraduationCap,
  "user-round": UserRound,
  bell: Bell,
  "message-circle": MessageCircle,
  zap: Zap,
  briefcase: Briefcase,
};

// localStorage puede no estar (modo privado, cookies bloqueadas): en ese caso
// el popup se comporta como si nunca se hubiera visto, sin romper nada.
function wasSeen(version: string): boolean {
  try {
    return window.localStorage.getItem(seenKey(version)) === "1";
  } catch {
    return false;
  }
}

function markSeen(version: string) {
  try {
    window.localStorage.setItem(seenKey(version), "1");
  } catch {
    // Sin almacenamiento no hay forma de recordarlo; se ignora.
  }
}

// Popup "¡Nos renovamos!". En /empleos se abre solo, una vez por navegador y
// versión (mode="auto"). En el admin se usa como vista previa (mode="preview",
// abierto y cerrado desde afuera, sin tocar el registro de "ya lo vi").
export default function WhatsNewModal({
  config,
  mode = "auto",
  open: controlledOpen = false,
  onClose,
}: {
  config: WhatsNewConfig;
  mode?: "auto" | "preview";
  open?: boolean;
  onClose?: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [autoOpen, setAutoOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [explored, setExplored] = useState<Set<number>>(() => new Set());
  const open = mode === "preview" ? controlledOpen : autoOpen;

  // Se abre un momento después de cargar para no tapar la página de golpe.
  // Se marca como visto al abrirse: si la persona navega sin cerrarlo,
  // tampoco vuelve a aparecer.
  useEffect(() => {
    if (mode !== "auto") return;
    const forced = new URLSearchParams(window.location.search).get("novedades") === "1";
    if (!forced && wasSeen(config.version)) return;
    const timer = window.setTimeout(() => {
      markSeen(config.version);
      setAutoOpen(true);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [mode, config.version]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // showModal() enfoca la X y en el celular queda con el anillo de foco
      // como si estuviera seleccionada. El foco va al panel: Tab sigue
      // recorriendo los botones y el lector de pantalla lee el título.
      panelRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = useCallback(() => {
    setAutoOpen(false);
    onClose?.();
  }, [onClose]);

  function pick(index: number) {
    setSelected((s) => (s === index ? null : index));
    setExplored((prev) => (prev.has(index) ? prev : new Set(prev).add(index)));
  }

  const total = config.items.length;
  const progress = total ? Math.round((explored.size / total) * 100) : 0;

  return (
    <dialog
      ref={dialogRef}
      className="wn-dialog"
      aria-labelledby="wn-title"
      aria-describedby={config.subtitle ? "wn-subtitle" : undefined}
      // Esc y el botón "atrás" de Android cierran el diálogo nativo: se
      // sincroniza el estado para que se pueda volver a abrir en la vista previa.
      onClose={close}
      // Un toque en el fondo oscuro (fuera de la tarjeta) también cierra.
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      {open && (
        <div ref={panelRef} className="wn-panel" tabIndex={-1}>
          <span className="wn-grabber" aria-hidden="true" />
          <header className="wn-head">
            <div className="min-w-0">
              <div className="wn-meta">
                {config.badge && <span className="wn-badge">{config.badge}</span>}
                <span className="wn-site">worka.click</span>
              </div>
              <h2 id="wn-title" className="wn-title">{config.title}</h2>
              {config.subtitle && <p id="wn-subtitle" className="wn-subtitle">{config.subtitle}</p>}
            </div>
            <button type="button" className="wn-close" onClick={close} aria-label="Cerrar novedades">
              <X size={18} />
            </button>
          </header>

          <div className="wn-body">
            {(config.highlight || config.edition) && (
              <div className="wn-highlight">
                {config.highlight && (
                  <p>
                    <span className="wn-dot" aria-hidden="true" />
                    {config.highlight}
                  </p>
                )}
                {config.edition && <span className="wn-edition">{config.edition}</span>}
              </div>
            )}

            <p className="wn-hint">
              <span>Tocá cada novedad para conocerla</span>
              <span aria-live="polite">{explored.size} de {total}</span>
            </p>
            <div
              className="wn-progress"
              role="progressbar"
              aria-label="Novedades exploradas"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={explored.size}
            >
              <span style={{ width: `${progress}%` }} />
            </div>

            <ul className="wn-grid">
              {config.items.map((item, i) => {
                const Icon = ICONS[item.icon] ?? Sparkles;
                const isOpen = selected === i;
                const seen = explored.has(i);
                return (
                  <li key={`${item.title}-${i}`} className={`wn-card${isOpen ? " is-open" : ""}`}>
                    <button
                      type="button"
                      className="wn-card-btn"
                      aria-expanded={isOpen}
                      aria-controls={`wn-item-${i}`}
                      onClick={() => pick(i)}
                    >
                      <span className="wn-icon">{seen ? <Check size={17} /> : <Icon size={17} />}</span>
                      <span className="min-w-0 flex-1">
                        <span className="wn-card-title">{item.title}</span>
                        <span className={`wn-card-text${isOpen ? "" : " is-clamped"}`}>{item.text}</span>
                      </span>
                    </button>
                    <div id={`wn-item-${i}`} className="wn-card-more" hidden={!isOpen}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="wn-card-cta"
                          onClick={mode === "auto" ? close : (e) => e.preventDefault()}
                        >
                          {item.cta} <ArrowRight size={14} />
                        </Link>
                      ) : (
                        <span className="wn-card-note"><Check size={14} /> Ya está activo para vos</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <footer className="wn-foot">
            {config.footer && <p className="wn-foot-note">{config.footer}</p>}
            <div className="wn-actions">
              <button type="button" className="btn-secondary" onClick={close}>
                Ver más tarde
              </button>
              <button type="button" className="btn-primary" onClick={close}>
                {config.primaryLabel} <ArrowRight size={16} />
              </button>
            </div>
          </footer>
        </div>
      )}
    </dialog>
  );
}
