const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'auth-db',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'auth_db',
  user:     process.env.DB_USER     || 'auth_user',
  password: process.env.DB_PASSWORD || 'auth_secret',
});

module.exports = { pool };