import {
  TEXTO_BANDA,
  leerIntegridad,
  perfilConfiable,
  type BandaRiesgo,
  type FactorIntegridad,
} from "@/lib/evaluar/integridad";

// Resultado de la evaluación de integridad.
//
// Esta pantalla es la parte más delicada de todo Worka Evaluar, porque es
// donde un número se puede convertir en una acusación. Un cartel que diga
// "riesgo alto de robo" al lado del nombre de alguien no es una medición: es
// una imputación, escrita, guardada y compartida con quien abra el informe.
//
// Por eso acá no hay veredictos. Las bandas son "sin señales", "conviene
// repreguntar" y "merece una conversación": las tres apuntan a hablar con la
// persona, que es lo único que un cuestionario habilita a hacer.
//
// El orden tampoco es decorativo. Las escalas de validez van primero porque
// si alguien contestó para quedar bien, todo lo de abajo describe a un
// personaje y no a un candidato — y enterarse después de haberlo leído es
// enterarse tarde.

const TONO: Record<BandaRiesgo, { chip: string; barra: string }> = {
  bajo: { chip: "bg-emerald-50 text-emerald-700", barra: "bg-emerald-400" },
  medio: { chip: "bg-amber-50 text-amber-700", barra: "bg-amber-400" },
  atencion: { chip: "bg-red-50 text-danger", barra: "bg-red-400" },
};

function Factor({ f }: { f: FactorIntegridad }) {
  const tono = TONO[f.banda];
  return (
    <div className="break-inside-avoid">
      <div className="flex justify-between items-baseline gap-3 text-sm">
        <span className="text-slate-700 font-medium">{f.label}</span>
        <span className={`chip shrink-0 ${tono.chip}`}>
          {TEXTO_BANDA[f.banda]}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1.5">
        <div
          className={`h-full rounded-full ${tono.barra}`}
          style={{ width: `${f.pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.lectura}</p>
    </div>
  );
}

export default function IntegrityReport({
  profile,
}: {
  profile: Record<string, { raw: number; max: number }> | undefined;
}) {
  const datos = leerIntegridad(profile);
  if (!datos) return null;

  const confiable = perfilConfiable(datos.validez);
  const paraHablar = datos.riesgo.filter((f) => f.banda !== "bajo");

  return (
    <section className="mt-6">
      <h2 className="font-bold text-primary-dark">Integridad laboral</h2>
      <p className="text-sm text-slate-500">
        Actitudes ante situaciones de trabajo. No mide conducta pasada ni
        indaga sobre la vida privada del candidato.
      </p>

      {/* Validez primero: si el perfil no es confiable, lo de abajo no
          describe a nadie y hay que decirlo antes de que se lea. */}
      {datos.validez.length > 0 && (
        <div
          className={`rounded-2xl border p-4 mt-3 ${
            confiable
              ? "border-slate-200 bg-slate-50"
              : "border-amber-300 bg-amber-50"
          }`}
        >
          <p className="text-sm font-semibold text-primary-dark">
            {confiable
              ? "Las respuestas parecen sinceras"
              : "Cuidado: las respuestas parecen armadas"}
          </p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {confiable
              ? "Admitió faltas menores que casi todo el mundo tiene, que es lo que se espera de alguien contestando de verdad."
              : "Se muestra impecable incluso en cosas que casi nadie cumple. Cuando eso pasa, los factores de abajo describen la imagen que quiso dar y no a la persona: conviene tomarlos con pinzas o volver a tomar la prueba."}
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            {datos.validez.map((f) => (
              <Factor key={f.key} f={f} />
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 mt-4">
        {datos.riesgo.map((f) => (
          <Factor key={f.key} f={f} />
        ))}
      </div>

      {/* Qué hacer con esto. Sin esta parte, el número queda solo y se usa
          como filtro, que es exactamente lo que no puede ser. */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 mt-4 break-inside-avoid">
        <h3 className="font-semibold text-primary-dark text-sm">
          Cómo usar este resultado
        </h3>
        {paraHablar.length > 0 ? (
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Hay {paraHablar.length}{" "}
            {paraHablar.length === 1 ? "factor" : "factores"} donde conviene
            repreguntar en la entrevista:{" "}
            <strong className="font-semibold">
              {paraHablar.map((f) => f.label.toLowerCase()).join(", ")}
            </strong>
            . La forma de hacerlo es plantearle una situación concreta del
            puesto y escuchar cómo la resolvería, no leerle el resultado.
          </p>
        ) : (
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            No hay factores que pidan atención especial. Eso no certifica nada
            sobre la persona: dice que sus respuestas no se parecen a las de
            quienes toleran esas conductas.
          </p>
        )}
        <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
          <strong className="font-semibold text-slate-700">
            Esto es un indicador, no un veredicto.
          </strong>{" "}
          No afirma que el candidato haya hecho ni vaya a hacer nada. Un
          resultado bajo en un factor no alcanza para descartar a nadie por sí
          solo, y usarlo así —además de injusto— es indefendible si la decisión
          se cuestiona después.
        </p>
      </div>
    </section>
  );
}
