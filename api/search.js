const { getDb } = require('../lib/db');
const { authenticate } = require('../lib/auth');

module.exports = async function handler(req, res) {
  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, session_id, limit = 20, offset = 0 } = req.query;

  if (!q || !session_id) {
    return res.status(400).json({ success: false, error: 'Missing required parameters: q, session_id' });
  }

  const cap = Math.min(parseInt(limit, 10) || 20, 100);
  const off = parseInt(offset, 10) || 0;

  try {
    const sql = getDb();
    const results = await sql`
      SELECT id, session_id, role, content, message_type, created_at,
             ts_rank(to_tsvector('english', content), plainto_tsquery('english', ${q})) AS rank
      FROM memories
      WHERE session_id = ${session_id}
        AND to_tsvector('english', content) @@ plainto_tsquery('english', ${q})
      ORDER BY rank DESC, created_at DESC
      LIMIT ${cap} OFFSET ${off}
    `;
    return res.status(200).json({ success: true, results, count: results.length });
  } catch (err) {
    console.error('DB error (search):', err);
    return res.status(500).json({ success: false, error: 'Internal server error', details: err.message });
  }
};
