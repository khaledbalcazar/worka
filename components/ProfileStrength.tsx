import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import type { Candidate } from "@/lib/types";

// "Fuerza del perfil": qué tan completo está y qué conviene hacer después.
//
// El perfil es lo único que la empresa ve de la persona, pero nada le decía
// que le faltaba la mitad. Cada paso dice qué gana al completarlo, no solo que
// falta: "sin CV muchas empresas ni te miran" mueve más que un porcentaje.
type Step = {
  done: boolean;
  label: string;
  why: string;
  href: string;
  weight: number;
};

export default function ProfileStrength({
  candidate,
  referencesCount = 0,
}: {
  candidate: Candidate;
  referencesCount?: number;
}) {
  const steps: Step[] = [
    {
      done: !!candidate.full_name && !!candidate.location_city,
      label: "Datos básicos",
      why: "Nombre y ciudad: sin esto no podés postularte.",
      href: "/perfil",
      weight: 20,
    },
    {
      done: !!candidate.cv_url,
      label: "Subir tu CV",
      why: "Muchas empresas descartan sin CV. Si no tenés, te lo generamos gratis.",
      href: candidate.cv_url ? "/perfil" : "/cv",
      weight: 25,
    },
    {
      done: !!candidate.avatar_url,
      label: "Foto de perfil",
      why: "Un perfil con foto recibe bastante más atención.",
      href: "/perfil",
      weight: 15,
    },
    {
      done: !!candidate.bio && candidate.bio.trim().length >= 40,
      label: "Contar tu experiencia",
      why: "Unas líneas sobre lo que sabés hacer te diferencian del resto.",
      href: "/perfil",
      weight: 15,
    },
    {
      done: candidate.preferences_industry.length > 0,
      label: "Elegir tus rubros",
      why: "Con esto armamos tus recomendaciones y tus alertas.",
      href: "/test-perfil",
      weight: 15,
    },
    {
      done: referencesCount > 0,
      label: "Sumar una referencia",
      why: "Alguien que responda por vos genera confianza inmediata.",
      href: "/perfil",
      weight: 10,
    },
  ];

  const score = steps.reduce((acc, s) => acc + (s.done ? s.weight : 0), 0);
  const pending = steps.filter((s) => !s.done);
  const complete = pending.length === 0;

  // El color acompaña al número: rojo no ayuda a nadie que recién arranca.
  const tone =
    score >= 80
      ? { bar: "bg-success", text: "text-success", label: "Excelente" }
      : score >= 50
        ? { bar: "bg-primary", text: "text-primary", label: "Va bien" }
        : { bar: "bg-warning", text: "text-warning", label: "Recién empieza" };

  return (
    <div className="card p-5 animate-rise">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold text-primary-dark">
            Fuerza de tu perfil
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {complete
              ? "Perfil completo. Así te ven las empresas."
              : `${pending.length} ${pending.length === 1 ? "paso" : "pasos"} para destacarte`}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-3xl font-bold leading-none ${tone.text}`}>
            {score}
            <span className="text-base">%</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">{tone.label}</p>
        </div>
      </div>

      <div className="h-2 rounded-full bg-gray-100 overflow-hidden mt-3">
        <div
          className={`h-full rounded-full ${tone.bar} animate-fill`}
          style={{ width: `${score}%` }}
        />
      </div>

      {!complete && (
        <ul className="mt-4 space-y-1.5">
          {pending.slice(0, 3).map((s) => (
            <li key={s.label}>
              <Link
                href={s.href}
                className="flex items-center gap-3 px-2 py-2 -mx-2 rounded-xl press active:bg-surface"
              >
                <span className="w-7 h-7 shrink-0 rounded-full border-2 border-dashed border-gray-300" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-gray-800">
                    {s.label}
                  </span>
                  <span className="block text-xs text-gray-400">{s.why}</span>
                </span>
                <span className="text-[11px] font-semibold text-primary shrink-0">
                  +{s.weight}%
                </span>
                <ChevronRight size={16} className="text-gray-300 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {complete && (
        <p className="mt-4 flex items-center gap-2 text-sm text-success">
          <span className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center animate-pop">
            <Check size={16} />
          </span>
          No te falta nada. Ahora sí, a postularte.
        </p>
      )}
    </div>
  );
}
