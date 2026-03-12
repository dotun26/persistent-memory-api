# Persistent Memory API

A serverless API for storing and retrieving conversation memories using Neon PostgreSQL and Vercel.

## Architecture

- **Database:** Neon PostgreSQL (`claw-memory` project)
- **API Host:** Vercel
- **Authentication:** API key header (`x-api-key`)

## Project Structure

```
persistent-memory-api/
├── api/
│   ├── remember.js    # POST/GET memories endpoint
│   └── search.js      # GET search endpoint
├── lib/
│   └── db.js          # Database connection pool
├── scripts/
│   └── setup-db.js    # Database initialization script
├── schema.sql         # Database schema
├── vercel.json        # Vercel configuration
├── package.json       # Dependencies
└── .env               # Environment variables (DO NOT COMMIT)
```

## Setup Instructions

### 1. Database Schema (Already Done ✓)

The database has been initialized with the `memories` table and indexes. Verify by checking Neon:

```bash
node scripts/setup-db.js
```

### 2. Deploy to Vercel

**Option A: Using GitHub (Recommended)**

1. Create a new GitHub repository
2. Push this project to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/persistent-memory-api.git
   git branch -M main
   git push -u origin main
   ```

3. Go to [Vercel Dashboard](https://vercel.com/dashboard)
4. Click "Add New" → "Project"
5. Import from GitHub
6. Select your repository
7. Add environment variables:
   - `DATABASE_URL` = Your Neon connection string
   - `MEMORY_API_KEY` = A secure random key (generate: `openssl rand -hex 32`)
8. Deploy!

**Option B: Using Vercel CLI (if you can authenticate)**

```bash
cd persistent-memory-api
npx vercel --prod
# Follow the prompts to authorize
```

### 3. Environment Variables

Set these in your Vercel project settings:

- **DATABASE_URL**: `postgresql://neondb_owner:npg_fhj6pZUd0zSx@ep-rapid-brook-adcuxy93.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require`
- **MEMORY_API_KEY**: Generate a secure key (e.g., `sk_clawd_memory_v1_$(date +%s)_$(openssl rand -hex 16)`)
- **NODE_ENV**: `production`

## API Endpoints

### POST /api/remember
Store a new memory

**Request:**
```bash
curl -X POST https://your-vercel-url/api/remember \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "user-123",
    "role": "user",
    "content": "Hello, this is my memory",
    "message_type": "text"
  }'
```

**Response:**
```json
{
  "success": true,
  "memory": {
    "id": 1,
    "created_at": "2026-03-12T18:00:00Z"
  }
}
```

### GET /api/remember?session_id=USER_ID
Retrieve memories for a session

**Request:**
```bash
curl "https://your-vercel-url/api/remember?session_id=user-123&limit=50" \
  -H "x-api-key: your-api-key"
```

**Response:**
```json
{
  "success": true,
  "memories": [
    {
      "id": 1,
      "session_id": "user-123",
      "role": "user",
      "content": "Hello, this is my memory",
      "message_type": "text",
      "created_at": "2026-03-12T18:00:00Z"
    }
  ],
  "count": 1
}
```

### GET /api/search?q=QUERY&session_id=OPTIONAL
Search memories

**Request:**
```bash
curl "https://your-vercel-url/api/search?q=memory&session_id=user-123" \
  -H "x-api-key: your-api-key"
```

## Database Schema

```sql
CREATE TABLE memories (
  id BIGSERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_session_id ON memories(session_id);
CREATE INDEX idx_created_at ON memories(created_at DESC);
CREATE INDEX idx_role ON memories(role);
CREATE INDEX idx_content_fts ON memories USING GIN(to_tsvector('english', content));
```

## Local Development

```bash
# Install dependencies
npm install

# Set environment variables
export DATABASE_URL="your-neon-connection-string"
export MEMORY_API_KEY="test-key"

# Run database setup (if needed)
node scripts/setup-db.js

# Test an endpoint
curl -X POST http://localhost:3000/api/remember \
  -H "x-api-key: test-key" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "test", "role": "user", "content": "test"}'
```

## Security

- API key required for all endpoints (`x-api-key` header)
- SSL required for database connection
- Rate limiting recommended on Vercel
- Never commit `.env` file
- Rotate API key periodically

## Next Steps

1. **GitHub:** Push this repo to GitHub
2. **Vercel:** Deploy from GitHub (or use CLI)
3. **Integration:** Update your OpenClaw agent to call `/api/remember` and `/api/search`
4. **Monitoring:** Set up Vercel analytics and database monitoring

## Troubleshooting

### Database Connection Error
- Verify `DATABASE_URL` in Vercel environment
- Check Neon dashboard for active connections
- Ensure IP allowlist includes Vercel (it should be automatic)

### API Key Authentication Failed
- Confirm `x-api-key` header is set
- Verify key matches `MEMORY_API_KEY` in Vercel
- Check the exact string (no extra spaces)

### Memory Not Showing Up
- Check Neon database directly
- Verify `session_id` matches your session
- Look at Vercel function logs for errors

## Files Created

- `api/remember.js` - Memory storage/retrieval endpoint
- `api/search.js` - Full-text search endpoint
- `lib/db.js` - PostgreSQL connection pool
- `scripts/setup-db.js` - Database initialization
- `schema.sql` - SQL schema definition
- `vercel.json` - Vercel deployment config
- `package.json` - Dependencies (pg 8.10.0)
- `.env` - Environment variables (not committed)

## Status

✅ Neon database created (`claw-memory` project)
✅ Database schema initialized
✅ Vercel API endpoints created
✅ Git repository initialized
⏳ **Next:** Push to GitHub and deploy to Vercel
