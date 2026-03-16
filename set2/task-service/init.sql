-- ═══════════════════════════════════════════════
--  TASK-DB: tasks + logs
--  user_id = logical reference → auth-db.users.id
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  status      VARCHAR(20) DEFAULT 'TODO',
  priority    VARCHAR(10) DEFAULT 'medium',
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
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

-- Seed tasks (user_id ตรงกับ auth-db seed: alice=1, bob=2, admin=3)
INSERT INTO tasks (user_id, title, description, status, priority) VALUES
  (1, 'ออกแบบ UI หน้า Login',       'ใช้ Figma ออกแบบ mockup',       'TODO',        'high'),
  (1, 'เขียน API สำหรับ Task CRUD', 'Express.js + PostgreSQL',        'IN_PROGRESS', 'high'),
  (2, 'ทดสอบ JWT Authentication',   'ใช้ Postman ทดสอบทุก endpoint', 'TODO',        'medium'),
  (3, 'Deploy บน Railway',           'ทำ Final Lab ชุดที่ 2',          'TODO',        'medium')
ON CONFLICT DO NOTHING;
