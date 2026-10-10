import type { Company, FilterQuestion } from "@/lib/types";

// "¿Cómo es el proceso de selección?": los pasos reales de una postulación en
// Worka. Los plazos solo se muestran si la empresa tiene el sello de
// respuesta rápida.
export default function SelectionProcess({
  company,
  questions,
  hasEvaluation = false,
}: {
  company: Pick<Company, "trade_name" | "fast_responder">;
  questions: FilterQuestion[];
  hasEvaluation?: boolean;
}) {
  const steps = [
    {
      title: "Postulación",
      text: questions.length
        ? `Te postulás con 1 clic y respondés ${questions.length} ${questions.length === 1 ? "pregunta" : "preguntas"} de Sí o No.`
        : "Te postulás con 1 clic, con tu perfil y tu CV de Worka.",
    },
    hasEvaluation
      ? { title: "Evaluación", text: "La empresa pide unas pruebas cortas en Worka Evaluar antes de revisar tu perfil." }
      : {
          title: "Revisión",
          text: company.fast_responder
            ? `${company.trade_name} suele responder en menos de 72 horas.`
            : `${company.trade_name} revisa tu perfil. Ves el estado en Mis postulaciones.`,
        },
    { title: "Contacto", text: "Si avanzás, la empresa te escribe para coordinar la entrevista." },
  ];
  return (
    <section aria-labelledby="job-process-title">
      <h2 id="job-process-title" className="job-block-title">¿Cómo es el proceso de selección en Worka?</h2>
      <ol className="job-process">
        {steps.map((s, i) => (
          <li key={s.title}>
            <p><span>{i + 1}</span>{s.title}</p>
            <small>{s.text}</small>
          </li>
        ))}
      </ol>
    </section>
  );
}
