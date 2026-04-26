CREATE TABLE IF NOT EXISTS notion_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT,
  databases JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
