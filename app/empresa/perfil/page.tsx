import Link from "next/link";
import {
  getCompanyMembers,
  getCompanyPosts,
  getCurrentCompany,
} from "@/lib/data";
import CompanyProfileEditor from "@/components/CompanyProfileEditor";

export const metadata = { title: "Perfil de empresa" };

export default async function CompanyProfilePage() {
  const company = await getCurrentCompany();

  if (!company) {
    return (
      <div className="max-w-md card p-8 text-center">
        <p className="font-semibold text-primary-dark">
          Primero registrá tu empresa
        </p>
        <Link href="/empresa/registro" className="btn-primary mt-4">
          Registrar mi empresa
        </Link>
      </div>
    );
  }

  const [posts, members] = await Promise.all([
    getCompanyPosts(company.id),
    getCompanyMembers(company.id),
  ]);
  return (
    <CompanyProfileEditor company={company} posts={posts} members={members} />
  );
}
