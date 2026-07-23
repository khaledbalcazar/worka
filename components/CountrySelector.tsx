"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { COUNTRIES, DEFAULT_COUNTRY, countryByCode } from "@/lib/countries";
import { setCountry } from "@/app/actions";

// Selector de país con banderitas. Fija la cookie y refresca la página para
// que toda la home se recargue en el contexto del país elegido.
export default function CountrySelector({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(DEFAULT_COUNTRY);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Refleja el país guardado en la cookie al montar.
  useEffect(() => {
    const code = document.cookie
      .split("; ")
      .find((c) => c.startsWith("worka_country="))
      ?.split("=")[1];
    if (code) setCurrent(countryByCode(code));
  }, []);

  // Cierra el menú al hacer clic afuera.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function choose(code: string) {
    setCurrent(countryByCode(code));
    setOpen(false);
    startTransition(async () => {
      await setCountry(code);
      router.refresh();
    });
  }

  const dark = variant === "dark";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        aria-label="Cambiar de país"
        className={`inline-flex items-center gap-1.5 text-sm rounded-xl px-2.5 py-2 transition-colors ${
          dark
            ? "text-white/80 hover:bg-white/10"
            : "text-gray-600 hover:bg-white"
        } ${pending ? "opacity-60" : ""}`}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline">{current.name}</span>
        <ChevronDown size={14} className={open ? "rotate-180" : ""} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-gray-100 shadow-lg py-1 min-w-48 z-50">
          <p className="px-4 py-1.5 text-[0.65rem] text-gray-400 uppercase tracking-widest">
            Elegí tu país
          </p>
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => choose(c.code)}
              className={`w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-surface ${
                c.code === current.code
                  ? "text-primary font-semibold"
                  : "text-gray-700"
              }`}
            >
              <span className="text-base leading-none">{c.flag}</span>
              {c.name}
              {c.code === current.code && (
                <span className="ml-auto text-primary">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
