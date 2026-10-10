/* LLP Lab — CSD3116 midterm revision app. Vanilla JS, hash router, no build step. */
(function () {
  'use strict';

  /* ---------- storage (falls back to memory) ---------- */
  const mem = {};
  let storageOk = true;
  try { const k = '__t'; localStorage.setItem(k, '1'); localStorage.removeItem(k); } catch (e) { storageOk = false; }
  const store = {
    get(k, d) {
      try { const v = storageOk ? localStorage.getItem('llp:' + k) : mem[k]; return v == null ? d : JSON.parse(v); }
      catch (e) { return d; }
    },
    set(k, v) {
      const s = JSON.stringify(v);
      try { if (storageOk) localStorage.setItem('llp:' + k, s); else mem[k] = s; } catch (e) { mem[k] = s; }
    },
    del(k) { try { if (storageOk) localStorage.removeItem('llp:' + k); } catch (e) {} delete mem[k]; }
  };
  if (!storageOk) document.getElementById('banner').innerHTML =
    '<div class="banner">Browser storage is unavailable — progress will be lost if you reload this tab.</div>';

  /* ---------- helpers ---------- */
  const $app = document.getElementById('app');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TOP = {}; TOPICS.forEach((t) => (TOP[t.id] = t));
  const MQ = {}; MCQ.forEach((q) => (MQ[q.id] = q));
  const SQ = {}; SAQ.forEach((q) => (SQ[q.id] = q));
  const NONE = 'None of the options';
  const LET = 'ABCDEF';

  function rng(seed) { // mulberry32
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0; let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, r) { const a = arr.slice(); r = r || Math.random; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const fmt = (sec) => { sec = Math.max(0, Math.floor(sec)); const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0'); };
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
  const norm = (s) => String(s).toLowerCase().replace(/\s+/g, '').replace(/0x/g, '').replace(/[%$]/g, '').replace(/\.$/, '');

  /* option order: shuffled, "None of the options" always last */
  function optionOrder(q, r) {
    const all = [q.ans].concat(q.wrong);
    const none = all.filter((o) => o === NONE), rest = all.filter((o) => o !== NONE);
    return shuffle(rest, r).concat(none);
  }

  /* history of MCQ attempts */
  const hist = store.get('hist', {});
  function record(id, ok) {
    const h = hist[id] || { c: 0, w: 0, last: 0 };
    ok ? h.c++ : h.w++; h.last = ok ? 1 : 0; hist[id] = h; store.set('hist', hist);
  }

  /* theme */
  const themeBtn = document.getElementById('theme');
  function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); }
  applyTheme(store.get('theme', 'light'));
  themeBtn.onclick = () => { const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; applyTheme(t); store.set('theme', t); };

  /* ---------- prefs for the desk ---------- */
  const prefs = Object.assign({ mode: 'study', topics: TOPICS.map((t) => t.id), set: 'all', focus: 'mixed', count: 20 }, store.get('prefs', {}));
  const savePrefs = () => store.set('prefs', prefs);

  function pool(topics, set, focus) {
    return MCQ.filter((q) => topics.includes(q.t) && (set === 'all' || q.set === set) &&
      (focus === 'mixed' || (focus === 'calc' ? q.kind === 'a' : q.kind === 'c')));
  }
  function balancedPick(list, n, r) { // round-robin across topics
    const by = {}; shuffle(list, r).forEach((q) => (by[q.t] = by[q.t] || []).push(q));
    const keys = shuffle(Object.keys(by), r); const out = [];
    while (out.length < n && keys.some((k) => by[k].length)) keys.forEach((k) => { if (by[k].length && out.length < n) out.push(by[k].shift()); });
    return out;
  }

  /* ---------- router ---------- */
  let timerId = null;
  function clearTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
  function route() {
    clearTimer();
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    const r = parts[0] || 'home';
    document.querySelectorAll('#nav a').forEach((a) => a.classList.toggle('on', a.dataset.r === r || (r === 'practice' && a.dataset.r === 'home')));
    const views = { home: viewHome, practice: viewPractice, notes: viewNotes, cards: viewCards, drills: viewDrills, mock: viewMock, sheet: viewSheet, progress: viewProgress };
    (views[r] || viewHome)(parts[1]);
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  const go = (h) => { if (location.hash === h) route(); else location.hash = h; };

  /* ========== HOME / DESK ========== */
  function viewHome() {
    const p = pool(prefs.topics, prefs.set, prefs.focus);
    const n = prefs.count === 'all' ? p.length : Math.min(prefs.count, p.length);
    const nA = p.filter((q) => q.kind === 'a').length;
    const answered = Object.keys(hist).length, right = Object.values(hist).filter((h) => h.last).length;
    $app.innerHTML = `
<div class="eyebrow">Revision desk · Weeks 1–6</div>
<h1>Low-level, high marks.</h1>
<p class="lede">${MCQ.length} MCQs (${MCQ.filter((q) => q.set === 'past').length} from your past quizzes), ${SAQ.length} short-answer questions, notes, flashcards, no-calculator drills and a full 2-hour mock.</p>
<div class="grid">
 <div>
  <section class="card">
   <div class="card-h"><h2>Choose how to practise</h2><span class="step">01 / MODE</span></div>
   <div class="modes">
    <button class="mode ${prefs.mode === 'study' ? 'on' : ''}" data-act="mode" data-v="study"><span class="ic">✎</span><b>Study mode</b><span>Untimed. Instant feedback and the slide reference after every answer.</span><span class="tag">Learn</span></button>
    <button class="mode ${prefs.mode === 'timed' ? 'on' : ''}" data-act="mode" data-v="timed"><span class="ic">◷</span><b>Timed set</b><span>90 s per question, marks and explanations only at the end.</span><span class="tag">Pressure</span></button>
    <button class="mode" data-act="goto" data-v="#/mock"><span class="ic">▣</span><b>Mock midterm</b><span>50 MCQ + 25 short answer, 100 marks, 2 hours. Exam format.</span><span class="tag">Full paper</span></button>
   </div>
  </section>
  <section class="card">
   <div class="card-h"><h2>Pick topics</h2><span><button class="linkbtn" data-act="all">All</button> · <button class="linkbtn" data-act="none">Clear</button></span></div>
   <div class="topics">${TOPICS.map((t) => {
      const c = MCQ.filter((q) => q.t === t.id).length, on = prefs.topics.includes(t.id);
      return `<label class="topic ${on ? 'sel' : ''}"><input type="checkbox" data-act="topic" data-v="${t.id}" ${on ? 'checked' : ''}><span class="n">${t.n}</span><span class="t"><b>${t.title}</b><small>${t.week} · ${t.sub}</small></span><span class="c">${c} Qs</span></label>`;
    }).join('')}</div>
  </section>
  <section class="card">
   <div class="card-h"><h2>Tune the set</h2><span class="step">02 / FILTER</span></div>
   <div class="row"><div class="field"><label>Question source</label><div class="seg">
     ${[['all', 'All'], ['past', 'Past quizzes'], ['new', 'New']].map(([v, l]) => `<button class="${prefs.set === v ? 'on' : ''}" data-act="set" data-v="${v}">${l}</button>`).join('')}</div></div>
   <div class="field"><label>Focus</label><div class="seg">
     ${[['calc', 'Calculation'], ['mixed', 'Mixed'], ['concept', 'Concept']].map(([v, l]) => `<button class="${prefs.focus === v ? 'on' : ''}" data-act="focus" data-v="${v}">${l}</button>`).join('')}</div></div>
   <div class="field"><label>Questions</label><div class="seg">
     ${[10, 20, 40, 'all'].map((v) => `<button class="${prefs.count === v ? 'on' : ''}" data-act="count" data-v="${v}">${v === 'all' ? 'All' : v}</button>`).join('')}</div></div></div>
   <p class="lede" style="margin:6px 0 14px">${n} questions · ${nA} calculation / ${p.length - nA} concept available in this filter · ${prefs.mode === 'study' ? 'untimed, instant feedback' : fmt(n * 90) + ' time limit'}</p>
   <button class="btn" data-act="start" ${n ? '' : 'disabled'}>Start ${prefs.mode === 'study' ? 'study session' : 'timed set'} →</button>
  </section>
 </div>
 <aside>
  <div class="side">
   <div class="eyebrow">Midterm test</div>
   <h2>CSD3116 · Weeks 1–6</h2>
   <dl class="kv"><dt>Duration</dt><dd>2 hours, SEB quiz</dd><dt>Section A</dt><dd>Up to 50 MCQ × 1</dd><dt>Section B</dt><dd>Up to 25 short answer × 2</dd><dt>Total</dt><dd>Up to 100 marks</dd></dl>
   <ul class="checks"><li>No calculator — practise in Drills</li><li>Prepare your A4 reference paper</li><li>Revise lectures, quizzes and labs</li><li>Past quiz questions may reappear</li></ul>
  </div>
  <div class="card" style="margin-top:18px">
   <div class="eyebrow">Your progress</div>
   <div class="stats"><div class="stat"><b>${answered}</b><span>MCQs attempted</span></div><div class="stat"><b>${pct(right, answered)}%</b><span>last-try accuracy</span></div></div>
   <a class="btn ghost sm" href="#/progress">See weak topics →</a>
  </div>
  <div class="card"><div class="eyebrow">Quick start</div>
   <p><a href="#/notes/t1">Read the notes</a> · <a href="#/cards">Flashcards</a> · <a href="#/drills">Mental-math drills</a> · <a href="#/sheet">Build your A4 sheet</a></p></div>
 </aside>
</div>
<p class="foot">Built from the CSD3116 Week 1–6 slides and your in-class / take-home quiz reviews. Questions marked “Past quiz” are reworded from those quizzes; others are new practice, not predictions.</p>`;
  }

  /* ========== PRACTICE SESSION ========== */
  let S = store.get('sess', null);
  const saveS = () => store.set('sess', S);

  function startSession(ids, mode) {
    const r = rng(Date.now() & 0xffffffff);
    S = { mode, ids, i: 0, ans: {}, order: {}, done: false, start: Date.now(), limit: mode === 'timed' ? ids.length * 90 : 0 };
    ids.forEach((id) => (S.order[id] = optionOrder(MQ[id], r)));
    saveS(); go('#/practice');
  }

  function viewPractice() {
    if (!S || !S.ids || !S.ids.length) { $app.innerHTML = `<div class="empty">No session running. <a href="#/">Start one from the desk</a>.</div>`; return; }
    if (S.done) return practiceResults();
    const id = S.ids[S.i], q = MQ[id], opts = S.order[id], chosen = S.ans[id];
    const locked = S.mode === 'study' && chosen != null;
    const answeredN = Object.keys(S.ans).length;
    $app.innerHTML = `<div class="qwrap">
 <div class="qhead"><a class="btn ghost sm" href="#/">← Desk</a><div class="bar"><i style="width:${pct(S.i + 1, S.ids.length)}%"></i></div>
  <span class="step">${S.i + 1} / ${S.ids.length}</span>${S.mode === 'timed' ? '<span class="timer" id="tm">--:--</span>' : ''}</div>
 <div class="card qcard">
  <div class="qmeta"><span class="pill">${TOP[q.t].n} · ${TOP[q.t].title}</span><span class="pill">${q.set === 'past' ? 'Past quiz' : 'New'}</span><span class="pill">${q.kind === 'a' ? 'Calculation' : 'Concept'}</span></div>
  <div class="qtext">${q.text}</div>
  <div class="opts">${opts.map((o, k) => {
      let cls = '';
      if (locked) { if (o === q.ans) cls = 'ok'; else if (o === chosen) cls = 'no'; }
      else if (o === chosen) cls = 'sel';
      return `<button class="opt ${cls}" data-act="choose" data-v="${k}" ${locked ? 'disabled' : ''}><span class="k">${LET[k]}</span><span>${o}</span></button>`;
    }).join('')}</div>
  ${locked ? `<div class="explain ${chosen === q.ans ? 'good' : 'bad'}"><b>${chosen === q.ans ? 'Correct.' : 'Not quite.'}</b> Answer: ${q.ans}. ${q.exp || ''} <br><small>Source: ${q.ref} · <a href="#/notes/${q.t}">Review notes</a></small></div>` : ''}
  <div class="qnav"><button class="btn ghost" data-act="prev" ${S.i ? '' : 'disabled'}>← Back</button>
   <span>${S.mode === 'study' && !locked ? '<button class="btn ghost" data-act="hint">Show where to look</button>' : ''}</span>
   ${S.i < S.ids.length - 1 ? '<button class="btn" data-act="next">Next →</button>' : `<button class="btn acc" data-act="finish">Finish (${answeredN}/${S.ids.length} answered)</button>`}</div>
  <div id="hint"></div>
 </div>
 <div class="palette">${S.ids.map((x, k) => {
      let c = k === S.i ? 'cur ' : '';
      if (S.ans[x] != null) c += S.mode === 'study' ? (S.ans[x] === MQ[x].ans ? 'ok' : 'no') : 'done';
      return `<button class="${c}" data-act="jump" data-v="${k}">${k + 1}</button>`;
    }).join('')}</div>
 <p class="foot">Keys: A–F or 1–6 choose · ← → move · Enter next</p></div>`;
    if (S.mode === 'timed') startTimer(S.start, S.limit, () => { S.done = true; finishPractice(); });
  }

  function startTimer(start, limit, onEnd) {
    const el = () => document.getElementById('tm');
    const tick = () => {
      const left = limit - (Date.now() - start) / 1000;
      if (el()) { el().textContent = fmt(left); el().classList.toggle('low', left < 300); }
      if (left <= 0) { clearTimer(); onEnd(); }
    };
    tick(); timerId = setInterval(tick, 1000);
  }

  function finishPractice() {
    if (!S.recorded) { S.ids.forEach((id) => { if (S.ans[id] != null) record(id, S.ans[id] === MQ[id].ans); }); S.recorded = true; }
    S.done = true; saveS(); route();
  }

  function topicBars(rows) { // rows: {t: [got, total]}
    return Object.keys(rows).map((t) => `<div class="hbar"><span class="l">${TOP[t].n} ${TOP[t].title}</span><span class="b"><i style="width:${pct(rows[t][0], rows[t][1])}%"></i></span><span class="v">${rows[t][0]}/${rows[t][1]}</span></div>`).join('');
  }

  function reviewMCQ(id, chosen) {
    const q = MQ[id], ok = chosen === q.ans;
    return `<div class="rev ${ok ? 'ok' : 'no'}"><div class="qmeta"><span class="pill">${TOP[q.t].title}</span><span class="pill">${q.ref}</span></div>
      <div>${q.text}</div><p><b>Your answer:</b> ${chosen == null ? '<i>blank</i>' : chosen}<br><b>Correct:</b> ${q.ans}</p>${q.exp ? `<small>${q.exp}</small>` : ''}</div>`;
  }

  function practiceResults() {
    const got = S.ids.filter((id) => S.ans[id] === MQ[id].ans).length;
    const rows = {}; S.ids.forEach((id) => { const t = MQ[id].t; rows[t] = rows[t] || [0, 0]; rows[t][1]++; if (S.ans[id] === MQ[id].ans) rows[t][0]++; });
    const wrong = S.ids.filter((id) => S.ans[id] !== MQ[id].ans);
    const showAll = S.showAll;
    $app.innerHTML = `<div class="qwrap"><div class="eyebrow">${S.mode === 'timed' ? 'Timed set' : 'Study session'} · results</div>
 <div class="score">${got} / ${S.ids.length}</div><p class="lede">${pct(got, S.ids.length)}% · time ${fmt((Date.now() - S.start) / 1000)}</p>
 <div class="card"><h2>By topic</h2>${topicBars(rows)}</div>
 <div class="row noprint"><button class="btn" data-act="retrywrong" ${wrong.length ? '' : 'disabled'}>Retry ${wrong.length} wrong</button><button class="btn ghost" data-act="goto" data-v="#/">New session</button>
  <button class="btn ghost" data-act="toggleall">${showAll ? 'Show wrong only' : 'Show all answers'}</button></div>
 ${(showAll ? S.ids : wrong).map((id) => reviewMCQ(id, S.ans[id])).join('') || '<div class="empty">Nothing wrong. Nice.</div>'}</div>`;
  }

  /* ========== NOTES ========== */
  function viewNotes(tid) {
    tid = TOP[tid] ? tid : 't1';
    const t = TOP[tid], idx = TOPICS.indexOf(t);
    $app.innerHTML = `<div class="eyebrow">${t.week} · Notes</div><h1>${t.title}</h1><p class="lede">${t.sub}</p>
<div class="notes" style="margin-top:20px"><nav class="toc">${TOPICS.map((x) => `<a href="#/notes/${x.id}" class="${x.id === tid ? 'on' : ''}">${x.n} · ${x.title}<small>${x.week}</small></a>`).join('')}</nav>
<div>${NOTES[tid].map((s) => `<section class="sec"><h3>${s.h}</h3>${s.html}</section>`).join('')}
<div class="row"><button class="btn" data-act="practise-topic" data-v="${tid}">Practise this topic →</button><a class="btn ghost" href="#/cards/${tid}">Flashcards</a>
${idx < TOPICS.length - 1 ? `<a class="btn ghost" href="#/notes/${TOPICS[idx + 1].id}">Next: ${TOPICS[idx + 1].title} →</a>` : ''}</div></div></div>`;
  }

  /* ========== FLASHCARDS ========== */
  let FC = null;
  const known = store.get('known', {});
  function buildDeck(tid, hideKnown) {
    let deck = CARDS.map((c, i) => ({ i, t: c[0], f: c[1], b: c[2] })).filter((c) => !tid || tid === 'all' || c.t === tid);
    if (hideKnown) deck = deck.filter((c) => !known[c.i]);
    return shuffle(deck);
  }
  function viewCards(tid) {
    tid = tid || (FC && FC.tid) || 'all';
    if (!FC || FC.tid !== tid) FC = { tid, hide: FC ? FC.hide : false, deck: null, k: 0, flip: false };
    if (!FC.deck) FC.deck = buildDeck(tid, FC.hide);
    const c = FC.deck[FC.k];
    const knownN = CARDS.filter((x, i) => known[i] && (tid === 'all' || x[0] === tid)).length;
    const total = CARDS.filter((x) => tid === 'all' || x[0] === tid).length;
    $app.innerHTML = `<div class="eyebrow">Flashcards</div><h1>Recall, don't reread.</h1>
<div class="row"><select data-act="fc-topic"><option value="all">All topics (${CARDS.length})</option>${TOPICS.map((t) => `<option value="${t.id}" ${t.id === tid ? 'selected' : ''}>${t.n} · ${t.title}</option>`).join('')}</select>
<label><input type="checkbox" data-act="fc-hide" ${FC.hide ? 'checked' : ''}> Hide cards I know</label>
<span class="step">${knownN}/${total} known</span><button class="btn ghost sm" data-act="fc-shuffle">Shuffle</button></div>
${c ? `<div class="fc ${FC.flip ? 'flip' : ''}" data-act="fc-flip"><div class="fc-in"><div class="face"><small>${TOP[c.t].title} · ${FC.k + 1}/${FC.deck.length}</small>${c.f}</div><div class="face back"><small>Answer</small>${c.b}</div></div></div>
<div class="row" style="justify-content:center"><button class="btn ghost" data-act="fc-prev">←</button><button class="btn ghost" data-act="fc-again">Again</button><button class="btn" data-act="fc-know">I know it ✓</button><button class="btn ghost" data-act="fc-next">→</button></div>
<p class="foot" style="text-align:center">Click card or Space to flip · ← → move · K = know</p>`
      : `<div class="empty">No cards left in this deck. <button class="linkbtn" data-act="fc-reset">Reset known cards</button></div>`}`;
  }

  /* ========== DRILLS (no-calculator) ========== */
  const hx = (n, w) => '0x' + n.toString(16).toUpperCase().padStart(w || 2, '0');
  const bin8 = (n) => (n & 255).toString(2).padStart(8, '0').replace(/(\d{4})/, '$1 ');
  const DRILLS = {
    bitop: { name: 'Hex AND / OR / XOR', gen() {
      const a = randInt(0, 255), b = randInt(0, 255), op = pick(['AND', 'OR', 'XOR']);
      const r = op === 'AND' ? a & b : op === 'OR' ? a | b : a ^ b;
      return { q: `<code>${hx(a)} ${op} ${hx(b)}</code> = ? (hex)`, a: r, hex: true, w: `${bin8(a)}<br>${bin8(b)} ${op}<br>= ${bin8(r)} = ${hx(r)}` };
    } },
    not: { name: 'Byte NOT', gen() { const a = randInt(0, 255), r = ~a & 255; return { q: `<code>notb</code> of ${hx(a)} = ? (hex)`, a: r, hex: true, w: `${bin8(a)} → ${bin8(r)} = ${hx(r)}` }; } },
    mask: { name: 'Build a mask', gen() {
      const bits = shuffle([0, 1, 2, 3, 4, 5, 6, 7]).slice(0, 2).sort((x, y) => x - y), r = (1 << bits[0]) | (1 << bits[1]);
      return { q: `8-bit mask that selects bits ${bits[0]} and ${bits[1]} (hex)?`, a: r, hex: true, w: `${bin8(r)} = ${hx(r)} (bit 0 is the LSB)` };
    } },
    shift: { name: 'sal / sar', gen() {
      if (Math.random() < 0.5) { const v = randInt(1, 15), k = randInt(1, 3); return { q: `<code>sal $${k}</code> on ${v} = ? (decimal)`, a: v << k, w: `${v} × 2^${k} = ${v << k}` }; }
      const v = -pick([4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 7, 9]), k = randInt(1, 3), r = Math.floor(v / (1 << k));
      return { q: `<code>sar $${k}</code> on ${v} = ? (decimal)`, a: r, w: `${v} ÷ ${1 << k} rounded down (sign kept) = ${r}` };
    } },
    addr: { name: 'D(Rb,Ri,S) address', gen() {
      const rb = randInt(10, 90) * 10, ri = randInt(1, 20), s = pick([1, 2, 4, 8]), d = randInt(0, 8) * 4;
      return { q: `rax = ${rb}, rcx = ${ri}. Address of <code>${d}(%rax,%rcx,${s})</code>? (decimal)`, a: d + rb + ri * s, w: `${d} + ${rb} + ${ri}×${s} = ${d + rb + ri * s}` };
    } },
    cache: { name: 'Block / set / tag / offset', gen() {
      const addr = randInt(1000, 40000), blk = Math.floor(addr / 64), part = pick(['block', 'set', 'tag', 'offset']);
      const v = { block: blk, set: blk % 64, tag: Math.floor(blk / 64), offset: addr - blk * 64 }[part];
      return { q: `64 B lines, 64 sets. Address ${addr}: ${part} number? (decimal)`, a: v, w: `block = ${addr}/64 = ${blk} (${blk * 64}); set = ${blk}%64 = ${blk % 64}; tag = ${blk}/64 = ${Math.floor(blk / 64)}; offset = ${addr} − ${blk * 64} = ${addr - blk * 64}` };
    } },
    pipe: { name: 'Pipeline cycles', gen() {
      const N = randInt(5, 60), k = randInt(4, 8), np = Math.random() < 0.3;
      return np ? { q: `${N} instructions, ${k} stages, NO pipelining. Cycles?`, a: N * k, w: `N × k = ${N * k}` }
        : { q: `${N} instructions on an ideal ${k}-stage pipeline. Cycles?`, a: N + k - 1, w: `N + k − 1 = ${N} + ${k} − 1 = ${N + k - 1}` };
    } },
    flat: { name: '2D flattened index', gen() {
      const c = randInt(3, 8), r = randInt(2, 6), i = randInt(0, r - 1), j = randInt(0, c - 1), k = i * c + j;
      return { q: `<code>int a[${r}][${c}]</code>: flattened index of a[${i}][${j}]?`, a: k, w: `k = i·c + j = ${i}×${c} + ${j} = ${k}` };
    } },
    branch: { name: 'Misprediction cost', gen() {
      const b = pick([100, 200, 400, 500]), acc = pick([80, 90, 95]), pen = randInt(6, 15), miss = (b * (100 - acc)) / 100;
      return { q: `${b} branches, ${acc}% predicted correctly, penalty ${pen} cycles. Cycles lost?`, a: miss * pen, w: `${miss} misses × ${pen} = ${miss * pen}` };
    } },
    hexdec: { name: 'Hex ↔ decimal', gen() {
      const v = randInt(16, 255);
      return Math.random() < 0.5 ? { q: `${hx(v)} in decimal?`, a: v, w: `${v >> 4}×16 + ${v & 15} = ${v}` }
        : { q: `${v} in hex?`, a: v, hex: true, w: `${v} = ${v >> 4}×16 + ${v & 15} → ${hx(v)}` };
    } }
  };
  let D = { type: 'bitop', cur: null, streak: 0, done: 0, ok: 0, fb: '' };
  function viewDrills() {
    if (!D.cur) D.cur = DRILLS[D.type].gen();
    $app.innerHTML = `<div class="eyebrow">Drills · no calculator</div><h1>Make the arithmetic automatic.</h1>
<p class="lede">The test bans calculators. These generators give endless fresh numbers for the calculations the quizzes keep asking.</p>
<div class="row"><div class="seg">${Object.keys(DRILLS).map((k) => `<button class="${k === D.type ? 'on' : ''}" data-act="dr-type" data-v="${k}">${DRILLS[k].name}</button>`).join('')}</div></div>
<div class="card qcard" style="max-width:720px"><div class="drill">${D.cur.q}</div>
<form data-act="dr-check" class="row"><input type="text" id="drin" autocomplete="off" placeholder="${D.cur.hex ? 'e.g. 5B or 0x5B' : 'number'}" style="width:200px"><button class="btn">Check</button><button type="button" class="btn ghost" data-act="dr-skip">Skip / new</button></form>
<div id="drfb">${D.fb}</div>
<p class="step">Streak ${D.streak} · ${D.ok}/${D.done} correct this visit</p></div>`;
    const inp = document.getElementById('drin'); if (inp && !D.fb) inp.focus();
  }

  /* ========== MOCK EXAM ========== */
  const MQUOTA = { t1: 6, t2: 7, t3: 8, t4: 7, t5: 6, t6: 6, t7: 4, t8: 6 };
  const SQUOTA = { t1: 3, t2: 3, t3: 4, t4: 3, t5: 3, t6: 3, t7: 2, t8: 4 };
  let M = store.get('mock', null);
  const saveM = () => store.set('mock', M);

  function buildPaper(seed) {
    const r = rng(seed); const mcq = [], saq = [];
    TOPICS.forEach((t) => { shuffle(MCQ.filter((q) => q.t === t.id), r).slice(0, MQUOTA[t.id]).forEach((q) => mcq.push(q.id)); });
    TOPICS.forEach((t) => { shuffle(SAQ.filter((q) => q.t === t.id), r).slice(0, SQUOTA[t.id]).forEach((q) => saq.push(q.id)); });
    const order = {}; mcq.forEach((id) => (order[id] = optionOrder(MQ[id], r)));
    return { mcq: shuffle(mcq, r), saq: shuffle(saq, r), order };
  }

  function viewMock() {
    if (M && !M.done) return mockQuestion();
    if (M && M.done) return mockResults();
    const hist2 = store.get('mockHist', []);
    $app.innerHTML = `<div class="eyebrow">Mock midterm</div><h1>Sit the real format.</h1>
<p class="lede">Section A: 50 MCQ × 1 mark. Section B: 25 short-answer × 2 marks. 100 marks, 2 hours, no calculator. Topic weighting follows Weeks 1–6. MCQs mark themselves; for short answers you see the model answer and award 0, 1 or 2 (exact numeric answers are auto-marked).</p>
<div class="grid"><div class="card"><h2>Choose a paper</h2>
<p>Papers A–C are fixed, so you can retake the same paper. “Random” draws a fresh paper.</p>
<div class="modes">${[['A', 101], ['B', 202], ['C', 303]].map(([n, s]) => `<button class="mode" data-act="mock-start" data-v="${s}" data-n="Paper ${n}"><span class="ic">▣</span><b>Paper ${n}</b><span>50 MCQ · 25 SAQ · 2:00:00</span><span class="tag">Fixed</span></button>`).join('')}</div>
<div class="row"><button class="btn" data-act="mock-start" data-v="rand" data-n="Random paper">Random paper →</button></div></div>
<aside class="side"><div class="eyebrow">Exam tips</div><ul class="checks"><li>About 1.6 min per question: MCQs first, ~45 min</li><li>Flag hard ones, come back</li><li>Short answers: hex in uppercase, no 0x, unless told</li><li>Write intermediate steps for cache/pipeline maths</li></ul>
${hist2.length ? `<h3>Past attempts</h3>${hist2.slice(-6).reverse().map((h) => `<p class="step">${h.name} · ${h.score}/100 · ${new Date(h.at).toLocaleDateString()}</p>`).join('')}` : ''}</aside></div>`;
  }

  function mockQuestion() {
    const all = M.mcq.map((id) => ({ s: 'A', id })).concat(M.saq.map((id) => ({ s: 'B', id })));
    const cur = all[M.i], isA = cur.s === 'A';
    const q = isA ? MQ[cur.id] : SQ[cur.id];
    const num = isA ? M.i + 1 : M.i - M.mcq.length + 1;
    let body;
    if (isA) {
      body = `<div class="opts">${M.order[cur.id].map((o, k) => `<button class="opt ${M.ans[cur.id] === o ? 'sel' : ''}" data-act="mock-choose" data-v="${k}"><span class="k">${LET[k]}</span><span>${o}</span></button>`).join('')}</div>`;
    } else {
      body = `<textarea id="saq" data-act="mock-type" placeholder="Your answer…">${esc(M.ans[cur.id] || '')}</textarea>`;
    }
    $app.innerHTML = `<div class="qwrap">
<div class="qhead"><span class="pill">${M.name}</span><div class="bar"><i style="width:${pct(Object.keys(M.ans).filter((k) => M.ans[k] !== '').length, all.length)}%"></i></div><span class="timer" id="tm">--:--</span></div>
<div class="card qcard"><div class="qmeta"><span class="pill">Section ${cur.s} · Q${num} · ${isA ? '1 mark' : '2 marks'}</span><span class="pill">${TOP[q.t].title}</span></div>
<div class="qtext">${q.text}</div>${body}
<div class="qnav"><button class="btn ghost" data-act="mock-prev" ${M.i ? '' : 'disabled'}>← Back</button>
<button class="btn ghost" data-act="mock-flag">${M.flag[cur.id] ? '⚑ Unflag' : '⚐ Flag'}</button>
${M.i < all.length - 1 ? '<button class="btn" data-act="mock-next">Next →</button>' : '<button class="btn acc" data-act="mock-submit">Submit paper</button>'}</div></div>
<div class="card"><div class="card-h"><b>Section A — MCQ</b><button class="btn ghost sm" data-act="mock-submit">Submit paper</button></div>
<div class="palette">${M.mcq.map((id, k) => `<button class="${k === M.i ? 'cur ' : ''}${M.flag[id] ? 'flag' : M.ans[id] != null ? 'done' : ''}" data-act="mock-jump" data-v="${k}">${k + 1}</button>`).join('')}</div>
<b style="display:block;margin-top:14px">Section B — Short answer</b>
<div class="palette">${M.saq.map((id, k) => { const g = M.mcq.length + k; return `<button class="${g === M.i ? 'cur ' : ''}${M.flag[id] ? 'flag' : M.ans[id] ? 'done' : ''}" data-act="mock-jump" data-v="${g}">${k + 1}</button>`; }).join('')}</div></div></div>`;
    startTimer(M.start, 7200, () => submitMock(true));
  }

  function submitMock(auto) {
    if (!auto) {
      const blank = M.mcq.filter((id) => M.ans[id] == null).length + M.saq.filter((id) => !M.ans[id]).length;
      if (!confirm(`Submit the paper?${blank ? ` ${blank} question(s) are blank.` : ''}`)) return;
    }
    M.done = true; M.end = Date.now(); M.marks = {};
    M.saq.forEach((id) => { const a = norm(M.ans[id] || ''); if (a && SQ[id].accept.some((x) => norm(x) === a)) M.marks[id] = 2; });
    M.mcq.forEach((id) => { if (M.ans[id] != null) record(id, M.ans[id] === MQ[id].ans); });
    saveM(); clearTimer(); route();
  }

  function mockScore() {
    const a = M.mcq.filter((id) => M.ans[id] === MQ[id].ans).length;
    const b = M.saq.reduce((s, id) => s + (M.marks[id] || 0), 0);
    return { a, b, total: a + b, pending: M.saq.filter((id) => M.marks[id] == null).length };
  }

  function mockResults() {
    const sc = mockScore();
    const rows = {}; M.mcq.forEach((id) => { const t = MQ[id].t; rows[t] = rows[t] || [0, 0]; rows[t][1]++; if (M.ans[id] === MQ[id].ans) rows[t][0]++; });
    M.saq.forEach((id) => { const t = SQ[id].t; rows[t] = rows[t] || [0, 0]; rows[t][1] += 2; rows[t][0] += M.marks[id] || 0; });
    const wrongA = M.mcq.filter((id) => M.ans[id] !== MQ[id].ans);
    $app.innerHTML = `<div class="qwrap"><div class="eyebrow">${M.name} · results</div>
<div class="score">${sc.total} / 100</div>
<p class="lede">Section A ${sc.a}/50 · Section B ${sc.b}/50${sc.pending ? ` · <b>${sc.pending} short answers still need your marking below</b>` : ''} · time used ${fmt(((M.end || Date.now()) - M.start) / 1000)}</p>
<div class="card"><h2>Marks by topic</h2>${topicBars(rows)}</div>
<div class="row noprint"><button class="btn" data-act="mock-save" ${sc.pending ? 'disabled' : ''}>Save score to history</button><button class="btn ghost" data-act="mock-new">New paper</button></div>
<h2 style="margin-top:24px">Section B — mark your short answers</h2>
${M.saq.map((id, k) => { const q = SQ[id], m = M.marks[id]; return `<div class="rev ${m == null ? '' : m === 2 ? 'ok' : 'no'}"><div class="qmeta"><span class="pill">B${k + 1}</span><span class="pill">${TOP[q.t].title}</span><span class="pill">${q.ref}</span></div>
<div>${q.text}</div><p><b>Your answer:</b> ${M.ans[id] ? '<code>' + esc(M.ans[id]) + '</code>' : '<i>blank</i>'}</p><p><b>Model answer:</b> ${q.model}</p>
<div class="seg">${[0, 1, 2].map((v) => `<button class="${m === v ? 'on' : ''}" data-act="mock-mark" data-id="${id}" data-v="${v}">${v} mark${v === 1 ? '' : 's'}</button>`).join('')}</div></div>`; }).join('')}
<h2 style="margin-top:24px">Section A — ${wrongA.length} MCQs to review</h2>
${wrongA.map((id) => reviewMCQ(id, M.ans[id])).join('') || '<div class="empty">All MCQs correct!</div>'}</div>`;
  }

  /* ========== A4 SHEET ========== */
  function viewSheet() {
    $app.innerHTML = `<div class="noprint"><div class="eyebrow">A4 reference paper</div><h1>Your sheet, pre-drafted.</h1>
<p class="lede">A dense starting point covering Weeks 1–6. Print it (A4, 3 columns) to check how much fits, then copy what you need onto your own reference paper. Check your course rules on what the A4 may contain.</p>
<div class="row"><button class="btn" onclick="window.print()">Print / save as PDF</button></div></div>
<div class="sheet">${SHEET}</div>`;
  }

  /* ========== PROGRESS ========== */
  function viewProgress() {
    const rows = {}; TOPICS.forEach((t) => (rows[t.id] = [0, 0]));
    Object.keys(hist).forEach((id) => { const q = MQ[id]; if (!q) return; rows[q.t][1]++; if (hist[id].last) rows[q.t][0]++; });
    const seen = Object.keys(hist).length;
    const wrong = Object.keys(hist).filter((id) => MQ[id] && !hist[id].last);
    const weak = TOPICS.filter((t) => rows[t.id][1] >= 3).sort((a, b) => rows[a.id][0] / rows[a.id][1] - rows[b.id][0] / rows[b.id][1]).slice(0, 3);
    const mh = store.get('mockHist', []);
    $app.innerHTML = `<div class="eyebrow">Progress</div><h1>Where the marks are leaking.</h1>
<div class="stats"><div class="stat"><b>${seen}/${MCQ.length}</b><span>MCQs seen</span></div><div class="stat"><b>${wrong.length}</b><span>currently wrong</span></div>
<div class="stat"><b>${Object.keys(known).length}/${CARDS.length}</b><span>flashcards known</span></div><div class="stat"><b>${mh.length ? mh[mh.length - 1].score : '—'}</b><span>last mock /100</span></div></div>
<div class="card"><h2>Last-try accuracy by topic</h2>${topicBars(rows)}
${weak.length ? `<p>Weakest: ${weak.map((t) => `<a href="#/notes/${t.id}">${t.title}</a>`).join(', ')}</p>` : '<p class="lede">Answer at least 3 questions per topic to see weak spots.</p>'}</div>
<div class="row"><button class="btn" data-act="drill-wrong" ${wrong.length ? '' : 'disabled'}>Practise my ${wrong.length} mistakes →</button>
<button class="btn ghost" data-act="reset-all">Reset all progress</button></div>
${mh.length ? `<div class="card"><h2>Mock history</h2>${mh.map((h) => `<p class="step">${h.name} · A ${h.a}/50 · B ${h.b}/50 · <b>${h.score}/100</b> · ${new Date(h.at).toLocaleString()}</p>`).join('')}</div>` : ''}`;
  }

  /* ========== events ========== */
  $app.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const act = el.dataset.act, v = el.dataset.v;
    switch (act) {
      case 'goto': go(v); break;
      case 'mode': prefs.mode = v; savePrefs(); route(); break;
      case 'topic': {
        const i = prefs.topics.indexOf(v); i >= 0 ? prefs.topics.splice(i, 1) : prefs.topics.push(v); savePrefs(); route(); break;
      }
      case 'all': prefs.topics = TOPICS.map((t) => t.id); savePrefs(); route(); break;
      case 'none': prefs.topics = []; savePrefs(); route(); break;
      case 'set': prefs.set = v; savePrefs(); route(); break;
      case 'focus': prefs.focus = v; savePrefs(); route(); break;
      case 'count': prefs.count = v === 'all' ? 'all' : +v; savePrefs(); route(); break;
      case 'start': {
        const p = pool(prefs.topics, prefs.set, prefs.focus);
        const n = prefs.count === 'all' ? p.length : Math.min(prefs.count, p.length);
        startSession(balancedPick(p, n).map((q) => q.id), prefs.mode); break;
      }
      case 'practise-topic': startSession(balancedPick(MCQ.filter((q) => q.t === v), 15).map((q) => q.id), 'study'); break;
      case 'choose': {
        const id = S.ids[S.i]; if (S.mode === 'study' && S.ans[id] != null) break;
        S.ans[id] = S.order[id][+v];
        if (S.mode === 'study') record(id, S.ans[id] === MQ[id].ans);
        saveS(); route(); break;
      }
      case 'prev': if (S.i > 0) { S.i--; saveS(); route(); } break;
      case 'next': if (S.i < S.ids.length - 1) { S.i++; saveS(); route(); } break;
      case 'jump': S.i = +v; saveS(); route(); break;
      case 'hint': { const q = MQ[S.ids[S.i]]; document.getElementById('hint').innerHTML = `<div class="explain">Look at <b>${q.ref}</b> — ${TOP[q.t].title}. <a href="#/notes/${q.t}" target="_blank">Open notes</a></div>`; break; }
      case 'finish': {
        if (S.mode === 'study') { S.recorded = true; } else if (Object.keys(S.ans).length < S.ids.length && !confirm('Some questions are unanswered. Finish anyway?')) break;
        finishPractice(); break;
      }
      case 'retrywrong': startSession(S.ids.filter((id) => S.ans[id] !== MQ[id].ans), S.mode); break;
      case 'toggleall': S.showAll = !S.showAll; saveS(); route(); break;
      /* cards */
      case 'fc-flip': FC.flip = !FC.flip; route(); break;
      case 'fc-next': if (FC.k < FC.deck.length - 1) { FC.k++; FC.flip = false; route(); } break;
      case 'fc-prev': if (FC.k > 0) { FC.k--; FC.flip = false; route(); } break;
      case 'fc-again': { const c = FC.deck.splice(FC.k, 1)[0]; FC.deck.push(c); delete known[c.i]; store.set('known', known); FC.flip = false; if (FC.k >= FC.deck.length) FC.k = 0; route(); break; }
      case 'fc-know': { const c = FC.deck[FC.k]; known[c.i] = 1; store.set('known', known); if (FC.hide) FC.deck.splice(FC.k, 1); else FC.k++; if (FC.k >= FC.deck.length) FC.k = 0; FC.flip = false; route(); break; }
      case 'fc-shuffle': FC.deck = buildDeck(FC.tid, FC.hide); FC.k = 0; FC.flip = false; route(); break;
      case 'fc-reset': Object.keys(known).forEach((k) => delete known[k]); store.set('known', known); FC.deck = null; FC.k = 0; route(); break;
      case 'fc-hide': FC.hide = el.checked; FC.deck = null; FC.k = 0; route(); break;
      /* drills */
      case 'dr-type': D.type = v; D.cur = null; D.fb = ''; route(); break;
      case 'dr-skip': D.cur = null; D.fb = ''; route(); break;
      /* mock */
      case 'mock-start': {
        const seed = v === 'rand' ? (Date.now() & 0xffffff) : +v; const p = buildPaper(seed);
        M = { name: el.dataset.n, seed, mcq: p.mcq, saq: p.saq, order: p.order, ans: {}, flag: {}, i: 0, start: Date.now(), done: false };
        saveM(); route(); break;
      }
      case 'mock-choose': { const id = M.mcq[M.i]; M.ans[id] = M.order[id][+v]; saveM(); route(); break; }
      case 'mock-prev': M.i--; saveM(); route(); break;
      case 'mock-next': M.i++; saveM(); route(); break;
      case 'mock-jump': M.i = +v; saveM(); route(); break;
      case 'mock-flag': { const id = M.i < M.mcq.length ? M.mcq[M.i] : M.saq[M.i - M.mcq.length]; M.flag[id] = !M.flag[id]; saveM(); route(); break; }
      case 'mock-submit': submitMock(false); break;
      case 'mock-mark': M.marks[el.dataset.id] = +v; saveM(); route(); break;
      case 'mock-save': {
        const sc = mockScore(), mh = store.get('mockHist', []);
        mh.push({ name: M.name, a: sc.a, b: sc.b, score: sc.total, at: Date.now() }); store.set('mockHist', mh);
        M = null; store.del('mock'); go('#/progress'); break;
      }
      case 'mock-new': if (confirm('Discard this paper\'s results and start a new one?')) { M = null; store.del('mock'); route(); } break;
      /* progress */
      case 'drill-wrong': startSession(shuffle(Object.keys(hist).filter((id) => MQ[id] && !hist[id].last)), 'study'); break;
      case 'reset-all':
        if (confirm('Erase all answers, flashcard progress and mock history on this device?')) {
          ['hist', 'known', 'mockHist', 'sess', 'mock'].forEach(store.del); location.reload();
        }
        break;
    }
  });
  $app.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.act === 'fc-topic') { FC = null; go('#/cards/' + el.value); }
    if (el.dataset.act === 'fc-hide') { FC.hide = el.checked; FC.deck = null; FC.k = 0; route(); }
  });
  $app.addEventListener('input', (e) => {
    if (e.target.dataset.act === 'mock-type') { M.ans[M.saq[M.i - M.mcq.length]] = e.target.value; saveM(); }
  });
  $app.addEventListener('submit', (e) => {
    if (e.target.dataset.act !== 'dr-check') return;
    e.preventDefault();
    const raw = document.getElementById('drin').value.trim(); if (!raw) return;
    const c = D.cur;
    const val = c.hex ? parseInt(raw.replace(/^0x/i, ''), 16) : Number(raw);
    const ok = val === c.a; D.done++; if (ok) { D.ok++; D.streak++; } else D.streak = 0;
    D.fb = `<div class="fb ${ok ? 'ok' : 'no'}"><b>${ok ? 'Correct' : 'Answer: ' + (c.hex ? hx(c.a) : c.a)}</b><br>${c.w}</div><button class="btn sm" data-act="dr-skip" style="margin-top:10px">Next →</button>`;
    route();
  });

  /* keyboard */
  document.addEventListener('keydown', (e) => {
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    const r = location.hash.replace(/^#\/?/, '').split('/')[0];
    const k = e.key.toLowerCase();
    const click = (sel) => { const b = $app.querySelector(sel); if (b && !b.disabled) b.click(); };
    if (r === 'practice' && S && !S.done) {
      const idx = '123456'.indexOf(k) >= 0 ? '123456'.indexOf(k) : 'abcdef'.indexOf(k);
      if (idx >= 0) click(`[data-act="choose"][data-v="${idx}"]`);
      else if (k === 'arrowright' || k === 'enter') click('[data-act="next"]');
      else if (k === 'arrowleft') click('[data-act="prev"]');
    } else if (r === 'mock' && M && !M.done) {
      const idx = '123456'.indexOf(k) >= 0 ? '123456'.indexOf(k) : 'abcdef'.indexOf(k);
      if (idx >= 0) click(`[data-act="mock-choose"][data-v="${idx}"]`);
      else if (k === 'arrowright') click('[data-act="mock-next"]');
      else if (k === 'arrowleft') click('[data-act="mock-prev"]');
    } else if (r === 'cards' && FC) {
      if (k === ' ') { e.preventDefault(); click('[data-act="fc-flip"]'); }
      else if (k === 'arrowright') click('[data-act="fc-next"]');
      else if (k === 'arrowleft') click('[data-act="fc-prev"]');
      else if (k === 'k') click('[data-act="fc-know"]');
    }
  });

  route();
})();
