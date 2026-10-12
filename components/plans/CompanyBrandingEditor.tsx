"use client";

import { useState, useTransition } from "react";
import { Palette, Plus, X } from "lucide-react";
import { saveCompanyBranding } from "@/app/plans-actions";

const SWATCHES = ["#0a66c2", "#0f766e", "#b91c1c", "#7c3aed", "#c2410c", "#111827"];

// Marca empleadora (plan Empresa): color, cultura, beneficios y video.
export default function CompanyBrandingEditor({
  initial,
}: {
  initial: { brand_color: string | null; culture: string | null; perks: string[]; video_url: string | null };
}) {
  const [color, setColor] = useState(initial.brand_color ?? "");
  const [culture, setCulture] = useState(initial.culture ?? "");
  const [perks, setPerks] = useState<string[]>(initial.perks ?? []);
  const [perkDraft, setPerkDraft] = useState("");
  const [video, setVideo] = useState(initial.video_url ?? "");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function addPerk() {
    const p = perkDraft.trim();
    if (!p || perks.length >= 12 || perks.includes(p)) return;
    setPerks((list) => [...list, p.slice(0, 80)]);
    setPerkDraft("");
  }

  function save() {
    setMessage(null);
    startTransition(async () => {
      try {
        const r = await saveCompanyBranding({ brand_color: color, culture, perks, video_url: video });
        setMessage(r.ok ? { ok: true, text: "Listo: tu página ya muestra los cambios." } : { ok: false, text: r.error ?? "No pudimos guardar." });
      } catch {
        setMessage({ ok: false, text: "No pudimos conectar." });
      }
    });
  }

  return (
    <section className="card p-5 space-y-4">
      <div>
        <h2 className="font-semibold text-lg flex items-center gap-2"><Palette size={18} /> Tu marca empleadora</h2>
        <p className="text-sm text-muted">Se muestra en tu página de empresa, arriba de tus vacantes.</p>
      </div>
      <div>
        <p className="label">Color de tu marca</p>
        <div className="flex flex-wrap items-center gap-2">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              aria-pressed={color === c}
              onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full border-2"
              style={{ background: c, borderColor: color === c ? "#111" : "#fff", boxShadow: "0 0 0 1px #ddd" }}
            />
          ))}
          <input className="input !w-28" value={color} onChange={(e) => setColor(e.target.value)} placeholder="#0a66c2" aria-label="Color en hexadecimal" />
        </div>
      </div>
      <label className="block">
        <span className="label">Por qué trabajar con ustedes</span>
        <textarea className="input min-h-28" maxLength={1500} value={culture} onChange={(e) => setCulture(e.target.value)} placeholder="Contá cómo es el día a día, el equipo y las oportunidades de crecer." />
      </label>
      <div>
        <p className="label">Beneficios</p>
        {perks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {perks.map((p) => (
              <span key={p} className="chip bg-surface text-gray-700">
                {p}
                <button type="button" className="ml-1" aria-label={`Quitar ${p}`} onClick={() => setPerks((l) => l.filter((x) => x !== p))}><X size={12} /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            className="input flex-1"
            value={perkDraft}
            maxLength={80}
            onChange={(e) => setPerkDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPerk();
              }
            }}
            placeholder="Ej: Seguro médico, almuerzo incluido"
          />
          <button type="button" className="btn-secondary !px-4" onClick={addPerk} aria-label="Agregar beneficio"><Plus size={16} /></button>
        </div>
      </div>
      <label className="block">
        <span className="label">Video (YouTube o Vimeo)</span>
        <input className="input" value={video} onChange={(e) => setVideo(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
      </label>
      <button type="button" className="btn-primary" disabled={pending} onClick={save}>{pending ? "Guardando…" : "Guardar marca"}</button>
      {message && <p role="status" className={`text-sm ${message.ok ? "text-green-700" : "text-red-600"}`}>{message.text}</p>}
    </section>
  );
}
