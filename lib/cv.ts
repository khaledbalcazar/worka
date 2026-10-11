// Modelo del generador de CV. Sin React ni Supabase para poder probarlo
// aparte: tipos, plantillas, armado inicial desde el perfil y limpieza de lo
// que vuelve del almacenamiento del navegador.

import type { Candidate, CandidateEducation, CandidateExperience, CourseBadge } from "@/lib/types";

export const CV_TEMPLATES = [
  {
    id: "clasico",
    name: "Clásico",
    description: "Una columna, sin foto ni colores. El que mejor leen los sistemas de selección (ATS).",
    accents: ["#111827", "#1f3864", "#7f1d1d", "#14532d"],
  },
  {
    id: "moderno",
    name: "Moderno con foto",
    description: "Foto redonda, dos columnas y barras de nivel en tus herramientas.",
    accents: ["#dc2626", "#0a66c2", "#0f766e", "#7c3aed"],
  },
  {
    id: "ejecutivo",
    name: "Ejecutivo",
    description: "Barra lateral con tus datos, idiomas y certificados. Ideal con mucha experiencia.",
    accents: ["#1f3864", "#0f766e", "#7f1d1d", "#374151"],
  },
] as const;

export type CvTemplateId = (typeof CV_TEMPLATES)[number]["id"];

export const LANGUAGE_LEVELS = ["Básico", "Intermedio", "Avanzado", "Nativo"] as const;

export type CvExperience = {
  role: string;
  company: string;
  city: string;
  start: string; // "YYYY-MM" o vacío
  end: string; // "YYYY-MM" o vacío
  current: boolean;
  description: string;
  // Logros o tareas, uno por línea: se muestran como viñetas.
  highlights: string;
};

export type CvEducation = {
  title: string;
  institution: string;
  city: string;
  start: string; // año
  end: string; // año
  current: boolean;
  notes: string;
};

export type CvTool = { name: string; level: number }; // 1 a 5
export type CvLanguage = { name: string; level: string };
export type CvCertification = { name: string; issuer: string; year: string };

export type CvData = {
  version: 1;
  template: CvTemplateId;
  accent: string;
  showPhoto: boolean;
  name: string;
  headline: string;
  email: string;
  phone: string;
  city: string;
  website: string;
  summary: string;
  experience: CvExperience[];
  education: CvEducation[];
  skills: string[];
  tools: CvTool[];
  languages: CvLanguage[];
  certifications: CvCertification[];
  courses: CvCertification[];
  extra: string;
};

export const EMPTY_EXPERIENCE: CvExperience = {
  role: "",
  company: "",
  city: "",
  start: "",
  end: "",
  current: false,
  description: "",
  highlights: "",
};

export const EMPTY_EDUCATION: CvEducation = {
  title: "",
  institution: "",
  city: "",
  start: "",
  end: "",
  current: false,
  notes: "",
};

export const EMPTY_CERTIFICATION: CvCertification = { name: "", issuer: "", year: "" };

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// "2024-03" -> "mar. 2024". Un año suelto queda igual.
export function formatMonth(value: string): string {
  const m = /^(\d{4})-(\d{2})/.exec(value.trim());
  if (!m) return value.trim();
  const month = Number(m[2]);
  return month >= 1 && month <= 12 ? `${MONTHS[month - 1]}. ${m[1]}` : m[1];
}

export function formatPeriod(start: string, end: string, current: boolean): string {
  const from = formatMonth(start);
  const to = current ? "Actualidad" : formatMonth(end);
  if (from && to) return `${from} – ${to}`;
  return from || to;
}

export function bullets(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/^\s*[-•*·]\s*/, "").trim())
    .filter(Boolean);
}

export function templateById(id: string) {
  return CV_TEMPLATES.find((t) => t.id === id) ?? CV_TEMPLATES[0];
}

