import AdminPageHead from "@/components/admin/AdminPageHead";
import { requireAdmin } from "@/lib/admin-stats";
import AcademiaAdmin from "@/components/AcademiaAdmin";
import { getAllCourses } from "@/lib/data";

export const metadata = { title: "Academia" };

export default async function AdminAcademiaPage() {
  await requireAdmin("/admin/academia");

  const courses = await getAllCourses();

  return (
    <>
      <AdminPageHead title="Academia" description="Cursos gratuitos con certificado para los candidatos." />
      <AcademiaAdmin courses={courses} />
    </>
  );
}
