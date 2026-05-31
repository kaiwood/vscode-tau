import * as assert from 'assert';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { SessionSearchIndex, readSessionTranscriptExcerpt } from '../../sessions/sessionSearchIndex';
import type { WebviewSessionItem } from '../../webviewProtocol/types';

suite('Session search index', () => {
  test('indexes capped user and assistant transcript text', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'tauren-session-search-index-'));

    try {
      const sessionPath = join(dir, 'session.jsonl');
      await writeFile(sessionPath, [
        JSON.stringify({ type: 'session', id: 'session', cwd: '/workspace' }),
        JSON.stringify({ type: 'message', message: { role: 'user', content: 'alpha beta gamma' } }),
        JSON.stringify({ type: 'message', message: { role: 'assistant', content: [{ type: 'text', text: 'delta epsilon' }] } }),
        JSON.stringify({ type: 'message', message: { role: 'tool', content: 'ignored tool output' } })
      ].join('\n') + '\n');

      assert.strictEqual(await readSessionTranscriptExcerpt(sessionPath, 16), 'alpha beta gamma');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('searches light data immediately and transcript data after indexing', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'tauren-session-search-index-'));

    try {
      const sessionPath = join(dir, 'session.jsonl');
      await writeFile(sessionPath, [
        JSON.stringify({ type: 'session', id: 'session', cwd: '/workspace' }),
        JSON.stringify({ type: 'message', message: { role: 'user', content: 'hidden transcript needle' } })
      ].join('\n') + '\n');

      const index = new SessionSearchIndex({ transcriptLimit: 50 * 1024 });
      index.setSessions([createSession({ path: sessionPath, firstMessage: 'visible title' })]);

      assert.deepStrictEqual(index.search('visible').matchedSessionPaths, [sessionPath]);
      assert.deepStrictEqual(index.search('needle').matchedSessionPaths, []);

      await new Promise<void>((resolve) => {
        index.startIndexing(() => {
          if (index.getProgress().indexedCount === 1) {
            resolve();
          }
        });
      });

      assert.deepStrictEqual(index.search('needle').matchedSessionPaths, [sessionPath]);
      assert.strictEqual(index.getProgress().indexedCount, 1);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

function createSession(overrides: Partial<WebviewSessionItem>): WebviewSessionItem {
  return {
    path: overrides.path ?? '/sessions/session.jsonl',
    id: overrides.id ?? 'session',
    cwd: overrides.cwd ?? '/workspace/project',
    name: overrides.name,
    parentSessionPath: overrides.parentSessionPath,
    created: overrides.created ?? '2026-01-01T00:00:00.000Z',
    modified: overrides.modified ?? '2026-01-01T00:00:00.000Z',
    messageCount: overrides.messageCount ?? 1,
    firstMessage: overrides.firstMessage ?? '',
    metadataState: overrides.metadataState,
    depth: overrides.depth ?? 0,
    isLast: overrides.isLast ?? true,
    ancestorContinues: overrides.ancestorContinues ?? [],
    current: overrides.current ?? false,
    liveStatus: overrides.liveStatus,
    unread: overrides.unread,
    customUiOpen: overrides.customUiOpen
  };
}
