import * as assert from 'assert';
import { forkSession, withSessionClient } from '../../sessions/sessionClientActions';
import type { PiClient } from '../../pi/clientTypes';
import type { PiClientOptions, PiEvent } from '../../pi/types';

suite('sessionClientActions', () => {
  test('runs background actions against the selected session client', async () => {
    const client = createFakeClient();
    const clientOptions: PiClientOptions[] = [];

    const result = await withSessionClient('/sessions/background.jsonl', {
      createClient: (options) => {
        clientOptions.push(options);
        return client;
      },
      getCwd: () => '/workspace',
      onError: () => undefined
    }, async (backgroundClient) => {
      assert.strictEqual(backgroundClient, client);
      return 'done';
    });

    assert.strictEqual(result, 'done');
    assert.deepStrictEqual(clientOptions, [{
      cwd: '/workspace',
      sessionFile: '/sessions/background.jsonl'
    }]);
    assert.strictEqual(client.disposed, true);
  });

  test('forkSession returns selected fork text for callers to orchestrate', async () => {
    const client = createFakeClient({
      forkMessages: { messages: [{ entryId: 'entry-1', text: 'Original prompt' }] },
      forkResult: { cancelled: false, text: '  selected prompt  ' }
    });

    const result = await forkSession(client, {
      select: async (_title, options) => options[0]
    });

    assert.deepStrictEqual(result, { status: 'forked', text: 'selected prompt' });
  });

});

type FakeClientOptions = {
  forkMessages?: Awaited<ReturnType<PiClient['getForkMessages']>>;
  forkResult?: Awaited<ReturnType<PiClient['fork']>>;
};

type FakeClient = PiClient & {
  disposed: boolean;
  emit(event: PiEvent): void;
};

function createFakeClient(options: FakeClientOptions = {}): FakeClient {
  const eventListeners = new Set<(event: PiEvent) => void>();
  const client = {
    disposed: false,
    onEvent(listener: (event: PiEvent) => void) {
      eventListeners.add(listener);
      return () => eventListeners.delete(listener);
    },
    onError() {
      return () => undefined;
    },
    async prompt() {},
    async abort() {},
    async reload() {},
    isRunning() {
      return !client.disposed;
    },
    async getState() {
      return {};
    },
    async getSessionStats() {
      return {};
    },
    async getAvailableModels() {
      return {};
    },
    async getCommands() {
      return {};
    },
    async setModel() {
      return {};
    },
    async setThinkingLevel() {},
    async setSessionName() {},
    async compact() {
      return {};
    },
    async exportHtml() {
      return {};
    },
    async getLastAssistantText() {
      return {};
    },
    async getMessages() {
      return {};
    },
    async switchSession() {
      return {};
    },
    async getSessionTree() {
      return [];
    },
    async setTreeEntryLabel() {},
    async navigateTree() {
      return {};
    },
    async getForkMessages() {
      return options.forkMessages ?? {};
    },
    async fork() {
      return options.forkResult ?? {};
    },
    async clone() {
      return {};
    },
    dispose() {
      client.disposed = true;
    },
    emit(event: PiEvent) {
      for (const listener of [...eventListeners]) {
        listener(event);
      }
    }
  } as FakeClient;

  return client;
}
