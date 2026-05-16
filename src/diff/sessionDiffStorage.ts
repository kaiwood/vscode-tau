import * as vscode from 'vscode';
import type { SessionDiffSnapshot } from './sessionDiffTracker';

const sessionDiffSnapshotsStorageKey = 'tau.sessionDiffSnapshots';

export function createSessionDiffStatsFileWatcher(onChange: () => void): vscode.Disposable {
  const watcher = vscode.workspace.createFileSystemWatcher('**/*');
  const disposables = [
    watcher,
    watcher.onDidChange(onChange),
    watcher.onDidCreate(onChange),
    watcher.onDidDelete(onChange),
    vscode.workspace.onDidSaveTextDocument(onChange)
  ];

  return new vscode.Disposable(() => {
    for (const disposable of disposables) {
      disposable.dispose();
    }
  });
}

export function readSessionDiffSnapshot(
  workspaceState: vscode.Memento | undefined,
  sessionFile: string
): SessionDiffSnapshot | undefined {
  return readSessionDiffSnapshots(workspaceState)[sessionFile];
}

export function writeSessionDiffSnapshot(
  workspaceState: vscode.Memento | undefined,
  sessionFile: string,
  snapshot: SessionDiffSnapshot
): void {
  if (!workspaceState) {
    return;
  }

  const snapshots = readSessionDiffSnapshots(workspaceState);
  snapshots[sessionFile] = snapshot;
  void workspaceState.update(sessionDiffSnapshotsStorageKey, snapshots).then(undefined, () => undefined);
}

function readSessionDiffSnapshots(workspaceState: vscode.Memento | undefined): Record<string, SessionDiffSnapshot> {
  const value = workspaceState?.get<unknown>(sessionDiffSnapshotsStorageKey);

  if (!isRecord(value)) {
    return {};
  }

  const snapshots: Record<string, SessionDiffSnapshot> = {};

  for (const [sessionFile, snapshot] of Object.entries(value)) {
    const parsed = parseSessionDiffSnapshot(snapshot);

    if (parsed) {
      snapshots[sessionFile] = parsed;
    }
  }

  return snapshots;
}

function parseSessionDiffSnapshot(value: unknown): SessionDiffSnapshot | undefined {
  if (!isRecord(value) || !isRecord(value.stats)) {
    return undefined;
  }

  const addedLines = normalizeLineCount(value.stats.addedLines);
  const removedLines = normalizeLineCount(value.stats.removedLines);

  return { stats: { addedLines, removedLines } };
}

function normalizeLineCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
