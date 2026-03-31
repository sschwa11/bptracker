import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

async function initDb() {
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  await pool.query(schema);
  console.log('Database schema initialized');
}

app.get('/api/users', async (req, res) => {
  try {
    const usersResult = await pool.query('SELECT id, name FROM users ORDER BY id');
    const users = [];

    for (const row of usersResult.rows) {
      const bpResult = await pool.query(
        'SELECT blueprint_id, status FROM user_blueprints WHERE user_id = $1',
        [row.id]
      );
      const blueprints = {};
      for (const bp of bpResult.rows) {
        blueprints[bp.blueprint_id] = bp.status;
      }
      users.push({ name: row.name, blueprints });
    }

    res.json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    await pool.query('INSERT INTO users (name) VALUES ($1)', [name.trim()]);
    res.json({ success: true });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'User already exists' });
    }
    console.error('Error adding user:', err);
    res.status(500).json({ error: 'Failed to add user' });
  }
});

app.delete('/api/users/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE name = $1', [name]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error removing user:', err);
    res.status(500).json({ error: 'Failed to remove user' });
  }
});

app.post('/api/blueprints', async (req, res) => {
  const { name, blueprintId, status } = req.body;
  try {
    const userResult = await pool.query('SELECT id FROM users WHERE name = $1', [name]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = userResult.rows[0].id;

    if (status === 'owned') {
      await pool.query(
        `INSERT INTO user_blueprints (user_id, blueprint_id, status) VALUES ($1, $2, $3)
         ON CONFLICT (user_id, blueprint_id) DO UPDATE SET status = $3`,
        [userId, blueprintId, status]
      );
    } else {
      await pool.query(
        'DELETE FROM user_blueprints WHERE user_id = $1 AND blueprint_id = $2',
        [userId, blueprintId]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating blueprint:', err);
    res.status(500).json({ error: 'Failed to update blueprint' });
  }
});

app.post('/api/blueprints/all', async (req, res) => {
  const { name, status } = req.body;
  try {
    const userResult = await pool.query('SELECT id FROM users WHERE name = $1', [name]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = userResult.rows[0].id;

    if (!status) {
      await pool.query('DELETE FROM user_blueprints WHERE user_id = $1', [userId]);
    } else {
      const blueprintsJson = readFileSync(
        join(__dirname, '..', 'src', 'data', 'blueprints.json'), 'utf-8'
      );
      const blueprints = JSON.parse(blueprintsJson).filter(bp => !bp.isBlank);

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('DELETE FROM user_blueprints WHERE user_id = $1', [userId]);
        for (const bp of blueprints) {
          await client.query(
            'INSERT INTO user_blueprints (user_id, blueprint_id, status) VALUES ($1, $2, $3)',
            [userId, bp.id, status]
          );
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error bulk updating:', err);
    res.status(500).json({ error: 'Failed to bulk update' });
  }
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`BPTracker API running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
