import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar ao banco SQLite
const db = new sqlite3.Database('./rpg.db', (err: Error | null) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err.message);
  } else {
    console.log('Conectado ao banco SQLite.');
  }
});

// Terreno / ruído (paridade com frontend)
const TERRAIN_CONFIGS: Record<string, { walkable: boolean }> = {
  grass: { walkable: true },
  forest: { walkable: true },
  mountain: { walkable: false },
  water: { walkable: false },
  desert: { walkable: true },
  snow: { walkable: true },
  swamp: { walkable: true },
};

const noise = (x: number, y: number, seed: number): number => {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43758.5453) * 43758.5453;
  return n - Math.floor(n);
};

const getTerrainType = (x: number, y: number, seed: number, mapSize: number) => {
  const elevation = noise(x * 0.1, y * 0.1, seed);
  const moisture = noise(x * 0.05 + 100, y * 0.05 + 100, seed);
  const temperature = 1 - Math.abs(y) / mapSize;
  const isBorder = Math.abs(x) > mapSize * 2.5 || Math.abs(y) > mapSize * 0.7;

  if (isBorder && elevation > 0.5) return 'mountain';
  if (elevation > 0.7) return temperature > 0.3 ? 'mountain' : 'snow';
  if (moisture > 0.6) return elevation > 0.3 ? 'swamp' : 'water';
  if (temperature < 0.2) return 'snow';
  if (temperature > 0.8 && moisture < 0.3) return 'desert';
  if (elevation > 0.4) return 'forest';
  return 'grass';
};

const isWalkable = (x: number, y: number, seed: number, mapSize: number) => {
  const t = getTerrainType(x, y, seed, mapSize);
  return TERRAIN_CONFIGS[t]?.walkable ?? false;
};

