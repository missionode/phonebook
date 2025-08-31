document.addEventListener('DOMContentLoaded', () => {
  const btnExport = document.getElementById('btnExport');
  const fileImport = document.getElementById('fileImport');
  const autoSave = document.getElementById('autoSave');
  const btnForget = document.getElementById('btnForget');
  btnExport.addEventListener('click', () => Store.exportJSON());
  fileImport.addEventListener('change', async e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const n = await Store.importJSON(f);
      alert('Imported ' + n + ' contacts');
    } catch(err) {
      alert('Import failed');
    } finally {
      e.target.value = '';
    }
  });
  const p = Store.prefs();
  autoSave.checked = p.autoBackup === true;
  autoSave.addEventListener('change', () => {
    const cur = Store.prefs();
    Store.setPrefs({ ...cur, autoBackup: autoSave.checked });
  });
  btnForget.addEventListener('click', () => {
    const cur = Store.prefs();
    delete cur.autoBackup;
    Store.setPrefs(cur);
    autoSave.checked = false;
    alert('Backup setting cleared');
  });
});
