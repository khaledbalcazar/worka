import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import MarketingShell from "@/components/evaluar/MarketingShell";
import RecursoCuerpo from "@/components/evaluar/RecursoCuerpo";
import VentasCta from "@/components/evaluar/VentasCta";
import { RECURSOS, getRecurso, relacionados } from "@/lib/evaluar/recursos";
import { evaluarMetadata, jsonLdMigas } from "@/lib/evaluar/seo";
import { evaluarUrl } from "@/lib/supabase/config";

// Las cuatro notas se generan en el build: son estáticas y no dependen de la
// base, así que servirlas ya armadas es gratis y mejora lo que Google mide.
export function generateStaticParams() {
  return RECURSOS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = getRecurso(slug);
  if (!r) return {};
  return evaluarMetadata({
    title: r.tituloSeo,
    description: r.descripcion,
    path: `/recursos/${r.slug}`,
  });
}

export default async function RecursoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = getRecurso(slug);
  if (!r) notFound();

  const otros = relacionados(slug);

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: r.titulo,
              description: r.descripcion,
              datePublished: r.fecha,
              dateModified: r.fecha,
              inLanguage: "es-PY",
              mainEntityOfPage: evaluarUrl(`/recursos/${r.slug}`),
              author: { "@type": "Organization", name: "Worka Evaluar" },
              publisher: {
                "@type": "Organization",
                name: "Worka",
                url: "https://worka.click",
              },
            },
            jsonLdMigas([
              { nombre: "Worka Evaluar", path: "/" },
              { nombre: "Recursos", path: "/recursos" },
              { nombre: r.titulo, path: `/recursos/${r.slug}` },
            ]),
          ]),
        }}
      />

      <article className="max-w-[720px] mx-auto px-6 sm:px-8 py-14 md:py-16">
        <Link
          href="/evaluar/recursos"
          className="text-sm flex items-center gap-1 mb-8"
          style={{ color: "var(--nk-400)" }}
        >
          <ChevronLeft size={16} /> Recursos
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span className="nk-mono" style={{ color: "var(--color-accent)" }}>
            {r.tema}
          </span>
          <span className="nk-mono" style={{ color: "rgba(233,233,237,.35)" }}>
            {r.minutos} min de lectura
          </span>
        </div>

        <h1 className="text-[32px] md:text-[40px] font-medium tracking-[-.02em] leading-[1.12]">
          {r.titulo}
        </h1>
        <p
          className="text-[17px] leading-relaxed mt-4"
          style={{ color: "rgba(233,233,237,.55)" }}
        >
          {r.bajada}
        </p>

        <hr className="nk-rule mt-8" />

        <RecursoCuerpo bloques={r.bloques} />

        {/* El producto aparece al final, recién después de haber sido útil.
            Meterlo en el medio del texto arruina las dos cosas: la nota deja
            de ser creíble y el producto queda como interrupción. */}
        <div
          className="rounded-2xl p-7 mt-14"
          style={{
            background: "linear-gradient(150deg,var(--nk-band),#1d2048)",
            border: "1px solid var(--nk-800)",
          }}
        >
          <p className="nk-mono mb-3" style={{ color: "var(--nk-300)" }}>
            Worka Evaluar
          </p>
          <p className="text-[19px] font-medium m-0 mb-2.5">
            Todo esto, ya armado y corriendo
          </p>
          <p
            className="text-sm leading-relaxed m-0 mb-5"
            style={{ color: "rgba(233,233,237,.68)" }}
          >
            Las pruebas escritas, la corrección automática y el informe con
            percentiles. Enlazás tu vacante y la gente rinde desde el propio
            aviso, sin crear cuenta. 15 días gratis, sin tarjeta.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/evaluar/app" className="nk-cta">
              Probarlo gratis
            </Link>
            <VentasCta mensaje="Hola, leí una nota de Worka Evaluar y quiero saber más." />
          </div>
        </div>

        {otros.length > 0 && (
          <div className="mt-12">
            <p
              className="nk-mono mb-4"
              style={{ color: "rgba(233,233,237,.4)" }}
            >
              Seguí leyendo
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {otros.map((o) => (
                <Link
                  key={o.slug}
                  href={`/evaluar/recursos/${o.slug}`}
                  className="rounded-xl p-5"
                  style={{
                    background: "var(--nk-card)",
                    border: "1px solid var(--nk-line)",
                  }}
                >
                  <p
                    className="nk-mono mb-2"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {o.tema}
                  </p>
                  <p className="text-[16px] font-medium m-0">{o.titulo}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </MarketingShell>
  );
}
