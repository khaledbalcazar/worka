import CompanyShell from "@/components/CompanyShell";
import MaintenanceGate from "@/components/MaintenanceGate";
import { getCurrentCompany, getMyNotifications } from "@/lib/data";
import { saludoEmpresa } from "@/lib/format";

// Lado empresa: el layout trae las notificaciones y la empresa, y el shell
// cliente arma la navegación. La empresa se pide acá y no en cada página
// porque la barra lateral muestra su nombre y su estado de verificación en
// todas: pedirla abajo obligaría a que cada página se la pase hacia arriba.
export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, company] = await Promise.all([
    getMyNotifications(),
    getCurrentCompany(),
  ]);
  const { saludo, fecha } = saludoEmpresa();
  return (
    <CompanyShell
      notifications={notifications}
      company={company}
      saludo={saludo}
      fecha={fecha}
    >
      <MaintenanceGate>{children}</MaintenanceGate>
    </CompanyShell>
  );
}
