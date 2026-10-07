import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { testConnection } from './db/connection';
import { errorHandler, notFound } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import restaurantRoutes from './routes/restaurants';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import couponRoutes from './routes/coupons';
import favoriteRoutes from './routes/favorites';
import notificationRoutes from './routes/notifications';
import reviewRoutes from './routes/reviews';
import adminRoutes from './routes/admin';
import analyticsRoutes from './routes/analytics';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// API health endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Foodora API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Look for frontend build dist directory in multiple possible locations
const candidateDistDirs = [
  path.resolve(__dirname, '../../../foodora-app/dist'),
  path.resolve(__dirname, '../../../foodora-app/foodora-app/dist'),
  path.resolve(__dirname, '../../foodora-app/foodora-app/dist'),
  path.resolve(process.cwd(), '../../foodora-app/foodora-app/dist'),
  path.resolve(process.cwd(), '../foodora-app/foodora-app/dist'),
  path.resolve(process.cwd(), 'public'),
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, 'public'),
];

let frontendDistPath: string | null = null;
for (const cand of candidateDistDirs) {
  if (fs.existsSync(path.join(cand, 'index.html'))) {
    frontendDistPath = cand;
    break;
  }
}

if (frontendDistPath) {
  console.log(`📦 Serving frontend static build from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath!, 'index.html'));
  });
} else {
  console.log('ℹ️ No frontend dist build found yet. Serving API only.');
}

// 404 & Error Handlers
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`🚀 Foodora backend server running on http://localhost:${PORT}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      if (frontendDistPath) {
        console.log(`🌐 Fullstack Web App: http://localhost:${PORT}`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
