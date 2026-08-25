import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/server";
import { isLive } from "@/lib/data";
import { getBoardData } from "@/lib/evaluar";
import DecisionBoard from "@/components/evaluar/DecisionBoard";

export const metadata = { title: "Tablero de decisión" };

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

  const board = await getBoardData(id);
  if (!board) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      <Link
        href={`/evaluar/app/procesos/${id}`}
        className="text-sm text-primary font-medium flex items-center gap-1"
      >
        <ChevronLeft size={16} /> {board.process.title}
      </Link>
      <DecisionBoard board={board} />
    </div>
  );
}
