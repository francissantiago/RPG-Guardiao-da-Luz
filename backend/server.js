const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar ao banco SQLite
const db = new sqlite3.Database('./rpg.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err.message);
  } else {
    console.log('Conectado ao banco SQLite.');
  }
});

// Criar tabelas
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('gm', 'player'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    race TEXT,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    user_id INTEGER,
    forca INTEGER DEFAULT 0,
    destreza INTEGER DEFAULT 0,
    constituicao INTEGER DEFAULT 0,
    inteligencia INTEGER DEFAULT 0,
    sabedoria INTEGER DEFAULT 0,
    carisma INTEGER DEFAULT 0,
    pontos_disponiveis INTEGER DEFAULT 70,
    weapon_name TEXT,
    weapon_attr TEXT,
    weapon_bonus INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Adicionar colunas se não existirem (para migração)
  db.run(`ALTER TABLE characters ADD COLUMN forca INTEGER DEFAULT 0`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN destreza INTEGER DEFAULT 0`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN constituicao INTEGER DEFAULT 0`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN inteligencia INTEGER DEFAULT 0`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN sabedoria INTEGER DEFAULT 0`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN carisma INTEGER DEFAULT 0`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN pontos_disponiveis INTEGER DEFAULT 70`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN xp INTEGER DEFAULT 0`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN weapon_name TEXT`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN weapon_attr TEXT`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN weapon_bonus INTEGER DEFAULT 0`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN current_pv INTEGER`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN current_pe INTEGER`, (err) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
});

// Rotas para usuários
app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ users: rows });
  });
});

app.post('/users', (req, res) => {
  const { name, role } = req.body;
  db.run('INSERT INTO users (name, role) VALUES (?, ?)', [name, role], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

// Rotas para personagens
app.get('/characters', (req, res) => {
  db.all('SELECT * FROM characters', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ characters: rows });
  });
});

app.post('/characters', (req, res) => {
  const { name, race, level, user_id, forca, destreza, constituicao, inteligencia, sabedoria, carisma, pontos_disponiveis, xp, weapon_name, weapon_attr, weapon_bonus } = req.body;
  const max_pv = Math.min(5000, (constituicao + (weapon_attr === 'constituicao' ? weapon_bonus : 0)) * 250);
  const max_pe = Math.min(2000, ((inteligencia + sabedoria + carisma + (['inteligencia', 'sabedoria', 'carisma'].includes(weapon_attr) ? weapon_bonus : 0)) * 33));
  db.run('INSERT INTO characters (name, race, level, user_id, forca, destreza, constituicao, inteligencia, sabedoria, carisma, pontos_disponiveis, xp, weapon_name, weapon_attr, weapon_bonus, current_pv, current_pe) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [name, race, level || 1, user_id, forca || 0, destreza || 0, constituicao || 0, inteligencia || 0, sabedoria || 0, carisma || 0, pontos_disponiveis || 70, xp || 0, weapon_name || '', weapon_attr || '', weapon_bonus || 0, max_pv, max_pe], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

app.put('/characters/:id', (req, res) => {
  const { id } = req.params;
  const { name, race, level, forca, destreza, constituicao, inteligencia, sabedoria, carisma, pontos_disponiveis, xp, weapon_name, weapon_attr, weapon_bonus, current_pv, current_pe } = req.body;
  db.run('UPDATE characters SET name = ?, race = ?, level = ?, forca = ?, destreza = ?, constituicao = ?, inteligencia = ?, sabedoria = ?, carisma = ?, pontos_disponiveis = ?, xp = ?, weapon_name = ?, weapon_attr = ?, weapon_bonus = ?, current_pv = ?, current_pe = ? WHERE id = ?', [name, race, level, forca, destreza, constituicao, inteligencia, sabedoria, carisma, pontos_disponiveis, xp, weapon_name, weapon_attr, weapon_bonus, current_pv, current_pe, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

app.put('/characters/:id/levelup', (req, res) => {
  const { id } = req.params;
  const MAX_LEVEL = 20;
  const LEVEL_UP_PERCENTAGE = 0.1; // 10% increase per level
  db.get('SELECT level, xp, forca, destreza, constituicao, inteligencia, sabedoria, carisma, pontos_disponiveis FROM characters WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Personagem não encontrado' });
      return;
    }
    if (row.level >= MAX_LEVEL) {
      res.status(400).json({ error: 'Nível máximo alcançado' });
      return;
    }
    const requiredXp = 1000 * row.level; // XP required for next level
    if (row.xp < requiredXp) {
      res.status(400).json({ error: `XP insuficiente. Necessário: ${requiredXp}, Atual: ${row.xp}` });
      return;
    }
    const newLevel = row.level + 1;
    const newForca = Math.floor(row.forca * (1 + LEVEL_UP_PERCENTAGE));
    const newDestreza = Math.floor(row.destreza * (1 + LEVEL_UP_PERCENTAGE));
    const newConstituicao = Math.floor(row.constituicao * (1 + LEVEL_UP_PERCENTAGE));
    const newInteligencia = Math.floor(row.inteligencia * (1 + LEVEL_UP_PERCENTAGE));
    const newSabedoria = Math.floor(row.sabedoria * (1 + LEVEL_UP_PERCENTAGE));
    const newCarisma = Math.floor(row.carisma * (1 + LEVEL_UP_PERCENTAGE));
    const newPontos = row.pontos_disponiveis + 5; // Ainda ganha 5 pontos extras
    db.run('UPDATE characters SET level = ?, forca = ?, destreza = ?, constituicao = ?, inteligencia = ?, sabedoria = ?, carisma = ?, pontos_disponiveis = ? WHERE id = ?', [newLevel, newForca, newDestreza, newConstituicao, newInteligencia, newSabedoria, newCarisma, newPontos, id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ newLevel, newForca, newDestreza, newConstituicao, newInteligencia, newSabedoria, newCarisma, newPontos });
    });
  });
});

app.put('/characters/:id/addxp', (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    res.status(400).json({ error: 'Quantidade de XP inválida' });
    return;
  }
  db.get('SELECT xp FROM characters WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Personagem não encontrado' });
      return;
    }
    const newXp = row.xp + amount;
    db.run('UPDATE characters SET xp = ? WHERE id = ?', [newXp, id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ newXp });
    });
  });
});

app.delete('/characters/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM characters WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});