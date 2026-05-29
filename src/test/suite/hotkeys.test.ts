import * as assert from 'assert';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { formatTaurenHotkeys } from '../../hotkeys/hotkeys';
import { readVsCodeHotkeys } from '../../hotkeys/vscodeKeybindings';

suite('Hotkeys', () => {
  test('formats logically ordered hotkey sections with VS Code bindings', () => {
    const markdown = formatTaurenHotkeys({
      vscodeHotkeys: [
        { command: 'tauren.newSession', key: 'Cmd+N', action: 'New Session (tauren.newSession)' }
      ],
      vscodeNote: '_note_'
    });

    assert.match(markdown, /^# Tauren Hotkeys/);
    assert.ok(markdown.indexOf('## Session List') < markdown.indexOf('## Session Tree'));
    assert.ok(markdown.indexOf('## Session Tree') < markdown.indexOf('## Chat Face'));
    assert.ok(markdown.indexOf('## Chat Face') < markdown.indexOf('## VS Code Commands'));
    assert.match(markdown, /\| Cmd\+N \| New Session \(tauren\.newSession\) \|/);
    assert.ok(markdown.endsWith('_note_'));
  });

  test('discovers VS Code keys scoped to tauren sidebar focus', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tauren-hotkeys-'));
    const userKeybindingsFile = path.join(tempDir, 'keybindings.json');

    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({
      contributes: {
        commands: [
          { command: 'tauren.newSession', title: 'New Session' },
          { command: 'tauren.copyLastResponse', title: 'Copy Last Response' },
          { command: 'tauren.unscoped', title: 'Unscoped' }
        ],
        keybindings: [
          { command: 'tauren.newSession', key: 'ctrl+n', mac: 'cmd+n', when: 'tauren.sidebarFocus' },
          { command: 'tauren.unscoped', key: 'ctrl+u' }
        ]
      }
    }));
    fs.writeFileSync(userKeybindingsFile, JSON.stringify([
      { command: '-tauren.newSession', key: process.platform === 'darwin' ? 'cmd+n' : 'ctrl+n', when: 'tauren.sidebarFocus' },
      { command: 'workbench.action.files.save', key: 'ctrl+s', when: 'tauren.sidebarFocus && !inputFocus' },
      { command: 'tauren.copyLastResponse', key: 'ctrl+shift+c' }
    ]));

    const { hotkeys } = readVsCodeHotkeys(tempDir, [userKeybindingsFile]);
    const byCommand = new Map(hotkeys.map((hotkey) => [hotkey.command, hotkey]));

    assert.strictEqual(byCommand.has('tauren.newSession'), false);
    assert.strictEqual(byCommand.has('tauren.unscoped'), false);
    assert.strictEqual(byCommand.get('workbench.action.files.save')?.key, 'Ctrl+S');
    assert.strictEqual(byCommand.get('tauren.copyLastResponse')?.key, 'Ctrl+Shift+C');
  });
});
