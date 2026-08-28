import Link from "next/link";
import MarketingShell from "@/components/evaluar/MarketingShell";
import { RECURSOS } from "@/lib/evaluar/recursos";
import { evaluarMetadata, jsonLdMigas } from "@/lib/evaluar/seo";

export const metadata = evaluarMetadata({
  title: "Recursos de selección y evaluación de personal | Worka Evaluar",
  description:
    "Guías prácticas sobre selección de personal, tests psicométricos, integridad laboral y evaluación de desempeño, escritas para quien contrata en Paraguay.",
  path: "/recursos",
});

// Índice de las notas.
//
// Existe para que Google entienda que hay un cuerpo de contenido y no cuatro
// páginas sueltas, y para que quien llega a una nota por buscador encuentre
// las otras tres. Es la mitad barata del posicionamiento: enlazarse a uno
// mismo cuesta nada y reparte autoridad entre las páginas.
export default function RecursosPage() {
  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            jsonLdMigas([
              { nombre: "Worka Evaluar", path: "/" },
              { nombre: "Recursos", path: "/recursos" },
            ])
          ),
        }}
      />

      <div className="max-w-[760px] mx-auto px-6 sm:px-8 py-16 md:py-20">
        <p className="nk-mono mb-3.5" style={{ color: "var(--color-accent)" }}>
          Recursos
        </p>
        <h1 className="text-[34px] md:text-[42px] font-medium tracking-[-.02em] leading-[1.1]">
          Cómo elegir mejor a quién contratás
        </h1>
        <p
          className="text-base leading-relaxed mt-4 max-w-[560px]"
          style={{ color: "rgba(233,233,237,.6)" }}
        >
          Guías de fondo sobre selección, evaluación e integridad, escritas para
          quien contrata en Paraguay. Sin vender nada en el medio.
        </p>

        <div className="mt-11 space-y-3">
          {RECURSOS.map((r) => (
            <Link
              key={r.slug}
              href={`/evaluar/recursos/${r.slug}`}
              data-tilt
              className="block rounded-xl p-6"
              style={{
                background: "var(--nk-card)",
                border: "1px solid var(--nk-line)",
                transition: "transform .18s ease-out, border-color .3s ease",
              }}
            >
              <div className="flex items-center gap-3 mb-2.5">
                <span
                  className="nk-mono"
                  style={{ color: "var(--color-accent)" }}
                >
                  {r.tema}
                </span>
                <span
                  className="nk-mono"
                  style={{ color: "rgba(233,233,237,.35)" }}
                >
                  {r.minutos} min de lectura
                </span>
              </div>
              <h2 className="text-[21px] font-medium m-0 mb-2">{r.titulo}</h2>
              <p
                className="text-sm leading-[1.7] m-0"
                style={{ color: "rgba(233,233,237,.55)" }}
              >
                {r.bajada}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
