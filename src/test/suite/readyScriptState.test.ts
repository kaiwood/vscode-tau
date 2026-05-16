import * as assert from 'assert';
import { ReadyScriptState } from '../../readyScriptState';

suite('ReadyScriptState', () => {
  test('arms immediate user prompts for the current run', () => {
    const state = new ReadyScriptState();

    state.armForUserPrompt({ busy: false });

    assert.strictEqual(state.consumeCurrentRun(), true);
    assert.strictEqual(state.consumeCurrentRun(), false);
  });

  test('queues busy follow-ups until the next agent run starts', () => {
    const state = new ReadyScriptState();

    state.armForUserPrompt({ streamingBehavior: 'followUp', busy: true });

    assert.strictEqual(state.consumeCurrentRun(), false);
    state.armQueuedRun();
    assert.strictEqual(state.consumeCurrentRun(), true);
  });

  test('restores snapshots after failed prompt submission', () => {
    const state = new ReadyScriptState();
    const snapshot = state.armForUserPrompt({ busy: false });

    state.restore(snapshot);

    assert.strictEqual(state.consumeCurrentRun(), false);
  });
});