// Criar tabelas
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('gm', 'player'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
    map_seed INTEGER NOT NULL,
    map_size INTEGER NOT NULL DEFAULT 5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Migração para adicionar map_size se não existir
  db.run(`ALTER TABLE campaigns ADD COLUMN map_size INTEGER DEFAULT 5`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });

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
    current_pv INTEGER,
    current_pc INTEGER,
    current_pe INTEGER,
    currency INTEGER DEFAULT 300,
    campaign_id INTEGER,
    color TEXT,
    location_x INTEGER,
    location_y INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS enemies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    forca INTEGER DEFAULT 0,
    destreza INTEGER DEFAULT 0,
    constituicao INTEGER DEFAULT 0,
    inteligencia INTEGER DEFAULT 0,
    sabedoria INTEGER DEFAULT 0,
    carisma INTEGER DEFAULT 0,
    current_pv INTEGER,
    current_pc INTEGER,
    current_pe INTEGER,
    weapon_name TEXT,
    weapon_attr TEXT,
    weapon_bonus INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    bonus_attr TEXT,
    bonus_value INTEGER,
    price INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS character_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER,
    item_id INTEGER,
    equipped_slot TEXT,
    quantity INTEGER DEFAULT 1,
    FOREIGN KEY (character_id) REFERENCES characters (id),
    FOREIGN KEY (item_id) REFERENCES items (id)
  )`);

  // Adicionar colunas se não existirem (para migração)
  db.run(`ALTER TABLE characters ADD COLUMN forca INTEGER DEFAULT 0`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN destreza INTEGER DEFAULT 0`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN constituicao INTEGER DEFAULT 0`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN inteligencia INTEGER DEFAULT 0`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN sabedoria INTEGER DEFAULT 0`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN carisma INTEGER DEFAULT 0`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN pontos_disponiveis INTEGER DEFAULT 70`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN xp INTEGER DEFAULT 0`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN weapon_name TEXT`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN weapon_attr TEXT`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN weapon_bonus INTEGER DEFAULT 0`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN current_pv INTEGER`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN current_pe INTEGER`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN currency INTEGER DEFAULT 300`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN current_pc INTEGER`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });

  // Migrações para enemies
  db.run(`ALTER TABLE enemies ADD COLUMN current_pc INTEGER`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });

  // Adicionar location
  db.run(`ALTER TABLE characters ADD COLUMN location_x INTEGER`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });
  db.run(`ALTER TABLE characters ADD COLUMN location_y INTEGER`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });

  // Adicionar color se não existir
  db.run(`ALTER TABLE characters ADD COLUMN color TEXT`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });

  // Adicionar campaign_id
  db.run(`ALTER TABLE characters ADD COLUMN campaign_id INTEGER REFERENCES campaigns(id)`, (err: Error | null) => { if (err && !err.message.includes('duplicate column')) console.error(err); });

  // Inserir items padrão se não existirem
  db.run(`INSERT OR IGNORE INTO items (id, name, type, bonus_attr, bonus_value, price) VALUES
    (1, 'Espada de Ferro', 'weapon', 'forca', 5, 100),
    (2, 'Escudo de Madeira', 'shield', 'constituicao', 3, 50),
    (3, 'Armadura de Couro', 'armor', 'constituicao', 4, 150),
    (4, 'Botas de Couro', 'boots', 'destreza', 2, 75),
    (5, 'Poção de Cura', 'consumable', null, 50, 25)`);

  // Inserir inimigos padrão se não existirem
  db.run(`INSERT OR IGNORE INTO enemies (id, name, level, forca, destreza, constituicao, inteligencia, sabedoria, carisma, weapon_name, weapon_attr, weapon_bonus, current_pv, current_pe, current_pc) VALUES
    (1, 'Goblin', 1, 2, 3, 2, 1, 1, 1, 'Clava', 'forca', 1, 500, 165, 500),
    (2, 'Orc', 2, 4, 2, 4, 1, 2, 1, 'Machado', 'forca', 2, 1000, 330, 1000),
    (3, 'Troll', 3, 5, 1, 6, 1, 1, 1, 'Porrete', 'forca', 3, 1500, 495, 1500),
    (4, 'Lobo', 1, 3, 4, 3, 1, 2, 1, 'Presas', 'destreza', 1, 750, 165, 750),
    (5, 'Dragão Jovem', 5, 7, 5, 8, 4, 4, 3, 'Sopro de Fogo', 'inteligencia', 4, 2000, 825, 2000),
    (6, 'Esqueleto', 2, 3, 3, 2, 1, 1, 1, 'Espada Enferrujada', 'forca', 1, 500, 165, 500),
    (7, 'Vampiro', 4, 5, 6, 5, 3, 3, 7, 'Presas Vampíricas', 'carisma', 3, 1250, 660, 1250),
    (8, 'Gigante', 6, 8, 3, 9, 2, 2, 2, 'Clava Gigante', 'forca', 5, 2250, 990, 2250),
    (9, 'Mago Negro', 4, 2, 2, 3, 8, 7, 5, 'Cajado Mágico', 'inteligencia', 4, 750, 1320, 750),
    (10, 'Cavaleiro Sombrio', 5, 6, 5, 6, 3, 4, 4, 'Espada Negra', 'forca', 3, 1500, 825, 1500),
    (11, 'Serpente', 1, 2, 5, 2, 1, 1, 1, 'Veneno', 'destreza', 2, 500, 99, 500),
    (12, 'Minotauro', 4, 6, 3, 7, 1, 2, 2, 'Machado Duplo', 'forca', 4, 1750, 330, 1750),
    (13, 'Arcanjo Caído', 7, 7, 6, 8, 5, 6, 8, 'Espada Flamejante', 'carisma', 5, 2000, 1584, 2000),
    (14, 'Golem de Pedra', 5, 8, 1, 10, 1, 1, 1, 'Punhos de Pedra', 'forca', 3, 2500, 99, 2500),
    (15, 'Fada das Sombras', 3, 1, 4, 2, 6, 5, 7, 'Magia das Sombras', 'inteligencia', 3, 500, 924, 500),
    (16, 'Ciclope', 6, 9, 2, 8, 1, 1, 1, 'Clava de Osso', 'forca', 4, 2000, 99, 2000),
    (17, 'Elemental do Fogo', 4, 5, 4, 6, 3, 3, 2, 'Chamas Eternas', 'constituicao', 4, 1500, 528, 1500),
    (18, 'Necromante', 5, 2, 3, 3, 9, 8, 4, 'Livro dos Mortos', 'inteligencia', 5, 750, 1386, 750),
    (19, 'Leviatã', 8, 10, 4, 12, 3, 4, 3, 'Cauda Poderosa', 'forca', 6, 3000, 660, 3000),
    (20, 'Anjo Guardião', 6, 6, 7, 7, 5, 8, 9, 'Lâmina Sagrada', 'sabedoria', 5, 1750, 1584, 1750)`);
});

// Rotas para usuários
app.get('/users', (req: Request, res: Response) => {
  db.all('SELECT * FROM users', [], (err: Error | null, rows: any[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ users: rows });
  });

  // Histórico de movimentação
  db.run(`CREATE TABLE IF NOT EXISTS movement_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER,
    from_x INTEGER,
    from_y INTEGER,
    to_x INTEGER,
    to_y INTEGER,
    events TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (character_id) REFERENCES characters(id)
  )`);
});

app.post('/users', (req: Request, res: Response) => {
  const { name, role } = req.body;
  db.run('INSERT INTO users (name, role) VALUES (?, ?)', [name, role], function(err: Error | null) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

// Rotas para campanhas
app.get('/campaigns', (req: Request, res: Response) => {
  db.all('SELECT * FROM campaigns ORDER BY created_at DESC', [], (err: Error | null, rows: any[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ campaigns: rows });
  });
});

app.get('/campaigns/active', (req: Request, res: Response) => {
  db.get('SELECT * FROM campaigns WHERE status = ? ORDER BY created_at DESC LIMIT 1', ['active'], (err: Error | null, row: any) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ campaign: row || null });
  });
});

app.post('/campaigns', (req: Request, res: Response) => {
  const { name, map_size } = req.body;
  const map_seed = Math.floor(Math.random() * 1000000);
  db.run('INSERT INTO campaigns (name, status, map_seed, map_size, created_at, updated_at) VALUES (?, ?, ?, ?, datetime("now"), datetime("now"))', [name, 'active', map_seed, map_size || 5], function(err: Error | null) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, map_seed, map_size: map_size || 5 });
  });
});

app.put('/campaigns/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  db.run('UPDATE campaigns SET status = ?, updated_at = datetime("now") WHERE id = ?', [status, id], function(err: Error | null) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Rotas para personagens
app.get('/characters', (req: Request, res: Response) => {
  db.all('SELECT * FROM characters', [], (err: Error | null, rows: any[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ characters: rows });
  });
});

app.post('/characters', (req: Request, res: Response) => {
  const { name, race, level, user_id, forca, destreza, constituicao, inteligencia, sabedoria, carisma, pontos_disponiveis, xp, weapon_name, weapon_attr, weapon_bonus, color, location_x, location_y, campaign_id } = req.body;
  const max_pv = Math.min(5000, (constituicao + (weapon_attr === 'constituicao' ? weapon_bonus : 0)) * 250);
  const max_pe = Math.min(2000, ((inteligencia + sabedoria + carisma + (['inteligencia', 'sabedoria', 'carisma'].includes(weapon_attr) ? weapon_bonus : 0)) * 33));
  const max_pc = Math.min(5000, (constituicao + (weapon_attr === 'constituicao' ? weapon_bonus : 0)) * 250);
  db.run('INSERT INTO characters (name, race, level, user_id, forca, destreza, constituicao, inteligencia, sabedoria, carisma, pontos_disponiveis, xp, weapon_name, weapon_attr, weapon_bonus, color, current_pv, current_pe, current_pc, currency, location_x, location_y, campaign_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [name, race, level || 1, user_id, forca || 0, destreza || 0, constituicao || 0, inteligencia || 0, sabedoria || 0, carisma || 0, pontos_disponiveis || 70, xp || 0, weapon_name || '', weapon_attr || '', weapon_bonus || 0, color || null, max_pv, max_pe, max_pc, 300, location_x, location_y, campaign_id], function(err: Error | null) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

app.put('/characters/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, race, level, forca, destreza, constituicao, inteligencia, sabedoria, carisma, pontos_disponiveis, xp, weapon_name, weapon_attr, weapon_bonus, color, current_pv, current_pe, current_pc, location_x, location_y, campaign_id } = req.body;
  db.run('UPDATE characters SET name = ?, race = ?, level = ?, forca = ?, destreza = ?, constituicao = ?, inteligencia = ?, sabedoria = ?, carisma = ?, pontos_disponiveis = ?, xp = ?, weapon_name = ?, weapon_attr = ?, weapon_bonus = ?, color = ?, current_pv = ?, current_pe = ?, current_pc = ?, currency = ?, location_x = ?, location_y = ?, campaign_id = ? WHERE id = ?', [name, race, level, forca, destreza, constituicao, inteligencia, sabedoria, carisma, pontos_disponiveis, xp, weapon_name, weapon_attr, weapon_bonus, color || null, current_pv, current_pe, current_pc, req.body.currency || 300, location_x, location_y, campaign_id, id], function(err: Error | null) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

app.put('/characters/:id/levelup', (req: Request, res: Response) => {
  const { id } = req.params;
  const MAX_LEVEL = 20;
  const LEVEL_UP_PERCENTAGE = 0.1; // 10% increase per level
  db.get('SELECT level, xp, forca, destreza, constituicao, inteligencia, sabedoria, carisma, pontos_disponiveis FROM characters WHERE id = ?', [id], (err: Error | null, row: any) => {
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
    db.run('UPDATE characters SET level = ?, forca = ?, destreza = ?, constituicao = ?, inteligencia = ?, sabedoria = ?, carisma = ?, pontos_disponiveis = ? WHERE id = ?', [newLevel, newForca, newDestreza, newConstituicao, newInteligencia, newSabedoria, newCarisma, newPontos, id], function(err: Error | null) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ newLevel, newForca, newDestreza, newConstituicao, newInteligencia, newSabedoria, newCarisma, newPontos });
    });
  });
});

app.put('/characters/:id/addxp', (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    res.status(400).json({ error: 'Quantidade de XP inválida' });
    return;
  }
  db.get('SELECT xp FROM characters WHERE id = ?', [id], (err: Error | null, row: any) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Personagem não encontrado' });
      return;
    }
    const newXp = row.xp + amount;
    db.run('UPDATE characters SET xp = ? WHERE id = ?', [newXp, id], function(err: Error | null) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ newXp });
    });
  });
});

app.delete('/characters/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.run('DELETE FROM characters WHERE id = ?', [id], function(err: Error | null) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Movimento por passo: body { dx, dy } onde dx/dy ∈ {-1,0,1}
app.post('/characters/:id/step', (req: Request, res: Response) => {
  const { id } = req.params;
  const { dx, dy } = req.body;
  if (typeof dx !== 'number' || typeof dy !== 'number') {
    res.status(400).json({ error: 'dx/dy inválidos' });
    return;
  }

  db.get('SELECT * FROM characters WHERE id = ?', [id], (err: Error | null, char: any) => {
    if (err) { res.status(500).json({ error: err.message }); return; }
    if (!char) { res.status(404).json({ error: 'Personagem não encontrado' }); return; }

    const campaignId = char.campaign_id;
    if (!campaignId) { res.status(400).json({ error: 'Personagem não vinculado a uma campanha' }); return; }

    db.get('SELECT * FROM campaigns WHERE id = ?', [campaignId], (err: Error | null, camp: any) => {
      if (err) { res.status(500).json({ error: err.message }); return; }
      if (!camp) { res.status(404).json({ error: 'Campanha não encontrada' }); return; }

      const fromX = char.location_x ?? 0;
      const fromY = char.location_y ?? 0;
      const toX = fromX + dx;
      const toY = fromY + dy;

      // validar bounds e terreno
      if (!isWalkable(toX, toY, camp.map_seed, camp.map_size)) {
        res.status(422).json({ error: 'Terreno intransitável' });
        return;
      }

      // verificar ocupação
      db.get('SELECT id FROM characters WHERE location_x = ? AND location_y = ? AND campaign_id = ?', [toX, toY, campaignId], (err: Error | null, occ: any) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        if (occ) { res.status(409).json({ error: 'Célula ocupada' }); return; }

        // atualizar posição
        db.run('UPDATE characters SET location_x = ?, location_y = ? WHERE id = ?', [toX, toY, id], function(err: Error | null) {
          if (err) { res.status(500).json({ error: err.message }); return; }

          // persistir no histórico (events podem ser preenchidos pelo GM manualmente depois)
          const events = JSON.stringify([]);
          db.run('INSERT INTO movement_history (character_id, from_x, from_y, to_x, to_y, events) VALUES (?, ?, ?, ?, ?, ?)', [id, fromX, fromY, toX, toY, events], function(err: Error | null) {
            if (err) console.error('Erro ao inserir movement_history:', err.message);
            res.json({ success: true, from: { x: fromX, y: fromY }, to: { x: toX, y: toY }, events: [] });
          });
        });
      });
    });
  });
});

// Teleport (body { to: { x, y } }) - não permite teleporte para célula ocupada
app.post('/characters/:id/teleport', (req: Request, res: Response) => {
  const { id } = req.params;
  const to = req.body.to;
  if (!to || typeof to.x !== 'number' || typeof to.y !== 'number') { res.status(400).json({ error: 'Destino inválido' }); return; }

  db.get('SELECT * FROM characters WHERE id = ?', [id], (err: Error | null, char: any) => {
    if (err) { res.status(500).json({ error: err.message }); return; }
    if (!char) { res.status(404).json({ error: 'Personagem não encontrado' }); return; }

    const campaignId = char.campaign_id;
    if (!campaignId) { res.status(400).json({ error: 'Personagem não vinculado a uma campanha' }); return; }

    db.get('SELECT * FROM campaigns WHERE id = ?', [campaignId], (err: Error | null, camp: any) => {
      if (err) { res.status(500).json({ error: err.message }); return; }
      if (!camp) { res.status(404).json({ error: 'Campanha não encontrada' }); return; }

      const toX = to.x;
      const toY = to.y;

      // validar bounds e terreno
      if (!isWalkable(toX, toY, camp.map_seed, camp.map_size)) {
        res.status(422).json({ error: 'Terreno intransitável' });
        return;
      }

      // verificar ocupação
      db.get('SELECT id FROM characters WHERE location_x = ? AND location_y = ? AND campaign_id = ?', [toX, toY, campaignId], (err: Error | null, occ: any) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        if (occ) { res.status(409).json({ error: 'Célula ocupada' }); return; }

        const fromX = char.location_x ?? 0;
        const fromY = char.location_y ?? 0;

        db.run('UPDATE characters SET location_x = ?, location_y = ? WHERE id = ?', [toX, toY, id], function(err: Error | null) {
          if (err) { res.status(500).json({ error: err.message }); return; }
          const events = JSON.stringify([]);
          db.run('INSERT INTO movement_history (character_id, from_x, from_y, to_x, to_y, events) VALUES (?, ?, ?, ?, ?, ?)', [id, fromX, fromY, toX, toY, events], function(err: Error | null) {
            if (err) console.error('Erro ao inserir movement_history:', err.message);
            res.json({ success: true, from: { x: fromX, y: fromY }, to: { x: toX, y: toY }, events: [] });
          });
        });
      });
    });
  });
});

// Rotas para items
app.get('/items', (req: Request, res: Response) => {
  db.all('SELECT * FROM items', [], (err: Error | null, rows: any[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ items: rows });
  });
});

app.post('/items', (req: Request, res: Response) => {
  const { name, type, bonus_attr, bonus_value, price } = req.body;
  db.run('INSERT INTO items (name, type, bonus_attr, bonus_value, price) VALUES (?, ?, ?, ?, ?)', [name, type, bonus_attr, bonus_value, price], function(err: Error | null) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

// Rotas para inventário
app.get('/characters/:id/items', (req: Request, res: Response) => {
  const { id } = req.params;
  db.all('SELECT ci.*, i.name, i.type, i.bonus_attr, i.bonus_value FROM character_items ci JOIN items i ON ci.item_id = i.id WHERE ci.character_id = ?', [id], (err: Error | null, rows: any[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ items: rows });
  });
});

app.post('/characters/:id/items', (req: Request, res: Response) => {
  const { id } = req.params;
  const { item_id, quantity } = req.body;
  db.run('INSERT INTO character_items (character_id, item_id, quantity) VALUES (?, ?, ?)', [id, item_id, quantity || 1], function(err: Error | null) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

app.put('/characters/:id/items/:itemId/equip', (req: Request, res: Response) => {
  const { id, itemId } = req.params;
  const { slot } = req.body;
  // Primeiro, desequipar qualquer item no slot
  db.run('UPDATE character_items SET equipped_slot = NULL WHERE character_id = ? AND equipped_slot = ?', [id, slot], function(err: Error | null) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Agora equipar o item
    db.run('UPDATE character_items SET equipped_slot = ? WHERE character_id = ? AND id = ?', [slot, id, itemId], function(err: Error | null) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    });
  });
});

app.put('/characters/:id/items/:itemId/unequip', (req: Request, res: Response) => {
  const { id, itemId } = req.params;
  db.run('UPDATE character_items SET equipped_slot = NULL WHERE character_id = ? AND id = ?', [id, itemId], function(err: Error | null) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Rotas para inimigos
app.get('/enemies', (req: Request, res: Response) => {
  db.all('SELECT * FROM enemies', [], (err: Error | null, rows: any[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ enemies: rows });
  });
});

app.post('/enemies', (req: Request, res: Response) => {
  const { name, level, forca, destreza, constituicao, inteligencia, sabedoria, carisma, weapon_name, weapon_attr, weapon_bonus } = req.body;
  const max_pv = Math.min(5000, constituicao * 250);
  const max_pe = Math.min(2000, (inteligencia + sabedoria + carisma) * 33);
  const max_pc = Math.min(5000, constituicao * 250);
  db.run('INSERT INTO enemies (name, level, forca, destreza, constituicao, inteligencia, sabedoria, carisma, weapon_name, weapon_attr, weapon_bonus, current_pv, current_pe, current_pc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [name, level || 1, forca || 0, destreza || 0, constituicao || 0, inteligencia || 0, sabedoria || 0, carisma || 0, weapon_name || '', weapon_attr || '', weapon_bonus || 0, max_pv, max_pe, max_pc], function(err: Error | null) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

app.put('/enemies/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, level, forca, destreza, constituicao, inteligencia, sabedoria, carisma, weapon_name, weapon_attr, weapon_bonus, current_pv, current_pe, current_pc } = req.body;
  db.run('UPDATE enemies SET name = ?, level = ?, forca = ?, destreza = ?, constituicao = ?, inteligencia = ?, sabedoria = ?, carisma = ?, weapon_name = ?, weapon_attr = ?, weapon_bonus = ?, current_pv = ?, current_pe = ?, current_pc = ? WHERE id = ?', [name, level, forca, destreza, constituicao, inteligencia, sabedoria, carisma, weapon_name, weapon_attr, weapon_bonus, current_pv, current_pe, current_pc, id], function(err: Error | null) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

app.delete('/enemies/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.run('DELETE FROM enemies WHERE id = ?', [id], function(err: Error | null) {
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