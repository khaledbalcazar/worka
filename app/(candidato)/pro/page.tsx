import Link from "next/link";
import {
  BarChart3,
  Bell,
  Check,
  Crown,
  Eye,
  FileText,
  GraduationCap,
  MessageSquareText,
  Sparkles,
  Star,
} from "lucide-react";
import PlanCheckout from "@/components/plans/PlanCheckout";
import EntityAvatar from "@/components/EntityAvatar";
import { getCurrentCandidate, getMyApplications, getSiteSettings, isLive } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import { ALWAYS_FREE_FOR_PEOPLE, PRO_BRAND, WORKA_PRO, formatGs, monthlyPrice, paymentLink } from "@/lib/plans";
import {
  INTERVIEW_CALLS_PER_MONTH,
  getAiUsage,
  getCurrentSubscription,
  getMyProfileViews,
  getPaymentRequestsFor,
  isCurrentUserPro,
} from "@/lib/subscriptions";
import { formatDate, timeAgo } from "@/lib/format";

export const metadata = { title: PRO_BRAND };

const SOURCE: Record<string, string> = {
  postulacion: "Miró tu postulación",
  cv: "Descargó tu CV",
  talento: "Te encontró en la búsqueda de talento",
  perfil: "Abrió tu perfil",
};

export default async function WorkaProPage() {
  const candidate = await getCurrentCandidate();
  if (!candidate) {
    return (
      <div className="card p-8 text-center max-w-md mx-auto">
        <p className="font-semibold">{PRO_BRAND} es para personas que buscan trabajo</p>
        <p className="text-sm text-muted mt-1">Creá tu perfil gratis para empezar.</p>
        <Link href="/onboarding" className="btn-primary mt-4">Crear mi perfil</Link>
      </div>
    );
  }

  const user = isLive() ? await getCurrentUser() : null;
  const userId = user?.id ?? candidate.id;
  const pro = await isCurrentUserPro();
  const [settings, views, subscription, requests, applications, usage] = await Promise.all([
    getSiteSettings(),
    getMyProfileViews(pro),
    isLive() ? getCurrentSubscription(userId, "pro") : Promise.resolve(null),
    isLive() ? getPaymentRequestsFor(userId, "pro") : Promise.resolve([]),
    getMyApplications(),
    pro && isLive() ? getAiUsage(userId) : Promise.resolve({ cvReviews: 0, interview: 0 }),
  ]);
  const price = monthlyPrice("pro", "pro", settings);
  const pending = requests.find((r) => r.status === "pendiente") ?? null;
  const answered = applications.filter((a) => a.status !== "Pendiente").length;
  const responseRate = applications.length ? Math.round((answered / applications.length) * 100) : 0;

  const tools = [
    { Icon: Sparkles, title: "Revisión de tu CV con IA", text: `Puntaje y mejoras concretas. Te quedan ${Math.max(0, WORKA_PRO.limits.cvReviewsPerMonth - usage.cvReviews)} este mes.`, href: "/cv#revision-ia" },
    { Icon: MessageSquareText, title: "Simulador de entrevistas", text: `Practicá con preguntas del puesto y recibí devolución. ${Math.max(0, Math.floor((INTERVIEW_CALLS_PER_MONTH - usage.interview) / 6))} entrevistas disponibles.`, href: "/pro/entrevista" },
    { Icon: FileText, title: "Plantillas de CV premium", text: "Dos diseños más para destacarte.", href: "/cv" },
    { Icon: GraduationCap, title: "Cursos premium", text: "Con certificado verificable que podés compartir.", href: "/academia" },
    { Icon: Bell, title: "Alertas al instante", text: "Te avisamos apenas se publica una vacante de tus alertas.", href: "/alertas" },
    { Icon: Star, title: "Perfil destacado", text: "Aparecés primero en la búsqueda de talento de las empresas.", href: "/perfil" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <header className="card p-5 sm:p-6">
        <p className="plan-eyebrow"><Crown size={15} /> {PRO_BRAND}</p>
        <h1 className="page-title mt-1">{pro ? "Tu búsqueda, con todas las herramientas" : "Conseguí trabajo antes, con más información"}</h1>
        <p className="text-sm text-muted mt-1">
          {pro
            ? subscription
              ? `Tu plan está activo hasta el ${formatDate(subscription.ends_at)}.`
              : "Tu plan está activo."
            : `Quién vio tu perfil, herramientas con IA y más, por ${formatGs(price)} al mes. Lo esencial de Worka sigue siendo gratis.`}
        </p>
      </header>

      <section className="card p-5">
        <h2 className="font-semibold text-lg flex items-center gap-2"><Eye size={18} /> Quién vio tu perfil</h2>
        <p className="text-sm text-muted mt-1">
          En los últimos 30 días, <strong className="text-ink">{views.companies} {views.companies === 1 ? "empresa" : "empresas"}</strong> miraron tu perfil o tu CV ({views.views} {views.views === 1 ? "vez" : "veces"}).
        </p>
        {pro ? (
          views.list.length === 0 ? (
            <p className="text-sm text-muted mt-3">Todavía no hay visitas registradas. Postulate y completá tu perfil para aparecer más.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {views.list.map((v, i) => (
                <li key={`${v.company_id}-${v.source}-${i}`} className="flex items-center gap-3 py-3">
                  <EntityAvatar url={v.logo_url} name={v.company_name} className="w-10 h-10 rounded-lg text-sm" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/empresas/${v.company_id}`} className="font-semibold hover:underline">{v.company_name}</Link>
                    <p className="text-xs text-muted">{SOURCE[v.source] ?? "Te vio"}{v.city ? ` · ${v.city}` : ""}</p>
                  </div>
                  <span className="text-xs text-muted whitespace-nowrap">{timeAgo(v.viewed_at)}</span>
                </li>
              ))}
            </ul>
          )
        ) : (
          views.companies > 0 && (
            <ul className="mt-4 space-y-2" aria-hidden="true">
              {Array.from({ length: Math.min(3, views.companies) }).map((_, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-[#e8e5df]" />
                  <span className="h-3 rounded bg-[#e8e5df]" style={{ width: `${40 + i * 12}%`, filter: "blur(1px)" }} />
                </li>
              ))}
            </ul>
          )
        )}
        {!pro && <a href="#contratar" className="btn-primary mt-4">Ver quiénes son con {PRO_BRAND}</a>}
      </section>

      {pro && (
        <section className="card p-5">
          <h2 className="font-semibold text-lg flex items-center gap-2"><BarChart3 size={18} /> Tus estadísticas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { label: "Postulaciones", value: String(applications.length) },
              { label: "Con respuesta", value: `${responseRate}%` },
              { label: "Empresas que te vieron", value: String(views.companies) },
              { label: "Vistas en 30 días", value: String(views.views) },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-[#f6f8fa] p-4">
                <p className="text-2xl font-semibold">{s.value}</p>
                <p className="text-xs text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <Link href="/postulaciones" className="profile-text-action mt-3">Ver el detalle de cada postulación</Link>
        </section>
      )}

      <section>
        <h2 className="font-semibold text-lg mb-3">{pro ? "Tus herramientas" : `Qué incluye ${PRO_BRAND}`}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tools.map(({ Icon, title, text, href }) =>
            pro ? (
              <Link key={title} href={href} className="card p-4 hover:border-primary transition-colors">
                <Icon size={20} className="text-primary" />
                <p className="font-semibold mt-2">{title}</p>
                <p className="text-sm text-muted mt-1">{text}</p>
              </Link>
            ) : (
              <div key={title} className="card p-4">
                <Icon size={20} className="text-primary" />
                <p className="font-semibold mt-2">{title}</p>
                <p className="text-sm text-muted mt-1">{text.split(".")[0]}.</p>
              </div>
            )
          )}
        </div>
      </section>

      {!pro && (
        <section className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
          <div className="card p-5">
            <h2 className="font-semibold text-lg">Activá {PRO_BRAND}</h2>
            <p className="text-sm text-muted mb-4">{formatGs(price)} por mes. Pagás con el link de pago, nos avisás y lo activamos en el día.</p>
            <PlanCheckout
              product="pro"
              plans={[{ id: "pro", name: PRO_BRAND, monthly: price }]}
              paymentLink={paymentLink("pro", settings)}
              pending={pending}
            />
          </div>
          <aside className="card p-5">
            <h2 className="font-semibold">Siempre gratis en Worka</h2>
            <ul className="plan-features mt-3">
              {ALWAYS_FREE_FOR_PEOPLE.map((f) => (
                <li key={f}><Check size={15} /> {f}</li>
              ))}
            </ul>
          </aside>
        </section>
      )}
    </div>
  );
}
