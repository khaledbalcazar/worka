import type { CandidateEducation, CandidateExperience } from "@/lib/types";

// Reglas compartidas por el formulario y el servidor para la trayectoria del
// candidato. Espejan los check de la migración 042: si el formulario deja
// pasar algo, la base lo rechaza con un error genérico, y es mejor avisar acá
// con un mensaje claro.

export const EDUCATION_LEVEL_VALUES = ["Secundario", "Técnico", "Universitario", "Curso", "Otro"];
export const MAX_SKILLS = 20;

export type ExperienceInput = {
  role: string;
  company: string;
  start_month: string; // YYYY-MM
  end_month: string | null; // YYYY-MM, null = actual
  description: string;
};

export type EducationInput = {
  institution: string;
  title: string;
  level: string;
  end_year: number | null;
};

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export function validateExperience(input: ExperienceInput, today = new Date()): string | null {
  const role = input.role.trim();
  const company = input.company.trim();
  if (role.length < 2 || role.length > 80) return "Escribí el puesto (entre 2 y 80 caracteres).";
  if (company.length < 1 || company.length > 80) return "Escribí la empresa o el lugar (hasta 80 caracteres).";
  if (!MONTH.test(input.start_month)) return "Elegí el mes en que empezaste.";
  if (input.end_month !== null && !MONTH.test(input.end_month)) return "Elegí el mes en que terminaste o marcá que es tu trabajo actual.";
  const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  if (input.start_month > thisMonth) return "La fecha de inicio no puede ser futura.";
  if (input.end_month !== null && input.end_month < input.start_month) return "La fecha de fin no puede ser anterior al inicio.";
  if (input.description.trim().length > 400) return "La descripción puede tener hasta 400 caracteres.";
  return null;
}

export function validateEducation(input: EducationInput, today = new Date()): string | null {
  const institution = input.institution.trim();
  const title = input.title.trim();
  if (institution.length < 2 || institution.length > 100) return "Escribí la institución (entre 2 y 100 caracteres).";
  if (title.length < 2 || title.length > 100) return "Escribí el título o curso (entre 2 y 100 caracteres).";
  if (!EDUCATION_LEVEL_VALUES.includes(input.level)) return "Elegí un nivel de estudios.";
  if (input.end_year !== null && (!Number.isInteger(input.end_year) || input.end_year < 1950 || input.end_year > today.getFullYear() + 8))
    return "Revisá el año de egreso.";
  return null;
}

// Quita vacíos y duplicados (sin distinguir mayúsculas ni tildes) y recorta
// al máximo permitido.
export function normalizeSkills(skills: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of skills) {
    const skill = raw.trim().replace(/\s+/g, " ").slice(0, 40);
    const key = skill.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    if (!skill || seen.has(key)) continue;
    seen.add(key);
    out.push(skill);
  }
  return out.slice(0, MAX_SKILLS);
}

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function monthLabel(date: string) {
  const [y, m] = date.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

// "feb 2024 – dic 2025 · 1 año 10 meses"
export function experiencePeriod(e: Pick<CandidateExperience, "start_date" | "end_date">, today = new Date()): string {
  const start = new Date(`${e.start_date.slice(0, 7)}-01T00:00:00`);
  const end = e.end_date ? new Date(`${e.end_date.slice(0, 7)}-01T00:00:00`) : today;
  const months = Math.max(1, (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const length = [years && `${years} ${years === 1 ? "año" : "años"}`, rest && `${rest} ${rest === 1 ? "mes" : "meses"}`].filter(Boolean).join(" ");
  return `${monthLabel(e.start_date)} – ${e.end_date ? monthLabel(e.end_date) : "actualidad"} · ${length}`;
}

export function educationPeriod(e: Pick<CandidateEducation, "end_year">): string {
  return e.end_year === null ? "En curso" : `Egreso ${e.end_year}`;
}
