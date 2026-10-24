// Ítems figurales de Worka Evaluar: matrices 3×3 y series de figuras.
//
// Un test de razonamiento abstracto escrito ("serie de fichas: 1|2 · 2|3")
// mide también comprensión lectora, y se copia por WhatsApp en una línea.
// Con figuras se mide la regla, no el idioma, y pasar la respuesta de un
// postulante a otro exige describir un dibujo.
//
// Cómo funciona:
//   - Cada casilla es una Celda (forma, relleno, giro, cantidad, marca). Se
//     guarda como un código corto y canónico ("circulo.lleno.0.1.punto.sd.g").
//   - La pregunta guarda las casillas en evaluar_questions.figure y las
//     opciones como códigos. La corrección compara textos, como siempre: la
//     opción elegida contra `correct`.
//   - El navegador dibuja cada código en SVG (components/evaluar/Figura.tsx).
//
// Los ítems salen de generadores con semilla fija: el mismo código produce
// siempre el mismo banco, y cada ítem nace de una regla explícita, así que
// tiene una sola respuesta que la cumple. Las distractoras cambian un
// atributo que la regla fija, o repiten otra casilla de la matriz.
//
// Sin imports a propósito, para correr las pruebas con node --test.

export type Forma = "circulo" | "cuadrado" | "triangulo" | "rombo" | "linea" | "vacio";
export type Relleno = "vacio" | "lleno" | "rayado";
export type Marca = "ninguna" | "punto" | "cruz" | "estrella";
export type Pos = "si" | "sd" | "id" | "ii";

export type Celda = {
  forma: Forma;
  relleno: Relleno;
  /** Grados. Línea: 0, 45, 90, 135. Triángulo: 0, 90, 180, 270. */
  giro: number;
  cantidad: 1 | 2 | 3;
  marca: Marca;
  /** Esquina de la marca: superior izquierda/derecha, inferior derecha/izquierda. */
  pos: Pos;
  tam: "g" | "c";
};

export type FiguraSpec =
  | { tipo: "matriz"; celdas: string[] } // 8 casillas, la 9ª es la pregunta
  | { tipo: "serie"; celdas: string[] }; // 4 casillas, la 5ª es la pregunta

const BASE: Celda = {
  forma: "circulo",
  relleno: "vacio",
  giro: 0,
  cantidad: 1,
  marca: "ninguna",
  pos: "sd",
  tam: "g",
};

export const FORMAS: Forma[] = ["circulo", "cuadrado", "triangulo", "rombo"];
export const RELLENOS: Relleno[] = ["vacio", "lleno", "rayado"];
export const MARCAS: Marca[] = ["punto", "cruz", "estrella"];
export const POSICIONES: Pos[] = ["si", "sd", "id", "ii"];
const GIROS_LINEA = [0, 45, 90, 135];
const GIROS_TRIANGULO = [0, 90, 180, 270];

// ── Código canónico ────────────────────────────────────────────

function normalizar(c: Celda): Celda {
  const n = { ...c };
  // Una línea no tiene relleno ni se multiplica; sin marca, la esquina no
  // importa. Sin esto, dos códigos distintos dibujarían la misma figura y la
  // corrección por texto fallaría.
  if (n.forma === "linea") {
    n.relleno = "vacio";
    n.cantidad = 1;
    n.giro = ((n.giro % 180) + 180) % 180;
  } else if (n.forma === "triangulo") {
    n.giro = ((n.giro % 360) + 360) % 360;
  } else {
    n.giro = 0;
  }
  if (n.forma === "vacio") {
    n.relleno = "vacio";
    n.cantidad = 1;
  }
  if (n.marca === "ninguna") n.pos = "sd";
  return n;
}

export function codificar(c: Celda): string {
  const n = normalizar(c);
  return [n.forma, n.relleno, n.giro, n.cantidad, n.marca, n.pos, n.tam].join(".");
}

export function decodificar(codigo: string): Celda | null {
  const p = codigo.split(".");
  if (p.length !== 7) return null;
  const [forma, relleno, giro, cantidad, marca, pos, tam] = p;
  if (!["circulo", "cuadrado", "triangulo", "rombo", "linea", "vacio"].includes(forma)) return null;
  if (!RELLENOS.includes(relleno as Relleno)) return null;
  if (!["ninguna", ...MARCAS].includes(marca)) return null;
  if (!POSICIONES.includes(pos as Pos)) return null;
  const n = Number(cantidad);
  if (![1, 2, 3].includes(n)) return null;
  return {
    forma: forma as Forma,
    relleno: relleno as Relleno,
    giro: Number(giro) || 0,
    cantidad: n as 1 | 2 | 3,
    marca: marca as Marca,
    pos: pos as Pos,
    tam: tam === "c" ? "c" : "g",
  };
}

