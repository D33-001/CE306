import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { listingsRouter } from './routes/listings.routes.js';
import { escrowRouter } from './routes/escrow.routes.js';
import { blacklistRouter } from './routes/blacklist.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { kycRouter } from './routes/kyc.routes.js';
import { walletRouter } from './routes/wallet.routes.js';
import { disputesRouter } from './routes/disputes.routes.js';
import { categoriesRouter } from './routes/categories.routes.js';
import { chatsRouter } from './routes/chats.routes.js';
import { slipRouter } from './routes/slip.routes.js';
import { storageRouter } from './routes/storage.routes.js';
import { notificationsRouter } from './routes/notifications.routes.js';
import { hybridDb } from './models/db.adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Backend API Root Route (API Information)
app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    service: 'Escrow Game Vault - Pure Backend REST API',
    version: '2.0.0',
    description: 'P2P Gaming Marketplace & Escrow Engine with Dynamic Schemas, Item-bound Chat, and Negotiation',
    endpoints: {
      health: '/api/health',
      categories: '/api/v1/categories',
      listings: '/api/v1/listings',
      chats: '/api/v1/chats',
      escrow: '/api/v1/escrow',
      wallet: '/api/v1/wallet',
      slips: '/api/v1/slips',
      storage: '/api/v1/storage',
      notifications: '/api/v1/notifications',
      kyc: '/api/v1/kyc',
      disputes: '/api/v1/disputes',
      blacklist: '/api/v1/blacklist',
      auth: '/api/v1/auth'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Escrow Game Vault API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// RESTful API Routes
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/listings', listingsRouter);
app.use('/api/v1/chats', chatsRouter);
app.use('/api/v1/escrow', escrowRouter);
app.use('/api/v1/wallet', walletRouter);
app.use('/api/v1/slips', slipRouter);
app.use('/api/v1/storage', storageRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/kyc', kycRouter);
app.use('/api/v1/disputes', disputesRouter);
app.use('/api/v1/blacklist', blacklistRouter);
app.use('/api/v1/auth', authRouter);

// Start Server
const server = app.listen(config.port, () => {
  console.log('===========================================================');
  console.log('  ESCROW GAME VAULT - BACKEND REST API V2.0 ONLINE');
  console.log(`  API Base URL:     http://localhost:${config.port}`);
  console.log(`  Categories:       http://localhost:${config.port}/api/v1/categories`);
  console.log(`  Listings:         http://localhost:${config.port}/api/v1/listings`);
  console.log(`  Chats:            http://localhost:${config.port}/api/v1/chats/my-threads`);
  console.log(`  Escrow:           http://localhost:${config.port}/api/v1/escrow`);
  console.log(`  Slips:            http://localhost:${config.port}/api/v1/slips`);
  console.log(`  Storage:          http://localhost:${config.port}/api/v1/storage`);
  console.log(`  Notifications:    http://localhost:${config.port}/api/v1/notifications`);
  console.log(`  Storage Mode:     ${hybridDb.getMode()} (PostgreSQL / In-Memory Fallback)`);
  console.log('===========================================================');
});

process.on('SIGTERM', () => {
  server.close(() => console.log('Server gracefully stopped'));
});
