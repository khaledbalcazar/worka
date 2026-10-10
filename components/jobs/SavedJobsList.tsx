"use client";

import { useState } from "react";
import type { JobWithCompany } from "@/lib/types";
import JobResultCard from "./JobResultCard";

// Lista de guardados: al quitar uno, la fila queda (con el marcador vacío)
// para poder volver a guardarlo si fue sin querer.
export default function SavedJobsList({ jobs, appliedIds }: { jobs: JobWithCompany[]; appliedIds: string[] }) {
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  return (
    <ul className="li-items">
      {jobs.map((job) => (
        <JobResultCard
          key={job.id}
          job={job}
          linkOnly
          selected={false}
          saved={saved[job.id] ?? true}
          applied={appliedIds.includes(job.id)}
          loggedIn
          requiresEvaluation={false}
          onSelect={() => {}}
          onSaved={(value) => setSaved((s) => ({ ...s, [job.id]: value }))}
        />
      ))}
    </ul>
  );
}
