const express     = require('express');
const { pool }    = require('../db/db');
const requireAuth = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/users/health
router.get('/health', (_, res) => res.json({ status: 'ok', service: 'user-service' }));

// ─────────────────────────────────────────────────────
// POST /api/users/internal/create-profile
// Internal — เรียกจาก auth-service ไม่ต้อง JWT
// ─────────────────────────────────────────────────────
router.post('/internal/create-profile', async (req, res) => {
  const { user_id, username, email, role } = req.body;
  if (!user_id || !username || !email)
    return res.status(400).json({ error: 'user_id, username, email are required' });
  try {
    await pool.query(
      `INSERT INTO user_profiles (user_id, username, email, role, display_name)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (user_id) DO NOTHING`,
      [user_id, username, email, role || 'member', username]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('[USER] create-profile error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/logs/internal — รับ log จาก services อื่น (ไม่ต้อง JWT)
router.post('/logs/internal', async (req, res) => {
  const { service, level, event, user_id, ip_address,
          method, path, status_code, message, meta } = req.body;
  if (!service || !level || !event)
    return res.status(400).json({ error: 'service, level, event are required' });
  try {
    await pool.query(
      `INSERT INTO logs (service, level, event, user_id, ip_address,
                         method, path, status_code, message, meta)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [service, level, event, user_id || null, ip_address || null,
       method || null, path || null, status_code || null,
       message || null, meta ? JSON.stringify(meta) : null]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('[USER] log insert error:', err.message);
    res.status(500).json({ error: 'DB error' });
  }
});

// ทุก route ด้านล่างต้องผ่าน JWT
router.use(requireAuth);

// ─────────────────────────────────────────────────────
// GET /api/users/me — ดูโปรไฟล์ตัวเอง
// ─────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    let result = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1', [req.user.sub]
    );
    // Auto-create ถ้ายังไม่มี (seed user เก่า)
    if (!result.rows[0]) {
      await pool.query(
        `INSERT INTO user_profiles (user_id, username, email, role, display_name)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT (user_id) DO NOTHING`,
        [req.user.sub, req.user.username, req.user.email, req.user.role, req.user.username]
      );
      result = await pool.query(
        'SELECT * FROM user_profiles WHERE user_id = $1', [req.user.sub]
      );
    }
    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error('[USER] GET /me error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────
// PUT /api/users/me — แก้ไขโปรไฟล์ตัวเอง
// ─────────────────────────────────────────────────────
router.put('/me', async (req, res) => {
  const { display_name, bio, avatar_url } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO user_profiles (user_id, username, email, role, display_name, bio, avatar_url, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         display_name = COALESCE($5, user_profiles.display_name),
         bio          = COALESCE($6, user_profiles.bio),
         avatar_url   = COALESCE($7, user_profiles.avatar_url),
         updated_at   = NOW()
       RETURNING *`,
      [req.user.sub, req.user.username, req.user.email, req.user.role,
       display_name, bio, avatar_url]
    );
    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error('[USER] PUT /me error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────
// GET /api/users — รายชื่อผู้ใช้ทั้งหมด (admin only)
// ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Forbidden: admin only' });
  try {
    const result = await pool.query(
      'SELECT * FROM user_profiles ORDER BY user_id ASC'
    );
    res.json({ users: result.rows, count: result.rowCount });
  } catch (err) {
    console.error('[USER] GET / error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────
// GET /api/users/:id — ดูโปรไฟล์ user คนอื่น (admin only)
// ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Forbidden: admin only' });
  try {
    const result = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1', [parseInt(req.params.id)]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error('[USER] GET /:id error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────
// PUT /api/users/:id — admin แก้ไขโปรไฟล์คนอื่น
// ─────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Forbidden: admin only' });

  const targetId = parseInt(req.params.id);
  const { display_name, bio, avatar_url, role } = req.body;

  try {
    const check = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1', [targetId]
    );
    if (!check.rows[0]) return res.status(404).json({ error: 'User not found' });

    const result = await pool.query(
      `UPDATE user_profiles SET
         display_name = COALESCE($1, display_name),
         bio          = COALESCE($2, bio),
         avatar_url   = COALESCE($3, avatar_url),
         role         = COALESCE($4, role),
         updated_at   = NOW()
       WHERE user_id = $5 RETURNING *`,
      [display_name, bio, avatar_url, role, targetId]
    );
    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error('[USER] PUT /:id error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;