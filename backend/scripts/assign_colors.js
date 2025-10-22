const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Reimplementar a mesma paleta/determinismo do frontend
const PALETTE = [
  '#2563eb', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#e11d48', '#0ea5e9', '#14b8a6', '#a78bfa', '#f97316'
];

function getColorForName(name) {
  if (!name || name.length === 0) return PALETTE[Math.floor(Math.random() * PALETTE.length)];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % PALETTE.length;
  return PALETTE[idx];
}

const dbPath = path.resolve(__dirname, '../rpg.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Erro ao abrir DB:', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  db.all(`SELECT id, name, color FROM characters WHERE color IS NULL OR color = ''`, (err, rows) => {
    if (err) {
      console.error('Erro query:', err.message);
      db.close();
      return;
    }

    console.log(`Encontrados ${rows.length} personagens sem cor.`);
    if (rows.length === 0) {
      db.close();
      return;
    }
    const stmt = db.prepare(`UPDATE characters SET color = ? WHERE id = ?`);
    rows.forEach(r => {
      const color = getColorForName(r.name);
      stmt.run(color, r.id, (err) => {
        if (err) console.error(`Erro ao atualizar id=${r.id}:`, err.message);
        else console.log(`Atualizado id=${r.id} (${r.name}) -> ${color}`);
      });
    });
    stmt.finalize((err) => {
      if (err) console.error('Erro finalizando stmt:', err.message);
      db.close();
    });
  });
});
