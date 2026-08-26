// Logo de Worka Evaluar.
//
// La W de Worka dentro de un marco con una marca de verificación: la casa es
// la misma, pero el producto es el de evaluar. Va en SVG y no en imagen para
// que herede el color del contexto y se vea nítido en cualquier tamaño.
export function EvaluarMark({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
    >
      <rect width="32" height="32" rx="9" fill="currentColor" />
      {/* W */}
      <path
        d="M7.5 10.5 L10.6 20.2 L13.2 13.8 L15.8 20.2 L18.9 10.5"
        stroke="var(--color-navy, #080d1a)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Marca de verificación: lo que distingue a Evaluar de Worka. */}
      <path
        d="M20.4 16.6 L22.6 18.8 L26.2 13.4"
        stroke="var(--color-navy, #080d1a)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function EvaluarLogo({
  size = 32,
  tone = "dark",
}: {
  size?: number;
  /** "dark" para fondo oscuro (texto crema), "light" para fondo claro. */
  tone?: "dark" | "light";
}) {
  return (
    <span className="flex items-center gap-2.5 min-w-0">
      <EvaluarMark size={size} className="text-copper shrink-0" />
      <span
        className={`font-heading font-semibold tracking-tight truncate ${
          tone === "dark" ? "text-cream" : "text-primary-dark"
        }`}
      >
        Worka <span className="text-copper">Evaluar</span>
      </span>
    </span>
  );
}
