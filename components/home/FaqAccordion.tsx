"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FaqAccordion({
  faqs,
}: {
  faqs: { q: string; a: string }[];
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-2.5">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={f.q}
            className="bg-white border border-primary-dark/10 rounded-2xl overflow-hidden transition-shadow hover:shadow-sm"
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-5 text-left"
            >
              <span className="font-semibold text-[0.9rem] text-primary-dark">
                {f.q}
              </span>
              <ChevronDown
                size={18}
                className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className="overflow-hidden transition-[max-height] duration-300 ease-out"
              style={{ maxHeight: isOpen ? 300 : 0 }}
            >
              <p className="text-[0.85rem] text-gray-500 leading-relaxed px-5 sm:px-6 pb-5">
                {f.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
