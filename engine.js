(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MemoryLens = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const KEY = 'memorylens.v1';
  const KINDS = { environment: ['quiet', 'collaborative'], duration: ['25', '45'] };
  const TASKS = { plan: ['environment', 'duration'], place: ['environment'], session: ['duration'] };
  const LABELS = { quiet: 'a quiet space', collaborative: 'a collaborative space', '25': '25 minutes', '45': '45 minutes' };
  const DAY = 86400000;
  const clone = x => JSON.parse(JSON.stringify(x));
  const iso = now => new Date(now).toISOString();
  const dateOK = x => typeof x === 'string' && Number.isFinite(Date.parse(x));
  const phrase = m => m.kind === 'environment' ? `I prefer ${LABELS[m.value]} for study.` : `I prefer focus sessions of ${LABELS[m.value]}.`;
  class LensError extends Error { constructor(code, message) { super(message); this.code = code; } }
  function memoryOK(m) {
    return m && typeof m.id === 'string' && /^[a-zA-Z0-9_-]{1,60}$/.test(m.id) &&
      Object.hasOwn(KINDS, m.kind) && KINDS[m.kind].includes(m.value) &&
      ['study', 'other'].includes(m.topic) && ['active', 'superseded'].includes(m.status) &&
      dateOK(m.updatedAt) && (m.confirmedAt === null || dateOK(m.confirmedAt)) &&
      Array.isArray(m.sources) && m.sources.length > 0 && m.sources.every(s =>
        s && typeof s.label === 'string' && s.label.length <= 200 && typeof s.quote === 'string' && s.quote.length <= 1000 &&
        ['stated', 'inferred', 'missing'].includes(s.evidence) && dateOK(s.at));
  }
  function validate(s) {
    if (!s || s.schema !== 1 || !Number.isSafeInteger(s.revision) || s.revision < 0 ||
      !Array.isArray(s.memories) || s.memories.length > 100 || !s.memories.every(memoryOK) ||
      new Set(s.memories.map(m => m.id)).size !== s.memories.length ||
      !Array.isArray(s.events) || s.events.length > 100 || !s.events.every(e => e && Number.isInteger(e.seq) && dateOK(e.at) && typeof e.action === 'string') ||
      typeof s.fixture !== 'string' || (s.undo !== null && (!s.undo || !Array.isArray(s.undo.memories) || !s.undo.memories.every(memoryOK) || typeof s.undo.action !== 'string'))) {
      throw new LensError('CORRUPT', 'Saved data is unreadable or incompatible. Export it before starting a new demo.');
    }
    return s;
  }
  function empty() { return { schema: 1, revision: 0, fixture: 'Empty workspace', memories: [], events: [], undo: null }; }
  function source(label, quote, at, evidence = 'stated') { return { label, quote, at, evidence }; }
  function fixture(name, now = Date.now()) {
    const d = days => iso(now - days * DAY);
    const mem = (id, kind, value, days = 2, evidence = 'stated') => {
      const m = { id, kind, value, topic: 'study', status: 'active', updatedAt: d(days), confirmedAt: null, sources: [] };
      m.sources.push(source('Fictional study check-in', evidence === 'missing' ? '' : phrase(m), d(days), evidence)); return m;
    };
    const s = empty(); s.fixture = name;
    if (name === 'A · Explain') s.memories = [mem('env', 'environment', 'quiet'), mem('dur', 'duration', '25'), { ...mem('other', 'duration', '45'), topic: 'other' }];
    else if (name === 'B · Correct') s.memories = [mem('env', 'environment', 'quiet', 6), mem('dur', 'duration', '25')];
    else if (name === 'C · Conflict') s.memories = [mem('env', 'environment', 'quiet'), mem('env2', 'environment', 'collaborative', 1), mem('dur', 'duration', '25')];
    else if (name === 'C · Stale') s.memories = [mem('env', 'environment', 'quiet', 65), mem('dur', 'duration', '25')];
    else if (name === 'C · Missing evidence') s.memories = [mem('env', 'environment', 'quiet', 2, 'missing'), mem('dur', 'duration', '25')];
    else throw new LensError('INPUT', 'Unknown demo.');
    return s;
  }
  function analyse(s, task, now = Date.now(), ignore = []) {
    if (!Object.hasOwn(TASKS, task)) throw new LensError('INPUT', 'Choose a supported study task.');
    const needed = TASKS[task], trace = [], candidates = [];
    for (const m of s.memories) {
      let reason = '';
      if (m.status !== 'active') reason = 'Superseded by an explicit correction.';
      else if (m.topic !== 'study') reason = 'Different topic: this request is about study.';
      else if (!needed.includes(m.kind)) reason = 'This preference is not needed for the selected task.';
      else if (ignore.includes(m.kind)) reason = 'Ignored for this request only, at your choice.';
      if (reason) trace.push({ id: m.id, outcome: 'excluded', reason });
      else candidates.push(m);
    }
    const selected = [], issues = [];
    for (const kind of needed) {
      if (ignore.includes(kind)) continue;
      const group = candidates.filter(m => m.kind === kind).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt) || a.id.localeCompare(b.id));
      if (!group.length) { issues.push({ kind, code: 'absent', ids: [], message: `No ${kind} preference is stored. Choose a value or continue without it.` }); continue; }
      if (new Set(group.map(m => m.value)).size > 1) {
        issues.push({ kind, code: 'conflict', ids: group.map(m => m.id), message: `Two active ${kind} preferences disagree. I cannot choose which is current.` });
        group.forEach(m => trace.push({ id: m.id, outcome: 'held', reason: 'Conflicting active values require your confirmation.' })); continue;
      }
      const m = group[0], src = m.sources.at(-1), last = m.confirmedAt || m.updatedAt, age = (now - Date.parse(last)) / DAY;
      let issue = null;
      if (age < 0 || Date.parse(src.at) > now) issue = { code: 'future', message: 'This record has a future timestamp. Confirm it before use.' };
      else if (src.evidence !== 'stated' || !src.quote.trim()) issue = { code: 'evidence', message: 'The current source is missing or inferred. Please confirm the preference.' };
      else if (age > 30) issue = { code: 'stale', message: `Last update or confirmation was ${Math.floor(age)} days ago; this demo asks again after 30 days.` };
      if (issue) {
        issues.push({ ...issue, kind, ids: group.map(x => x.id) });
        trace.push({ id: m.id, outcome: 'held', reason: issue.message });
      } else {
        selected.push(m.id);
        trace.push({ id: m.id, outcome: 'used', reason: `Selected task needs ${kind}; study topic matches; latest matching record has a stated source and is within the 30-day review period. This checks eligibility, not whether the preference is true.` });
      }
      group.slice(1).forEach(x => trace.push({ id: x.id, outcome: 'excluded', reason: 'Same value; a more recently updated record was chosen (ID breaks equal-date ties).' }));
    }
    return { task, revision: s.revision, selected, issues, trace, ignored: [...ignore], at: iso(now), status: issues.length ? 'needs-confirmation' : 'ready' };
  }
  function renderPlan(s, decision) {
    if (decision.revision !== s.revision) throw new LensError('STALE_PLAN', 'Memory changed. Generate a new plan.');
    if (decision.issues.length) return null;
    const ms = decision.selected.map(id => s.memories.find(m => m.id === id));
    const env = ms.find(m => m.kind === 'environment'), dur = ms.find(m => m.kind === 'duration');
    const lines = [];
    if (TASKS[decision.task].includes('environment')) lines.push(env ? (env.value === 'quiet' ? 'Choose a quiet study space for individual revision.' : 'Choose a collaborative study space and discuss one topic with a peer.') : 'Choose a suitable study space yourself; no stored location preference was applied.');
    if (TASKS[decision.task].includes('duration')) lines.push(dur ? `Work for ${dur.value} minutes, then pause and check what you understood.` : 'Choose a focus-session length yourself; no stored duration preference was applied.');
    lines.push('Pick one course topic and finish by writing a short explanation in your own words.');
    return lines;
  }
  class Store {
    constructor(storage, clock = () => Date.now()) { this.storage = storage; this.clock = clock; this.raw = undefined; this.state = null; }
    load() {
      let raw; try { raw = this.storage.getItem(KEY); } catch { throw new LensError('STORAGE', 'Browser storage is unavailable. Nothing has been saved.'); }
      let s; try { s = raw === null ? empty() : validate(JSON.parse(raw)); } catch (e) { if (e instanceof LensError) throw e; throw new LensError('CORRUPT', 'Saved data is unreadable. Export it before starting a new demo.'); }
      this.raw = raw; this.state = clone(s); return clone(s);
    }
    write(next) {
      validate(next);
      let current; try { current = this.storage.getItem(KEY); } catch { throw new LensError('STORAGE', 'Storage cannot be read. Nothing has been saved.'); }
      if (current !== this.raw) throw new LensError('CONFLICT', 'Another tab changed this workspace. Reload before trying again.');
      const raw = JSON.stringify(next);
      try { this.storage.setItem(KEY, raw); } catch { throw new LensError('STORAGE', 'Save failed. No change was applied. Export your data or free browser storage.'); }
      this.raw = raw; this.state = clone(next); return clone(next);
    }
    event(s, action, details = {}) {
      const seq = (s.events.at(-1)?.seq || 0) + 1;
      s.events.push({ seq, at: iso(this.clock()), action, ...details });
      s.events = s.events.slice(-100);
    }
    change(action, mutate, details = {}) {
      if (!this.state) this.load();
      const s = clone(this.state); s.undo = { memories: clone(s.memories), action };
      mutate(s); s.revision++; this.event(s, action, details); return this.write(s);
    }
    loadFixture(name) {
      if (!this.state) this.load();
      const s = fixture(name, this.clock()); s.revision = this.state.revision + 1;
      this.event(s, 'load-fictional-demo', { fixture: name }); return this.write(s);
    }
    correct(id, kind, value) {
      if (!Object.hasOwn(KINDS, kind) || !KINDS[kind].includes(value)) throw new LensError('INPUT', 'Choose one of the supported values.');
      if (id && !this.state.memories.some(m => m.id === id && m.kind === kind)) throw new LensError('INPUT', 'This memory no longer exists.');
      return this.change('correct', s => {
        let m = id ? s.memories.find(x => x.id === id) : null;
        if (!m) { m = { id: `new-${s.revision + 1}-${kind}`, kind, value, topic: 'study', status: 'active', updatedAt: iso(this.clock()), confirmedAt: null, sources: [] }; s.memories.push(m); }
        m.value = value; m.updatedAt = iso(this.clock()); m.confirmedAt = m.updatedAt; m.status = 'active';
        m.sources.push(source('Your explicit correction in MemoryLens', phrase(m), m.updatedAt));
        m.sources = m.sources.slice(-10);
        // A deliberate correction resolves this preference group, never unrelated topics.
        s.memories.filter(x => x.id !== m.id && x.kind === kind && x.topic === m.topic && x.status === 'active').forEach(x => { x.status = 'superseded'; });
      }, { memoryIds: id ? [id] : [], kind });
    }
    remove(id) {
      if (!this.state.memories.some(m => m.id === id)) throw new LensError('INPUT', 'This memory no longer exists.');
      return this.change('remove', s => { s.memories = s.memories.filter(m => m.id !== id); }, { memoryIds: [id] });
    }
    undo() {
      if (!this.state.undo) throw new LensError('INPUT', 'There is no change to undo.');
      const s = clone(this.state); s.memories = s.undo.memories; s.undo = null; s.revision++; this.event(s, 'undo'); return this.write(s);
    }
    clearRecovery() {
      const s = clone(this.state); s.undo = null; s.revision++; this.event(s, 'clear-recovery'); return this.write(s);
    }
    decide(task, ignore = []) {
      const s = clone(this.state), d = analyse(s, task, this.clock(), ignore);
      this.event(s, 'plan', { task, status: d.status, memoryIds: d.selected, issueCodes: d.issues.map(i => i.code) });
      // Log-only writes retain memory revision; in-memory plans are never persisted.
      this.write(s); return d;
    }
    cancel(task) { const s = clone(this.state); this.event(s, 'cancel', { task }); return this.write(s); }
  }
  return { KEY, KINDS, TASKS, LABELS, Store, LensError, analyse, renderPlan, empty, fixture, validate, phrase };
});
