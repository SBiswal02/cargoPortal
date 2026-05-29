import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import cargoRoutes from './routes/cargo.js';
import './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/', authRoutes);
app.use('/api', cargoRoutes);

app.listen(PORT, () => {
  console.log(`Intergalactic Cargo API listening on http://localhost:${PORT}`);
});
