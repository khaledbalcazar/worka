"use client";

import { useEffect } from "react";

// Hace aparecer los bloques marcados con data-reveal a medida que se baja.
//
// Un solo observador para toda la página en vez de un componente por bloque:
// el contenido sigue siendo HTML del servidor y, si el script no corre, la
// clase evl-ready nunca se pone y todo queda visible.
export default function RevealOnScroll() {
  useEffect(() => {
    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!("IntersectionObserver" in window) || els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    // Lo que ya está a la vista al cargar se muestra sin animación de salida.
    els.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in");
      io.observe(el);
    });
    root.classList.add("evl-ready");
    return () => {
      io.disconnect();
      root.classList.remove("evl-ready");
    };
  }, []);
  return null;
}
