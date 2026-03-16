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
  let retries = 10;
  while (retries > 0) {
    try { await pool.query('SELECT 1'); console.log('[auth-service] DB connected'); break; }
    catch (err) {
      console.log(`[auth-service] Waiting for DB... (${retries} left)`);
      retries--;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  app.listen(PORT, () => console.log(`[auth-service] Running on port ${PORT}`));
}
start();
