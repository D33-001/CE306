/**
 * Category & Dynamic Listing Schema Specifications
 * Escrow Game Vault - Pure Backend
 * Zero emoji constraint strictly applied.
 */

export const CATEGORIES_CATALOG = [
  {
    id: 'individual_game',
    slug: 'individual-games',
    title_th: 'ไอดีเกมเดี่ยว (Individual Game Accounts)',
    title_en: 'Individual Game Accounts',
    description_th: 'การโอนสิทธิ์ความเป็นเจ้าของบัญชีเกมทั้งหมด โดยผู้ซื้อจะต้องเปลี่ยนอีเมล รหัสผ่าน และ 2FA',
    description_en: 'Full account ownership transfer. Buyer updates email, password, and 2FA credentials.',
    trade_type: 'account_transfer',
    total_games: 20,
    games: [
      { id: 'rov', name: 'RoV (Arena of Valor)', publisher: 'Garena', platform: 'Mobile', popular_specs: 'Dimension Breaker, Collab Skins, Supreme Rank' },
      { id: 'roblox', name: 'Roblox (Account)', publisher: 'Roblox Corp', platform: 'PC / Mobile', popular_specs: 'Blox Fruits Max, Mythical Fruits, Korblox/Headless' },
      { id: 'valorant', name: 'Valorant', publisher: 'Riot Games', platform: 'PC', popular_specs: 'Champions Vandal, Kuronami, Radiant/Immortal, OGE' },
      { id: 'free_fire', name: 'Free Fire', publisher: 'Garena', platform: 'Mobile', popular_specs: 'Evo Guns Max Lv, Old School Bundles, Grandmaster' },
      { id: 'genshin', name: 'Genshin Impact', publisher: 'HoYoverse', platform: 'Cross-platform', popular_specs: 'AR60 End-game, C6R5 Characters, No Deadlinks' },
      { id: 'hsr', name: 'Honkai: Star Rail', publisher: 'HoYoverse', platform: 'Cross-platform', popular_specs: 'E6S5 Characters, Trailblaze Lv 70, MoC 36 Stars' },
      { id: 'fc_mobile', name: 'FC Mobile (FIFA Mobile)', publisher: 'EA Sports', platform: 'Mobile', popular_specs: 'OVR 110+, Icon Legends, High Coin Balance' },
      { id: 'efootball', name: 'eFootball (PES Mobile/PC)', publisher: 'Konami', platform: 'Mobile / PC', popular_specs: 'Epic / Big Time Boosted, Team Strength 3150+' },
      { id: 'pubgm', name: 'PUBG Mobile', publisher: 'Krafton / Tencent', platform: 'Mobile', popular_specs: 'M416 Glacier Max, X-Suit 6-7 Stars, Conqueror' },
      { id: 'zzz', name: 'Zenless Zone Zero', publisher: 'HoYoverse', platform: 'Cross-platform', popular_specs: 'M6W5 Characters, High Inter-Knot, Clean Hoyo' },
      { id: 'lol', name: 'League of Legends (PC)', publisher: 'Riot Games', platform: 'PC', popular_specs: 'Rare Vintage Skins, Prestige Skins, High Mastery' },
      { id: 'pb', name: 'Point Blank (PB)', publisher: 'Zepetto', platform: 'PC', popular_specs: 'Rank 3-5 Stars, Barrett M82A1, High K/D Ratio' },
      { id: 'idv', name: 'Identity V', publisher: 'NetEase', platform: 'Mobile / PC', popular_specs: 'S-Tier Limited Skins, Persona 5, Danganronpa, DMM Clean' },
      { id: 'cs2_acc', name: 'Counter-Strike 2 (Account)', publisher: 'Valve', platform: 'PC', popular_specs: 'Prime Status, 5/10 Year Coins, High Premier Rating' },
      { id: 'ragnarok_acc', name: 'Ragnarok (Account)', publisher: 'Gravity', platform: 'PC / Mobile', popular_specs: 'Max Level, High Refine +12/+15, MVP Cards' },
      { id: 'cabal_acc', name: 'Cabal (Account)', publisher: 'PlayPark / ESTgames', platform: 'PC / Mobile', popular_specs: 'Level 200, Overlord, High Penetration Gear' },
      { id: 'apex', name: 'Apex Legends', publisher: 'EA', platform: 'PC / Console', popular_specs: 'Heirloom Weapons, Prestige Skins, Predator Badge' },
      { id: 'ow2', name: 'Overwatch 2', publisher: 'Blizzard', platform: 'PC', popular_specs: 'Pink Mercy, All-Stars, Legacy OW1 Cosmetics' },
      { id: 'wuwa', name: 'Wuthering Waves', publisher: 'Kuro Games', platform: 'PC / Mobile', popular_specs: 'R6S5 Characters, Union Lv 60, Clean Bind' },
      { id: 'tft_acc', name: 'Teamfight Tactics (Account)', publisher: 'Riot Games', platform: 'PC / Mobile', popular_specs: 'Prestige Chibi Tacticians, Mythic Arenas, Challenger' }
    ]
  },
  {
    id: 'game_library',
    slug: 'game-libraries',
    title_th: 'ไอดีคลังเกมรวม (Game Libraries / Platforms)',
    title_en: 'Game Libraries & Platform Accounts',
    description_th: 'การโอนสิทธิ์บัญชีแพลตฟอร์มศูนย์รวมเกมที่มีเกมสะสมหลายเกมในบัญชีเดียว เช่น Steam, PSN, Epic Games',
    description_en: 'Platform account transfer with multi-game collections (Steam, PSN, Epic, Battle.net).',
    trade_type: 'platform_transfer',
    total_games: 10,
    games: [
      { id: 'steam_library', name: 'Steam Library Account', publisher: 'Valve', platform: 'PC', popular_specs: '50-300+ AAA Games, CS2 Prime, High Steam Level, VAC Clean' },
      { id: 'psn', name: 'PlayStation Network (PSN)', publisher: 'Sony Interactive Entertainment', platform: 'Console (PS4/PS5)', popular_specs: 'Digital Exclusives, Stacked PS Plus Deluxe, Platinum Trophies' },
      { id: 'epic_library', name: 'Epic Games Library', publisher: 'Epic Games', platform: 'PC', popular_specs: '100+ Free Claimed Games (GTA V, Death Stranding), Early Fortnite' },
      { id: 'battlenet', name: 'Battle.net Multi-Game Account', publisher: 'Blizzard Entertainment', platform: 'PC', popular_specs: 'World of Warcraft, Diablo IV + DLC, Call of Duty MW/Warzone' },
      { id: 'riot_unified', name: 'Riot Games Unified Account', publisher: 'Riot Games', platform: 'PC / Mobile', popular_specs: 'Valorant + LoL + TFT Combined Multi-Game Investment' },
      { id: 'nintendo', name: 'Nintendo Switch eShop Account', publisher: 'Nintendo', platform: 'Console (Switch)', popular_specs: 'Zelda, Mario, Pokemon Series Digital Purchases + NSO' },
      { id: 'xbox', name: 'Xbox Network / PC Game Pass', publisher: 'Microsoft', platform: 'PC / Console', popular_specs: 'Game Pass Ultimate Stacked, Minecraft Dual Edition, Forza' },
      { id: 'ea_app', name: 'EA App Account (Origin)', publisher: 'Electronic Arts', platform: 'PC', popular_specs: 'The Sims 4 Complete DLC Expansions, Battlefield Franchise' },
      { id: 'ubisoft', name: 'Ubisoft Connect Account', publisher: 'Ubisoft', platform: 'PC', popular_specs: 'Assassin Creed Complete, Rainbow Six Siege Black Ice/Pro League' },
      { id: 'garena_master', name: 'Garena Master Account', publisher: 'Garena', platform: 'PC / Mobile', popular_specs: 'RoV + Free Fire + FC Online Multi-linked VIP Account' }
    ]
  },
  {
    id: 'ingame_item',
    slug: 'ingame-items',
    title_th: 'ไอเทมและเงินในเกม (Tradeable In-Game Items & Currencies)',
    title_en: 'Tradeable In-Game Items & Currencies',
    description_th: 'การซื้อขายเฉพาะไอเทม สกิน หรือเงินในเกม ผ่านระบบแลกเปลี่ยนอย่างเป็นทางการของเกม โดยไม่ต้องส่งมอบไอดี',
    description_en: 'Player-to-player trade of items, skins, or currencies via official in-game mechanics without sharing account credentials.',
    trade_type: 'ingame_trade',
    total_games: 10,
    games: [
      { id: 'cs2_item', name: 'Counter-Strike 2 (Skins & Items)', publisher: 'Valve', platform: 'Steam (PC)', popular_specs: 'Knives (Karambit/Butterfly), Gloves, Weapon Skins, Cases, Stickers', delivery_method: 'steam_trade_url' },
      { id: 'roblox_item', name: 'Roblox (Blox Fruits / MM2 / Pet Sim)', publisher: 'Roblox Corp', platform: 'PC / Mobile', popular_specs: 'Physical Kitsune/Dragon Fruit, Godly Weapons, Huge Pets, Gems', delivery_method: 'in_game_meetup' },
      { id: 'ragnarok_item', name: 'Ragnarok (Zeny / MVP Cards / Gears)', publisher: 'Gravity', platform: 'PC / Mobile', popular_specs: 'Zeny Millions, +15 Refined Weapons, God Items, MVP Cards', delivery_method: 'in_game_meetup' },
      { id: 'poe_item', name: 'Path of Exile 1 & 2 (Currencies & Gear)', publisher: 'Grinding Gear Games', platform: 'PC', popular_specs: 'Divine Orbs, Chaos Orbs, Mirror of Kalandra, Crafted Rares', delivery_method: 'in_game_meetup' },
      { id: 'dota2_item', name: 'Dota 2 (Arcanas & Items)', publisher: 'Valve', platform: 'Steam (PC)', popular_specs: 'Arcanas, Immortal Items, Collector Cache Sets (Gift Once)', delivery_method: 'steam_trade_url' },
      { id: 'warframe_item', name: 'Warframe (Platinum & Prime Parts)', publisher: 'Digital Extremes', platform: 'Cross-play', popular_specs: 'Tradeable Platinum, Prime Warframe/Weapon Sets, Riven Mods', delivery_method: 'in_game_meetup' },
      { id: 'tf2_item', name: 'Team Fortress 2 (TF2 Keys & Hats)', publisher: 'Valve', platform: 'Steam (PC)', popular_specs: 'Mann Co. Supply Crate Keys, Unusual Hats, Australium Weapons', delivery_method: 'steam_trade_url' },
      { id: 'cabal_item', name: 'Cabal (Alz & Extreme Cores)', publisher: 'PlayPark / ESTgames', platform: 'PC / Mobile', popular_specs: 'Alz Millions, Extreme Cores, Mithril Gear, Astral Bikes', delivery_method: 'in_game_meetup' },
      { id: 'albion_item', name: 'Albion Online (Silver & T8 Gear)', publisher: 'Sandbox Interactive', platform: 'PC / Mobile', popular_specs: 'Silver Millions, T8.3 Masterpiece Gear, Battle Mounts', delivery_method: 'in_game_meetup' },
      { id: 'diablo_item', name: 'Diablo IV / D2R (Gold & Runes)', publisher: 'Blizzard', platform: 'Cross-platform', popular_specs: 'D4 Gold & Boss Materials, D2R High Runes (Jah/Ber), Rare Bases', delivery_method: 'in_game_meetup' }
    ]
  }
];

