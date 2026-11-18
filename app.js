/* DOM adapter: all memory rules and persistence live in engine.js. */
(() => {
  'use strict';
  const M = window.MemoryLens, $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const date = s => new Date(s).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  let store, state, decision = null, lastTask = null, ignored = [], edit = null, locked = false;
  const notice = (message, error = false) => { $('notice').textContent = message; $('notice').className = error ? 'error' : ''; };
  function fail(e) {
    notice(e.message || 'The operation could not be completed.', true);
    if (['CORRUPT', 'CONFLICT', 'STORAGE'].includes(e.code)) {
      locked = true; decision = null; $('generate').disabled = true;
      $('result').innerHTML = '<div class="storage-error">No current plan is available. Export saved data, then reload saved state. If data is damaged, Load demo can explicitly replace it.</div>';
      $('undo').disabled = true; $('clear-recovery').disabled = true;
    }
  }
  function run(fn) { try { return fn(); } catch (e) { fail(e); return undefined; } }
  function sourceHTML(m) {
    return m.sources.slice().reverse().map((s, i) => `<div class="source"><strong>${i ? 'Earlier source' : 'Current source'} · ${esc(s.label)}</strong><p class="meta">${esc(date(s.at))} · ${esc(s.evidence)} evidence</p><blockquote>${s.quote ? esc(s.quote) : 'No source excerpt is available.'}</blockquote></div>`).join('');
  }
  function memoryHTML(m) {
    const used = decision?.status === 'ready' && decision.selected.includes(m.id);
    const held = decision?.issues.some(i => i.ids.includes(m.id));
    const badge = m.status === 'superseded' ? 'Superseded' : used ? 'Used in this plan' : held ? 'Needs confirmation' : 'Stored claim';
    return `<article class="memory-card" id="memory-${esc(m.id)}"><div class="memory-top"><span class="meta">${esc(m.id)} · ${esc(m.kind)} · ${esc(m.topic)}</span><span class="pill ${held ? 'warn' : m.status === 'superseded' ? 'dim' : ''}">${badge}</span></div><h3>${esc(M.phrase(m))}</h3><p class="meta">Updated ${esc(date(m.updatedAt))}${m.confirmedAt ? `<br>Confirmed ${esc(date(m.confirmedAt))}` : ''}</p><details><summary>Source and history</summary>${sourceHTML(m)}</details><div class="memory-actions"><button class="secondary" data-action="edit" data-id="${esc(m.id)}" ${locked ? 'disabled' : ''}>Correct ${esc(m.id)}</button><button class="text-button danger" data-action="remove" data-id="${esc(m.id)}" ${locked ? 'disabled' : ''}>Remove ${esc(m.id)}</button></div></article>`;
  }
  function render() {
    state = store.state;
    $('fixture-name').textContent = state.fixture;
    if ([...$('fixture').options].some(option => option.value === state.fixture)) $('fixture').value = state.fixture;
    $('memory-count').textContent = state.memories.filter(m => m.status === 'active').length + ' active';
    $('memories').innerHTML = state.memories.length ? state.memories.map(memoryHTML).join('') : '<p class="muted">No memories stored. Load a fictional demo to begin.</p>';
    $('undo').disabled = locked || !state.undo; $('clear-recovery').disabled = locked || !state.undo;
    $('recovery-note').textContent = state.undo ? `One recovery copy is held for “${state.undo.action}”. Removed notes cannot be used in plans. Clear this copy or make another memory change to discard it.` : 'No recovery copy held.';
    $('activity').innerHTML = state.events.length ? '<table><thead><tr><th>Step</th><th>Action</th><th>Outcome</th></tr></thead><tbody>' + state.events.slice().reverse().slice(0, 12).map(e => `<tr><td>${e.seq}<br>${esc(date(e.at))}</td><td>${esc(e.action)}</td><td>${esc(e.status || e.kind || e.fixture || 'Saved')}${e.memoryIds?.length ? '<br>IDs: ' + esc(e.memoryIds.join(', ')) : ''}${e.issueCodes?.length ? '<br>' + esc(e.issueCodes.join(', ')) : ''}</td></tr>`).join('') + '</tbody></table><p class="fine">Latest 12 shown. Up to 100 content-free events are retained and included in exports.</p>' : '<p class="muted">Your decisions will appear here.</p>';
  }
  function issueHTML(i) {
    const ids = i.ids.map(id => { const m = state.memories.find(x => x.id === id); return `<p><strong>${esc(id)}:</strong> ${esc(M.phrase(m))}</p>`; }).join('');
    return `<section class="issue"><h3>${esc(i.kind)} · ${esc(i.code)}</h3><p>${esc(i.message)}</p>${ids}<div class="actions"><button class="secondary" data-action="resolve" data-kind="${esc(i.kind)}" data-id="${esc(i.ids[0] || '')}">Confirm or correct ${esc(i.kind)}</button><button class="text-button" data-action="ignore" data-kind="${esc(i.kind)}">Ignore ${esc(i.kind)} this time</button></div></section>`;
  }
  function renderResult() {
    if (!decision) return;
    if (decision.status === 'needs-confirmation') {
      $('result').innerHTML = `<span class="pill warn">Waiting for your choice</span><h3>Check a note before I suggest a plan</h3><p class="muted">No personalised plan has been issued. Review the sources in Your memory.</p>${decision.issues.map(issueHTML).join('')}<button class="text-button danger" data-action="cancel">Cancel this request</button>`;
    } else {
      const lines = M.renderPlan(state, decision);
      $('result').innerHTML = `<span class="pill">Plan ready · Template output</span><h3>A starting point for your next session</h3><ol class="plan-list">${lines.map(l => `<li>${esc(l)}</li>`).join('')}</ol><p class="fine">No live venue availability has been checked. Memory eligibility does not prove a preference is still true.</p>${decision.ignored.length ? `<p class="fine">Ignored for this request: ${esc(decision.ignored.join(', '))}. Those notes remain stored.</p>` : ''}<details open><summary>Why this plan?</summary>${decision.selected.map(id => {
        const m = state.memories.find(x => x.id === id), t = decision.trace.find(x => x.id === id);
        return `<div class="used"><strong>${esc(M.phrase(m))}</strong><p>${esc(t.reason)}</p><p class="meta">Memory ${esc(id)} · Updated ${esc(date(m.updatedAt))}</p><details><summary>Show original source · ${esc(id)}</summary>${sourceHTML(m)}</details><button class="text-button" data-action="edit" data-id="${esc(id)}">Change ${esc(id)} and update plan</button></div>`;
      }).join('') || '<p class="muted">No personal memory was applied. You chose to continue without it.</p>'}</details>`;
    }
    $('result').insertAdjacentHTML('beforeend', `<details><summary>Selection trace · ${decision.trace.length} records</summary>${decision.trace.map(t => `<div class="trace"><strong>${esc(t.id)} · ${esc(t.outcome)}</strong><p>${esc(t.reason)}</p></div>`).join('') || '<p class="muted">No candidate records.</p>'}<p class="fine">Memory revision ${decision.revision}. Sources are information, never executable instructions.</p></details>`);
  }
  function generate(fresh = true) {
    if (locked) throw new M.LensError('STORAGE', 'Reload saved state before continuing.');
    if (fresh) { ignored = []; lastTask = $('task').value; }
    decision = store.decide(lastTask, ignored); render(); renderResult();
  }
  function afterChange(message) {
    decision = null; render();
    $('result').innerHTML = '<p class="muted">Memory changed. Generate a plan using the saved state.</p>';
    if (lastTask) generate(false);
    notice(message);
  }
  async function ask(title, description, action = 'Confirm') {
    $('confirm-title').textContent = title; $('confirm-description').textContent = description; $('confirm-action').textContent = action;
    const dialog = $('confirm-dialog'); dialog.returnValue = 'cancel'; dialog.showModal();
    return new Promise(resolve => dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), { once: true }));
  }
  function openEdit(id, kind) {
    const m = id ? state.memories.find(x => x.id === id) : null;
    kind = kind || m?.kind;
    if (!M.KINDS[kind]) return;
    edit = { id: id || null, kind };
    $('edit-title').textContent = 'Confirm or correct ' + kind;
    const others = state.memories.filter(x => x.kind === kind && x.topic === (m?.topic || 'study') && x.status === 'active' && x.id !== id).length;
    $('edit-impact').textContent = `Choose what applies now. Saving will ${others ? 'supersede ' + others + ' other active note(s) for this preference and ' : ''}update future plans. You can undo the last memory change.`;
    $('edit-value').innerHTML = M.KINDS[kind].map(v => `<option value="${v}">${esc(M.LABELS[v])}</option>`).join('');
    if (m) $('edit-value').value = m.value;
    $('edit-dialog').showModal();
  }
  document.addEventListener('click', async e => {
    const b = e.target.closest('button[data-action]'); if (!b) return;
    const { action, id, kind } = b.dataset;
    if (locked) return fail(new M.LensError('STORAGE', 'Reload saved state before changing it.'));
    if (action === 'edit' || action === 'resolve') return openEdit(id, kind);
    if (action === 'remove') {
      if (await ask('Remove this memory?', 'The note and all its source history will stop being used. One recovery copy remains until you clear it or make another memory change. Any previous recovery copy will be discarded.', 'Remove memory')) run(() => { store.remove(id); ignored = []; afterChange('Memory removed from active storage. Undo is available.'); });
    } else if (action === 'ignore') run(() => { ignored = [...new Set([...ignored, kind])]; generate(false); notice('This preference was ignored for this request only. Saved memory was not changed.'); });
    else if (action === 'cancel') run(() => { store.cancel(lastTask); decision = null; lastTask = null; ignored = []; render(); $('result').innerHTML = '<p class="muted">Request cancelled. No plan was issued and your memory was not changed.</p>'; notice('Request cancelled. You can choose a task and start again.'); });
  });
  $('plan-form').addEventListener('submit', e => { e.preventDefault(); run(() => { generate(true); notice(decision.issues.length ? 'A source needs your review. No plan issued yet.' : 'Plan generated from the current saved memory.'); }); });
  $('edit-cancel').addEventListener('click', () => $('edit-dialog').close());
  $('edit-form').addEventListener('submit', e => {
    e.preventDefault();
    run(() => { store.correct(edit.id, edit.kind, $('edit-value').value); $('edit-dialog').close(); ignored = []; afterChange('Correction saved in this browser.'); });
  });
  $('load-demo').addEventListener('click', async () => {
    if (!await ask('Load fictional demo?', 'This replaces all saved demo notes, the decision record and the undo copy. Export first if you want to keep them. All demo content is fictional.', 'Load demo')) return;
    run(() => {
      if (locked) { store.raw = store.storage.getItem(M.KEY); store.state = M.empty(); }
      state = store.loadFixture($('fixture').value); locked = false; $('generate').disabled = false; lastTask = null; decision = null; ignored = [];
      render(); $('result').innerHTML = '<p class="muted">Demo loaded. Ask for a plan to see which notes apply.</p>'; notice(`${state.fixture} loaded and saved. All demo content is fictional.`);
    });
  });
  $('undo').addEventListener('click', () => run(() => { store.undo(); ignored = []; afterChange('Last memory change undone and saved.'); }));
  $('clear-recovery').addEventListener('click', async () => {
    if (await ask('Clear the recovery copy?', 'The last change can no longer be undone. Any removed note held only in that copy will be erased from this app. Existing exports are separate files.', 'Clear copy')) run(() => { store.clearRecovery(); afterChange('Recovery copy cleared. Removed memory content is no longer held by this app.'); });
  });
  $('export').addEventListener('click', () => run(() => {
    const raw = store.storage.getItem(M.KEY) || JSON.stringify(M.empty(), null, 2);
    const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'memorylens-export.json'; a.click(); URL.revokeObjectURL(url);
    notice('Export requested. The file contains source excerpts and any recovery copy; keep it private.');
  }));
  $('reload').addEventListener('click', () => run(() => { state = store.load(); locked = false; decision = null; lastTask = null; ignored = []; $('generate').disabled = false; render(); $('result').innerHTML = '<p class="muted">Saved state reloaded. Ask for a new plan.</p>'; notice('Saved memory reloaded. No previous plan is treated as current.'); }));
  window.addEventListener('storage', e => { if (e.key === M.KEY) fail(new M.LensError('CONFLICT', 'Another tab changed the saved workspace. Reload saved state before continuing.')); });
  // Defer access to the localStorage getter so Store can classify blocked storage.
  const storage = { getItem: key => window.localStorage.getItem(key), setItem: (key, raw) => window.localStorage.setItem(key, raw) };
  run(() => { store = new M.Store(storage); state = store.load(); render(); });
})();