// Primer borrador con lo que ya está en el perfil de Worka.
export function cvFromProfile(
  candidate: Candidate,
  career: { experience: CandidateExperience[]; education: CandidateEducation[]; skills: string[]; courses?: CourseBadge[] },
  email: string | null
): CvData {
  const headline = candidate.preferences_industry.slice(0, 2).join(" · ");
  return {
    version: 1,
    template: "moderno",
    accent: CV_TEMPLATES[1].accents[0],
    showPhoto: !!candidate.avatar_url,
    name: candidate.full_name,
    headline,
    email: email ?? "",
    phone: candidate.phone_whatsapp ?? "",
    city: candidate.location_city ?? "",
    website: "",
    summary:
      candidate.bio?.trim() ||
      (candidate.first_job_mode
        ? "Busco mi primera oportunidad laboral. Aprendo rápido, soy responsable y tengo muchas ganas de crecer."
        : ""),
    experience: career.experience.map((e) => ({
      ...EMPTY_EXPERIENCE,
      role: e.role,
      company: e.company,
      start: (e.start_date ?? "").slice(0, 7),
      end: (e.end_date ?? "").slice(0, 7),
      current: !e.end_date,
      description: e.description ?? "",
    })),
    education: career.education.map((e) => ({
      ...EMPTY_EDUCATION,
      title: e.title,
      institution: e.institution,
      end: e.end_year ? String(e.end_year) : "",
      current: e.end_year === null,
    })),
    skills: [...(career.skills ?? [])],
    tools: [],
    languages: [{ name: "Español", level: "Nativo" }],
    certifications: [],
    // Los cursos de Worka Academia terminados entran solos.
    courses: (career.courses ?? []).map((c) => ({
      name: c.title,
      issuer: "Worka Academia",
      year: (c.completed_at ?? "").slice(0, 4),
    })),
    extra: "",
  };
}

// ── Limpieza de lo guardado ────────────────────────────────────────────
// El borrador vive en el navegador: puede venir de otra versión o estar
// roto. Se toma lo que sirve y se descarta el resto en vez de romper la página.

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function list<T>(value: unknown, max: number, map: (raw: Record<string, unknown>) => T): T[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is Record<string, unknown> => !!v && typeof v === "object")
    .slice(0, max)
    .map(map);
}

const HEX = /^#[0-9a-f]{6}$/i;

export function sanitizeCv(raw: unknown, fallback: CvData): CvData {
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Record<string, unknown>;
  if (r.version !== 1) return fallback;
  const template = templateById(text(r.template, 20)).id;
  return {
    version: 1,
    template,
    accent: HEX.test(text(r.accent, 7)) ? text(r.accent, 7) : templateById(template).accents[0],
    showPhoto: r.showPhoto === true,
    name: text(r.name, 80) || fallback.name,
    headline: text(r.headline, 100),
    email: text(r.email, 120),
    phone: text(r.phone, 40),
    city: text(r.city, 80),
    website: text(r.website, 120),
    summary: text(r.summary, 1200),
    experience: list(r.experience, 15, (e) => ({
      role: text(e.role, 100),
      company: text(e.company, 100),
      city: text(e.city, 80),
      start: text(e.start, 7),
      end: text(e.end, 7),
      current: e.current === true,
      description: text(e.description, 800),
      highlights: text(e.highlights, 1200),
    })),
    education: list(r.education, 10, (e) => ({
      title: text(e.title, 120),
      institution: text(e.institution, 120),
      city: text(e.city, 80),
      start: text(e.start, 7),
      end: text(e.end, 7),
      current: e.current === true,
      notes: text(e.notes, 400),
    })),
    skills: Array.isArray(r.skills)
      ? r.skills.filter((s): s is string => typeof s === "string").map((s) => s.slice(0, 50)).slice(0, 20)
      : [],
    tools: list(r.tools, 12, (t) => ({
      name: text(t.name, 50),
      level: Math.min(5, Math.max(1, Math.round(Number(t.level) || 3))),
    })),
    languages: list(r.languages, 8, (l) => ({ name: text(l.name, 40), level: text(l.level, 30) })),
    certifications: list(r.certifications, 12, (c) => ({ name: text(c.name, 120), issuer: text(c.issuer, 100), year: text(c.year, 10) })),
    courses: list(r.courses, 12, (c) => ({ name: text(c.name, 120), issuer: text(c.issuer, 100), year: text(c.year, 10) })),
    extra: text(r.extra, 600),
  };
}

export function cvStorageKey(candidateId: string): string {
  return `worka:cv:${candidateId}`;
}

// Qué tan completo está, para guiar a la persona (no bloquea nada).
export function cvChecklist(cv: CvData): { label: string; done: boolean }[] {
  return [
    { label: "Nombre y contacto", done: !!cv.name.trim() && (!!cv.phone.trim() || !!cv.email.trim()) },
    { label: "Título o puesto buscado", done: !!cv.headline.trim() },
    { label: "Perfil profesional", done: cv.summary.trim().length >= 60 },
    { label: "Experiencia o estudios", done: cv.experience.some((e) => e.role.trim()) || cv.education.some((e) => e.title.trim()) },
    { label: "Habilidades", done: cv.skills.length + cv.tools.filter((t) => t.name.trim()).length >= 3 },
  ];
}
