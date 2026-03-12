const db = require('../lib/db');

module.exports = async (req, res) => {
  // Only allow POST and GET requests
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify the API key for security
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.MEMORY_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'POST') {
      // Store a new memory
      const { session_id, role, content, message_type } = req.body;

      if (!session_id || !role || !content) {
        return res.status(400).json({
          error: 'Missing required fields: session_id, role, content',
        });
      }

      const result = await db.query(
        `INSERT INTO memories (session_id, role, content, message_type, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, created_at`,
        [session_id, role, content, message_type || 'text']
      );

      return res.status(201).json({
        success: true,
        memory: result.rows[0],
      });
    }

    if (req.method === 'GET') {
      // Retrieve memories for a session
      const { session_id, limit = 50, offset = 0 } = req.query;

      if (!session_id) {
        return res.status(400).json({
          error: 'Missing required query parameter: session_id',
        });
      }

      const result = await db.query(
        `SELECT id, session_id, role, content, message_type, created_at
         FROM memories
         WHERE session_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [session_id, limit, offset]
      );

      return res.status(200).json({
        success: true,
        memories: result.rows,
        count: result.rows.length,
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
