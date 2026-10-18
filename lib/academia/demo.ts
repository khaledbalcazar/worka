import "server-only";
import pack from "@/lib/academia/cursos-2026-10.json";
import * as mock from "@/lib/mock-data";
import type { Course, Lesson } from "@/lib/types";

// Modo demo: los cursos de ejemplo más el paquete de octubre 2026, desde el
// mismo JSON que genera la migración 052 (scripts/academia-import.mjs).
// Vive acá y no en mock-data porque ese archivo lo importan componentes del
// navegador: el JSON pesa y no tiene por qué viajar al cliente.

const STAMP = "2026-10-17T12:00:00.000Z";

const packCourses: Course[] = pack.courses.map(({ lessons: _l, ...c }) => {
  void _l;
  return {
    ...c,
    id: `crs-${c.slug}`,
    level: c.level as Course["level"],
    cover_url: null,
    status: "publicado",
    premium: false,
    created_at: STAMP,
    updated_at: STAMP,
  };
});

const packLessons: Lesson[] = pack.courses.flatMap((c) =>
  c.lessons.map((l) => ({
    ...l,
    id: `${c.slug}--${l.slug}`,
    course_id: `crs-${c.slug}`,
    video_url: null,
    practice: l.practice ? { ...l.practice, type: l.practice.type as "texto" | "checklist" } : null,
    created_at: STAMP,
  }))
);

export const demoCourses: Course[] = [...mock.courses, ...packCourses];

export function demoLessonsFor(courseId: string): Lesson[] {
  return [...mock.lessonsFor(courseId), ...packLessons.filter((l) => l.course_id === courseId)];
}
