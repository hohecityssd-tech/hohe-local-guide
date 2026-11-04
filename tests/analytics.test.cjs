const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const source = readFileSync(require('node:path').join(__dirname, '../analytics.js'), 'utf8');

function page(choice, language = 'en', blockedStorage = false) {
  const nodes = [];
  function element(tag) {
    const node = { tag, children: [], style: {}, listeners: {},
      appendChild(child) { this.children.push(child); return child; },
      append(...children) { this.children.push(...children); },
      insertBefore(child) { this.children.push(child); },
      setAttribute() {}, querySelector() { return null; },
      addEventListener(name, fn) { this.listeners[name] = fn; },
      remove() { this.removed = true; }, click() { this.listeners.click(); }
    };
    nodes.push(node); return node;
  }
  const intro = element('section');
  const document = { head: element('head'), body: element('body'),
    createElement: element, querySelector: () => intro };
  const timers = [], navigations = [];
  const window = { localStorage: {
    getItem() { if (blockedStorage) throw Error(); return choice; },
    setItem(_, value) { if (blockedStorage) throw Error(); choice = value; }
  }, location: { origin: 'https://example.com', pathname: '/', search: '?src=qr&private=secret',
    href: 'https://example.com/?src=qr&private=secret', assign: url => navigations.push(url) },
    setTimeout: fn => timers.push(fn) };
  vm.runInNewContext(source, { window, document, URL, URLSearchParams });
  window.HOHEAnalytics.init(language);
  const events = () => (window.dataLayer || []).filter(e => e[0] === 'event');
  const select = nodes.find(n => n.tag === 'select');
  const settings = () => nodes.find(n => n.className === 'hohe-analytics-settings').click();
  const consent = allow => {
    const banner = nodes.findLast(n => n.className === 'hohe-analytics-banner' && !n.removed);
    banner.children.at(-1).children[allow ? 1 : 0].click();
  };
  return { window, document, nodes, events, select, settings, consent, timers, navigations };
}

for (const [language, group] of Object.entries({en:'EN',ja:'JP',zhHans:'CN',zhHant:'CN',ko:'KR'})) {
  test(`consented initial display: ${language}`, () => {
    const p = page('granted', language);
    assert.deepEqual(Array.from(p.events(), e => e[1]), ['page_view', 'guide_language_view']);
    for (const e of p.events()) {
      assert.equal(e[2].guide_language, language);
      assert.equal(e[2].guide_language_group, group);
    }
    assert.equal(p.events()[0][2].page_location, 'https://example.com/');
    p.window.HOHEAnalytics.init(language);
    assert.equal(p.events().length, 2);
  });
}
for (const choice of [null, 'denied']) {
  test(`no tracking before consent (${choice}) and language still changes`, () => {
    const p = page(choice);
    p.window.HOHEAnalytics.placeOpen({ name: 'test' });
    p.select.value = 'ja'; p.select.listeners.change();
    assert.equal(p.events().length, 0);
    assert.equal(p.document.head.children.filter(n => n.tag === 'script').length, 0);
    assert.equal(new URL(p.navigations[0]).searchParams.get('lang'), 'ja');
  });
}
test('consent, withdrawal and re-consent do not duplicate initial views', () => {
  const p = page(null, 'ja');
  p.consent(true);
  assert.equal(p.events().length, 2);
  p.settings(); p.consent(false);
  p.window.HOHEAnalytics.placeOpen({ name: 'ignored' });
  assert.equal(p.events().length, 2);
  assert.equal(p.window['ga-disable-G-TML12HSGK4'], true);
  p.settings(); p.consent(true);
  p.window.HOHEAnalytics.placeOpen({ name: 'test' });
  assert.equal(p.events().length, 3);
  assert.equal(p.document.head.children.filter(n => n.tag === 'script').length, 1);
});
test('language change records source and destination and navigation cannot stall', () => {
  const p = page('granted', 'ja');
  p.select.value = 'ja'; p.select.listeners.change();
  assert.equal(p.events().length, 2);
  p.select.value = 'zhHant'; p.select.listeners.change();
  const e = p.events().at(-1);
  assert.equal(e[1], 'guide_language_change');
  assert.equal(e[2].previous_guide_language, 'ja');
  assert.equal(e[2].guide_language, 'zhHant');
  assert.equal(e[2].guide_language_group, 'CN');
  p.timers[0](); e[2].event_callback();
  assert.equal(p.navigations.length, 1);
  assert.equal(new URL(p.navigations[0]).searchParams.get('lang'), 'zh-TW');
});
test('blocked storage still supports explicit consent on this page', () => {
  const p = page(null, 'ko', true);
  p.consent(true);
  assert.equal(p.events().at(-1)[2].guide_language_group, 'KR');
});
