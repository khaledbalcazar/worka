"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Eye, Megaphone, Plus, RotateCcw, Trash2 } from "lucide-react";
import WhatsNewModal from "@/components/WhatsNewModal";
import { saveWhatsNew } from "@/app/actions";
import {
  DEFAULT_WHATS_NEW,
  MAX_ITEMS,
  WHATS_NEW_ICONS,
  nextVersion,
  type WhatsNewConfig,
  type WhatsNewIcon,
  type WhatsNewItem,
} from "@/lib/whats-new";

const ICON_LABELS: Record<WhatsNewIcon, string> = {
  search: "Lupa",
  sparkles: "Destellos",
  map: "Mapa",
  "list-checks": "Lista",
  "file-text": "Documento",
  "shield-check": "Escudo",
  "graduation-cap": "Birrete",
  "user-round": "Persona",
  bell: "Campana",
  "message-circle": "Mensaje",
  zap: "Rayo",
  briefcase: "Maletín",
};

const EMPTY_ITEM: WhatsNewItem = { icon: "sparkles", title: "", text: "", href: "", cta: "" };

// Editor del popup "¡Nos renovamos!" que aparece una vez en /empleos.
export default function WhatsNewEditor({ initial }: { initial: WhatsNewConfig }) {
  const [draft, setDraft] = useState<WhatsNewConfig>(initial);
  const [saved, setSaved] = useState<WhatsNewConfig>(initial);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  function set<K extends keyof WhatsNewConfig>(key: K, value: WhatsNewConfig[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function setItem(index: number, patch: Partial<WhatsNewItem>) {
    setDraft((d) => ({ ...d, items: d.items.map((it, i) => (i === index ? { ...it, ...patch } : it)) }));
  }

  function moveItem(index: number, delta: -1 | 1) {
    setDraft((d) => {
      const items = [...d.items];
      const to = index + delta;
      if (to < 0 || to >= items.length) return d;
      [items[index], items[to]] = [items[to], items[index]];
      return { ...d, items };
    });
  }

  function save(next: WhatsNewConfig, okText: string) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await saveWhatsNew(next);
        if (!result.ok) {
          setMessage({ ok: false, text: result.error ?? "No pudimos guardar." });
          return;
        }
        setDraft(next);
        setSaved(next);
        setMessage({ ok: true, text: result.demo ? `${okText} (modo demo: no se guarda)` : okText });
      } catch {
        setMessage({ ok: false, text: "No pudimos conectar. Probá de nuevo." });
      }
    });
  }

  function remove() {
    if (!window.confirm("¿Eliminar el popup? Nadie lo va a ver más hasta que lo vuelvas a activar.")) return;
    save({ ...draft, enabled: false }, "Popup eliminado. Ya no se muestra en /empleos.");
  }

  function showAgain() {
    if (!window.confirm("¿Mostrarlo otra vez a todos, incluso a quienes ya lo vieron?")) return;
    save({ ...draft, enabled: true, version: nextVersion() }, "Listo: se va a mostrar otra vez a todos.");
  }

  const validItems = draft.items.filter((i) => i.title.trim());

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-bold text-primary-dark flex items-center gap-2">
            <Megaphone size={18} /> Popup de novedades
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Aparece una sola vez a cada persona al entrar a /empleos. Si cambiás el texto, quien ya lo vio no lo vuelve a ver;
            para eso usá «Mostrar otra vez a todos».
          </p>
        </div>
        <span className={`chip ${saved.enabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {saved.enabled ? "Activo" : "Eliminado"}
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Field label="Etiqueta" value={draft.badge} max={40} onChange={(v) => set("badge", v)} />
        <Field label="Edición (a la derecha del destacado)" value={draft.edition} max={40} onChange={(v) => set("edition", v)} />
        <Field label="Título" value={draft.title} max={120} onChange={(v) => set("title", v)} wide />
        <Field label="Subtítulo" value={draft.subtitle} max={280} onChange={(v) => set("subtitle", v)} wide area />
        <Field label="Destacado (línea con punto verde)" value={draft.highlight} max={140} onChange={(v) => set("highlight", v)} wide />
        <Field label="Nota al pie" value={draft.footer} max={160} onChange={(v) => set("footer", v)} />
        <Field label="Texto del botón principal" value={draft.primaryLabel} max={40} onChange={(v) => set("primaryLabel", v)} />
      </div>

      <h3 className="font-semibold text-primary-dark mt-6">Novedades ({draft.items.length}/{MAX_ITEMS})</h3>
      <p className="text-xs text-gray-500">
        El enlace tiene que ser de Worka y empezar con «/», por ejemplo /cv o /empleos?vista=mapa. Vacío = sin botón.
      </p>
      <ol className="space-y-3 mt-3">
        {draft.items.map((item, i) => (
          <li key={i} className="rounded-xl border border-gray-200 p-3">
            <div className="grid sm:grid-cols-[150px_1fr] gap-3">
              <label>
                <span className="label">Ícono</span>
                <select
                  className="input"
                  value={item.icon}
                  onChange={(e) => setItem(i, { icon: e.target.value as WhatsNewIcon })}
                >
                  {WHATS_NEW_ICONS.map((icon) => (
                    <option key={icon} value={icon}>{ICON_LABELS[icon]}</option>
                  ))}
                </select>
              </label>
              <Field label="Título" value={item.title} max={60} onChange={(v) => setItem(i, { title: v })} />
              <Field label="Descripción" value={item.text} max={220} onChange={(v) => setItem(i, { text: v })} wide area />
              <div className="sm:col-span-2 grid sm:grid-cols-2 gap-3">
                <Field label="Enlace (opcional)" value={item.href} max={200} onChange={(v) => setItem(i, { href: v })} placeholder="/cv" />
                <Field label="Texto del enlace" value={item.cta} max={30} onChange={(v) => setItem(i, { cta: v })} placeholder="Crear mi CV" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button type="button" className="btn-secondary !min-h-9 !px-3" disabled={i === 0} onClick={() => moveItem(i, -1)} aria-label="Subir">
                <ArrowUp size={14} />
              </button>
              <button type="button" className="btn-secondary !min-h-9 !px-3" disabled={i === draft.items.length - 1} onClick={() => moveItem(i, 1)} aria-label="Bajar">
                <ArrowDown size={14} />
              </button>
              <button
                type="button"
                className="btn-danger-outline !min-h-9 !px-3"
                onClick={() => set("items", draft.items.filter((_, j) => j !== i))}
              >
                <Trash2 size={14} /> Quitar
              </button>
            </div>
          </li>
        ))}
      </ol>
      {draft.items.length < MAX_ITEMS && (
        <button type="button" className="btn-secondary mt-3" onClick={() => set("items", [...draft.items, { ...EMPTY_ITEM }])}>
          <Plus size={16} /> Agregar novedad
        </button>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-gray-100">
        <button
          type="button"
          className="btn-primary"
          disabled={pending || (!dirty && saved.enabled)}
          onClick={() => save({ ...draft, enabled: true }, "Popup guardado y activo.")}
        >
          {pending ? "Guardando…" : saved.enabled ? "Guardar cambios" : "Guardar y activar"}
        </button>
        <button type="button" className="btn-secondary" disabled={validItems.length === 0} onClick={() => setPreview(true)}>
          <Eye size={16} /> Vista previa
        </button>
        <button type="button" className="btn-secondary" disabled={pending} onClick={showAgain}>
          <RotateCcw size={16} /> Mostrar otra vez a todos
        </button>
        {saved.enabled && (
          <button type="button" className="btn-danger-outline" disabled={pending} onClick={remove}>
            <Trash2 size={16} /> Eliminar popup
          </button>
        )}
        <button
          type="button"
          className="text-sm text-gray-500 underline ml-auto"
          onClick={() => setDraft({ ...DEFAULT_WHATS_NEW, enabled: saved.enabled, version: saved.version })}
        >
          Restaurar textos originales
        </button>
      </div>
      {dirty && <p className="text-xs text-amber-600 mt-2">Tenés cambios sin guardar.</p>}
      {message && (
        <p role="status" className={`text-sm mt-2 ${message.ok ? "text-green-700" : "text-red-600"}`}>
          {message.text}
        </p>
      )}

      <WhatsNewModal
        mode="preview"
        open={preview}
        onClose={() => setPreview(false)}
        config={{ ...draft, items: validItems }}
      />
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  max,
  wide,
  area,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  max: number;
  wide?: boolean;
  area?: boolean;
  placeholder?: string;
}) {
  return (
    <label className={wide ? "sm:col-span-2 lg:col-span-2" : ""}>
      <span className="label">{label}</span>
      {area ? (
        <textarea className="input min-h-16" value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="input" value={value} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}
