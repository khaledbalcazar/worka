// Bancos de ítems generados por regla: razonamiento numérico y atención al
// detalle.
//
// Se generan en vez de escribirse a mano por la misma razón que las figuras:
// la respuesta correcta sale de la cuenta, no de quien redacta, así que no
// hay claves equivocadas; y con semilla fija el banco es siempre el mismo.
//
// Sin imports de valores: las pruebas los cargan con node --test directo.

import type { TemplateQuestion } from "../templates";

function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const entre = (r: () => number, min: number, max: number) =>
  min + Math.floor(r() * (max - min + 1));
const elegir = <T,>(r: () => number, xs: T[]): T => xs[Math.floor(r() * xs.length)];
function mezclar<T>(xs: T[], r: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 125000 → "125.000", como se escriben los guaraníes. */
export function gs(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Cuatro opciones: la correcta y tres distractoras distintas, positivas y
// plausibles (errores típicos de la cuenta, no números al azar).
function opciones(
  correcta: number,
  candidatas: number[],
  r: () => number,
  fmt: (n: number) => string = String
): { options: string[]; correct: string } {
  const ok = fmt(correcta);
  const set = new Set([ok]);
  const malas: string[] = [];
  for (const c of [...candidatas, correcta + 1, correcta - 1, correcta + 2, correcta * 2]) {
    if (malas.length === 3) break;
    if (!Number.isFinite(c) || c <= 0 || !Number.isInteger(c)) continue;
    const s = fmt(c);
    if (set.has(s)) continue;
    set.add(s);
    malas.push(s);
  }
  return { options: mezclar([ok, ...malas], r), correct: ok };
}

type GenNum = (r: () => number) => TemplateQuestion;

const NUMERICOS: GenNum[] = [
  // Serie aritmética.
  (r) => {
    const a = entre(r, 2, 40);
    const d = elegir(r, [-9, -7, -6, -4, -3, 3, 4, 5, 6, 7, 8, 9, 11, 12]);
    const t = [0, 1, 2, 3].map((k) => a + k * d + (d < 0 ? 60 : 0));
    const ok = t[3] + d;
    return {
      text: `¿Qué número sigue? ${t.join(", ")}, ___`,
      kind: "unica",
      dimension: "numerico",
      ...opciones(ok, [ok + d, ok - 2 * d, t[3] + 2 * d, ok + (d > 0 ? 1 : -1) * 2], r),
    };
  },
  // Serie geométrica.
  (r) => {
    const a = entre(r, 1, 6);
    const q = elegir(r, [2, 3]);
    const t = [0, 1, 2, 3].map((k) => a * q ** k);
    const ok = t[3] * q;
    return {
      text: `¿Qué número sigue? ${t.join(", ")}, ___`,
      kind: "unica",
      dimension: "numerico",
      ...opciones(ok, [t[3] + (t[3] - t[2]), t[3] * (q + 1), ok + q, ok - a], r),
    };
  },
  // Dos operaciones que se alternan.
  (r) => {
    const x = entre(r, 5, 30);
    const s = entre(r, 3, 9);
    const b = entre(r, 1, s - 1);
    const t = [x];
    for (let k = 1; k < 6; k++) t.push(k % 2 ? t[k - 1] + s : t[k - 1] - b);
    const ok = t[5] - b;
    return {
      text: `¿Qué número sigue? ${t.slice(0, 6).join(", ")}, ___`,
      kind: "unica",
      dimension: "numerico",
      ...opciones(ok, [t[5] + s, t[5] - b + s, ok - 1, t[5] + b], r),
    };
  },
  // Diferencias que crecen de a uno.
  (r) => {
    const a = entre(r, 1, 20);
    const k = entre(r, 1, 4);
    const t = [a];
    for (let i = 1; i < 5; i++) t.push(t[i - 1] + i * k);
    const ok = t[4] + 5 * k;
    return {
      text: `¿Qué número sigue? ${t.join(", ")}, ___`,
      kind: "unica",
      dimension: "numerico",
      ...opciones(ok, [t[4] + 4 * k, t[4] + 6 * k, ok + k, ok - 2 * k], r),
    };
  },
  // Porcentaje de descuento.
  (r) => {
    const pct = elegir(r, [10, 15, 20, 25, 30, 40, 50]);
    const precio = entre(r, 3, 60) * 10000;
    const desc = (precio * pct) / 100;
    const ok = precio - desc;
    const prod = elegir(r, ["un par de zapatillas", "una licuadora", "una mochila", "un ventilador", "una campera", "un juego de sábanas"]);
    return {
      text: `${prod[0].toUpperCase() + prod.slice(1)} cuesta ${gs(precio)} Gs. y tiene ${pct}% de descuento. ¿Cuánto se paga?`,
      kind: "unica",
      dimension: "numerico",
      ...opciones(ok, [desc, precio - pct * 1000, ok - desc / 2, precio + desc], r, (n) => `${gs(n)} Gs.`),
    };
  },
  // Regla de tres.
  (r) => {
    const n = entre(r, 2, 6);
    let m = entre(r, 3, 12);
    if (m === n) m += 1;
    const u = entre(r, 3, 50) * 500;
    const ok = m * u;
    const cosa = elegir(r, ["cajas de leche", "bolsas de cemento", "cuadernos", "litros de aceite", "paquetes de yerba", "metros de cable"]);
    return {
      text: `Si ${n} ${cosa} cuestan ${gs(n * u)} Gs., ¿cuánto cuestan ${m} al mismo precio?`,
      kind: "unica",
      dimension: "numerico",
      ...opciones(ok, [ok + u, ok - u, n * u + (m - n) * 1000, (m + 1) * u], r, (x) => `${gs(x)} Gs.`),
    };
  },
];

// ── Atención al detalle ────────────────────────────────────────

const APELLIDOS = ["Benítez", "González", "Giménez", "Ocampo", "Cáceres", "Villalba", "Ayala", "Duarte", "Ortiz", "Martínez", "Ramírez", "Acosta", "Ferreira", "Báez", "Insfrán", "Riquelme", "Aquino", "Cabral"];
const NOMBRES = ["Rosa", "Elena", "Carlos", "Ramón", "Lidia", "Marcos", "Sonia", "Diego", "Ana", "Liz", "Hugo", "Nilda", "Fátima", "Osvaldo"];
const LETRAS = "ABCDEFGHJKLMNPRSTUVWXYZ";

function digitos(r: () => number, n: number): string {
  let s = "";
  for (let i = 0; i < n; i++) s += String(entre(r, 0, 9));
  return s;
}
function letras(r: () => number, n: number): string {
  let s = "";
  for (let i = 0; i < n; i++) s += LETRAS[entre(r, 0, LETRAS.length - 1)];
  return s;
}

const MODELOS: { tipo: string; armar: (r: () => number) => string }[] = [
  { tipo: "número de factura", armar: (r) => `001-00${entre(r, 1, 9)}-${digitos(r, 7)}` },
  { tipo: "RUC", armar: (r) => `${entre(r, 1, 8)}${digitos(r, 6)}-${entre(r, 0, 9)}` },
  { tipo: "celular", armar: (r) => `09${elegir(r, ["81", "82", "83", "84", "85", "71", "72", "61", "76", "91", "92", "95"])} ${digitos(r, 3)} ${digitos(r, 3)}` },
  { tipo: "chapa", armar: (r) => `${letras(r, 3)} ${digitos(r, 3)}` },
  { tipo: "código de producto", armar: (r) => `${letras(r, 2)}-${digitos(r, 4)}-${letras(r, 1)}${entre(r, 0, 9)}` },
  { tipo: "nombre", armar: (r) => `${elegir(r, APELLIDOS)} ${elegir(r, APELLIDOS)}, ${elegir(r, NOMBRES)} ${elegir(r, NOMBRES)}` },
];

// Variantes "casi iguales": las que se escapan en una lectura rápida.
function variantes(x: string, r: () => number): string[] {
  const out = new Set<string>();
  const posiciones = [...x].map((ch, i) => ({ ch, i })).filter(({ ch }) => /[0-9A-Za-zÁÉÍÓÚáéíóúñ]/.test(ch));
  const intentos = [
    // Dos caracteres vecinos invertidos.
    () => {
      const cand = posiciones.filter(({ i }) => i + 1 < x.length && /[0-9A-Za-z]/.test(x[i + 1]) && x[i] !== x[i + 1]);
      if (!cand.length) return null;
      const { i } = elegir(r, cand);
      return x.slice(0, i) + x[i + 1] + x[i] + x.slice(i + 2);
    },
    // Un dígito cambiado por otro.
    () => {
      const cand = posiciones.filter(({ ch }) => /[0-9]/.test(ch));
      if (!cand.length) return null;
      const { i, ch } = elegir(r, cand);
      const otro = String((Number(ch) + entre(r, 1, 8)) % 10);
      return x.slice(0, i) + otro + x.slice(i + 1);
    },
    // Una letra cambiada por otra parecida.
    () => {
      const pares: Record<string, string> = { O: "Q", Q: "O", E: "F", F: "E", B: "R", R: "B", M: "N", N: "M", U: "V", V: "U", C: "G", G: "C", a: "o", o: "a", e: "c", c: "e", n: "m", m: "n", í: "i", é: "e", á: "a", ó: "o" };
      const cand = posiciones.filter(({ ch }) => pares[ch]);
      if (!cand.length) return null;
      const { i, ch } = elegir(r, cand);
      return x.slice(0, i) + pares[ch] + x.slice(i + 1);
    },
    // Un carácter de menos.
    () => {
      const { i } = elegir(r, posiciones);
      return x.slice(0, i) + x.slice(i + 1);
    },
  ];
  for (let k = 0; out.size < 3 && k < 40; k++) {
    const v = intentos[k % intentos.length]();
    if (v && v !== x) out.add(v);
  }
  return [...out].slice(0, 3);
}

function detalle(r: () => number): TemplateQuestion | null {
  const m = elegir(r, MODELOS);
  const x = m.armar(r);
  const malas = variantes(x, r);
  if (malas.length < 3) return null;
  return {
    text: `¿Cuál de estas opciones es exactamente igual a este ${m.tipo}?  ${x}`,
    kind: "unica",
    dimension: "atencion",
    options: mezclar([x, ...malas], r),
    correct: x,
  };
}

function banco(
  gen: (r: () => number, i: number) => TemplateQuestion | null,
  cantidad: number,
  semilla: number
): TemplateQuestion[] {
  const out: TemplateQuestion[] = [];
  const vistos = new Set<string>();
  for (let intento = 0; out.length < cantidad; intento++) {
    if (intento > cantidad * 50) throw new Error("bancos: no se llegó a la cantidad pedida");
    const q = gen(prng(semilla + intento), intento);
    if (!q || vistos.has(q.text)) continue;
    vistos.add(q.text);
    out.push(q);
  }
  return out;
}

/** 60 ítems de razonamiento numérico (seis reglas, diez de cada una). */
export const NUMERICO: TemplateQuestion[] = banco(
  (r, i) => NUMERICOS[i % NUMERICOS.length](r),
  60,
  3101
);

/** 60 ítems de atención al detalle (comparar datos casi iguales). */
export const ATENCION: TemplateQuestion[] = banco((r) => detalle(r), 60, 5101);
