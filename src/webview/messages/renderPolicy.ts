import type { ChatMessage, WebviewState } from '../types';

export function shouldRenderMarkdown(message: Pick<ChatMessage, 'role' | 'error'>): boolean {
  return !message.error && message.role !== 'user';
}

export function shouldRenderQuietEmptyTranscript(state: Pick<WebviewState, 'messages' | 'sessionLoading' | 'settings'>): boolean {
  return state.messages.length === 0
    && !state.sessionLoading
    && state.settings.values.quietStartup === true;
}
