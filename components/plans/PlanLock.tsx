import Link from "next/link";
import { Crown } from "lucide-react";

// Aviso de función de un plan pago, con el camino para contratarla.
export default function PlanLock({
  title,
  text,
  href,
  cta,
  children,
}: {
  title: string;
  text: string;
  href: string;
  cta: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="plan-lock">
      <span className="plan-badge"><Crown size={13} /> Plan pago</span>
      <h2 className="text-lg font-semibold mt-1">{title}</h2>
      <p className="text-sm text-muted max-w-md">{text}</p>
      {children}
      <Link href={href} className="btn-primary mt-2">{cta}</Link>
    </section>
  );
}
