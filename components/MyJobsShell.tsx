import Link from "next/link";
import { Bell, Bookmark, ClipboardList, FileText } from "lucide-react";

// "Mis empleos": guardados, postulaciones y alertas comparten un riel a la
// izquierda en escritorio y pestañas arriba en celular, para pasar de una a
// otra sin volver al menú.
const ITEMS = [
  { key: "guardados", href: "/guardados", label: "Guardados", Icon: Bookmark },
  { key: "postulaciones", href: "/postulaciones", label: "Postulaciones", Icon: ClipboardList },
  { key: "alertas", href: "/alertas", label: "Alertas", Icon: Bell },
  { key: "cv", href: "/cv", label: "Mi CV", Icon: FileText },
] as const;

export default function MyJobsShell({
  active,
  children,
}: {
  active: (typeof ITEMS)[number]["key"];
  children: React.ReactNode;
}) {
  return (
    <div className="myjobs">
      <nav className="myjobs-rail" aria-label="Mis empleos">
        <p className="myjobs-rail-title"><Bookmark size={18} /> Mis empleos</p>
        <ul>
          {ITEMS.map(({ key, href, label, Icon }) => (
            <li key={key}>
              <Link href={href} aria-current={key === active ? "page" : undefined}>
                <Icon size={17} /> {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="myjobs-main">{children}</div>
    </div>
  );
}
