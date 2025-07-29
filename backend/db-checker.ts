import dotenv from 'dotenv';
dotenv.config();

import { Client } from 'pg';


// Migration işlemleri için geçici client oluşturulacak

export async function checkAndMigrate() {
  const migrationClient = new Client({
    host: 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5466', 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  });
  console.log('Veritabanına bağlanılıyor...');
  await migrationClient.connect();
  console.log('Veritabanı bağlantısı başarılı. Tablo ve alanlar kontrol ediliyor...');


  // Merkezi tablo/alan migration fonksiyonu
  async function migrateTable(tableName: string, fields: { name: string, type: string }[], tableSql: string) {
    await migrationClient.query(tableSql);
    // id alanı zaten var, diğerlerini kontrol et
    const { rows: existingCols } = await migrationClient.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${tableName}'`);
    const existingColNames = existingCols.map((r: any) => r.column_name);
    for (const field of fields) {
      if (!existingColNames.includes(field.name)) {
        console.log(`[DB MIGRATION] ${tableName} tablosuna alan ekleniyor: ${field.name}`);
        await migrationClient.query(`ALTER TABLE ${tableName} ADD COLUMN ${field.name} ${field.type}`);
      }
    }
  }

  // Tablo ve alan tanımları
  const tables = [
    {
      name: 'units',
      fields: [
        { name: 'name', type: 'VARCHAR(100) NOT NULL' },
        { name: 'parent_id', type: 'INTEGER REFERENCES units(id) ON DELETE SET NULL' },
      ],
      sql: `CREATE TABLE IF NOT EXISTS units (
        id SERIAL PRIMARY KEY
      )`,
    },
    {
      name: 'users',
      fields: [
        { name: 'username', type: "VARCHAR(50) UNIQUE NOT NULL" },
        { name: 'password_hash', type: "VARCHAR(255) NOT NULL" },
        { name: 'first_name', type: "VARCHAR(100)" },
        { name: 'last_name', type: "VARCHAR(100)" },
        { name: 'display_name', type: "VARCHAR(100)" },
        { name: 'phone', type: "VARCHAR(30)" },
        { name: 'email', type: "VARCHAR(100)" },
        { name: 'gender', type: "VARCHAR(20)" },
        { name: 'birth_date', type: "DATE" },
        { name: 'profile_image_url', type: "TEXT" },
        { name: 'social_media', type: "JSONB" },
        { name: 'address', type: "TEXT" },
        { name: 'is_active', type: "BOOLEAN DEFAULT TRUE" },
        { name: 'created_at', type: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" },
        { name: 'updated_at', type: "TIMESTAMP" },
        { name: 'notes', type: "TEXT" },
        { name: 'role', type: "VARCHAR(20) NOT NULL" },
        { name: 'unit_id', type: "INTEGER REFERENCES units(id) ON DELETE SET NULL" },
      ],
      sql: `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY
      )`,
    },
    {
      name: 'forms',
      fields: [
        { name: 'name', type: 'VARCHAR(100) NOT NULL' },
        { name: 'schema', type: 'JSONB NOT NULL' },
        { name: 'is_default', type: 'BOOLEAN DEFAULT FALSE' },
      ],
      sql: `CREATE TABLE IF NOT EXISTS forms (
        id SERIAL PRIMARY KEY
      )`,
    },
    {
      name: 'jobs',
      fields: [
        { name: 'title', type: 'VARCHAR(200) NOT NULL' },
        { name: 'description', type: 'TEXT' },
        { name: 'status', type: "VARCHAR(30) NOT NULL DEFAULT 'pending'" },
        { name: 'priority', type: 'VARCHAR(20)' },
        { name: 'address', type: 'VARCHAR(255)' },
        { name: 'location', type: 'GEOMETRY(Point, 4326)' },
        { name: 'form_id', type: 'INTEGER REFERENCES forms(id) ON DELETE SET NULL' },
        { name: 'form_data', type: 'JSONB' },
        { name: 'assigned_user_id', type: 'INTEGER REFERENCES users(id) ON DELETE SET NULL' },
        { name: 'assigned_unit_id', type: 'INTEGER REFERENCES units(id) ON DELETE SET NULL' },
        { name: 'created_by', type: 'INTEGER REFERENCES users(id) ON DELETE SET NULL' },
        { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      ],
      sql: `CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY
      )`,
    },
    {
      name: 'job_history',
      fields: [
        { name: 'job_id', type: 'INTEGER REFERENCES jobs(id) ON DELETE CASCADE' },
        { name: 'action', type: 'VARCHAR(50) NOT NULL' },
        { name: 'user_id', type: 'INTEGER REFERENCES users(id) ON DELETE SET NULL' },
        { name: 'description', type: 'TEXT' },
        { name: 'form_data', type: 'JSONB' },
        { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      ],
      sql: `CREATE TABLE IF NOT EXISTS job_history (
        id SERIAL PRIMARY KEY
      )`,
    },
  ];

  // Tüm tabloları sırayla kontrol et
  for (const t of tables) {
    await migrateTable(t.name, t.fields, t.sql);
  }

  console.log('Tablo ve alan kontrolü başarılı.');
  await migrationClient.end();
}

if (require.main === module) {
  checkAndMigrate()
    .then(() => console.log('DB check/migration complete'))
    .catch((err) => console.error('DB error:', err));
}
