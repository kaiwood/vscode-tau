import * as assert from 'assert';
import { isTextInputKeyboardEvent, terminalDataForKeyboardEvent } from '../../webview/custom/customUi';

suite('Webview custom UI keyboard helpers', () => {
  test('keeps legacy terminal data for key press compatibility', () => {
    assert.strictEqual(terminalDataForKeyboardEvent(keyEvent({ key: 'Enter' })), '\r');
    assert.strictEqual(terminalDataForKeyboardEvent(keyEvent({ key: 'ArrowUp' })), '\x1b[A');
    assert.strictEqual(terminalDataForKeyboardEvent(keyEvent({ key: 'c', ctrlKey: true })), '\x03');
    assert.strictEqual(terminalDataForKeyboardEvent(keyEvent({ key: 'x', altKey: true })), '\x1bx');
  });

  test('encodes repeats and releases as Kitty-compatible strings', () => {
    assert.strictEqual(terminalDataForKeyboardEvent(keyEvent({ key: 'w' }), 'release'), '\x1b[119;1:3u');
    assert.strictEqual(terminalDataForKeyboardEvent(keyEvent({ key: 'W', shiftKey: true }), 'release'), '\x1b[87;2:3u');
    assert.strictEqual(terminalDataForKeyboardEvent(keyEvent({ key: 'ArrowUp' }), 'repeat'), '\x1b[1;1:2A');
    assert.strictEqual(terminalDataForKeyboardEvent(keyEvent({ key: 'ArrowUp' }), 'release'), '\x1b[1;1:3A');
    assert.strictEqual(terminalDataForKeyboardEvent(keyEvent({ key: ' ', ctrlKey: true }), 'release'), '\x1b[32;5:3u');
  });

  test('detects plain text keys that should be handled by beforeinput', () => {
    assert.strictEqual(isTextInputKeyboardEvent(keyEvent({ key: 'a' })), true);
    assert.strictEqual(isTextInputKeyboardEvent(keyEvent({ key: 'é' })), true);
    assert.strictEqual(isTextInputKeyboardEvent(keyEvent({ key: 'a', ctrlKey: true })), false);
    assert.strictEqual(isTextInputKeyboardEvent(keyEvent({ key: 'a', altKey: true })), false);
    assert.strictEqual(isTextInputKeyboardEvent(keyEvent({ key: 'Enter' })), false);
  });
});

type KeyEventOptions = {
  key: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
};

function keyEvent(options: KeyEventOptions): KeyboardEvent {
  return {
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    ...options
  } as KeyboardEvent;
}
