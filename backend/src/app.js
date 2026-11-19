import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { healthCheck } from './config/database.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { asyncHandler } from './utils/asyncHandler.js';

dotenv.config();

const app = express();

app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : true,
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/health', asyncHandler(async (req, res) => {
  const db = await healthCheck();
  res.json({
    success: true,
    message: 'Sari-Sari Analytics API is running.',
    database: 'connected',
    serverTime: db.server_time,
  });
}));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
