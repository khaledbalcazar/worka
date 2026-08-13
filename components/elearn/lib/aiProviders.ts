// Catálogo de proveedores de IA soportados por el Tutor del aula.
// No contiene secretos: solo endpoints, modelos sugeridos y metadatos.
//
// La mayoría de las plataformas exponen una API compatible con OpenAI
// (/chat/completions), así que se agrupan bajo el mismo "kind" y comparten
// implementación. Anthropic y Gemini usan formatos propios.

export type ProviderKind = 'openai' | 'anthropic' | 'gemini';

export interface ProviderConfig {
  id: string;
  label: string;
  kind: ProviderKind;
  baseUrl: string;
  defaultModel: string;
  suggestedModels: string[];
  keysUrl: string;
  keyHint: string;
}

export const AI_PROVIDERS: ProviderConfig[] = [
  {
    id: 'groq',
    label: 'Groq',
    kind: 'openai',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    suggestedModels: ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b', 'moonshotai/kimi-k2-instruct'],
    keysUrl: 'https://console.groq.com/keys',
    keyHint: 'gsk_...'
  },
  {
    id: 'openai',
    label: 'OpenAI (ChatGPT)',
    kind: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    suggestedModels: ['gpt-4o', 'gpt-4o-mini', 'o4-mini'],
    keysUrl: 'https://platform.openai.com/api-keys',
    keyHint: 'sk-...'
  },
  {
    id: 'gemini',
    label: 'Google Gemini',
    kind: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com',
    defaultModel: 'gemini-2.0-flash',
    suggestedModels: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'],
    keysUrl: 'https://aistudio.google.com/apikey',
    keyHint: 'AIza...'
  },
  {
    id: 'anthropic',
    label: 'Anthropic (Claude)',
    kind: 'anthropic',
    baseUrl: 'https://api.anthropic.com',
    defaultModel: 'claude-sonnet-5',
    suggestedModels: ['claude-sonnet-5', 'claude-opus-5', 'claude-haiku-4-5'],
    keysUrl: 'https://console.anthropic.com/settings/keys',
    keyHint: 'sk-ant-...'
  },
  {
    id: 'xai',
    label: 'xAI (Grok)',
    kind: 'openai',
    baseUrl: 'https://api.x.ai/v1',
    defaultModel: 'grok-3',
    suggestedModels: ['grok-3', 'grok-3-mini'],
    keysUrl: 'https://console.x.ai',
    keyHint: 'xai-...'
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    kind: 'openai',
    baseUrl: 'https://api.deepseek.com',
    defaultModel: 'deepseek-chat',
    suggestedModels: ['deepseek-chat', 'deepseek-reasoner'],
    keysUrl: 'https://platform.deepseek.com/api_keys',
    keyHint: 'sk-...'
  },
  {
    id: 'openrouter',
    label: 'OpenRouter (multi-modelo)',
    kind: 'openai',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct',
    suggestedModels: [
      'meta-llama/llama-3.3-70b-instruct',
      'anthropic/claude-sonnet-4.5',
      'google/gemini-2.0-flash-001'
    ],
    keysUrl: 'https://openrouter.ai/keys',
    keyHint: 'sk-or-...'
  },
  {
    id: 'mistral',
    label: 'Mistral',
    kind: 'openai',
    baseUrl: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-large-latest',
    suggestedModels: ['mistral-large-latest', 'mistral-small-latest'],
    keysUrl: 'https://console.mistral.ai/api-keys',
    keyHint: '...'
  },
  {
    id: 'custom',
    label: 'Otro (compatible con OpenAI)',
    kind: 'openai',
    baseUrl: '',
    defaultModel: '',
    suggestedModels: [],
    keysUrl: '',
    keyHint: 'tu-api-key'
  }
];

export function getProvider(id: string): ProviderConfig {
  return AI_PROVIDERS.find((p) => p.id === id) ?? AI_PROVIDERS[0];
}
