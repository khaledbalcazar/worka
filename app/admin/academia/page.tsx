import Link from "next/link";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import AcademiaAdmin from "@/components/AcademiaAdmin";
import { getAllCourses, isLive } from "@/lib/data";
import { getServerClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata = { title: "Academia — Backoffice" };

export default async function AdminAcademiaPage() {
  if (isLive()) {
    const user = await getCurrentUser();
    if (!user) redirect("/ingresar?next=/admin/academia");
    const supabase = await getServerClient();
    const { data: profile } = await supabase!
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role !== "admin") redirect("/");
  }

  const courses = await getAllCourses();

  return (
    <div className="flex-1 bg-surface min-h-screen">
      <header className="bg-primary-dark text-white px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo light href="/admin" />
          <span className="chip bg-white/10 text-blue-200">Academia</span>
        </div>
        <Link href="/admin" className="text-sm text-blue-200 underline">
          ← Backoffice
        </Link>
      </header>
      <main className="max-w-6xl mx-auto p-4 lg:p-8">
        <AcademiaAdmin courses={courses} />
      </main>
    </div>
  );
}
