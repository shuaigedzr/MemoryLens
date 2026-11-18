// Replays the real engine with a simulated Web Storage adapter. Not a browser test.
const fs = require('node:fs');
const M = require('../engine.js');
const now = Date.parse('2026-11-17T16:00:00Z');
class MemoryStorage { constructor() { this.raw = null; } getItem() { return this.raw; } setItem(k, raw) { this.raw = raw; } }
function start(name) { const storage = new MemoryStorage(), store = new M.Store(storage, () => now); store.load(); store.loadFixture(name); return { storage, store }; }
function view(store, task = 'plan', ignored = []) { const decision = store.decide(task, ignored); return { decision, plan: M.renderPlan(store.state, decision) }; }
const output = { generatedAt: new Date().toISOString(), clock: new Date(now).toISOString(), operator: 'AI-assisted engine replay', adapter: 'simulated Web Storage; not a live browser', scenarios: {} };
{
  const { store } = start('A · Explain'); output.scenarios.A = { result: view(store), memories: store.state.memories };
}
{
  const { store, storage } = start('B · Correct'); const before = view(store); store.correct('env', 'environment', 'collaborative');
  const reopened = new M.Store(storage, () => now); reopened.load();
  output.scenarios.B = { before, correctedAfterReinstantiation: view(reopened), correctedSources: reopened.state.memories[0].sources };
  reopened.undo(); output.scenarios.B.afterUndo = view(reopened);
}
{
  const { store } = start('C · Conflict'); const blocked = view(store); const ignored = view(store, 'plan', ['environment']); const newRequest = view(store);
  store.correct('env', 'environment', 'collaborative'); output.scenarios.C = { blocked, ignored, newRequest, confirmed: view(store) };
}
for (const name of ['C · Stale', 'C · Missing evidence']) { const { store } = start(name); output.scenarios[name] = view(store); }
fs.mkdirSync('evidence', { recursive: true }); fs.writeFileSync('evidence/engine-replay.json', JSON.stringify(output, null, 2) + '\n');
console.log('Wrote evidence/engine-replay.json using the implemented selection, mutation and rendering functions.');