/** ¿El código es una figura válida? Lo usa el navegador antes de dibujar. */
export function esCodigoFigura(s: unknown): s is string {
  return typeof s === "string" && decodificar(s) !== null;
}

// ── Descripción en palabras (lector de pantalla) ───────────────

const NOMBRE: Record<Forma, [string, string]> = {
  circulo: ["círculo", "círculos"],
  cuadrado: ["cuadrado", "cuadrados"],
  triangulo: ["triángulo", "triángulos"],
  rombo: ["rombo", "rombos"],
  linea: ["línea", "líneas"],
  vacio: ["casilla vacía", "casillas vacías"],
};
const RELLENO_TXT: Record<Relleno, string> = {
  vacio: "blanco",
  lleno: "negro",
  rayado: "rayado",
};
const MARCA_TXT: Record<Marca, string> = {
  ninguna: "",
  punto: "un punto",
  cruz: "una cruz",
  estrella: "una estrella",
};
const POS_TXT: Record<Pos, string> = {
  si: "arriba a la izquierda",
  sd: "arriba a la derecha",
  id: "abajo a la derecha",
  ii: "abajo a la izquierda",
};
const CANT_TXT = ["", "un", "dos", "tres"];

export function describir(codigo: string): string {
  const c = decodificar(codigo);
  if (!c) return "figura";
  let txt: string;
  if (c.forma === "vacio") txt = "casilla sin figura";
  else if (c.forma === "linea") {
    const dir =
      c.giro === 0 ? "horizontal" : c.giro === 90 ? "vertical" : c.giro === 45 ? "inclinada hacia la derecha" : "inclinada hacia la izquierda";
    txt = `línea ${dir}`;
  } else {
    const [s, pl] = NOMBRE[c.forma];
    const plural = c.cantidad > 1;
    // Las cuatro formas son masculinas: "un círculo negro", "dos rombos rayados".
    const relleno = RELLENO_TXT[c.relleno] + (plural ? "s" : "");
    txt = `${plural ? CANT_TXT[c.cantidad] + " " + pl : "un " + s} ${relleno}`;
    if (c.tam === "c") txt += plural ? " chicos" : " chico";
    if (c.forma === "triangulo" && c.giro !== 0) {
      txt += c.giro === 90 ? ", apuntando a la derecha" : c.giro === 180 ? ", apuntando hacia abajo" : ", apuntando a la izquierda";
    }
  }
  if (c.marca !== "ninguna") txt += `, con ${MARCA_TXT[c.marca]} ${POS_TXT[c.pos]}`;
  return txt;
}

// ── Azar con semilla ───────────────────────────────────────────

