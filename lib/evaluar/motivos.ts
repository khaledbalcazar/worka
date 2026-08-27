// Por qué se descartó a un candidato.
//
// Vive acá y no en la base para que la pantalla y los reportes usen la misma
// lista, y para poder corregir una etiqueta sin migrar datos.
//
// La lista es corta a propósito. Veinte motivos se convierten en veinte
// formas de decir lo mismo y el reporte deja de servir; con estos ocho entra
// casi todo lo que pasa de verdad en una búsqueda.
//
// Ninguno alude a edad, sexo, estado civil, hijos, embarazo, salud, religión,
// nacionalidad ni afiliación política. No es sólo una cuestión legal: un
// motivo así, escrito y guardado, es la prueba de una decisión que no se
// puede defender.

export type MotivoDescarte = {
  key: string;
  label: string;
  /** Qué significa, para que dos personas del equipo lo usen igual. */
  detalle: string;
  /** Si conviene pedir una nota además de la categoría. */
  pideDetalle?: boolean;
};

export const MOTIVOS_DESCARTE: MotivoDescarte[] = [
  {
    key: "requisitos",
    label: "No cumple un requisito del puesto",
    detalle: "Le falta algo excluyente: registro de conducir, título, experiencia mínima.",
  },
  {
    key: "puntaje",
    label: "Puntaje por debajo del corte",
    detalle: "Rindió la evaluación y quedó abajo de lo que la empresa definió como mínimo.",
  },
  {
    key: "perfil",
    label: "El perfil no se ajusta al puesto",
    detalle: "Sabe hacer el trabajo, pero su forma de trabajar no encaja con lo que el puesto pide.",
    pideDetalle: true,
  },
  {
    key: "abandono",
    label: "Abandonó la evaluación",
    detalle: "Empezó y no la terminó dentro del plazo.",
  },
  {
    key: "sin_respuesta",
    label: "No respondió",
    detalle: "Se lo contactó y nunca contestó, o no se presentó a la entrevista.",
  },
  {
    key: "condiciones",
    label: "No acordamos las condiciones",
    detalle: "Salario, horario, lugar de trabajo o disponibilidad no coincidieron.",
    pideDetalle: true,
  },
  {
    key: "se_retiro",
    label: "El candidato se retiró",
    detalle: "Avisó que ya no le interesa o consiguió otro trabajo.",
  },
  {
    key: "otro_elegido",
    label: "Se eligió a otra persona",
    detalle: "No hubo nada en contra: alguien más quedó primero.",
  },
];

export const MOTIVOS_POR_KEY: Record<string, MotivoDescarte> =
  Object.fromEntries(MOTIVOS_DESCARTE.map((m) => [m.key, m]));

export function etiquetaMotivo(key: string | null | undefined): string | null {
  if (!key) return null;
  return MOTIVOS_POR_KEY[key]?.label ?? key;
}

// "Se eligió a otra persona" no dice nada malo del candidato, así que es el
// único que conviene mostrarle. El resto se guarda para la empresa: una
// devolución automática con "no cumple un requisito" sin contexto hace más
// daño que silencio.
export function motivoEsCompartible(key: string | null | undefined): boolean {
  return key === "otro_elegido" || key === "se_retiro";
}
