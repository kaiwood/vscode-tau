import * as assert from 'node:assert';
import * as os from 'node:os';
import * as path from 'node:path';
import { promises as fs } from 'node:fs';
import { assertWorkspaceMutationAllowed } from '../../sdk/workspaceMutationGuard';

suite('workspaceMutationGuard', () => {
  test('allows paths inside the workspace', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tauren-guard-'));

    try {
      await fs.mkdir(path.join(root, 'src'));
      await assert.doesNotReject(assertWorkspaceMutationAllowed(path.join(root, 'src', 'file.ts'), {
        workspaceRoot: root,
        shouldReject: () => true
      }, 'edit'));
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  test('rejects paths outside the workspace when enabled', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tauren-guard-'));
    const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'tauren-outside-'));

    try {
      await assert.rejects(assertWorkspaceMutationAllowed(path.join(outside, 'file.ts'), {
        workspaceRoot: root,
        shouldReject: () => true
      }, 'write'), /outside the workspace/);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
      await fs.rm(outside, { recursive: true, force: true });
    }
  });

  test('allows outside paths when disabled', async () => {
    await assert.doesNotReject(assertWorkspaceMutationAllowed('/outside-workspace/file.ts', {
      workspaceRoot: '/workspace',
      shouldReject: () => false
    }, 'write'));
  });
});
