const db = require('../lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify the API key for security
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.MEMORY_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { q, session_id, limit = 20, offset = 0 } = req.query;

    if (!q && !session_id) {
      return res.status(400).json({
        error: 'Missing required query parameter: q (search query) or session_id',
      });
    }

    let query = 'SELECT id, session_id, role, content, message_type, created_at FROM memories WHERE 1=1';
    const params = [];

    if (q) {
      // Full-text search using PostgreSQL's text search
      query += ` AND content @@ plainto_tsquery('english', $${params.length + 1})`;
      params.push(q);
    }

    if (session_id) {
      query += ` AND session_id = $${params.length + 1}`;
      params.push(session_id);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    return res.status(200).json({
      success: true,
      results: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Search error:', error.message);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
