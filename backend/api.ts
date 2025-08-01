  // Form sil
import express from 'express';
import { Client } from 'pg';
import bcrypt from 'bcryptjs';

export function createApiRouter(client: Client) {
  const router = express.Router();

  // İş ekle
  router.post('/jobs', async (req, res) => {
    const { title, description, formId, formTitle, assignedTo, assignedBy, unitId, address, location, priority, jobType, status, formData } = req.body;
    if (!title || !formId || !assignedTo || !unitId) {
      return res.status(400).json({ error: 'Başlık, form, atanan kişi ve birim zorunlu.' });
    }
    try {
      const result = await client.query(
        `INSERT INTO jobs (title, description, form_id, form_title, assigned_to, assigned_by, unit_id, address, location, priority, job_type, status, form_data, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()) RETURNING *`,
        [title, description, formId, formTitle, assignedTo, assignedBy, unitId, address, location ? JSON.stringify(location) : null, priority, jobType, status, formData ? JSON.stringify(formData) : null]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: 'İş eklenemedi', details: msg });
    }
  });

  // Birim güncelle
  router.put('/units/:id', async (req, res) => {
    const { id } = req.params;
    const { name, parentId, parent_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Birim adı zorunlu' });
    
    // Frontend'den parent_id veya parentId gelebilir
    const actualParentId = parent_id || parentId;
    
    console.log('Birim güncelleme isteği:', { id, name, parentId, parent_id, actualParentId });
    
    try {
      // Aynı isimde başka bir birim var mı (bu id hariç)
      const exists = await client.query('SELECT id FROM units WHERE LOWER(name) = LOWER($1) AND id <> $2', [name, id]);
      if (exists.rows.length > 0) {
        return res.status(409).json({ error: 'Bu isimde başka bir birim zaten var' });
      }
      const result = await client.query(
        'UPDATE units SET name = $1, parent_id = $2 WHERE id = $3 RETURNING *',
        [name, actualParentId || null, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Birim bulunamadı' });
      }
      console.log('Birim güncellendi:', result.rows[0]);
      res.json(result.rows[0]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Birim güncelleme hatası:', msg);
      res.status(500).json({ error: 'Birim güncellenemedi', details: msg });
    }
  });

  // Birim sil
  router.delete('/units/:id', async (req, res) => {
    const { id } = req.params;
    try {
      // Bağlı kullanıcı var mı kontrol et
      const userRes = await client.query('SELECT id FROM users WHERE unit_id = $1', [id]);
      if (userRes.rows.length > 0) {
        return res.status(409).json({ error: 'Bu birime bağlı kullanıcı(lar) olduğu için silinemez.' });
      }
      // Alt birimleri sil (recursive silme)
      const subUnits = await client.query('SELECT id FROM units WHERE parent_id = $1', [id]);
      for (const sub of subUnits.rows) {
        await client.query('DELETE FROM units WHERE id = $1', [sub.id]);
      }
      // Birimi sil
      const delRes = await client.query('DELETE FROM units WHERE id = $1 RETURNING *', [id]);
      if (delRes.rows.length === 0) {
        return res.status(404).json({ error: 'Birim bulunamadı' });
      }
      res.json({ success: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: 'Birim silinemedi', details: msg });
    }
  });

  // Kullanıcı güncelle
  router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    // camelCase -> snake_case eşleştirme
    const fieldMap: Record<string, string> = {
      first_name: 'first_name',
      last_name: 'last_name',
      username: 'username',
      role: 'role',
      unit_id: 'unit_id',
      email: 'email',
      phone: 'phone',
      gender: 'gender',
      birthDate: 'birth_date',
      address: 'address',
      notes: 'notes',
      is_active: 'is_active',
      display_name: 'display_name',
      profile_image_base64: 'profile_image_base64',
    };
    const updates = [];
    const values = [];
    let idx = 1;
    // Şifre güncelleme desteği
    if (req.body.password && req.body.password.length > 0) {
      const bcrypt = require('bcryptjs');
      const password_hash = await bcrypt.hash(req.body.password, 10);
      updates.push(`password_hash = $${idx}`);
      values.push(password_hash);
      idx++;
    }
    for (const key in fieldMap) {
      if (req.body[key] !== undefined) {
        updates.push(`${fieldMap[key]} = $${idx}`);
        values.push(req.body[key]);
        idx++;
      }
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Güncellenecek alan yok' });
    }
    values.push(id);
    try {
      const result = await client.query(
        `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
        values
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: 'Kullanıcı güncellenemedi', details: msg });
    }
  });

  // Kullanıcı sil
  router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
      // Önce kullanıcıyı bul
      const userRes = await client.query('SELECT role FROM users WHERE id = $1', [id]);
      if (userRes.rows.length === 0) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }
      if (userRes.rows[0].role === 'superadmin') {
        return res.status(403).json({ error: 'Superadmin silinemez' });
      }
      const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }
      res.json({ success: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: 'Kullanıcı silinemedi', details: msg });
    }
  });

  // Kullanıcı ekle
  router.post('/users', async (req, res) => {
    // Zorunlu alanlar
    const { first_name, last_name, unit_id, username, password, role } = req.body;
    if (!first_name || !last_name || !unit_id || !username || !password || !role) {
      return res.status(400).json({ error: 'Ad, Soyad, Birim, Kullanıcı Adı, Şifre ve Rol zorunludur' });
    }

    // Şifre en az 6 karakter olmalı
    if (password.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır' });
    }

    // Email format kontrolü (varsa)
    if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
      return res.status(400).json({ error: 'Geçerli bir e-posta adresi giriniz' });
    }

    try {
      // unit_id'nin geçerli olup olmadığını kontrol et
      const unitRes = await client.query('SELECT id FROM units WHERE id = $1', [unit_id]);
      if (unitRes.rows.length === 0) {
        return res.status(400).json({ error: `Geçersiz birim seçimi: ID ${unit_id} bulunamadı` });
      }

      // Username benzersizlik kontrolü
      const existingUsername = await client.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [username]);
      if (existingUsername.rows.length > 0) {
        return res.status(409).json({ error: 'Bu kullanıcı adı zaten kullanılıyor' });
      }

      // Email benzersizlik kontrolü (varsa)
      if (req.body.email) {
        const existingEmail = await client.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [req.body.email]);
        if (existingEmail.rows.length > 0) {
          return res.status(409).json({ error: 'Bu e-posta adresi zaten kullanılıyor' });
        }
      }

      // Şifreyi hashle
      const password_hash = await bcrypt.hash(password, 10);

      // Tüm alanları topla
      const now = new Date().toISOString();
      const fields = ['first_name', 'last_name', 'unit_id', 'username', 'password_hash', 'role', 'created_at', 'updated_at'];
      const values = [first_name, last_name, parseInt(unit_id), username, password_hash, role, now, now];
      
      // Opsiyonel alanları ekle
      const optionalMap = {
        display_name: req.body.display_name,
        phone: req.body.phone,
        email: req.body.email,
        gender: req.body.gender,
        birth_date: req.body.birth_date || null,
        profile_image_base64: req.body.profile_image_base64,
        social_media: req.body.social_media ? JSON.stringify(req.body.social_media) : null,
        address: req.body.address,
        notes: req.body.notes,
        is_active: req.body.is_active !== undefined ? req.body.is_active : true
      };

      Object.entries(optionalMap).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          fields.push(key);
          values.push(val);
        }
      });

      const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');

      const result = await client.query(
        `INSERT INTO users (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );

      const newUser = result.rows[0];
      // Şifreyi response'dan çıkar
      delete newUser.password_hash;
      
      res.status(201).json(newUser);
    } catch (err) {
      console.error('Kullanıcı ekleme hatası:', err);
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
    const result = await client.query('SELECT * FROM users');
    res.json(result.rows);
  });

  // Birimler
  router.get('/units', async (req, res) => {
    const result = await client.query('SELECT * FROM units ORDER BY name ASC');
    res.json(result.rows);
  });

  // Birim ekle
  router.post('/units', async (req, res) => {
    const { name, parentId, parent_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Birim adı zorunlu' });
    
    // Frontend'den parent_id veya parentId gelebilir
    const actualParentId = parent_id || parentId;
    
    console.log('Birim ekleme isteği:', { name, parentId, parent_id, actualParentId });
    
    try {
      // Aynı isimde birim var mı kontrolü
      const exists = await client.query('SELECT id FROM units WHERE LOWER(name) = LOWER($1)', [name]);
      if (exists.rows.length > 0) {
        return res.status(409).json({ error: 'Bu isimde bir birim zaten var' });
      }
      const result = await client.query(
        'INSERT INTO units (name, parent_id) VALUES ($1, $2) RETURNING *',
        [name, actualParentId || null]
      );
      console.log('Yeni birim eklendi:', result.rows[0]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Birim ekleme hatası:', msg);
      res.status(500).json({ error: 'Birim eklenemedi', details: msg });
    }
  });

  // Formlar
  router.get('/forms', async (req, res) => {
    const result = await client.query('SELECT * FROM forms');
    res.json(result.rows.map(row => ({
      id: row.id.toString(),
      title: row.name,
      fields: row.schema,
      isDefault: row.is_default
    })));
  });

  // Form ekle
  router.post('/forms', async (req, res) => {
    const { title, fields } = req.body;
    if (!title || !fields) return res.status(400).json({ error: 'Başlık ve alanlar zorunlu' });
    const result = await client.query(
      'INSERT INTO forms (name, schema) VALUES ($1, $2) RETURNING *',
      [title, JSON.stringify(fields)]
    );
    const row = result.rows[0];
    res.status(201).json({ id: row.id.toString(), title: row.name, fields: row.schema, isDefault: row.is_default });
  });

  // Form güncelle
  router.put('/forms/:id', async (req, res) => {
    const { id } = req.params;
    const { title, fields } = req.body;
    if (!title || !fields) return res.status(400).json({ error: 'Başlık ve alanlar zorunlu' });
    const result = await client.query(
      'UPDATE forms SET name = $1, schema = $2 WHERE id = $3 RETURNING *',
      [title, JSON.stringify(fields), id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Form bulunamadı' });
    const row = result.rows[0];
    res.json({ id: row.id.toString(), title: row.name, fields: row.schema, isDefault: row.is_default });
  });

  // Form sil
  router.delete('/forms/:id', async (req, res) => {
    const { id } = req.params;
    const result = await client.query('DELETE FROM forms WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Form bulunamadı' });
    res.json({ success: true });
  });

  // Form ekle
  router.post('/forms', async (req, res) => {
    const { title, fields } = req.body;
    if (!title || !fields) return res.status(400).json({ error: 'Başlık ve alanlar zorunlu' });
    const result = await client.query(
      'INSERT INTO forms (name, schema) VALUES ($1, $2) RETURNING *',
      [title, JSON.stringify(fields)]
    );
    const row = result.rows[0];
    res.status(201).json({ id: row.id.toString(), title: row.name, fields: row.schema, isDefault: row.is_default });
  });

  // Form güncelle
  router.put('/forms/:id', async (req, res) => {
    const { id } = req.params;
    const { title, fields } = req.body;
    if (!title || !fields) return res.status(400).json({ error: 'Başlık ve alanlar zorunlu' });
    const result = await client.query(
      'UPDATE forms SET name = $1, schema = $2 WHERE id = $3 RETURNING *',
      [title, JSON.stringify(fields), id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Form bulunamadı' });
    const row = result.rows[0];
    res.json({ id: row.id.toString(), title: row.name, fields: row.schema, isDefault: row.is_default });
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
  return router;
}
  const router = express.Router();
