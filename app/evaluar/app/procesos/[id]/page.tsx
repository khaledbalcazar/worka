import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BarChart3, ChevronLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/server";
import { isLive } from "@/lib/data";
import { getLinkableJobs, getProcessDetail } from "@/lib/evaluar";
import ProcessEditor from "@/components/evaluar/ProcessEditor";

export const metadata = { title: "Proceso" };

export default async function ProcessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (isLive()) {
    const user = await getCurrentUser();
    if (!user) redirect(`/ingresar?next=%2Fevaluar%2Fapp%2Fprocesos%2F${id}`);
  }

  const [detail, jobs] = await Promise.all([
    getProcessDetail(id),
    getLinkableJobs(),
  ]);
  if (!detail) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/evaluar/app"
          className="text-sm text-primary font-medium flex items-center gap-1"
        >
          <ChevronLeft size={16} /> Mis procesos
        </Link>
        <Link
          href={`/evaluar/app/procesos/${id}/tablero`}
          className="btn-secondary press text-sm"
        >
          <BarChart3 size={16} /> Tablero de decisión
        </Link>
      </div>

      <ProcessEditor detail={detail} jobs={jobs} />
    </div>
  );
}
