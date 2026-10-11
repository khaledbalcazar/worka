import type { Company, FilterQuestion, JobWithCompany } from "@/lib/types";

// Convierte una fila de jobs (con su empresa y sus preguntas embebidas) al
// modelo de la app. Vive aparte de lib/data.ts para poder probarlo sin
// Supabase.
//
// Recibe una fila que EXISTE. Si una consulta puede traer la vacante en null
// (por ejemplo, postulaciones a vacantes no activas que la RLS no deja ver),
// quien llama tiene que resolver ese caso antes: ver lib/applications.ts.

type QuestionRow = { id: string; question: string; knockout?: boolean | null; position?: number | null };
type CompanyRow = Omit<Company, "fast_responder" | "badges"> & Partial<Pick<Company, "fast_responder" | "badges">>;
type JobRow = Omit<JobWithCompany, "filter_questions" | "company"> & {
  filter_questions?: QuestionRow[] | null;
  company: CompanyRow;
};

export function mapJob(row: Record<string, unknown>): JobWithCompany {
  const job = row as unknown as JobRow;
  const questions: FilterQuestion[] = [...(job.filter_questions ?? [])]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((q) => ({ id: q.id, question: q.question, knockout: q.knockout ?? false }));
  return {
    ...job,
    filter_questions: questions,
    company: mapCompany(job.company as unknown as Record<string, unknown>),
  };
}

export function mapCompany(row: Record<string, unknown>): Company {
  const company = row as unknown as CompanyRow;
  return {
    ...company,
    fast_responder: company.fast_responder ?? false,
    badges: company.badges ?? [],
  };
}
