import { PrismaClient } from '@prisma/client';
import { SecurityEngine } from '../src/utils/security.js';

const prisma = new PrismaClient();

async function main() {
  console.log('[PRISMA SEED] Starting database seeding...');

  // 1. Clean existing records in correct foreign key order
  await prisma.escrowLog.deleteMany();
  await prisma.escrowMessage.deleteMany();
  await prisma.disputeRecord.deleteMany();
  await prisma.itemChatMessage.deleteMany();
  await prisma.itemOffer.deleteMany();
  await prisma.itemChatThread.deleteMany();
  await prisma.escrowContract.deleteMany();
  await prisma.inventorySpec.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.withdrawalRequest.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.kycRecord.deleteMany();
  await prisma.doubleEntryLedger.deleteMany();
  await prisma.user.deleteMany();
  await prisma.blacklist.deleteMany();

  // 2. Seed Users
  const users = [
    {
      user_id: 'user_buyer_01',
      email: 'buyer.nont@gmail.com',
      password_hash: 'Password123!',
      display_name: 'Nont (Trader TH)',
      role: 'user',
      wallet_balance: 35000.00,
      escrow_locked_balance: 0.00,
      trust_score: 98,
      is_verified: true
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
      is_verified: true
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
      is_verified: true
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
      is_verified: true
    }
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }
  console.log(`[PRISMA SEED] Seeded ${users.length} users`);

  // 3. Seed Listings & Inventory Specs (Across all 3 categories)
  const listingsData = [
    {
      listing_id: 'list_val_001',
      seller_id: 'user_seller_01',
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
      specs: {
        rank: 'Immortal 2',
        region: 'AP (Thailand)',
        bind_type: 'Original Email (Clean OGE)',
        trust_rating: 'A+ (Safe)',
        skins: [
          { name: 'Kuronami Vandal', tier: 'Exclusive', value: 1200 },
          { name: 'Champions 2024 Karambit', tier: 'Ultra', value: 2800 },
          { name: 'Prime Vandal', tier: 'Premium', value: 650 },
          { name: 'Reaver Operator', tier: 'Premium', value: 700 }
        ]
      }
    },
    {
      listing_id: 'list_rov_002',
      seller_id: 'user_seller_01',
      category_type: 'individual_game',
      platform_id: 'rov',
      game_type: 'ROV',
      title: 'ไอดี ROV Supreme 65 ดาว | Murad ร่าง Dimension Breaker + สกิน SS 18 ตัว',
      description: 'การีน่าสะอาด ไม่ผูกเฟสบุ๊ค รูนครบ 30 หน้า พร้อมแข่งและไต่แรงก์ คนกลางตรวจสเปคฟรี',
      asking_price: 5200.00,
      negotiable: true,
      warranty_days: 14,
      escrow_fee_percent: 7.50,
      is_featured_boost: false,
      verification_tier: 'guaranteed',
      status: 'available',
      specs: {
        rank: 'Supreme Conqueror',
        bind_type: 'Clean Garena (No Facebook)',
        hero_count: 120,
        skin_count: 280,
        dimension_breaker_skins: 'Murad Dimension Breaker'
      }
    },
    {
      listing_id: 'list_steam_005',
      seller_id: 'user_seller_01',
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
      specs: {
        total_games_count: 154,
        steam_level: 62,
        vac_status: 'clean',
        cs2_prime_status: 'yes',
        notable_aaa_games: 'Black Myth: Wukong, Elden Ring, Cyberpunk 2077, GTA V, RDR2, Monster Hunter World'
      }
    },
    {
      listing_id: 'list_cs2_item_007',
      seller_id: 'user_seller_01',
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
      specs: {
        item_name: 'Butterfly Knife Fade (Factory New)',
        item_category: 'skin_cosmetic',
        quantity: '1 ชิ้น',
        server_and_channel: 'Global Steam Network',
        trade_delivery_method: 'steam_trade_url',
        seller_in_game_id: 'https://steamcommunity.com/tradeoffer/new/?partner=9182371&token=VaultDemo',
        delivery_instructions: 'ส่งคำขอแลกเปลี่ยนทันทีเมื่อระบบล็อกเงินในห้อง Escrow เรียบร้อย'
      }
    }
  ];

  for (const item of listingsData) {
    const { specs, ...listingFields } = item;
    await prisma.listing.create({
      data: {
        ...listingFields,
        spec: {
          create: {
            category_type: listingFields.category_type,
            platform_id: listingFields.platform_id,
            specs_data: specs,
            estimated_market_value: listingFields.asking_price
          }
        }
      }
    });
  }
  console.log(`[PRISMA SEED] Seeded ${listingsData.length} listings with dynamic JSONB specs`);

  // 4. Seed Item Chat Thread & Offer
  const thread = await prisma.itemChatThread.create({
    data: {
      thread_id: 'thread_cs2_buyer_seller',
      listing_id: 'list_cs2_item_007',
      listing_title: 'CS2 Butterfly Knife Fade (Factory New) 99.2% Fade Pattern | ส่งมอบผ่าน Steam Trade URL',
      buyer_id: 'user_buyer_01',
      seller_id: 'user_seller_01',
      active_offer_id: 'offer_cs2_demo_01'
    }
  });

  await prisma.itemOffer.create({
    data: {
      offer_id: 'offer_cs2_demo_01',
      thread_id: thread.thread_id,
      listing_id: 'list_cs2_item_007',
      buyer_id: 'user_buyer_01',
      seller_id: 'user_seller_01',
      offered_price: 17200.00,
      original_price: 18500.00,
      discount_amount: 1300.00,
      discount_percent: 7.03,
      status: 'accepted',
      message: 'ผมสนใจมีดชิ้นนี้ครับ ขอลดเหลือ 17,200 บาท พร้อมโอนเข้า Escrow ทันทีครับ'
    }
  });

  await prisma.itemChatMessage.createMany({
    data: [
      {
        message_id: 'msg_001',
        thread_id: thread.thread_id,
        sender_id: 'user_buyer_01',
        sender_name: 'Nont (Trader TH)',
        role: 'buyer',
        text: 'สวัสดีครับ มีดเล่มนี้มีติด Trade Hold ไหมครับ และลดราคาได้เท่าไหร่ครับ'
      },
      {
        message_id: 'msg_002',
        thread_id: thread.thread_id,
        sender_id: 'user_seller_01',
        sender_name: 'Arm_ProGamerTH',
        role: 'seller',
        text: 'สวัสดีครับ ปลอด Trade Hold พร้อมส่งทาง Steam Trade Offer ได้ทันทีครับ ลองเสนอราคามาได้เลยครับ'
      },
      {
        message_id: 'msg_003',
        thread_id: thread.thread_id,
        sender_id: 'user_buyer_01',
        sender_name: 'Nont (Trader TH)',
        role: 'buyer',
        text: '[ข้อเสนอราคา] ยื่นข้อเสนอต่อรองราคา 17,200 บาท (จาก 18,500 บาท)',
        offer_id: 'offer_cs2_demo_01'
      },
      {
        message_id: 'msg_004',
        thread_id: thread.thread_id,
        sender_id: 'user_seller_01',
        sender_name: 'Arm_ProGamerTH',
        role: 'seller',
        text: '[ยอมรับข้อเสนอ] ผู้ขายตกลงรับข้อเสนอ 17,200 บาท สามารถกดยืนยันชำระเงินเข้า Escrow ได้ทันทีครับ',
        offer_id: 'offer_cs2_demo_01'
      }
    ]
  });
  console.log('[PRISMA SEED] Seeded item chat thread and active offers');

  // 5. Seed Blacklist
  await prisma.blacklist.createMany({
    data: [
      {
        blacklist_id: 'bl_001',
        scammer_name: 'นายกิตติศักดิ์ โกงเนียน',
        bank_account_number: '123-4-56789-0',
        bank_name: 'ธนาคารกสิกรไทย (KBANK)',
        game_uid: 'VAL#9981',
        scam_method: 'รับเงินแล้วไม่ส่งมอบรหัสผ่าน และโคลนเฟสบุ๊คคนกลางปลอม'
      },
      {
        blacklist_id: 'bl_002',
        scammer_name: 'นายชลธี ดึงคืน',
        bank_account_number: '987-6-54321-9',
        bank_name: 'ธนาคารไทยพาณิชย์ (SCB)',
        game_uid: 'ROV_UID_44521',
        scam_method: 'ขายไอดีสำเร็จแล้ว 3 วัน ทำเรื่องแจ้งกู้คืนไอดีผ่านอีเมลสำรอง'
      }
    ]
  });
  console.log('[PRISMA SEED] Seeded blacklist records');

  console.log('[PRISMA SEED] All seed data populated successfully!');
}

main()
  .catch((e) => {
    console.error('[PRISMA SEED ERROR]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
