# Persistent Memory API

A lightweight, serverless memory API for AI agents — deployed on Vercel with Neon PostgreSQL.

## Features

- Store conversation messages (`POST /api/remember`)
- Retrieve session history (`GET /api/remember`)
- Full-text search across memories (`GET /api/search`)
- API key authentication
- Session isolation (no cross-session data leakage)

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/dotun26/persistent-memory-api.git
cd persistent-memory-api
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in:

```bash
DATABASE_URL=<your Neon connection string>
API_KEY=<your secret API key>
```

### 3. Deploy to Vercel

```bash
npx vercel --prod
```

Set the environment variables in the Vercel dashboard (Settings → Environment Variables).

## API Reference

### POST /api/remember
Store a memory.

```bash
curl -X POST https://persistent-memory-api.vercel.app/api/remember \
  -H "x-api-key: sk_your_key" \
  -H "Content-Type: application/json" \
  -d '{"session_id":"user-123","role":"user","content":"Hello!"}'
```

### GET /api/remember
Retrieve recent memories.

```bash
curl "https://persistent-memory-api.vercel.app/api/remember?session_id=user-123&limit=20" \
  -H "x-api-key: sk_your_key"
```

### GET /api/search
Full-text search.

```bash
curl "https://persistent-memory-api.vercel.app/api/search?q=trading+bot&session_id=user-123" \
  -H "x-api-key: sk_your_key"
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
```
