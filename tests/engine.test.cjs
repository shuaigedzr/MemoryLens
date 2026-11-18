const { test } = require('node:test');
const assert = require('node:assert/strict');
const M = require('../engine.js');
const NOW = Date.parse('2026-11-17T16:00:00Z');
class Storage { constructor() { this.items = new Map(); } getItem(k) { return this.items.get(k) ?? null; } setItem(k, v) { this.items.set(k, v); } }
function setup(name = 'A · Explain') { const storage = new Storage(), store = new M.Store(storage, () => NOW); store.load(); store.loadFixture(name); return { storage, store }; }
test('A: only relevant study records influence the plan; trace identifies excluded topic', () => {
  const { store } = setup(); const d = store.decide('plan'); assert.deepEqual(d.selected, ['env', 'dur']);
  assert.equal(d.trace.find(x => x.id === 'other').outcome, 'excluded');
  assert.match(M.renderPlan(store.state, d).join(' '), /quiet.*25 minutes/);
});
test('Task change selects a different subset with explicit exclusion', () => {
  const { store } = setup(); const d = store.decide('session'); assert.deepEqual(d.selected, ['dur']);
  assert.match(d.trace.find(x => x.id === 'env').reason, /not needed/);
});
test('B: recent but wrong preference is correctable, source history retained, reload survives', () => {
  const { storage, store } = setup('B · Correct'); const old = store.decide('plan');
  store.correct('env', 'environment', 'collaborative'); const reloaded = new M.Store(storage, () => NOW); reloaded.load();
  const d = reloaded.decide('plan'); assert.match(M.renderPlan(reloaded.state, d).join(' '), /collaborative/);
  const m = reloaded.state.memories.find(x => x.id === 'env'); assert.equal(m.sources.length, 2); assert.match(m.sources[0].quote, /quiet/); assert.match(m.sources[1].quote, /collaborative/);
  assert.throws(() => M.renderPlan(store.state, old), { code: 'STALE_PLAN' });
});
test('Persistent undo restores corrected value and former source, not only visible text', () => {
  const { storage, store } = setup('B · Correct'); store.correct('env', 'environment', 'collaborative');
  const r = new M.Store(storage, () => NOW); r.load(); r.undo(); assert.equal(r.state.memories[0].value, 'quiet'); assert.equal(r.state.memories[0].sources.length, 1);
  assert.equal(new M.Store(storage).load().memories[0].value, 'quiet'); assert.equal(r.state.undo, null);
});
test('C: conflicting values block output even when one is newer', () => {
  const { store } = setup('C · Conflict'); const d = store.decide('plan'); assert.equal(d.status, 'needs-confirmation');
  assert.equal(d.issues[0].code, 'conflict'); assert.equal(M.renderPlan(store.state, d), null); assert.ok(!d.selected.includes('env2'));
});
test('Conflict correction supersedes other active value, regeneration and undo are coherent', () => {
  const { store } = setup('C · Conflict'); store.correct('env', 'environment', 'collaborative');
  assert.equal(store.decide('plan').status, 'ready'); assert.equal(store.state.memories.find(x => x.id === 'env2').status, 'superseded');
  store.undo(); assert.equal(store.decide('plan').issues[0].code, 'conflict');
});
test('C: stale record requires review; confirmation leaves original timestamp honest', () => {
  const { store } = setup('C · Stale'); const before = store.state.memories[0].sources[0].at;
  assert.equal(store.decide('plan').issues[0].code, 'stale'); store.correct('env', 'environment', 'quiet');
  assert.equal(store.decide('plan').status, 'ready'); assert.equal(store.state.memories[0].sources[0].at, before);
});
test('C: missing source cannot be presented as current evidence', () => {
  const { store } = setup('C · Missing evidence'); assert.equal(store.decide('plan').issues[0].code, 'evidence');
});
test('An inferred source also requires confirmation', () => {
  const s = M.fixture('A · Explain', NOW); s.memories[0].sources[0].evidence = 'inferred'; assert.equal(M.analyse(s, 'place', NOW).issues[0].code, 'evidence');
});
test('Ignore is request-scoped, persists no changed preference, and gives a generic fallback', () => {
  const { store } = setup('C · Conflict'); const before = JSON.stringify(store.state.memories);
  const d = store.decide('plan', ['environment']); assert.equal(d.status, 'ready'); assert.match(M.renderPlan(store.state, d).join(' '), /no stored location preference/);
  assert.equal(JSON.stringify(store.state.memories), before); assert.equal(store.decide('plan').status, 'needs-confirmation');
});
test('Cancel records the action without changing memories', () => {
  const { store } = setup('C · Conflict'); const before = JSON.stringify(store.state.memories); store.cancel('plan'); assert.equal(JSON.stringify(store.state.memories), before); assert.equal(store.state.events.at(-1).action, 'cancel');
});
test('Removal excludes record, survives reload and remains recoverable until copy cleared', () => {
  const { store, storage } = setup(); store.remove('env');
  const r = new M.Store(storage, () => NOW); r.load(); assert.equal(r.decide('place').issues[0].code, 'absent');
  assert.ok(r.state.undo.memories.some(m => m.id === 'env')); r.undo(); assert.equal(r.decide('place').status, 'ready');
});
test('Clear recovery removes every deleted source/content copy in app state; logs have no copies', () => {
  const { store, storage } = setup('B · Correct'); const secret = 'DISTINCT_TEST_QUOTE';
  store.change('test-source', s => s.memories[0].sources[0].quote = secret); store.remove('env');
  assert.ok(storage.getItem(M.KEY).includes(secret)); store.clearRecovery(); assert.ok(!storage.getItem(M.KEY).includes(secret));
  assert.equal(store.state.undo, null); assert.equal(store.state.events.at(-1).action, 'clear-recovery');
});
test('Adding absent preference is explicit; other topic is not superseded', () => {
  const { store } = setup(); store.remove('dur'); store.correct(null, 'duration', '45');
  assert.equal(store.decide('session').status, 'ready'); assert.equal(store.state.memories.find(m => m.id === 'other').status, 'active');
});
test('Correcting an unrelated record cannot supersede study preferences', () => {
  const { store } = setup(); store.correct('other', 'duration', '25');
  assert.equal(store.state.memories.find(m => m.id === 'dur').status, 'active');
  assert.deepEqual(store.decide('session').selected, ['dur']);
});
test('30-day boundary is inclusive; future evidence is held', () => {
  const s = M.fixture('A · Explain', NOW), m = s.memories[0]; m.updatedAt = new Date(NOW - 30 * 86400000).toISOString();
  assert.equal(M.analyse(s, 'place', NOW).status, 'ready'); assert.equal(M.analyse(s, 'place', NOW + 1).issues[0].code, 'stale');
  m.updatedAt = new Date(NOW + 1000).toISOString(); assert.equal(M.analyse(s, 'place', NOW).issues[0].code, 'future');
});
test('Duplicate equal values use newest record; equal timestamps break by ID deterministically', () => {
  const s = M.fixture('C · Conflict', NOW); s.memories[1].value = 'quiet'; assert.deepEqual(M.analyse(s, 'place', NOW).selected, ['env2']);
  s.memories[1].updatedAt = s.memories[0].updatedAt; assert.deepEqual(M.analyse(s, 'place', NOW).selected, ['env']);
});
test('Invalid edit and unsupported task are refused without state writes', () => {
  const { store, storage } = setup(); const before = storage.getItem(M.KEY);
  assert.throws(() => store.correct('env', 'environment', '<script>'), { code: 'INPUT' }); assert.throws(() => store.decide('medical'), { code: 'INPUT' });
  assert.throws(() => store.correct('missing', 'environment', 'quiet'), { code: 'INPUT' }); assert.equal(storage.getItem(M.KEY), before);
});
test('Quota failure does not mutate state or claim persisted success', () => {
  const { store, storage } = setup(); const before = JSON.stringify(store.state); storage.setItem = () => { throw Error('quota'); };
  assert.throws(() => store.correct('env', 'environment', 'collaborative'), { code: 'STORAGE' }); assert.equal(JSON.stringify(store.state), before);
});
test('Storage read failure is explicit', () => { assert.throws(() => new M.Store({ getItem() { throw Error('blocked'); } }).load(), { code: 'STORAGE' }); });
test('Corrupt JSON, schema mismatch and malformed records are not overwritten on load', () => {
  for (const raw of ['{', JSON.stringify({ ...M.empty(), schema: 2 }), JSON.stringify({ ...M.empty(), memories: [{}] })]) {
    const storage = new Storage(); storage.setItem(M.KEY, raw); assert.throws(() => new M.Store(storage).load(), { code: 'CORRUPT' }); assert.equal(storage.getItem(M.KEY), raw);
  }
});
test('Two loaded tabs cannot overwrite each other, including a log-only write', () => {
  const { store, storage } = setup(); const other = new M.Store(storage, () => NOW); other.load(); store.decide('plan');
  assert.throws(() => other.correct('env', 'environment', 'collaborative'), { code: 'CONFLICT' });
  other.load(); other.correct('env', 'environment', 'collaborative'); assert.equal(new M.Store(storage).load().memories[0].value, 'collaborative');
});
test('Audit is bounded and contains IDs/statuses, not source excerpts or generated plans', () => {
  const { store } = setup(); for (let i = 0; i < 110; i++) store.decide('plan'); assert.equal(store.state.events.length, 100);
  const log = JSON.stringify(store.state.events); assert.ok(!log.includes('I prefer')); assert.ok(!log.includes('Choose a')); assert.equal(store.state.events.at(-1).seq, 111);
});
