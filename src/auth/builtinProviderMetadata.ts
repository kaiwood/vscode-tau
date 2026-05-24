export type BuiltInAuthProviderKind = 'oauth' | 'api_key';

export type BuiltInAuthProviderMetadata = {
  id: string;
  name: string;
  kind: BuiltInAuthProviderKind;
};

// Narrow mirror of Pi's built-in auth provider metadata used for /login UI.
// Keep this intentionally small and data-only; AuthStorage/ModelRegistry remain authoritative.
export const builtInOAuthProviderIds = new Set(['anthropic', 'openai-codex', 'github-copilot']);

export const builtInApiKeyProviderNames: Record<string, string> = {
  anthropic: 'Anthropic',
  'amazon-bedrock': 'Amazon Bedrock',
  'azure-openai-responses': 'Azure OpenAI Responses',
  cerebras: 'Cerebras',
  'cloudflare-ai-gateway': 'Cloudflare AI Gateway',
  'cloudflare-workers-ai': 'Cloudflare Workers AI',
  deepseek: 'DeepSeek',
  fireworks: 'Fireworks',
  google: 'Google Gemini',
  'google-vertex': 'Google Vertex AI',
  groq: 'Groq',
  huggingface: 'Hugging Face',
  'kimi-coding': 'Kimi For Coding',
  mistral: 'Mistral',
  minimax: 'MiniMax',
  'minimax-cn': 'MiniMax (China)',
  moonshotai: 'Moonshot AI',
  'moonshotai-cn': 'Moonshot AI (China)',
  opencode: 'OpenCode Zen',
  'opencode-go': 'OpenCode Go',
  openai: 'OpenAI',
  openrouter: 'OpenRouter',
  together: 'Together AI',
  'vercel-ai-gateway': 'Vercel AI Gateway',
  xai: 'xAI',
  zai: 'ZAI',
  xiaomi: 'Xiaomi MiMo',
  'xiaomi-token-plan-cn': 'Xiaomi MiMo Token Plan (China)',
  'xiaomi-token-plan-ams': 'Xiaomi MiMo Token Plan (Amsterdam)',
  'xiaomi-token-plan-sgp': 'Xiaomi MiMo Token Plan (Singapore)'
};

export function isBuiltInOAuthProvider(id: string): boolean {
  return builtInOAuthProviderIds.has(id);
}

export function isBuiltInApiKeyProvider(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(builtInApiKeyProviderNames, id);
}
