"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, CheckCircle2 } from "lucide-react";
import { searchEmployersAction } from "@/app/actions";

type Result = {
  slug: string;
  name: string;
  company_id: string | null;
  logo_url: string | null;
};

// Busca un empleador (registrado o externo) y lleva a su ficha de opiniones.
export default function EmployerSearch({ country }: { country: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [pending, start] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onChange(value: string) {
    setQ(value);
    if (timer.current) clearTimeout(timer.current);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(() => {
      start(async () => {
        const r = await searchEmployersAction(value, country);
        setResults(r);
      });
    }, 300);
  }

  function go(r: Result) {
    const params = new URLSearchParams({ name: r.name });
    if (r.company_id) params.set("cid", r.company_id);
    router.push(`/opiniones/${r.slug}?${params}`);
  }

  // Permite ir a un empleador nuevo tipeado a mano (sin resultados).
  function goManual() {
    if (q.trim().length < 2) return;
    const slug = q
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    router.push(`/opiniones/${slug}?name=${encodeURIComponent(q.trim())}`);
  }

  return (
    <div className="relative">
      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        className="input pl-9"
        placeholder="Buscá una empresa para ver o dejar opiniones…"
        value={q}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results.length === 0) goManual();
        }}
      />
      {q.trim().length >= 2 && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
          {pending && (
            <p className="px-4 py-3 text-sm text-gray-400">Buscando…</p>
          )}
          {!pending &&
            results.map((r) => (
              <button
                key={r.slug}
                onClick={() => go(r)}
                className="w-full text-left px-4 py-2.5 hover:bg-surface flex items-center gap-2 text-sm"
              >
                <span className="font-medium text-primary-dark">{r.name}</span>
                {r.company_id && (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          {!pending && (
            <button
              onClick={goManual}
              className="w-full text-left px-4 py-2.5 hover:bg-surface text-sm text-primary border-t border-gray-100"
            >
              Opinar sobre “{q.trim()}” →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
