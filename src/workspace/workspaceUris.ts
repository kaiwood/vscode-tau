import * as path from 'node:path';
import * as vscode from 'vscode';

type WorkspaceFolderLike = Pick<vscode.WorkspaceFolder, 'uri'>;

export function resolveWorkspaceFileUri(filePath: string): vscode.Uri | undefined {
  return resolveWorkspaceFileUriInFolders(filePath, vscode.workspace.workspaceFolders ?? []);
}

export function resolveFileReferenceUri(filePath: string): vscode.Uri | undefined {
  return resolveFileReferenceUriInFolders(filePath, vscode.workspace.workspaceFolders ?? []);
}

export function resolveWorkspaceFileUriInFolders(filePath: string, workspaceFolders: readonly WorkspaceFolderLike[]): vscode.Uri | undefined {
  const uri = resolveFileReferenceUriInFolders(filePath, workspaceFolders);
  return uri ? resolveAbsoluteWorkspaceUri(uri.fsPath, workspaceFolders) : undefined;
}

export function resolveFileReferenceUriInFolders(filePath: string, workspaceFolders: readonly WorkspaceFolderLike[]): vscode.Uri | undefined {
  const normalizedInput = filePath.trim();

  if (!normalizedInput) {
    return undefined;
  }

  if (/^file:/i.test(normalizedInput)) {
    try {
      return vscode.Uri.parse(normalizedInput);
    } catch {
      return undefined;
    }
  }

  if (path.isAbsolute(normalizedInput)) {
    return vscode.Uri.file(path.normalize(normalizedInput));
  }

  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(normalizedInput)) {
    return undefined;
  }

  const workspaceFolder = workspaceFolders[0];

  if (!workspaceFolder) {
    return undefined;
  }

  return vscode.Uri.file(path.resolve(workspaceFolder.uri.fsPath, normalizedInput));
}

export function resolveWorkspaceImageUri(src: string): vscode.Uri | undefined {
  const decodedPath = decodeImagePath(src);

  if (!decodedPath) {
    return undefined;
  }

  if (decodedPath.startsWith('file:')) {
    try {
      const uri = vscode.Uri.parse(decodedPath);
      return resolveAbsoluteWorkspaceUri(uri.fsPath) ?? uri;
    } catch {
      return undefined;
    }
  }

  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(decodedPath)) {
    return undefined;
  }

  if (path.isAbsolute(decodedPath)) {
    return resolveAbsoluteWorkspaceUri(decodedPath);
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    return undefined;
  }

  return resolveRelativeWorkspaceUri(workspaceFolder, decodedPath);
}

export function isSupportedLocalImagePath(filePath: string): boolean {
  return /\.(?:png|jpe?g|gif|webp)$/i.test(filePath);
}

export function isUriInsideWorkspace(uri: vscode.Uri): boolean {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);

  if (workspaceFolder) {
    return true;
  }

  return (vscode.workspace.workspaceFolders ?? []).some((folder) => isPathInsidePath(uri.fsPath, folder.uri.fsPath));
}

function decodeImagePath(src: string): string | undefined {
  const withoutFragment = src.split('#', 1)[0]?.split('?', 1)[0]?.trim() ?? '';

  if (!withoutFragment) {
    return undefined;
  }

  try {
    return decodeURIComponent(withoutFragment);
  } catch {
    return withoutFragment;
  }
}

function resolveAbsoluteWorkspaceUri(
  filePath: string,
  workspaceFolders: readonly WorkspaceFolderLike[] = vscode.workspace.workspaceFolders ?? []
): vscode.Uri | undefined {
  const normalizedPath = path.normalize(filePath);
  const workspaceFolder = workspaceFolders.find((folder) => isPathInsidePath(normalizedPath, folder.uri.fsPath));

  if (!workspaceFolder) {
    return undefined;
  }

  const relativePath = path.relative(workspaceFolder.uri.fsPath, normalizedPath);
  return resolveRelativeWorkspaceUri(workspaceFolder, relativePath);
}

function resolveRelativeWorkspaceUri(workspaceFolder: WorkspaceFolderLike, relativePath: string): vscode.Uri {
  const parts = relativePath.replace(/\\/g, '/').split('/').filter((part) => part.length > 0);
  return vscode.Uri.joinPath(workspaceFolder.uri, ...parts);
}

function isPathInsidePath(candidatePath: string, rootPath: string): boolean {
  const relativePath = path.relative(rootPath, candidatePath);
  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));
}
