import type { Application, JobStatus, JobWithCompany } from "@/lib/types";

// Arma lo que ve el candidato en Mis postulaciones y Mensajes a partir de las
// filas de applications con su vacante embebida.
//
// La vacante puede no venir: la política jobs_public_read solo deja ver las
// vacantes Activas, así que una postulación a una vacante pausada, cerrada o
// en moderación llega con job = null. Antes eso tiraba abajo toda la página
// ("Cannot read properties of null (reading 'filter_questions')"). Acá cada
// postulación se resuelve por su cuenta: con la vacante completa si está
// visible, con el resumen de fn_my_applied_job_summaries (migración 044) si
// no, y si no hay ni eso, se muestra igual y se reporta como problema de
// datos en vez de esconderla.

export type AppliedJobSummary = {
  job_id: string;
  title: string;
  status: JobStatus | "Desconocido";
  company_id: string | null;
  company_name: string;
  company_logo_url: string | null;
  company_city: string | null;
  // Se puede abrir el aviso: la vacante está visible y activa.
  available: boolean;
};

export type ApplicationView = Application & {
  // Vacante completa solo si el candidato puede verla hoy.
  job: JobWithCompany | null;
  // Siempre presente: lo mínimo para listar la postulación.
  summary: AppliedJobSummary;
};

// Problemas de datos para el diagnóstico. Una vacante cerrada con su
// resumen NO es un problema: es el estado normal de una postulación vieja.
export type ApplicationIssue = {
  applicationId: string;
  jobId: string | null;
  // job_missing: ni la vacante ni su resumen (¿falta la migración 044 o la
  //   vacante no existe?). company_missing: vacante sin empresa.
  reason: "job_missing" | "company_missing";
};

// Fila de applications tal como la devuelve la consulta, con la vacante
// embebida (o null). Solo se tipan los campos que se usan acá.
export type ApplicationRow = Omit<Application, "answers"> & {
  job: (Record<string, unknown> & { company?: unknown }) | null;
};

export type SummaryRow = {
  job_id: string;
  title: string;
  status: string;
  company_id: string | null;
  company_name: string | null;
  company_logo_url: string | null;
  company_city: string | null;
};

const KNOWN_STATUSES: JobStatus[] = ["Activo", "Pausado", "Cerrado", "Moderacion"];

function toStatus(value: unknown): AppliedJobSummary["status"] {
  return KNOWN_STATUSES.includes(value as JobStatus) ? (value as JobStatus) : "Desconocido";
}

export function buildApplicationViews(
  rows: ApplicationRow[],
  summaries: SummaryRow[],
  mapJob: (row: Record<string, unknown>) => JobWithCompany
): { views: ApplicationView[]; issues: ApplicationIssue[] } {
  const byJob = new Map(summaries.map((s) => [s.job_id, s]));
  const views: ApplicationView[] = [];
  const issues: ApplicationIssue[] = [];

  for (const row of rows) {
    const { job: rawJob, ...application } = row;
    const base = { ...application, answers: [] } as Application;

    // 1. Vacante visible y con su empresa: el caso normal.
    if (rawJob && rawJob.company) {
      const job = mapJob(rawJob);
      views.push({
        ...base,
        job,
        summary: {
          job_id: job.id,
          title: job.title,
          status: toStatus(job.status),
          company_id: job.company.id,
          company_name: job.company.trade_name || job.company.company_name,
          company_logo_url: job.company.logo_url,
          company_city: job.company.location_city,
          available: job.status === "Activo",
        },
      });
      continue;
    }

    // 2. La vacante vino sin empresa: companies es de lectura pública, así
    // que esto es un problema de datos, no de permisos.
    if (rawJob && !rawJob.company) {
      issues.push({ applicationId: row.id, jobId: row.job_id, reason: "company_missing" });
    }

    // 3. No vino la vacante (lo esperable si no está activa): resumen.
    const summary = byJob.get(row.job_id);
    if (summary) {
      views.push({
        ...base,
        job: null,
        summary: {
          job_id: summary.job_id,
          title: summary.title,
          status: toStatus(summary.status),
          company_id: summary.company_id,
          company_name: summary.company_name || "Empresa",
          company_logo_url: summary.company_logo_url,
          company_city: summary.company_city,
          available: false,
        },
      });
      continue;
    }

    // 4. Ni la vacante ni su resumen: se lista igual para no perder la
    // postulación, y se reporta aparte como dato faltante.
    if (rawJob) {
      // Vacante sin empresa y sin resumen: se usa lo que haya en la fila.
      views.push({
        ...base,
        job: null,
        summary: {
          job_id: row.job_id,
          title: typeof rawJob.title === "string" ? rawJob.title : "Vacante",
          status: toStatus(rawJob.status),
          company_id: null,
          company_name: "Empresa",
          company_logo_url: null,
          company_city: null,
          available: false,
        },
      });
      continue;
    }
    issues.push({ applicationId: row.id, jobId: row.job_id, reason: "job_missing" });
    views.push({
      ...base,
      job: null,
      summary: {
        job_id: row.job_id,
        title: "Vacante no disponible",
        status: "Desconocido",
        company_id: null,
        company_name: "Empresa",
        company_logo_url: null,
        company_city: null,
        available: false,
      },
    });
  }

  return { views, issues };
}

// Texto para el candidato cuando la vacante ya no se puede abrir.
export function unavailableLabel(status: AppliedJobSummary["status"]): string {
  switch (status) {
    case "Pausado":
      return "Vacante pausada";
    case "Cerrado":
      return "Vacante cerrada";
    case "Moderacion":
      return "Vacante en revisión";
    case "Activo":
      return "Vacante activa";
    default:
      return "Vacante no disponible";
  }
}