/**
 * Dynamic Form Schemas for Listings
 */
export const DYNAMIC_FIELD_SCHEMAS = {
  // 1. In-game Items Global Schema
  ingame_item: {
    category_type: 'ingame_item',
    required_fields: [
      { key: 'item_name', label: 'ชื่อไอเทม / สินค้า', type: 'text', placeholder: 'เช่น Butterfly Knife Fade (Factory New) หรือ 50,000,000 Zeny' },
      { key: 'item_category', label: 'หมวดหมู่อย่อยของไอเทม', type: 'select', options: [
        { value: 'skin_cosmetic', label: 'สกิน / อาวุธแฟชั่น / มีด / ถุงมือ' },
        { value: 'in_game_currency', label: 'เงินในเกม (Zeny, Gold, Alz, Platinum, Divine Orb)' },
        { value: 'equipment_gear', label: 'อุปกรณ์สวมใส่ / อาวุธบวกสูง / เครื่องประดับ' },
        { value: 'consumable_material', label: 'ผลไม้ปีศาจ / หินตีบวก / กล่องสุ่ม / วัตถุดิบบอส' },
        { value: 'collectible_pet', label: 'สัตว์เลี้ยง / สัตว์ขี่ (Huge Pets, Battle Mounts)' }
      ]},
      { key: 'quantity', label: 'จำนวนหน่วย / จำนวนชิ้น', type: 'text', placeholder: 'เช่น 1 ชิ้น หรือ 100,000,000 Zeny หรือ 50 Divine Orbs' },
      { key: 'server_and_channel', label: 'เซิร์ฟเวอร์ และ แชนแนล', type: 'text', placeholder: 'เช่น Server: Freya, Channel: 1 หรือ Server: Asia-East' },
      { key: 'trade_delivery_method', label: 'วิธีการส่งมอบในเกม', type: 'select', options: [
        { value: 'steam_trade_url', label: 'ส่งผ่านลิงก์ Steam Trade Offer URL' },
        { value: 'in_game_meetup', label: 'นัดเจอตัวในเกมเพื่อเปิดหน้าต่างแลกเปลี่ยน (Trade Window)' },
        { value: 'in_game_mail', label: 'ส่งผ่านระบบตู้จดหมายภายในเกม (In-Game Mail)' },
        { value: 'in_game_market', label: 'นัดรับผ่านตลาดกลาง หรือตั้งแผงร้านค้าในเกม' }
      ]},
      { key: 'seller_in_game_id', label: 'ชื่อตัวละครในเกมของผู้ขาย (IGN / Character Name / Trade URL)', type: 'text', placeholder: 'เช่น ShadowSlayerTH หรือ https://steamcommunity.com/tradeoffer/new/...' },
      { key: 'delivery_instructions', label: 'เวลานัดหมายและข้อกำหนดการส่งมอบ', type: 'textarea', placeholder: 'เช่น สะดวกส่งของช่วง 19:00 - 23:00 น. หรือ ผู้ซื้อต้องมีเลเวล 50 ขึ้นไปจึงจะแลกเปลี่ยนได้' }
    ]
  },

  // 2. RoV Account
  rov: {
    category_type: 'individual_game',
    required_fields: [
      { key: 'login_type', label: 'ประเภทการผูกมัดไอดี', type: 'select', options: [
        { value: 'garena_clean', label: 'Garena สะอาด (ไม่ติดอีเมล / ไม่ติดเบอร์)' },
        { value: 'garena_email_changeable', label: 'Garena เปลี่ยนอีเมลและเบอร์ได้' },
        { value: 'facebook_clean', label: 'ผูก Facebook ปลดเบอร์แล้ว พร้อมมอบบัญชี' }
      ]},
      { key: 'hero_count', label: 'จำนวนฮีโร่ที่มี', type: 'number', placeholder: 'เช่น 120' },
      { key: 'skin_count', label: 'จำนวนสกินรวม', type: 'number', placeholder: 'เช่น 280' },
      { key: 'dimension_breaker_skins', label: 'สกิน Dimension Breaker', type: 'text', placeholder: 'เช่น Murad, Nakroth, Violet' },
      { key: 'collab_skins', label: 'สกิน Collab อนิเมะ / ลิมิเต็ด', type: 'text', placeholder: 'เช่น Demon Slayer, Bleach, Sailor Moon, SAO' },
      { key: 'highest_rank', label: 'แรงค์สูงสุดในประวัติ', type: 'select', options: [
        { value: 'Glorious Ruler', label: 'Glorious Ruler (100+ ดาว)' },
        { value: 'Supreme Conqueror', label: 'Supreme Conqueror (50+ ดาว)' },
        { value: 'Conqueror', label: 'Conqueror' },
        { value: 'Commander', label: 'Commander' },
        { value: 'Diamond', label: 'Diamond' }
      ]}
    ]
  },

  // 3. Roblox Account
  roblox: {
    category_type: 'individual_game',
    required_fields: [
      { key: 'current_level', label: 'เลเวลตัวละครในแมพหลัก (เช่น Blox Fruits)', type: 'text', placeholder: 'เช่น 2550 (Max Level)' },
      { key: 'fighting_styles', label: 'รูปแบบการต่อสู้ที่ปลดล็อก', type: 'text', placeholder: 'เช่น Godhuman, Dragon Talon, Electric Claw' },
      { key: 'mythical_fruits', label: 'ผลไม้ปีศาจระดับ Mythical', type: 'text', placeholder: 'เช่น Kitsune, Dragon, Leopard, Dough (ตื่นครบ)' },
      { key: 'owned_gamepasses', label: 'Gamepass ที่ครอบครอง', type: 'text', placeholder: 'เช่น Dark Blade, 2x Mastery, 2x Money, Fast Boats' },
      { key: 'has_voice_chat', label: 'ระบบ Voice Chat (ยืนยันบัตรแล้ว)', type: 'select', options: [
        { value: 'yes', label: 'มี Voice Chat (ยืนยันตัวตนแล้ว)' },
        { value: 'no', label: 'ไม่มี Voice Chat' }
      ]},
      { key: 'has_korblox_headless', label: 'ชิ้นส่วน Korblox / Headless', type: 'text', placeholder: 'เช่น Korblox Deathspeaker, Headless Horseman (หากมี)' }
    ]
  },

  // 4. Valorant Account
  valorant: {
    category_type: 'individual_game',
    required_fields: [
      { key: 'region', label: 'โซนเซิร์ฟเวอร์', type: 'select', options: [
        { value: 'AP', label: 'Asia-Pacific (AP / Thailand)' },
        { value: 'NA', label: 'North America (NA)' },
        { value: 'EU', label: 'Europe (EU)' }
      ]},
      { key: 'has_oge', label: 'สถานะอีเมลแรก (OGE - Original Email)', type: 'select', options: [
        { value: 'yes_with_welcome_mail', label: 'มี OGE แท้ พร้อมอีเมลต้อนรับฉบับแรก (First Mail)' },
        { value: 'yes_changeable', label: 'เปลี่ยนอีเมลได้ทันที' },
        { value: 'no_oge', label: 'ไม่มี OGE (ไอดีมือสองเป็นต้นไป)' }
      ]},
      { key: 'champions_skins', label: 'สกินลิมิเต็ด Champions ประจำปี', type: 'text', placeholder: 'เช่น Champions 2021 Vandal, Champions 2024 Karambit' },
      { key: 'premium_melee', label: 'มีดพรีเมียม / อาวุธระยะประชิด', type: 'text', placeholder: 'เช่น Kuronami No Yaiba, Ignite Fan, Ruin Dagger' },
      { key: 'current_rank', label: 'แรงค์ปัจจุบัน', type: 'text', placeholder: 'เช่น Immortal 2 หรือ Ascendant 3' }
    ]
  },

  // 5. Genshin / HSR / ZZZ
  genshin: {
    category_type: 'individual_game',
    required_fields: [
      { key: 'server', label: 'เซิร์ฟเวอร์', type: 'select', options: [
        { value: 'Asia', label: 'Asia' },
        { value: 'America', label: 'America' },
        { value: 'Europe', label: 'Europe' },
        { value: 'TW_HK_MO', label: 'TW/HK/MO' }
      ]},
      { key: 'adventure_rank', label: 'ระดับการผจญภัย (AR)', type: 'number', placeholder: 'เช่น 60' },
      { key: 'c6_characters', label: 'ตัวละคร 5 ดาวระดับ C6 (หากมี)', type: 'text', placeholder: 'เช่น Furina C6, Raiden Shogun C2' },
      { key: 'five_star_count', label: 'จำนวนตัวละคร 5 ดาวรวม', type: 'number', placeholder: 'เช่น 28' },
      { key: 'deadlinks', label: 'สถานะ Deadlinks (การผูกมัดภายนอก)', type: 'select', options: [
        { value: 'clean_no_deadlinks', label: 'สะอาด 100% (No Deadlinks ปลอดการเชื่อมต่อ PSN/Google)' },
        { value: 'has_deadlink', label: 'มี Deadlink (ระบุในรายละเอียด)' }
      ]},
      { key: 'username_set', label: 'การตั้งชื่อผู้ใช้ถาวร (Username)', type: 'select', options: [
        { value: 'unset', label: 'ยังไม่ตั้ง Username (Unset - ปลอดภัยสูงสุด)' },
        { value: 'set', label: 'ตั้ง Username เรียบร้อยแล้ว' }
      ]}
    ]
  },

  // 6. Steam Library Account
  steam_library: {
    category_type: 'game_library',
    required_fields: [
      { key: 'total_games_count', label: 'จำนวนเกมแท้ทั้งหมดในคลัง', type: 'number', placeholder: 'เช่น 120' },
      { key: 'notable_aaa_games', label: 'รายชื่อเกมฟอร์มยักษ์ระดับ AAA ในคลัง', type: 'textarea', placeholder: 'เช่น Black Myth: Wukong, Elden Ring, Cyberpunk 2077, GTA V, Red Dead Redemption 2' },
      { key: 'steam_level', label: 'ระดับเลเวลบัญชี Steam', type: 'number', placeholder: 'เช่น 55' },
      { key: 'cs2_prime_status', label: 'สถานะ CS2 Prime', type: 'select', options: [
        { value: 'yes', label: 'มีสถานะ Prime Status แท้' },
        { value: 'no', label: 'ไม่มี' }
      ]},
      { key: 'vac_status', label: 'สถานะระบบตรวจจับการโกง (VAC Status)', type: 'select', options: [
        { value: 'clean', label: 'สะอาด 100% (In Good Standing / No VAC Bans)' },
        { value: 'banned', label: 'มีประวัติการแบน (Banned)' }
      ]},
      { key: 'has_first_cdkey', label: 'หลักฐาน CD-Key เกมแรกที่เปิดใช้งาน', type: 'select', options: [
        { value: 'yes', label: 'มีรูปหรือรหัส First CD-Key มอบให้' },
        { value: 'no', label: 'ไม่มี' }
      ]}
    ]
  },

  // 7. PlayStation Network (PSN)
  psn: {
    category_type: 'game_library',
    required_fields: [
      { key: 'psn_region', label: 'โซนบัญชี PSN', type: 'select', options: [
        { value: 'TH', label: 'Thailand (โซน 3)' },
        { value: 'US', label: 'United States (โซน 1)' },
        { value: 'JP', label: 'Japan (โซน 2)' }
      ]},
      { key: 'ps_plus_tier', label: 'ระดับสมาชิก PS Plus', type: 'select', options: [
        { value: 'Deluxe', label: 'PlayStation Plus Deluxe' },
        { value: 'Extra', label: 'PlayStation Plus Extra' },
        { value: 'Essential', label: 'PlayStation Plus Essential' },
        { value: 'None', label: 'ไม่มีสมาชิกภาพคงเหลือ' }
      ]},
      { key: 'ps_plus_expiry_date', label: 'วันหมดอายุของสมาชิก PS Plus', type: 'text', placeholder: 'เช่น 2027-12-31 หรือ ระบุว่าไม่มี' },
      { key: 'platinum_trophy_count', label: 'จำนวนถ้วยรางวัล Platinum', type: 'number', placeholder: 'เช่น 15' },
      { key: 'has_dob', label: 'ข้อมูลวันเดือนปีเกิดตั้งต้น (Date of Birth)', type: 'select', options: [
        { value: 'yes', label: 'มีวันเดือนปีเกิดที่ใช้สมัครให้ (สำคัญสำหรับติดต่อ Sony Support)' },
        { value: 'no', label: 'ไม่มี' }
      ]}
    ]
  }
};
