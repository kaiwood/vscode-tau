export type ReadyScriptStreamingBehavior = 'steer' | 'followUp';

export type ReadyScriptArmSnapshot = {
  currentRunArmed: boolean;
  queuedRuns: number;
};

export class ReadyScriptState {
  private currentRunArmed = false;
  private queuedRuns = 0;

  public armForUserPrompt(options: { streamingBehavior?: ReadyScriptStreamingBehavior; busy: boolean }): ReadyScriptArmSnapshot {
    const snapshot = this.snapshot();

    if (options.streamingBehavior === 'followUp' && options.busy) {
      this.queuedRuns += 1;
    } else {
      this.currentRunArmed = true;
    }

    return snapshot;
  }

  public restore(snapshot: ReadyScriptArmSnapshot): void {
    this.currentRunArmed = snapshot.currentRunArmed;
    this.queuedRuns = snapshot.queuedRuns;
  }

  public reset(): void {
    this.currentRunArmed = false;
    this.queuedRuns = 0;
  }

  public armQueuedRun(): void {
    if (this.currentRunArmed || this.queuedRuns === 0) {
      return;
    }

    this.currentRunArmed = true;
    this.queuedRuns -= 1;
  }

  public consumeCurrentRun(): boolean {
    if (!this.currentRunArmed) {
      return false;
    }

    this.currentRunArmed = false;
    return true;
  }

  private snapshot(): ReadyScriptArmSnapshot {
    return {
      currentRunArmed: this.currentRunArmed,
      queuedRuns: this.queuedRuns
    };
  }
}
