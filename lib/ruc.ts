// Validación del dígito verificador del RUC paraguayo (módulo 11).
// No reemplaza la consulta a la DNIT, pero frena RUCs inventados al instante;
// los que pasan quedan en cola para el contraste manual del admin.

export function validateRucFormat(ruc: string): {
  valid: boolean;
  reason?: string;
} {
  const clean = ruc.replace(/\s/g, "");
  const match = clean.match(/^(\d{5,8})-?(\d)$/);
  if (!match)
    return {
      valid: false,
      reason: "El formato debe ser números y dígito verificador (ej: 80012345-6).",
    };
  const [, base, dvStr] = match;
  const dv = Number(dvStr);

  // Módulo 11 con pesos 2..11 desde el dígito menos significativo
  let sum = 0;
  let weight = 2;
  for (let i = base.length - 1; i >= 0; i--) {
    sum += Number(base[i]) * weight;
    weight = weight === 11 ? 2 : weight + 1;
  }
  const rest = sum % 11;
  const expected = rest > 1 ? 11 - rest : 0;

  if (dv !== expected)
    return {
      valid: false,
      reason: "El dígito verificador no coincide. Revisá el número de RUC.",
    };
  return { valid: true };
}

export function normalizeRuc(ruc: string): string {
  const clean = ruc.replace(/\s/g, "").replace(/-/g, "");
  return `${clean.slice(0, -1)}-${clean.slice(-1)}`;
}
