import Link from "next/link";
import { getMessagesByApplication, getMyApplications } from "@/lib/data";
import ChatClient, { type ChatThread } from "@/components/ChatClient";

export const metadata = { title: "Mensajes" };

// Chat interno: un hilo por postulación, sin salir de Worka.
export default async function MessagesPage() {
  const apps = await getMyApplications();

  const threads: ChatThread[] = await Promise.all(
    apps.map(async (app) => ({
      applicationId: app.id,
      jobTitle: app.job.title,
      companyName: app.job.company.trade_name,
      messages: await getMessagesByApplication(app.id),
    }))
  );

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
          Cuando te postules, podés chatear con la empresa desde acá.
        </p>
        <Link href="/empleos" className="btn-primary mt-4">
          Ver empleos
        </Link>
      </div>
    );
  }

  return <ChatClient threads={[...withActivity, ...rest]} />;
}
