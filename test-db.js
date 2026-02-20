const { Pool } = require('pg');

async function test() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    family: 4,
  });
  try {
    const result = await pool.query('SELECT 1 as test');
    console.log('DB OK:', result.rows[0]);
  } catch (e) {
    console.log('DB ERROR:', e.message, e.cause ? e.cause.message : '');
  } finally {
    await pool.end();
  }
}

test();
