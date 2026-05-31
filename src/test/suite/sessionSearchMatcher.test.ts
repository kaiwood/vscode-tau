import * as assert from 'assert';
import {
  filterAndSortSessionSearchItems,
  matchSessionSearchText,
  parseSessionSearchQuery
} from '../../sessions/sessionSearchMatcher';

suite('Session search matcher', () => {
  test('matches fuzzy tokens against session search text', () => {
    const parsed = parseSessionSearchQuery('slist');

    assert.strictEqual(matchSessionSearchText('Session List Improvements', parsed).matches, true);
    assert.strictEqual(matchSessionSearchText('unrelated text', parsed).matches, false);
  });

  test('matches quoted phrases after whitespace normalization', () => {
    const parsed = parseSessionSearchQuery('"session list"');

    assert.strictEqual(matchSessionSearchText('Debug the session\n\nlist renderer', parsed).matches, true);
    assert.strictEqual(matchSessionSearchText('Debug session virtual list renderer', parsed).matches, false);
  });

  test('matches regex queries and treats invalid regex as no matches', () => {
    const valid = parseSessionSearchQuery('re:session\\s+list');
    const invalid = parseSessionSearchQuery('re:[');

    assert.strictEqual(matchSessionSearchText('Session list renderer', valid).matches, true);
    assert.deepStrictEqual(filterAndSortSessionSearchItems([
      { path: '/one', text: 'Session list renderer' }
    ], 're:['), []);
    assert.ok(invalid.error);
  });

  test('filters named sessions and sorts by relevance', () => {
    const sessions = [
      { path: '/later', name: 'Later work', text: 'other content', modifiedTime: 20 },
      { path: '/exact', name: 'Exact', text: 'session list content', modifiedTime: 10 },
      { path: '/fuzzy', text: 'sxxexxssxxixxoxxn list', modifiedTime: 30 }
    ];

    assert.deepStrictEqual(filterAndSortSessionSearchItems(sessions, 'session', { namedOnly: true }), ['/exact']);
    assert.deepStrictEqual(filterAndSortSessionSearchItems(sessions, 'session'), ['/exact', '/fuzzy']);
  });
});
