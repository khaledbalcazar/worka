import { notFound } from "next/navigation";
import { loadEvaluation } from "@/app/evaluar/actions";
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
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = (await loadEvaluation(token)) as Evaluation | null;
  if (!data) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <CandidateRunner token={token} data={data} />
    </div>
  );
}
