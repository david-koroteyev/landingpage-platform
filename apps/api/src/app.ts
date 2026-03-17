import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import router from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }));
  app.use(morgan('dev'));
  app.use(express.json({ limit: '10mb' })); // Pages can be large JSON
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/v1', router);

  app.use(errorHandler);

  return app;
}
