const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

const DB_PATH = path.join(__dirname, 'db', 'contacts.json');
const SEED_PATH = path.join(__dirname, 'data', 'seed-contacts.json');

function ensureDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify({ lastId: 0, contacts: [] }, null, 2));
  }
}
function loadDB() {
  ensureDB();
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const obj = JSON.parse(raw || '{}');
    if (!Array.isArray(obj.contacts)) obj.contacts = [];
    if (typeof obj.lastId !== 'number') obj.lastId = 0;
    return obj;
  } catch {
    return { lastId: 0, contacts: [] };
  }
}
function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}
function nextId(db) {
  db.lastId += 1;
  return String(db.lastId);
}
function sortByUpdated(list) {
  return [...list].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

(function seedIfEmpty() {
  const db = loadDB();
  if (db.contacts.length === 0 && fs.existsSync(SEED_PATH)) {
    try {
      const s = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
      const seed = Array.isArray(s?.contacts) ? s.contacts : [];
      const now = Date.now();
      seed.forEach((c, i) => {
        const id = nextId(db);
        db.contacts.unshift({ id, name: c.name || '', phone: c.phone || '', email: c.email || '', notes: c.notes || '', updatedAt: now - i });
      });
      saveDB(db);
    } catch {}
  }
})();

app.get('/api/contacts', (req, res) => {
  const db = loadDB();
  res.json(sortByUpdated(db.contacts));
});

app.get('/api/contacts/:id', (req, res) => {
  const db = loadDB();
  const c = db.contacts.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json(c);
});

app.post('/api/contacts', (req, res) => {
  const db = loadDB();
  const body = req.body || {};
  if (!body.name || !body.phone) return res.status(400).json({ error: 'name and phone required' });
  const id = nextId(db);
  const rec = { id, name: body.name || '', phone: body.phone || '', email: body.email || '', notes: body.notes || '', updatedAt: Date.now() };
  db.contacts.unshift(rec);
  saveDB(db);
  res.json(rec);
});

app.put('/api/contacts/:id', (req, res) => {
  const db = loadDB();
  const i = db.contacts.findIndex(x => x.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'Not found' });
  const body = req.body || {};
  const cur = db.contacts[i];
  const rec = {
    ...cur,
    name: body.name ?? cur.name,
    phone: body.phone ?? cur.phone,
    email: body.email ?? cur.email,
    notes: body.notes ?? cur.notes,
    updatedAt: Date.now()
  };
  db.contacts[i] = rec;
  saveDB(db);
  res.json(rec);
});

app.delete('/api/contacts/:id', (req, res) => {
  const db = loadDB();
  const before = db.contacts.length;
  db.contacts = db.contacts.filter(x => x.id !== req.params.id);
  if (db.contacts.length === before) return res.status(404).json({ error: 'Not found' });
  saveDB(db);
  res.json({ ok: true });
});

app.post('/api/import', (req, res) => {
  const incoming = Array.isArray(req.body) ? req.body : Array.isArray(req.body?.contacts) ? req.body.contacts : [];
  const db = loadDB();
  const byId = Object.fromEntries(db.contacts.map(c => [c.id, c]));
  let imported = 0;
  incoming.forEach(c => {
    let id = c.id && String(c.id);
    if (!id || byId[id]) id = nextId(db);
    byId[id] = {
      id,
      name: c.name || '',
      phone: c.phone || '',
      email: c.email || '',
      notes: c.notes || '',
      updatedAt: Date.now()
    };
    imported += 1;
  });
  db.contacts = sortByUpdated(Object.values(byId));
  saveDB(db);
  res.json({ imported });
});

app.get('/api/export', (req, res) => {
  const db = loadDB();
  const payload = JSON.stringify({ contacts: db.contacts }, null, 2);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="phonebook-backend-backup.json"');
  res.send(payload);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Phone Book server on http://localhost:' + PORT));
