import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/server";
import { isLive } from "@/lib/data";
import { getBoardData, getMyEvaluarAccess } from "@/lib/evaluar";
import { planOf } from "@/lib/evaluar-plans";
import DecisionBoard from "@/components/evaluar/DecisionBoard";
import ProcessNav from "@/components/evaluar/ProcessNav";
import { AiFinalists } from "@/components/evaluar/AiAssist";

export const metadata = { title: "Comparar y decidir" };

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (isLive()) {
    const user = await getCurrentUser();
    if (!user)
      redirect(`/ingresar?next=%2Fevaluar%2Fapp%2Fprocesos%2F${id}%2Ftablero`);
  }

  const [board, access] = await Promise.all([
    getBoardData(id),
    getMyEvaluarAccess(),
  ]);
  if (!board) notFound();
  const plan = planOf(access);

  return (
    <div className="space-y-4">
      <Link href="/evaluar/app" className="text-sm text-primary font-medium inline-flex items-center gap-1">
        <ChevronLeft size={16} /> Mis procesos
      </Link>
      <h1 className="text-xl font-bold text-primary-dark">{board.process.title}</h1>
      <ProcessNav
        processId={id}
        current="decidir"
        counts={{ candidatos: board.candidates.length, etapas: board.stages.length }}
        esDueno={board.esDueno}
      />
      <AiFinalists processId={id} enabled={plan.ai} />
      <DecisionBoard
        board={board}
        puedeExportar={plan.reports}
        planLabel={plan.label}
      />
    </div>
  );
}
