const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`Executed query in ${duration}ms`, { text });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

async function getClient() {
  return pool.connect();
}

module.exports = {
  query,
  getClient,
  pool,
};
