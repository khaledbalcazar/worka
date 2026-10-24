"use client";

import { useState } from "react";
import { FAQS } from "@/lib/evaluar/faqs";


export default function Faq() {
  const [abierta, setAbierta] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[rgba(29,34,38,.08)] border-y border-[rgba(29,34,38,.08)]">
      {FAQS.map((f, i) => {
        const open = abierta === i;
        return (
          <div key={f.q}>
            <button
              onClick={() => setAbierta(open ? null : i)}
              aria-expanded={open}
              className="w-full text-left py-5 flex items-start justify-between gap-4 group"
            >
              <span
                className={`font-medium transition-colors ${
                  open ? "text-[#1d2226]" : "text-[#5f5f5f] group-hover:text-[#1d2226]"
                }`}
              >
                {f.q}
              </span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`shrink-0 mt-0.5 text-[var(--color-accent)] transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {open && (
              <p className="text-sm text-[#5f5f5f] leading-relaxed pb-5 pr-8 animate-rise">
                {f.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
