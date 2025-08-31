const Store = (() => {
  const listeners = new Set();
  function on(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  function emit(payload) { listeners.forEach(fn => fn({ type: 'contacts-changed', payload })); }

  async function load() {
    const r = await fetch('/api/contacts', { headers: { 'Accept': 'application/json' } });
    if (!r.ok) throw new Error('Failed to load');
    return await r.json();
  }

  async function upsert(c) {
    const body = { name: c.name, phone: c.phone, email: c.email, notes: c.notes };
    const r = c.id
      ? await fetch('/api/contacts/' + encodeURIComponent(c.id), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch('/api/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error('Save failed');
    const saved = await r.json();
    const all = await load();
    emit(all);
    return saved.id;
  }

  async function remove(id) {
    const r = await fetch('/api/contacts/' + encodeURIComponent(id), { method: 'DELETE' });
    if (!r.ok) throw new Error('Delete failed');
    const all = await load();
    emit(all);
  }

  function prefs() {
    try { return JSON.parse(localStorage.getItem('phonebook.prefs') || '{}'); } catch { return {}; }
  }
  function setPrefs(p) {
    localStorage.setItem('phonebook.prefs', JSON.stringify(p));
  }

  function exportJSON() {
    const a = document.createElement('a');
    a.href = '/api/export';
    a.download = 'phonebook-backend-backup.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function importJSON(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => reject(new Error('Failed to read file'));
      fr.onload = async () => {
        try {
          const data = JSON.parse(String(fr.result || '{}'));
          const r = await fetch('/api/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (!r.ok) throw new Error('Import failed');
          const j = await r.json();
          const all = await load();
          emit(all);
          resolve(j.imported || 0);
        } catch (e) { reject(e); }
      };
      fr.readAsText(file);
    });
  }

  async function initFirstRenderIfNeeded() {
    try {
      const list = await load();
      emit(list);
    } catch {}
  }

  initFirstRenderIfNeeded();

  return { load, upsert, remove, on, prefs, setPrefs, exportJSON, importJSON };
})();
