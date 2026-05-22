import * as assert from 'assert';
import { ExtensionCustomUiHost, type CustomUiHostMessage } from '../../extensionUi/customUiHost';

suite('ExtensionCustomUiHost', () => {
  test('renders, forwards input, and resolves from done callback', async () => {
    const messages: CustomUiHostMessage[] = [];
    const inputs: string[] = [];
    const host = new ExtensionCustomUiHost({
      isAvailable: () => true,
      postMessage: (message) => {
        messages.push(message);
        return true;
      },
      getOutputColors: () => true,
      notify: () => undefined
    });

    const resultPromise = host.custom<string>((_tui, _theme, _keybindings, done) => ({
      render: (width) => [`width:${width}`],
      handleInput: (data) => {
        inputs.push(data);
        done('answered');
      },
      invalidate: () => undefined
    }));
    await Promise.resolve();
    await Promise.resolve();

    const show = messages.find((message): message is { type: 'customUiShow'; id: string } => message.type === 'customUiShow');
    assert.ok(show);
    assert.deepStrictEqual(messages.find((message) => message.type === 'customUiRender'), {
      type: 'customUiRender',
      id: show.id,
      lines: ['width:80'],
      outputColors: true
    });

    host.handleInput(show.id, '\r');

    assert.strictEqual(await resultPromise, 'answered');
    assert.deepStrictEqual(inputs, ['\r']);
    assert.deepStrictEqual(messages[messages.length - 1], { type: 'customUiHide', id: show.id });
  });

  test('renders again after input and filters key releases unless requested', async () => {
    const messages: CustomUiHostMessage[] = [];
    const inputs: string[] = [];
    let value = '';
    const host = new ExtensionCustomUiHost({
      isAvailable: () => true,
      postMessage: (message) => {
        messages.push(message);
        return true;
      },
      getOutputColors: () => true,
      notify: () => undefined
    });

    const resultPromise = host.custom<string>(() => ({
      render: () => [value || '<empty>'],
      handleInput: (data) => {
        inputs.push(data);
        value += data;
      },
      invalidate: () => undefined
    }));
    await Promise.resolve();
    await Promise.resolve();

    const show = messages.find((message): message is { type: 'customUiShow'; id: string } => message.type === 'customUiShow');
    assert.ok(show);

    host.handleInput(show.id, 'x');
    await new Promise((resolve) => setTimeout(resolve, 1));

    host.handleInput(show.id, '\x1b[120;1:3u');
    await new Promise((resolve) => setTimeout(resolve, 1));

    assert.deepStrictEqual(inputs, ['x']);
    assert.ok(messages.some((message) => message.type === 'customUiRender' && message.lines[0] === 'x'));
    host.cancel(show.id);
    assert.strictEqual(await resultPromise, undefined);
  });

  test('forwards key releases to components that opt in', async () => {
    const messages: CustomUiHostMessage[] = [];
    const inputs: string[] = [];
    const host = new ExtensionCustomUiHost({
      isAvailable: () => true,
      postMessage: (message) => {
        messages.push(message);
        return true;
      },
      getOutputColors: () => true,
      notify: () => undefined
    });

    const resultPromise = host.custom<string>(() => ({
      render: () => ['ready'],
      handleInput: (data) => {
        inputs.push(data);
      },
      wantsKeyRelease: true,
      invalidate: () => undefined
    }));
    await Promise.resolve();
    await Promise.resolve();

    const show = messages.find((message): message is { type: 'customUiShow'; id: string } => message.type === 'customUiShow');
    assert.ok(show);

    host.handleInput(show.id, '\x1b[120;1:3u');
    await new Promise((resolve) => setTimeout(resolve, 1));

    assert.deepStrictEqual(inputs, ['\x1b[120;1:3u']);
    host.cancel(show.id);
    assert.strictEqual(await resultPromise, undefined);
  });

  test('updates dimensions and cancels active UI', async () => {
    const messages: CustomUiHostMessage[] = [];
    let disposed = false;
    const host = new ExtensionCustomUiHost({
      isAvailable: () => true,
      postMessage: (message) => {
        messages.push(message);
        return true;
      },
      getOutputColors: () => false,
      notify: () => undefined
    });

    const resultPromise = host.custom<string>(() => ({
      render: (width) => [`width:${width}`],
      invalidate: () => undefined,
      dispose: () => {
        disposed = true;
      }
    }));
    await Promise.resolve();
    await Promise.resolve();

    const show = messages.find((message): message is { type: 'customUiShow'; id: string } => message.type === 'customUiShow');
    assert.ok(show);

    host.updateDimensions(show.id, 100, 20);
    await new Promise((resolve) => setTimeout(resolve, 1));
    host.cancel(show.id);

    assert.strictEqual(await resultPromise, undefined);
    assert.strictEqual(disposed, true);
    assert.ok(messages.some((message) => message.type === 'customUiRender' && message.lines[0] === 'width:100'));
    assert.deepStrictEqual(messages[messages.length - 1], { type: 'customUiHide', id: show.id });
  });
});
