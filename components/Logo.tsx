import Link from "next/link";

// Marca: "Worka" en cobalto profundo y ".click" en el azul de acción, igual que
// el encabezado del área de candidatos.
export default function Logo({
  href = "/",
  light = false,
}: {
  href?: string;
  light?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label="Worka, ir al inicio"
      className="inline-flex items-baseline select-none whitespace-nowrap"
    >
      <span
        className={`text-[22px] font-bold tracking-[-0.03em] ${
          light ? "text-white" : "text-brand"
        }`}
      >
        Worka
        <span className={`font-medium ${light ? "text-white/70" : "text-primary"}`}>
          .click
        </span>
      </span>
    </Link>
  );
}
