import type { Candidate } from "@/lib/types";

// Las mismas cuatro secciones básicas que mide Mi perfil: datos, presentación,
// CV y rubros. Se usa en el menú de la cuenta para mostrar el avance y el
// próximo paso sin tener que abrir el perfil.
export function profileCompletion(c: Candidate) {
  const steps = [
    { done: !!c.full_name && !!c.location_city, label: "Completar datos", href: "/perfil#datos" },
    { done: !!c.bio?.trim(), label: "Sumar presentación", href: "/perfil#presentacion" },
    { done: !!c.cv_url, label: "Subir CV", href: "/perfil#curriculum" },
    { done: c.preferences_industry.length > 0, label: "Elegir rubros", href: "/perfil#preferencias" },
  ];
  const done = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);
  return {
    percent: Math.round((done / steps.length) * 100),
    nextStep: next ? { label: next.label, href: next.href } : null,
  };
}
