"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, MapPin, Search, X } from "lucide-react";
import { findCity, normCity, searchCities } from "@/lib/cities";

// Selector de ciudad con buscador. Un <select> con 260 distritos es imposible
// de recorrer en el celular; acá se escribe «hohen» y aparece Hohenau, con su
// departamento al lado para distinguir homónimos. Si la ciudad no está en la
// lista, se puede usar lo escrito igual.
export default function CityPicker({
  value,
  onChange,
  country = "py",
  placeholder = "Buscá la ciudad",
  id,
  invalid = false,
}: {
  value: string;
  onChange: (city: string) => void;
  country?: string;
  placeholder?: string;
  id?: string;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();

  const results = useMemo(() => searchCities(country, query, 400), [country, query]);
  const typed = query.trim();
  const exact = typed ? findCity(country, typed) : null;
  // Opción de usar lo escrito cuando ninguna ciudad de la lista empieza así
  // (con «hohen» ya aparece Hohenau y no hace falta ofrecer «hohen»).
  const custom =
    typed.length >= 3 && !exact && !results.some((c) => normCity(c.name).startsWith(normCity(typed))) ? typed : null;
  const total = results.length + (custom ? 1 : 0);
  const selected = findCity(country, value);

  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function choose(city: string) {
    onChange(city);
    setOpen(false);
    setQuery("");
  }

  function openList() {
    setOpen(true);
    setQuery("");
    setActive(0);
    requestAnimationFrame(() => input.current?.focus());
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, total - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active < results.length) choose(results[active].name);
      else if (custom) choose(custom);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        id={id}
        onClick={() => (open ? setOpen(false) : openList())}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`input cursor-pointer flex items-center gap-2 text-left ${invalid ? "!border-red-400" : ""}`}
      >
        <MapPin size={16} className="text-slate-400 shrink-0" />
        {value ? (
          <span className="flex-1 min-w-0 truncate">
            {value}
            {selected && <span className="text-slate-400"> · {selected.region}</span>}
          </span>
        ) : (
          <span className="flex-1 text-slate-400">{placeholder}</span>
        )}
        {value ? (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Quitar ciudad"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="p-1 -m-1 rounded text-slate-400 hover:text-slate-700"
          >
            <X size={15} />
          </span>
        ) : (
          <ChevronDown size={16} className="text-slate-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.14)] overflow-hidden">
          <div className="flex items-center gap-2 px-3 border-b border-slate-100">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              ref={input}
              role="combobox"
              aria-controls={listId}
              aria-expanded
              aria-activedescendant={`${listId}-${active}`}
              aria-autocomplete="list"
              className="flex-1 min-w-0 py-3 text-base sm:text-sm outline-none bg-transparent"
              placeholder="Escribí la ciudad o el departamento"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKey}
            />
          </div>
          <ul ref={list} id={listId} role="listbox" className="max-h-72 overflow-y-auto py-1">
            {results.map((c, i) => {
              const isSel = normCity(c.name) === normCity(value);
              return (
                <li
                  key={`${c.region}-${c.name}`}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSel}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => choose(c.name)}
                  onMouseMove={() => setActive(i)}
                  className={`flex items-center justify-between gap-3 px-3 py-2 text-sm cursor-pointer ${
                    i === active ? "bg-blue-50" : ""
                  }`}
                >
                  <span className={`truncate ${isSel ? "font-semibold text-blue-700" : "text-slate-800"}`}>{c.name}</span>
                  <span className="flex items-center gap-2 shrink-0 text-xs text-slate-400">
                    {c.region}
                    {isSel && <Check size={14} className="text-blue-600" />}
                  </span>
                </li>
              );
            })}
            {custom && (
              <li
                id={`${listId}-${results.length}`}
                data-index={results.length}
                role="option"
                aria-selected={false}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => choose(custom)}
                onMouseMove={() => setActive(results.length)}
                className={`px-3 py-2 text-sm cursor-pointer border-t border-slate-100 ${
                  active === results.length ? "bg-blue-50" : ""
                }`}
              >
                Usar «<strong>{custom}</strong>»
                <span className="block text-xs text-slate-400">No está en la lista: se publica tal cual la escribiste.</span>
              </li>
            )}
            {total === 0 && <li className="px-3 py-3 text-sm text-slate-400">Seguí escribiendo…</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
