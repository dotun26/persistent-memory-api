-- Create the memories table
CREATE TABLE IF NOT EXISTS memories (
  id BIGSERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_session_id ON memories(session_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_role ON memories(role);

-- Create a full-text search index
CREATE INDEX IF NOT EXISTS idx_content_fts ON memories USING GIN(to_tsvector('english', content));

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_memories_updated_at BEFORE UPDATE
  ON memories FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
