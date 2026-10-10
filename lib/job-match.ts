import type { Candidate, Job } from "@/lib/types";

// Compatibilidad entre el perfil del candidato y una vacante. Solo usa datos
// que el candidato declaró en Worka y datos publicados en la vacante: nada de
// requisitos inventados. Lo que no se puede saber queda como "unknown" y no
// suma ni resta al porcentaje.

export type MatchStatus = "met" | "unmet" | "unknown";
export type MatchItem = { key: string; status: MatchStatus; text: string };

export type MatchCandidate = Pick<
  Candidate,
  | "location_city"
  | "open_to_other_cities"
  | "preferences_modality"
  | "preferences_industry"
  | "first_job_mode"
  | "cv_url"
> & {
  // Opcionales: vienen de la trayectoria (migración 042).
  experience_count?: number;
  skills?: string[];
};
export type MatchJob = Pick<Job, "modality" | "industry" | "requires_experience"> & {
  requirements?: string[];
  company: { location_city: string };
};

const MODALITIES = ["Presencial", "Híbrido", "Remoto"];

const norm = (v: string) =>
  v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

function same(a: string, b: string) {
  return norm(a) === norm(b);
}

export function jobMatch(candidate: MatchCandidate, job: MatchJob) {
  const items: MatchItem[] = [];
  const city = job.company.location_city;

  if (job.modality === "Remoto") {
    items.push({ key: "ubicacion", status: "met", text: "Es remoto: no depende de tu ciudad" });
  } else if (candidate.location_city && same(candidate.location_city, city)) {
    items.push({ key: "ubicacion", status: "met", text: `Es en tu ciudad (${city})` });
  } else if (candidate.open_to_other_cities) {
    items.push({ key: "ubicacion", status: "met", text: `Es en ${city} y aceptás otras ciudades` });
  } else {
    items.push({ key: "ubicacion", status: "unmet", text: `Es en ${city}, fuera de tu ciudad` });
  }

  if (!MODALITIES.includes(candidate.preferences_modality)) {
    items.push({ key: "modalidad", status: "met", text: `Modalidad ${job.modality.toLowerCase()}: aceptás cualquiera` });
  } else if (candidate.preferences_modality === job.modality) {
    items.push({ key: "modalidad", status: "met", text: `Modalidad ${job.modality.toLowerCase()}, como preferís` });
  } else {
    items.push({ key: "modalidad", status: "unmet", text: `Es ${job.modality.toLowerCase()}; preferís ${candidate.preferences_modality.toLowerCase()}` });
  }

  if (candidate.preferences_industry.length === 0) {
    items.push({ key: "rubro", status: "unknown", text: "Elegí tus rubros para comparar" });
  } else if (candidate.preferences_industry.some((i) => same(i, job.industry))) {
    items.push({ key: "rubro", status: "met", text: `Rubro ${job.industry}, entre tus intereses` });
  } else {
    items.push({ key: "rubro", status: "unmet", text: `Rubro ${job.industry}, fuera de tus intereses` });
  }

  const experienceCount = candidate.experience_count ?? 0;
  if (!job.requires_experience) {
    items.push({ key: "experiencia", status: "met", text: "No pide experiencia previa" });
  } else if (experienceCount > 0) {
    items.push({ key: "experiencia", status: "met", text: `Pide experiencia y cargaste ${experienceCount === 1 ? "1 trabajo" : `${experienceCount} trabajos`}` });
  } else if (candidate.first_job_mode) {
    items.push({ key: "experiencia", status: "unmet", text: "Pide experiencia y buscás tu primer empleo" });
  } else {
    items.push({ key: "experiencia", status: "unknown", text: "Pide experiencia: contala en tu perfil" });
  }

  // Habilidades que aparecen escritas en los requisitos de la vacante. Solo
  // suma cuando hay coincidencia: que no aparezcan no significa que falten.
  const requirementText = norm((job.requirements ?? []).join(" | "));
  const matchedSkills = (candidate.skills ?? []).filter(
    (skill) => norm(skill).length >= 3 && requirementText.includes(norm(skill))
  );
  if (matchedSkills.length > 0) {
    items.push({ key: "habilidades", status: "met", text: `Pide ${matchedSkills.slice(0, 3).join(", ")}, que está en tus habilidades` });
  }

  items.push(
    candidate.cv_url
      ? { key: "cv", status: "met", text: "Tenés tu CV listo para enviar" }
      : { key: "cv", status: "unmet", text: "Todavía no subiste tu CV" }
  );

  const scored = items.filter((i) => i.status !== "unknown");
  const met = scored.filter((i) => i.status === "met").length;
  const percent = scored.length ? Math.round((met / scored.length) * 100) : 0;
  const level = percent >= 80 ? "Muy compatible" : percent >= 50 ? "Compatible" : "Poca coincidencia";
  return { items, met, total: scored.length, percent, level };
}
