-- ═══════════════════════════════════════════════
--  USER-DB: user_profiles + logs
--  user_id = logical reference → auth-db.users.id
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_profiles (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER UNIQUE NOT NULL,
  username     VARCHAR(50),
  email        VARCHAR(100),
  role         VARCHAR(20) DEFAULT 'member',
  display_name VARCHAR(100),
  bio          TEXT,
  avatar_url   VARCHAR(255),
  updated_at   TIMESTAMP DEFAULT NOW()
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

-- Seed profiles ตรงกับ auth-db seed users
INSERT INTO user_profiles (user_id, username, email, role, display_name, bio) VALUES
  (1, 'alice', 'alice@lab.local', 'member', 'Alice',      'Developer at Lab'),
  (2, 'bob',   'bob@lab.local',   'member', 'Bob',        'Tester at Lab'),
  (3, 'admin', 'admin@lab.local', 'admin',  'Admin User', 'System Administrator')
ON CONFLICT (user_id) DO NOTHING;
