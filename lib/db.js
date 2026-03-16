const { neon } = require('@neondatabase/serverless');

let sql;

function getDb() {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

async function initSchema() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS memories (
      id BIGSERIAL PRIMARY KEY,
      session_id VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      message_type VARCHAR(50) DEFAULT 'text',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_session_id ON memories(session_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_created_at ON memories(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_content_fts ON memories USING GIN(to_tsvector('english', content))`;
}

module.exports = { getDb, initSchema };
