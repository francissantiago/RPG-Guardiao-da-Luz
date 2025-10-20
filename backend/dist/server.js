"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Conectar ao banco SQLite
const db = new sqlite3_1.default.Database('./rpg.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco:', err.message);
    }
    else {
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
    current_pv INTEGER,
    current_pc INTEGER,
    current_pe INTEGER,
    currency INTEGER DEFAULT 300,
    FOREIGN KEY (user_id) REFERENCES users (id)
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
    db.run(`ALTER TABLE characters ADD COLUMN forca INTEGER DEFAULT 0`, (err) => { if (err && !err.message.includes('duplicate column'))
        console.error(err); });
    db.run(`ALTER TABLE characters ADD COLUMN destreza INTEGER DEFAULT 0`, (err) => { if (err && !err.message.includes('duplicate column'))
        console.error(err); });
    db.run(`ALTER TABLE characters ADD COLUMN constituicao INTEGER DEFAULT 0`, (err) => { if (err && !err.message.includes('duplicate column'))
        console.error(err); });
    db.run(`ALTER TABLE characters ADD COLUMN inteligencia INTEGER DEFAULT 0`, (err) => { if (err && !err.message.includes('duplicate column'))
        console.error(err); });
    db.run(`ALTER TABLE characters ADD COLUMN sabedoria INTEGER DEFAULT 0`, (err) => { if (err && !err.message.includes('duplicate column'))
        console.error(err); });
    db.run(`ALTER TABLE characters ADD COLUMN carisma INTEGER DEFAULT 0`, (err) => { if (err && !err.message.includes('duplicate column'))
        console.error(err); });
    db.run(`ALTER TABLE characters ADD COLUMN pontos_disponiveis INTEGER DEFAULT 70`, (err) => { if (err && !err.message.includes('duplicate column'))
        console.error(err); });
    db.run(`ALTER TABLE characters ADD COLUMN xp INTEGER DEFAULT 0`, (err) => { if (err && !err.message.includes('duplicate column'))
        console.error(err); });
    db.run(`ALTER TABLE characters ADD COLUMN weapon_name TEXT`, (err) => { if (err && !err.message.includes('duplicate column'))
        console.error(err); });
    db.run(`ALTER TABLE characters ADD COLUMN weapon_attr TEXT`, (err) => { if (err && !err.message.includes('duplicate column'))
        console.error(err); });
    db.run(`ALTER TABLE characters ADD COLUMN weapon_bonus INTEGER DEFAULT 0`, (err) => { if (err && !err.message.includes('duplicate column'))
        console.error(err); });
    db.run(`ALTER TABLE characters ADD COLUMN current_pv INTEGER`, (err) => { if (err && !err.message.includes('duplicate column'))
        console.error(err); });
    db.run(`ALTER TABLE characters ADD COLUMN current_pe INTEGER`, (err) => { if (err && !err.message.includes('duplicate column'))
        console.error(err); });
    db.run(`ALTER TABLE characters ADD COLUMN currency INTEGER DEFAULT 300`, (err) => { if (err && !err.message.includes('duplicate column'))
        console.error(err); });
    db.run(`ALTER TABLE characters ADD COLUMN current_pc INTEGER`, (err) => { if (err && !err.message.includes('duplicate column'))
        console.error(err); });
    // Migrações para enemies
    db.run(`ALTER TABLE enemies ADD COLUMN current_pc INTEGER`, (err) => { if (err && !err.message.includes('duplicate column'))
        console.error(err); });
    // Adicionar location
    db.run(`ALTER TABLE characters ADD COLUMN location_x INTEGER`, (err) => { if (err && !err.message.includes('duplicate column'))
        console.error(err); });
    db.run(`ALTER TABLE characters ADD COLUMN location_y INTEGER`, (err) => { if (err && !err.message.includes('duplicate column'))
        console.error(err); });
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
    db.run('INSERT INTO users (name, role) VALUES (?, ?)', [name, role], function (err) {
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
    const { name, race, level, user_id, forca, destreza, constituicao, inteligencia, sabedoria, carisma, pontos_disponiveis, xp, weapon_name, weapon_attr, weapon_bonus, location_x, location_y } = req.body;
    const max_pv = Math.min(5000, (constituicao + (weapon_attr === 'constituicao' ? weapon_bonus : 0)) * 250);
    const max_pe = Math.min(2000, ((inteligencia + sabedoria + carisma + (['inteligencia', 'sabedoria', 'carisma'].includes(weapon_attr) ? weapon_bonus : 0)) * 33));
    const max_pc = Math.min(5000, (constituicao + (weapon_attr === 'constituicao' ? weapon_bonus : 0)) * 250);
    db.run('INSERT INTO characters (name, race, level, user_id, forca, destreza, constituicao, inteligencia, sabedoria, carisma, pontos_disponiveis, xp, weapon_name, weapon_attr, weapon_bonus, current_pv, current_pe, current_pc, currency, location_x, location_y) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [name, race, level || 1, user_id, forca || 0, destreza || 0, constituicao || 0, inteligencia || 0, sabedoria || 0, carisma || 0, pontos_disponiveis || 70, xp || 0, weapon_name || '', weapon_attr || '', weapon_bonus || 0, max_pv, max_pe, max_pc, 300, location_x, location_y], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});
app.put('/characters/:id', (req, res) => {
    const { id } = req.params;
    const { name, race, level, forca, destreza, constituicao, inteligencia, sabedoria, carisma, pontos_disponiveis, xp, weapon_name, weapon_attr, weapon_bonus, current_pv, current_pe, current_pc, location_x, location_y } = req.body;
    db.run('UPDATE characters SET name = ?, race = ?, level = ?, forca = ?, destreza = ?, constituicao = ?, inteligencia = ?, sabedoria = ?, carisma = ?, pontos_disponiveis = ?, xp = ?, weapon_name = ?, weapon_attr = ?, weapon_bonus = ?, current_pv = ?, current_pe = ?, current_pc = ?, currency = ?, location_x = ?, location_y = ? WHERE id = ?', [name, race, level, forca, destreza, constituicao, inteligencia, sabedoria, carisma, pontos_disponiveis, xp, weapon_name, weapon_attr, weapon_bonus, current_pv, current_pe, current_pc, req.body.currency || 300, location_x, location_y, id], function (err) {
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
        db.run('UPDATE characters SET level = ?, forca = ?, destreza = ?, constituicao = ?, inteligencia = ?, sabedoria = ?, carisma = ?, pontos_disponiveis = ? WHERE id = ?', [newLevel, newForca, newDestreza, newConstituicao, newInteligencia, newSabedoria, newCarisma, newPontos, id], function (err) {
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
        db.run('UPDATE characters SET xp = ? WHERE id = ?', [newXp, id], function (err) {
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
    db.run('DELETE FROM characters WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ changes: this.changes });
    });
});
// Rotas para items
app.get('/items', (req, res) => {
    db.all('SELECT * FROM items', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ items: rows });
    });
});
app.post('/items', (req, res) => {
    const { name, type, bonus_attr, bonus_value, price } = req.body;
    db.run('INSERT INTO items (name, type, bonus_attr, bonus_value, price) VALUES (?, ?, ?, ?, ?)', [name, type, bonus_attr, bonus_value, price], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});
// Rotas para inventário
app.get('/characters/:id/items', (req, res) => {
    const { id } = req.params;
    db.all('SELECT ci.*, i.name, i.type, i.bonus_attr, i.bonus_value FROM character_items ci JOIN items i ON ci.item_id = i.id WHERE ci.character_id = ?', [id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ items: rows });
    });
});
app.post('/characters/:id/items', (req, res) => {
    const { id } = req.params;
    const { item_id, quantity } = req.body;
    db.run('INSERT INTO character_items (character_id, item_id, quantity) VALUES (?, ?, ?)', [id, item_id, quantity || 1], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});
app.put('/characters/:id/items/:itemId/equip', (req, res) => {
    const { id, itemId } = req.params;
    const { slot } = req.body;
    // Primeiro, desequipar qualquer item no slot
    db.run('UPDATE character_items SET equipped_slot = NULL WHERE character_id = ? AND equipped_slot = ?', [id, slot], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Agora equipar o item
        db.run('UPDATE character_items SET equipped_slot = ? WHERE character_id = ? AND id = ?', [slot, id, itemId], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ changes: this.changes });
        });
    });
});
app.put('/characters/:id/items/:itemId/unequip', (req, res) => {
    const { id, itemId } = req.params;
    db.run('UPDATE character_items SET equipped_slot = NULL WHERE character_id = ? AND id = ?', [id, itemId], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ changes: this.changes });
    });
});
// Rotas para inimigos
app.get('/enemies', (req, res) => {
    db.all('SELECT * FROM enemies', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ enemies: rows });
    });
});
app.post('/enemies', (req, res) => {
    const { name, level, forca, destreza, constituicao, inteligencia, sabedoria, carisma, weapon_name, weapon_attr, weapon_bonus } = req.body;
    const max_pv = Math.min(5000, constituicao * 250);
    const max_pe = Math.min(2000, (inteligencia + sabedoria + carisma) * 33);
    const max_pc = Math.min(5000, constituicao * 250);
    db.run('INSERT INTO enemies (name, level, forca, destreza, constituicao, inteligencia, sabedoria, carisma, weapon_name, weapon_attr, weapon_bonus, current_pv, current_pe, current_pc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [name, level || 1, forca || 0, destreza || 0, constituicao || 0, inteligencia || 0, sabedoria || 0, carisma || 0, weapon_name || '', weapon_attr || '', weapon_bonus || 0, max_pv, max_pe, max_pc], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});
app.put('/enemies/:id', (req, res) => {
    const { id } = req.params;
    const { name, level, forca, destreza, constituicao, inteligencia, sabedoria, carisma, weapon_name, weapon_attr, weapon_bonus, current_pv, current_pe, current_pc } = req.body;
    db.run('UPDATE enemies SET name = ?, level = ?, forca = ?, destreza = ?, constituicao = ?, inteligencia = ?, sabedoria = ?, carisma = ?, weapon_name = ?, weapon_attr = ?, weapon_bonus = ?, current_pv = ?, current_pe = ?, current_pc = ? WHERE id = ?', [name, level, forca, destreza, constituicao, inteligencia, sabedoria, carisma, weapon_name, weapon_attr, weapon_bonus, current_pv, current_pe, current_pc, id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ changes: this.changes });
    });
});
app.delete('/enemies/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM enemies WHERE id = ?', [id], function (err) {
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
