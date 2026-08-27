// Marca de Worka Evaluar: la W del trazo continuo y el tilde de verificación.
//
// El tilde va en color de texto y no en el acento a propósito: es lo que
// distingue a Evaluar de Worka Empleos, y en acento se perdía dentro de la W.
export default function EvaluarLogo({
  size = 30,
  withText = true,
}: {
  size?: number;
  /** Solo la marca, sin el nombre al lado. */
  withText?: boolean;
}) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 11 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        style={{ color: "var(--color-accent)" }}
        aria-hidden
      >
        <rect
          x="0.6"
          y="0.6"
          width="30.8"
          height="30.8"
          rx="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M7.5 10.5 L10.6 20.2 L13.2 13.8 L15.8 20.2 L18.9 10.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M20.4 16.6 L22.6 18.8 L26.2 13.4"
          stroke="#e9e9ed"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {withText && (
        <span
          style={{
            fontSize: size >= 28 ? 16 : 14.5,
            fontWeight: 500,
            letterSpacing: "-.01em",
            color: "#e9e9ed",
          }}
        >
          Worka <span style={{ color: "var(--color-accent)" }}>Evaluar</span>
        </span>
      )}
    </span>
  );
}
