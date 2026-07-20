import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getPublishedPosts } from "@/lib/data";
import { SITE_URL } from "@/lib/supabase/config";
import { formatDate } from "@/lib/format";
import SiteHeader from "@/components/SiteHeader";
import BlogContent from "@/components/BlogContent";
import BlogCta from "@/components/BlogCta";
import BlogCard from "@/components/BlogCard";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Artículo no encontrado" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `/blog/${post.slug}`,
      ...(post.cover_url ? { images: [{ url: post.cover_url }] } : {}),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post || post.status !== "publicado") notFound();

  const others = (await getPublishedPosts())
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  // JSON-LD Article para el SEO (Google puede mostrarlo enriquecido).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "Worka" },
    mainEntityOfPage: `${SITE_URL.replace(/\/$/, "")}/blog/${post.slug}`,
    ...(post.cover_url ? { image: post.cover_url } : {}),
  };

  return (
    <main className="flex-1 bg-surface min-h-screen flex flex-col">
      <SiteHeader active="/blog" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <Link href="/blog" className="text-sm text-primary font-medium">
          ← Volver al blog
        </Link>

        <span
          className={`chip mt-4 ${
            post.audience === "empresas"
              ? "bg-blue-50 text-primary-dark"
              : "bg-blue-50 text-primary"
          }`}
        >
          {post.audience === "empresas" ? "Para empresas" : "Para personas"}
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-dark leading-tight mt-3">
          {post.title}
        </h1>
        <p className="text-sm text-gray-400 mt-3">
          {post.published_at ? formatDate(post.published_at) : ""} · {post.author}
        </p>

        {post.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full rounded-2xl mt-6 object-cover max-h-96"
          />
        )}

        <div className="card p-6 sm:p-8 mt-6">
          <BlogContent content={post.content} />
        </div>

        <div className="mt-8">
          <BlogCta audience={post.audience} />
        </div>
      </article>

      {others.length > 0 && (
        <section className="max-w-5xl mx-auto w-full px-4 sm:px-6 pb-16">
          <h2 className="font-bold text-primary-dark text-lg mb-4">
            Seguí leyendo
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {others.map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
