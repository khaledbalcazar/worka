import React, { useState } from 'react';
import { KeyRound, Check, Eye, EyeOff, Trash2, ShieldCheck, ChevronDown, ExternalLink } from 'lucide-react';
import { AI_PROVIDERS, getProvider } from '../lib/aiProviders';
import { loadCredentials, saveCredentials, clearCredentials, type AiCredentials } from '../lib/apiKeyStorage';

// Panel para elegir proveedor de IA (Groq, OpenAI, Gemini, Anthropic, xAI…)
// y cargar la propia API key. Todo queda en el navegador; nunca se guarda en
// el servidor de Worka.
export const ApiKeySettings: React.FC = () => {
  const [creds, setCreds] = useState<AiCredentials>(() =>
    typeof window !== 'undefined'
      ? loadCredentials()
      : { providerId: 'groq', apiKey: '', model: '' }
  );
  const [visible, setVisible] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const provider = getProvider(creds.providerId);
  const saved = creds.apiKey.trim().length > 0;

  function changeProvider(id: string) {
    const p = getProvider(id);
    setCreds((c) => ({ ...c, providerId: id, model: p.defaultModel, baseUrl: undefined }));
  }

  function handleSave() {
    const toSave: AiCredentials = {
      ...creds,
      model: creds.model.trim() || provider.defaultModel
    };
    saveCredentials(toSave);
    setCreds(toSave);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  }

  function handleClear() {
    clearCredentials();
    setCreds({ providerId: creds.providerId, apiKey: '', model: getProvider(creds.providerId).defaultModel });
  }

  return (
    <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2 text-[#d4af37] font-bold text-xs uppercase tracking-widest">
        <KeyRound className="w-4 h-4" />
        <span>Proveedor de IA y API Key</span>
        {saved && (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full normal-case tracking-normal">
            <Check className="w-3 h-3" /> {provider.label}
          </span>
        )}
      </div>

      <p className="text-xs text-[#a1a1aa] leading-relaxed flex items-start gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
        Tu token se guarda solo en este navegador (localStorage). Nunca se almacena en el servidor de Worka; se envía
        únicamente en cada consulta para autenticarte con la plataforma que elijas.
      </p>

      {/* Proveedor */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-[11px] text-[#a1a1aa] font-medium block mb-1.5">Plataforma</label>
          <div className="relative">
            <select
              value={creds.providerId}
              onChange={(e) => changeProvider(e.target.value)}
              className="w-full bg-[#121216] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-[#e4e4e7] appearance-none pr-8 focus:outline-none focus:border-[#d4af37]"
            >
              {AI_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#71717a] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Modelo */}
        <div>
          <label className="text-[11px] text-[#a1a1aa] font-medium block mb-1.5">Modelo</label>
          <input
            list="ai-model-suggestions"
            value={creds.model}
            onChange={(e) => setCreds((c) => ({ ...c, model: e.target.value }))}
            placeholder={provider.defaultModel || 'nombre-del-modelo'}
            className="w-full bg-[#121216] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-[#e4e4e7] placeholder-[#71717a] focus:outline-none focus:border-[#d4af37] font-mono"
          />
          <datalist id="ai-model-suggestions">
            {provider.suggestedModels.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
      </div>

      {/* URL base solo para proveedor personalizado */}
      {creds.providerId === 'custom' && (
        <div>
          <label className="text-[11px] text-[#a1a1aa] font-medium block mb-1.5">
            URL base (compatible con OpenAI, sin <code>/chat/completions</code>)
          </label>
          <input
            value={creds.baseUrl ?? ''}
            onChange={(e) => setCreds((c) => ({ ...c, baseUrl: e.target.value }))}
            placeholder="https://mi-proveedor.com/v1"
            className="w-full bg-[#121216] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-[#e4e4e7] placeholder-[#71717a] focus:outline-none focus:border-[#d4af37] font-mono"
          />
        </div>
      )}

      {/* API Key */}
      <div>
        <label className="text-[11px] text-[#a1a1aa] font-medium block mb-1.5">API Key / Token</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={visible ? 'text' : 'password'}
              value={creds.apiKey}
              onChange={(e) => setCreds((c) => ({ ...c, apiKey: e.target.value }))}
              placeholder={provider.keyHint}
              className="w-full bg-[#121216] border border-[#27272a] rounded-lg pl-3 pr-9 py-2 text-xs text-[#e4e4e7] placeholder-[#71717a] focus:outline-none focus:border-[#d4af37] font-mono"
            />
            <button
              onClick={() => setVisible((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#d4d4d8]"
              aria-label={visible ? 'Ocultar' : 'Mostrar'}
              type="button"
            >
              {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={!creds.apiKey.trim()}
            className="bg-[#d4af37] hover:bg-[#b8962d] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold px-4 py-2 rounded-lg text-xs shrink-0"
          >
            {justSaved ? 'Guardado ✓' : 'Guardar'}
          </button>
          {saved && (
            <button
              onClick={handleClear}
              className="bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] border border-[#3f3f46] px-3 py-2 rounded-lg text-xs shrink-0"
              title="Borrar credenciales guardadas"
              type="button"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {provider.keysUrl && (
        <p className="text-[11px] text-[#71717a]">
          Conseguí tu key de {provider.label} en{' '}
          <a
            href={provider.keysUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[#d4af37] hover:underline inline-flex items-center gap-0.5"
          >
            {provider.keysUrl.replace(/^https?:\/\//, '')}
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          . Los nombres de modelo cambian seguido: si uno falla, probá otro de la lista o escribí el que quieras.
        </p>
      )}
    </div>
  );
};
