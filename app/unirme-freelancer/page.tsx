import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, CreditCard, Palette, Star } from "lucide-react";
import Logo from "@/components/Logo";
import JoinButton from "@/components/freelancers/JoinButton";
import { getMyFreelancerProfile } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import { isLive } from "@/lib/data";

export const metadata = {
  title: "Sumate a Worka Freelancers",
  description:
    "Creá tu perfil de freelancer en Worka: mostrá tu portfolio, ofrecé tus servicios, recibí pedidos de presupuesto y cobrá con tus propios links de pago.",
};

const BENEFITS = [
  {
    icon: Briefcase,
    title: "Tu portfolio y tus servicios",
    text: "Mostrá tus proyectos, contá tu historia y publicá los servicios que ofrecés con precios y plazos.",
  },
  {
    icon: CreditCard,
    title: "Cobrá a tu manera",
    text: "Agregá tus links de pago (Mercado Pago, PayPal, transferencia…). Worka no cobra comisión sobre tu trabajo.",
  },
  {
    icon: Palette,
    title: "Un perfil que es tuyo",
    text: "Personalizá el color, el banner y el orden de tus secciones. Compartí tu perfil con un solo link.",
  },
  {
    icon: Star,
    title: "Presupuestos directos",
    text: "Los clientes te encuentran en el directorio y te piden presupuesto sin intermediarios.",
  },
];

export default async function JoinFreelancerPage() {
  const live = isLive();
  const user = live ? await getCurrentUser() : null;
  const loggedIn = live ? !!user : true;

  // Si ya tiene perfil, directo al dashboard.
  const existing = loggedIn ? await getMyFreelancerProfile() : null;
  if (existing) redirect("/freelancer");

  return (
    <main className="flex-1 bg-surface min-h-screen">
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo />
          <Link href="/freelancers" className="text-sm text-gray-500 hover:text-primary">
            Ver el directorio
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-3">
          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-[#7C5CFC]/10 text-[#7C5CFC]">
            Nuevo en Worka
          </span>
          <h1 className="text-2xl lg:text-4xl font-bold text-primary-dark">
            Convertí tu talento en tu propio negocio
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Worka Freelancers es una extensión de tu cuenta. Seguís teniendo tu
            perfil de empleos, y sumás un perfil profesional para ofrecer
            servicios y trabajar por proyecto.
          </p>
          <div className="flex justify-center pt-2">
            <JoinButton loggedIn={loggedIn} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <div key={b.title} className="card p-5">
              <div className="w-10 h-10 rounded-xl bg-[#7C5CFC]/10 flex items-center justify-center mb-3">
                <b.icon className="w-5 h-5 text-[#7C5CFC]" />
              </div>
              <h3 className="font-semibold text-primary-dark">{b.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{b.text}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center">
          Al unirte aceptás que tu perfil de freelancer sea público en el
          directorio. Podés ocultarlo cuando quieras desde tu panel.
        </p>
      </div>
    </main>
  );
}
