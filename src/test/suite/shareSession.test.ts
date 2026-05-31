import * as assert from 'assert';
import {
  formatShareTranscriptMessage,
  getShareViewerUrl,
  parseGistCreateOutput
} from '../../controller/shareSession';

suite('Share session', () => {
  test('parses gist create output', () => {
    assert.deepStrictEqual(
      parseGistCreateOutput('https://gist.github.com/kaiwood/abc123def456\n'),
      { gistUrl: 'https://gist.github.com/kaiwood/abc123def456', gistId: 'abc123def456' }
    );
    assert.deepStrictEqual(
      parseGistCreateOutput('Creating gist...\nhttps://gist.github.com/kaiwood/abc123def456\n'),
      { gistUrl: 'https://gist.github.com/kaiwood/abc123def456', gistId: 'abc123def456' }
    );
    assert.strictEqual(parseGistCreateOutput('no url here'), undefined);
  });

  test('formats share viewer links', () => {
    const previousViewerUrl = process.env.PI_SHARE_VIEWER_URL;

    try {
      delete process.env.PI_SHARE_VIEWER_URL;
      assert.strictEqual(getShareViewerUrl('abc123'), 'https://kaiwood.github.io/vscode-tauren/share/#abc123');
      assert.strictEqual(getShareViewerUrl('abc123', { useTaurenShareViewer: false }), 'https://pi.dev/session/#abc123');

      process.env.PI_SHARE_VIEWER_URL = 'https://example.test/viewer/';
      assert.strictEqual(getShareViewerUrl('abc123'), 'https://example.test/viewer/#abc123');
      assert.strictEqual(getShareViewerUrl('abc123', { useTaurenShareViewer: false }), 'https://example.test/viewer/#abc123');
    } finally {
      if (previousViewerUrl === undefined) {
        delete process.env.PI_SHARE_VIEWER_URL;
      } else {
        process.env.PI_SHARE_VIEWER_URL = previousViewerUrl;
      }
    }
  });

  test('formats transcript message with markdown links', () => {
    assert.strictEqual(
      formatShareTranscriptMessage({
        shareUrl: 'https://kaiwood.github.io/vscode-tauren/share/#abc123',
        gistUrl: 'https://gist.github.com/kaiwood/abc123'
      }),
      'Shared session.\n\nShare URL: [https://kaiwood.github.io/vscode-tauren/share/#abc123](https://kaiwood.github.io/vscode-tauren/share/#abc123)\n\nGist: [https://gist.github.com/kaiwood/abc123](https://gist.github.com/kaiwood/abc123)'
    );
  });
});
