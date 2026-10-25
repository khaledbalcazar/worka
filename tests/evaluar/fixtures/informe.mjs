// Casos sintéticos del informe PDF. El de referencia reproduce los números
// del caso de la especificación (worka1.pdf) con un nombre inventado: sirve
// para verificar, nunca como dato de producción.

const AHORA = new Date("2026-10-25T14:51:00Z");

const rasgo = (key, label, pct, sample, high, low, percentile = null) => ({
  key,
  label,
  pct,
  high,
  low,
  alto: pct >= 50,
  percentile,
  sample,
});

export const REFERENCIA = {
  ahora: AHORA,
  zonaHoraria: "America/Asuncion",
  esDueno: true,
  muestraMinima: 30,
  proceso: {
    title: "Proceso de prueba (sintético)",
    org_unit: null,
    department: null,
    manager_name: null,
    ideal_profile: {},
    totalEtapas: 4,
  },
  candidato: {
    full_name: "Persona Sintética",
    status: "en_curso",
    source: "invitado",
    city: "San Lorenzo",
    email: "persona@ejemplo.test",
    phone: "0900 000 000",
    stage_index: 3,
    completed_at: null,
    score: 21,
    max_score: 48,
    fit: null,
    fitCoverage: { rendidos: 0, pedidos: 0 },
    cv_url: null,
    outcome_note: null,
    notes: [],
  },
  informe: {
    rasgos: [
      rasgo("servicio", "Servicio al cliente", 78, 9, "Resuelve sin perder al cliente.", "Se apega al reglamento."),
      rasgo("problemas", "Resolución de problemas", 67, 9, "Encuentra la salida práctica.", "Necesita guía."),
      rasgo("figural", "Razonamiento abstracto (figuras)", 33, 1, "Descubre reglas nuevas.", "Necesita ejemplos antes de encontrar la regla."),
      rasgo("verbal", "Razonamiento verbal", 25, 8, "Comprende textos complejos.", "Trabaja mejor con instrucciones literales."),
      rasgo("numerico", "Razonamiento numérico", 0, 10, "Detecta patrones en números.", "Le cuesta el cálculo abstracto."),
      rasgo("abstracto", "Razonamiento abstracto", 0, 8, "Ve la lógica en figuras y series.", "Necesita ejemplos concretos."),
      rasgo("companerismo", "Compañerismo", 0, 9, "Suma al equipo.", "Se enfoca solo en su parte."),
    ],
    calidad: [
      {
        kind: "apurada",
        label: "Contestó demasiado rápido",
        detail: "2.1 segundos por pregunta (67 segundos para 32). Abajo de 2.5 no alcanza ni para leer el ítem.",
        severity: "aviso",
      },
    ],
    respondidas: 32,
    entregadas: 32,
    minutos: 1,
    videos: 0,
  },
  integridad: null,
};

// Mismo caso con baremo y perfil del puesto completos.
export const CON_BAREMO = {
  ...REFERENCIA,
  proceso: { ...REFERENCIA.proceso, ideal_profile: { servicio: 3, problemas: 2, figural: 1, verbal: 1, numerico: 2, abstracto: 1, companerismo: 2 } },
  candidato: { ...REFERENCIA.candidato, status: "completado", completed_at: "2026-10-24T13:00:00Z", fit: 61, fitCoverage: { rendidos: 7, pedidos: 7 } },
  informe: {
    ...REFERENCIA.informe,
    calidad: [],
    rasgos: REFERENCIA.informe.rasgos.map((r, i) => ({ ...r, percentile: [72, 55, 30, 21, 3, 4, 2][i], sample: 140 })),
  },
};

// Sin nada rendido todavía.
export const VACIO = {
  ...REFERENCIA,
  candidato: { ...REFERENCIA.candidato, status: "invitado", stage_index: 0, score: null, max_score: null },
  informe: { rasgos: [], calidad: [], respondidas: 0, entregadas: 0, minutos: null, videos: 0 },
};

// Muchos rasgos, nombres largos, notas e integridad: para ver cortes de página.
export const MUCHOS = {
  ...CON_BAREMO,
  esDueno: false,
  candidato: {
    ...CON_BAREMO.candidato,
    full_name: "María de los Ángeles Ñandutí Peña Sintética",
    cv_url: "evaluar/sintetico.pdf",
    outcome_note: "Pasa a entrevista final.",
    notes: [
      { body: "Buena entrevista telefónica; mostró experiencia en caja con alto volumen.", rating: 4, created_at: "2026-10-23T15:00:00Z" },
      { body: "<script>alert('x')</script> Texto con caracteres raros: «comillas», ñ, ü, €.", rating: null, created_at: "2026-10-24T15:00:00Z" },
    ],
  },
  informe: {
    ...CON_BAREMO.informe,
    videos: 2,
    rasgos: Array.from({ length: 18 }, (_, i) =>
      rasgo(`r${i}`, `Rasgo sintético número ${i + 1} con un nombre bastante largo para probar`, (i * 13) % 101, 40 + i, "Descripción del polo alto.", "Descripción del polo bajo.", (i * 7) % 100)
    ),
  },
  integridad: {
    validez: [{ key: "deseabilidad", label: "Deseabilidad social", pct: 62, banda: "medio", validez: true, lectura: "Respuesta algo favorable." }],
    riesgo: [
      { key: "robo", label: "Cuidado de lo ajeno", pct: 40, banda: "atencion", validez: false, lectura: "Conviene repreguntar con una situación concreta." },
      { key: "trato", label: "Trato con compañeros", pct: 82, banda: "bajo", validez: false, lectura: "Sin señales." },
    ],
  },
};
