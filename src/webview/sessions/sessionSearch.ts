import { getSessionDisplayName } from './sessionFormat';
import type { SessionItem } from '../types';

export type SessionVisibilityFilter = {
  namedOnly?: boolean;
  matchedSessionPaths?: readonly string[];
};

export function getVisibleSessionIndexes(
  sessions: readonly SessionItem[],
  query: string,
  filter: SessionVisibilityFilter = {}
): number[] {
  if (sessions.length === 0) {
    return [];
  }

  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery && filter.matchedSessionPaths) {
    return getMatchedSessionIndexes(sessions, filter.matchedSessionPaths, filter.namedOnly);
  }

  const indexes: number[] = [];

  for (let index = 0; index < sessions.length; index += 1) {
    const session = sessions[index];

    if (filter.namedOnly && !session.name?.trim()) {
      continue;
    }

    if (normalizedQuery && !getSessionDisplayName(session).toLowerCase().includes(normalizedQuery)) {
      continue;
    }

    indexes.push(index);
  }

  return indexes;
}

function getMatchedSessionIndexes(
  sessions: readonly SessionItem[],
  matchedSessionPaths: readonly string[],
  namedOnly: boolean | undefined
): number[] {
  const sessionIndexes = new Map<string, number>();

  for (let index = 0; index < sessions.length; index += 1) {
    sessionIndexes.set(sessions[index].path, index);
  }

  const indexes: number[] = [];
  const seen = new Set<number>();

  for (const path of matchedSessionPaths) {
    const index = sessionIndexes.get(path);

    if (index === undefined || seen.has(index)) {
      continue;
    }

    if (namedOnly && !sessions[index].name?.trim()) {
      continue;
    }

    seen.add(index);
    indexes.push(index);
  }

  return indexes;
}

export function ensureVisibleSessionSelection(selectedIndex: number, visibleIndexes: readonly number[]): number {
  if (visibleIndexes.length === 0) {
    return 0;
  }

  return visibleIndexes.includes(selectedIndex) ? selectedIndex : visibleIndexes[0];
}

export function moveVisibleSessionSelection(
  selectedIndex: number,
  visibleIndexes: readonly number[],
  delta: number
): number | undefined {
  if (visibleIndexes.length === 0) {
    return undefined;
  }

  const currentPosition = visibleIndexes.indexOf(selectedIndex);
  const nextPosition = currentPosition >= 0
    ? Math.max(0, Math.min(currentPosition + delta, visibleIndexes.length - 1))
    : (delta > 0 ? 0 : visibleIndexes.length - 1);

  return visibleIndexes[nextPosition];
}
