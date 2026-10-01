const path = require('path');
const fs = require('fs');

const isPostgres = Boolean(process.env.DATABASE_URL);

let pgPool = null;
let sqliteDb = null;

if (isPostgres) {
  const { Pool } = require('pg');
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost')
      ? false
      : { rejectUnauthorized: false }
  });
  console.log('📦 Database: Connected to PostgreSQL Pool (Production mode)');
} else {
  const sqlite3 = require('sqlite3').verbose();
  const dbFile = path.resolve(__dirname, '../../vcafe.sqlite');
  sqliteDb = new sqlite3.Database(dbFile, (err) => {
    if (err) {
      console.error('Failed to connect to local SQLite database:', err.message);
    } else {
      console.log(`📦 Database: Connected to local SQLite database at ${dbFile}`);
    }
  });

  // Enable foreign keys in SQLite
  sqliteDb.run('PRAGMA foreign_keys = ON;');
}

/**
 * Universal query runner that translates parameterized queries:
 * Allows writing queries with $1, $2 (standard PostgreSQL format)
 * and seamlessly adapts them to SQLite ?, ? if running locally.
 */
function query(sqlText, params = []) {
  if (isPostgres) {
    return new Promise((resolve, reject) => {
      pgPool.query(sqlText, params, (err, res) => {
        if (err) return reject(err);
        resolve({
          rows: res.rows || [],
          rowCount: res.rowCount || 0,
          insertId: res.rows && res.rows[0] ? res.rows[0].id : null
        });
      });
    });
  }

  // SQLite Adapter
  return new Promise((resolve, reject) => {
    // Translate $1, $2, $3 to ?
    const translatedSql = sqlText.replace(/\$\d+/g, '?');
    const trimmed = translatedSql.trim().toUpperCase();

    if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH') || trimmed.startsWith('PRAGMA')) {
      sqliteDb.all(translatedSql, params, (err, rows) => {
        if (err) return reject(err);
        resolve({ rows: rows || [], rowCount: (rows || []).length });
      });
    } else {
      sqliteDb.run(translatedSql, params, function (err) {
        if (err) return reject(err);
        resolve({
          rows: [],
          rowCount: this.changes,
          insertId: this.lastID
        });
      });
    }
  });
}

function get(sqlText, params = []) {
  return query(sqlText, params).then((res) => (res.rows && res.rows.length > 0 ? res.rows[0] : null));
}

function all(sqlText, params = []) {
  return query(sqlText, params).then((res) => res.rows || []);
}

function exec(sqlString) {
  if (isPostgres) {
    return pgPool.query(sqlString);
  }
  return new Promise((resolve, reject) => {
    sqliteDb.exec(sqlString, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = {
  query,
  get,
  all,
  exec,
  isPostgres
};
