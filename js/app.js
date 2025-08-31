document.addEventListener('DOMContentLoaded', () => {
  const q = document.getElementById('q');
  const btnClear = document.getElementById('btnClear');
  const btnAdd = document.getElementById('btnAdd');
  const btnExportQuick = document.getElementById('btnExportQuick');
  const list = document.getElementById('list');
  const stats = document.getElementById('stats');
  const modal = document.getElementById('modal');
  const form = document.getElementById('form');
  const id = document.getElementById('id');
  const name = document.getElementById('name');
  const phone = document.getElementById('phone');
  const email = document.getElementById('email');
  const notes = document.getElementById('notes');
  const btnCancel = document.getElementById('btnCancel');
  const modalTitle = document.getElementById('modalTitle');

  let ALL = [];

  function setData(list) {
    ALL = Array.isArray(list) ? list : [];
    render(q.value || '');
  }

  function openModal(editing = null) {
    modal.classList.remove('hidden');
    if (editing) {
      modalTitle.textContent = 'Edit Contact';
      id.value = editing.id;
      name.value = editing.name || '';
      phone.value = editing.phone || '';
      email.value = editing.email || '';
      notes.value = editing.notes || '';
    } else {
      modalTitle.textContent = 'Add Contact';
      id.value = '';
      name.value = '';
      phone.value = '';
      email.value = '';
      notes.value = '';
    }
    name.focus();
  }

  function closeModal() { modal.classList.add('hidden'); }

  function avatarFor(n) {
    const seed = encodeURIComponent(n || 'user');
    return `https://picsum.photos/seed/${seed}/128/128`;
  }

  function render(filter = '') {
    const f = String(filter || '').trim().toLowerCase();
    const rows = f
      ? ALL.filter(c =>
          (c.name || '').toLowerCase().includes(f) ||
          (c.phone || '').toLowerCase().includes(f) ||
          (c.email || '').toLowerCase().includes(f)
        )
      : ALL;

    stats.textContent = `${rows.length} of ${ALL.length} contacts`;
    list.innerHTML = '';

    const tpl = document.getElementById('card-tpl');
    rows.forEach(c => {
      const node = tpl.content.cloneNode(true);
      node.querySelector('[data-img]').src = avatarFor(c.name);
      node.querySelector('[data-name]').textContent = c.name || '';
      node.querySelector('[data-phone]').textContent = c.phone || '';
      node.querySelector('[data-email]').textContent = c.email || '';
      node.querySelector('[data-notes]').textContent = c.notes || '';
      node.querySelector('[data-edit]').addEventListener('click', () => openModal(c));
      node.querySelector('[data-del]').addEventListener('click', async () => {
        if (confirm('Delete this contact?')) {
          try { await Store.remove(c.id); } catch { alert('Delete failed'); }
        }
      });
      list.appendChild(node);
    });
  }

  q.addEventListener('input', () => render(q.value));
  btnClear.addEventListener('click', () => { q.value=''; render(''); });
  btnAdd.addEventListener('click', () => openModal(null));
  btnExportQuick.addEventListener('click', () => Store.exportJSON());
  btnCancel.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const c = {
      id: id.value || undefined,
      name: name.value.trim(),
      phone: phone.value.trim(),
      email: email.value.trim(),
      notes: notes.value.trim()
    };
    if (!c.name || !c.phone) return alert('Name and Phone are required');
    try {
      await Store.upsert(c);
      closeModal();
    } catch {
      alert('Save failed');
    }
  });

  Store.on(e => {
    if (e.type === 'contacts-changed') setData(e.payload);
  });

  (async () => {
    try {
      const first = await Store.load();
      setData(first);
    } catch {
      setData([]);
    }
  })();
});
