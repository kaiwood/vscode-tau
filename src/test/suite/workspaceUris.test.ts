import * as assert from 'assert';
import * as os from 'node:os';
import * as path from 'node:path';
import { promises as fs } from 'node:fs';
import * as vscode from 'vscode';
import { resolveFileReferenceUriInFolders, resolveWorkspaceFileUriInFolders } from '../../workspace/workspaceUris';

suite('workspaceUris', () => {
  test('resolves relative file paths inside the first workspace folder', async () => {
    await withTempWorkspace(async ([workspace]) => {
      const uri = resolveWorkspaceFileUriInFolders('src/file.ts', workspaceFolders([workspace]));

      assert.strictEqual(uri?.toString(), vscode.Uri.file(path.join(workspace, 'src/file.ts')).toString());
    });
  });

  test('rejects relative file paths outside the first workspace folder', async () => {
    await withTempWorkspace(async ([workspace]) => {
      assert.strictEqual(resolveWorkspaceFileUriInFolders('../outside.ts', workspaceFolders([workspace])), undefined);
    });
  });

  test('resolves relative file paths against the first workspace folder', async () => {
    await withTempWorkspace(async ([firstWorkspace, secondWorkspace]) => {
      const uri = resolveWorkspaceFileUriInFolders('src/file.ts', workspaceFolders([firstWorkspace, secondWorkspace]));

      assert.strictEqual(uri?.toString(), vscode.Uri.file(path.join(firstWorkspace, 'src/file.ts')).toString());
    }, 2);
  });

  test('resolves absolute file paths inside any workspace folder', async () => {
    await withTempWorkspace(async ([firstWorkspace, secondWorkspace]) => {
      const filePath = path.join(secondWorkspace, 'src/file.ts');
      const uri = resolveWorkspaceFileUriInFolders(filePath, workspaceFolders([firstWorkspace, secondWorkspace]));

      assert.strictEqual(uri?.toString(), vscode.Uri.file(filePath).toString());
    }, 2);
  });

  test('resolves absolute file paths inside a workspace folder', async () => {
    await withTempWorkspace(async ([workspace]) => {
      const filePath = path.join(workspace, 'src/file.ts');
      const uri = resolveWorkspaceFileUriInFolders(filePath, workspaceFolders([workspace]));

      assert.strictEqual(uri?.toString(), vscode.Uri.file(filePath).toString());
    });
  });

  test('resolves file URIs inside a workspace folder', async () => {
    await withTempWorkspace(async ([workspace]) => {
      const filePath = path.join(workspace, 'src/file with spaces.ts');
      const uri = resolveWorkspaceFileUriInFolders(vscode.Uri.file(filePath).toString(), workspaceFolders([workspace]));

      assert.strictEqual(uri?.toString(), vscode.Uri.file(filePath).toString());
    });
  });

  test('rejects URI schemes other than file', async () => {
    await withTempWorkspace(async ([workspace]) => {
      assert.strictEqual(resolveWorkspaceFileUriInFolders('https://example.com/file.ts', workspaceFolders([workspace])), undefined);
    });
  });

  test('unrestricted references resolve absolute file paths outside workspace folders', async () => {
    const outsideDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tauren-outside-'));

    try {
      await withTempWorkspace(async ([workspace]) => {
        const filePath = path.join(outsideDir, 'outside.ts');
        const uri = resolveFileReferenceUriInFolders(filePath, workspaceFolders([workspace]));

        assert.strictEqual(uri?.toString(), vscode.Uri.file(filePath).toString());
      });
    } finally {
      await fs.rm(outsideDir, { recursive: true, force: true });
    }
  });

  test('unrestricted references resolve relative traversal from the first workspace folder', async () => {
    await withTempWorkspace(async ([workspace]) => {
      const uri = resolveFileReferenceUriInFolders('../outside.ts', workspaceFolders([workspace]));

      assert.strictEqual(uri?.toString(), vscode.Uri.file(path.resolve(workspace, '../outside.ts')).toString());
    });
  });

  test('rejects absolute file paths outside workspace folders', async () => {
    const outsideDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tauren-outside-'));

    try {
      await withTempWorkspace(async ([workspace]) => {
        assert.strictEqual(resolveWorkspaceFileUriInFolders(path.join(outsideDir, 'outside.ts'), workspaceFolders([workspace])), undefined);
      });
    } finally {
      await fs.rm(outsideDir, { recursive: true, force: true });
    }
  });

  test('rejects relative file paths when no workspace is open', () => {
    assert.strictEqual(resolveWorkspaceFileUriInFolders('src/file.ts', []), undefined);
  });
});

function workspaceFolders(folderPaths: string[]): Array<Pick<vscode.WorkspaceFolder, 'uri'>> {
  return folderPaths.map((folderPath) => ({ uri: vscode.Uri.file(folderPath) }));
}

async function withTempWorkspace(run: (folders: string[]) => Promise<void>, count = 1): Promise<void> {
  const folderPaths = await Promise.all(Array.from({ length: count }, () => fs.mkdtemp(path.join(os.tmpdir(), 'tauren-workspace-'))));

  try {
    await run(folderPaths);
  } finally {
    await Promise.all(folderPaths.map((folderPath) => fs.rm(folderPath, { recursive: true, force: true })));
  }
}
