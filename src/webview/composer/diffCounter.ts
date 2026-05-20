export type DiffCounterState = {
  element: HTMLElement;
  prefix: '+' | '-';
  value: number;
  target: number;
  startValue: number;
  startTime: number;
  duration: number;
  lastText: string;
  animationFrame: number | undefined;
};

export function createDiffCounter(element: HTMLElement, prefix: '+' | '-'): DiffCounterState {
  const value = parseDiffCounterValue(element.textContent, prefix);
  const counter: DiffCounterState = {
    element,
    prefix,
    value,
    target: value,
    startValue: value,
    startTime: 0,
    duration: 0,
    lastText: '',
    animationFrame: undefined
  };

  renderDiffCounter(counter, value);
  return counter;
}

export function updateDiffCounter(counter: DiffCounterState, targetValue: number, animationsEnabled = true): void {
  const target = normalizeDiffLineCount(targetValue);

  if (!animationsEnabled) {
    if (counter.animationFrame !== undefined) {
      cancelAnimationFrame(counter.animationFrame);
      counter.animationFrame = undefined;
    }

    counter.target = target;
    counter.startValue = target;
    counter.duration = 0;
    renderDiffCounter(counter, target);
    return;
  }

  if (target === counter.target) {
    return;
  }

  const now = performance.now();
  const currentValue = counter.animationFrame === undefined
    ? counter.value
    : getInterpolatedDiffCounterValue(counter, now);

  renderDiffCounter(counter, currentValue);
  counter.target = target;
  counter.startValue = currentValue;
  counter.startTime = now;
  counter.duration = getDiffCounterDuration(Math.abs(target - currentValue));

  if (counter.animationFrame === undefined) {
    counter.animationFrame = requestAnimationFrame((time) => tickDiffCounter(counter, time));
  }
}

export function normalizeDiffLineCount(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

export function formatDiffLineCount(value: number): string {
  return Math.max(0, Math.floor(value)).toLocaleString();
}

function tickDiffCounter(counter: DiffCounterState, time: number): void {
  const nextValue = getInterpolatedDiffCounterValue(counter, time);
  renderDiffCounter(counter, nextValue);

  if (nextValue === counter.target) {
    counter.animationFrame = undefined;
    return;
  }

  counter.animationFrame = requestAnimationFrame((nextTime) => tickDiffCounter(counter, nextTime));
}

function getInterpolatedDiffCounterValue(counter: DiffCounterState, time: number): number {
  if (counter.duration <= 0) {
    return counter.target;
  }

  const progress = Math.min(1, Math.max(0, (time - counter.startTime) / counter.duration));
  const eased = 1 - Math.pow(1 - progress, 3);
  const value = counter.startValue + ((counter.target - counter.startValue) * eased);

  if (progress >= 1) {
    return counter.target;
  }

  return Math.round(value);
}

function renderDiffCounter(counter: DiffCounterState, value: number): void {
  const normalizedValue = normalizeDiffLineCount(value);
  const nextText = formatDiffLineCount(normalizedValue);

  if (counter.lastText === nextText && counter.value === normalizedValue) {
    return;
  }

  const previousText = counter.lastText;
  const fragment = document.createDocumentFragment();
  const sign = document.createElement('span');
  sign.className = 'composer__diff-sign';
  sign.textContent = counter.prefix;
  fragment.append(sign);

  for (let index = 0; index < nextText.length; index += 1) {
    const char = nextText[index];
    const previousIndex = previousText.length - nextText.length + index;
    const previousChar = previousIndex >= 0 ? previousText[previousIndex] : undefined;
    const span = document.createElement('span');
    const isDigit = /\d/.test(char);
    span.className = isDigit ? 'composer__diff-digit' : 'composer__diff-separator';
    span.textContent = char;

    if (isDigit && previousChar !== undefined && previousChar !== char) {
      span.classList.add('composer__diff-digit--rolling');
    }

    fragment.append(span);
  }

  counter.element.replaceChildren(fragment);
  counter.element.setAttribute('aria-label', `${counter.prefix}${nextText}`);
  counter.value = normalizedValue;
  counter.lastText = nextText;
}

function getDiffCounterDuration(delta: number): number {
  if (delta <= 0) {
    return 0;
  }

  return Math.min(2400, Math.max(600, 450 + Math.log10(delta + 1) * 650));
}

function parseDiffCounterValue(text: string | null, prefix: '+' | '-'): number {
  const normalized = (text ?? '').trim().replace(prefix, '').replace(/,/g, '');
  const value = Number(normalized);

  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}
