require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const { pool }   = require('./db/db');
const userRoutes = require('./routes/users');

const app  = express();
const PORT = process.env.PORT || 3003;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan(':method :url :status :response-time ms'));

app.use('/api/users', userRoutes);
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

async function start() {
  let retries = 10;
  while (retries > 0) {
    try { await pool.query('SELECT 1'); console.log('[user-service] DB connected'); break; }
    catch (err) {
      console.log(`[user-service] Waiting for DB... (${retries} left)`);
      retries--;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  app.listen(PORT, () => console.log(`[user-service] Running on port ${PORT}`));
}
start();
