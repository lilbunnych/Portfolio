// Jot renderer: list, search, editor, live Markdown preview, autosave.
(() => {
  const $ = (s) => document.querySelector(s);
  const els = { list: $('#list'), empty: $('#empty'), search: $('#search'), title: $('#title'), editor: $('#editor'), preview: $('#preview'), panes: $('#panes'), words: $('#words'), saved: $('#saved') };
  let notes = [];
  let current = null;
  let saveTimer = 0;

  marked.setOptions({ gfm: true, breaks: false });
  const render = (md) => DOMPurify.sanitize(marked.parse(md));
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const excerpt = (body) => body.replace(/^#.*$/m, '').replace(/^\s*[-*+]\s+\[[ xX]\]\s*/gm, '').replace(/[#>*`\-\[\]]/g, '').trim().split('\n').find(Boolean) || 'Empty note';
  const when = (t) => {
    const d = new Date(t), now = new Date();
    return d.toDateString() === now.toDateString() ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  function drawList() {
    const q = els.search.value.trim().toLowerCase();
    const shown = notes
      .filter((n) => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
      .sort((a, b) => b.updated - a.updated);
    const hl = (s) => (q ? esc(s).replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), (m) => `<mark>${m}</mark>`) : esc(s));
    els.list.innerHTML = shown.map((n) => `
      <li><button data-id="${n.id}" aria-current="${current && n.id === current.id}">
        <span class="t">${hl(n.title || 'Untitled')}</span>
        <span class="x">${hl(excerpt(n.body))}</span>
        <span class="d">${when(n.updated)}</span>
      </button></li>`).join('');
    els.empty.hidden = shown.length > 0;
  }

  function open(note) {
    current = note;
    els.title.value = note.title;
    els.editor.value = note.body;
    els.preview.innerHTML = render(note.body);
    count();
    drawList();
  }

  function count() {
    const n = (els.editor.value.match(/\S+/g) || []).length;
    els.words.textContent = `${n} ${n === 1 ? 'word' : 'words'}`;
  }

  function scheduleSave() {
    if (!current) return;
    current.title = els.title.value.trim() || firstHeading(els.editor.value) || 'Untitled';
    current.body = els.editor.value;
    current.updated = Date.now();
    els.saved.textContent = 'Saving…';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      await window.jot.save(current);
      els.saved.textContent = 'Saved';
      drawList();
    }, 400);
  }
  const firstHeading = (md) => (md.match(/^#\s+(.+)$/m) || [])[1];

  async function create() {
    const note = { id: crypto.randomUUID(), title: 'Untitled', body: '# Untitled\n\n', updated: Date.now() };
    notes.unshift(await window.jot.save(note));
    open(notes[0]);
    els.title.select();
  }

  async function remove() {
    if (!current || !confirm(`Delete “${current.title}”? This cannot be undone.`)) return;
    await window.jot.remove(current.id);
    notes = notes.filter((n) => n.id !== current.id);
    if (!notes.length) return create();
    open(notes.sort((a, b) => b.updated - a.updated)[0]);
  }

  function setMode(mode) {
    els.panes.dataset.mode = mode;
    document.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    try { localStorage.setItem('jot-mode', mode); } catch {}
  }

  // Events
  els.list.addEventListener('click', (e) => { const b = e.target.closest('button[data-id]'); if (b) open(notes.find((n) => n.id === b.dataset.id)); });
  els.search.addEventListener('input', drawList);
  els.editor.addEventListener('input', () => { els.preview.innerHTML = render(els.editor.value); count(); scheduleSave(); });
  els.editor.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const { selectionStart: s, selectionEnd: t, value } = els.editor;
    els.editor.value = value.slice(0, s) + '  ' + value.slice(t);
    els.editor.selectionStart = els.editor.selectionEnd = s + 2;
    els.editor.dispatchEvent(new Event('input'));
  });
  els.title.addEventListener('input', scheduleSave);
  els.title.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); els.editor.focus(); } });
  $('#new').addEventListener('click', create);
  $('#delete').addEventListener('click', remove);
  $('#export').addEventListener('click', () => current && window.jot.exportNote(current));
  document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
  els.preview.addEventListener('click', (e) => { const a = e.target.closest('a[href]'); if (a) { e.preventDefault(); window.open(a.href); } });

  window.jot.onMenu((ch) => {
    if (ch === 'new') create();
    else if (ch === 'export') current && window.jot.exportNote(current);
    else if (ch === 'search') { els.search.focus(); els.search.select(); }
    else if (ch.startsWith('mode:')) setMode(ch.slice(5));
  });

  // Boot
  (async () => {
    let mode = 'split';
    try { mode = localStorage.getItem('jot-mode') || 'split'; } catch {}
    setMode(mode);
    notes = await window.jot.list();
    if (!notes.length) await create();
    else open(notes.sort((a, b) => b.updated - a.updated)[0]);
  })();
})();
