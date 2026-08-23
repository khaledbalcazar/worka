"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { History } from "lucide-react";
import { readRecentJobs, type RecentJob } from "@/lib/recent-jobs";

// Carrusel de "seguí donde estabas". Mucha gente mira una vacante, vuelve al
// feed a comparar y después no encuentra la primera: con los filtros puestos y
// el scroll perdido, buscarla de nuevo es un fastidio.
//
// Se lee con useSyncExternalStore para no volcar localStorage con setState en
// un efecto (render en cascada) ni desajustar la hidratación: el servidor no
// tiene acceso al almacenamiento del teléfono.
function subscribe() {
  return () => {};
}

let cache: RecentJob[] = [];
let cacheRaw = "";

function getSnapshot(): RecentJob[] {
  // La referencia debe ser estable entre renders o useSyncExternalStore entra
  // en un bucle: se cachea contra el texto crudo del almacenamiento.
  const raw = localStorage.getItem("worka_recent_jobs") ?? "";
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cache = readRecentJobs();
  }
  return cache;
}

const EMPTY: RecentJob[] = [];
function getServerSnapshot(): RecentJob[] {
  return EMPTY;
}

export default function RecentJobs({ excludeId }: { excludeId?: string }) {
  const all = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const jobs = all.filter((j) => j.id !== excludeId).slice(0, 6);

  if (jobs.length === 0) return null;

  return (
    <section className="animate-rise">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
        <History size={14} /> Seguí donde estabas
      </h2>
      <div className="flex gap-2 overflow-x-auto scroll-thin pb-1 mt-2 -mx-4 px-4">
        {jobs.map((j) => (
          <Link
            key={j.id}
            href={j.external ? `/empleo/externo/${j.id}` : `/empleo/${j.id}`}
            className="card press shrink-0 w-44 p-3"
          >
            <p className="text-sm font-medium text-primary-dark leading-snug line-clamp-2">
              {j.title}
            </p>
            <p className="text-xs text-gray-400 mt-1 truncate">{j.company}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
