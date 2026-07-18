import CompanyShell from "@/components/CompanyShell";
import { getMyNotifications } from "@/lib/data";

// Lado empresa: el layout trae las notificaciones del usuario (empresa)
// y el shell cliente arma la navegación con la campanita.
export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const notifications = await getMyNotifications();
  return <CompanyShell notifications={notifications}>{children}</CompanyShell>;
}
