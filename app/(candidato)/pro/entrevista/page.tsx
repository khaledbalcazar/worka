import Link from "next/link";
import InterviewSimulator from "@/components/pro/InterviewSimulator";
import PlanLock from "@/components/plans/PlanLock";
import { getMyApplications } from "@/lib/data";
import { PRO_BRAND } from "@/lib/plans";
import { isCurrentUserPro } from "@/lib/subscriptions";

export const metadata = { title: "Simulador de entrevistas" };

export default async function InterviewPage() {
  const pro = await isCurrentUserPro();
  if (!pro) {
    return (
      <div className="max-w-2xl mx-auto mt-4">
        <PlanLock
          title="Practicá tu entrevista antes de ir"
          text={`El simulador te hace las preguntas típicas del puesto y te dice cómo mejorar cada respuesta. Es parte de ${PRO_BRAND}.`}
          href="/pro#contratar"
          cta={`Conocé ${PRO_BRAND}`}
        />
      </div>
    );
  }
  const apps = await getMyApplications();
  const suggestions = [...new Set(apps.map((a) => a.summary.title).filter((t) => t && t !== "Vacante no disponible"))].slice(0, 4);
  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-10">
      <Link href="/pro" className="text-sm text-primary font-medium">← {PRO_BRAND}</Link>
      <h1 className="page-title">Simulador de entrevistas</h1>
      <InterviewSimulator suggestions={suggestions} />
    </div>
  );
}
