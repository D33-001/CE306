import { v4 as uuidv4 } from 'uuid';
import { CATEGORIES_CATALOG } from './categories.data.js';
import { SecurityEngine } from '../utils/security.js';
import crypto from 'crypto';

// scrypt password hashing (format: scrypt$salt$hash). Legacy seed users keep plaintext for demo login.
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;
  if (!stored.startsWith('scrypt$')) return stored === password;
  const [, salt, hash] = stored.split('$');
  const test = crypto.scryptSync(password, salt, 64);
  const known = Buffer.from(hash, 'hex');
  return known.length === test.length && crypto.timingSafeEqual(known, test);
}

/**
 * Escrow Game Vault - Hybrid Database Engine (SQL Tables + NoSQL Collections)
 * Operates in-memory with strict ACID atomic transaction simulation and double-entry ledgers.
 * Strictly ZERO EMOJIS constraint across all records and logs.
 */
class DatabaseEngine {
  constructor() {
    // ==========================================
    // SQL TABLES
    // ==========================================
    this.users = new Map();
    this.listings = new Map();
    this.escrows = new Map();
    this.ledgers = [];
    this.blacklist = [];
    this.kycRecords = new Map();
    this.bankAccounts = new Map();
    this.withdrawals = new Map();
    this.disputes = new Map();

    // ==========================================
    // ITEM-BOUND CHAT & NEGOTIATION TABLES
    // ==========================================
    this.itemChats = new Map();
    this.offers = new Map();

    // ==========================================
    // NOTIFICATIONS & WEBHOOK DISPATCHER
    // ==========================================
    this.notifications = new Map();
    this.webhookSubscriptions = new Map();

    // ==========================================
    // NoSQL COLLECTIONS
    // ==========================================
    this.inventorySpecs = new Map();
    this.escrowLogs = new Map();

    this._seedDatabase();
  }

