"use client";

import { useEffect, useRef } from "react";

// La capa que reacciona al cursor: grilla de puntos, foco que sigue al mouse,
// inclinación 3D de las tarjetas y parallax por capas.
//
// Va en un componente aparte y no repartida por la página para que todo el
// trabajo por movimiento del mouse ocurra en un solo listener. Con uno por
// tarjeta, una portada con doce tarjetas hace doce recorridas del DOM por
// cada píxel que se mueve el cursor.
//
// Se apaga entera con prefers-reduced-motion, y en pantallas táctiles ni
// siquiera se engancha: no hay cursor que seguir y el trabajo sería puro
// gasto de batería.
export default function NocturneFx() {
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const finoYQuieto =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finoYQuieto) return;

    const mouse = { x: -9999, y: -9999 };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      document.querySelectorAll<HTMLElement>("[data-glow]").forEach((glow) => {
        const marco = glow.parentElement;
        if (!marco) return;
        const r = marco.getBoundingClientRect();
        glow.style.transform = `translate3d(${e.clientX - r.left}px,${e.clientY - r.top}px,0)`;
      });

      document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const dentro =
          e.clientX >= r.left &&
          e.clientX <= r.right &&
          e.clientY >= r.top &&
          e.clientY <= r.bottom;
        if (!dentro) {
          if (el.dataset.on) {
            el.style.transform = "";
            delete el.dataset.on;
          }
          return;
        }
        el.dataset.on = "1";
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateZ(6px)`;
      });

      document
        .querySelectorAll<HTMLElement>("[data-parallax]")
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          const cx = (e.clientX - (r.left + r.width / 2)) / r.width;
          const cy = (e.clientY - (r.top + r.height / 2)) / r.height;
          const d = Number(el.dataset.depth || 8);
          el.style.transform = `translate3d(${cx * d}px,${cy * d * 0.6}px,0)`;
        });
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    // Grilla de puntos que se abre al paso del cursor.
    const paso = 34;
    const dibujar = () => {
      document
        .querySelectorAll<HTMLCanvasElement>("[data-grid]")
        .forEach((cv) => {
          const r = cv.getBoundingClientRect();
          // Fuera de pantalla no se dibuja: en la portada hay tres lienzos y
          // solo uno se está mirando.
          if (!r.width || r.bottom < -200 || r.top > window.innerHeight + 200)
            return;

          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const w = Math.round(r.width);
          const h = Math.round(r.height);
          if (cv.width !== w * dpr) {
            cv.width = w * dpr;
            cv.height = h * dpr;
          }
          const ctx = cv.getContext("2d");
          if (!ctx) return;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, w, h);

          const mx = mouse.x - r.left;
          const my = mouse.y - r.top;
          for (let x = paso / 2; x < w; x += paso) {
            for (let y = paso / 2; y < h; y += paso) {
              const dx = x - mx;
              const dy = y - my;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const cerca = Math.max(0, 1 - dist / 220);
              const a = 0.05 + cerca * 0.55;
              const rad = 0.9 + cerca * 1.9;
              const tiron = cerca * 6;
              const ang = Math.atan2(dy, dx);
              ctx.beginPath();
              ctx.arc(
                x - Math.cos(ang) * tiron,
                y - Math.sin(ang) * tiron,
                rad,
                0,
                6.2832
              );
              ctx.fillStyle =
                cerca > 0.02
                  ? `rgba(181,171,252,${a})`
                  : `rgba(233,233,237,${a})`;
              ctx.fill();
            }
          }
        });
      raf.current = requestAnimationFrame(dibujar);
    };
    raf.current = requestAnimationFrame(dibujar);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return null;
}
