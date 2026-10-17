"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";

// Guía interactiva del panel de empresa: un globo por sección que señala
// dónde está cada cosa y para qué sirve. Los elementos se marcan con
// data-tour="clave" (en CompanyShell y CompanyDashboard); si un elemento no
// está a la vista en ese tamaño de pantalla (Métricas en celular, por
// ejemplo), ese paso se saltea solo.
//
// Arranca sola cuando la empresa llega con la promoción (?bienvenida=promo)
// la primera vez, o con ?tour=1. Se repite desde el botón «Guía».

const DONE_KEY = "worka_tour_empresa_v1";
const EVENT = "worka:company-tour";

type Step = { target: string; title: string; text: React.ReactNode };

const STEPS: Step[] = [
  {
    target: "plan",
    title: "Tu plan",
    text: <>Acá ves tu plan, hasta cuándo está activo y cuántos <strong>destaques</strong> y <strong>alertas urgentes</strong> te quedan este mes.</>,
  },
  {
    target: "publicar",
    title: "Publicar vacante",
    text: <>Empezá por acá. Elegí una plantilla, ajustá salario y horario y sumá hasta 3 <strong>preguntas de filtro</strong>. Sale en un par de minutos.</>,
  },
  {
    target: "evaluar",
    title: "Worka Evaluar",
    text: <>Evaluá a tus candidatos con <strong>pruebas del puesto</strong> armadas con IA y mirá el informe de cada uno antes de entrevistar.</>,
  },
  {
    target: "indicadores",
    title: "Tus números",
    text: <>Vacantes activas, postulaciones de la semana, vistas y tu <strong>tiempo de respuesta</strong>. Respondé en menos de 72 h para tener el sello ⚡.</>,
  },
  {
    target: "visibilidad",
    title: "Más visibilidad",
    text: <>Destacá una vacante para que aparezca <strong>primera en la búsqueda</strong>. Con Enterprise Pro tenés destaques incluidos cada mes.</>,
  },
  {
    target: "vacantes",
    title: "Mis vacantes",
    text: <>Todas tus búsquedas. Entrá a cada una para ver el <strong>tablero de candidatos</strong>, y usá su menú para destacarla, mandar una alerta urgente, renovarla o duplicarla.</>,
  },
  {
    target: "talento",
    title: "Talento",
    text: <>Buscá candidatos por rubro y ciudad <strong>antes de que se postulen</strong> y escribiles directo.</>,
  },
  {
    target: "mensajes",
    title: "Mensajes",
    text: <>Las conversaciones con cada postulante, en un solo lugar. También podés escribirles por WhatsApp desde su perfil.</>,
  },
  {
    target: "metricas",
    title: "Métricas",
    text: <>Vistas, postulaciones y contactados de cada vacante, semana a semana.</>,
  },
  {
    target: "avisos",
    title: "Avisos",
    text: <>Te avisamos acá cuando llega una postulación, un mensaje o una vacante está por vencer.</>,
  },
  {
    target: "cuenta",
    title: "Tu cuenta",
    text: <>Tu plan <strong>Worka Enterprise Pro</strong> y su código, el perfil público de la empresa y tu equipo de selección.</>,
  },
  {
    target: "guia",
    title: "¡Listo!",
    text: <>Podés repetir este recorrido cuando quieras desde <strong>Guía</strong>. Ahora, a publicar tu primera vacante.</>,
  },
];

export function startCompanyTour() {
  window.dispatchEvent(new Event(EVENT));
}

function visibleTarget(key: string): HTMLElement | null {
  const all = document.querySelectorAll<HTMLElement>(`[data-tour="${key}"]`);
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden") return el;
  }
  return null;
}

type Layout = {
  spot: { top: number; left: number; width: number; height: number };
  pop: { top: number; left: number };
  side: "top" | "bottom";
  arrowX: number;
};

const GAP = 14;
const PAD = 6;
const EDGE = 12;

