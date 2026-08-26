"use client";

import { useState, useTransition } from "react";
import { Mail, RotateCcw, Send, Eye } from "lucide-react";
import {
  EMAIL_TEMPLATES,
  renderEmail,
  sampleVars,
  type EmailTemplate,
} from "@/lib/email-templates";
import {
  resetEmailTemplate,
  saveEmailTemplate,
  sendTemplatePreview,
} from "@/app/admin/email-actions";

export type TemplateOverride = {
  key: string;
  subject: string;
  body: string;
  enabled: boolean;
};

// Editor de los correos de Worka.
//
// Los textos vivían en el código, así que cambiar una coma pedía un
// despliegue. Acá se editan, se previsualizan con datos de ejemplo y se
// mandan de prueba antes de que los reciba nadie de verdad.
export default function EmailTemplates({
  overrides,
}: {
  overrides: TemplateOverride[];
}) {
  const [abierta, setAbierta] = useState<string | null>(null);
  const mapa = new Map(overrides.map((o) => [o.key, o]));

  return (
    <section className="card p-5">
      <h2 className="font-bold text-primary-dark flex items-center gap-2">
        <Mail size={18} /> Correos de Worka
      </h2>
      <p className="text-sm text-gray-500 mt-1">
        Editá el asunto y el texto de cada aviso. Lo que no toques usa la
        redacción original que viene con la plataforma.
      </p>

      <div className="divide-y divide-gray-100 mt-3">
        {EMAIL_TEMPLATES.map((t) => {
          const o = mapa.get(t.key);
          const editada = !!o;
          const apagada = o?.enabled === false;
          return (
            <div key={t.key} className="py-3">
              <button
                onClick={() => setAbierta(abierta === t.key ? null : t.key)}
                className="w-full text-left flex items-start justify-between gap-3"
              >
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-primary-dark">
                      {t.name}
                    </span>
                    <span className="chip bg-gray-100 text-gray-500">
                      {t.audience}
                    </span>
                    {editada && !apagada && (
                      <span className="chip bg-blue-50 text-primary">
                        editado
                      </span>
                    )}
                    {apagada && (
                      <span className="chip bg-red-50 text-danger">
                        apagado
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    {t.when}
                  </span>
                </span>
                <span className="text-xs text-primary font-medium shrink-0 mt-1">
                  {abierta === t.key ? "Cerrar" : "Editar"}
                </span>
              </button>

              {abierta === t.key && (
                <Editor
                  template={t}
                  override={o ?? null}
                  onClose={() => setAbierta(null)}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Editor({
  template,
  override,
  onClose,
}: {
  template: EmailTemplate;
  override: TemplateOverride | null;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState(override?.subject ?? template.subject);
  const [body, setBody] = useState(override?.body ?? template.body);
  const [enabled, setEnabled] = useState(override?.enabled !== false);
  const [testTo, setTestTo] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  // Vista previa con datos de ejemplo: ver "Hola {{nombre}}" no dice nada
  // sobre cómo va a quedar el correo de verdad.
  const preview = renderEmail(
    template,
    { subject, body },
    sampleVars(template)
  );

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, exito: string) {
    setMsg(null);
    startTransition(async () => {
      const r = await fn();
      setMsg({ ok: r.ok, text: r.ok ? exito : (r.error ?? "Ocurrió un error.") });
    });
  }

  return (
    <div className="mt-3 bg-surface rounded-2xl p-4 space-y-3 animate-rise">
      <div>
        <label className="label">Asunto</label>
        <input
          className="input"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div>
        <label className="label">Cuerpo (HTML)</label>
        <textarea
          className="input min-h-48 font-mono text-xs leading-relaxed"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <div>
        <p className="text-xs font-medium text-gray-600 mb-1.5">
          Variables disponibles — tocá para copiar
        </p>
        <div className="flex flex-wrap gap-1.5">
          {template.vars.map((v) => (
            <button
              key={v.key}
              type="button"
              title={`${v.label} · ejemplo: ${v.sample}`}
              onClick={() => navigator.clipboard?.writeText(`{{${v.key}}}`)}
              className="chip bg-white border border-gray-200 text-gray-600 font-mono press"
            >
              {`{{${v.key}}}`}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">
          Si borrás <code>{"{{enlace}}"}</code> el correo se manda igual, pero
          sin botón para volver a Worka.
        </p>
      </div>

      {/* Vista previa */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
          <Eye size={13} /> Así se ve con datos de ejemplo
        </p>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400">Asunto</p>
          <p className="text-sm font-semibold text-primary-dark mb-3">
            {preview.subject}
          </p>
          <div
            className="text-sm text-gray-700 [&_a]:text-primary [&_p]:mb-2"
            dangerouslySetInnerHTML={{ __html: preview.body }}
          />
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-gray-700">
        <input
          type="checkbox"
          className="w-5 h-5 accent-primary"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        Enviar este correo
      </label>
      {!enabled && (
        <p className="text-xs text-amber-800 bg-amber-50 rounded-xl px-3 py-2">
          Apagado: el aviso va a seguir apareciendo en la campanita, pero no
          sale por correo.
        </p>
      )}

      {/* Envío de prueba */}
      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <input
          className="input flex-1"
          type="email"
          placeholder="Probar en mi correo…"
          value={testTo}
          onChange={(e) => setTestTo(e.target.value)}
        />
        <button
          onClick={() =>
            run(
              () => sendTemplatePreview(template.key, testTo, { subject, body }),
              "Enviado. Miralo en tu bandeja."
            )
          }
          disabled={pending || !testTo.trim()}
          className="btn-secondary press disabled:opacity-40"
        >
          <Send size={14} /> Enviar prueba
        </button>
      </div>

      {msg && (
        <p className={`text-xs ${msg.ok ? "text-success" : "text-danger"}`}>
          {msg.text}
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={() =>
            run(
              () => resetEmailTemplate(template.key),
              "Restaurado el texto original."
            )
          }
          disabled={pending || !override}
          className="btn-secondary press text-sm disabled:opacity-40"
        >
          <RotateCcw size={14} /> Restaurar original
        </button>
        <button onClick={onClose} className="btn-secondary press text-sm">
          Cerrar
        </button>
        <button
          onClick={() =>
            run(
              () => saveEmailTemplate(template.key, { subject, body, enabled }),
              "Guardado."
            )
          }
          disabled={pending}
          className="btn-primary press text-sm flex-1"
        >
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
