import type { ExtensionUiRequestUi } from '../extensionUi/requestHandler';
import type { PiRpcClientLike } from '../rpc/clientTypes';
import type {
  ExtensionUiResponse,
  PiAvailableCommands,
  PiAvailableModels,
  PiCloneResult,
  PiCompactResult,
  PiExportHtmlResult,
  PiForkMessagesResult,
  PiForkResult,
  PiLastAssistantText,
  PiMessagesResult,
  PiModel,
  PiNavigateTreeResult,
  PiPromptStreamingBehavior,
  PiRpcClientOptions,
  PiSessionState,
  PiSessionStats,
  PiSwitchSessionResult,
  RpcEvent
} from '../rpc/types';
import type { PiSdkLoader } from './piSdkLoader';

const unavailableMessage = 'Pi SDK integration is not available yet.';

export type PiSdkClientOptions = PiRpcClientOptions & {
  extensionUi?: ExtensionUiRequestUi;
  loadSdk?: PiSdkLoader;
  showNotification?: (message: string, notifyType: string) => void;
};

export class PiSdkClient implements PiRpcClientLike {
  public constructor(_options: PiSdkClientOptions = {}) {}

  public isRunning(): boolean {
    return false;
  }

  public onEvent(_listener: (event: RpcEvent) => void): () => void {
    return () => {};
  }

  public onError(_listener: (message: string) => void): () => void {
    return () => {};
  }

  public prompt(_message: string, _streamingBehavior?: PiPromptStreamingBehavior): Promise<void> {
    return this.unavailable();
  }

  public abort(): Promise<void> {
    return this.unavailable();
  }

  public reload(): Promise<void> {
    return this.unavailable();
  }

  public getState(): Promise<PiSessionState> {
    return this.unavailable();
  }

  public getSessionStats(): Promise<PiSessionStats> {
    return this.unavailable();
  }

  public getAvailableModels(): Promise<PiAvailableModels> {
    return this.unavailable();
  }

  public getCommands(): Promise<PiAvailableCommands> {
    return this.unavailable();
  }

  public setModel(_provider: string, _modelId: string): Promise<PiModel> {
    return this.unavailable();
  }

  public setThinkingLevel(_level: string): Promise<void> {
    return this.unavailable();
  }

  public setSessionName(_name: string): Promise<void> {
    return this.unavailable();
  }

  public compact(_customInstructions?: string): Promise<PiCompactResult> {
    return this.unavailable();
  }

  public exportHtml(_outputPath?: string): Promise<PiExportHtmlResult> {
    return this.unavailable();
  }

  public getLastAssistantText(): Promise<PiLastAssistantText> {
    return this.unavailable();
  }

  public getMessages(): Promise<PiMessagesResult> {
    return this.unavailable();
  }

  public switchSession(_sessionPath: string): Promise<PiSwitchSessionResult> {
    return this.unavailable();
  }

  public navigateTree(
    _entryId: string,
    _options: { summarize?: boolean; customInstructions?: string } = {}
  ): Promise<PiNavigateTreeResult> {
    return this.unavailable();
  }

  public getForkMessages(): Promise<PiForkMessagesResult> {
    return this.unavailable();
  }

  public fork(_entryId: string): Promise<PiForkResult> {
    return this.unavailable();
  }

  public clone(): Promise<PiCloneResult> {
    return this.unavailable();
  }

  public respondExtensionUiRequest(_response: ExtensionUiResponse): Promise<void> {
    return Promise.resolve();
  }

  public dispose(): void {}

  private unavailable<T>(): Promise<T> {
    return Promise.reject(new Error(unavailableMessage));
  }
}
