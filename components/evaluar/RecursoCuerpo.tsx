import type { Bloque } from "@/lib/evaluar/recursos";

// Renderiza los bloques de una nota.
//
// El contenido se guarda como estructura y no como HTML suelto para que no
// pueda romper la página ni meter estilos que peleen con el sistema: acá se
// decide una vez cómo se ve un h2, y todas las notas lo respetan.
//
// El único formato inline es **negrita**, que es lo que de verdad hace falta
// en texto de fondo. Todo lo demás se resuelve con el tipo de bloque.
function conNegritas(x: string) {
  return x.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} style={{ color: "var(--color-text)", fontWeight: 500 }}>
        {p.slice(2, -2)}
      </strong>
    ) : (
      p
    )
  );
}

const CUERPO = "rgba(233,233,237,.68)";

export default function RecursoCuerpo({ bloques }: { bloques: Bloque[] }) {
  return (
    <div className="mt-8">
      {bloques.map((b, i) => {
        if (b.t === "h2")
          return (
            <h2 key={i} className="text-[26px] font-medium mt-11 mb-4">
              {b.x}
            </h2>
          );

        if (b.t === "h3")
          return (
            <h3 key={i} className="text-[19px] font-medium mt-7 mb-2.5">
              {b.x}
            </h3>
          );

        if (b.t === "p")
          return (
            <p
              key={i}
              className="text-[16.5px] leading-[1.75] mb-5"
              style={{ color: CUERPO }}
            >
              {conNegritas(b.x)}
            </p>
          );

        if (b.t === "ul")
          return (
            <ul key={i} className="mb-6 space-y-2.5">
              {b.x.map((li, j) => (
                <li key={j} className="flex gap-3">
                  <span
                    className="shrink-0 mt-2.5 w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--color-accent)" }}
                    aria-hidden
                  />
                  <span
                    className="text-[16px] leading-[1.7]"
                    style={{ color: CUERPO }}
                  >
                    {conNegritas(li)}
                  </span>
                </li>
              ))}
            </ul>
          );

        if (b.t === "ol")
          return (
            <ol key={i} className="mb-6 space-y-3">
              {b.x.map((li, j) => (
                <li key={j} className="flex gap-3.5">
                  <span
                    className="shrink-0 grid place-items-center w-6 h-6 rounded-full font-mono text-[11px] font-medium mt-0.5"
                    style={{
                      border: "1px solid rgba(145,132,217,.4)",
                      color: "var(--color-accent)",
                    }}
                  >
                    {j + 1}
                  </span>
                  <span
                    className="text-[16px] leading-[1.7]"
                    style={{ color: CUERPO }}
                  >
                    {conNegritas(li)}
                  </span>
                </li>
              ))}
            </ol>
          );

        if (b.t === "caja")
          return (
            <div
              key={i}
              className="rounded-xl p-5 my-7"
              style={{
                background: "var(--nk-card)",
                border: "1px solid var(--nk-line)",
              }}
            >
              <p
                className="nk-mono mb-2.5"
                style={{ color: "var(--color-accent)" }}
              >
                {b.titulo}
              </p>
              <p
                className="text-[15px] leading-[1.7] m-0"
                style={{ color: CUERPO }}
              >
                {conNegritas(b.x)}
              </p>
            </div>
          );

        // cita
        return (
          <p
            key={i}
            className="text-[19px] leading-[1.6] my-9 pl-6"
            style={{
              borderLeft: "2px solid var(--color-accent)",
              color: "var(--color-text)",
            }}
          >
            {b.x}
          </p>
        );
      })}
    </div>
  );
}
