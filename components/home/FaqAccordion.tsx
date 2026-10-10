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
            className="bg-white border border-line rounded-[10px] overflow-hidden"
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 px-4 sm:px-6 min-h-14 py-3 text-left hover:bg-[#faf9f7]"
            >
              <span className="font-semibold text-[15px] text-ink">
                {f.q}
              </span>
              <ChevronDown
                size={18}
                className={`text-muted shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className="overflow-hidden transition-[max-height] duration-300 ease-out"
              style={{ maxHeight: isOpen ? 300 : 0 }}
            >
              <p className="text-sm text-[#4a4a4a] leading-relaxed px-4 sm:px-6 pb-5">
                {f.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
