import { notFound } from "next/navigation";
import { isWorkaLinked, loadEvaluation } from "@/app/evaluar/actions";
import { SITE_URL } from "@/lib/supabase/config";
import { isPastDeadline } from "@/lib/evaluar-access";
import CandidateRunner, {
  type Evaluation,
} from "@/components/evaluar/CandidateRunner";

// La evaluación del candidato. Se entra con el token del enlace: sin cuenta,
// sin contraseña y sin app. El token es la credencial, por eso la página no
// se indexa.
export const metadata = {
  title: "Tu evaluación",
  robots: { index: false, follow: false },
};

export default async function EvaluationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ worka?: string }>;
}) {
  const { token } = await params;
  const { worka } = await searchParams;
  const data = (await loadEvaluation(token)) as Evaluation | null;
  if (!data) notFound();

  const vencido = isPastDeadline(data.process.deadline_at);

  // «Continuar con Worka Empleos»: la autorización pasa en worka.click, donde
  // está la sesión del candidato, y vuelve acá con ?worka=1.
  const workaConnect = {
    url: `${SITE_URL.replace(/\/$/, "")}/conectar/evaluar?t=${encodeURIComponent(token)}`,
    linked: worka === "1" || (await isWorkaLinked(token)),
    justConnected: worka === "1",
  };

  return <CandidateRunner token={token} data={data} vencido={vencido} workaConnect={workaConnect} />;
}
