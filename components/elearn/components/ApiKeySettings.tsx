import React, { useState } from 'react';
import { KeyRound, Check, Eye, EyeOff, Trash2, ShieldCheck } from 'lucide-react';
import { loadApiKey, saveApiKey, clearApiKey } from '../lib/apiKeyStorage';

// Panel para cargar la propia Anthropic API key desde el navegador. Nunca
// se envía al servidor de Worka salvo en el header de cada request al
// backend del aula (que la usa al vuelo, sin guardarla).
export const ApiKeySettings: React.FC = () => {
  const [key, setKey] = useState(() => (typeof window !== 'undefined' ? loadApiKey() : ''));
  const [saved, setSaved] = useState(() => (typeof window !== 'undefined' ? !!loadApiKey() : false));
  const [visible, setVisible] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  function handleSave() {
    saveApiKey(key);
    setSaved(!!key.trim());
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  }

  function handleClear() {
    clearApiKey();
    setKey('');
    setSaved(false);
  }

  return (
    <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2 text-[#d4af37] font-bold text-xs uppercase tracking-widest">
        <KeyRound className="w-4 h-4" />
        <span>Tu Anthropic API Key</span>
        {saved && (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full normal-case tracking-normal">
            <Check className="w-3 h-3" /> Configurada
          </span>
        )}
      </div>

      <p className="text-xs text-[#a1a1aa] leading-relaxed flex items-start gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
        Se guarda solo en este navegador (localStorage). Nunca se almacena en el servidor de Worka; se envía únicamente en cada consulta al Tutor IA para autenticarte con Anthropic.
      </p>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={visible ? 'text' : 'password'}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-ant-api03-..."
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
          disabled={!key.trim()}
          className="bg-[#d4af37] hover:bg-[#b8962d] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold px-4 py-2 rounded-lg text-xs shrink-0"
        >
          {justSaved ? 'Guardado ✓' : 'Guardar'}
        </button>
        {saved && (
          <button
            onClick={handleClear}
            className="bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] border border-[#3f3f46] px-3 py-2 rounded-lg text-xs shrink-0"
            title="Borrar key guardada"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <p className="text-[11px] text-[#71717a]">
        Sin key propia, el Tutor usa la key configurada en el servidor (si existe). Conseguí la tuya en{' '}
        <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-[#d4af37] hover:underline">
          console.anthropic.com
        </a>.
      </p>
    </div>
  );
};
