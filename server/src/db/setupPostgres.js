const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupPostgres() {
  const password = process.argv[2] || process.env.PGPASSWORD;

  if (!password) {
    console.log('================================================================');
    console.log('📌 VCafe Local PostgreSQL Setup Guide');
    console.log('================================================================');
    console.log('Usage: node src/db/setupPostgres.js <your_postgres_password>');
    console.log('Example: node src/db/setupPostgres.js root123');
    console.log('================================================================');
    process.exit(1);
  }

  const port = process.env.PGPORT || 5432;
  const user = process.env.PGUSER || 'postgres';
  const host = process.env.PGHOST || 'localhost';

  console.log(`🔌 Connecting to local PostgreSQL at ${host}:${port} as '${user}'...`);

  // 1. Connect to default postgres database to create vcafe_db
  const rootClient = new Client({
    host,
    port,
    user,
    password,
    database: 'postgres'
  });

  try {
    await rootClient.connect();
    console.log('✅ Connected to local PostgreSQL server successfully!');

    // Check if vcafe_db exists
    const checkDb = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = 'vcafe_db'`
    );

    if (checkDb.rowCount === 0) {
      console.log('📁 Creating database "vcafe_db"...');
      await rootClient.query('CREATE DATABASE vcafe_db');
      console.log('✅ Database "vcafe_db" created successfully.');
    } else {
      console.log('ℹ️ Database "vcafe_db" already exists.');
    }

    await rootClient.end();

    // 2. Connect to vcafe_db and run DDL
    const dbClient = new Client({
      host,
      port,
      user,
      password,
      database: 'vcafe_db'
    });

    await dbClient.connect();
    console.log('📦 Connected to "vcafe_db". Initializing schema...');

    const schemaPath = path.resolve(__dirname, 'schema.sql');
    let sql = fs.readFileSync(schemaPath, 'utf8');

    // Adapt SQLite syntax to PostgreSQL
    sql = sql
      .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY')
      .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

    await dbClient.query(sql);
    console.log('✅ Schema tables and indexes created in PostgreSQL.');

    await dbClient.end();

    // 3. Write or update .env file
    const envPath = path.resolve(__dirname, '../../.env');
    const databaseUrl = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/vcafe_db`;
    const envContent = `PORT=5000\nJWT_SECRET=vcafe_super_secret_production_key_2026\nDATABASE_URL=${databaseUrl}\n`;

    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(`📝 Updated server/.env with DATABASE_URL: ${databaseUrl}`);

    // 4. Run seed script with DATABASE_URL
    process.env.DATABASE_URL = databaseUrl;
    const seed = require('./seed');
    console.log('🌱 Populating demo branches, menu, ingredients, and orders into PostgreSQL...');
    await seed();

    console.log('================================================================');
    console.log('🎉 LOCAL POSTGRESQL CONNECTED & FULLY INITIALIZED!');
    console.log('Now start your server:');
    console.log('  npm run server');
    console.log('================================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ PostgreSQL setup error:', err.message);
    console.log('\nPlease ensure your password is correct and the PostgreSQL service is running.');
    process.exit(1);
  }
}

setupPostgres();
