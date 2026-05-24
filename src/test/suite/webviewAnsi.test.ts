import * as assert from 'assert';
import { getAnsiFullWidgetBackground } from '../../webview/messages/ansi';

suite('Webview ANSI helpers', () => {
  test('promotes a uniform full-widget background', () => {
    const background = getAnsiFullWidgetBackground([
      '\x1b[42mfirst line',
      '',
      '\x1b[42msecond line\x1b[0m'
    ], true);

    assert.ok(background?.includes('ansiGreen'));
  });

  test('promotes despite uncolored whitespace padding', () => {
    const background = getAnsiFullWidgetBackground([
      '\x1b[42mfirst line\x1b[0m    ',
      '  \x1b[42msecond line\x1b[0m  '
    ], true);

    assert.ok(background?.includes('ansiGreen'));
  });

  test('does not promote mixed full-widget backgrounds', () => {
    assert.strictEqual(getAnsiFullWidgetBackground([
      '\x1b[42mfirst line',
      '\x1b[41msecond line'
    ], true), undefined);
  });

  test('does not promote partially colored widget lines', () => {
    assert.strictEqual(getAnsiFullWidgetBackground([
      '\x1b[42mcolored\x1b[0m plain'
    ], true), undefined);
  });

  test('does not promote widgets without background colors', () => {
    assert.strictEqual(getAnsiFullWidgetBackground([
      'plain line',
      '\x1b[32mforeground only'
    ], true), undefined);
  });

  test('does not promote when output colors are disabled', () => {
    assert.strictEqual(getAnsiFullWidgetBackground([
      '\x1b[42mfirst line',
      '\x1b[42msecond line'
    ], false), undefined);
  });
});
