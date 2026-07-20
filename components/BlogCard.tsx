import Link from "next/link";
import type { BlogPost } from "@/lib/types";
import { formatDate } from "@/lib/format";

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="card overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
    >
      <div className="h-40 bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden">
        {post.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/90 text-4xl font-extrabold">
            Worka
          </div>
        )}
        <span
          className={`absolute top-3 left-3 chip ${
            post.audience === "empresas"
              ? "bg-white/90 text-primary-dark"
              : "bg-white/90 text-primary"
          }`}
        >
          {post.audience === "empresas" ? "Para empresas" : "Para personas"}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-primary-dark leading-snug group-hover:text-primary">
          {post.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1.5 line-clamp-3 flex-1">
          {post.excerpt}
        </p>
        <p className="text-xs text-gray-400 mt-3">
          {post.published_at ? formatDate(post.published_at) : ""} · {post.author}
        </p>
      </div>
    </Link>
  );
}
