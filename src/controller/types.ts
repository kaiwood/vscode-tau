import type { SessionDiffSnapshot } from '../diff/types';
import type { ExtensionUi } from '../extensionUi/types';
import type { TauChatSessionMetaSnapshot } from '../metadata/types';
import type { PiClientFactory } from '../pi/clientTypes';
import type { SettingValue, TauSettingId } from '../settings/settingsRegistry';
import type {
  WebviewCustomUiTheme,
  WebviewSessionItem,
  WebviewStateMessage
} from '../webviewProtocol/types';
import type { StatePublisherScheduler } from './statePublisher';

export type TauChatControllerOptions = {
  createClient: PiClientFactory;
  postState: (message: WebviewStateMessage) => void;
  showNotification: (message: string, notifyType: string) => void;
  showToast?: (message: string, kind?: 'success' | 'warning' | 'error') => void;
  extensionUi?: ExtensionUi;
  inputSecret?: (title: string, placeholder?: string, prompt?: string) => PromiseLike<string | undefined> | Promise<string | undefined>;
  openExternalUrl?: (url: string) => PromiseLike<boolean> | Promise<boolean>;
  getCwd?: () => string | undefined;
  getOutputColors?: () => boolean;
  getAnimationsEnabled?: () => boolean;
  getCustomUiTheme?: () => WebviewCustomUiTheme;
  getReadyScript?: () => string | undefined;
  getReadyScriptEnabled?: () => boolean;
  getRejectEditWriteOutsideWorkspace?: () => boolean;
  getTauSettingValues?: () => Partial<Record<TauSettingId, SettingValue>>;
  updateTauSetting?: (id: TauSettingId, value: SettingValue) => PromiseLike<void> | Promise<void> | void;
  runReadyScript?: (scriptPath: string, cwd: string | undefined) => void;
  stateScheduler?: StatePublisherScheduler;
  useMessagePatches?: boolean;
  initialSessionMeta?: TauChatSessionMetaSnapshot;
  initialSessionFile?: string;
  onSessionMetaChange?: (metadata: TauChatSessionMetaSnapshot) => void;
  onSessionFileChange?: (sessionFile: string | undefined) => void;
  writeClipboard?: (text: string) => PromiseLike<void> | Promise<void> | void;
  listSessions?: (cwd: string | undefined, currentSessionFile: string | undefined) => Promise<WebviewSessionItem[]>;
  deleteSession?: (sessionPath: string, displayName: string) => Promise<boolean>;
  renameOpenSession?: (sessionPath: string, name: string) => Promise<boolean>;
  showSessionChanges?: (sessionPath: string, displayName: string) => Promise<void>;
  loadSessionDiffSnapshot?: (sessionFile: string) => SessionDiffSnapshot | undefined;
  saveSessionDiffSnapshot?: (sessionFile: string, snapshot: SessionDiffSnapshot) => void;
};
