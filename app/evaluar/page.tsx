import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Eye,
  Link2,
  ListChecks,
  Users,
} from "lucide-react";
import { TRIAL_DAYS } from "@/lib/evaluar";

// Landing de venta de Worka Evaluar.
export default function EvaluarLandingPage() {
  return (
    <>
      {/* Portada */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
          <span className="chip bg-blue-50 text-primary font-semibold">
            {TRIAL_DAYS} días gratis · sin tarjeta
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-primary-dark leading-tight mt-4 max-w-3xl">
            Seleccioná mejor, sin que el candidato abandone en el camino.
          </h1>
          <p className="text-slate-600 mt-4 max-w-2xl sm:text-lg">
            Worka Evaluar es el software de reclutamiento que se conecta con tu
            vacante de Worka Empleos: la persona ve el aviso y{" "}
            <strong className="text-primary-dark">
              empieza la evaluación ahí mismo
            </strong>
            , sin crear otra cuenta ni esperar un correo que nunca abre.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Link
              href="/evaluar/app"
              className="btn-primary press text-base px-6 py-3"
            >
              Empezar mis {TRIAL_DAYS} días gratis <ArrowRight size={18} />
            </Link>
            <Link
              href="/evaluar/precios"
              className="btn-secondary press text-base px-6 py-3"
            >
              Ver precios
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Necesitás una cuenta de empresa en Worka. Crearla también es gratis.
          </p>
        </div>
      </section>

      {/* El diferencial */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary-dark">
          Lo que no vas a encontrar en otro lado
        </h2>
        <div className="grid gap-4 sm:grid-cols-3 mt-6 stagger">
          {[
            {
              Icon: Link2,
              title: "La evaluación empieza en el aviso",
              body: "Enlazás el proceso a tu vacante de Worka y quien se postula arranca los tests en el momento en que está interesado. Nadie pierde el hilo entre el aviso y una plataforma aparte.",
            },
            {
              Icon: BarChart3,
              title: "Tablero de decisión comparativo",
              body: "Los finalistas lado a lado con la evidencia de cada uno: puntaje por etapa, respuestas y notas del equipo. Decidís en minutos y queda registrado por qué.",
            },
            {
              Icon: Eye,
              title: "El candidato sabe siempre dónde está",
              body: "Ve su etapa, cuánto falta y en qué terminó, con devolución incluso si queda afuera. La gente termina los procesos cuando entiende el proceso.",
            },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="card p-5">
              <span className="w-11 h-11 rounded-2xl bg-blue-50 text-primary grid place-items-center">
                <Icon size={20} />
              </span>
              <h3 className="font-bold text-primary-dark mt-3">{title}</h3>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section
        id="como-funciona"
        className="bg-white border-y border-slate-200"
      >
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-dark">
            Cuatro pasos y el proceso corre solo
          </h2>
          <ol className="grid gap-4 sm:grid-cols-4 mt-6 stagger">
            {[
              {
                Icon: ListChecks,
                n: "1",
                t: "Armá el proceso",
                d: "Etapas y preguntas del puesto. Marcá cuáles son excluyentes.",
              },
              {
                Icon: Link2,
                n: "2",
                t: "Enlazá tu vacante",
                d: "Elegís una vacante activa de Worka y el proceso queda pegado al aviso.",
              },
              {
                Icon: Users,
                n: "3",
                t: "La gente rinde",
                d: "Desde el aviso o por invitación. Se corrige solo, al instante.",
              },
              {
                Icon: BarChart3,
                n: "4",
                t: "Decidí",
                d: "Compará finalistas en el tablero y cerrá el proceso.",
              },
            ].map(({ Icon, n, t, d }) => (
              <li key={n} className="card p-5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-white grid place-items-center text-xs font-bold">
                    {n}
                  </span>
                  <Icon size={18} className="text-slate-400" />
                </div>
                <h3 className="font-semibold text-primary-dark mt-3">{t}</h3>
                <p className="text-sm text-slate-600 mt-1">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Precio */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div className="card p-6 sm:p-8 max-w-lg mx-auto text-center">
          <span className="chip bg-emerald-50 text-emerald-700 font-semibold">
            {TRIAL_DAYS} días gratis
          </span>
          <h2 className="text-2xl font-bold text-primary-dark mt-3">
            Probalo con un proceso real
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Empezás hoy sin tarjeta y sin compromiso. Si al final del período te
            sirve, activás la suscripción; si no, no pagás nada.
          </p>
          <ul className="text-sm text-slate-700 text-left mt-5 space-y-2">
            {[
              "Procesos y etapas sin límite durante la prueba",
              "Enlace con tus vacantes de Worka Empleos",
              "Corrección automática y preguntas excluyentes",
              "Tablero de decisión con notas del equipo",
              "Devolución automática a cada candidato",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check size={16} className="text-success shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/evaluar/app"
            className="btn-primary press w-full mt-6 text-base py-3"
          >
            Empezar gratis
          </Link>
          <p className="text-xs text-slate-400 mt-3">
            Al terminar la prueba coordinamos el pago por transferencia o link.
            Nadie te cobra automáticamente.
          </p>
        </div>
      </section>
    </>
  );
}
