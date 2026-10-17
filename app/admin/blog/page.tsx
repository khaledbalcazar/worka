import AdminPageHead from "@/components/admin/AdminPageHead";
import { requireAdmin } from "@/lib/admin-stats";
import BlogEditor from "@/components/BlogEditor";
import { getAllBlogPosts } from "@/lib/data";

export const metadata = { title: "Blog" };

export default async function AdminBlogPage() {
  // Solo admin (mismo guard que /admin).
  await requireAdmin("/admin/blog");

  const posts = await getAllBlogPosts();

  return (
    <>
      <AdminPageHead title="Blog" description="Notas del blog de Worka: escribí, programá y publicá." />
      <BlogEditor posts={posts} />
    </>
  );
}
