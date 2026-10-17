import ELearnApp from "@/components/elearn/ELearnApp";
import { requireAdmin } from "@/lib/admin-stats";

// Módulo oculto: aula virtual personal para el concurso del Registro Civil.
// Solo accesible por el rol admin y excluido de los buscadores.
export const metadata = {
  title: "e-learn",
  robots: { index: false, follow: false },
};

export default async function ELearnPage() {
  await requireAdmin("/admin/e-learn");
  return <ELearnApp />;
}
