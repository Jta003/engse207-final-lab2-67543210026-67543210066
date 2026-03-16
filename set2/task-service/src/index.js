require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const { pool }   = require('./db/db');
const taskRoutes = require('./routes/tasks');

const app  = express();
const PORT = process.env.PORT || 3002;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan(':method :url :status :response-time ms'));

app.use('/api/tasks', taskRoutes);
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

async function start() {
  const dbUrl  = process.env.DATABASE_URL || 'NOT SET';
  const safeUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
  console.log(`[task-service] DATABASE_URL: ${safeUrl}`);

  let retries = 10;
  while (retries > 0) {
    try { await pool.query('SELECT 1'); console.log('[task-service] DB connected ✓'); break; }
    catch (err) {
      console.log(`[task-service] Waiting for DB... (${retries} left): ${err.message}`);
      retries--;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  app.listen(PORT, () => console.log(`[task-service] Running on port ${PORT}`));
}
start();