export function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mezclar<T>(xs: T[], r: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function tomar<T>(xs: T[], n: number, r: () => number): T[] {
  return mezclar(xs, r).slice(0, n);
}

// ── Ítem generado ──────────────────────────────────────────────

export type ItemFigural = {
  figure: FiguraSpec;
  options: string[];
  correct: string;
  /** Qué regla arma el ítem: sirve para revisar y para la explicación. */
  regla: string;
  /** 1 fácil, 2 media, 3 difícil (cantidad de reglas simultáneas). */
  dificultad: 1 | 2 | 3;
};

type Atributo = "forma" | "relleno" | "giro" | "cantidad" | "marca" | "pos";

const DOMINIO: Record<Atributo, (c: Celda) => unknown[]> = {
  forma: () => FORMAS,
  relleno: () => RELLENOS,
  giro: (c) => (c.forma === "linea" ? GIROS_LINEA : c.forma === "triangulo" ? GIROS_TRIANGULO : [0]),
  cantidad: () => [1, 2, 3],
  marca: () => MARCAS,
  pos: () => POSICIONES,
};

// Tres distractoras: primero casillas de la propia matriz que no son la
// respuesta (la trampa clásica: copiar una vecina), después la respuesta con
// UN atributo de la regla cambiado. Todas distintas entre sí y de la correcta.
function distractoras(
  correcta: Celda,
  atributos: Atributo[],
  vecinas: Celda[],
  r: () => number
): string[] {
  const ok = codificar(correcta);
  const usadas = new Set([ok]);
  const out: string[] = [];
  const sumar = (c: Celda) => {
    const k = codificar(c);
    if (!usadas.has(k)) {
      usadas.add(k);
      out.push(k);
    }
  };

  const mutaciones: Celda[] = [];
  for (const at of atributos) {
    for (const v of DOMINIO[at](correcta)) {
      if (v === correcta[at]) continue;
      mutaciones.push({ ...correcta, [at]: v } as Celda);
    }
  }
  const candidatas = [...tomar(vecinas, 1, r), ...mezclar(mutaciones, r), ...mezclar(vecinas, r)];
  for (const c of candidatas) {
    if (out.length === 3) break;
    sumar(c);
  }
  // Respaldo: si la regla deja pocas variantes, se cambia el tamaño.
  if (out.length < 3) sumar({ ...correcta, tam: correcta.tam === "g" ? "c" : "g" });
  if (out.length < 3) sumar({ ...correcta, marca: correcta.marca === "ninguna" ? "punto" : "ninguna" });
  return out.slice(0, 3);
}

function armar(
  tipo: "matriz" | "serie",
  celdas: Celda[],
  atributos: Atributo[],
  regla: string,
  dificultad: 1 | 2 | 3,
  r: () => number
): ItemFigural {
  const correcta = celdas[celdas.length - 1];
  const visibles = celdas.slice(0, -1);
  const malas = distractoras(correcta, atributos, visibles, r);
  const correct = codificar(correcta);
  return {
    figure: { tipo, celdas: visibles.map(codificar) },
    options: mezclar([correct, ...malas], r),
    correct,
    regla,
    dificultad,
  };
}

// ── Matrices 3×3 ───────────────────────────────────────────────

type Gen = (r: () => number) => ItemFigural;

const grilla = (f: (fila: number, col: number) => Celda): Celda[] => {
  const out: Celda[] = [];
  for (let fila = 0; fila < 3; fila++) for (let col = 0; col < 3; col++) out.push(f(fila, col));
  return out;
};

const MATRICES: Gen[] = [
  // Forma por fila, relleno por columna.
  (r) => {
    const f = tomar(FORMAS, 3, r);
    const rl = mezclar(RELLENOS, r);
    return armar("matriz", grilla((i, j) => ({ ...BASE, forma: f[i], relleno: rl[j] })), ["forma", "relleno"],
      "La forma cambia por fila y el relleno por columna.", 1, r);
  },
  // Forma por fila, cantidad que crece por columna.
  (r) => {
    const f = tomar(FORMAS, 3, r);
    const rl = tomar(RELLENOS, 1, r)[0];
    const sube = r() < 0.5;
    return armar("matriz", grilla((i, j) => ({ ...BASE, forma: f[i], relleno: rl, tam: "c", cantidad: (sube ? j + 1 : 3 - j) as 1 | 2 | 3 })),
      ["forma", "cantidad"], "La forma cambia por fila y la cantidad por columna.", 1, r);
  },
  // Línea que gira 45° en cada paso.
  (r) => {
    const inicio = Math.floor(r() * 4);
    // Una marca fija en una esquina, igual en todas: no cambia la regla pero
    // multiplica las variantes (sin ella habría solo cuatro ítems distintos).
    const m: Marca = r() < 0.25 ? "ninguna" : tomar(MARCAS, 1, r)[0];
    const p = tomar(POSICIONES, 1, r)[0];
    return armar("matriz", grilla((i, j) => ({ ...BASE, forma: "linea", marca: m, pos: p, giro: GIROS_LINEA[(inicio + i + j) % 4] })), ["giro"],
      "La línea gira 45° en cada casilla, de izquierda a derecha y de arriba abajo.", 1, r);
  },
  // Cuadrado latino de formas, relleno por fila.
  (r) => {
    const f = tomar(FORMAS, 3, r);
    const rl = mezclar(RELLENOS, r);
    return armar("matriz", grilla((i, j) => ({ ...BASE, forma: f[(i + j) % 3], relleno: rl[i] })), ["forma", "relleno"],
      "Cada fila tiene las tres formas una vez, corridas un lugar; el relleno es el mismo en toda la fila.", 2, r);
  },
  // Marca que recorre las esquinas, forma por fila.
  (r) => {
    const f = tomar(FORMAS, 3, r);
    const m = tomar(MARCAS, 1, r)[0];
    const rl = tomar(RELLENOS, 1, r)[0];
    return armar("matriz", grilla((i, j) => ({ ...BASE, forma: f[i], relleno: rl, marca: m, pos: POSICIONES[(i + j) % 4] })), ["forma", "pos"],
      "La marca avanza una esquina en el sentido del reloj en cada casilla; la forma cambia por fila.", 2, r);
  },
  // Tres reglas: forma por fila, relleno por columna, marca en cuadrado latino.
  (r) => {
    const f = tomar(FORMAS, 3, r);
    const rl = mezclar(RELLENOS, r);
    const m = mezclar(MARCAS, r);
    const p = tomar(POSICIONES, 1, r)[0];
    return armar("matriz", grilla((i, j) => ({ ...BASE, forma: f[i], relleno: rl[j], marca: m[(i + j) % 3], pos: p })),
      ["forma", "relleno", "marca"], "Forma por fila, relleno por columna, y cada fila tiene las tres marcas una vez.", 3, r);
  },
  // Tres reglas: cantidad en cuadrado latino, forma por columna, triángulo que gira.
  (r) => {
    const f = tomar(FORMAS, 3, r);
    const rl = tomar(RELLENOS, 1, r)[0];
    return armar("matriz", grilla((i, j) => ({ ...BASE, forma: f[j], relleno: rl, tam: "c", cantidad: (1 + ((i + j) % 3)) as 1 | 2 | 3 })),
      ["forma", "cantidad"], "La forma cambia por columna y cada fila tiene una, dos y tres figuras, corridas un lugar.", 3, r);
  },
];

// ── Series de cinco ────────────────────────────────────────────

const serie = (f: (k: number) => Celda): Celda[] => [0, 1, 2, 3, 4].map(f);

const SERIES: Gen[] = [
  (r) => {
    const ini = Math.floor(r() * 4);
    const m: Marca = r() < 0.25 ? "ninguna" : tomar(MARCAS, 1, r)[0];
    const p = tomar(POSICIONES, 1, r)[0];
    return armar("serie", serie((k) => ({ ...BASE, forma: "linea", marca: m, pos: p, giro: GIROS_LINEA[(ini + k) % 4] })), ["giro"],
      "La línea gira 45° en cada paso.", 1, r);
  },
  (r) => {
    const f = tomar(FORMAS, 1, r)[0];
    const rl = tomar(RELLENOS, 1, r)[0];
    return armar("serie", serie((k) => ({ ...BASE, forma: f, relleno: rl, tam: "c", cantidad: (1 + (k % 3)) as 1 | 2 | 3 })), ["cantidad"],
      "Una, dos, tres figuras, y vuelve a empezar.", 1, r);
  },
  (r) => {
    const f = tomar(FORMAS, 3, r);
    const rl = tomar(RELLENOS, 1, r)[0];
    return armar("serie", serie((k) => ({ ...BASE, forma: f[k % 3], relleno: rl })), ["forma"],
      "Tres formas que se repiten en el mismo orden.", 1, r);
  },
  (r) => {
    const f = tomar(FORMAS, 1, r)[0];
    const rl = mezclar(RELLENOS, r);
    return armar("serie", serie((k) => ({ ...BASE, forma: f, relleno: rl[k % 3] })), ["relleno"],
      "Tres rellenos que se repiten en el mismo orden.", 1, r);
  },
  (r) => {
    const f = tomar(FORMAS, 1, r)[0];
    const m = tomar(MARCAS, 1, r)[0];
    const ini = Math.floor(r() * 4);
    return armar("serie", serie((k) => ({ ...BASE, forma: f, marca: m, pos: POSICIONES[(ini + k) % 4] })), ["pos"],
      "La marca avanza una esquina en el sentido del reloj.", 2, r);
  },
  (r) => {
    const ini = Math.floor(r() * 4);
    const rl = tomar(RELLENOS, 1, r)[0];
    return armar("serie", serie((k) => ({ ...BASE, forma: "triangulo", relleno: rl, giro: GIROS_TRIANGULO[(ini + k) % 4] })), ["giro"],
      "El triángulo gira un cuarto de vuelta en cada paso.", 2, r);
  },
  (r) => {
    const f = tomar(FORMAS, 3, r);
    const rl = mezclar(RELLENOS, r);
    return armar("serie", serie((k) => ({ ...BASE, forma: f[k % 3], relleno: rl[(k * 2) % 3] })), ["forma", "relleno"],
      "La forma rota de a una y el relleno salta de a dos: hay que seguir las dos reglas a la vez.", 3, r);
  },
];

// ── Bancos ─────────────────────────────────────────────────────

function banco(gens: Gen[], cantidad: number, semilla: number): ItemFigural[] {
  const out: ItemFigural[] = [];
  const vistos = new Set<string>();
  // El generador avanza en cada intento, no en cada ítem aceptado: si una
  // regla ya no da variantes nuevas, se pasa a la siguiente en vez de quedar
  // girando sobre la misma para siempre.
  for (let intento = 0; out.length < cantidad; intento++) {
    if (intento > cantidad * 50) {
      throw new Error(`figuras: el banco no llega a ${cantidad} ítems distintos`);
    }
    const gen = gens[intento % gens.length];
    const item = gen(prng(semilla + intento));
    const clave = item.figure.celdas.join("|") + ">" + item.correct;
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    out.push(item);
  }
  return out;
}

/** 120 matrices 3×3 (siete reglas, de una a tres simultáneas). */
export const MATRICES_FIGURALES: ItemFigural[] = banco(MATRICES, 120, 7001);

/** 60 series de cinco figuras. */
export const SERIES_FIGURALES: ItemFigural[] = banco(SERIES, 60, 9001);
