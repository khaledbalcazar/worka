// Marca de Worka Evaluar: el logo de Worka («Worka» en cobalto profundo y
// «.click» en el azul de acción) con la etiqueta violeta de Evaluar al lado.
//
// Antes Evaluar tenía su propia W con un tilde. Se veía como otra empresa, y
// lo que vende Evaluar es justamente que es parte de Worka: la misma cuenta,
// las mismas vacantes. Es la misma marca que usa el panel.
export default function EvaluarLogo({ size = 30 }: { size?: number }) {
  const grande = size >= 28;
  return (
    <span className="inline-flex items-center gap-2 select-none whitespace-nowrap">
      <span
        className={`${grande ? "text-[22px]" : "text-[19px]"} font-bold tracking-[-0.03em] text-brand`}
      >
        Worka<span className="font-medium text-primary">.click</span>
      </span>
      <span
        className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
        style={{ background: "#efedfb", color: "#5d5294" }}
      >
        Evaluar
      </span>
    </span>
  );
}
