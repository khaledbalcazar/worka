import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/server";
import { isLive } from "@/lib/data";
import { getCiclo } from "@/lib/evaluar/desempeno";
import CicloEditor from "@/components/evaluar/CicloEditor";

export const metadata = { title: "Ciclo de desempeño" };

export default async function CicloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (isLive()) {
    const user = await getCurrentUser();
    if (!user) redirect(`/ingresar?next=%2Fevaluar%2Fapp%2Fdesempeno%2F${id}`);
  }

  const detalle = await getCiclo(id);
  if (!detalle) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      <Link
        href="/evaluar/app/desempeno"
        className="text-sm text-primary font-medium flex items-center gap-1"
      >
        <ChevronLeft size={16} /> Desempeño
      </Link>
      <CicloEditor detalle={detalle} />
    </div>
  );
}
