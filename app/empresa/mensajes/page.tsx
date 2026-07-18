import Link from "next/link";
import { getCompanyThreads } from "@/lib/data";
import ChatClient, { type ChatThread } from "@/components/ChatClient";

export const metadata = { title: "Mensajes" };

// Chat de la empresa: responde a los candidatos sin salir de Worka.
export default async function CompanyMessagesPage() {
  const companyThreads = await getCompanyThreads();

  const threads: ChatThread[] = companyThreads.map((t) => ({
    applicationId: t.applicationId,
    jobTitle: t.jobTitle,
    companyName: t.candidateName, // el interlocutor de la empresa es el candidato
    messages: t.messages,
  }));

  // Conversaciones con actividad primero.
  const withActivity = threads.filter((t) => t.messages.length > 0);
  const rest = threads.filter((t) => t.messages.length === 0);

  if (threads.length === 0) {
    return (
      <div className="card p-10 text-center max-w-md mx-auto">
        <p className="text-4xl mb-3">💬</p>
        <p className="font-semibold text-primary-dark">
          Todavía no tenés conversaciones
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Cuando recibas postulaciones, podés chatear con cada candidato desde
          acá, sin compartir tu número.
        </p>
        <Link href="/empresa/vacantes/nueva" className="btn-primary mt-4">
          Publicar una vacante
        </Link>
      </div>
    );
  }

  return (
    <ChatClient threads={[...withActivity, ...rest]} viewAs="company" />
  );
}
