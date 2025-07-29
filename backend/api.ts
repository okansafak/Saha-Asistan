// (boş satır)
import express from 'express';
import { Client } from 'pg';
import bcrypt from 'bcryptjs';

export function createApiRouter(client: Client) {
  const router = express.Router();

  // Kullanıcı ekle
  router.post('/users', async (req, res) => {
    const { display_name, unit_id, username, password, role } = req.body;
    if (!display_name || !unit_id || !username || !password || !role) {
      return res.status(400).json({ error: 'display_name, unit_id, username, password ve role zorunludur' });
    }
    try {
      // unit_id'nin geçerli olup olmadığını kontrol et
      const unitRes = await client.query('SELECT id FROM units WHERE id = $1', [unit_id]);
      if (unitRes.rows.length === 0) {
        return res.status(400).json({ error: `Geçerli bir birim bulunamadı: '${unit_id}'` });
      }
      // Aynı isim ve birimde kullanıcı var mı kontrolü
      const exists = await client.query('SELECT id FROM users WHERE LOWER(display_name) = LOWER($1) AND unit_id = $2', [display_name, unit_id]);
      if (exists.rows.length > 0) {
        return res.status(409).json({ error: 'Bu birimde aynı isimde kullanıcı zaten var' });
      }
      // Duplicate check for username
      const existingUsername = await client.query('SELECT * FROM users WHERE username = $1', [username]);
      if (existingUsername.rows.length > 0) {
        return res.status(409).json({ error: 'Bu kullanıcı adı zaten kullanılıyor' });
      }
      // Hash password
      const bcrypt = require('bcryptjs');
      const password_hash = await bcrypt.hash(password, 10);
      const result = await client.query(
        'INSERT INTO users (display_name, unit_id, username, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [display_name, unit_id, username, password_hash, role]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: 'Kullanıcı eklenemedi', details: msg });
    }
  });

  // Login (bcrypt hash kontrolü)
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await client.query('SELECT id, username, display_name, role, unit_id, password_hash FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      console.log('[LOGIN] Kullanıcı bulunamadı:', username);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    console.log('[LOGIN] Username:', username);
    console.log('[LOGIN] DB Hash:', user.password_hash);
    console.log('[LOGIN] Gelen Şifre:', password);
    const match = await bcrypt.compare(password, user.password_hash);
    console.log('[LOGIN] Bcrypt Karşılaştırma Sonucu:', match);
    if (match) {
      const { password_hash, ...userData } = user;
      res.json({ success: true, user: userData });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  });

  // Kullanıcılar
  router.get('/users', async (req, res) => {
    const result = await client.query('SELECT id, username, display_name, role, unit_id FROM users');
    res.json(result.rows);
  });

  // Birimler
  router.get('/units', async (req, res) => {
    const result = await client.query('SELECT * FROM units');
    res.json(result.rows);
  });

  // Birim ekle
  router.post('/units', async (req, res) => {
    const { name, parentId } = req.body;
    if (!name) return res.status(400).json({ error: 'Birim adı zorunlu' });
    try {
      // Aynı isimde birim var mı kontrolü
      const exists = await client.query('SELECT id FROM units WHERE LOWER(name) = LOWER($1)', [name]);
      if (exists.rows.length > 0) {
        return res.status(409).json({ error: 'Bu isimde bir birim zaten var' });
      }
      const result = await client.query(
        'INSERT INTO units (name, parent_id) VALUES ($1, $2) RETURNING *',
        [name, parentId || null]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: 'Birim eklenemedi', details: msg });
    }
  });

  // Formlar
  router.get('/forms', async (req, res) => {
    const result = await client.query('SELECT * FROM forms');
    res.json(result.rows);
  });

  // İşler
  router.get('/jobs', async (req, res) => {
    const result = await client.query('SELECT * FROM jobs');
    res.json(result.rows);
  });

  // İş geçmişi
  router.get('/job-history/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const result = await client.query('SELECT * FROM job_history WHERE job_id = $1', [jobId]);
    res.json(result.rows);
  });

  return router;
}
