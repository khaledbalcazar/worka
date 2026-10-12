import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, XCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import HomeNav from "@/components/home/HomeNav";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Verificar certificado", robots: { index: false } };

type Cert = { code: string; full_name: string; course_title: string; issued_at: string };

// Verificación pública de certificados de Academia: cualquiera (una
// empresa, por ejemplo) confirma con el código que el certificado es real.
async function findCertificate(code: string): Promise<Cert | null> {
  const clean = code.trim().toUpperCase();
  if (!/^WK-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(clean)) return null;
  if (!isSupabaseConfigured()) {
    return clean === "WK-DEMO-0001"
      ? { code: clean, full_name: "María Fernanda González", course_title: "Preparate para tus entrevistas", issued_at: new Date().toISOString() }
      : null;
  }
  const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data } = await db
    .from("course_certificates")
    .select("code, full_name, course_title, issued_at")
    .eq("code", clean)
    .maybeSingle();
  return (data as Cert | null) ?? null;
}

export default async function VerifyCertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const cert = await findCertificate(decodeURIComponent(code));
  return (
    <main className="flex-1 bg-surface min-h-screen flex flex-col">
      <HomeNav />
      <div className="max-w-xl mx-auto w-full px-4 py-12">
        <div className="card p-6 sm:p-8 text-center">
          {cert ? (
            <>
              <BadgeCheck size={44} className="mx-auto text-success-ink" />
              <h1 className="text-2xl font-semibold mt-3">Certificado válido</h1>
              <p className="text-muted mt-2">
                <strong className="text-ink">{cert.full_name}</strong> completó el curso{" "}
                <strong className="text-ink">{cert.course_title}</strong> de Academia Worka el{" "}
                {new Date(cert.issued_at).toLocaleDateString("es-PY", { day: "numeric", month: "long", year: "numeric" })}.
              </p>
              <p className="text-xs text-muted mt-4 font-mono">{cert.code}</p>
            </>
          ) : (
            <>
              <XCircle size={44} className="mx-auto text-clay" />
              <h1 className="text-2xl font-semibold mt-3">No encontramos ese certificado</h1>
              <p className="text-muted mt-2">Revisá que el código esté bien escrito (por ejemplo WK-AB12-CD34).</p>
            </>
          )}
          <Link href="/academia" className="btn-secondary mt-6">Conocer la Academia</Link>
        </div>
      </div>
    </main>
  );
}