  _seedDatabase() {
    // 1. Seed Users (Roles: user, inspector, admin, owner)
    const seedUsers = [
      {
        user_id: 'user_buyer_01',
        email: 'buyer.nont@gmail.com',
        password_hash: 'Password123!',
        display_name: 'Nont (Trader TH)',
        role: 'user',
        wallet_balance: 35000.00,
        escrow_locked_balance: 0.00,
        trust_score: 98,
        is_verified: true,
        created_at: new Date().toISOString()
      },
      {
        user_id: 'user_seller_01',
        email: 'seller.arm@gmail.com',
        password_hash: 'Password123!',
        display_name: 'Arm_ProGamerTH',
        role: 'user',
        wallet_balance: 1500.00,
        escrow_locked_balance: 0.00,
        trust_score: 95,
        is_verified: true,
        created_at: new Date().toISOString()
      },
      {
        user_id: 'user_inspector_01',
        email: 'inspector.safe@escrowvault.com',
        password_hash: 'Password123!',
        display_name: 'Admin_Inspector_01 (Certified Middleman)',
        role: 'inspector',
        wallet_balance: 5000.00,
        escrow_locked_balance: 0.00,
        trust_score: 100,
        is_verified: true,
        created_at: new Date().toISOString()
      },
      {
        user_id: 'user_owner_01',
        email: 'owner@escrowvault.com',
        password_hash: 'Password123!',
        display_name: 'Vault Platform Stakeholder',
        role: 'owner',
        wallet_balance: 45000.00,
        escrow_locked_balance: 0.00,
        trust_score: 100,
        is_verified: true,
        created_at: new Date().toISOString()
      }
    ];

    for (const u of seedUsers) {
      this.users.set(u.user_id, u);
    }

    // 2. Seed Listings across all 3 Categories (Enriched with exact Figma Design Reference)
    const seedListings = [
      // FIGMA EXACT SHOWCASE: 6 Valorant Verified Accounts
      {
        listing_id: 'list_val_figma_001',
        seller_id: 'user_seller_01',
        seller_override_name: 'RadiantVault',
        seller_override_trust: 99,
        seller_override_deals: 42,
        category_type: 'individual_game',
        platform_id: 'valorant',
        game_type: 'VALORANT',
        title: 'Valorant Radiant #120 - VCT Champions 2021 Karambit + 45 Skins',
        description: 'ไอดี Radiant แท้ #120 มีดหายากสุดในเกม VCT Champions 2021 Karambit สกินปืนหลัก 45 กระบอก อีเมลเดิมสะอาด ปลอดภัย 100%',
        asking_price: 14500.00,
        negotiable: true,
        warranty_days: 60,
        escrow_fee_percent: 6.50,
        is_featured_boost: true,
        verification_tier: 'admin_verified',
        status: 'available',
        weapon_type: 'karambit_champions',
        image_url: '/img/karambit.png',
        rank_badge: 'RADIANT',
        skins_count: 45,
        region_tag: 'APAC',
        cleanliness_tags: ['Clean Email', 'Full Access', 'First Hand'],
        created_at: new Date(Date.now() - 100000).toISOString()
      },
      {
        listing_id: 'list_val_figma_002',
        seller_id: 'user_seller_01',
        seller_override_name: 'OnyxAccounts',
        seller_override_trust: 100,
        seller_override_deals: 128,
        category_type: 'individual_game',
        platform_id: 'valorant',
        game_type: 'VALORANT',
        title: 'Immortal 3 - Reaver + Prime Collection, 62 Premium Skins',
        description: 'ไอดี Immortal 3 คอลเลกชัน Reaver และ Prime ครบเซ็ต สกินพรีเมียม 62 ชิ้น พร้อมลงแข่งและไต่แรงก์ทันที',
        asking_price: 8900.00,
        negotiable: true,
        warranty_days: 30,
        escrow_fee_percent: 7.00,
        is_featured_boost: true,
        verification_tier: 'admin_verified',
        status: 'available',
        weapon_type: 'reaver_vandal',
        image_url: '/img/reaver.png',
        rank_badge: 'IMMORTAL III',
        skins_count: 62,
        region_tag: 'APAC',
        cleanliness_tags: ['Clean Email', 'Full Access'],
        created_at: new Date(Date.now() - 200000).toISOString()
      },
      {
        listing_id: 'list_val_figma_003',
        seller_id: 'user_seller_01',
        seller_override_name: 'Pixel Trader',
        seller_override_trust: 98,
        seller_override_deals: 76,
        category_type: 'individual_game',
        platform_id: 'valorant',
        game_type: 'VALORANT',
        title: 'Diamond 3 - Oni Phantom + RGX Blade, Ready for Ranked',
        description: 'ไอดี Diamond 3 สกิน Oni Phantom คู่กับดาบ RGX Blade พร้อมเล่นแรงก์ บัญชีมือเดียวข้อมูลสะอาด',
        asking_price: 3200.00,
        negotiable: true,
        warranty_days: 14,
        escrow_fee_percent: 7.50,
        is_featured_boost: false,
        verification_tier: 'guaranteed',
        status: 'available',
        weapon_type: 'oni_phantom',
        image_url: '/img/oni.png',
        rank_badge: 'DIAMOND III',
        skins_count: 28,
        region_tag: 'APAC',
        cleanliness_tags: ['Full Access', 'First Hand'],
        created_at: new Date(Date.now() - 300000).toISOString()
      },
      {
        listing_id: 'list_val_figma_004',
        seller_id: 'user_seller_01',
        seller_override_name: 'EliteInventory',
        seller_override_trust: 100,
        seller_override_deals: 203,
        category_type: 'individual_game',
        platform_id: 'valorant',
        game_type: 'VALORANT',
        title: 'Radiant - Kuronami Bundle + 84 Skins, All Agents',
        description: 'ไอดี Radiant เซ็ต Kuronami เต็มบันเดิล รวมสกิน 84 ชิ้น ปลดล็อกเอเจนต์ครบทุกคน ไม่เคยมีประวัติเสีย',
        asking_price: 19800.00,
        negotiable: true,
        warranty_days: 60,
        escrow_fee_percent: 6.00,
        is_featured_boost: true,
        verification_tier: 'admin_verified',
        status: 'available',
        weapon_type: 'kuronami_vandal',
        image_url: '/img/kuronami.png',
        rank_badge: 'RADIANT',
        skins_count: 84,
        region_tag: 'APAC',
        cleanliness_tags: ['Clean Email', 'Full Access', 'First Hand'],
        created_at: new Date(Date.now() - 400000).toISOString()
      },
      {
        listing_id: 'list_val_figma_005',
        seller_id: 'user_seller_01',
        seller_override_name: 'GG.Trading',
        seller_override_trust: 99,
        seller_override_deals: 91,
        category_type: 'individual_game',
        platform_id: 'valorant',
        game_type: 'VALORANT',
        title: 'Immortal 2 - Elderflame Vandal + 51 Premium Skins',
        description: 'ไอดี Immortal 2 มังกรไฟ Elderflame Vandal เลเวลและสีเต็ม พร้อมสกินพรีเมียม 51 กระบอก ยืนยันตัวตน OGE',
        asking_price: 7400.00,
        negotiable: true,
        warranty_days: 30,
        escrow_fee_percent: 7.00,
        is_featured_boost: true,
        verification_tier: 'admin_verified',
        status: 'available',
        weapon_type: 'elderflame_vandal',
        image_url: '/img/elderflame.png',
        rank_badge: 'IMMORTAL II',
        skins_count: 51,
        region_tag: 'APAC',
        cleanliness_tags: ['Clean Email', 'Full Access'],
        created_at: new Date(Date.now() - 500000).toISOString()
      },
      {
        listing_id: 'list_val_figma_006',
        seller_id: 'user_seller_01',
        seller_override_name: 'NovaMarket',
        seller_override_trust: 99,
        seller_override_deals: 57,
        category_type: 'individual_game',
        platform_id: 'valorant',
        game_type: 'VALORANT',
        title: 'Diamond 2 - Spectrum + Ion Collection, 36 Skins',
        description: 'ไอดี Diamond 2 สกิน Spectrum Phantom พร้อมเซ็ต Ion ไซไฟสุดคลีน รวม 36 สกิน เจ้าของเดิมปล่อยเอง',
        asking_price: 4600.00,
        negotiable: true,
        warranty_days: 14,
        escrow_fee_percent: 7.50,
        is_featured_boost: false,
        verification_tier: 'guaranteed',
        status: 'available',
        weapon_type: 'spectrum_ion',
        image_url: '/img/spectrum.png',
        rank_badge: 'DIAMOND II',
        skins_count: 36,
        region_tag: 'APAC',
        cleanliness_tags: ['Clean Email', 'First Hand'],
        created_at: new Date(Date.now() - 600000).toISOString()
      },

      // CATEGORY 1: Individual Game Accounts
      {
        listing_id: 'list_val_001',
        seller_id: 'user_seller_01',
        seller_override_name: 'Arm_ProGamerTH',
        seller_override_trust: 98,
        seller_override_deals: 64,
        category_type: 'individual_game',
        platform_id: 'valorant',
        game_type: 'VALORANT',
        title: 'ID Valorant Immortal 2 | Kuronami Vandal + Champions 2024 Karambit (Clean OGE)',
        description: 'ไอดีมือเดียว ไม่เคยมีประวัติการแบน สกินปืนหลักครบ อัปเกรดสีและเอฟเฟกต์เต็มทุกกระบอก พร้อมส่งมอบผ่านห้อง Escrow',
        asking_price: 7500.00,
        negotiable: true,
        warranty_days: 30,
        escrow_fee_percent: 7.50,
        is_featured_boost: true,
        verification_tier: 'admin_verified',
        status: 'available',
        weapon_type: 'kuronami_vandal',
        image_url: '/img/kuronami.png',
        rank_badge: 'IMMORTAL II',
        skins_count: 39,
        region_tag: 'APAC',
        cleanliness_tags: ['Original Owner', 'Unlinked Email', 'Clean History'],
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        listing_id: 'list_rov_002',
        seller_id: 'user_seller_01',
        seller_override_name: 'GarenaVaultTH',
        seller_override_trust: 99,
        seller_override_deals: 112,
        category_type: 'individual_game',
        platform_id: 'rov',
        game_type: 'ROV',
        title: 'ไอดี RoV Supreme Conqueror 65 ดาว | Murad ร่าง Dimension Breaker + สกิน SS 18 ตัว',
        description: 'การีน่าสะอาด ไม่ผูกเฟสบุ๊ค รูนครบ 30 หน้า ฮีโร่ครบ 120 ตัว พร้อมแข่งและไต่แรงก์ คนกลางตรวจสเปกฟรี',
        asking_price: 5200.00,
        negotiable: true,
        warranty_days: 14,
        escrow_fee_percent: 7.50,
        is_featured_boost: true,
        verification_tier: 'admin_verified',
        status: 'available',
        image_url: '/img/rov_murad.jpg',
        rank_badge: 'CONQUEROR 65 STARS',
        skins_count: 280,
        region_tag: 'TH',
        cleanliness_tags: ['Original Owner', 'Unlinked Email', 'Clean History'],
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        listing_id: 'list_rov_012',
        seller_id: 'user_seller_01',
        seller_override_name: 'AOVMasterStore',
        seller_override_trust: 100,
        seller_override_deals: 194,
        category_type: 'individual_game',
        platform_id: 'rov',
        game_type: 'ROV',
        title: 'RoV Glorious Ruler 105 ดาว | Nakroth Dimension Breaker + Demon Slayer Collab ครบเซ็ต',
        description: 'ไอดีระดับท็อปเซิร์ฟ สกินแรร์อนิเมะ Demon Slayer (Tanjiro, Zenitsu, Nezuko) และ Bleach ครบ การีน่าสะอาดเปลี่ยนเบอร์ในห้องคนกลางได้ทันที',
        asking_price: 8900.00,
        negotiable: true,
        warranty_days: 30,
        escrow_fee_percent: 7.00,
        is_featured_boost: true,
        verification_tier: 'admin_verified',
        status: 'available',
        image_url: '/img/rov_nakroth.jpg',
        rank_badge: 'GLORIOUS RULER',
        skins_count: 415,
        region_tag: 'TH',
        cleanliness_tags: ['Original Owner', 'Unlinked Email', 'Clean History'],
        created_at: new Date(Date.now() - 82000000).toISOString()
      },
      {
        listing_id: 'list_rov_013',
        seller_id: 'user_seller_01',
        seller_override_name: 'SiamMOBA',
        seller_override_trust: 98,
        seller_override_deals: 76,
        category_type: 'individual_game',
        platform_id: 'rov',
        game_type: 'ROV',
        title: 'ไอดี RoV Commander V | Violet Dimension Breaker + Tel\'Annas ร่างอนิเมะ พร้อมลงแรงก์',
        description: 'ไอดีสายแครี่ สกินแรร์ Violet และ Tel\'Annas ครบ รูนสายกายภาพ/เวทตัน 100% ราคาคุ้มค่าพร้อมประกันดึงคืน 14 วัน',
        asking_price: 2900.00,
        negotiable: true,
        warranty_days: 14,
        escrow_fee_percent: 7.50,
        is_featured_boost: false,
        verification_tier: 'guaranteed',
        status: 'available',
        image_url: '/img/rov_violet.jpg',
        rank_badge: 'COMMANDER V',
        skins_count: 190,
        region_tag: 'TH',
        cleanliness_tags: ['Unlinked Email', 'Clean History'],
        created_at: new Date(Date.now() - 78000000).toISOString()
      },
      {
        listing_id: 'list_roblox_003',
        seller_id: 'user_seller_01',
        seller_override_name: 'BloxTradeCenter',
        seller_override_trust: 97,
        seller_override_deals: 89,
        category_type: 'individual_game',
        platform_id: 'roblox',
        game_type: 'ROBLOX',
        title: 'ID Roblox Blox Fruits Max Lv 2550 | หมัด Godhuman + ผลถาวร Perm Kitsune + Dark Blade v3',
        description: 'ผลคิทสึเนะถาวรมาสเตอรี่ตัน ดาบคู่ Cursed Dual Katana เรือเร็ว x2 เงิน x2 ซื้อไว้ครบทุก Gamepass บัญชีสะอาดเปลี่ยนเมลได้ทันที',
        asking_price: 3400.00,
        negotiable: true,
        warranty_days: 14,
        escrow_fee_percent: 7.50,
        is_featured_boost: true,
        verification_tier: 'admin_verified',
        status: 'available',
        image_url: '/img/roblox_kitsune.jpg',
        rank_badge: 'MAX LV 2550',
        skins_count: 12,
        region_tag: 'GLOBAL',
        cleanliness_tags: ['Original Owner', 'Unlinked Email', 'Clean History'],
        created_at: new Date(Date.now() - 43200000).toISOString()
      },
      {
        listing_id: 'list_roblox_014',
        seller_id: 'user_seller_01',
        seller_override_name: 'KorbloxVaultTH',
        seller_override_trust: 99,
        seller_override_deals: 134,
        category_type: 'individual_game',
        platform_id: 'roblox',
        game_type: 'ROBLOX',
        title: 'ID Roblox Korblox + Headless Horseman แท้ | Blox Fruits Perm Dragon + เผ่า V4 เต็มทุกเผ่า',
        description: 'บัญชี Roblox แต่งตัวแรร์ Korblox Deathspeaker และหัวล่องหน Headless Horseman แท้ พร้อมแมพ Blox Fruits ผลมังกรถาวรและเผ่า V4 ครบ 6 เผ่า',
        asking_price: 6800.00,
        negotiable: true,
        warranty_days: 30,
        escrow_fee_percent: 7.00,
        is_featured_boost: true,
        verification_tier: 'admin_verified',
        status: 'available',
        image_url: '/img/roblox_korblox.jpg',
        rank_badge: 'KORBLOX + HEADLESS',
        skins_count: 25,
        region_tag: 'GLOBAL',
        cleanliness_tags: ['Original Owner', 'Unlinked Email', 'Clean History'],
        created_at: new Date(Date.now() - 39000000).toISOString()
      },
      {
        listing_id: 'list_genshin_004',
        seller_id: 'user_seller_01',
        seller_override_name: 'CelestiaStore',
        seller_override_trust: 100,
        seller_override_deals: 145,
        category_type: 'individual_game',
        platform_id: 'genshin',
        game_type: 'GENSHIN',
        title: 'Genshin Impact AR60 Asia | Raiden Shogun C2R1 + Furina C6R1 (Day 1 Clean Account)',
        description: 'ไอดีสายวาฬ สำรวจแมพ 100% ตัวละคร 5 ดาว 28 ตัว อาวุธประจำตัวครบ ข้อมูลผูกปลอดภัย ไม่มี Deadlinks ยังไม่ตั้ง Username',
        asking_price: 11000.00,
        negotiable: true,
        warranty_days: 30,
        escrow_fee_percent: 6.00,
        is_featured_boost: true,
        verification_tier: 'admin_verified',
        status: 'available',
        image_url: '/img/genshin_raiden.jpg',
        rank_badge: 'AR 60 ASIA',
        skins_count: 28,
        region_tag: 'ASIA',
        cleanliness_tags: ['Original Owner', 'Unlinked Email', 'Clean History'],
        created_at: new Date(Date.now() - 21600000).toISOString()
      },
      {
        listing_id: 'list_genshin_015',
        seller_id: 'user_seller_01',
        seller_override_name: 'TeyvatMarketTH',
        seller_override_trust: 99,
        seller_override_deals: 108,
        category_type: 'individual_game',
        platform_id: 'genshin',
        game_type: 'GENSHIN',
        title: 'Genshin Impact AR60 Asia | Neuvillette C6R1 + Arlecchino C2R1 + Kazuha C2 (No Deadlinks)',
        description: 'ไอดีเมต้าจบ Spiral Abyss 36 ดาวทุกซีซัน Neuvillette C6 โซโล่ได้ทุกห้อง พร้อม Primogems สะสมอีก 24,000 เม็ด ใบเสร็จเติมเกมครบทุกใบ',
        asking_price: 13500.00,
        negotiable: true,
        warranty_days: 60,
        escrow_fee_percent: 6.00,
        is_featured_boost: true,
        verification_tier: 'admin_verified',
        status: 'available',
        image_url: '/img/genshin_furina.jpg',
        rank_badge: 'AR 60 WHALE',
        skins_count: 34,
        region_tag: 'ASIA',
        cleanliness_tags: ['Original Owner', 'Unlinked Email', 'Clean History'],
        created_at: new Date(Date.now() - 20000000).toISOString()
      },
      {
        listing_id: 'list_lol_011',
        seller_id: 'user_seller_01',
        seller_override_name: 'RiftLegendsTH',
        seller_override_trust: 99,
        seller_override_deals: 74,
        category_type: 'individual_game',
        platform_id: 'lol',
        game_type: 'LOL',
        title: 'League of Legends Challenger SEA | All Champions + 185 Skins (Soul Fighter + Ultimate)',
        description: 'ไอดี LoL แรงก์ Challenger เซิร์ฟ SEA แชมเปี้ยนครบทุกตัว สกินแรร์และ Prestige ครบ มือเดียวตั้งแต่วันแรก',
        asking_price: 9600.00,
        negotiable: true,
        warranty_days: 30,
        escrow_fee_percent: 6.50,
        is_featured_boost: true,
        verification_tier: 'admin_verified',
        status: 'available',
        image_url: '/img/lol_yasuo.jpg',
        rank_badge: 'CHALLENGER',
        skins_count: 185,
        region_tag: 'SEA',
        cleanliness_tags: ['Original Owner', 'Unlinked Email', 'Clean History'],
        created_at: new Date(Date.now() - 18000000).toISOString()
      },
      {
        listing_id: 'list_lol_016',
        seller_id: 'user_seller_01',
        seller_override_name: 'RiftLegendsTH',
        seller_override_trust: 99,
        seller_override_deals: 74,
        category_type: 'individual_game',
        platform_id: 'lol',
        game_type: 'LOL',
        title: 'LoL Grandmaster SEA + TFT Mythic Chibi | Immortalized Legend Ahri (Faker Hall of Legends)',
        description: 'ไอดี LoL พ่วง TFT สกินลิมิเต็ด Faker Immortalized Legend Ahri พร้อมสกิน Prestige 22 ตัว และ Chibi Yasuo Mythic ในโหมด TFT',
        asking_price: 12900.00,
        negotiable: true,
        warranty_days: 30,
        escrow_fee_percent: 6.50,
        is_featured_boost: true,
        verification_tier: 'admin_verified',
        status: 'available',
        image_url: '/img/lol_ahri.jpg',
        rank_badge: 'GRANDMASTER',
        skins_count: 310,
        region_tag: 'SEA',
        cleanliness_tags: ['Original Owner', 'Unlinked Email', 'Clean History'],
        created_at: new Date(Date.now() - 17000000).toISOString()
      },

      // CATEGORY 2: Game Libraries & Platforms
      {
        listing_id: 'list_steam_005',
        seller_id: 'user_seller_01',
        seller_override_name: 'SteamCollectorTH',
        seller_override_trust: 100,
        seller_override_deals: 83,
        category_type: 'game_library',
        platform_id: 'steam_library',
        game_type: 'STEAM_LIBRARY',
        title: 'คลังเกม Steam มือเดียว 154 เกมแท้ | Black Myth Wukong + Elden Ring + CS2 Prime สะอาด 100%',
        description: 'สะสมเกมแท้ระดับ AAA เต็มคลัง เลเวล Steam 62 เหรียญ Service Medals ย้อนหลัง 6 ปี ประวัติ VAC สะอาด ไม่เคยมีประวัติเสีย ส่งมอบ First CD-Key',
        asking_price: 14500.00,
        negotiable: true,
        warranty_days: 60,
        escrow_fee_percent: 6.50,
        is_featured_boost: true,
        verification_tier: 'admin_verified',
        status: 'available',
        image_url: '/img/steam.jpg',
        rank_badge: 'STEAM LV 62',
        skins_count: 154,
        region_tag: 'TH',
        cleanliness_tags: ['Original Owner', 'Unlinked Email', 'Clean History'],
        created_at: new Date(Date.now() - 15000000).toISOString()
      },
      {
        listing_id: 'list_steam_017',
        seller_id: 'user_seller_01',
        seller_override_name: 'SteamCollectorTH',
        seller_override_trust: 100,
        seller_override_deals: 83,
        category_type: 'game_library',
        platform_id: 'steam_library',
        game_type: 'STEAM_LIBRARY',
        title: 'Steam Library Lv.88 (240 เกมแท้) | Elden Ring Shadow of the Erdtree + Cyberpunk 2077 + BG3',
        description: 'คลังเกม Steam ระดับนักสะสม 240 เกมแท้ รวม DLC ครบทุกเกม ประวัติขาวสะอาด VAC Clean 100% พร้อมส่งมอบอีเมลแรกและใบเสร็จ CD-Key',
        asking_price: 18900.00,
        negotiable: true,
        warranty_days: 60,
        escrow_fee_percent: 6.00,
        is_featured_boost: true,
        verification_tier: 'admin_verified',
        status: 'available',
        image_url: '/img/eldenring.jpg',
        rank_badge: 'STEAM LV 88',
        skins_count: 240,
        region_tag: 'TH',
        cleanliness_tags: ['Original Owner', 'Unlinked Email', 'Clean History'],
        created_at: new Date(Date.now() - 14000000).toISOString()
      },
      {
        listing_id: 'list_psn_006',
        seller_id: 'user_seller_01',
        seller_override_name: 'ConsoleKingTH',
        seller_override_trust: 98,
        seller_override_deals: 51,
        category_type: 'game_library',
        platform_id: 'psn',
        game_type: 'PSN',
        title: 'ID PlayStation Network โซนไทย | มีเกมแท้ 48 เกม + สมาชิก PS Plus Deluxe คงเหลือ 2 ปี',
        description: 'รวม God of War Ragnarok, Marvel Spider-Man 2, FF7 Rebirth, มีถ้วย Platinum 22 เกม พร้อมส่งมอบวันเดือนปีเกิดตั้งต้น',
        asking_price: 8900.00,
        negotiable: true,
        warranty_days: 30,
        escrow_fee_percent: 7.00,
        is_featured_boost: false,
        verification_tier: 'admin_verified',
        status: 'available',
        image_url: '/img/psn.jpg',
        rank_badge: '22 PLATINUM',
        skins_count: 48,
        region_tag: 'TH',
        cleanliness_tags: ['Original Owner', 'Unlinked Email', 'Clean History'],
        created_at: new Date(Date.now() - 10000000).toISOString()
      },

      // CATEGORY 3: In-Game Items & Currencies (Official P2P Trade)
      {
        listing_id: 'list_cs2_item_007',
        seller_id: 'user_seller_01',
        seller_override_name: 'Arm_ProGamerTH',
        seller_override_trust: 99,
        seller_override_deals: 138,
        category_type: 'ingame_item',
        platform_id: 'cs2_item',
        game_type: 'CS2_ITEM',
        title: 'CS2 Butterfly Knife Fade (Factory New) 99.2% Fade Pattern | ส่งมอบผ่าน Steam Trade URL',
        description: 'มีดแท้ Float 0.015 สภาพใหม่ไร้รอย ลาย Fade เต็ม 99.2% พร้อมส่งทันที ไม่มีติด Trade Hold แลกเปลี่ยนผ่านระบบ Steam Trade Offer ปลอดภัย 100%',
        asking_price: 18500.00,
        negotiable: true,
        warranty_days: 7,
        escrow_fee_percent: 5.00,
        is_featured_boost: true,
        verification_tier: 'admin_verified',
        status: 'available',
        weapon_type: 'karambit_champions',
        image_url: '/img/cs2.jpg',
        rank_badge: 'FACTORY NEW',
        region_tag: 'STEAM',
        cleanliness_tags: ['Clean History', 'Instant Trade'],
        created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        listing_id: 'list_cs2_item_018',
        seller_id: 'user_seller_01',
        seller_override_name: 'SiamVault',
        seller_override_trust: 100,
        seller_override_deals: 215,
        category_type: 'ingame_item',
        platform_id: 'cs2_item',
        game_type: 'CS2_ITEM',
        title: 'CS2 Karambit Doppler Phase 2 (Factory New) Float 0.008 Pink Galaxy + Sport Gloves Vice',
        description: 'เซ็ตมีด Karambit Doppler Phase 2 ชมพูเต็มใบ คู่กับถุงมือ Sport Gloves Vice ปลอด Trade Lock ส่งมอบผ่าน Steam Trade Offer ยืนยันด้วย API',
        asking_price: 28500.00,
        negotiable: true,
        warranty_days: 14,
        escrow_fee_percent: 5.00,
        is_featured_boost: true,
        verification_tier: 'admin_verified',
        status: 'available',
        weapon_type: 'karambit_champions',
        image_url: '/img/karambit.png',
        rank_badge: 'FLOAT 0.008 FN',
        region_tag: 'STEAM',
        cleanliness_tags: ['Original Owner', 'Clean History', 'Instant Trade'],
        created_at: new Date(Date.now() - 6800000).toISOString()
      },
      {
        listing_id: 'list_bloxfruit_008',
        seller_id: 'user_seller_01',
        seller_override_name: 'BloxTradeCenter',
        seller_override_trust: 97,
        seller_override_deals: 89,
        category_type: 'ingame_item',
        platform_id: 'roblox_item',
        game_type: 'ROBLOX_ITEM',
        title: 'Blox Fruits ผลปีศาจ Physical Kitsune + East Dragon Fruit | นัดเทรด Sea 3 Mansion',
        description: 'ผลคิทสึเนะและผลมังกรสดในกล่อง ไม่ใช่ไอดี นัดส่งของผ่านโต๊ะเทรดในเกม Sea 3 คาเฟ่หรือแมนชั่น ผู้ซื้อต้องมีผลมูลค่า 40% สำหรับวางแลกตามระบบเกม',
        asking_price: 1200.00,
        negotiable: true,
        warranty_days: 7,
        escrow_fee_percent: 5.00,
        is_featured_boost: true,
        verification_tier: 'admin_verified',
        status: 'available',
        image_url: '/img/roblox_bloxfruit.jpg',
        rank_badge: 'MYTHICAL FRUIT',
        region_tag: 'SEA 3',
        cleanliness_tags: ['Clean History', 'Instant Trade'],
        created_at: new Date(Date.now() - 5000000).toISOString()
      },
      {
        listing_id: 'list_ro_zeny_009',
        seller_id: 'user_seller_01',
        seller_override_name: 'MorrocBankTH',
        seller_override_trust: 99,
        seller_override_deals: 310,
        category_type: 'ingame_item',
        platform_id: 'ragnarok_item',
        game_type: 'RAGNAROK_ITEM',
        title: 'Ragnarok Classic เงินสด 100,000,000 Zeny (100M) + การ์ดบอสไฮดรา 2 ใบ | นัดเทรดเมืองมอรอค',
        description: 'เงินฟาร์มมือแท้ 100% ไม่มีบอท ปลอดภัยไร้ประวัติแบน นัดรับที่มอรอคพิกัด 124, 85 แชนแนล 1 ส่งมอบทันทีหลังเงินเข้าห้อง Escrow',
        asking_price: 4500.00,
        negotiable: true,
        warranty_days: 7,
        escrow_fee_percent: 5.00,
        is_featured_boost: false,
        verification_tier: 'guaranteed',
        status: 'available',
        image_url: '/img/ragnarok.jpg',
        rank_badge: '100M ZENY',
        region_tag: 'TH',
        cleanliness_tags: ['Clean History'],
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        listing_id: 'list_poe_010',
        seller_id: 'user_seller_01',
        seller_override_name: 'ExileCurrencyTH',
        seller_override_trust: 99,
        seller_override_deals: 195,
        category_type: 'ingame_item',
        platform_id: 'poe_item',
        game_type: 'POE_ITEM',
        title: 'Path of Exile Settlers League | 50x Divine Orbs + Mageblood Belt นัดเทรดใน Hideout ทันที',
        description: 'ดิวายก้อนสด 50 ลูก พร้อมเข็มขัดเทพ Mageblood 4 Flask ฟาร์มแมพ T17 ปลอดภัย 100% ส่งมอบผ่านหน้าต่าง Trade Window ในที่ซ่อนกิลด์',
        asking_price: 2200.00,
        negotiable: true,
        warranty_days: 7,
        escrow_fee_percent: 5.00,
        is_featured_boost: false,
        verification_tier: 'admin_verified',
        status: 'available',
        image_url: '/img/poe.jpg',
        rank_badge: '50 DIVINE + BELT',
        region_tag: 'GLOBAL',
        cleanliness_tags: ['Clean History'],
        created_at: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    for (const l of seedListings) {
      this.listings.set(l.listing_id, l);
    }

    // 3. Seed NoSQL Inventory & Specs
    this.inventorySpecs.set('list_val_figma_001', {
      listing_id: 'list_val_figma_001',
      category_type: 'individual_game',
      platform_id: 'valorant',
      rank: 'Radiant #120',
      region: 'APAC (Thailand)',
      bind_type: 'Clean Email (Unlinked OGE)',
      trust_rating: 'A+ (Safe)',
      skins_count: 45,
      skins: [
        { name: 'VCT Champions 2021 Karambit', tier: 'Ultra Limited', value: 8500 },
        { name: 'Kuronami Vandal (Max Upgraded)', tier: 'Exclusive', value: 1200 },
        { name: 'Prime Vandal', tier: 'Premium', value: 650 },
        { name: 'Reaver Operator', tier: 'Premium', value: 700 },
        { name: 'Recon Phantom', tier: 'Premium', value: 650 }
      ],
      estimated_market_value: 15800.00
    });

    this.inventorySpecs.set('list_val_figma_002', {
      listing_id: 'list_val_figma_002',
      category_type: 'individual_game',
      platform_id: 'valorant',
      rank: 'Immortal 3 (340 RR)',
      region: 'APAC (Thailand)',
      bind_type: 'Clean Email (Unlinked OGE)',
      trust_rating: 'A+ (Safe)',
      skins_count: 62,
      skins: [
        { name: 'Reaver Full Collection (Vandal + Karambit + Op)', tier: 'Exclusive', value: 3200 },
        { name: 'Prime Full Collection (Vandal + Phantom + Axe)', tier: 'Premium', value: 2800 },
        { name: 'Prelude to Chaos Vandal', tier: 'Exclusive', value: 950 },
        { name: 'Singularity Sheriff', tier: 'Exclusive', value: 850 }
      ],
      estimated_market_value: 9600.00
    });

    this.inventorySpecs.set('list_val_figma_003', {
      listing_id: 'list_val_figma_003',
      category_type: 'individual_game',
      platform_id: 'valorant',
      rank: 'Diamond 3',
      region: 'APAC (Thailand)',
      bind_type: 'Clean Email (First Hand)',
      trust_rating: 'A (Verified)',
      skins_count: 28,
      skins: [
        { name: 'Oni Phantom (White & Gold Variant)', tier: 'Premium', value: 750 },
        { name: 'RGX 11z Pro Firefly Blade', tier: 'Exclusive', value: 1450 },
        { name: 'Gaia Vengeance Vandal', tier: 'Premium', value: 650 },
        { name: 'Sovereign Ghost', tier: 'Premium', value: 550 }
      ],
      estimated_market_value: 3600.00
    });

    this.inventorySpecs.set('list_val_figma_004', {
      listing_id: 'list_val_figma_004',
      category_type: 'individual_game',
      platform_id: 'valorant',
      rank: 'Radiant #48',
      region: 'APAC (Thailand)',
      bind_type: 'Clean Email (Unlinked OGE)',
      trust_rating: 'A+ (Safe)',
      skins_count: 84,
      skins: [
        { name: 'Kuronami Full Bundle (No-Nami Melee + Vandal)', tier: 'Exclusive', value: 4200 },
        { name: 'VCT Champions 2023 Kunai + Vandal', tier: 'Ultra Limited', value: 5500 },
        { name: 'Mystbloom Full Bundle (Kunai + Phantom)', tier: 'Exclusive', value: 3400 },
        { name: 'Araxys Vandal + Operator', tier: 'Exclusive', value: 1850 },
        { name: 'All 25 Agents + Contract Gear Unlocked', tier: 'Special', value: 1500 }
      ],
      estimated_market_value: 21500.00
    });

    this.inventorySpecs.set('list_val_figma_005', {
      listing_id: 'list_val_figma_005',
      category_type: 'individual_game',
      platform_id: 'valorant',
      rank: 'Immortal 2',
      region: 'APAC (Thailand)',
      bind_type: 'Clean Email (Unlinked OGE)',
      trust_rating: 'A+ (Safe)',
      skins_count: 51,
      skins: [
        { name: 'Elderflame Vandal + Operator + Dagger', tier: 'Ultra', value: 3100 },
        { name: 'Xenohunter Knife', tier: 'Premium', value: 1200 },
        { name: 'Prime Spectre + Classic', tier: 'Premium', value: 1150 },
        { name: 'Glitchpop Phantom', tier: 'Exclusive', value: 950 }
      ],
      estimated_market_value: 8100.00
    });

    this.inventorySpecs.set('list_val_figma_006', {
      listing_id: 'list_val_figma_006',
      category_type: 'individual_game',
      platform_id: 'valorant',
      rank: 'Diamond 2',
      region: 'APAC (Thailand)',
      bind_type: 'Clean Email (Unlinked)',
      trust_rating: 'A (Verified)',
      skins_count: 36,
      skins: [
        { name: 'Spectrum Phantom + Waveform Melee (Zedd Collab)', tier: 'Exclusive', value: 2400 },
        { name: 'Ion Phantom + Sheriff + Karambit', tier: 'Premium', value: 1850 },
        { name: 'Neptune Vandal', tier: 'Premium', value: 650 }
      ],
      estimated_market_value: 5100.00
    });

    this.inventorySpecs.set('list_val_001', {
      listing_id: 'list_val_001',
      category_type: 'individual_game',
      platform_id: 'valorant',
      rank: 'Immortal 2',
      region: 'AP (Thailand)',
      bind_type: 'Original Email (Clean OGE)',
      trust_rating: 'A+ (Safe)',
      skins: [
        { name: 'Kuronami Vandal', tier: 'Exclusive', value: 1200 },
        { name: 'Champions 2024 Karambit', tier: 'Ultra', value: 2800 },
        { name: 'Prime Vandal', tier: 'Premium', value: 650 },
        { name: 'Reaver Operator', tier: 'Premium', value: 700 }
      ],
      estimated_market_value: 7800.00
    });

    this.inventorySpecs.set('list_rov_002', {
      listing_id: 'list_rov_002',
      category_type: 'individual_game',
      platform_id: 'rov',
      rank: 'Supreme Conqueror 65 Stars',
      bind_type: 'Clean Garena (No Facebook / Ready to Change Phone)',
      trust_rating: 'A+ (Verified)',
      hero_count: 120,
      skin_count: 280,
      dimension_breaker_skins: 'Murad Dimension Breaker, Lauriel Dimension Breaker',
      skins: [
        { name: 'Murad - Dimension Breaker (Evo Lv.5)', tier: 'Dimension Breaker', value: 2200 },
        { name: 'Lauriel - Dimension Breaker', tier: 'Dimension Breaker', value: 1800 },
        { name: 'Nakroth - Killua (Hunter x Hunter Collab)', tier: 'Collab Limited', value: 1400 },
        { name: 'Hayate - TuanshenMiracle', tier: 'Miracle SS', value: 900 }
      ],
      estimated_market_value: 5800.00
    });

    this.inventorySpecs.set('list_rov_012', {
      listing_id: 'list_rov_012',
      category_type: 'individual_game',
      platform_id: 'rov',
      rank: 'Glorious Ruler 105 Stars (Top Server)',
      bind_type: 'Clean Garena (Unlinked Facebook & Line)',
      trust_rating: 'A+ (Safe)',
      hero_count: 120,
      skin_count: 415,
      dimension_breaker_skins: 'Nakroth Dimension Breaker, Tel\'Annas Dimension Breaker, Violet Dimension Breaker',
      skins: [
        { name: 'Nakroth - Dimension Breaker', tier: 'Dimension Breaker', value: 2500 },
        { name: 'Yan - Tanjiro Kamado (Demon Slayer Collab)', tier: 'Anime Collab', value: 1900 },
        { name: 'Murad - Zenitsu Agatsuma (Demon Slayer Collab)', tier: 'Anime Collab', value: 1800 },
        { name: 'Keera - Nezuko Kamado (Demon Slayer Collab)', tier: 'Anime Collab', value: 1500 },
        { name: 'Bright - Toshiro Hitsugaya (Bleach Collab)', tier: 'Anime Collab', value: 1400 }
      ],
      estimated_market_value: 9800.00
    });

    this.inventorySpecs.set('list_rov_013', {
      listing_id: 'list_rov_013',
      category_type: 'individual_game',
      platform_id: 'rov',
      rank: 'Commander V',
      bind_type: 'Clean Garena (Unlinked Facebook)',
      trust_rating: 'A (Verified)',
      hero_count: 108,
      skin_count: 190,
      dimension_breaker_skins: 'Violet Dimension Breaker, Tel\'Annas Dimension Breaker',
      skins: [
        { name: 'Violet - Dimension Breaker', tier: 'Dimension Breaker', value: 1600 },
        { name: 'Tel\'Annas - Dimension Breaker', tier: 'Dimension Breaker', value: 1500 },
        { name: 'Capheny - Harley Quinn', tier: 'DC Limited', value: 650 }
      ],
      estimated_market_value: 3400.00
    });

    this.inventorySpecs.set('list_roblox_003', {
      listing_id: 'list_roblox_003',
      category_type: 'individual_game',
      platform_id: 'roblox',
      current_level: '2550 (Max Sea 3)',
      fighting_styles: 'Godhuman, Sanguine Art, Dragon Talon',
      mythical_fruits: 'Permanent Kitsune, Permanent Buddha, Permanent Portal',
      gamepasses: 'Dark Blade v3, 2x Money, 2x Mastery, Fast Boats, Fruit Notifier',
      skins: [
        { name: 'Permanent Kitsune Fruit (4,000 Robux)', tier: 'Permanent Mythical', value: 1400 },
        { name: 'Fruit Notifier Gamepass (2,700 Robux)', tier: 'Gamepass', value: 950 },
        { name: 'Dark Blade v3 (Slayer Skin Unlocked)', tier: 'Mythical Sword', value: 600 },
        { name: 'Cursed Dual Katana (CDK) + Soul Guitar Max Mastery', tier: 'Endgame Weapon', value: 550 }
      ],
      estimated_market_value: 3800.00
    });

    this.inventorySpecs.set('list_roblox_014', {
      listing_id: 'list_roblox_014',
      category_type: 'individual_game',
      platform_id: 'roblox',
      current_level: '2550 (Max Level + 30M Bounty)',
      fighting_styles: 'Sanguine Art, Godhuman (All 600 Mastery)',
      mythical_fruits: 'Permanent Dragon, Permanent Kitsune, Permanent Dough (Awakened)',
      gamepasses: 'Korblox Deathspeaker, Headless Horseman, All Blox Fruits Gamepasses',
      skins: [
        { name: 'Headless Horseman Bundle (31,000 Robux)', tier: 'Limited Avatar', value: 3200 },
        { name: 'Korblox Deathspeaker Bundle (17,000 Robux)', tier: 'Avatar Bundle', value: 1900 },
        { name: 'Permanent Dragon Fruit (Rework Ready)', tier: 'Permanent Mythical', value: 1800 },
        { name: 'All 6 Races Awakened V4 (Full Gear Tier 10)', tier: 'Max Awakening', value: 900 }
      ],
      estimated_market_value: 7600.00
    });

    this.inventorySpecs.set('list_genshin_004', {
      listing_id: 'list_genshin_004',
      category_type: 'individual_game',
      platform_id: 'genshin',
      adventure_rank: 60,
      server: 'Asia (UID 800xxxxxx Day 1)',
      c6_characters: 'Furina C6R1, Raiden Shogun C2R1, Nahida C2R1',
      five_star_count: 28,
      deadlinks: 'Clean (No PSN / No Google / No Apple Linked)',
      username_set: 'Unset (Buyer can set custom Username)',
      skins: [
        { name: 'Furina C6 + Splendor of Tranquil Waters R1', tier: 'C6 Archon', value: 5500 },
        { name: 'Raiden Shogun C2 + Engulfing Lightning R1', tier: 'C2 Archon', value: 2400 },
        { name: 'Nahida C2 + A Thousand Floating Dreams R1', tier: 'C2 Archon', value: 2200 },
        { name: 'Hu Tao C1 + Staff of Homa R1', tier: 'Limited 5-Star', value: 1400 }
      ],
      estimated_market_value: 12500.00
    });

    this.inventorySpecs.set('list_genshin_015', {
      listing_id: 'list_genshin_015',
      category_type: 'individual_game',
      platform_id: 'genshin',
      adventure_rank: 60,
      server: 'Asia',
      c6_characters: 'Neuvillette C6R1, Arlecchino C2R1, Kazuha C2R1, Yelan C2R1',
      five_star_count: 34,
      deadlinks: 'Clean (No Deadlinks + All First Top-up Receipts Included)',
      username_set: 'Set (Original Email Included)',
      skins: [
        { name: 'Neuvillette C6 + Tome of the Eternal Flow R1', tier: 'C6 Sovereign', value: 6200 },
        { name: 'Arlecchino C2 + Crimson Moon\'s Semblance R1', tier: 'C2 Harbinger', value: 2800 },
        { name: 'Kaedehara Kazuha C2 + Freedom-Sworn R1', tier: 'C2 Support', value: 2100 },
        { name: '24,000 Primogems + 35 Intertwined Fates Saved', tier: 'Currency Reserve', value: 2900 }
      ],
      estimated_market_value: 14800.00
    });

    this.inventorySpecs.set('list_lol_011', {
      listing_id: 'list_lol_011',
      category_type: 'individual_game',
      platform_id: 'lol',
      rank: 'Challenger 845 LP (SEA Server)',
      region: 'SEA (Thailand / Singapore)',
      bind_type: 'Original Riot ID Email (Unlinked Socials)',
      trust_rating: 'A+ (Safe)',
      hero_count: 168,
      skin_count: 185,
      skins: [
        { name: 'Soul Fighter Samira + Elementalist Lux + DJ Sona', tier: 'Ultimate', value: 2800 },
        { name: 'Prestige Inkshadow Yasuo + Prestige Nightbringer Kayn', tier: 'Mythic Prestige', value: 3200 },
        { name: 'Hextech Swain + Ashen Knight Pyke (With Chroma)', tier: 'Mythic Gem', value: 2400 },
        { name: 'Victorious Skins Collection (5 Seasons)', tier: 'Ranked Limited', value: 1800 }
      ],
      estimated_market_value: 10800.00
    });

    this.inventorySpecs.set('list_lol_016', {
      listing_id: 'list_lol_016',
      category_type: 'individual_game',
      platform_id: 'lol',
      rank: 'Grandmaster 520 LP + TFT Master',
      region: 'SEA (Thailand / Singapore)',
      bind_type: 'Clean Original Email (OGE Included)',
      trust_rating: 'A+ (Safe)',
      hero_count: 168,
      skin_count: 310,
      skins: [
        { name: 'Immortalized Legend Ahri (Faker Hall of Legends Signature)', tier: 'Transcendent', value: 7500 },
        { name: 'TFT Chibi Dragonmancer Yasuo + Soul Fighter Arena', tier: 'TFT Mythic', value: 3200 },
        { name: '22x Mythic Prestige Skins Collection', tier: 'Mythic Prestige', value: 3800 }
      ],
      estimated_market_value: 14500.00
    });

    this.inventorySpecs.set('list_steam_005', {
      listing_id: 'list_steam_005',
      category_type: 'game_library',
      platform_id: 'steam_library',
      total_games_count: 154,
      steam_level: 62,
      vac_status: 'Clean (Zero Bans / Good Standing)',
      cs2_prime_status: 'CS2 Prime Enabled (6 Years Service Medals)',
      notable_aaa_games: 'Black Myth: Wukong, Elden Ring, Cyberpunk 2077, GTA V, Red Dead Redemption 2, Monster Hunter World: Iceborne',
      skins: [
        { name: 'Black Myth: Wukong Deluxe Edition', tier: 'AAA Game', value: 2100 },
        { name: 'Elden Ring + Shadow of the Erdtree Bundle', tier: 'AAA Game', value: 2390 },
        { name: 'Cyberpunk 2077 + Phantom Liberty Complete', tier: 'AAA Game', value: 2190 },
        { name: 'Counter-Strike 2 Prime + 6 Service Medals', tier: 'Premier Status', value: 1800 },
        { name: 'Red Dead Redemption 2 Ultimate + 149 Full Games', tier: 'Steam Library', value: 7800 }
      ],
      estimated_market_value: 16200.00
    });

    this.inventorySpecs.set('list_steam_017', {
      listing_id: 'list_steam_017',
      category_type: 'game_library',
      platform_id: 'steam_library',
      total_games_count: 240,
      steam_level: 88,
      vac_status: 'Clean (Zero Bans / First CD-Key Included)',
      cs2_prime_status: 'CS2 Prime Enabled + Loyalty Badge',
      notable_aaa_games: 'Baldur\'s Gate 3, Elden Ring + DLC, Sekiro, Ghost of Tsushima, Helldivers 2, Resident Evil 4 Remake',
      skins: [
        { name: 'Baldur\'s Gate 3 Digital Deluxe Edition', tier: 'GOTY AAA', value: 2090 },
        { name: 'Elden Ring Shadow of the Erdtree Collector', tier: 'GOTY AAA', value: 2390 },
        { name: 'Ghost of Tsushima Director\'s Cut + Sekiro GOTY', tier: 'Action AAA', value: 3400 },
        { name: 'Helldivers 2 Super Citizen + RE4 Remake Gold', tier: 'Co-op AAA', value: 2900 },
        { name: '234 Additional Purchased Steam Games + DLCs', tier: 'Full Library', value: 9500 }
      ],
      estimated_market_value: 20280.00
    });

    this.inventorySpecs.set('list_psn_006', {
      listing_id: 'list_psn_006',
      category_type: 'game_library',
      platform_id: 'psn',
      psn_region: 'TH (Zone 3 Thailand Store)',
      ps_plus_tier: 'PlayStation Plus Deluxe (Active)',
      ps_plus_expiry_date: '2028-10-31',
      platinum_trophy_count: 22,
      has_dob: 'Yes (Original Date of Birth & Security Answers Provided)',
      skins: [
        { name: 'God of War Ragnarok + Valhalla (PS5 Digital)', tier: 'PS5 Exclusive', value: 2290 },
        { name: 'Marvel\'s Spider-Man 2 Deluxe Edition (PS5)', tier: 'PS5 Exclusive', value: 2490 },
        { name: 'Final Fantasy VII Rebirth Digital Deluxe', tier: 'PS5 Exclusive', value: 2690 },
        { name: 'PlayStation Plus Deluxe Subscription (24 Months Remaining)', tier: 'Subscription', value: 4200 }
      ],
      estimated_market_value: 10500.00
    });

    this.inventorySpecs.set('list_cs2_item_007', {
      listing_id: 'list_cs2_item_007',
      category_type: 'ingame_item',
      platform_id: 'cs2_item',
      item_name: 'Butterfly Knife Fade (Factory New - Float 0.015)',
      item_category: 'Covert Knife Skin (99.2% Full Fade Pattern)',
      quantity: '1 ชิ้น (ปลอด Trade Lock พร้อมส่งทันที)',
      server_and_channel: 'Global Steam Network (CS2 Inventory)',
      trade_delivery_method: 'Steam Trade Offer URL (Verified API)',
      seller_in_game_id: 'https://steamcommunity.com/tradeoffer/new/?partner=9182371&token=VaultDemo',
      delivery_instructions: 'ส่งคำขอแลกเปลี่ยนผ่าน Steam Trade Offer ทันทีเมื่อระบบล็อกเงินในห้อง Escrow เรียบร้อย',
      skins: [
        { name: 'Butterfly Knife | Fade (Factory New, Float 0.0152)', tier: 'Covert Knife', value: 19500 }
      ],
      estimated_market_value: 19500.00
    });

    this.inventorySpecs.set('list_cs2_item_018', {
      listing_id: 'list_cs2_item_018',
      category_type: 'ingame_item',
      platform_id: 'cs2_item',
      item_name: 'Karambit Doppler Phase 2 (FN 0.008) + Sport Gloves Vice (FT)',
      item_category: 'Covert Knife & Gloves Combo Set',
      quantity: '2 ชิ้น (มีด Karambit + ถุงมือ Vice)',
      server_and_channel: 'Global Steam Network (CS2 Inventory)',
      trade_delivery_method: 'Steam Trade Offer URL (Instant P2P)',
      seller_in_game_id: 'https://steamcommunity.com/tradeoffer/new/?partner=8841205&token=SiamVaultCS2',
      delivery_instructions: 'ส่งเทรดทั้ง 2 ชิ้นใน Trade Offer เดียวกัน คนกลางตรวจสอบ Float และ Pattern Seed ก่อนอนุมัติ',
      skins: [
        { name: 'Karambit | Doppler Phase 2 Pink Galaxy (FN 0.008)', tier: 'Covert Knife', value: 19500 },
        { name: 'Sport Gloves | Vice (Field-Tested 0.21 Clean Knuckles)', tier: 'Extraordinary Gloves', value: 10800 }
      ],
      estimated_market_value: 30300.00
    });

    this.inventorySpecs.set('list_bloxfruit_008', {
      listing_id: 'list_bloxfruit_008',
      category_type: 'ingame_item',
      platform_id: 'roblox_item',
      item_name: 'Physical Kitsune Fruit + East Dragon Fruit',
      item_category: 'Mythical Physical Fruits (Tradeable Box)',
      quantity: '2 ผล (Kitsune 1 ผล + Dragon 1 ผล)',
      server_and_channel: 'Sea 3, Mansion Trade Table (Private Server Provided)',
      trade_delivery_method: 'In-Game Trade Table Meetup',
      seller_in_game_id: 'ProFruitTrader_TH',
      delivery_instructions: 'นัดเจอที่แมนชั่นในเซิร์ฟส่วนตัวของผู้ขาย ผู้ซื้อเตรียมผลขยะมูลค่ารวม 40% เพื่อวางแลกตามระบบเกม',
      skins: [
        { name: 'Physical Kitsune Fruit (In-Box Tradeable)', tier: 'Mythical Fruit', value: 700 },
        { name: 'Physical East Dragon Fruit (In-Box Tradeable)', tier: 'Mythical Fruit', value: 650 }
      ],
      estimated_market_value: 1350.00
    });

    this.inventorySpecs.set('list_ro_zeny_009', {
      listing_id: 'list_ro_zeny_009',
      category_type: 'ingame_item',
      platform_id: 'ragnarok_item',
      item_name: '100,000,000 Zeny (100M) + 2x Hydra Card',
      item_category: 'In-Game Currency & Boss Cards',
      quantity: '100M Zeny + การ์ดไฮดรา 2 ใบ',
      server_and_channel: 'Server: Freya, Channel: Morroc-01 (พิกัด 124, 85)',
      trade_delivery_method: 'Direct In-Game Deal Window',
      seller_in_game_id: 'ZenyMaster99',
      delivery_instructions: 'เปิดหน้าต่างเทรดตรงตัวต่อตัวในเมือง Morroc ตรวจสอบชื่อตัวละครให้ตรงเป๊ะก่อนกดยืนยัน',
      skins: [
        { name: '100,000,000 Zeny (Hand-Farmed Clean Currency)', tier: 'Currency', value: 3800 },
        { name: '2x Hydra Card (+20% Demi-Human Damage)', tier: 'Rare Card', value: 1000 }
      ],
      estimated_market_value: 4800.00
    });

    this.inventorySpecs.set('list_poe_010', {
      listing_id: 'list_poe_010',
      category_type: 'ingame_item',
      platform_id: 'poe_item',
      item_name: '50x Divine Orbs + Mageblood Heavy Belt (4 Flask)',
      item_category: 'League Currency & Tier-0 Unique Belt',
      quantity: '50 Divine Orbs + 1x Mageblood Belt',
      server_and_channel: 'Settlers of Kalguur League (PC Global Realm)',
      trade_delivery_method: 'Hideout Party Invite & Trade Window',
      seller_in_game_id: 'DivineFarmer_TH',
      delivery_instructions: 'ชวนปาร์ตี้เข้ามายัง Hideout ผู้ขาย และเปิดหน้าต่างเทรดวางไอเทมครบในครั้งเดียว',
      skins: [
        { name: 'Mageblood Heavy Belt (Corrupted Blood Immune / 4 Magic Utility Flasks)', tier: 'Tier-0 Unique', value: 1450 },
        { name: '50x Divine Orbs Stack', tier: 'High Currency', value: 950 }
      ],
      estimated_market_value: 2400.00
    });

    // 4. Seed Blacklist (Known Fraudsters)
    this.blacklist.push(
      {
        blacklist_id: 'bl_001',
        scammer_name: 'นายกิตติศักดิ์ โกงเนียน',
        bank_account_number: '123-4-56789-0',
        bank_name: 'ธนาคารกสิกรไทย (KBANK)',
        game_uid: 'VAL#9981',
        scam_method: 'รับเงินแล้วไม่ส่งมอบรหัสผ่าน และโคลนเฟสบุ๊คคนกลางปลอม',
        reported_at: '2026-09-12'
      },
      {
        blacklist_id: 'bl_002',
        scammer_name: 'นายชลธี ดึงคืน',
        bank_account_number: '987-6-54321-9',
        bank_name: 'ธนาคารไทยพาณิชย์ (SCB)',
        game_uid: 'ROV_UID_44521',
        scam_method: 'ขายไอดีสำเร็จแล้ว 3 วัน ทำเรื่องแจ้งกู้คืนไอดีผ่านอีเมลสำรอง',
        reported_at: '2026-10-02'
      }
    );

    // 5. Seed KYC Verifications
    this.kycRecords.set('kyc_01', {
      kyc_id: 'kyc_01',
      user_id: 'user_seller_01',
      full_name_th: 'นาย อารมณ์ นักเล่นเกม',
      id_card_number: '1100500123456',
      id_card_image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
      selfie_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      status: 'approved',
      rejection_reason: null,
      reviewed_by: 'user_inspector_01',
      submitted_at: '2026-10-15T10:00:00.000Z',
      reviewed_at: '2026-10-15T10:30:00.000Z'
    });

    this.kycRecords.set('kyc_02', {
      kyc_id: 'kyc_02',
      user_id: 'user_buyer_01',
      full_name_th: 'นาย นนท์ นิยมเกม',
      id_card_number: '1103700987654',
      id_card_image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
      selfie_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      status: 'approved',
      rejection_reason: null,
      reviewed_by: 'user_inspector_01',
      submitted_at: '2026-10-17T11:00:00.000Z',
      reviewed_at: '2026-10-17T11:20:00.000Z'
    });

    // 6. Seed User Bank Accounts
    this.bankAccounts.set('acc_seller_01', {
      account_id: 'acc_seller_01',
      user_id: 'user_seller_01',
      bank_name: 'KBANK',
      account_number: '045-2-89211-4',
      account_holder_name: 'นาย อารมณ์ นักเล่นเกม',
      is_primary: true,
      created_at: '2026-10-10T12:00:00.000Z'
    });

    this.bankAccounts.set('acc_buyer_01', {
      account_id: 'acc_buyer_01',
      user_id: 'user_buyer_01',
      bank_name: 'PROMPTPAY',
      account_number: '081-999-8877',
      account_holder_name: 'นาย นนท์ นิยมเกม',
      is_primary: true,
      created_at: '2026-10-12T14:00:00.000Z'
    });

    // 7. Seed Demo Item Chat & Offer (Negotiation on CS2 Knife)
    const threadId = 'thread_cs2_buyer_seller';
    const offerId = 'offer_cs2_demo_01';

    const demoOffer = {
      offer_id: offerId,
      thread_id: threadId,
      listing_id: 'list_cs2_item_007',
      buyer_id: 'user_buyer_01',
      seller_id: 'user_seller_01',
      offered_price: 17200.00,
      original_price: 18500.00,
      discount_amount: 1300.00,
      discount_percent: 7.03,
      status: 'accepted',
      escrow_id: null,
      message: 'ผมสนใจมีดชิ้นนี้ครับ ขอลดเหลือ 17,200 บาท พร้อมโอนเข้า Escrow ทันทีครับ',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      resolved_at: new Date(Date.now() - 1800000).toISOString()
    };

    this.offers.set(offerId, demoOffer);

    this.itemChats.set(threadId, {
      thread_id: threadId,
      listing_id: 'list_cs2_item_007',
      listing_title: 'CS2 Butterfly Knife Fade (Factory New) 99.2% Fade Pattern | ส่งมอบผ่าน Steam Trade URL',
      buyer_id: 'user_buyer_01',
      seller_id: 'user_seller_01',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 1800000).toISOString(),
      active_offer_id: offerId,
      messages: [
        {
          message_id: 'msg_001',
          sender_id: 'user_buyer_01',
          sender_name: 'Nont (Trader TH)',
          role: 'buyer',
          text: 'สวัสดีครับ มีดเล่มนี้มีติด Trade Hold ไหมครับ และลดราคาได้เท่าไหร่ครับ',
          created_at: new Date(Date.now() - 7000000).toISOString()
        },
        {
          message_id: 'msg_002',
          sender_id: 'user_seller_01',
          sender_name: 'Arm_ProGamerTH',
          role: 'seller',
          text: 'สวัสดีครับ ปลอด Trade Hold พร้อมส่งทาง Steam Trade Offer ได้ทันทีครับ ลองเสนอราคามาได้เลยครับ',
          created_at: new Date(Date.now() - 6000000).toISOString()
        },
        {
          message_id: 'msg_003',
          sender_id: 'user_buyer_01',
          sender_name: 'Nont (Trader TH)',
          role: 'buyer',
          text: '[ข้อเสนอราคา] ยื่นข้อเสนอต่อรองราคา 17,200 บาท (จาก 18,500 บาท)',
          offer_id: offerId,
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          message_id: 'msg_004',
          sender_id: 'user_seller_01',
          sender_name: 'Arm_ProGamerTH',
          role: 'seller',
          text: '[ยอมรับข้อเสนอ] ผู้ขายตกลงรับข้อเสนอ 17,200 บาท สามารถกดยืนยันชำระเงินเข้า Escrow ได้ทันทีครับ',
          offer_id: offerId,
          created_at: new Date(Date.now() - 1800000).toISOString()
        }
      ]
    });

    // 7.2 Seed Demo Item Chat #2 (Valorant Immortal 2 - Pending Offer)
    const threadValId = 'thread_val_buyer_seller';
    const offerValId = 'offer_val_demo_02';
    this.offers.set(offerValId, {
      offer_id: offerValId,
      thread_id: threadValId,
      listing_id: 'list_val_001',
      buyer_id: 'user_buyer_01',
      seller_id: 'user_seller_01',
      offered_price: 6900.00,
      original_price: 7500.00,
      discount_amount: 600.00,
      discount_percent: 8.00,
      status: 'pending',
      escrow_id: null,
      message: 'สนใจไอดี Valorant ครับ ขอต่อที่ 6,900 บาท ถ้าโอเคพร้อมล็อกเงินเลยครับ',
      created_at: new Date(Date.now() - 900000).toISOString(),
      resolved_at: null
    });

    this.itemChats.set(threadValId, {
      thread_id: threadValId,
      listing_id: 'list_val_001',
      listing_title: 'ID Valorant Immortal 2 | Kuronami Vandal + Champions 2024 Karambit (Clean OGE)',
      buyer_id: 'user_buyer_01',
      seller_id: 'user_seller_01',
      created_at: new Date(Date.now() - 1500000).toISOString(),
      updated_at: new Date(Date.now() - 900000).toISOString(),
      active_offer_id: offerValId,
      messages: [
        {
          message_id: 'msg_val_01',
          sender_id: 'user_buyer_01',
          sender_name: 'Nont (Trader TH)',
          role: 'buyer',
          text: 'ไอดีนี้มีใบเสร็จเติมเงินแรก (First Receipt) ให้ด้วยไหมครับ?',
          created_at: new Date(Date.now() - 1400000).toISOString()
        },
        {
          message_id: 'msg_val_02',
          sender_id: 'user_seller_01',
          sender_name: 'Arm_ProGamerTH',
          role: 'seller',
          text: 'มีครบครับ ส่งมอบเมลต้นฉบับ (Clean OGE) พร้อมประวัติใบเสร็จผ่านแอดมินห้อง Escrow ได้เลยครับ',
          created_at: new Date(Date.now() - 1100000).toISOString()
        },
        {
          message_id: 'msg_val_03',
          sender_id: 'user_buyer_01',
          sender_name: 'Nont (Trader TH)',
          role: 'buyer',
          text: '[ยื่นข้อเสนอราคา] ยื่นข้อเสนอต่อรองราคา ฿6,900.00 (ลด 8%) • "พร้อมล็อกเงินเลยครับ"',
          offer_id: offerValId,
          created_at: new Date(Date.now() - 900000).toISOString()
        }
      ]
    });

    // 7.3 Seed Demo Item Chat #3 (RoV Supreme - Countered Offer)
    const threadRovId = 'thread_rov_buyer_seller';
    const offerRovId = 'offer_rov_demo_03';
    this.offers.set(offerRovId, {
      offer_id: offerRovId,
      thread_id: threadRovId,
      listing_id: 'list_rov_002',
      buyer_id: 'user_buyer_01',
      seller_id: 'user_seller_01',
      offered_price: 4900.00,
      original_price: 5200.00,
      discount_amount: 300.00,
      discount_percent: 5.77,
      status: 'countered',
      escrow_id: null,
      message: 'ลดได้สุดๆ ที่ 4,900 บาทครับ รูนครบสกินครบ',
      created_at: new Date(Date.now() - 2400000).toISOString(),
      resolved_at: null
    });

    this.itemChats.set(threadRovId, {
      thread_id: threadRovId,
      listing_id: 'list_rov_002',
      listing_title: 'ไอดี ROV Supreme 65 ดาว | Murad ร่าง Dimension Breaker + สกิน SS 18 ตัว',
      buyer_id: 'user_buyer_01',
      seller_id: 'user_seller_01',
      created_at: new Date(Date.now() - 3200000).toISOString(),
      updated_at: new Date(Date.now() - 2000000).toISOString(),
      active_offer_id: offerRovId,
      messages: [
        {
          message_id: 'msg_rov_01',
          sender_id: 'user_buyer_01',
          sender_name: 'Nont (Trader TH)',
          role: 'buyer',
          text: 'การีน่าติดเบอร์หรือเฟสบุ๊คไหมครับ ขอลดเหลือ 4,600 ได้ไหมครับ',
          created_at: new Date(Date.now() - 3000000).toISOString()
        },
        {
          message_id: 'msg_rov_02',
          sender_id: 'user_seller_01',
          sender_name: 'Arm_ProGamerTH',
          role: 'seller',
          text: '[ข้อเสนอสวนกลับ] ผู้ขายเสนอราคาใหม่ที่ ฿4,900.00 บาท (ลด 5.77%) การีน่าสะอาดเปลี่ยนเบอร์ในห้องคนกลางได้ทันทีครับ',
          offer_id: offerRovId,
          created_at: new Date(Date.now() - 2000000).toISOString()
        }
      ]
    });

    // 8. Seed Public Community Trading Lobby Messages (ห้องแชทรวมตลาดกลาง)
    this.publicLobbyMessages = [
      {
        message_id: 'pub_001',
        sender_id: 'user_inspector_01',
        sender_name: 'Admin_Inspector_01 (Certified Middleman)',
        role: 'inspector',
        trust_score: 100,
        tag: 'SYSTEM PIN',
        text: 'ประกาศ: ห้องแชทรวมเปิดให้พูดคุย ประกาศตามหาไอดี (WTB) และแนะนำรายการขาย (WTS) ห้ามส่งเลขบัญชีหรือชวนโอนตรงนอกระบบ Escrow เด็ดขาด',
        linked_listing_id: null,
        created_at: new Date(Date.now() - 5400000).toISOString()
      },
      {
        message_id: 'pub_002',
        sender_id: 'user_seller_01',
        sender_name: 'Arm_ProGamerTH',
        role: 'seller',
        trust_score: 95,
        tag: 'WTS / ขาย',
        text: 'ปล่อยมีด CS2 Butterfly Knife Fade (FN 99.2%) และไอดี Valorant Immortal 2 เมลสะอาด ทักแชทต่อรองราคาหรือกดเข้าห้อง Escrow ได้เลยครับ',
        linked_listing_id: 'list_cs2_item_007',
        created_at: new Date(Date.now() - 2800000).toISOString()
      },
      {
        message_id: 'pub_003',
        sender_id: 'user_buyer_01',
        sender_name: 'Nont (Trader TH)',
        role: 'buyer',
        trust_score: 98,
        tag: 'WTB / ตั้งรับ',
        text: 'ตั้งรับไอดี Genshin Impact AR60 ที่มี Furina C6 หรือไอดี Valorant ที่มี Kuronami Vandal งบ 7,000 - 12,000 บาท รับผ่านระบบ Escrow เท่านั้นครับ',
        linked_listing_id: 'list_genshin_004',
        created_at: new Date(Date.now() - 1200000).toISOString()
      }
    ];

    // 9. Seed Initial Double-Entry Ledger Transactions (สมุดบัญชีประวัติเงินเข้า-ออกเริ่มต้น)
    this.ledgers.push(
      {
        ledger_id: 'led_init_001',
        entry_id: 'led_init_001',
        user_id: 'user_buyer_01',
        escrow_id: null,
        entry_type: 'topup',
        type: 'TOPUP_PROMPTPAY',
        debit_account: 'PROMPTPAY_GATEWAY (081-999-8877)',
        credit_account: 'WALLET:user_buyer_01 (Nont)',
        description: 'เติมเงินเข้ากระเป๋าผ่าน Thai QR PromptPay',
        amount: 50000.00,
        balance_before: 0.00,
        balance_after: 50000.00,
        created_at: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        ledger_id: 'led_init_002',
        entry_id: 'led_init_002',
        user_id: 'user_buyer_01',
        escrow_id: 'escrow_prev_881',
        entry_type: 'escrow_lock',
        type: 'ESCROW_LOCK',
        debit_account: 'WALLET:user_buyer_01 (Nont)',
        credit_account: 'VAULT_ESCROW_LOCK:escrow_prev_881',
        description: 'พักเงินค้ำประกันซื้อไอดี Valorant Ascendant 2 (Escrow #escrow_prev_881)',
        amount: -15000.00,
        balance_before: 50000.00,
        balance_after: 35000.00,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        ledger_id: 'led_init_003',
        entry_id: 'led_init_003',
        user_id: 'user_seller_01',
        escrow_id: 'escrow_prev_881',
        entry_type: 'escrow_release',
        type: 'ESCROW_RELEASE_PAYOUT',
        debit_account: 'VAULT_ESCROW_LOCK:escrow_prev_881',
        credit_account: 'WALLET:user_seller_01 (Arm_ProGamerTH)',
        description: 'รับเงินสุทธิจากการขายไอดีสำเร็จผ่านห้องคนกลาง (หักค่าธรรมเนียม 6.5%)',
        amount: 14025.00,
        balance_before: 1475.00,
        balance_after: 15500.00,
        created_at: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString()
      },
      {
        ledger_id: 'led_init_004',
        entry_id: 'led_init_004',
        user_id: 'user_seller_01',
        escrow_id: null,
        entry_type: 'withdrawal',
        type: 'BANK_WITHDRAWAL',
        debit_account: 'WALLET:user_seller_01 (Arm_ProGamerTH)',
        credit_account: 'KBANK (045-2-89211-4)',
        description: 'ถอนเงินรายได้จากการขายเข้าบัญชีธนาคารกสิกรไทย (KBANK)',
        amount: -14000.00,
        balance_before: 15500.00,
        balance_after: 1500.00,
        created_at: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        ledger_id: 'led_init_005',
        entry_id: 'led_init_005',
        user_id: 'user_owner_01',
        escrow_id: 'escrow_prev_881',
        entry_type: 'commission_revenue',
        type: 'PLATFORM_COMMISSION',
        debit_account: 'VAULT_ESCROW_LOCK:escrow_prev_881',
        credit_account: 'PLATFORM_REVENUE:user_owner_01',
        description: 'รายได้ค่าธรรมเนียมคนกลาง Escrow 6.5% จากสัญญา #escrow_prev_881',
        amount: 975.00,
        balance_before: 44025.00,
        balance_after: 45000.00,
        created_at: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString()
      }
    );
  }

  // ==========================================
  // ITEM-BOUND CHAT & NEGOTIATION WORKFLOW
  // ==========================================

  getOrCreateItemChatThread(listingId, buyerId) {
    const listing = this.listings.get(listingId);
    if (!listing) throw new Error('Listing not found');

    const buyer = this.users.get(buyerId);
    if (!buyer) throw new Error('Buyer not found');

    if (listing.seller_id === buyerId) {
      throw new Error('ผู้ขายไม่สามารถเปิดห้องแชทกับรายการขายของตนเองได้');
    }

    // Check existing thread between this buyer and listing
    const existing = Array.from(this.itemChats.values()).find(
      t => t.listing_id === listingId && t.buyer_id === buyerId
    );
    if (existing) return existing;

    const threadId = `thread_${listingId}_${buyerId.substring(5, 12)}`;
    const newThread = {
      thread_id: threadId,
      listing_id: listingId,
      listing_title: listing.title,
      buyer_id: buyerId,
      seller_id: listing.seller_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active_offer_id: null,
      messages: [
        {
          message_id: `msg_${uuidv4().substring(0, 8)}`,
          sender_id: 'system',
          sender_name: 'System Vault',
          role: 'system',
          text: `[ระบบเริ่มต้น] ห้องแชทเจรจาสินค้ารายการ "${listing.title}" เริ่มต้นขึ้นแล้ว ผู้ซื้อสามารถพูดคุย สอบถามข้อมูล หรือยื่นข้อเสนอต่อรองราคาได้ที่นี่`,
          created_at: new Date().toISOString()
        }
      ]
    };

    this.itemChats.set(threadId, newThread);
    return newThread;
  }

  getItemChatThread(threadId) {
    const thread = this.itemChats.get(threadId);
    if (!thread) return null;

    const listing = this.listings.get(thread.listing_id);
    const buyer = this.users.get(thread.buyer_id);
    const seller = this.users.get(thread.seller_id);
    const activeOffer = thread.active_offer_id ? this.offers.get(thread.active_offer_id) : null;

    return {
      ...thread,
      listing: listing || null,
      buyer: buyer ? { user_id: buyer.user_id, display_name: buyer.display_name, trust_score: buyer.trust_score, is_verified: buyer.is_verified } : null,
      seller: seller ? { user_id: seller.user_id, display_name: seller.display_name, trust_score: seller.trust_score, is_verified: seller.is_verified } : null,
      active_offer: activeOffer || null
    };
  }

  getUserChatThreads(userId) {
    const user = this.users.get(userId);
    const isAdminOrInspector = user && (user.role === 'inspector' || user.role === 'owner' || user.role === 'admin');
    const list = Array.from(this.itemChats.values()).filter(
      t => isAdminOrInspector || t.buyer_id === userId || t.seller_id === userId
    );

    return list.map(thread => {
      const listing = this.listings.get(thread.listing_id);
      const otherUser = this.users.get(thread.buyer_id === userId ? thread.seller_id : thread.buyer_id);
      const lastMsg = thread.messages[thread.messages.length - 1];
      const activeOffer = thread.active_offer_id ? this.offers.get(thread.active_offer_id) : null;

      return {
        thread_id: thread.thread_id,
        listing_id: thread.listing_id,
        listing_title: listing ? listing.title : thread.listing_title,
        listing_price: listing ? listing.asking_price : 0,
        listing_status: listing ? listing.status : 'unknown',
        listing_category: listing ? listing.category_type : 'individual_game',
        platform_id: listing ? listing.platform_id : 'custom',
        game_type: listing ? listing.game_type : 'GAME',
        other_user: otherUser ? { user_id: otherUser.user_id, display_name: otherUser.display_name, trust_score: otherUser.trust_score } : null,
        my_role: thread.buyer_id === userId ? 'buyer' : (thread.seller_id === userId ? 'seller' : 'inspector'),
        last_message: lastMsg ? lastMsg.text : '',
        last_message_at: lastMsg ? lastMsg.created_at : thread.created_at,
        message_count: thread.messages.length,
        active_offer: activeOffer || null,
        updated_at: thread.updated_at
      };
    }).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }

  getPublicLobbyMessages() {
    return this.publicLobbyMessages || [];
  }

  sendPublicLobbyMessage({ senderId, text, tag = 'CHAT', linkedListingId = null }) {
    const sender = this.users.get(senderId) || {
      user_id: senderId || 'user_buyer_01',
      display_name: 'Trader',
      role: 'user',
      trust_score: 95
    };
    const msg = {
      message_id: `pub_${uuidv4().substring(0, 8)}`,
      sender_id: sender.user_id,
      sender_name: sender.display_name,
      role: sender.role,
      trust_score: sender.trust_score || 98,
      tag,
      text: text.trim(),
      linked_listing_id: linkedListingId || null,
      created_at: new Date().toISOString()
    };
    this.publicLobbyMessages.push(msg);
    return msg;
  }

  sendItemChatMessage(threadId, senderId, text) {
    const thread = this.itemChats.get(threadId);
    if (!thread) throw new Error('Chat thread not found');

    const sender = this.users.get(senderId);
    const role = (senderId === thread.buyer_id) ? 'buyer' : (senderId === thread.seller_id ? 'seller' : 'inspector');

    const newMsg = {
      message_id: `msg_${uuidv4().substring(0, 8)}`,
      sender_id: senderId,
      sender_name: sender ? sender.display_name : 'User',
      role,
      text: text.trim(),
      created_at: new Date().toISOString()
    };

    thread.messages.push(newMsg);
    thread.updated_at = new Date().toISOString();
    return newMsg;
  }

  createOffer({ threadId, buyerId, offeredPrice, message = '' }) {
    const thread = this.itemChats.get(threadId);
    if (!thread) throw new Error('Chat thread not found');
    if (thread.buyer_id !== buyerId) throw new Error('เฉพาะผู้ซื้อเท่านั้นที่สามารถยื่นข้อเสนอต่อรองราคาได้');

    const listing = this.listings.get(thread.listing_id);
    if (!listing) throw new Error('Listing not found');
    if (listing.status !== 'available') throw new Error(`ไม่สามารถยื่นข้อเสนอได้เนื่องจากสินค้าอยู่ในสถานะ ${listing.status}`);
    if (listing.negotiable === false) throw new Error('สินค้ารายการนี้ผู้ขายระบุงดต่อรองราคา');

    const offerPriceNum = Number(offeredPrice);
    if (isNaN(offerPriceNum) || offerPriceNum <= 0) {
      throw new Error('กรุณาระบุราคาที่ถูกต้อง');
    }
    if (offerPriceNum >= listing.asking_price) {
      throw new Error(`ราคาที่ต่อรองต้องน้อยกว่าราคาขายปัจจุบัน (฿${listing.asking_price.toFixed(2)})`);
    }

    const offerId = `offer_${uuidv4().substring(0, 8)}`;
    const discountAmount = +(listing.asking_price - offerPriceNum).toFixed(2);
    const discountPercent = +((discountAmount / listing.asking_price) * 100).toFixed(2);

    const offer = {
      offer_id: offerId,
      thread_id: threadId,
      listing_id: listing.listing_id,
      buyer_id: buyerId,
      seller_id: listing.seller_id,
      offered_price: offerPriceNum,
      original_price: listing.asking_price,
      discount_amount: discountAmount,
      discount_percent: discountPercent,
      status: 'pending',
      escrow_id: null,
      message: message.trim() || `ขอต่อรองราคาเป็น ฿${offerPriceNum.toFixed(2)} บาท`,
      created_at: new Date().toISOString(),
      resolved_at: null
    };

    this.offers.set(offerId, offer);
    thread.active_offer_id = offerId;
    thread.updated_at = new Date().toISOString();

    const buyer = this.users.get(buyerId);
    thread.messages.push({
      message_id: `msg_${uuidv4().substring(0, 8)}`,
      sender_id: buyerId,
      sender_name: buyer ? buyer.display_name : 'Buyer',
      role: 'buyer',
      text: `[ยื่นข้อเสนอราคา] ยื่นข้อเสนอต่อรองราคา ฿${offerPriceNum.toFixed(2)} (ลด ${discountPercent}%) ${message ? `• "${message}"` : ''}`,
      offer_id: offerId,
      created_at: new Date().toISOString()
    });

    return offer;
  }

  respondToOffer({ offerId, userId, action, counterPrice = null }) {
    const offer = this.offers.get(offerId);
    if (!offer) throw new Error('Offer not found');
    if (offer.status !== 'pending' && offer.status !== 'countered') {
      throw new Error(`ข้อเสนอนี้ไม่อยู่ในสถานะที่ตอบรับได้ (สถานะปัจจุบัน: ${offer.status})`);
    }

    const thread = this.itemChats.get(offer.thread_id);
    if (!thread) throw new Error('Thread not found');

    if (action === 'accept') {
      if (offer.status === 'countered') {
        if (offer.buyer_id !== userId) throw new Error('เฉพาะผู้ซื้อเท่านั้นที่สามารถยอมรับข้อเสนอสวนกลับได้');
      } else {
        if (offer.seller_id !== userId) throw new Error('เฉพาะผู้ขายเท่านั้นที่สามารถกดตอบรับข้อเสนอได้');
      }
      offer.status = 'accepted';
      offer.resolved_at = new Date().toISOString();

      const responder = this.users.get(userId);
      thread.messages.push({
        message_id: `msg_${uuidv4().substring(0, 8)}`,
        sender_id: userId,
        sender_name: responder ? responder.display_name : (offer.status === 'countered' ? 'Buyer' : 'Seller'),
        role: offer.status === 'countered' ? 'buyer' : 'seller',
        text: `[ยอมรับข้อเสนอ] ตกลงรับราคา ฿${offer.offered_price.toFixed(2)} บาท! ผู้ซื้อสามารถเริ่มสัญญา Escrow ได้ทันทีในราคานี้`,
        offer_id: offerId,
        created_at: new Date().toISOString()
      });
    } else if (action === 'decline') {
      if (offer.seller_id !== userId && offer.buyer_id !== userId) {
        throw new Error('เฉพาะคู่สัญญาเท่านั้นที่สามารถปฏิเสธข้อเสนอได้');
      }
      offer.status = 'declined';
      offer.resolved_at = new Date().toISOString();

      const responder = this.users.get(userId);
      thread.messages.push({
        message_id: `msg_${uuidv4().substring(0, 8)}`,
        sender_id: userId,
        sender_name: responder ? responder.display_name : 'User',
        role: userId === offer.buyer_id ? 'buyer' : 'seller',
        text: `[ปฏิเสธข้อเสนอ] ขอปฏิเสธข้อเสนอราคา ฿${offer.offered_price.toFixed(2)} บาท`,
        offer_id: offerId,
        created_at: new Date().toISOString()
      });
    } else if (action === 'counter') {
      if (offer.seller_id !== userId) throw new Error('เฉพาะผู้ขายเท่านั้นที่สามารถยื่นข้อเสนอสวนกลับได้');
      const counterNum = Number(counterPrice);
      if (isNaN(counterNum) || counterNum <= offer.offered_price || counterNum >= offer.original_price) {
        throw new Error(`ราคาเสนอสวนกลับต้องอยู่ระหว่างราคาที่ต่อรอง (฿${offer.offered_price}) ถึงราคาตั้งต้น (฿${offer.original_price})`);
      }

      offer.offered_price = counterNum;
      offer.discount_amount = +(offer.original_price - counterNum).toFixed(2);
      offer.discount_percent = +((offer.discount_amount / offer.original_price) * 100).toFixed(2);
      offer.status = 'countered';

      const seller = this.users.get(userId);
      thread.messages.push({
        message_id: `msg_${uuidv4().substring(0, 8)}`,
        sender_id: userId,
        sender_name: seller ? seller.display_name : 'Seller',
        role: 'seller',
        text: `[ข้อเสนอสวนกลับ] ผู้ขายเสนอราคาใหม่ที่ ฿${counterNum.toFixed(2)} บาท (ลด ${offer.discount_percent}%) ผู้ซื้อสามารถกดยอมรับเพื่อชำระเงินได้`,
        offer_id: offerId,
        created_at: new Date().toISOString()
      });
    }

    thread.updated_at = new Date().toISOString();
    return offer;
  }

  initiateEscrowWithNegotiatedPrice({ offerId, buyerId }) {
    const offer = this.offers.get(offerId);
    if (!offer) throw new Error('Offer not found');
    if (offer.status !== 'accepted') throw new Error('สามารถสร้างสัญญา Escrow ได้เฉพาะข้อเสนอที่ได้รับการตอบรับ (Accepted) แล้วเท่านั้น');
    if (offer.buyer_id !== buyerId) throw new Error('เฉพาะผู้ซื้อที่เป็นเจ้าของข้อเสนอเท่านั้นที่สามารถเปิดสัญญาได้');

    const escrow = this.initiateEscrow(buyerId, offer.listing_id, offer.offered_price);

    offer.status = 'escrowed';
    offer.escrow_id = escrow.escrow_id;

    const thread = this.itemChats.get(offer.thread_id);
    if (thread) {
      thread.messages.push({
        message_id: `msg_${uuidv4().substring(0, 8)}`,
        sender_id: 'system',
        sender_name: 'System Vault',
        role: 'system',
        text: `[สร้างสัญญา Escrow สำเร็จ] ผู้ซื้อชำระเงิน ฿${offer.offered_price.toFixed(2)} บาท เข้ากระเป๋า Escrow Vault เรียบร้อยแล้ว (รหัสสัญญา: ${escrow.escrow_id})`,
        created_at: new Date().toISOString()
      });
      thread.updated_at = new Date().toISOString();
    }

    return escrow;
  }

  // ==========================================
  // TRANSACTIONAL ESCROW WORKFLOW (ACID)
  // ==========================================

  initiateEscrow(buyerId, listingId, negotiatedPrice = null) {
    const buyer = this.users.get(buyerId);
    const listing = this.listings.get(listingId);

    if (!buyer) throw new Error('Buyer user not found');
    if (!listing) throw new Error('Listing not found');
    if (listing.seller_id === buyerId) {
      throw new Error('ผู้ขายไม่สามารถซื้อหรือเปิดสัญญา Escrow กับสินค้าของตนเองได้');
    }
    if (listing.status !== 'available') throw new Error(`Listing is ${listing.status}`);

    const finalPrice = negotiatedPrice ? Number(negotiatedPrice) : listing.asking_price;

    if (buyer.wallet_balance < finalPrice) {
      throw new Error(`ยอดเงินคงเหลือในกระเป๋าไม่เพียงพอ ยอดที่ต้องใช้: ฿${finalPrice.toFixed(2)} (ยอดเงินของคุณ: ฿${buyer.wallet_balance.toFixed(2)})`);
    }

    const escrowId = `escrow_${uuidv4().substring(0, 8)}`;
    const fee = +(finalPrice * (listing.escrow_fee_percent / 100)).toFixed(2);
    const netSeller = +(finalPrice - fee).toFixed(2);

    // Atomic Balance Lock
    buyer.wallet_balance = +(buyer.wallet_balance - finalPrice).toFixed(2);
    buyer.escrow_locked_balance = +(buyer.escrow_locked_balance + finalPrice).toFixed(2);
    listing.status = 'in_escrow';

    const isItemTrade = (listing.category_type === 'ingame_item');

    const escrow = {
      escrow_id: escrowId,
      listing_id: listingId,
      listing_title: listing.title,
      category_type: listing.category_type || 'individual_game',
      platform_id: listing.platform_id || listing.game_type,
      game_type: listing.game_type,
      is_item_trade: isItemTrade,
      buyer_id: buyerId,
      seller_id: listing.seller_id,
      inspector_id: 'user_inspector_01',
      total_amount: finalPrice,
      commission_fee: fee,
      seller_net_income: netSeller,
      current_step: 1,
      step_status: 'funds_locked',
      credentials: null,
      delivery_proof: null,
      created_at: new Date().toISOString()
    };

    this.escrows.set(escrowId, escrow);

    // Ledger Entry
    const lockLedgerId = `led_${uuidv4().substring(0, 8)}`;
    this.ledgers.push({
      ledger_id: lockLedgerId,
      entry_id: lockLedgerId,
      user_id: buyerId,
      escrow_id: escrowId,
      entry_type: 'escrow_lock',
      type: 'ESCROW_LOCK',
      debit_account: `WALLET:${buyerId} (${buyer.display_name})`,
      credit_account: `VAULT_ESCROW_LOCK:${escrowId}`,
      description: `พักเงินค้ำประกันเข้าห้องคนกลาง (${listing.title})`,
      amount: -finalPrice,
      balance_before: +(buyer.wallet_balance + finalPrice).toFixed(2),
      balance_after: buyer.wallet_balance,
      created_at: new Date().toISOString()
    });

    // Room Log init
    this.escrowLogs.set(escrowId, {
      escrow_id: escrowId,
      events: [
        { step: 1, action: 'FUNDS_LOCKED', msg: `฿${finalPrice.toFixed(2)} locked in Escrow Vault`, ts: new Date().toLocaleTimeString() }
      ],
      messages: [
        { sender: 'System Vault', role: 'system', text: `[ระบบ] ยืนยันการล็อกเงิน ฿${finalPrice.toFixed(2)} เรียบร้อยแล้ว สัญญาเริ่มต้นใน Step 1`, ts: new Date().toLocaleTimeString() },
        {
          sender: 'System Vault',
          role: 'system',
          text: isItemTrade
            ? '[คำแนะนำสำหรับไอเทมในเกม] ผู้ขายกรุณานัดหมายส่งมอบไอเทมผ่านระบบเทรดในเกม (Trade Window / Steam Trade URL) และอัปโหลดภาพหลักฐานการเทรด'
            : '[คำแนะนำสำหรับไอดี] ผู้ขายกรุณาส่งมอบข้อมูลล็อกอินและอีเมลตั้งต้นเข้าสู่ระบบนิรภัยเพื่อส่งต่อให้คนกลางตรวจสอบ',
          ts: new Date().toLocaleTimeString()
        }
      ]
    });

    return escrow;
  }

  submitCredentials(escrowId, sellerId, credentials) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) throw new Error('Escrow not found');
    if (escrow.seller_id !== sellerId) throw new Error('Only seller can submit credentials');
    if (escrow.current_step !== 1 && escrow.current_step !== 2) throw new Error('Invalid step for credentials submission');

