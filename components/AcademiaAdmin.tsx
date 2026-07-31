"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Course, Lesson } from "@/lib/types";
import {
  deleteCourse,
  deleteLesson,
  getCourseLessonsClient,
  saveCourse,
  saveLesson,
} from "@/app/actions";

const EMPTY_COURSE = {
  id: undefined as string | undefined,
  slug: "",
  title: "",
  description: "",
  cover_url: "",
  category: "Entrevistas",
  level: "Básico" as "Básico" | "Intermedio" | "Avanzado",
  status: "borrador" as "borrador" | "publicado",
  sort: 0,
};

const EMPTY_LESSON = {
  id: undefined as string | undefined,
  course_id: "",
  section: "",
  title: "",
  content: "",
  video_url: "",
  duration_min: 5,
  sort: 0,
};

export default function AcademiaAdmin({
  courses: initialCourses,
}: {
  courses: Course[];
}) {
  const [courses, setCourses] = useState(initialCourses);
  const [view, setView] = useState<"list" | "course">("list");
  const [courseDraft, setCourseDraft] = useState({ ...EMPTY_COURSE });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonDraft, setLessonDraft] = useState({ ...EMPTY_LESSON });
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function flash(msg: string) {
    setNotice(msg);
    setError(null);
    setTimeout(() => setNotice(null), 4000);
  }

  function newCourse() {
    setCourseDraft({ ...EMPTY_COURSE, sort: courses.length + 1 });
    setLessons([]);
    setView("course");
    setError(null);
  }

  function openCourse(c: Course) {
    setCourseDraft({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      cover_url: c.cover_url ?? "",
      category: c.category,
      level: c.level,
      status: c.status,
      sort: c.sort,
    });
    setError(null);
    startTransition(async () => {
      const ls = await getCourseLessonsClient(c.id);
      setLessons(ls);
      setView("course");
    });
  }

  function saveTheCourse() {
    setError(null);
    startTransition(async () => {
      const r = await saveCourse(courseDraft);
      if (!r.ok) return setError(r.error ?? "No pudimos guardar.");
      flash("💾 Curso guardado.");
      if (r.id && !courseDraft.id)
        setCourseDraft((d) => ({ ...d, id: r.id }));
      location.reload();
    });
  }

  function removeCourse(id: string) {
    setCourses((c) => c.filter((x) => x.id !== id));
    startTransition(() => {
      deleteCourse(id);
    });
  }

  function newLesson() {
    setLessonDraft({
      ...EMPTY_LESSON,
      course_id: courseDraft.id ?? "",
      sort: lessons.length + 1,
      section: lessons[lessons.length - 1]?.section ?? "",
    });
    setShowLessonForm(true);
  }

  function editLesson(l: Lesson) {
    setLessonDraft({
      id: l.id,
      course_id: l.course_id,
      section: l.section,
      title: l.title,
      content: l.content,
      video_url: l.video_url ?? "",
      duration_min: l.duration_min,
      sort: l.sort,
    });
    setShowLessonForm(true);
  }

  function saveTheLesson() {
    setError(null);
    if (!courseDraft.id) {
      setError("Primero guardá el curso; después agregá lecciones.");
      return;
    }
    startTransition(async () => {
      const r = await saveLesson({ ...lessonDraft, course_id: courseDraft.id! });
      if (!r.ok) return setError(r.error ?? "No pudimos guardar.");
      flash("💾 Lección guardada.");
      setShowLessonForm(false);
      const ls = await getCourseLessonsClient(courseDraft.id!);
      setLessons(ls);
    });
  }

  function removeLesson(id: string) {
    setLessons((l) => l.filter((x) => x.id !== id));
    startTransition(() => {
      deleteLesson(id);
    });
  }

  if (view === "course") {
    return (
      <div className="max-w-4xl space-y-4">
        {error && (
          <div className="card px-5 py-3 bg-red-50 border-red-100 text-sm text-danger">
            {error}
          </div>
        )}
        {notice && (
          <div className="card px-5 py-3 bg-emerald-50 border-emerald-100 text-sm text-emerald-800">
            {notice}
          </div>
        )}

        <button
          className="text-sm text-primary font-medium"
          onClick={() => setView("list")}
        >
          ← Volver a los cursos
        </button>

        {/* Datos del curso */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-primary-dark">Datos del curso</h2>
          <div>
            <label className="label">Título *</label>
            <input
              className="input"
              value={courseDraft.title}
              onChange={(e) =>
                setCourseDraft((d) => ({ ...d, title: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea
              className="input min-h-20"
              value={courseDraft.description}
              onChange={(e) =>
                setCourseDraft((d) => ({ ...d, description: e.target.value }))
              }
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Categoría</label>
              <input
                className="input"
                placeholder="Entrevistas, Habilidades…"
                value={courseDraft.category}
                onChange={(e) =>
                  setCourseDraft((d) => ({ ...d, category: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="label">Nivel</label>
              <select
                className="input"
                value={courseDraft.level}
                onChange={(e) =>
                  setCourseDraft((d) => ({
                    ...d,
                    level: e.target.value as typeof d.level,
                  }))
                }
              >
                <option>Básico</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
              </select>
            </div>
            <div>
              <label className="label">Orden</label>
              <input
                type="number"
                className="input"
                value={courseDraft.sort}
                onChange={(e) =>
                  setCourseDraft((d) => ({
                    ...d,
                    sort: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div>
            <label className="label">Imagen de portada (URL, opcional)</label>
            <input
              className="input"
              placeholder="https://…"
              value={courseDraft.cover_url}
              onChange={(e) =>
                setCourseDraft((d) => ({ ...d, cover_url: e.target.value }))
              }
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                className="w-5 h-5 accent-primary"
                checked={courseDraft.status === "publicado"}
                onChange={(e) =>
                  setCourseDraft((d) => ({
                    ...d,
                    status: e.target.checked ? "publicado" : "borrador",
                  }))
                }
              />
              Publicado (visible en la Academia)
            </label>
            <button
              className="btn-primary"
              disabled={pending || !courseDraft.title.trim()}
              onClick={saveTheCourse}
            >
              {pending ? "Guardando…" : "Guardar curso"}
            </button>
          </div>
        </div>

        {/* Lecciones */}
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="font-bold text-primary-dark">
              Lecciones ({lessons.length})
            </h2>
            <button
              className="btn-secondary text-xs"
              onClick={() => {
                newLesson();
              }}
            >
              {showLessonForm ? "Nueva lección" : "➕ Agregar lección"}
            </button>
          </div>

          {!courseDraft.id && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-3">
              Guardá el curso primero para poder agregarle lecciones.
            </p>
          )}

          {showLessonForm && (
            <div className="border border-gray-100 rounded-2xl p-4 mb-4 space-y-3 bg-surface">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Sección / módulo</label>
                  <input
                    className="input"
                    placeholder="Ej: Antes de la entrevista"
                    value={lessonDraft.section}
                    onChange={(e) =>
                      setLessonDraft((l) => ({ ...l, section: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="label">Título de la lección *</label>
                  <input
                    className="input"
                    value={lessonDraft.title}
                    onChange={(e) =>
                      setLessonDraft((l) => ({ ...l, title: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="label">Duración (min)</label>
                  <input
                    type="number"
                    className="input"
                    value={lessonDraft.duration_min}
                    onChange={(e) =>
                      setLessonDraft((l) => ({
                        ...l,
                        duration_min: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="label">Orden</label>
                  <input
                    type="number"
                    className="input"
                    value={lessonDraft.sort}
                    onChange={(e) =>
                      setLessonDraft((l) => ({
                        ...l,
                        sort: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="label">Video (URL de YouTube, opcional)</label>
                <input
                  className="input"
                  placeholder="https://youtube.com/…"
                  value={lessonDraft.video_url}
                  onChange={(e) =>
                    setLessonDraft((l) => ({ ...l, video_url: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Contenido</label>
                <textarea
                  className="input min-h-56 font-mono text-sm"
                  placeholder={"## Subtítulo\n\nUn párrafo. Podés usar **negrita**, listas con - y citas con >."}
                  value={lessonDraft.content}
                  onChange={(e) =>
                    setLessonDraft((l) => ({ ...l, content: e.target.value }))
                  }
                />
                <p className="text-xs text-gray-400 mt-1">
                  Formato: <b>## </b>título · <b>- </b>lista · <b>&gt; </b>cita ·{" "}
                  <b>**negrita**</b>
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="btn-secondary"
                  onClick={() => setShowLessonForm(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn-primary"
                  disabled={pending || !lessonDraft.title.trim()}
                  onClick={saveTheLesson}
                >
                  {pending ? "Guardando…" : "Guardar lección"}
                </button>
              </div>
            </div>
          )}

          {lessons.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Todavía no hay lecciones.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {lessons.map((l) => (
                <div
                  key={l.id}
                  className="py-2.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary-dark truncate">
                      {l.sort}. {l.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {l.section || "Sin sección"} · {l.duration_min}′
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      className="text-sm text-primary font-medium"
                      onClick={() => editLesson(l)}
                    >
                      Editar
                    </button>
                    <button
                      className="text-sm text-gray-400 hover:text-danger"
                      onClick={() => removeLesson(l.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Lista de cursos
  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            🎓 Academia Worka
          </h1>
          <p className="text-sm text-gray-500">
            Creá cursos con lecciones para tus usuarios.
          </p>
        </div>
        <button className="btn-primary" onClick={newCourse}>
          ➕ Nuevo curso
        </button>
      </div>

      {notice && (
        <div className="card px-5 py-3 bg-emerald-50 border-emerald-100 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">
          Todavía no creaste ningún curso.
        </div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {courses.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-primary-dark truncate">
                  {c.title}
                </p>
                <p className="text-xs text-gray-400">
                  {c.category} · {c.level}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`chip ${
                    c.status === "publicado"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {c.status}
                </span>
                {c.status === "publicado" && (
                  <Link
                    href={`/academia/${c.slug}`}
                    target="_blank"
                    className="text-sm text-gray-500 hover:text-primary"
                  >
                    Ver
                  </Link>
                )}
                <button
                  className="text-sm text-primary font-medium"
                  onClick={() => openCourse(c)}
                >
                  Editar
                </button>
                <button
                  className="text-sm text-gray-400 hover:text-danger"
                  onClick={() => removeCourse(c.id)}
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
