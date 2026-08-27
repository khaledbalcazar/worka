import Link from "next/link";
import { LogOut } from "lucide-react";
import EvaluarLogo from "@/components/evaluar/EvaluarLogo";
import { signOut } from "@/app/actions";

// Marco del panel de trabajo.
//
// Comparte el idioma oscuro de la portada, con una diferencia deliberada: acá
// no hay grilla reactiva ni parallax. Son gestos que hacen memorable una
// portada que se mira treinta segundos y que cansan en una pantalla donde se
// comparan candidatos durante horas.
export default function EvaluarAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="nk flex-1 flex flex-col min-h-screen">
      <div
        className="fixed inset-0 -z-10"
        style={{ background: "var(--color-bg)" }}
        aria-hidden
      />

      <header
        className="sticky top-0 z-30"
        style={{
          borderBottom: "1px solid rgba(233,233,237,.08)",
          background: "color-mix(in srgb, var(--color-bg) 94%, transparent)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div className="max-w-[1160px] mx-auto px-4 sm:px-7 h-[58px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/evaluar/app" className="shrink-0">
              <EvaluarLogo size={26} />
            </Link>
            <nav className="hidden sm:flex gap-5 text-[13px]">
              <Link
                href="/evaluar/app"
                style={{ color: "var(--color-text)" }}
                className="pb-0.5"
              >
                Procesos
              </Link>
              <Link
                href="/evaluar/app/desempeno"
                style={{ color: "rgba(233,233,237,.5)" }}
              >
                Desempeño
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/evaluar/precios"
              className="nk-ghost hidden sm:inline-flex"
              style={{ padding: "7px 13px", fontSize: 12.5 }}
            >
              Planes
            </Link>
            {/* Cerrar sesión va como formulario y no como botón de cliente
                porque signOut ya es una acción de servidor: así funciona
                igual con JavaScript deshabilitado. */}
            <form action={signOut}>
              <button
                type="submit"
                className="nk-ghost"
                style={{ padding: "7px 13px", fontSize: 12.5 }}
                title="Cerrar sesión"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </div>
        </div>

        {/* En celular la navegación no entra arriba: va en su propia fila. */}
        <nav
          className="sm:hidden flex gap-5 px-4 pb-2.5 text-[13px]"
          style={{ borderTop: "1px solid rgba(233,233,237,.06)" }}
        >
          <Link href="/evaluar/app" style={{ color: "var(--color-text)" }}>
            Procesos
          </Link>
          <Link
            href="/evaluar/app/desempeno"
            style={{ color: "rgba(233,233,237,.5)" }}
          >
            Desempeño
          </Link>
          <Link
            href="/evaluar/precios"
            style={{ color: "rgba(233,233,237,.5)" }}
          >
            Planes
          </Link>
        </nav>
      </header>

      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
