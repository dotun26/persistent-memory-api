const { getDb } = require('../lib/db');
const { authenticate } = require('../lib/auth');

module.exports = async function handler(req, res) {
  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // POST /api/remember — store a memory
  if (req.method === 'POST') {
    const { session_id, role, content, message_type = 'text' } = req.body || {};

    if (!session_id || !role || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: session_id, role, content',
      });
    }

    try {
      const sql = getDb();
      const result = await sql`
        INSERT INTO memories (session_id, role, content, message_type)
        VALUES (${session_id}, ${role}, ${content}, ${message_type})
        RETURNING id, created_at
      `;
      return res.status(201).json({ success: true, memory: result[0] });
    } catch (err) {
      console.error('DB error (POST):', err);
      return res.status(500).json({ success: false, error: 'Internal server error', details: err.message });
    }
  }

  // GET /api/remember — retrieve memories for a session
  if (req.method === 'GET') {
    const { session_id, limit = 50, offset = 0 } = req.query;

    if (!session_id) {
      return res.status(400).json({ success: false, error: 'Missing required parameter: session_id' });
    }

    const cap = Math.min(parseInt(limit, 10) || 50, 100);
    const off = parseInt(offset, 10) || 0;

    try {
      const sql = getDb();
      const memories = await sql`
        SELECT id, session_id, role, content, message_type, created_at
        FROM memories
        WHERE session_id = ${session_id}
        ORDER BY created_at DESC
        LIMIT ${cap} OFFSET ${off}
      `;
      return res.status(200).json({ success: true, memories, count: memories.length });
    } catch (err) {
      console.error('DB error (GET):', err);
      return res.status(500).json({ success: false, error: 'Internal server error', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
