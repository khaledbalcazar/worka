import type { Metadata } from "next";
import { evaluarUrl } from "@/lib/supabase/config";
import { FAQS } from "./faqs";

// SEO de Worka Evaluar.
//
// ── El problema que esto resuelve ─────────────────────────────
//
// La misma página vive en dos direcciones: evaluar.worka.click/ y
// worka.click/evaluar. Las dos responden 200 con el mismo contenido, porque
// el proxy reescribe el subdominio a la ruta. Sin un canonical, Google indexa
// las dos, las trata como contenido duplicado y reparte la autoridad entre
// ambas: el sitio compite consigo mismo.
//
// La canónica es el subdominio. Es la que va en los correos, la que se dice
// en voz alta y la que lleva la marca del producto.

export const EVALUAR_NOMBRE = "Worka Evaluar";

/** Metadatos base de cualquier pantalla pública de Evaluar. */
export function evaluarMetadata(input: {
  title: string;
  description: string;
  /** Ruta dentro de Evaluar, sin el dominio. "/" para la portada. */
  path: string;
}): Metadata {
  const url = evaluarUrl(input.path === "/" ? "" : input.path);

  return {
    // absolute salta las plantillas de los layouts. Sin esto el titulo salia
    // como "... | Worka Evaluar | Worka Evaluar": el que se escribe acá ya
    // lleva la marca, y encima el layout le sumaba la suya.
    title: { absolute: input.title },
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: EVALUAR_NOMBRE,
      locale: "es_PY",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
  };
}

// ── Datos estructurados ───────────────────────────────────────
//
// Le dicen a Google qué es esto, no solo qué dice. Sin esto el buscador ve
// una página de texto; con esto sabe que es software de RRHH con precios en
// guaraníes y una prueba gratuita, y puede mostrarlo como corresponde.

/** El producto. Precios reales o "a convenir", nunca inventados. */
export function jsonLdProducto(precios: {
  esencial?: string;
  profesional?: string;
}) {
  const ofertas = [
    { nombre: "Esencial", precio: precios.esencial },
    { nombre: "Profesional", precio: precios.profesional },
  ]
    .filter((o) => o.precio && Number(o.precio) > 0)
    .map((o) => ({
      "@type": "Offer",
      name: o.nombre,
      price: o.precio,
      priceCurrency: "PYG",
      url: evaluarUrl("/precios"),
    }));

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: EVALUAR_NOMBRE,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Recruitment and Applicant Tracking",
    operatingSystem: "Web",
    url: evaluarUrl(),
    inLanguage: "es-PY",
    description:
      "Software de reclutamiento y evaluación de candidatos para empresas de Paraguay. Tests psicométricos, tablero de decisión, evaluación de desempeño e informes por candidato.",
    // El área que se atiende. Sin esto Google no tiene forma de saber que
    // esto es para Paraguay y lo muestra a cualquiera.
    areaServed: { "@type": "Country", name: "Paraguay" },
    author: {
      "@type": "Organization",
      name: "Worka",
      url: "https://worka.click",
    },
    // La prueba gratuita se declara aparte del precio: es lo que decide el
    // clic, y en el resultado de búsqueda aparece.
    offers:
      ofertas.length > 0
        ? ofertas
        : {
            "@type": "Offer",
            price: "0",
            priceCurrency: "PYG",
            description: "15 días de prueba gratuita, sin tarjeta.",
          },
    featureList: [
      "Tests psicométricos laborales listos para usar",
      "Evaluación de integridad laboral",
      "Tablero de decisión comparativo",
      "Informe por candidato con percentiles",
      "Evaluación de desempeño por competencias",
      "Asistente de IA para armar pruebas a medida",
    ],
  };
}

/** Las preguntas frecuentes, para el resultado enriquecido. */
export function jsonLdFaq() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** El rastro de migas, para que Google entienda la jerarquía. */
export function jsonLdMigas(
  items: { nombre: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.nombre,
      item: evaluarUrl(it.path === "/" ? "" : it.path),
    })),
  };
}
