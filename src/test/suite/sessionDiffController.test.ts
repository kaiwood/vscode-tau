import * as assert from 'assert';
import { SessionDiffController } from '../../diff/sessionDiffController';
import type { SessionDiffSnapshot, SessionDiffStats } from '../../diff/types';

suite('SessionDiffController', () => {
  test('ignores stale in-flight refresh after switching session files', async () => {
    const oldSessionFile = '/tmp/tauren-old-session.jsonl';
    const newSessionFile = '/tmp/tauren-new-session.jsonl';
    const pendingRestores = new Map<string, Deferred<SessionDiffStats | undefined>>();
    const savedSnapshots = new Map<string, SessionDiffSnapshot>();
    let postStateCount = 0;

    const controller = new SessionDiffController({
      initialSessionFile: oldSessionFile,
      getSessionGeneration: () => 0,
      postState: () => {
        postStateCount += 1;
      },
      saveSnapshot: (sessionFile, snapshot) => {
        savedSnapshots.set(sessionFile, snapshot);
      },
      restoreStatsFromSessionFile: (sessionFile) => {
        const deferred = createDeferred<SessionDiffStats | undefined>();
        pendingRestores.set(sessionFile, deferred);
        return deferred.promise;
      }
    });

    const oldRefresh = controller.refresh();
    assert.ok(pendingRestores.has(oldSessionFile));

    controller.applySessionFile(newSessionFile);
    const newRefresh = controller.refresh();
    assert.ok(pendingRestores.has(newSessionFile));

    pendingRestores.get(newSessionFile)?.resolve({ addedLines: 1, removedLines: 0 });
    await newRefresh;

    assert.deepStrictEqual(controller.getStats(), { addedLines: 1, removedLines: 0 });
    assert.strictEqual(postStateCount, 1);

    pendingRestores.get(oldSessionFile)?.resolve({ addedLines: 9, removedLines: 9 });
    await oldRefresh;

    assert.deepStrictEqual(controller.getStats(), { addedLines: 1, removedLines: 0 });
    assert.deepStrictEqual(savedSnapshots.get(newSessionFile), { stats: { addedLines: 1, removedLines: 0 } });
    assert.strictEqual(savedSnapshots.has(oldSessionFile), false);
    assert.strictEqual(postStateCount, 1);
  });
});

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

function createDeferred<T>(): Deferred<T> {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}
