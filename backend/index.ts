import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();

import { Client } from 'pg';
import { createApiRouter } from './api';
import { checkAndMigrate } from './db-checker';

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const client = new Client({
  host: 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5466', 10),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});


// Önce tabloları kontrol et ve oluştur, sonra sunucuyu başlat
checkAndMigrate().then(() => {
  console.log('Backend başlatılıyor...');
  client.connect();
  app.use('/api', createApiRouter(client));
  const PORT = process.env.BACKEND_PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Backend API running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Tablo veya alan kontrolü başarısız:', err);
  process.exit(1);
});
