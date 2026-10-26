import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../models/db.js';

export const listingsRouter = Router();

/**
 * GET /api/v1/listings
 * Rich Marketplace Feed Filter:
 * Query params:
 *   category: 'individual_game' | 'game_library' | 'ingame_item'
 *   platform: 'rov' | 'valorant' | 'cs2_item' | 'steam_library' | etc.
 *   status: 'available' | 'in_escrow' | 'sold' | 'all'
 *   min_price: number
 *   max_price: number
 *   negotiable: 'true' | 'false'
 *   q: search keyword
 *   sort: 'newest' | 'price_asc' | 'price_desc' | 'trust_score'
 */
listingsRouter.get('/', (req, res) => {
  const {
    category,
    category_type,
    platform,
    platform_id,
    game,
    game_type,
    status = 'available',
    min_price,
    max_price,
    negotiable,
    q,
    sort = 'newest'
  } = req.query;

  let list = Array.from(db.listings.values());

  // 1. Category Filter
  const targetCategory = category || category_type;
  if (targetCategory && targetCategory !== 'all') {
    list = list.filter(l => l.category_type === targetCategory);
  }

  // 2. Platform / Game Filter (supports base prefix matching e.g. 'roblox' -> 'roblox' & 'roblox_item')
  const targetPlatform = platform || platform_id || game || game_type;
  if (targetPlatform && targetPlatform !== 'all') {
    const cleanPlatform = targetPlatform.toLowerCase();
    const baseKey = cleanPlatform.replace(/_(item|library|acc)$/, '');
    list = list.filter(l => {
      const pId = (l.platform_id || '').toLowerCase();
      const gType = (l.game_type || '').toLowerCase();
      return (
        pId === cleanPlatform ||
        gType === cleanPlatform ||
        pId.startsWith(baseKey) ||
        gType.startsWith(baseKey)
      );
    });
  }

  // 3. Status Filter
  if (status && status !== 'all') {
    list = list.filter(l => l.status.toLowerCase() === status.toLowerCase());
  }

  // 4. Price Range Filter
  if (min_price && !isNaN(Number(min_price))) {
    list = list.filter(l => l.asking_price >= Number(min_price));
  }
  if (max_price && !isNaN(Number(max_price))) {
    list = list.filter(l => l.asking_price <= Number(max_price));
  }

  // 5. Negotiable Filter
  if (negotiable !== undefined && negotiable !== '') {
    const isNeg = (negotiable === 'true' || negotiable === true);
    list = list.filter(l => l.negotiable === isNeg);
  }

  // 6. Text Search Filter (q)
  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    list = list.filter(l =>
      l.title.toLowerCase().includes(term) ||
      (l.description && l.description.toLowerCase().includes(term))
    );
  }

  // 7. Enriched Data (Seller & NoSQL Dynamic Specs)
  let enriched = list.map(item => {
    const seller = db.users.get(item.seller_id);
    const specs = db.inventorySpecs.get(item.listing_id);
    return {
      ...item,
      seller_name: item.seller_override_name || (seller ? seller.display_name : 'Unknown'),
      seller_trust: item.seller_override_trust !== undefined ? item.seller_override_trust : (seller ? seller.trust_score : 100),
      seller_deals: item.seller_override_deals || 42,
      seller_is_verified: seller ? seller.is_verified : true,
      specs_preview: specs || null
    };
  });

  // 8. Sorting
  if (sort === 'price_asc') {
    enriched.sort((a, b) => a.asking_price - b.asking_price);
  } else if (sort === 'price_desc') {
    enriched.sort((a, b) => b.asking_price - a.asking_price);
  } else if (sort === 'trust_score') {
    enriched.sort((a, b) => b.seller_trust - a.seller_trust);
  } else {
    // Default: newest
    enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  res.json({
    success: true,
    total: enriched.length,
    filters_applied: {
      category: targetCategory || 'all',
      platform: targetPlatform || 'all',
      status,
      min_price: min_price || null,
      max_price: max_price || null,
      sort
    },
    data: enriched
  });
});

/**
 * GET /api/v1/listings/:id
 */
listingsRouter.get('/:id', (req, res) => {
  const listing = db.listings.get(req.params.id);
  if (!listing) {
    return res.status(404).json({ success: false, error: 'Listing not found' });
  }

  const seller = db.users.get(listing.seller_id);
  const specs = db.inventorySpecs.get(listing.listing_id);

  res.json({
    success: true,
    data: {
      ...listing,
      seller_name: listing.seller_override_name || (seller ? seller.display_name : 'Unknown'),
      seller_trust: listing.seller_override_trust !== undefined ? listing.seller_override_trust : (seller ? seller.trust_score : 100),
      seller_deals: listing.seller_override_deals || 42,
      seller: seller ? {
        user_id: seller.user_id,
        display_name: listing.seller_override_name || seller.display_name,
        trust_score: listing.seller_override_trust !== undefined ? listing.seller_override_trust : seller.trust_score,
        deals_count: listing.seller_override_deals || 42,
        is_verified: seller.is_verified
      } : null,
      inventory_specs: specs || null
    }
  });
});

/**
 * POST /api/v1/listings
 * Posts a new listing with category routing and dynamic fields
 */
listingsRouter.post('/', (req, res) => {
  const {
    sellerId = 'user_seller_01',
    categoryType = 'individual_game',
    platformId,
    gameType,
    title,
    description,
    askingPrice,
    negotiable = true,
    warrantyDays = 14,
    dynamicSpecs = {}
  } = req.body;

  const resolvedPlatform = (platformId || gameType || 'custom').toLowerCase();
  const resolvedCategory = categoryType || 'individual_game';

  if (!title || !askingPrice) {
    return res.status(400).json({ success: false, error: 'Title and asking price are required' });
  }

  const priceNum = Number(askingPrice);
  if (isNaN(priceNum) || priceNum <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid asking price' });
  }

  const listingId = `list_${uuidv4().substring(0, 8)}`;
  const feePercent = (resolvedCategory === 'ingame_item') ? 5.00 : 7.50;

  const newListing = {
    listing_id: listingId,
    seller_id: sellerId,
    category_type: resolvedCategory,
    platform_id: resolvedPlatform,
    game_type: resolvedPlatform.toUpperCase(),
    title: title.trim(),
    description: description ? description.trim() : '',
    asking_price: priceNum,
    negotiable: Boolean(negotiable),
    warranty_days: Number(warrantyDays) || 14,
    escrow_fee_percent: feePercent,
    is_featured_boost: false,
    verification_tier: 'standard',
    status: 'available',
    created_at: new Date().toISOString()
  };

  db.listings.set(listingId, newListing);

  // Store Dynamic Specs in NoSQL Collection
  const specsData = {
    listing_id: listingId,
    category_type: resolvedCategory,
    platform_id: resolvedPlatform,
    estimated_market_value: priceNum,
    submitted_at: new Date().toISOString(),
    ...dynamicSpecs
  };

  db.inventorySpecs.set(listingId, specsData);

  res.json({
    success: true,
    message: 'Listing successfully published to Marketplace Feed',
    data: {
      ...newListing,
      inventory_specs: specsData
    }
  });
});
