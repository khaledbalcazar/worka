import React, { useState } from 'react';
import { Sparkles, MessageSquare, Award, Clock, Send, Bot, User, CheckCircle2, AlertCircle, Loader2, Settings2, ChevronDown } from 'lucide-react';
import { ApiKeySettings } from './ApiKeySettings';
import { loadApiKey } from '../lib/apiKeyStorage';

interface FeynmanTutorViewProps {
  initialContext?: string;
}

export const FeynmanTutorView: React.FC<FeynmanTutorViewProps> = ({ initialContext = '' }) => {
  const [activeTab, setActiveTab] = useState<'tutor' | 'feynman'>('tutor');
  const [showKeySettings, setShowKeySettings] = useState(false);

  // AI Tutor State
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [tutorContext, setTutorContext] = useState<string>(initialContext);
  const [tutorMessages, setTutorMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: '¡Hola! Soy tu Tutor Virtual Docente para el Concurso del Registro del Estado Civil de Paraguay. ¿Tienes alguna duda sobre la Constitución, Ley 1266, Ley 7445 o Guaraní? Escribe tu consulta.'
    }
  ]);
  const [isTutorLoading, setIsTutorLoading] = useState<boolean>(false);

  // Feynman Evaluator State
  const [selectedTopic, setSelectedTopic] = useState<string>('Diferencia entre Denuncia y Declaración de Nacimiento');
  const [explanationText, setExplanationText] = useState<string>('');
  const [feynmanResult, setFeynmanResult] = useState<any>(null);
  const [isFeynmanLoading, setIsFeynmanLoading] = useState<boolean>(false);

  const topicsList = [
    'Diferencia entre Denuncia y Declaración de Nacimiento (Arts. 52-53 Ley 1266)',
    'Los Tres Remedios Registrales: Reconstituir, Rectificar y Convalidar',
    '¿Qué es una Nota Marginal y por qué es central en el trabajo registral?',
    'Silencio Administrativo y Resolución Ficta en la Ley 5282 de Acceso a Información',
    'Las tres causas de nulidad matrimonial y el matrimonio putativo (Código Civil)',
    'La regla de Incompatibilidad del Oficial y Nepotismo (4° consanguinidad / 2° afinidad)',
    'Cadena de localización documental en la Dirección de Gestión de Documentación Central'
  ];

  const handleSendTutorMessage = async () => {
    if (!userPrompt.trim() || isTutorLoading) return;
    const promptText = userPrompt;
    setUserPrompt('');

    setTutorMessages((prev) => [...prev, { role: 'user', text: promptText }]);
    setIsTutorLoading(true);

    try {
      const res = await fetch('/api/e-learn/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(loadApiKey() ? { 'x-anthropic-api-key': loadApiKey() } : {})
        },
        body: JSON.stringify({ prompt: promptText, context: tutorContext })
      });
      const data = await res.json();

      if (data.answer) {
        setTutorMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
      } else {
        setTutorMessages((prev) => [
          ...prev,
          { role: 'assistant', text: data.error || 'No se pudo obtener respuesta. Configurá tu API Key arriba o verificá que ANTHROPIC_API_KEY esté configurada en el servidor.' }
        ]);
      }
    } catch (err) {
      console.error(err);
      setTutorMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Error de conexión con el servidor. Revisa tu conexión a internet.' }
      ]);
    } finally {
      setIsTutorLoading(false);
    }
  };

  const handleEvaluateFeynman = async () => {
    if (!explanationText.trim() || isFeynmanLoading) return;
    setIsFeynmanLoading(true);

    try {
      const res = await fetch('/api/e-learn/feynman', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(loadApiKey() ? { 'x-anthropic-api-key': loadApiKey() } : {})
        },
        body: JSON.stringify({ topic: selectedTopic, explanation: explanationText })
      });
      const data = await res.json();
      setFeynmanResult(data);
    } catch (err) {
      console.error(err);
      alert('Error al conectar con la evaluación por IA.');
    } finally {
      setIsFeynmanLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-[#121216] border border-[#27272a] rounded-xl p-6 text-center space-y-2 shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          MÓDULO IA • TÉCNICA FEYNMAN & TUTOR DUDAS
        </div>
        <h2 className="text-2xl font-serif font-bold text-white">
          Tutor Virtual IA & Evaluador de Explicación Oral
        </h2>
        <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-xl mx-auto">
          Resuelve dudas jurídicas complejas o ensaya tu explicación en voz alta usando la Técnica Feynman para recibir retroalimentación instantánea.
        </p>
      </div>

      {/* Configuración de API Key */}
      <div>
        <button
          onClick={() => setShowKeySettings((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-[#a1a1aa] hover:text-[#d4af37] transition-colors"
        >
          <Settings2 className="w-3.5 h-3.5" />
          Configurar mi API Key de Anthropic
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showKeySettings ? 'rotate-180' : ''}`} />
        </button>
        {showKeySettings && (
          <div className="mt-2">
            <ApiKeySettings />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#27272a] gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('tutor')}
          className={`pb-3 px-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'tutor'
              ? 'border-b-2 border-[#d4af37] text-[#d4af37]'
              : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Tutor IA de Dudas</span>
        </button>
        <button
          onClick={() => setActiveTab('feynman')}
          className={`pb-3 px-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'feynman'
              ? 'border-b-2 border-[#d4af37] text-[#d4af37]'
              : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-[#d4af37]" />
          <span>Evaluador Feynman (Explicación Oral)</span>
        </button>
      </div>

      {activeTab === 'tutor' ? (
        /* Tutor IA Chat View */
        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
          {/* Messages Feed */}
          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
            {tutorMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs sm:text-sm ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#d4af37] text-black font-medium rounded-tr-none'
                      : 'bg-[#0e0e11] text-[#e4e4e7] border border-[#27272a] rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-[#18181b] text-[#e4e4e7] flex items-center justify-center shrink-0 border border-[#3f3f46]">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTutorLoading && (
              <div className="flex items-center gap-2 text-xs text-[#d4af37] font-medium p-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>El Tutor IA está analizando las leyes del temario...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="pt-2 border-t border-[#27272a] flex gap-2">
            <input
              type="text"
              placeholder="Haz tu consulta jurídica o sobre el examen..."
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendTutorMessage()}
              className="flex-1 bg-[#0e0e11] border border-[#27272a] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#e4e4e7] placeholder-[#71717a] focus:outline-none focus:border-[#d4af37]"
            />
            <button
              onClick={handleSendTutorMessage}
              disabled={isTutorLoading || !userPrompt.trim()}
              className="bg-[#d4af37] hover:bg-[#b8962d] text-black font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>Enviar</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Feynman Evaluator View */
        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#e4e4e7] block">
              1. Selecciona el concepto legal a explicar:
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full bg-[#0e0e11] border border-[#27272a] rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-[#d4af37] focus:outline-none focus:border-[#d4af37]"
            >
              {topicsList.map((topic, idx) => (
                <option key={idx} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#e4e4e7] block">
              2. Explica el concepto con tus propias palabras (como si se lo contaras a un chico de 12 años):
            </label>
            <textarea
              rows={5}
              placeholder="Escribe aquí tu explicación en palabras sencillas..."
              value={explanationText}
              onChange={(e) => setExplanationText(e.target.value)}
              className="w-full bg-[#0e0e11] border border-[#27272a] rounded-xl p-3.5 text-xs sm:text-sm text-[#e4e4e7] placeholder-[#71717a] focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <button
            onClick={handleEvaluateFeynman}
            disabled={isFeynmanLoading || !explanationText.trim()}
            className="w-full bg-[#d4af37] hover:bg-[#b8962d] text-black font-bold py-3 rounded-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            {isFeynmanLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluando con IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Evaluar mi Explicación con IA</span>
              </>
            )}
          </button>

          {/* Feedback Output */}
          {feynmanResult && (
            <div className="bg-[#0e0e11] border border-[#27272a] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <span className="font-serif font-bold text-white">Resultado de la Evaluación</span>
                <span className="bg-[#d4af37] text-black font-bold px-3 py-1 rounded-full text-xs">
                  Puntuación: {feynmanResult.score || 8} / 10
                </span>
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                <div>
                  <strong className="text-[#d4af37] block mb-0.5">Claridad Pedagógica:</strong>
                  <p className="text-[#a1a1aa]">{feynmanResult.clarity}</p>
                </div>

                {feynmanResult.correctLegalTerms && feynmanResult.correctLegalTerms.length > 0 && (
                  <div>
                    <strong className="text-emerald-400 block mb-0.5">Términos Legales Acertados:</strong>
                    <ul className="list-disc list-inside text-[#a1a1aa] space-y-0.5">
                      {feynmanResult.correctLegalTerms.map((term: string, idx: number) => (
                        <li key={idx}>{term}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {feynmanResult.missingOrGaps && feynmanResult.missingOrGaps.length > 0 && (
                  <div>
                    <strong className="text-rose-400 block mb-0.5">Huecos o Datos Faltantes:</strong>
                    <ul className="list-disc list-inside text-[#a1a1aa] space-y-0.5">
                      {feynmanResult.missingOrGaps.map((gap: string, idx: number) => (
                        <li key={idx}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-[#121216] p-3 rounded-lg border border-[#27272a]">
                  <strong className="text-cyan-400 block mb-1">Consejo para la Entrevista Oral:</strong>
                  <p className="text-[#a1a1aa] italic">{feynmanResult.feedback}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
