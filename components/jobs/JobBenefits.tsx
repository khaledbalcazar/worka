import {
  BadgeDollarSign,
  Bus,
  Clock,
  GraduationCap,
  HeartPulse,
  Gift,
  Shirt,
  ShieldPlus,
  TrendingUp,
  UtensilsCrossed,
  Fuel,
  type LucideIcon,
} from "lucide-react";

// Ícono según palabras clave del beneficio. Los textos son los que cargó la
// empresa; acá solo se elige el dibujo.
const RULES: [RegExp, LucideIcon][] = [
  [/\bips\b|seguro|jubila/i, ShieldPlus],
  [/salud|m[eé]dic|clinic/i, HeartPulse],
  [/almuerzo|comida|comedor|refrigerio|vale/i, UtensilsCrossed],
  [/uniforme|ropa/i, Shirt],
  [/ascenso|crecimiento|carrera|promoci/i, TrendingUp],
  [/capacitaci|curso|formaci|beca/i, GraduationCap],
  [/combustible|nafta/i, Fuel],
  [/transporte|pasaje|colectivo|movilidad/i, Bus],
  [/bono|comisi|propina|premio|aguinaldo|incentivo/i, BadgeDollarSign],
  [/horario|flexib|franco|vacacion/i, Clock],
];

function iconFor(text: string): LucideIcon {
  return RULES.find(([re]) => re.test(text))?.[1] ?? Gift;
}

export default function JobBenefits({ benefits, title = "¿Qué ofrece la empresa?" }: { benefits: string[]; title?: string }) {
  if (benefits.length === 0) return null;
  return (
    <section aria-labelledby="job-benefits-title">
      <h2 id="job-benefits-title" className="job-block-title">{title}</h2>
      <ul className="job-benefits">
        {benefits.map((b) => {
          const Icon = iconFor(b);
          return (
            <li key={b}>
              <span><Icon size={19} /></span>
              <p>{b}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
