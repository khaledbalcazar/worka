"use client";

import { useEffect, useRef, useState } from "react";
import {
  UserPlus,
  Eye,
  Briefcase,
  CheckCircle,
  MessageCircle,
  Star,
} from "lucide-react";

// Íconos disponibles para los eventos configurados desde el admin.
const ICONS = {
  registro: { Icon: UserPlus, color: "#0A66C2" },
  vista: { Icon: Eye, color: "#5f4bb6" },
  vacante: { Icon: Briefcase, color: "#057642" },
  verificado: { Icon: CheckCircle, color: "#057642" },
  mensaje: { Icon: MessageCircle, color: "#057642" },
  destacado: { Icon: Star, color: "#B24020" },
} as const;

export type ActivityItem = { kind: keyof typeof ICONS; text: string };

const INITIAL_TIMES = ["hace 1 min", "hace 3 min", "hace 6 min", "hace 9 min"];

export default function ActivityFeed({ pool }: { pool: ActivityItem[] }) {
  const [items, setItems] = useState(() =>
    pool.slice(0, 4).map((a, i) => ({ ...a, id: i, time: INITIAL_TIMES[i] }))
  );
  const idx = useRef(4);

  useEffect(() => {
    if (pool.length === 0) return;
    const t = setInterval(() => {
      setItems((prev) => {
        const src = pool[idx.current % pool.length];
        idx.current += 1;
        return [{ ...src, id: idx.current, time: "ahora" }, ...prev].slice(0, 5);
      });
    }, 2800);
    return () => clearInterval(t);
  }, [pool]);

  return (
    <div className="bg-white border border-line rounded-[10px] p-4 sm:p-5" aria-live="off">
      <div className="flex items-center gap-2 mb-3.5">
        <span className="relative inline-flex w-2 h-2">
          <span className="absolute inset-0 rounded-full bg-[#057642] animate-wk-ping" />
          <span className="w-2 h-2 rounded-full bg-[#057642]" />
        </span>
        <span className="text-[11px] font-semibold tracking-[0.08em] text-success-ink">
          EN VIVO
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((it, i) => {
          const { Icon, color } = ICONS[it.kind] ?? ICONS.registro;
          return (
            <div
              key={it.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                i === 0 ? "bg-primary/[0.06] animate-wk-slide" : "bg-[#f8f6f3]"
              } ${i > 3 ? "hidden sm:flex" : ""}`}
            >
              <div
                className="w-8.5 h-8.5 min-w-8.5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `${color}18` }}
              >
                <Icon size={16} style={{ color }} />
              </div>
              <span className="text-[13px] text-ink flex-1 leading-snug">
                {it.text}
              </span>
              <span className="text-[11px] text-muted whitespace-nowrap shrink-0">
                {it.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
