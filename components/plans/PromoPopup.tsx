"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, Copy, Crown, Gift, X } from "lucide-react";
import { ENTERPRISE_BRAND } from "@/lib/plans";
import { LAUNCH_PROMO, isPromoOpen, promoDaysLeft } from "@/lib/promo";

// Popup de la promoción de lanzamiento en /para-empresas. Aparece una vez por
// navegador; si se cierra, queda un chip abajo para volver a abrirlo.
const KEY = "worka_promo_popup_v1";

export default function PromoPopup() {
  const [open, setOpen] = useState(false);
  const [chip, setChip] = useState(false);
  const [copied, setCopied] = useState(false);
  const [days, setDays] = useState<number | null>(null);
  const cta = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!isPromoOpen()) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- la fecha y localStorage solo se leen después de montar
    setDays(promoDaysLeft());
    let seen = false;
    try {
      seen = localStorage.getItem(KEY) === "1";
    } catch {}
    if (seen) {
      setChip(true);
      return;
    }
    const t = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    cta.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);

  function close() {
    setOpen(false);
    setChip(true);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(LAUNCH_PROMO.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  const href = `/para-empresas/oferta?codigo=${LAUNCH_PROMO.code}`;

  return (
    <>
      {chip && !open && (
        <button type="button" className="promo-chip" onClick={() => setOpen(true)}>
          <Gift size={16} /> 3 meses de Enterprise Pro + Evaluar gratis
        </button>
      )}

      {open && (
        <div className="promo-backdrop" onClick={close}>
          <div
            className="promo-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="promo-close" onClick={close} aria-label="Cerrar">
              <X size={20} />
            </button>

            <div className="promo-hero">
              <p className="promo-eyebrow"><Gift size={14} /> Oferta de lanzamiento · Empresas nuevas</p>
              <h2 id="promo-title">
                3 meses de <span>{ENTERPRISE_BRAND}</span> + <span>Worka Evaluar</span> sin costo
              </h2>
              <p className="promo-sub">
                Vacantes sin límite, destacados, alertas urgentes, búsqueda de talento y evaluaciones con IA desde el primer día.
              </p>
            </div>

            <div className="promo-body">
              <p className="text-[13px] text-muted">Tu código de bienvenida</p>
              <div className="promo-code">
                <span>{LAUNCH_PROMO.code}</span>
                <button type="button" onClick={copy} aria-label="Copiar código">
                  {copied ? <><Check size={15} /> Copiado</> : <><Copy size={15} /> Copiar</>}
                </button>
              </div>

              <ul className="promo-perks">
                {["Enterprise Pro · Pro por 3 meses", "Worka Evaluar · Profesional por 3 meses", "Sin tarjeta ni pagos: se activa al registrarte"].map((t) => (
                  <li key={t}><Check size={15} /> {t}</li>
                ))}
              </ul>

              <Link ref={cta} href={href} className="btn-primary w-full !min-h-12 !text-base" onClick={close}>
                <Crown size={17} /> Reclamar oferta
              </Link>
              <button type="button" onClick={close} className="promo-later">
                Ahora no
              </button>

              <p className="promo-fine">
                Válida para empresas nuevas que se registren hasta el {LAUNCH_PROMO.deadlineLabel}
                {days !== null && days <= 45 && <> · <strong>quedan {days} {days === 1 ? "día" : "días"}</strong></>}.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
