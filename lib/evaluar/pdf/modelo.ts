// Modelo de presentación del informe PDF de un candidato.
//
// Separa «qué se muestra y con qué regla» de «cómo se dibuja». Recibe datos
// ya leídos con los permisos de quien exporta y devuelve textos y números
// listos para la plantilla. No importa nada: así se prueba con node --test.
//
// Reglas (especificación del informe PDF, v1.0):
// - 0 y 0% son valores válidos; null o undefined nunca se convierten en cero.
// - Sin denominador no se divide: se explica por qué no hay resultado.
// - Un porcentaje de rasgo no es un percentil. El percentil se muestra solo
//   cuando existe y se rotula aparte, con su muestra.
// - El perfil del puesto se dibuja solo con valores reales.
// - Avance y estado se muestran juntos: «4 de 4» no significa «terminó».
// - Los contactos solo para quien puede verlos (el equipo no los exporta).

export const VERSION_PLANTILLA = "informe-pdf/1.0";

export type DatoRasgo = {
  key: string;
  label: string;
  pct: number;
  high: string;
  low: string;
  alto: boolean;
  percentile: number | null;
  sample: number;
};

export type DatoIntegridad = {
  key: string;
  label: string;
  pct: number;
  banda: "bajo" | "medio" | "atencion";
  validez: boolean;
  lectura: string;
};

export type EntradaInforme = {
  ahora: Date;
  zonaHoraria: string;
  /** Quien exporta es dueño del proceso: puede ver contactos. */
  esDueno: boolean;
  proceso: {
    title: string;
    org_unit?: string | null;
    department?: string | null;
    manager_name?: string | null;
    ideal_profile?: Record<string, number> | null;
    totalEtapas: number;
  };
  candidato: {
    full_name: string | null;
    status: string;
    source: string | null;
    city: string | null;
    email: string | null;
    phone: string | null;
    stage_index: number;
    completed_at: string | null;
    score: number | null;
    max_score: number | null;
    fit: number | null;
    fitCoverage: { rendidos: number; pedidos: number };
    cv_url: string | null;
    outcome_note: string | null;
    notes: { body: string; rating: number | null; created_at: string }[];
  };
  informe: {
    rasgos: DatoRasgo[];
    calidad: { kind: string; label: string; detail: string; severity: "aviso" | "alerta" }[];
    respondidas: number;
    entregadas: number;
    minutos: number | null;
    videos: number;
  } | null;
  integridad: { validez: DatoIntegridad[]; riesgo: DatoIntegridad[] } | null;
  /** Respuestas mínimas para comparar un rasgo (regla del sistema). */
  muestraMinima: number;
};

export type Indicador = {
  etiqueta: string;
  /** Lo que se muestra grande; null = no hay valor (y no es cero). */
  valor: string | null;
  sinValor: string;
  detalle: string;
};

export type RasgoModelo = {
  key: string;
  numero: number;
  label: string;
  pct: number;
  interpretacion: string;
  comparacion: string;
  objetivo: number | null;
};

export type InformeModelo = {
  version: string;
  generado: string;
  fechaInforme: string;
  nombre: string;
  proceso: string;
  area: string | null;
  responsable: string | null;
  estado: string;
  origen: string;
  ubicacionContacto: string[];
  resumen: Indicador[];
  calidad: { titulo: string; detalle: string; nivel: "Alerta" | "Aviso" }[];
  consistencia: string | null;
  integridad: {
    confiable: boolean;
    validez: (DatoIntegridad & { bandaTexto: string })[];
    riesgo: (DatoIntegridad & { bandaTexto: string })[];
    paraHablar: string[];
  } | null;
  rasgos: RasgoModelo[];
  hayObjetivo: boolean;
  /** El objetivo cubre todos los ejes: se puede cerrar el polígono. */
  objetivoCompleto: boolean;
  hayPercentil: boolean;
  radar: boolean;
  videos: number;
  cv: string;
  notas: { texto: string; meta: string }[];
  resolucion: string | null;
  guia: string[];
  advertencia: string;
  alertas: number;
};

const ESTADOS: Record<string, string> = {
  invitado: "Invitado",
  en_curso: "Rindiendo",
  completado: "Para revisar",
  finalista: "Finalista",
  contratado: "Contratado",
  descartado: "Descartado",
};