    // Cryptographic Vault Storage (AES-256-GCM Envelope Encryption)
    escrow.credentials = SecurityEngine.encryptCredentials(credentials);
    escrow.current_step = 2;
    escrow.step_status = 'credentials_submitted';

    const log = this.escrowLogs.get(escrowId);
    if (log) {
      log.events.push({ step: 2, action: 'CREDENTIALS_VAULTED', msg: 'Seller encrypted credentials stored in vault (AES-256-GCM)', ts: new Date().toLocaleTimeString() });
      log.messages.push({ sender: 'Seller', role: 'seller', text: 'ส่งมอบรหัสผ่านและข้อมูลบัญชีเข้าห้องลับเรียบร้อยแล้ว คนกลางตรวจสอบได้เลยครับ', ts: new Date().toLocaleTimeString() });
    }

    return escrow;
  }

  getDecryptedCredentials(escrowId, requesterId) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) throw new Error('Escrow not found');

    const requester = this.users.get(requesterId);
    const isInspector = (requesterId === escrow.inspector_id) || (requester && (requester.role === 'inspector' || requester.role === 'owner' || requester.role === 'admin'));
    const isBuyerAfterStep3 = (requesterId === escrow.buyer_id && escrow.current_step >= 3);
    const isSellerBeforeStep3 = (requesterId === escrow.seller_id && escrow.current_step <= 2);

    if (!isInspector && !isBuyerAfterStep3 && !isSellerBeforeStep3) {
      throw new Error('ไม่ได้รับอนุญาตให้เข้าถึงข้อมูลรหัสผ่านในห้องนิรภัย');
    }

    if (!escrow.credentials) return null;
    return SecurityEngine.decryptCredentials(escrow.credentials);
  }

  submitItemDeliveryProof(escrowId, sellerId, proofData) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) throw new Error('Escrow not found');
    if (escrow.seller_id !== sellerId) throw new Error('Only seller can submit delivery proof');

    escrow.delivery_proof = {
      trade_method: proofData.trade_method || 'in_game_trade_window',
      proof_url: proofData.proof_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
      seller_character: proofData.seller_character || 'SellerIGN',
      buyer_character: proofData.buyer_character || 'BuyerIGN',
      submitted_at: new Date().toISOString()
    };
    escrow.current_step = 2;
    escrow.step_status = 'item_delivered_pending_verification';

    const log = this.escrowLogs.get(escrowId);
    if (log) {
      log.events.push({ step: 2, action: 'ITEM_DELIVERED', msg: 'Seller submitted in-game trade screenshot/proof', ts: new Date().toLocaleTimeString() });
      log.messages.push({
        sender: 'Seller',
        role: 'seller',
        text: `ทำการส่งมอบไอเทมผ่านระบบเทรดในเกมเรียบร้อยแล้วครับ (ตัวละครส่ง: ${proofData.seller_character || 'ผู้ขาย'} -> ตัวละครรับ: ${proofData.buyer_character || 'ผู้ซื้อ'}) อัปโหลดภาพหลักฐานในระบบแล้ว`,
        ts: new Date().toLocaleTimeString()
      });
    }

    return escrow;
  }

  verifyAndRebind(escrowId, inspectorId) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) throw new Error('Escrow not found');
    const inspector = this.users.get(inspectorId);
    const isInspector = (inspectorId === escrow.inspector_id) || (inspector && (inspector.role === 'inspector' || inspector.role === 'owner' || inspector.role === 'admin'));
    if (!isInspector) throw new Error('เฉพาะคนกลางที่ได้รับมอบหมาย (Certified Inspector/Admin) เท่านั้นที่ตรวจสเปกและสับเปลี่ยนอีเมลได้');
    if (escrow.current_step < 2) throw new Error('Credentials or delivery proof must be submitted first');

    escrow.current_step = 3;
    escrow.step_status = escrow.is_item_trade ? 'trade_verified' : 'rebind_complete';

    const log = this.escrowLogs.get(escrowId);
    if (log) {
      const actionMsg = escrow.is_item_trade
        ? 'คนกลางตรวจสอบภาพหลักฐานการเทรดในเกมเรียบร้อย ส่งมอบให้ผู้ซื้อตรวจรับในกระเป๋าตัวละคร'
        : 'คนกลางตรวจเช็กสกินตรงตามสเปค และทำการเปลี่ยนอีเมลผูกบัญชีเป็นของผู้ซื้อเรียบร้อยแล้ว ส่งมอบให้ผู้ซื้อตรวจรับ';

      log.events.push({ step: 3, action: 'INSPECTOR_VERIFIED', msg: actionMsg, ts: new Date().toLocaleTimeString() });
      log.messages.push({ sender: 'Admin Inspector', role: 'inspector', text: `[ตรวจเช็กผ่าน] ${actionMsg}`, ts: new Date().toLocaleTimeString() });
    }

    return escrow;
  }

  buyerConfirmReceipt(escrowId, buyerId) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) throw new Error('Escrow not found');
    if (escrow.buyer_id !== buyerId) throw new Error('Only buyer can confirm receipt');
    if (escrow.current_step < 3) throw new Error('Inspector must verify first');

    escrow.current_step = 4;
    escrow.step_status = 'buyer_confirmed';

    const log = this.escrowLogs.get(escrowId);
    if (log) {
      const msg = escrow.is_item_trade
        ? 'ตรวจสอบไอเทมในกระเป๋าตัวละครในเกมเรียบร้อยแล้ว ได้รับครบถ้วนสมบูรณ์ครับ'
        : 'เข้าเกมตรวจสอบแล้ว สกินครบ รหัสผ่านใช้ได้ ยืนยันรับมอบบัญชีครับ';

      log.events.push({ step: 4, action: 'BUYER_CONFIRMED', msg: 'Buyer accepted delivery', ts: new Date().toLocaleTimeString() });
      log.messages.push({ sender: 'Buyer', role: 'buyer', text: msg, ts: new Date().toLocaleTimeString() });
    }

    return escrow;
  }

  releaseEscrowFunds(escrowId, callerId = null) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) throw new Error('Escrow not found');
    if (callerId) {
      const caller = this.users.get(callerId);
      const isBuyer = callerId === escrow.buyer_id;
      const isAdminOrInspector = callerId === escrow.inspector_id || (caller && (caller.role === 'inspector' || caller.role === 'owner' || caller.role === 'admin'));
      if (!isBuyer && !isAdminOrInspector) {
        throw new Error('เฉพาะผู้ซื้อหรือคนกลางเท่านั้นที่สามารถสั่งปล่อยเงินให้ผู้ขายได้');
      }
    }
    if (escrow.current_step < 4) throw new Error('Buyer must confirm receipt before release');

    const buyer = this.users.get(escrow.buyer_id);
    const seller = this.users.get(escrow.seller_id);
    const listing = this.listings.get(escrow.listing_id);

    // Atomic Fund Transfer
    buyer.escrow_locked_balance = +(buyer.escrow_locked_balance - escrow.total_amount).toFixed(2);
    seller.wallet_balance = +(seller.wallet_balance + escrow.seller_net_income).toFixed(2);

    // Update Listing and Escrow
    if (listing) {
      listing.status = 'sold';
    }
    escrow.current_step = 5;
    escrow.step_status = 'released_completed';
    escrow.completed_at = new Date().toISOString();

    seller.trust_score = Math.min(100, seller.trust_score + 1);

    // Ledger for Seller Payout
    const relLedgerId = `led_${uuidv4().substring(0, 8)}`;
    this.ledgers.push({
      ledger_id: relLedgerId,
      entry_id: relLedgerId,
      user_id: escrow.seller_id,
      escrow_id: escrowId,
      entry_type: 'escrow_release',
      type: 'ESCROW_RELEASE_PAYOUT',
      debit_account: `VAULT_ESCROW_LOCK:${escrowId}`,
      credit_account: `WALLET:${escrow.seller_id} (${seller.display_name})`,
      description: `รับเงินสุทธิจากการขายสำเร็จ (${escrow.listing_title})`,
      amount: escrow.seller_net_income,
      balance_before: +(seller.wallet_balance - escrow.seller_net_income).toFixed(2),
      balance_after: seller.wallet_balance,
      created_at: new Date().toISOString()
    });

    // Ledger for Platform Commission
    const commLedgerId = `led_${uuidv4().substring(0, 8)}`;
    this.ledgers.push({
      ledger_id: commLedgerId,
      entry_id: commLedgerId,
      user_id: 'user_owner_01',
      escrow_id: escrowId,
      entry_type: 'commission_revenue',
      type: 'PLATFORM_COMMISSION',
      debit_account: `VAULT_ESCROW_LOCK:${escrowId}`,
      credit_account: 'PLATFORM_REVENUE:user_owner_01',
      description: `ค่าธรรมเนียมคนกลาง Escrow จากสัญญา #${escrowId}`,
      amount: escrow.commission_fee,
      balance_before: 45000.00,
      balance_after: +(45000.00 + escrow.commission_fee).toFixed(2),
      created_at: new Date().toISOString()
    });

    const log = this.escrowLogs.get(escrowId);
    if (log) {
      log.events.push({ step: 5, action: 'FUNDS_RELEASED', msg: `฿${escrow.seller_net_income.toFixed(2)} transferred to seller. ฿${escrow.commission_fee.toFixed(2)} commission retained.`, ts: new Date().toLocaleTimeString() });
      log.messages.push({ sender: 'System Vault', role: 'system', text: `[ปิดสัญญาสำเร็จ] ปล่อยเงิน ฿${escrow.seller_net_income.toFixed(2)} เข้ากระเป๋าเงินผู้ขายเรียบร้อยแล้ว`, ts: new Date().toLocaleTimeString() });
    }

    return escrow;
  }

  // ==========================================
  // DISPUTE & ADMIN INTERVENTION ARBITRATION
  // ==========================================

  callAdminIntervention(escrowId, callerId, reason, note = '') {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) throw new Error('Escrow not found');
    if (escrow.step_status === 'released_completed' || escrow.step_status === 'refunded_disputed') {
      throw new Error('This escrow contract is already closed');
    }

    const caller = this.users.get(callerId) || { display_name: callerId, role: 'user' };
    escrow.is_disputed = true;
    escrow.dispute_reason = reason;
    escrow.dispute_note = note;
    escrow.dispute_caller_id = callerId;
    escrow.disputed_at = new Date().toISOString();
    escrow.step_status = 'disputed_admin_intervened';

    const log = this.escrowLogs.get(escrowId);
    if (log) {
      const reasonLabel = reason === 'wrong_credentials'
        ? 'ผู้ซื้อแจ้งว่า: รหัสผ่านผิด / ข้อมูลไม่ถูกต้อง / เข้าสู่ระบบไม่ได้'
        : reason === 'seller_delivered_buyer_unresponsive'
        ? 'ผู้ขายแจ้งว่า: ส่งมอบของเรียบร้อยแล้วแต่ผู้ซื้อไม่ยอมกดยืนยันรับของ'
        : reason === 'specs_not_match'
        ? 'สกินหรือไอเทมในเกมไม่ตรงตามที่ลงประกาศไว้'
        : reason;

      log.events.push({
        step: escrow.current_step,
        action: 'ADMIN_CALLED_DISPUTE',
        msg: `[เรียก Admin คนกลาง] ${caller.display_name} กดเรียกแอดมินเข้ามาแทรกแซง: ${reasonLabel} (${note || 'ไม่มีหมายเหตุ'})`,
        ts: new Date().toLocaleTimeString()
      });

      log.messages.push({
        sender: 'Security System',
        role: 'system',
        text: `[เปิดข้อพิพาท / เรียกแอดมิน] ${caller.display_name} ได้กดปุ่ม "เรียก Admin เข้ามาดูแลด่วน" เนื่องจาก "${reasonLabel}" ระบบสั่งระงับการโอนเงินชั่วคราวและส่งตั๋วให้ Certified Admin Inspector เข้ามาตรวจสอบหลักฐานในห้องนี้ทันที`,
        ts: new Date().toLocaleTimeString()
      });
    }

    return escrow;
  }

  resolveEscrowDispute(escrowId, adminId, decision, adminNote = '') {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) throw new Error('Escrow not found');
    const admin = this.users.get(adminId);
    const isAuthorized = adminId === escrow.inspector_id || (admin && (admin.role === 'inspector' || admin.role === 'owner' || admin.role === 'admin'));
    if (!isAuthorized) {
      throw new Error('เฉพาะ Certified Admin หรือ Inspector เท่านั้นที่มีสิทธิ์ตัดสินข้อพิพาท');
    }
    const adminUser = admin || { display_name: 'Certified Inspector Admin' };

    const buyer = this.users.get(escrow.buyer_id);
    const seller = this.users.get(escrow.seller_id);
    const listing = this.listings.get(escrow.listing_id);

    if (decision === 'refund_buyer') {
      // Return 100% funds back to buyer wallet
      buyer.escrow_locked_balance = +(buyer.escrow_locked_balance - escrow.total_amount).toFixed(2);
      buyer.wallet_balance = +(buyer.wallet_balance + escrow.total_amount).toFixed(2);

      if (listing) listing.status = 'available';
      escrow.step_status = 'refunded_disputed';
      escrow.resolution = {
        decision: 'refund_buyer',
        decided_by: adminUser.display_name,
        note: adminNote,
        resolved_at: new Date().toISOString()
      };

      const refLedgerId = `led_${uuidv4().substring(0, 8)}`;
      this.ledgers.push({
        ledger_id: refLedgerId,
        entry_id: refLedgerId,
        user_id: escrow.buyer_id,
        escrow_id: escrowId,
        entry_type: 'escrow_refund',
        type: 'ESCROW_DISPUTE_REFUND',
        debit_account: `VAULT_ESCROW_LOCK:${escrowId}`,
        credit_account: `WALLET:${escrow.buyer_id} (${buyer.display_name})`,
        description: `คืนเงินเต็มจำนวนเข้ากระเป๋าผู้ซื้อหลังตัดสินข้อพิพาท: ${adminNote}`,
        amount: escrow.total_amount,
        balance_before: +(buyer.wallet_balance - escrow.total_amount).toFixed(2),
        balance_after: buyer.wallet_balance,
        created_at: new Date().toISOString()
      });

      const log = this.escrowLogs.get(escrowId);
      if (log) {
        log.events.push({ step: escrow.current_step, action: 'DISPUTE_REFUND_BUYER', msg: `Admin ตัดสิน: คืนเงินเต็มจำนวน ฿${escrow.total_amount} ให้ผู้ซื้อ`, ts: new Date().toLocaleTimeString() });
        log.messages.push({ sender: adminUser.display_name, role: 'inspector', text: `[คำตัดสิน Admin] ตรวจสอบหลักฐานแล้ว พบว่ารหัสผ่าน/ข้อมูลไม่ถูกต้อง จึงทำการ "คืนเงินเต็มจำนวน ฿${escrow.total_amount.toLocaleString()} เข้ากระเป๋าผู้ซื้อ" เรียบร้อยแล้ว (เหตุผล: ${adminNote})`, ts: new Date().toLocaleTimeString() });
      }
    } else if (decision === 'release_seller') {
      // Force release to seller
      buyer.escrow_locked_balance = +(buyer.escrow_locked_balance - escrow.total_amount).toFixed(2);
      seller.wallet_balance = +(seller.wallet_balance + escrow.seller_net_income).toFixed(2);

      if (listing) listing.status = 'sold';
      escrow.current_step = 5;
      escrow.step_status = 'released_completed';
      escrow.completed_at = new Date().toISOString();
      escrow.resolution = {
        decision: 'release_seller',
        decided_by: adminUser.display_name,
        note: adminNote,
        resolved_at: new Date().toISOString()
      };

      const relLedgerId = `led_${uuidv4().substring(0, 8)}`;
      this.ledgers.push({
        ledger_id: relLedgerId,
        entry_id: relLedgerId,
        user_id: escrow.seller_id,
        escrow_id: escrowId,
        entry_type: 'escrow_release',
        type: 'ESCROW_RELEASE_PAYOUT',
        debit_account: `VAULT_ESCROW_LOCK:${escrowId}`,
        credit_account: `WALLET:${escrow.seller_id} (${seller.display_name})`,
        description: `แอดมินตัดสินปล่อยเงินให้ผู้ขายหลังยืนยันการส่งมอบ: ${adminNote}`,
        amount: escrow.seller_net_income,
        balance_before: +(seller.wallet_balance - escrow.seller_net_income).toFixed(2),
        balance_after: seller.wallet_balance,
        created_at: new Date().toISOString()
      });

      const log = this.escrowLogs.get(escrowId);
      if (log) {
        log.events.push({ step: 5, action: 'DISPUTE_RELEASE_SELLER', msg: `Admin ตัดสิน: ปล่อยเงินสุทธิ ฿${escrow.seller_net_income} ให้ผู้ขาย`, ts: new Date().toLocaleTimeString() });
        log.messages.push({ sender: admin.display_name, role: 'inspector', text: `[คำตัดสิน Admin] ตรวจสอบประวัติการส่งมอบพบว่าผู้ขายส่งมอบถูกต้องครบถ้วน จึงทำการ "ปล่อยเงินสุทธิ ฿${escrow.seller_net_income.toLocaleString()} ให้ผู้ขาย" เรียบร้อยแล้ว (เหตุผล: ${adminNote})`, ts: new Date().toLocaleTimeString() });
      }
    }

    return escrow;
  }

  // ==========================================
  // KYC VERIFICATION SYSTEM
  // ==========================================

  submitKYC({ userId, fullNameTh, idCardNumber, idCardImageUrl, selfieImageUrl }) {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    const kycId = `kyc_${uuidv4().substring(0, 8)}`;
    const kycRecord = {
      kyc_id: kycId,
      user_id: userId,
      full_name_th: fullNameTh,
      id_card_number: idCardNumber,
      id_card_image_url: idCardImageUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
      selfie_image_url: selfieImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      status: 'pending',
      rejection_reason: null,
      reviewed_by: null,
      submitted_at: new Date().toISOString(),
      reviewed_at: null
    };

    this.kycRecords.set(kycId, kycRecord);
    return kycRecord;
  }

  reviewKYC(kycId, reviewerId, status, rejectionReason = null) {
    const kyc = this.kycRecords.get(kycId);
    if (!kyc) throw new Error('KYC record not found');
    if (!['approved', 'rejected'].includes(status)) throw new Error('Invalid status');

    kyc.status = status;
    kyc.reviewed_by = reviewerId;
    kyc.rejection_reason = rejectionReason;
    kyc.reviewed_at = new Date().toISOString();

    const user = this.users.get(kyc.user_id);
    if (user && status === 'approved') {
      user.is_verified = true;
      user.trust_score = Math.min(100, user.trust_score + 10);
    }

    return kyc;
  }

  getKYCByUser(userId) {
    return Array.from(this.kycRecords.values()).find(k => k.user_id === userId) || null;
  }

  getAllKYC() {
    return Array.from(this.kycRecords.values()).map(k => {
      const u = this.users.get(k.user_id);
      return { ...k, user_name: u ? u.display_name : 'Unknown User' };
    });
  }

  // ==========================================
  // BANK PAYOUTS & WITHDRAWALS
  // ==========================================

  addBankAccount({ userId, bankName, accountNumber, accountHolderName }) {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    const accountId = `acc_${uuidv4().substring(0, 8)}`;
    const bankAccount = {
      account_id: accountId,
      user_id: userId,
      bank_name: bankName,
      account_number: accountNumber,
      account_holder_name: accountHolderName,
      is_primary: true,
      created_at: new Date().toISOString()
    };

    this.bankAccounts.set(accountId, bankAccount);
    return bankAccount;
  }

  getBankAccounts(userId) {
    return Array.from(this.bankAccounts.values()).filter(acc => acc.user_id === userId);
  }

  requestWithdrawal({ userId, bankAccountId, amount }) {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      throw new Error('Minimum withdrawal amount is ฿100.00');
    }
    if (user.wallet_balance < numAmount) {
      throw new Error(`Insufficient wallet balance. Available: ฿${user.wallet_balance.toFixed(2)}`);
    }

    const bankAcc = this.bankAccounts.get(bankAccountId);
    const fee = 15.00;
    const netPayout = +(numAmount - fee).toFixed(2);

    user.wallet_balance = +(user.wallet_balance - numAmount).toFixed(2);

    const withdrawalId = `wth_${uuidv4().substring(0, 8)}`;
    const withdrawal = {
      withdrawal_id: withdrawalId,
      user_id: userId,
      bank_account_id: bankAccountId,
      bank_name: bankAcc ? bankAcc.bank_name : 'PROMPTPAY',
      account_number: bankAcc ? bankAcc.account_number : '08x-xxx-xxxx',
      account_holder_name: bankAcc ? bankAcc.account_holder_name : user.display_name,
      amount: numAmount,
      fee,
      net_payout: netPayout,
      status: 'pending',
      transfer_slip_url: null,
      processed_by: null,
      created_at: new Date().toISOString(),
      processed_at: null
    };

    this.withdrawals.set(withdrawalId, withdrawal);

    this.ledgers.push({
      ledger_id: `led_${uuidv4().substring(0, 8)}`,
      user_id: userId,
      escrow_id: null,
      entry_type: 'withdrawal_request',
      amount: numAmount,
      balance_before: +(user.wallet_balance + numAmount).toFixed(2),
      balance_after: user.wallet_balance,
      created_at: new Date().toISOString()
    });

    return withdrawal;
  }

  approveWithdrawal(withdrawalId, adminId, transferSlipUrl = null) {
    const withdrawal = this.withdrawals.get(withdrawalId);
    if (!withdrawal) throw new Error('Withdrawal request not found');
    if (withdrawal.status !== 'pending') throw new Error(`Withdrawal is already ${withdrawal.status}`);

    withdrawal.status = 'approved_paid';
    withdrawal.processed_by = adminId;
    withdrawal.transfer_slip_url = transferSlipUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400';
    withdrawal.processed_at = new Date().toISOString();

    this.ledgers.push({
      ledger_id: `led_${uuidv4().substring(0, 8)}`,
      user_id: withdrawal.user_id,
      escrow_id: null,
      entry_type: 'withdrawal_payout_complete',
      amount: withdrawal.net_payout,
      balance_before: 0,
      balance_after: 0,
      created_at: new Date().toISOString()
    });

    return withdrawal;
  }

  getWithdrawals(userId = null) {
    let list = Array.from(this.withdrawals.values());
    if (userId) {
      list = list.filter(w => w.user_id === userId);
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // ==========================================
  // ESCROW DISPUTE & ARBITRATION
  // ==========================================

  fileDispute({ escrowId, claimantId, category, title, description, evidenceUrls = [] }) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) throw new Error('Escrow contract not found');
    if (escrow.is_disputed) throw new Error('Dispute is already active for this escrow');

    const respondentId = (claimantId === escrow.buyer_id) ? escrow.seller_id : escrow.buyer_id;
    const disputeId = `disp_${uuidv4().substring(0, 8)}`;

    const dispute = {
      dispute_id: disputeId,
      escrow_id: escrowId,
      claimant_id: claimantId,
      respondent_id: respondentId,
      category: category || 'ACCOUNT_RECALLED',
      title,
      description,
      evidence_urls: evidenceUrls.length ? evidenceUrls : ['https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600'],
      status: 'under_arbitration',
      arbitration_notes: null,
      arbitrated_by: null,
      created_at: new Date().toISOString(),
      resolved_at: null
    };

    escrow.is_disputed = true;
    escrow.step_status = 'disputed_frozen';
    this.disputes.set(disputeId, dispute);

    const log = this.escrowLogs.get(escrowId);
    if (log) {
      log.events.push({
        step: escrow.current_step,
        action: 'DISPUTE_FILED',
        msg: `[ข้อพิพาท] มีการยื่นข้อพิพาท: "${title}" (อายัดเงินในห้อง Escrow ชั่วคราว)`,
        ts: new Date().toLocaleTimeString()
      });
      log.messages.push({
        sender: 'Arbitration Bot',
        role: 'system',
        text: `[อายัดสัญญา] สัญญาถูกอายัดชั่วคราวเนื่องจากมีการเปิดข้อพิพาท: ${title}. คนกลางจะตรวจสอบหลักฐานเพื่อชี้ขาด`,
        ts: new Date().toLocaleTimeString()
      });
    }

    return dispute;
  }

  resolveDispute(disputeId, arbitratedBy, resolution, notes = '') {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) throw new Error('Dispute not found');
    if (dispute.status !== 'under_arbitration') throw new Error(`Dispute is already ${dispute.status}`);

    const escrow = this.escrows.get(dispute.escrow_id);
    if (!escrow) throw new Error('Escrow not found');

    const buyer = this.users.get(escrow.buyer_id);
    const seller = this.users.get(escrow.seller_id);
    const listing = this.listings.get(escrow.listing_id);

    if (resolution === 'resolved_buyer_refund') {
      buyer.escrow_locked_balance = +(buyer.escrow_locked_balance - escrow.total_amount).toFixed(2);
      buyer.wallet_balance = +(buyer.wallet_balance + escrow.total_amount).toFixed(2);
      seller.trust_score = Math.max(30, seller.trust_score - 20);
      if (listing) listing.status = 'cancelled_fraud';

      escrow.step_status = 'refunded_to_buyer';
      escrow.is_disputed = false;

      this.ledgers.push({
        ledger_id: `led_${uuidv4().substring(0, 8)}`,
        user_id: buyer.user_id,
        escrow_id: escrow.escrow_id,
        entry_type: 'dispute_refund_buyer',
        amount: escrow.total_amount,
        balance_before: +(buyer.wallet_balance - escrow.total_amount).toFixed(2),
        balance_after: buyer.wallet_balance,
        created_at: new Date().toISOString()
      });
    } else if (resolution === 'resolved_seller_payout') {
      buyer.escrow_locked_balance = +(buyer.escrow_locked_balance - escrow.total_amount).toFixed(2);
      seller.wallet_balance = +(seller.wallet_balance + escrow.seller_net_income).toFixed(2);
      if (listing) listing.status = 'sold';

      escrow.step_status = 'released_after_dispute';
      escrow.is_disputed = false;

      this.ledgers.push({
        ledger_id: `led_${uuidv4().substring(0, 8)}`,
        user_id: seller.user_id,
        escrow_id: escrow.escrow_id,
        entry_type: 'escrow_release',
        amount: escrow.seller_net_income,
        balance_before: +(seller.wallet_balance - escrow.seller_net_income).toFixed(2),
        balance_after: seller.wallet_balance,
        created_at: new Date().toISOString()
      });
    }

    dispute.status = resolution;
    dispute.arbitrated_by = arbitratedBy;
    dispute.arbitration_notes = notes;
    dispute.resolved_at = new Date().toISOString();

    const log = this.escrowLogs.get(escrow.escrow_id);
    if (log) {
      log.events.push({
        step: escrow.current_step,
        action: 'DISPUTE_RESOLVED',
        msg: `[ตัดสินข้อพิพาท] ${resolution === 'resolved_buyer_refund' ? 'คืนเงินผู้ซื้อ 100%' : 'ปล่อยเงินให้ผู้ขาย'} (${notes})`,
        ts: new Date().toLocaleTimeString()
      });
      log.messages.push({
        sender: 'Arbitrator',
        role: 'inspector',
        text: `[คำตัดสินของคนกลาง] ${resolution === 'resolved_buyer_refund' ? 'คืนเงินเต็มจำนวนเข้ากระเป๋าผู้ซื้อ' : 'ส่งมอบเงินให้ผู้ขาย'} • หมายเหตุ: ${notes}`,
        ts: new Date().toLocaleTimeString()
      });
    }

    return dispute;
  }

  getDisputeByEscrow(escrowId) {
    return Array.from(this.disputes.values()).find(d => d.escrow_id === escrowId) || null;
  }

  getAllDisputes() {
    return Array.from(this.disputes.values()).map(d => {
      const e = this.escrows.get(d.escrow_id);
      const c = this.users.get(d.claimant_id);
      const r = this.users.get(d.respondent_id);
      return {
        ...d,
        listing_title: e ? e.listing_title : 'Item',
        claimant_name: c ? c.display_name : 'User',
        respondent_name: r ? r.display_name : 'User'
      };
    });
  }

  // ==========================================
  // AUTHENTICATION & USER MANAGEMENT
  // ==========================================

  getUserByEmail(email) {
    if (!email) return null;
    return Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  registerUser({ email, password, displayName }) {
    if (!email || !password || !displayName) {
      throw new Error('กรุณากรอกอีเมล รหัสผ่าน และชื่อผู้ใช้ให้ครบถ้วน');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('รูปแบบอีเมลไม่ถูกต้อง กรุณาใช้อีเมลจริง');
    }

    if (password.length < 6) {
      throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
    }

    const existing = this.getUserByEmail(email);
    if (existing) {
      throw new Error('อีเมลนี้ถูกลงทะเบียนใช้งานแล้ว กรุณาเข้าสู่ระบบ');
    }

    const userId = `user_${uuidv4().substring(0, 8)}`;
    const starterFunds = 10000.00;

    const newUser = {
      user_id: userId,
      email: email.trim().toLowerCase(),
      password_hash: hashPassword(password),
      display_name: displayName.trim(),
      oauth_provider: 'email',
      role: 'user',
      wallet_balance: starterFunds,
      escrow_locked_balance: 0.00,
      trust_score: 85,
      is_verified: false,
      created_at: new Date().toISOString()
    };

    this.users.set(userId, newUser);

    this.ledgers.push({
      ledger_id: `led_${uuidv4().substring(0, 8)}`,
      user_id: userId,
      escrow_id: null,
      entry_type: 'topup',
      amount: starterFunds,
      balance_before: 0.00,
      balance_after: starterFunds,
      created_at: new Date().toISOString()
    });

    return newUser;
  }

  loginUser({ email, password }) {
    if (!email || !password) {
      throw new Error('กรุณาระบุอีเมลและรหัสผ่าน');
    }

    const user = this.getUserByEmail(email);
    if (!user) {
      throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    if (!user.password_hash) {
      throw new Error('บัญชีนี้ลงทะเบียนด้วย Google กรุณากดปุ่ม "เข้าสู่ระบบด้วย Google"');
    }

    if (!verifyPassword(password, user.password_hash)) {
      throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    return user;
  }

  googleAuthUser({ email, displayName, photoUrl, googleSub = null }) {
    if (!email) {
      throw new Error('ไม่ได้รับข้อมูลอีเมลจาก Google');
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = this.getUserByEmail(cleanEmail);

    if (user) {
      if (!user.oauth_provider) user.oauth_provider = 'google';
      if (googleSub && !user.google_sub) user.google_sub = googleSub;
      if (photoUrl) user.photo_url = photoUrl;
      return user;
    }

    const userId = `user_g_${uuidv4().substring(0, 8)}`;
    const starterFunds = 15000.00;

    user = {
      user_id: userId,
      email: cleanEmail,
      password_hash: null,
      display_name: displayName || cleanEmail.split('@')[0],
      oauth_provider: 'google',
      google_sub: googleSub,
      photo_url: photoUrl || null,
      role: 'user',
      wallet_balance: starterFunds,
      escrow_locked_balance: 0.00,
      trust_score: 95,
      is_verified: true,
      created_at: new Date().toISOString()
    };

    this.users.set(userId, user);

    this.ledgers.push({
      ledger_id: `led_${uuidv4().substring(0, 8)}`,
      user_id: userId,
      escrow_id: null,
      entry_type: 'topup',
      amount: starterFunds,
      balance_before: 0.00,
      balance_after: starterFunds,
      created_at: new Date().toISOString()
    });

    return user;
  }

  // ==========================================
  // NOTIFICATIONS & WEBHOOK SUBSCRIPTIONS
  // ==========================================

  addNotification({ userId, channel = 'in_app', eventType, title, message, metadata = {} }) {
    const notifId = `notif_${uuidv4().substring(0, 8)}`;
    const notification = {
      notification_id: notifId,
      user_id: userId,
      channel,
      event_type: eventType,
      title,
      message,
      metadata,
      is_read: false,
      sent_status: 'delivered',
      created_at: new Date().toISOString()
    };
    this.notifications.set(notifId, notification);
    return notification;
  }

  getUserNotifications(userId, unreadOnly = false) {
    const list = Array.from(this.notifications.values()).filter(n => n.user_id === userId);
    const filtered = unreadOnly ? list.filter(n => !n.is_read) : list;
    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  markNotificationAsRead(notificationId) {
    const notif = this.notifications.get(notificationId);
    if (!notif) throw new Error('ไม่พบข้อมูลการแจ้งเตือน');
    notif.is_read = true;
    return notif;
  }

  markAllNotificationsAsRead(userId) {
    let count = 0;
    for (const notif of this.notifications.values()) {
      if (notif.user_id === userId && !notif.is_read) {
        notif.is_read = true;
        count++;
      }
    }
    return { count };
  }

  addWebhookSubscription({ userId, targetUrl, secretKey, events = ['*'] }) {
    const subId = `whsub_${uuidv4().substring(0, 8)}`;
    const subscription = {
      subscription_id: subId,
      user_id: userId,
      target_url: targetUrl,
      secret_key: secretKey || `whsec_${uuidv4().replace(/-/g, '')}`,
      events: Array.isArray(events) ? events : [events],
      is_active: true,
      created_at: new Date().toISOString()
    };
    this.webhookSubscriptions.set(subId, subscription);
    return subscription;
  }

  getWebhookSubscriptions(userId) {
    return Array.from(this.webhookSubscriptions.values()).filter(s => s.user_id === userId || userId === 'all');
  }

  deleteWebhookSubscription(subscriptionId) {
    return this.webhookSubscriptions.delete(subscriptionId);
  }
}

export const db = new DatabaseEngine();
