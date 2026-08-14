// Repetición espaciada con el sistema Leitner (el que enseña el propio
// Manual, Parte 0-B). Cada tarjeta vive en una "caja": si la acertás sube de
// caja y tarda más en volver; si la fallás vuelve a la caja 1 y reaparece hoy.

export interface CardSrs {
  box: number; // 1 a 5
  due: string; // fecha ISO (solo día) en que vuelve a tocar
}

export type SrsMap = Record<string, CardSrs>;

// Días de espera por caja. Caja 1 = hoy mismo; caja 5 = casi dominada.
export const BOX_INTERVALS: Record<number, number> = {
  1: 0,
  2: 1,
  3: 3,
  4: 7,
  5: 21
};

export const MAX_BOX = 5;

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Estado de una tarjeta que todavía no se estudió: caja 1, vence hoy.
export function initialState(): CardSrs {
  return { box: 1, due: today() };
}

export function getState(srs: SrsMap, cardId: string): CardSrs {
  return srs[cardId] ?? initialState();
}

// Aplica el resultado de un repaso y devuelve el nuevo estado de la tarjeta.
export function review(current: CardSrs, remembered: boolean): CardSrs {
  const box = remembered ? Math.min(current.box + 1, MAX_BOX) : 1;
  return { box, due: addDays(BOX_INTERVALS[box]) };
}

export function isDue(state: CardSrs, ref: string = today()): boolean {
  return state.due <= ref;
}

// Tarjetas que toca repasar hoy, primero las de caja más baja (las que peor
// te salen), que son las que más rinde practicar.
export function dueCards<T extends { id: string }>(cards: T[], srs: SrsMap): T[] {
  const ref = today();
  return cards
    .filter((c) => isDue(getState(srs, c.id), ref))
    .sort((a, b) => getState(srs, a.id).box - getState(srs, b.id).box);
}

export function boxCounts<T extends { id: string }>(cards: T[], srs: SrsMap): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const c of cards) counts[getState(srs, c.id).box]++;
  return counts;
}