export const TEXTO_BANDA: Record<DatoIntegridad["banda"], string> = {
  bajo: "Sin señales",
  medio: "Conviene repreguntar",
  atencion: "Merece una conversación",
};

function fecha(d: Date | string, tz: string, conHora = false): string {
  const x = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(x.getTime())) return "";
  return x.toLocaleDateString("es-PY", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: tz,
    ...(conHora ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

const limpio = (s: string | null | undefined) => (typeof s === "string" ? s.trim() : "");
const minutos = (n: number) => `${n} ${n === 1 ? "minuto" : "minutos"}`;

/** Porcentaje de puntos, sin dividir por cero ni inventar el máximo. */
export function porcentajePuntos(score: number | null, max: number | null): number | null {
  if (typeof score !== "number" || typeof max !== "number" || !Number.isFinite(score) || !Number.isFinite(max) || max <= 0)
    return null;
  return Math.round((score / max) * 100);
}

export function construirInforme(e: EntradaInforme): InformeModelo {
  const { candidato: c, proceso: p, informe: r, ahora, zonaHoraria: tz } = e;
  const total = Math.max(0, e.proceso.totalEtapas);
  const etapa = total === 0 ? 0 : Math.min(c.stage_index + 1, total);
  const terminado = !!c.completed_at;
  const estado = ESTADOS[c.status] ?? c.status;

  // ── Resumen ──
  const idealDefinido = Object.values(p.ideal_profile ?? {}).some((w) => typeof w === "number" && w > 0);
  const ajuste: Indicador = {
    etiqueta: "Ajuste al puesto",
    valor: typeof c.fit === "number" ? `${c.fit}%` : null,
    sinValor: "No calculado",
    detalle:
      typeof c.fit === "number"
        ? `Qué tanto se parece su perfil a lo que se pidió para el puesto. Sale de ${c.fitCoverage.rendidos} de ${c.fitCoverage.pedidos} rasgos pedidos, los que rindió.`
        : !idealDefinido
          ? "Falta configurar qué importa en el puesto para calcularlo."
          : "Todavía no rindió ninguno de los rasgos que importan para el puesto.",
  };

  const pct = porcentajePuntos(c.score, c.max_score);
  const objetivas: Indicador = {
    etiqueta: "Pruebas objetivas",
    valor: pct === null ? null : `${pct}%`,
    sinValor: "No calculable",
    detalle:
      pct === null
        ? "Todavía no rindió preguntas que se corrijan solas."
        : `${c.score} de ${c.max_score} puntos en conocimientos, razonamiento y juicio situacional, sobre lo que rindió.`,
  };

  const avance: Indicador = {
    etiqueta: "Avance",
    valor: total === 0 ? null : `${etapa} de ${total}`,
    sinValor: "Sin etapas",
    detalle: terminado
      ? `Terminó el ${fecha(c.completed_at!, tz)}${r?.minutos ? `, en ${minutos(r.minutos)}` : ""}. Estado: ${estado}.`
      : c.status === "invitado"
        ? "Todavía no empezó la evaluación."
        : `Todavía está rindiendo. Estado: ${estado}.`,
  };

  // ── Rasgos ──
  const rasgos: RasgoModelo[] = (r?.rasgos ?? []).map((d, i) => {
    const peso = p.ideal_profile?.[d.key];
    return {
      key: d.key,
      numero: i + 1,
      label: d.label,
      pct: d.pct,
      interpretacion: d.alto ? d.high : d.low,
      comparacion:
        typeof d.percentile === "number"
          ? `Percentil ${d.percentile} · contra ${d.sample} personas evaluadas`
          : `Sin baremo disponible · ${d.sample} de ${e.muestraMinima} respuestas`,
      objetivo: typeof peso === "number" && peso > 0 ? Math.round((peso / 3) * 100) : null,
    };
  });
  const hayObjetivo = rasgos.some((x) => x.objetivo !== null);
  const hayPercentil = rasgos.some((x) => x.comparacion.startsWith("Percentil"));

  // ── Integridad ──
  let integridad: InformeModelo["integridad"] = null;
  if (e.integridad && (e.integridad.validez.length || e.integridad.riesgo.length)) {
    const con = <T extends DatoIntegridad>(f: T) => ({ ...f, bandaTexto: TEXTO_BANDA[f.banda] });
    integridad = {
      confiable: e.integridad.validez.every((f) => f.banda !== "atencion"),
      validez: e.integridad.validez.map(con),
      riesgo: e.integridad.riesgo.map(con),
      paraHablar: e.integridad.riesgo.filter((f) => f.banda !== "bajo").map((f) => f.label),
    };
  }

  const calidad = (r?.calidad ?? []).map((q) => ({
    titulo: q.label,
    detalle: q.detail,
    nivel: q.severity === "alerta" ? ("Alerta" as const) : ("Aviso" as const),
  }));
  const alertas = calidad.filter((q) => q.nivel === "Alerta").length;

  // ── Contactos: solo lo que hay y solo para quien puede verlo ──
  const ubicacionContacto = [limpio(c.city), ...(e.esDueno ? [limpio(c.email), limpio(c.phone)] : [])].filter(Boolean);

  const guia = [
    "Ajuste al puesto compara el perfil con lo que se pidió para el puesto y se basa únicamente en los rasgos rendidos.",
    "Pruebas objetivas es el porcentaje de puntos en preguntas con respuesta correcta; no mide personalidad.",
    "El porcentaje de cada rasgo no es una nota: describe un estilo de trabajo. Un valor bajo no es peor que uno alto, es distinto.",
    ...(hayPercentil ? ["El percentil compara contra el resto de las personas evaluadas en Worka Evaluar, y solo aparece cuando hay muestra suficiente."] : []),
    ...(hayObjetivo ? ["En el gráfico, la línea punteada es lo que se pidió para el puesto."] : []),
    "Avance y estado se leen por separado: haber pasado por todas las etapas no siempre significa que terminó.",
  ];

  return {
    version: VERSION_PLANTILLA,
    generado: fecha(ahora, tz, true),
    fechaInforme: fecha(ahora, tz),
    nombre: limpio(c.full_name) || "Sin nombre",
    proceso: limpio(p.title),
    // Si el nombre del proceso ya dice la sucursal o el área, no se repite.
    area:
      [limpio(p.org_unit), limpio(p.department)]
        .filter((x) => x && !limpio(p.title).toLowerCase().includes(x.toLowerCase()))
        .join(" · ") || null,
    responsable: limpio(p.manager_name) || null,
    estado,
    origen: c.source === "worka" ? "Postuló desde Worka Empleos" : "Invitado por la empresa",
    ubicacionContacto,
    resumen: [ajuste, objetivas, avance],
    calidad,
    consistencia:
      r && r.respondidas > 0 && calidad.length === 0
        ? `Respondió ${r.respondidas} de ${r.entregadas} preguntas${r.minutos ? ` en ${minutos(r.minutos)}` : ""}, sin señales de respuesta apurada, plana ni contradictoria.`
        : null,
    integridad,
    rasgos,
    hayObjetivo,
    objetivoCompleto: rasgos.length > 0 && rasgos.every((x) => x.objetivo !== null),
    hayPercentil,
    // Con menos de 3 ejes no hay figura; con más de 12 las etiquetas se
    // pisan y se lee mejor la tabla con barras, que nunca se omite.
    radar: rasgos.length >= 3 && rasgos.length <= 12,
    videos: r?.videos ?? 0,
    cv: c.cv_url ? "Adjuntó su CV. Se descarga desde el informe en el panel de Worka Evaluar." : "No adjuntó CV.",
    notas: c.notes
      .filter((n) => limpio(n.body))
      .map((n) => ({
        texto: limpio(n.body),
        meta: [fecha(n.created_at, tz), typeof n.rating === "number" && n.rating > 0 ? `Calificación ${n.rating} de 5` : ""]
          .filter(Boolean)
          .join(" · "),
      })),
    resolucion: limpio(c.outcome_note) || null,
    guia,
    advertencia:
      "Los resultados de este informe son una entrada más del proceso de selección y no deben usarse como único criterio de decisión. Los rasgos de personalidad describen estilos de trabajo, no aptitud. Integrá esta lectura con la entrevista y la experiencia.",
    alertas,
  };
}
