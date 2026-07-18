import { notFound } from "next/navigation";
import { getJobById } from "@/lib/data";
import JobEditForm from "@/components/JobEditForm";

export const metadata = { title: "Editar vacante" };

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) notFound();
  return <JobEditForm job={job} />;
}
