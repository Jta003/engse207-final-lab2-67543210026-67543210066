require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const { pool }   = require('./db/db');
const authRoutes = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan(':method :url :status :response-time ms'));

app.use('/api/auth', authRoutes);
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, _next) => res.status(500).json({ error: 'Internal Server Error' }));

async function start() {
  // แสดง DATABASE_URL ที่ใช้จริง (ซ่อน password)
  const dbUrl = process.env.DATABASE_URL || 'NOT SET';
  const safeUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
  console.log(`[auth-service] DATABASE_URL: ${safeUrl}`);

  let retries = 10;
  while (retries > 0) {
    try {
      await pool.query('SELECT 1');
      console.log('[auth-service] DB connected ✓');
      break;
    } catch (err) {
      console.log(`[auth-service] Waiting for DB... (${retries} left): ${err.message}`);
      retries--;
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  if (retries === 0) {
    console.error('[auth-service] FATAL: Cannot connect to DB after 10 retries');
  }

  app.listen(PORT, () => console.log(`[auth-service] Running on port ${PORT}`));
}
start();
