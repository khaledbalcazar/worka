import Link from "next/link";
import { ArrowRight } from "lucide-react";

// CTA al pie de cada artículo, según su audiencia:
// - personas → buscar empleos
// - empresas → publicar vacante
export default function BlogCta({
  audience,
}: {
  audience: "personas" | "empresas";
}) {
  const cfg =
    audience === "empresas"
      ? {
          eyebrow: "WORKA PARA EMPRESAS",
          title: "Publicá tu vacante gratis en Paraguay",
          button: "Publicar vacante",
          href: "/empresa/registro",
        }
      : {
          eyebrow: "WORKA",
          title: "Encontrá tu próximo empleo en Paraguay",
          button: "Buscar empleos",
          href: "/empleos",
        };

  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-white border border-blue-100 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold tracking-widest text-primary uppercase">
          {cfg.eyebrow}
        </p>
        <h3 className="text-xl sm:text-2xl font-extrabold text-primary-dark mt-1">
          {cfg.title}
        </h3>
      </div>
      <Link
        href={cfg.href}
        className="shrink-0 inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3.5 rounded-full hover:bg-primary-dark transition-colors"
      >
        {cfg.button}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
