// ── Service URLs ──────────────────────────────────────────────────────
// Local: ใช้ relative path ผ่าน nginx reverse proxy
// Railway: เปลี่ยนเป็น URL จริงของแต่ละ service
// ─────────────────────────────────────────────────────────────────────

const CONFIG = {
  // Local — ชี้ตรงไปแต่ละ service port
  AUTH_URL: 'https://auth-service-production-c304.up.railway.app/',
  TASK_URL: 'https://task-service-production-d91b.up.railway.app/',
  USER_URL: 'https://user-service-production-af05.up.railway.app/',

  // ── Railway Cloud ─────────────────────────────────────────────────
  // ถ้า deploy แล้ว ให้ uncomment บรรทัดด้านล่างและใส่ URL จริง
  // AUTH_URL: 'https://auth-service-xxxx.railway.app',
  // TASK_URL: 'https://task-service-xxxx.railway.app',
  // USER_URL: 'https://user-service-xxxx.railway.app',
};
