import { Router } from 'express';
import { db } from '../models/db.js';

export const blacklistRouter = Router();

/**
 * GET /api/v1/blacklist
 * Query: ?q=123-4-56789-0
 */
blacklistRouter.get('/', (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase();
  let results = db.blacklist;

  if (query) {
    results = results.filter(b => 
      b.bank_account_number.toLowerCase().includes(query) ||
      b.scammer_name.toLowerCase().includes(query) ||
      (b.game_uid && b.game_uid.toLowerCase().includes(query))
    );
  }

  res.json({
    success: true,
    total: results.length,
    data: results
  });
});
