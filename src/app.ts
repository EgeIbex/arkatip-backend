import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import entryRoutes from './routes/entries';
import transcribeRoutes from './routes/transcribe';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug logger
app.use((req, res, next) => {
  next();
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/entries', entryRoutes);
app.use('/api/v1/transcribe', transcribeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Sunucu hatası:', err);
  res.status(500).json({ error: 'Sunucu hatası', details: err.message });
});

export default app; 