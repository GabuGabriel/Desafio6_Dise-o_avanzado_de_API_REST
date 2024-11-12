const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'joyas',
  password: 'postgres',
  port: 5432,
  allowExitOnIdle: true
});

module.exports = pool;
