type PostMessage = (message: unknown) => void;

type HighlightInfo = {
  code: string;
  language: string;
  themeId: string;
  requestId: string;
};

const maxHighlightCodeLength = 200_000;
const highlightedElements = new Map<HTMLElement, HighlightInfo>();
let postMessage: PostMessage | undefined;
let nextHighlightRequestId = 1;

export function configureCodeHighlighting(post: PostMessage): void {
  postMessage = post;
}

export function requestCodeHighlight(element: HTMLElement, code: string, language: string | undefined, options: { force?: boolean } = {}): boolean {
  const normalizedLanguage = normalizeLanguage(language);
  const themeId = getActiveThemeId();

  if (!postMessage || !code || code.length > maxHighlightCodeLength || !normalizedLanguage) {
    return false;
  }

  const existing = highlightedElements.get(element);

  if (!options.force && existing?.code === code && existing.language === normalizedLanguage && existing.themeId === themeId) {
    return true;
  }

  const id = `highlight-${nextHighlightRequestId++}`;
  highlightedElements.set(element, {
    code,
    language: normalizedLanguage,
    themeId,
    requestId: id
  });
  element.dataset.shikiHighlightId = id;
  element.classList.add('tau-shiki-pending');
  postMessage({
    type: 'highlightCode',
    id,
    code,
    language: normalizedLanguage,
    themeId
  });
  return true;
}

export function requestCodeHighlightsIn(root: HTMLElement): void {
  const elements = Array.from(root.querySelectorAll('pre code, pre[data-shiki-language]'));

  for (const codeElement of elements) {
    if (!(codeElement instanceof HTMLElement)) {
      continue;
    }

    requestCodeHighlight(codeElement, codeElement.textContent ?? '', getCodeElementLanguage(codeElement));
  }
}

export function watchCodeHighlightThemeChanges(): void {
  let activeThemeId = getActiveThemeId();
  const refreshIfThemeChanged = () => {
    const nextThemeId = getActiveThemeId();

    if (nextThemeId === activeThemeId) {
      return;
    }

    activeThemeId = nextThemeId;
    refreshConnectedHighlights();
  };

  new MutationObserver(refreshIfThemeChanged).observe(document.body, {
    attributes: true,
    attributeFilter: ['data-vscode-theme-id']
  });
}

export function handleCodeHighlightMessage(message: unknown): boolean {
  if (!isRecord(message) || typeof message.type !== 'string') {
    return false;
  }

  if (message.type === 'highlightCodeResult') {
    applyCodeHighlightResult(message);
    return true;
  }

  if (message.type === 'codeThemeChanged') {
    refreshConnectedHighlights();
    return true;
  }

  return false;
}

function applyCodeHighlightResult(message: Record<string, unknown>): void {
  if (typeof message.id !== 'string') {
    return;
  }

  const entry = findHighlightByRequestId(message.id);

  if (!entry) {
    return;
  }

  const [element, info] = entry;

  if (!element.isConnected || element.dataset.shikiHighlightId !== info.requestId) {
    highlightedElements.delete(element);
    return;
  }

  element.classList.remove('tau-shiki-pending');

  if (typeof message.html !== 'string' || message.html.length === 0 || !window.DOMPurify) {
    return;
  }

  element.innerHTML = window.DOMPurify.sanitize(message.html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['style']
  });
}

function refreshConnectedHighlights(): void {
  for (const [element, info] of Array.from(highlightedElements.entries())) {
    if (!element.isConnected) {
      highlightedElements.delete(element);
      continue;
    }

    element.textContent = info.code;
    requestCodeHighlight(element, info.code, info.language, { force: true });
  }
}

function findHighlightByRequestId(requestId: string): [HTMLElement, HighlightInfo] | undefined {
  for (const entry of highlightedElements.entries()) {
    if (entry[1].requestId === requestId) {
      return entry;
    }
  }

  return undefined;
}

function getCodeElementLanguage(codeElement: HTMLElement): string | undefined {
  if (codeElement.dataset.shikiLanguage) {
    return codeElement.dataset.shikiLanguage;
  }

  for (const className of Array.from(codeElement.classList)) {
    const match = className.match(/^language-(.+)$/);

    if (match) {
      return match[1];
    }
  }

  return undefined;
}

function getActiveThemeId(): string {
  return document.body.getAttribute('data-vscode-theme-id') || '';
}

function normalizeLanguage(language: string | undefined): string | undefined {
  const normalized = language?.trim().toLowerCase();

  if (!normalized) {
    return undefined;
  }

  const aliases: Record<string, string> = {
    cjs: 'javascript',
    js: 'javascript',
    jsx: 'javascriptreact',
    mjs: 'javascript',
    shell: 'shellscript',
    sh: 'shellscript',
    ts: 'typescript',
    tsx: 'typescriptreact',
    yml: 'yaml'
  };

  return aliases[normalized] || normalized;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
