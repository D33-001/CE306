import { Router } from 'express';
import { CATEGORIES_CATALOG, DYNAMIC_FIELD_SCHEMAS } from '../models/categories.data.js';

export const categoriesRouter = Router();

/**
 * GET /api/v1/categories
 * Returns all 3 top-level marketplace categories with games and statistics
 */
categoriesRouter.get('/', (req, res) => {
  res.json({
    success: true,
    total_categories: CATEGORIES_CATALOG.length,
    data: CATEGORIES_CATALOG
  });
});

/**
 * GET /api/v1/categories/:id
 * Returns a specific category by ID (e.g., individual_game, game_library, ingame_item)
 */
categoriesRouter.get('/:id', (req, res) => {
  const cat = CATEGORIES_CATALOG.find(c => c.id === req.params.id || c.slug === req.params.id);
  if (!cat) {
    return res.status(404).json({ success: false, error: 'Category not found' });
  }

  res.json({
    success: true,
    data: cat
  });
});

/**
 * GET /api/v1/categories/schema/:platformId
 * Returns the dynamic listing form schema for a game or category
 */
categoriesRouter.get('/schema/:platformId', (req, res) => {
  const { platformId } = req.params;

  // Check specific game schema first
  let schema = DYNAMIC_FIELD_SCHEMAS[platformId];

  // If not found, check if it's an in-game item platform or fallback
  if (!schema) {
    if (platformId.endsWith('_item') || platformId === 'ingame_item') {
      schema = DYNAMIC_FIELD_SCHEMAS.ingame_item;
    } else {
      // Default fallback schema
      schema = {
        category_type: 'individual_game',
        required_fields: [
          { key: 'account_spec', label: 'รายละเอียดสเปกบัญชี', type: 'textarea', placeholder: 'ระบุข้อมูลเลเวล ของสะสม หรือไอเทมเด่นในบัญชี' },
          { key: 'bind_status', label: 'สถานะการผูกมัดบัญชี', type: 'text', placeholder: 'เช่น ไม่ติดเบอร์ สะอาด 100%' }
        ]
      };
    }
  }

  res.json({
    success: true,
    platform_id: platformId,
    data: schema
  });
});
