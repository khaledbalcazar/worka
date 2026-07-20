"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { BlogPost } from "@/lib/types";
import { formatDate } from "@/lib/format";
import {
  deleteBlogPost,
  saveBlogPost,
  uploadBlogCover,
} from "@/app/actions";
import BlogContent from "@/components/BlogContent";

const EMPTY = {
  id: undefined as string | undefined,
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  cover_url: null as string | null,
  audience: "personas" as "personas" | "empresas",
  status: "borrador" as "borrador" | "publicado",
};

export default function BlogEditor({ posts }: { posts: BlogPost[] }) {
  const [list, setList] = useState(posts);
  const [draft, setDraft] = useState({ ...EMPTY });
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function flash(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  }

  function edit(post: BlogPost) {
    setDraft({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      cover_url: post.cover_url,
      audience: post.audience,
      status: post.status,
    });
    setEditing(true);
    setPreview(false);
    setError(null);
  }

  function newPost() {
    setDraft({ ...EMPTY });
    setEditing(true);
    setPreview(false);
    setError(null);
  }

  function save(status: "borrador" | "publicado") {
    setError(null);
    startTransition(async () => {
      const result = await saveBlogPost({ ...draft, status });
      if (!result.ok) {
        setError(result.error ?? "No pudimos guardar.");
        return;
      }
      flash(
        status === "publicado"
          ? "✅ Artículo publicado. Ya está en el blog y avisamos a Bing."
          : "💾 Borrador guardado."
      );
      setEditing(false);
      // Refleja el cambio en la lista local sin recargar.
      const updated: BlogPost = {
        id: draft.id ?? `local-${Date.now()}`,
        slug: result.slug ?? draft.slug,
        title: draft.title,
        excerpt: draft.excerpt,
        content: draft.content,
        cover_url: draft.cover_url,
        audience: draft.audience,
        status,
        author: "Equipo Worka",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: status === "publicado" ? new Date().toISOString() : null,
      };
      setList((prev) => {
        const exists = prev.some((p) => p.id === updated.id);
        return exists
          ? prev.map((p) => (p.id === updated.id ? updated : p))
          : [updated, ...prev];
      });
    });
  }

  function remove(post: BlogPost) {
    setList((prev) => prev.filter((p) => p.id !== post.id));
    startTransition(() => {
      deleteBlogPost(post.id);
    });
  }

  function handleCover(file: File | undefined) {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    startTransition(async () => {
      const result = await uploadBlogCover(fd);
      if (result.ok && result.url)
        setDraft((d) => ({ ...d, cover_url: result.url! }));
      else flash(result.error ?? "No pudimos subir la portada.");
    });
  }

  if (editing) {
    return (
      <div className="max-w-4xl space-y-4 pb-10">
        <div className="flex items-center justify-between gap-3">
          <button
            className="text-sm text-primary font-medium"
            onClick={() => setEditing(false)}
          >
            ← Volver a la lista
          </button>
          <button
            className="text-sm text-gray-500"
            onClick={() => setPreview((v) => !v)}
          >
            {preview ? "✏️ Editar" : "👁️ Vista previa"}
          </button>
        </div>

        {preview ? (
          <div className="card p-6">
            <span className="chip bg-blue-50 text-primary">
              {draft.audience === "empresas" ? "Para empresas" : "Para personas"}
            </span>
            <h1 className="text-2xl font-extrabold text-primary-dark mt-3">
              {draft.title || "Sin título"}
            </h1>
            <div className="mt-4">
              <BlogContent content={draft.content} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              <div>
                <label className="label">Título *</label>
                <input
                  className="input"
                  placeholder="Ej: Cómo buscar trabajo en Paraguay"
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, title: e.target.value }))
                  }
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Enlace (slug)</label>
                  <input
                    className="input"
                    placeholder="se-genera-solo-del-titulo"
                    value={draft.slug}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, slug: e.target.value }))
                    }
                  />
                  <p className="text-xs text-gray-400 mt-0.5">
                    Vacío = se genera del título. worka.click/blog/<b>{draft.slug || "…"}</b>
                  </p>
                </div>
                <div>
                  <label className="label">¿Para quién es?</label>
                  <select
                    className="input"
                    value={draft.audience}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        audience: e.target.value as "personas" | "empresas",
                      }))
                    }
                  >
                    <option value="personas">
                      Para personas (CTA: buscar empleos)
                    </option>
                    <option value="empresas">
                      Para empresas (CTA: publicar vacante)
                    </option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Resumen (aparece en las tarjetas)</label>
                <textarea
                  className="input min-h-16"
                  value={draft.excerpt}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, excerpt: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Portada</label>
                <div className="flex items-center gap-2">
                  {draft.cover_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={draft.cover_url}
                      alt="Portada"
                      className="h-12 w-20 rounded object-cover bg-surface"
                    />
                  )}
                  <input
                    className="input flex-1"
                    placeholder="URL de la imagen o subí una →"
                    value={draft.cover_url ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, cover_url: e.target.value }))
                    }
                  />
                  <input
                    ref={coverInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleCover(e.target.files?.[0])}
                  />
                  <button
                    className="btn-secondary shrink-0 text-xs"
                    disabled={pending}
                    onClick={() => coverInput.current?.click()}
                  >
                    📤 Subir
                  </button>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <label className="label">Contenido</label>
              <textarea
                className="input min-h-80 font-mono text-sm leading-relaxed"
                placeholder={
                  "Escribí acá.\n\n## Un subtítulo\n\nUn párrafo normal. Podés poner **negrita**.\n\n- Un ítem de lista\n- Otro ítem\n\n> Una cita destacada"
                }
                value={draft.content}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, content: e.target.value }))
                }
              />
              <p className="text-xs text-gray-400 mt-1">
                Formato: <b>## </b>título · <b>### </b>subtítulo · <b>- </b>lista ·
                {" "}<b>&gt; </b>cita · <b>**negrita**</b>
              </p>
            </div>

            {error && (
              <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                className="btn-secondary"
                disabled={pending || !draft.title.trim()}
                onClick={() => save("borrador")}
              >
                Guardar borrador
              </button>
              <button
                className="btn-primary px-6"
                disabled={pending || !draft.title.trim()}
                onClick={() => save("publicado")}
              >
                {pending ? "Guardando…" : "Publicar"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">📝 Blog</h1>
          <p className="text-sm text-gray-500">
            Escribí artículos para atraer tráfico desde Google.
          </p>
        </div>
        <button className="btn-primary" onClick={newPost}>
          ➕ Nuevo artículo
        </button>
      </div>

      {notice && (
        <div className="card px-5 py-3 bg-emerald-50 border-emerald-100 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      {list.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">
          Todavía no escribiste ningún artículo.
        </div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {list.map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-primary-dark truncate">
                  {p.title}
                </p>
                <p className="text-xs text-gray-400">
                  {p.audience === "empresas" ? "Empresas" : "Personas"} ·{" "}
                  {p.status === "publicado"
                    ? `publicado ${p.published_at ? formatDate(p.published_at) : ""}`
                    : "borrador"}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`chip ${
                    p.status === "publicado"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {p.status}
                </span>
                {p.status === "publicado" && (
                  <Link
                    href={`/blog/${p.slug}`}
                    target="_blank"
                    className="text-sm text-gray-500 hover:text-primary"
                  >
                    Ver
                  </Link>
                )}
                <button
                  className="text-sm text-primary font-medium"
                  onClick={() => edit(p)}
                >
                  Editar
                </button>
                <button
                  className="text-sm text-gray-400 hover:text-danger"
                  onClick={() => remove(p)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