export default function CompanyTour() {
  const pathname = usePathname();
  const router = useRouter();
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [index, setIndex] = useState(0);
  const [layout, setLayout] = useState<Layout | null>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const start = useCallback(() => {
    if (pathname !== "/empresa") {
      router.push("/empresa?tour=1");
      return;
    }
    const available = STEPS.filter((s) => visibleTarget(s.target));
    if (available.length === 0) return;
    setSteps(available);
    setIndex(0);
  }, [pathname, router]);

  const finish = useCallback(() => {
    setSteps(null);
    setLayout(null);
    try {
      localStorage.setItem(DONE_KEY, "1");
    } catch {}
  }, []);

  // Botón «Guía», bienvenida de la promoción y ?tour=1.
  useEffect(() => {
    window.addEventListener(EVENT, start);
    return () => window.removeEventListener(EVENT, start);
  }, [start]);

  useEffect(() => {
    if (pathname !== "/empresa") return;
    const params = new URLSearchParams(window.location.search);
    let done = false;
    try {
      done = localStorage.getItem(DONE_KEY) === "1";
    } catch {}
    const forced = params.get("tour") === "1";
    if (!forced && !(params.get("bienvenida") === "promo" && !done)) return;
    if (forced) {
      params.delete("tour");
      const qs = params.toString();
      window.history.replaceState(null, "", `/empresa${qs ? `?${qs}` : ""}`);
    }
    // Se espera a que el panel termine de pintarse (y al confeti de la bienvenida).
    const t = setTimeout(start, 1100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const step = steps?.[index] ?? null;

  const place = useCallback(() => {
    if (!step) return;
    const el = visibleTarget(step.target);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const popW = Math.min(320, vw - EDGE * 2);
    const popH = popRef.current?.offsetHeight ?? 170;
    const fitsBelow = r.bottom + GAP + popH <= vh - EDGE;
    const fitsAbove = r.top - GAP - popH >= EDGE;
    const side: Layout["side"] = fitsBelow || !fitsAbove ? "bottom" : "top";
    let top = side === "bottom" ? r.bottom + GAP : r.top - GAP - popH;
    // Elemento más alto que la pantalla: el globo queda adentro igual.
    top = Math.min(Math.max(top, EDGE), vh - popH - EDGE);
    const left = Math.min(Math.max(r.left + r.width / 2 - popW / 2, EDGE), vw - popW - EDGE);
    const arrowX = Math.min(Math.max(r.left + r.width / 2 - left, 18), popW - 18);
    setLayout({
      spot: { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 },
      pop: { top, left },
      side,
      arrowX,
    });
  }, [step]);

  // Al cambiar de paso: llevar el elemento a la vista y ubicar el globo.
  useEffect(() => {
    if (!step) return;
    const el = visibleTarget(step.target);
    if (!el) return;
    // El encabezado y la barra de abajo ya están siempre a la vista.
    if (!el.closest(".co-header, .co-bottom")) el.scrollIntoView({ block: "center", behavior: "smooth" });
    place();
    const t = setTimeout(place, 380);
    return () => clearTimeout(t);
  }, [step, place]);

  // Reubicar con scroll y cambios de tamaño.
  useEffect(() => {
    if (!step) return;
    let frame = 0;
    const onMove = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [step, place]);

  // Segunda pasada cuando cambia la altura real del globo (cada paso tiene
  // otro texto): sin esto, el globo de arriba quedaría corrido.
  const measured = useRef(0);
  useLayoutEffect(() => {
    const h = popRef.current?.offsetHeight ?? 0;
    if (layout && h !== measured.current) {
      measured.current = h;
      place();
    }
  }, [layout, place]);

  useEffect(() => {
    if (!steps) return;
    popRef.current?.focus();
    const keys = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, steps.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    document.addEventListener("keydown", keys);
    return () => document.removeEventListener("keydown", keys);
  }, [steps, finish]);

  // Fuera del panel la guía no se muestra (los elementos no existen).
  if (!steps || !step || pathname !== "/empresa") return null;
  const last = index === steps.length - 1;

  return createPortal(
    <>
      {layout && <div className="tour-spot" style={layout.spot} aria-hidden />}
      <div
        ref={popRef}
        className="tour-pop"
        role="dialog"
        aria-modal="false"
        aria-labelledby="tour-title"
        tabIndex={-1}
        data-side={layout?.side ?? "bottom"}
        style={{
          top: layout?.pop.top ?? -9999,
          left: layout?.pop.left ?? -9999,
          ["--arrow-x" as string]: `${layout?.arrowX ?? 160}px`,
        }}
      >
        <button type="button" className="tour-x" onClick={finish} aria-label="Cerrar la guía">
          <X size={18} strokeWidth={2.6} />
        </button>
        <h3 id="tour-title">{step.title}</h3>
        <p>{step.text}</p>
        <div className="tour-foot">
          <div className="tour-dots" aria-label={`Paso ${index + 1} de ${steps.length}`}>
            {steps.map((s, i) => (
              <span key={s.target} className={i === index ? "is-on" : ""} />
            ))}
          </div>
          <div className="flex gap-1">
            {index > 0 && (
              <button type="button" className="tour-btn is-ghost" onClick={() => setIndex(index - 1)}>
                Anterior
              </button>
            )}
            <button
              type="button"
              className="tour-btn is-solid"
              onClick={() => (last ? finish() : setIndex(index + 1))}
            >
              {last ? "Terminar" : index === 0 ? "Empezar" : "Siguiente"}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
