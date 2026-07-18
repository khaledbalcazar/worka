import Link from "next/link";
import { notFound } from "next/navigation";
import Logo from "@/components/Logo";
import { getPublicCandidate } from "@/lib/data";
import { formatDate } from "@/lib/format";

// Perfil público del candidato: una URL compartible por WhatsApp,
// visible para cualquier empleador (esté o no en Worka).
export default async function PublicCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = await getPublicCandidate(id);
  if (!candidate) notFound();

  const shareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Mirá mi perfil laboral en Worka: worka.com.py/p/${candidate.id}`
  )}`;

  return (
    <main className="flex-1 bg-surface min-h-screen">
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Logo />
          <Link href="/registro" className="btn-primary text-xs">
            Crear mi perfil gratis
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="card overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary-dark to-primary" />
          <div className="p-5 pt-0">
            <div className="w-20 h-20 rounded-full border-4 border-white bg-primary text-white flex items-center justify-center text-2xl font-bold -mt-10 shadow">
              {candidate.full_name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")}
            </div>
            <h1 className="text-xl font-bold text-primary-dark mt-3">
              {candidate.full_name}
            </h1>
            <p className="text-sm text-gray-500">
              📍 {candidate.location_city}, Paraguay
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {candidate.phone_verified && (
                <span className="chip bg-emerald-50 text-emerald-700">
                  ✓ WhatsApp verificado
                </span>
              )}
              {candidate.identity_status === "verified" && (
                <span className="chip bg-blue-50 text-primary">
                  🪪 Identidad verificada
                </span>
              )}
              {candidate.first_job_mode && (
                <span className="chip bg-purple-50 text-purple-700">
                  ✨ Buscando primer empleo
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Rubros de interés
              </p>
              <div className="flex flex-wrap gap-1.5">
                {candidate.preferences_industry.map((ind) => (
                  <span key={ind} className="chip bg-blue-50 text-primary">
                    {ind}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              En Worka desde {formatDate(candidate.created_at)}
            </p>
          </div>
        </div>

        {candidate.references.filter((r) => r.status === "confirmada").length >
          0 && (
          <div className="card p-5">
            <h2 className="font-semibold text-primary-dark mb-3">
              🤝 Referencias confirmadas
            </h2>
            <div className="space-y-2.5">
              {candidate.references
                .filter((r) => r.status === "confirmada")
                .map((r) => (
                  <div key={r.id} className="bg-surface rounded-xl px-4 py-3">
                    <p className="text-sm font-medium text-gray-700">
                      {r.referrer_name}{" "}
                      <span className="chip bg-emerald-50 text-emerald-700 ml-1">
                        ✓ confirmada
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {r.relationship}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="card p-5 text-center bg-blue-50 border-blue-100">
          <p className="text-sm text-primary-dark font-medium">
            ¿Querés contactar a {candidate.full_name.split(" ")[0]}?
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Registrá tu empresa gratis en Worka y contactala directo por
            WhatsApp.
          </p>
          <Link href="/empresa/registro" className="btn-primary mt-3">
            Registrar mi empresa
          </Link>
        </div>

        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary w-full"
        >
          💬 Compartir este perfil por WhatsApp
        </a>
      </div>
    </main>
  );
}
