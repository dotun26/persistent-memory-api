const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const connectionString = process.env.DATABASE_URL || 
    'postgresql://neondb_owner:npg_fhj6pZUd0zSx@ep-rapid-brook-adcuxy93.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('Connecting to Neon database...');
    const client = await pool.connect();
    console.log('✓ Connected');

    const schema = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');
    console.log('Running schema setup...');
    
    await client.query(schema);
    console.log('✓ Database schema created successfully');

    client.release();
    await pool.end();
  } catch (error) {
    console.error('✗ Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();
