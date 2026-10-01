const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function initializeDatabase() {
  console.log('🔄 Initializing database schema...');
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  let sql = fs.readFileSync(schemaPath, 'utf8');

  if (db.isPostgres) {
    // Adapt SQLite specific syntax to PostgreSQL if connected to Postgres
    sql = sql
      .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY')
      .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await db.exec(sql);
  } else {
    await db.exec(sql);
  }

  console.log('✅ Database schema verified and initialized.');
}

if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Schema initialization error:', err);
      process.exit(1);
    });
}

module.exports = initializeDatabase;
