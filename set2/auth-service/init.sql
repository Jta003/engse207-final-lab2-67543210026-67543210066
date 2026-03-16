-- ═══════════════════════════════════════════════
--  AUTH-DB: users + logs
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50)  UNIQUE NOT NULL,
  email         VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  DEFAULT 'member',
  created_at    TIMESTAMP    DEFAULT NOW(),
  last_login    TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs (
  id         SERIAL PRIMARY KEY,
  level      VARCHAR(10)  NOT NULL,
  event      VARCHAR(100) NOT NULL,
  user_id    INTEGER,
  message    TEXT,
  meta       JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed Users
INSERT INTO users (username, email, password_hash, role) VALUES
  ('alice', 'alice@lab.local', '$2b$10$9YChbpvbyMZmSV4GHYxXduDd411XofFCVioy.X04QRrqK.T6fhSVC', 'member'),
  ('bob',   'bob@lab.local',   '$2b$10$QaZIMDKUuXFG544sVECzwu/de3WlfjQ1809c0QgLOA0LqYDklw6Pm', 'member'),
  ('admin', 'admin@lab.local', '$2b$10$Yvi9fHEnWm4gU9A69/SIIOepZbMsO5TBCk5LN.jXDX0JB/pnQPCfe', 'admin')
ON CONFLICT (username) DO UPDATE SET
  email         = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  role          = EXCLUDED.role;
