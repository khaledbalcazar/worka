import "../../empresa/company.css";
import "./evaluar-app.css";
import EvaluarShell from "@/components/evaluar/EvaluarShell";

// Marco del panel de trabajo de Worka Evaluar.
//
// Usa el sistema del ecosistema Worka (el del panel de empresa): fondo
// cálido, encabezado blanco y azul para las acciones. Antes el panel heredaba
// el tema oscuro de la portada, pensado para mirarse treinta segundos y no
// para comparar candidatos durante horas.
export default function EvaluarAppLayout({ children }: { children: React.ReactNode }) {
  return <EvaluarShell>{children}</EvaluarShell>;
}
