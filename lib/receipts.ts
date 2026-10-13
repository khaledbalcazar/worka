// Recibo digital de Worka (sin valor fiscal). Funciones puras: número,
// código de verificación agrupado y monto en letras, como en el KuDE.

export type ReceiptItem = {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export type Receipt = {
  id: string;
  number: number;
  code: string;
  user_id: string;
  customer_name: string;
  customer_doc: string | null;
  customer_email: string | null;
  items: ReceiptItem[];
  currency: string;
  total: number;
  total_gs: number;
  payment_reference: string | null;
  status: "emitido" | "anulado";
  issued_at: string;
};

export const RECEIPT_SERIES = "001-001";

// 1 -> "001-001-0000001"
export function formatReceiptNumber(n: number): string {
  return `${RECEIPT_SERIES}-${String(Math.max(0, Math.floor(n))).padStart(7, "0")}`;
}

// Código en bloques de 4, como el CDC de la factura electrónica.
export function groupCode(code: string): string {
  return code.replace(/\s+/g, "").toUpperCase().replace(/(.{4})(?=.)/g, "$1 ");
}

const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // sin 0/O ni 1/I

// 20 caracteres a partir de bytes aleatorios (se pasan desde el servidor).
export function codeFromBytes(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < 20; i++) out += CODE_ALPHABET[bytes[i % bytes.length] % CODE_ALPHABET.length];
  return out;
}

export function isReceiptCode(value: string): boolean {
  return /^[23456789A-HJ-NP-Z]{20}$/.test(value.replace(/\s+/g, "").toUpperCase());
}

const CURRENCY_WORDS: Record<string, [string, string]> = {
  PYG: ["GUARANÍ", "GUARANÍES"],
  ARS: ["PESO ARGENTINO", "PESOS ARGENTINOS"],
  MXN: ["PESO MEXICANO", "PESOS MEXICANOS"],
  COP: ["PESO COLOMBIANO", "PESOS COLOMBIANOS"],
  CLP: ["PESO CHILENO", "PESOS CHILENOS"],
  BOB: ["BOLIVIANO", "BOLIVIANOS"],
};

const UNITS = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE", "VEINTE", "VEINTIUNO", "VEINTIDÓS", "VEINTITRÉS", "VEINTICUATRO", "VEINTICINCO", "VEINTISÉIS", "VEINTISIETE", "VEINTIOCHO", "VEINTINUEVE"];
const TENS = ["", "", "", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
const HUNDREDS = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

function below1000(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "CIEN";
  const h = Math.floor(n / 100);
  const rest = n % 100;
  let words = HUNDREDS[h];
  if (rest > 0) {
    let r: string;
    if (rest < 30) r = UNITS[rest];
    else r = TENS[Math.floor(rest / 10)] + (rest % 10 ? ` Y ${UNITS[rest % 10]}` : "");
    words = words ? `${words} ${r}` : r;
  }
  return words;
}

// "UNO" se apocopa a "UN" delante de "MIL"/"MILLONES" y de la moneda.
function apocope(words: string): string {
  return words.replace(/VEINTIUNO$/, "VEINTIÚN").replace(/UNO$/, "UN");
}

export function numberToWords(value: number): string {
  const n = Math.floor(Math.abs(value));
  if (n === 0) return "CERO";
  const parts: string[] = [];
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;
  if (millions > 0) parts.push(millions === 1 ? "UN MILLÓN" : `${apocope(numberToWords(millions))} MILLONES`);
  if (thousands > 0) parts.push(thousands === 1 ? "MIL" : `${apocope(below1000(thousands))} MIL`);
  if (rest > 0) parts.push(below1000(rest));
  return parts.join(" ");
}

// "GUARANÍES CUATRO MILLONES QUINCE MIL" (como el KuDE), con centavos si hay.
export function amountInWords(amount: number, currency: string): string {
  const [one, many] = CURRENCY_WORDS[currency] ?? [currency, currency];
  const whole = Math.floor(amount);
  const cents = Math.round((amount - whole) * 100);
  // La moneda va adelante ("GUARANÍES VEINTIUNO"), así que no se apocopa.
  const words = whole === 1 ? `UN ${one}` : `${many} ${numberToWords(whole)}`;
  return cents > 0 ? `${words} CON ${String(cents).padStart(2, "0")}/100` : words;
}
