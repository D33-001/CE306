/* ==========================================================================
   VAULTX ESCROW MARKETPLACE — FRONTEND APPLICATION ENGINE
   Connects directly to Express Backend REST API v2.0 (/api/v1/*)
   ========================================================================== */

const I18N = {
  th: {
    nav_market: 'ตลาดซื้อขาย',
    nav_chats: 'ห้องแชทรวม',
    nav_escrow: 'ห้องคนกลาง Escrow',
    nav_sell: '+ ลงขาย',
    nav_blacklist: 'เช็กประวัติโกง',
    wallet_label: 'ยอดเงิน:',
    btn_topup: '+ เติม',
    role_label: 'บทบาท:',
    tier_all: 'ทั้งหมด',
    tier_individual: 'ไอดีเกมเดี่ยว',
    tier_library: 'คลังเกมรวม',
    tier_item: 'ไอเทม & เงินในเกม',
    filter_title: 'ตัวกรองละเอียด',
    filter_reset: 'ล้างค่า',
    filter_search: 'ค้นหาชื่อไอดี, สกิน, เซิร์ฟเวอร์...',
    filter_price: 'ช่วงราคา (THB)',
    filter_status_options: 'เงื่อนไขการซื้อขาย',
    filter_negotiable: 'ต่อรองราคาได้ (Negotiable)',
    filter_verified_only: 'แอดมินตรวจแล้ว (Verified)',
    sort_label: 'เรียงตาม:',
    sort_newest: 'ลงประกาศล่าสุด',
    sort_price_asc: 'ราคา: ต่ำ สูง',
    sort_price_desc: 'ราคา: สูง ต่ำ',
    sort_trust: 'คะแนนผู้ขายสูงสุด',
    back_to_market: 'กลับหน้าตลาดซื้อขาย',
    buy_now_escrow: 'ซื้อทันทีผ่าน Escrow (ล็อกเงิน 100%)',
    escrow_fee_note: 'ค่าธรรมเนียมคนกลาง',
    warranty_days: 'ประกันดึงคืน',
    days_unit: 'วัน',
    spec_table_title: 'ข้อมูลสเปกบัญชีและทรัพย์สิน (NoSQL Inventory Specs)',
    skin_list_title: 'รายการสกินแรร์และราคาประเมินรายชิ้น',
    chat_header_title: 'ห้องแชทเจรจาและต่อรองราคาประจำสินค้า',
    chat_dlp_notice: 'ระบบ DLP ป้องกันการส่งเลขบัญชี/Line นอกระบบอัตโนมัติ',
    offer_input_placeholder: 'ระบุราคาที่ต้องการต่อรอง (฿)...',
    btn_send_offer: 'ยื่นต่อรองราคา',
    btn_send_msg: 'ส่งข้อความ',
    msg_placeholder: 'พิมพ์ข้อความสอบถามผู้ขาย...'
  },
  en: {
    nav_market: 'Marketplace',
    nav_chats: 'Chat Hub',
    nav_escrow: 'Escrow Rooms',
    nav_sell: '+ Sell Listing',
    nav_blacklist: 'Blacklist Check',
    wallet_label: 'Balance:',
    btn_topup: '+ Top-up',
    role_label: 'Role:',
    tier_all: 'All Categories',
    tier_individual: 'Single Game IDs',
    tier_library: 'Platform Libraries',
    tier_item: 'In-Game Items & Currency',
    filter_title: 'Filters',
    filter_reset: 'Reset',
    filter_search: 'Search title, skins, server...',
    filter_price: 'Price Range (THB)',
    filter_status_options: 'Trade Terms',
    filter_negotiable: 'Negotiable price',
    filter_verified_only: 'Admin Verified only',
    sort_label: 'Sort by:',
    sort_newest: 'Newest listed',
    sort_price_asc: 'Price: Low High',
    sort_price_desc: 'Price: High Low',
    sort_trust: 'Seller Trust Score',
    back_to_market: 'Back to Marketplace',
    buy_now_escrow: 'Buy via Escrow (100% Fund Lock)',
    escrow_fee_note: 'Escrow Fee',
    warranty_days: 'Buyback Warranty',
    days_unit: 'Days',
    spec_table_title: 'Account & Asset Specifications (NoSQL Inventory Specs)',
    skin_list_title: 'Included Skins & Individual Valuation',
    chat_header_title: 'Item-Bound Negotiation & Offer Desk',
    chat_dlp_notice: 'DLP active: Off-platform bank/Line bypass is automatically masked',
    offer_input_placeholder: 'Enter offer price in THB...',
    btn_send_offer: 'Submit Offer',
    btn_send_msg: 'Send',
    msg_placeholder: 'Ask seller about account specs or delivery...'
  }
};

const SPEC_KEY_LABELS = {
  rank: { th: 'แรงก์ปัจจุบัน (Rank)', en: 'Current Rank' },
  region: { th: 'โซนเซิร์ฟเวอร์ (Region)', en: 'Server Region' },
  bind_type: { th: 'สถานะการผูกบัญชี (Bind Status)', en: 'Account Bind Status' },
  trust_rating: { th: 'ระดับความปลอดภัย (Safety Grade)', en: 'Security & Safety Grade' },
  estimated_market_value: { th: 'ราคาประเมินตลาดกลาง (Est. Value)', en: 'Estimated Market Value' },
  hero_count: { th: 'จำนวนฮีโร่ (Heroes)', en: 'Total Heroes' },
  skin_count: { th: 'จำนวนสกินทั้งหมด (Skins)', en: 'Total Skins' },
  skins_count: { th: 'จำนวนสกินทั้งหมด (Skins)', en: 'Total Skins' },
  dimension_breaker_skins: { th: 'สกินแรร์ระดับสูงสุด', en: 'Ultimate / Rare Skins' },
  current_level: { th: 'เลเวลตัวละคร (Level)', en: 'Character Level' },
  fighting_styles: { th: 'ศิลปะการต่อสู้ (Fighting Styles)', en: 'Fighting Styles' },
  mythical_fruits: { th: 'ผลปีศาจระดับ Mythical', en: 'Mythical Fruits' },
  gamepasses: { th: 'Gamepass ที่มีในไอดี', en: 'Unlocked Gamepasses' },
  adventure_rank: { th: 'Adventure Rank (AR)', en: 'Adventure Rank (AR)' },
  server: { th: 'เซิร์ฟเวอร์ (Server)', en: 'Server' },
  c6_characters: { th: 'ตัวละครกลุ่มดาวเต็ม (C6/C2)', en: 'Max Constellation Characters' },
  five_star_count: { th: 'จำนวนตัวละคร 5 ดาว', en: 'Total 5-Star Characters' },
  deadlinks: { th: 'สถานะการผูกบัญชีภายนอก (Deadlinks)', en: 'External Deadlinks Status' },
  username_set: { th: 'สถานะการตั้ง Username', en: 'Username Status' },
  total_games_count: { th: 'จำนวนเกมแท้ในคลัง (Games)', en: 'Total Games in Library' },
  steam_level: { th: 'เลเวลโปรไฟล์ Steam', en: 'Steam Profile Level' },
  vac_status: { th: 'ประวัติการแบน VAC / Game Ban', en: 'VAC / Game Ban Record' },
  cs2_prime_status: { th: 'สถานะ CS2 Prime', en: 'CS2 Prime Status' },
  notable_aaa_games: { th: 'เกมระดับ AAA เด่นในคลัง', en: 'Notable AAA Titles' },
  psn_region: { th: 'โซนบัญชี PlayStation', en: 'PlayStation Store Region' },
  ps_plus_tier: { th: 'ระดับสมาชิก PS Plus', en: 'PS Plus Membership Tier' },
  ps_plus_expiry_date: { th: 'วันหมดอายุ PS Plus', en: 'PS Plus Expiry Date' },
  platinum_trophy_count: { th: 'จำนวนถ้วยรางวัล Platinum', en: 'Platinum Trophies' },
  has_dob: { th: 'ข้อมูลวันเดือนปีเกิดตั้งต้น (Original DOB)', en: 'Original Date of Birth Included' },
  item_name: { th: 'ชื่อไอเทม / สกุลเงิน', en: 'Item / Currency Name' },
  item_category: { th: 'ประเภทไอเทม', en: 'Item Category' },
  quantity: { th: 'จำนวนที่ส่งมอบ', en: 'Delivery Quantity' },
  server_and_channel: { th: 'เซิร์ฟเวอร์และจุดนัดรับ', en: 'Server & Trade Location' },
  trade_delivery_method: { th: 'ช่องทางการส่งมอบ (Delivery)', en: 'Delivery Method' },
  seller_in_game_id: { th: 'ชื่อตัวละครผู้ขาย / Steam Trade URL', en: 'Seller In-Game ID / Trade URL' },
  delivery_instructions: { th: 'เงื่อนไขการนัดรับในเกม', en: 'In-Game Trade Instructions' }
};

class VaultApp {
  constructor() {
    this.lang = 'th';
    this.currentView = 'market'; // 'market' | 'detail' | 'escrow' | 'sell' | 'blacklist'
    this.viewMode = 'grid'; // 'grid' | 'table'
    this.currentUser = null;

    // Marketplace state
    this.listings = [];
    this.allCatalogListings = [];
    this.marketPage = 1;
    this.pageSize = 6;
    let initialSaved = ['list_val_figma_001', 'list_val_figma_004'];
    try {
      const storedSaved = localStorage.getItem('vaultx_saved');
      if (storedSaved) {
        const parsed = JSON.parse(storedSaved);
        if (Array.isArray(parsed)) initialSaved = parsed;
      }
    } catch (e) {}
    this.savedIds = new Set(initialSaved);
    this.filters = {
      category: 'all',
      platform: 'all',
      q: '',
      min_price: '',
      max_price: '',
      negotiable: false,
      verifiedOnly: false,
      sort: 'newest',
      tiers: new Set(),
      cleanliness: new Set()
    };

    // Wallet & Checkout & Seller Profile & Support state
    this.walletTab = 'topup';
    this.walletScope = 'all'; // 'all' | 'user'
    this.topupMethod = 'promptpay';
    this.topupAmount = 5000;
    this.walletHistory = [];
    this.checkoutListing = null;
    this.checkoutPayMethod = 'wallet';
    this.activeSellerName = 'ViperStore';
    this.sellerReviews = [
      { id: 'rev_1', seller: 'ViperStore', buyer: 'Nont (Trader TH)', game: 'VALORANT', rating: 5, comment: 'ไอดีตรงปกทุกชิ้น คนกลางตรวจสอบไวมาก สับเปลี่ยนอีเมลต้นฉบับเรียบร้อยใน 10 นาที', date: '2 วันที่แล้ว' },
      { id: 'rev_2', seller: 'RadiantStore', buyer: 'Korn_ValoTH', game: 'VALORANT', rating: 5, comment: 'ผู้ขายให้ข้อมูลครบถ้วน ส่งมอบรหัสสำรองและใบเสร็จเติมเกมครบ แนะนำครับ', date: '5 วันที่แล้ว' },
      { id: 'rev_3', seller: 'SiamVault', buyer: 'Tae_Esports', game: 'CS2', rating: 5, comment: 'ปลอดภัย 100% ซื้อผ่านระบบ Escrow สบายใจมากครับ', date: '1 สัปดาห์ที่แล้ว' }
    ];
    this.supportTab = 'how_escrow';
    this.supportTickets = [
      {
        ticket_id: 'TCK-8821',
        subject: 'สอบถามขั้นตอนการเปลี่ยนอีเมลตั้งต้น (OGE) ในห้องคนกลาง',
        status: 'RESOLVED · ตอบกลับโดย Certified Inspector',
        updated_at: '15 นาทีที่แล้ว'
      }
    ];

    // Active Full-Page Detail & Chat state
    this.activeListing = null;
    this.activeThread = null;
    this.activeOffer = null;

    // Active Escrow Room state
    this.escrows = [];
    this.activeEscrowId = null;
    this.activeEscrowDetail = null;
    this.decryptedCreds = null;

    // Sell Form state
    this.categoriesCatalog = [];
    this.sellCategory = 'individual_game';
    this.sellPlatform = 'valorant';
    this.sellSchema = null;

    // Blacklist state
    this.blacklistItems = [];
    this.blacklistQuery = '';

    // Unified Chat Hub (ห้องแชทรวม) state
    this.myThreads = [];
    this.lobbyMessages = [];
    this.activeChatChannel = 'PUBLIC_LOBBY'; // 'PUBLIC_LOBBY' or thread_id
    this.chatChannelFilter = 'all'; // 'all' | 'lobby' | 'deals'
    this.lobbyTag = 'WTB / ตั้งรับ';
    this.lobbyLinkedListing = '';
  }

  specLabel(key) {
    const entry = SPEC_KEY_LABELS[key];
    if (entry && typeof entry === 'object') {
      return entry[this.lang] || entry.th || key;
    }
    return entry || key.replace(/_/g, ' ').toUpperCase();
  }

  tr(thText, enText) {
    return this.lang === 'en' ? enText : thText;
  }

  t(key) {
    return (I18N[this.lang] && I18N[this.lang][key]) || key;
  }

  formatTHB(num) {
    const val = Number(num || 0);
    return '฿' + val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  toast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
      el.remove();
    }, 3600);
  }

  async init() {
    this.isAuthenticated = localStorage.getItem('vx_auth') === '1';
    await Promise.all([this.fetchAuthConfig(), this.fetchCurrentUser()]);
    await Promise.all([
      this.fetchListings(),
      this.fetchEscrows(),
      this.fetchCategories(),
      this.fetchChatHubData(),
      this.fetchWalletHistory()
    ]);
    this.updateHeaderTranslations();
    this.render();
  }

  async fetchCurrentUser() {
    try {
      const res = await fetch('/api/v1/auth/me');
      const json = await res.json();
      if (json.success) {
        this.currentUser = json.data;
        this.updateWalletHeader();
      }
    } catch (e) {
      console.error('Failed to load user', e);
    }
  }

  updateWalletHeader() {
    const balEl = document.getElementById('header-wallet-balance');
    if (balEl && this.currentUser) {
      balEl.textContent = this.formatTHB(this.currentUser.wallet_balance);
    }
    const roleSelect = document.getElementById('role-select');
    if (roleSelect && this.currentUser) {
      roleSelect.value = this.currentUser.user_id;
    }
    this.renderAuthHeader();
  }

  updateHeaderTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
      langBtn.textContent = this.lang === 'th' ? 'TH' : 'EN';
    }
    this.renderAuthHeader();
  }

  toggleLanguage() {
    this.lang = this.lang === 'th' ? 'en' : 'th';
    this.updateHeaderTranslations();
    this.render();
  }

  async switchRole(userId) {
    try {
      const res = await fetch('/api/v1/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const json = await res.json();
      if (json.success) {
        this.currentUser = json.data;
        this.isAuthenticated = true;
        localStorage.setItem('vx_auth', '1');
        this.updateWalletHeader();
        this.toast(this.tr(`สลับมุมมองเป็น: ${this.currentUser.display_name}`, `Switched role to: ${this.currentUser.display_name}`));
        if (this.currentView === 'wallet') {
          await this.loadWalletView();
        } else {
          this.render();
        }
      }
    } catch (e) {
      this.toast(this.tr('ไม่สามารถสลับบทบาทได้', 'Failed to switch role'));
    }
  }

  async topUpWallet() {
    try {
      const res = await fetch('/api/v1/auth/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 10000 })
      });
      const json = await res.json();
      if (json.success) {
        this.currentUser = json.data;
        this.updateWalletHeader();
        this.toast(this.tr(`เติมเงินสำเร็จ +฿10,000 (คงเหลือ ${this.formatTHB(this.currentUser.wallet_balance)})`, `Top-up +฿10,000 successful (Balance ${this.formatTHB(this.currentUser.wallet_balance)})`));
      }
    } catch (e) {
      this.toast(this.tr('เติมเงินไม่สำเร็จ', 'Top-up failed'));
    }
  }

  async fetchListings() {
    const params = new URLSearchParams();
    if (this.filters.category !== 'all' && this.filters.category !== 'saved') {
      params.set('category', this.filters.category);
    }
    if (this.filters.platform !== 'all') params.set('platform', this.filters.platform);
    if (this.filters.q.trim()) params.set('q', this.filters.q.trim());
    if (this.filters.min_price) params.set('min_price', this.filters.min_price);
    if (this.filters.max_price) params.set('max_price', this.filters.max_price);
    if (this.filters.negotiable) params.set('negotiable', 'true');
    params.set('sort', this.filters.sort);
    params.set('status', 'all');

    try {
      const res = await fetch(`/api/v1/listings?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        let items = json.data || [];
        if (this.filters.verifiedOnly) {
          items = items.filter(i => i.verification_tier === 'admin_verified');
        }
        this.listings = items;
        if (this.filters.category === 'all' && this.filters.platform === 'all' && !this.filters.q.trim()) {
          this.allCatalogListings = json.data || [];
          // Prune any stale savedIds that do not exist in catalog
          const validSet = new Set(this.allCatalogListings.map(x => x.listing_id));
          for (const id of [...this.savedIds]) {
            if (!validSet.has(id)) this.savedIds.delete(id);
          }
        }
        const countEl = document.getElementById('nav-market-count');
        if (countEl) countEl.textContent = this.listings.length;
      }
    } catch (e) {
      console.error(e);
    }
  }

  async fetchEscrows() {
    try {
      const res = await fetch('/api/v1/escrow');
      const json = await res.json();
      if (json.success) {
        this.escrows = json.data || [];
        const countEl = document.getElementById('nav-escrow-count');
        if (countEl) countEl.textContent = this.escrows.length > 0 ? this.escrows.length : 1;
        if (!this.activeEscrowId && this.escrows.length > 0) {
          this.activeEscrowId = this.escrows[0].escrow_id;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async fetchCategories() {
    try {
      const res = await fetch('/api/v1/categories');
      const json = await res.json();
      if (json.success) {
        this.categoriesCatalog = json.data || [];
      }
    } catch (e) {
      console.error(e);
    }
  }

  async navigate(view) {
    this.currentView = view;
    document.querySelectorAll('#main-nav .nav-link').forEach(btn => {
      const v = btn.getAttribute('data-view');
      btn.classList.toggle('active', v === view || (['detail', 'checkout', 'seller_profile', 'wishlist', 'support'].includes(view) && v === 'market'));
    });

    if (view === 'chats') {
      await this.loadChatsHub();
    } else if (view === 'escrow') {
      await this.loadEscrowWorkspace();
    } else if (view === 'sell') {
      await this.loadSellSchema(this.sellPlatform);
    } else if (view === 'blacklist') {
      await this.searchBlacklist('');
    } else if (view === 'wallet') {
      await this.loadWalletView();
    } else {
      this.render();
    }
    window.scrollTo(0, 0);
  }

  // ==========================================================================
  // VIEW 1: MARKETPLACE CATALOG (GRID + TABLE VIEW)
  // ==========================================================================
  setCategoryFilter(cat) {
    this.filters.category = cat;
    this.filters.platform = 'all';
    this.marketPage = 1;
    this.fetchListings().then(() => this.render());
  }

  setPlatformFilter(plat) {
    this.filters.platform = plat;
    this.marketPage = 1;
    this.fetchListings().then(() => this.render());
  }

  resetFilters() {
    this.filters = {
      category: 'all',
      platform: 'all',
      q: '',
      min_price: '',
      max_price: '',
      negotiable: false,
      verifiedOnly: false,
      tiers: new Set(),
      cleanliness: new Set(),
      sort: 'newest'
    };
    this.marketPage = 1;
    this.fetchListings().then(() => this.render());
  }

  toggleTierFilter(tier) {
    if (this.filters.tiers.has(tier)) {
      this.filters.tiers.delete(tier);
    } else {
      this.filters.tiers.add(tier);
    }
    this.marketPage = 1;
    this.render();
  }

  toggleCleanFilter(tag) {
    if (this.filters.cleanliness.has(tag)) {
      this.filters.cleanliness.delete(tag);
    } else {
      this.filters.cleanliness.add(tag);
    }
    this.marketPage = 1;
    this.render();
  }

  toggleFavorite(listingId) {
    if (this.savedIds.has(listingId)) {
      this.savedIds.delete(listingId);
      this.toast(this.tr('ลบออกจากรายการที่บันทึกไว้แล้ว', 'Removed from saved Wishlist'));
    } else {
      this.savedIds.add(listingId);
      this.toast(this.tr('บันทึกรายการเข้าสู่ Wishlist เรียบร้อยแล้ว', 'Saved to Wishlist'));
    }
    try {
      localStorage.setItem('vaultx_saved', JSON.stringify([...this.savedIds]));
    } catch (e) {}
    this.render();
  }

  setMarketPage(page) {
    this.marketPage = page;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getFilteredListings() {
    return this.listings.filter(item => {
      if (this.filters.category === 'saved' && !this.savedIds.has(item.listing_id)) {
        return false;
      }
      if (this.filters.tiers && this.filters.tiers.size > 0) {
        const rankText = ((item.rank_badge || '') + ' ' + ((item.specs_preview && item.specs_preview.rank) || '') + ' ' + (item.title || '')).toLowerCase();
        const matchesTier = [...this.filters.tiers].some(t => rankText.includes(t.toLowerCase()));
        if (!matchesTier) return false;
      }
      if (this.filters.cleanliness && this.filters.cleanliness.size > 0) {
        const itemTags = (item.cleanliness_tags || []).map(x => x.toLowerCase());
        const matchesClean = [...this.filters.cleanliness].every(reqTag =>
          itemTags.some(t => t.includes(reqTag.toLowerCase()))
        );
        if (!matchesClean) return false;
      }
      return true;
    });
  }

  applySidebarFilters() {
    const qEl = document.getElementById('f-search');
    const minEl = document.getElementById('f-min');
    const maxEl = document.getElementById('f-max');
    const negEl = document.getElementById('f-neg');
    const verEl = document.getElementById('f-ver');

    if (qEl) this.filters.q = qEl.value;
    if (minEl) this.filters.min_price = minEl.value;
    if (maxEl) this.filters.max_price = maxEl.value;
    if (negEl) this.filters.negotiable = negEl.checked;
    if (verEl) this.filters.verifiedOnly = verEl.checked;

    this.marketPage = 1;
    this.fetchListings().then(() => this.render());
  }

  changeSort(val) {
    this.filters.sort = val;
    this.marketPage = 1;
    this.fetchListings().then(() => this.render());
  }

  setViewMode(mode) {
    this.viewMode = mode;
    this.render();
  }

  extractCompactSpecsSummary(item) {
    const s = item.specs_preview || {};
    const parts = [];
    if (s.rank) parts.push(s.rank);
    if (s.bind_type) parts.push(s.bind_type);
    if (s.hero_count) parts.push(`${s.hero_count} Heroes`);
    if (s.skin_count) parts.push(`${s.skin_count} Skins`);
    if (s.current_level) parts.push(`Lv.${s.current_level}`);
    if (s.adventure_rank) parts.push(`AR ${s.adventure_rank}`);
    if (s.total_games_count) parts.push(`${s.total_games_count} Games`);
    if (s.steam_level) parts.push(`Steam Lv.${s.steam_level}`);
    if (s.ps_plus_tier) parts.push(`PS+ ${s.ps_plus_tier}`);
    if (s.quantity) parts.push(s.quantity);
    if (s.server_and_channel) parts.push(s.server_and_channel);
    return parts.slice(0, 3).join(' · ') || 'พร้อมส่งมอบผ่านระบบคนกลาง Escrow';
  }

  productImage(item) {
    if (item && item.image_url) return item.image_url;
    const t = ((item.weapon_type || '') + ' ' + (item.title || '') + ' ' + (item.game_type || '') + ' ' + (item.platform_id || '')).toLowerCase();
    const map = [
      ['karambit', 'karambit.png'],
      ['reaver', 'reaver.png'],
      ['oni', 'oni.png'],
      ['kuronami', 'kuronami.png'],
      ['elderflame', 'elderflame.png'],
      ['spectrum', 'spectrum.png'],
      ['valorant', 'kuronami.png'],
      ['cs2', 'cs2.jpg'],
      ['nakroth', 'rov_nakroth.jpg'],
      ['violet', 'rov_violet.jpg'],
      ['rov', 'rov_murad.jpg'],
      ['neuvillette', 'genshin_furina.jpg'],
      ['genshin', 'genshin_raiden.jpg'],
      ['ahri', 'lol_ahri.jpg'],
      ['lol', 'lol_yasuo.jpg'],
      ['elden', 'eldenring.jpg'],
      ['steam', 'steam.jpg'],
      ['psn', 'psn.jpg'],
      ['playstation', 'psn.jpg'],
      ['korblox', 'roblox_korblox.jpg'],
      ['roblox_item', 'roblox_bloxfruit.jpg'],
      ['roblox', 'roblox_kitsune.jpg'],
      ['ragnarok', 'ragnarok.jpg'],
      ['poe', 'poe.jpg'],
      ['path of exile', 'poe.jpg']
    ];
    const hit = map.find(m => t.includes(m[0]));
    return hit ? `/img/${hit[1]}` : '/img/kuronami.png';
  }

  renderMarketView() {
    const ico = {
      search: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
      chat: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
      shield: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      check: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M20 6L9 17l-5-5"/></svg>',
      heart: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
      heartSolid: '<svg width="15" height="15" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>'
    };

    const filteredListings = this.getFilteredListings();
    const totalItems = filteredListings.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / this.pageSize));
    if (this.marketPage > totalPages) this.marketPage = totalPages;
    const startIdx = (this.marketPage - 1) * this.pageSize;
    const pageItems = filteredListings.slice(startIdx, startIdx + this.pageSize);

    // Dynamic counts for sidebar
    const countTier = (kw) => this.listings.filter(item => {
      const rankText = ((item.rank_badge || '') + ' ' + ((item.specs_preview && item.specs_preview.rank) || '') + ' ' + (item.title || '')).toLowerCase();
      return rankText.includes(kw);
    }).length;
    const countClean = (kw) => this.listings.filter(item =>
      (item.cleanliness_tags || []).some(t => t.toLowerCase().includes(kw.toLowerCase()))
    ).length;

    const cardsHtml = pageItems.length > 0 ? pageItems.map(item => {
      const rank = item.rank_badge || (item.specs_preview && item.specs_preview.rank) || item.game_type;
      const skins = item.skins_count || (item.specs_preview && item.specs_preview.skin_count) || '';
      const tags = (item.cleanliness_tags || []).join('  /  ');
      const img = this.productImage(item);
      const isGenshinArt = img && img.includes('genshin_');
      const isCover = img && img.endsWith('.jpg') && !isGenshinArt;
      const isSaved = this.savedIds.has(item.listing_id);
      const safeSeller = (item.seller_name || 'VerifiedSeller').replace(/'/g, "\\'");
      return `
        <article class="pc" onclick="app.openListingDetail('${item.listing_id}')">
          <div class="pc-media" style="${isCover ? 'padding:0;' : isGenshinArt ? 'padding:6px 10px;' : ''}">
            ${img ? `<img src="${img}" class="${isCover ? 'cover-img' : ''}" alt="${item.title}" loading="lazy" />` : `<span class="pc-noimg">${item.game_type}</span>`}
            <span class="pc-rank">${rank}</span>
            <button class="pc-fav ${isSaved ? 'saved' : ''}" aria-label="Save" title="${this.tr('บันทึกเข้าสู่รายการโปรด', 'Save to Wishlist')}" onclick="event.stopPropagation();app.toggleFavorite('${item.listing_id}')">${isSaved ? ico.heartSolid : ico.heart}</button>
          </div>
          <div class="pc-body">
            <div class="pc-sub">${item.game_type} / ${item.region_tag || 'APAC'}${skins ? ' / ' + skins + ' ' + this.tr('รายการ', 'items') : ''}</div>
            <h3 class="pc-title">${item.title}</h3>
            <div class="pc-tags">${tags}</div>
            <div class="pc-seller">
              <span class="pc-seller-name" title="${this.tr('ดูโปรไฟล์และรีวิวผู้ขาย', 'View seller profile & reviews')}" onclick="event.stopPropagation();app.openSellerProfile('${safeSeller}')">${ico.check}${item.seller_name}</span>
              <span class="pc-seller-meta">${item.seller_trust}% ${this.tr('เชื่อถือ', 'trust')}, ${item.seller_deals || 0} ${this.tr('ดีล', 'deals')}</span>
            </div>
            <div class="pc-price-row">
              <span class="pc-price">${this.formatTHB(item.asking_price)}</span>
              <span class="pc-note">${item.negotiable ? this.tr('ต่อรองราคาได้', 'Negotiable') : this.tr('ราคาเน็ท', 'Fixed price')}<br>${this.tr('คุ้มครองโดย Escrow', 'Escrow protected')}</span>
            </div>
            <div class="pc-actions">
              ${(this.currentUser && this.currentUser.user_id === item.seller_id) ? `
                <div style="font-size:11.5px;color:var(--text-muted);padding:7px 0;width:100%;text-align:center;background:#18191f;border-radius:4px;">
                  ${this.tr('ประกาศของคุณ (Your Listing)', 'Your Listing')}
                </div>
              ` : `
                <button class="pc-btn ghost" onclick="event.stopPropagation();app.openNegotiateView('${item.listing_id}')">${ico.chat}<span>${this.tr('ต่อรองราคา', 'Negotiate')}</span></button>
                <button class="pc-btn solid" onclick="event.stopPropagation();app.openCheckoutView('${item.listing_id}')">${ico.shield}<span>${this.tr('ซื้อผ่าน Escrow', 'Buy via Escrow')}</span></button>
              `}
            </div>
          </div>
        </article>`;
    }).join('') : `
      <div class="vault-card" style="grid-column:1 / -1;text-align:center;padding:48px 24px;align-items:center;">
        <h3 style="font-size:16px;font-weight:700;">${this.tr('ไม่พบรายการที่ตรงกับตัวกรองของคุณ', 'No accounts match your current filters')}</h3>
        <p style="font-size:13px;color:var(--text-secondary);">${this.tr('ลองล้างตัวกรองด้านซ้าย หรือเปลี่ยนหมวดหมู่เกมเพื่อดูรายการทั้งหมด', 'Try resetting your sidebar filters or switching game categories.')}</p>
        <button class="btn-primary" style="margin-top:8px;" onclick="app.resetFilters()">${this.tr('ล้างตัวกรองทั้งหมด', 'Reset All Filters')}</button>
      </div>
    `;

    const cat = this.filters.category;
    const tabs = [
      ['all', this.tr('รายการทั้งหมด', 'All listings')],
      ['individual_game', this.tr('ไอดีเกมเดี่ยว', 'Single game IDs')],
      ['game_library', this.tr('คลังเกมรวม', 'Game libraries')],
      ['ingame_item', this.tr('ไอเทมในเกม', 'In-game items')],
      ['saved', `${this.tr('ที่บันทึกไว้', 'Saved')} (${this.savedIds.size})`]
    ].map(t => `<button class="cat-tab ${cat === t[0] ? 'active' : ''}" onclick="app.setCategoryFilter('${t[0]}')">${t[1]}</button>`).join('');

    const games = [
      ['all', this.tr('ทั้งหมด', 'All')],
      ['valorant', 'Valorant'],
      ['rov', 'RoV'],
      ['genshin', 'Genshin Impact'],
      ['lol', 'LoL'],
      ['roblox', 'Roblox'],
      ['steam_library', 'Steam'],
      ['psn', 'PSN'],
      ['cs2_item', 'CS2'],
      ['ragnarok_item', 'Ragnarok'],
      ['poe_item', 'Path of Exile']
    ].map(g => `<button class="game-link ${this.filters.platform === g[0] ? 'active' : ''}" onclick="app.setPlatformFilter('${g[0]}')">${g[1]}</button>`).join('');

    const pageBtns = [];
    if (this.marketPage > 1) {
      pageBtns.push(`<button onclick="app.setMarketPage(${this.marketPage - 1})">${this.tr('ก่อนหน้า', 'Prev')}</button>`);
    }
    for (let p = 1; p <= totalPages; p++) {
      pageBtns.push(`<button class="${this.marketPage === p ? 'on' : ''}" onclick="app.setMarketPage(${p})">${p}</button>`);
    }
    if (this.marketPage < totalPages) {
      pageBtns.push(`<button onclick="app.setMarketPage(${this.marketPage + 1})">${this.tr('ถัดไป', 'Next')}</button>`);
    }

    const showStart = totalItems === 0 ? 0 : startIdx + 1;
    const showEnd = Math.min(startIdx + this.pageSize, totalItems);

    return `
      <div class="market-subnav-bar">
        <div class="subnav-breadcrumb">
          <span class="crumb-root" style="cursor:pointer;" onclick="app.resetFilters()">${this.tr('ตลาดซื้อขาย', 'Marketplace')}</span>
          <span class="crumb-sep">/</span>
          <span class="crumb-current">${this.filters.platform === 'all' ? this.tr('สำรวจรายการทั้งหมด', 'Explore') : this.filters.platform.toUpperCase()}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <button class="btn-secondary" style="height:36px;padding:0 12px;font-size:12px;" onclick="app.navigate('wishlist')">
            ${this.tr('รายการโปรด / เปรียบเทียบ', 'Wishlist / Compare')} (${this.savedIds.size})
          </button>
          <div class="subnav-search-wrap">
            ${ico.search}
            <input type="text" id="f-search" class="subnav-search-input" placeholder="${this.tr('ค้นหาชื่อไอดี, สกินแรร์, เซิร์ฟเวอร์...', 'Search accounts, skins, servers')}" value="${this.filters.q}" onkeydown="if(event.key==='Enter') app.applySidebarFilters()" />
          </div>
        </div>
      </div>

      <div class="cat-bar">
        <div class="cat-tabs">${tabs}</div>
        <div class="game-links"><span class="game-links-label">${this.tr('เกม', 'Game')}</span>${games}</div>
      </div>

      <div class="mk-layout">
        <aside class="mk-filters">
          <div class="mk-f-head"><span>${this.tr('ตัวกรองสินค้า', 'Filters')}</span><button class="mk-reset" onclick="app.resetFilters()">${this.tr('ล้างค่า', 'Reset')}</button></div>

          <div class="mk-f-block">
            <div class="mk-f-title">${this.tr('ช่วงราคา (THB)', 'Price range')}</div>
            <div class="mk-price">
              <input id="f-min" type="number" placeholder="500" value="${this.filters.min_price}" onkeydown="if(event.key==='Enter') app.applySidebarFilters()" />
              <input id="f-max" type="number" placeholder="30000" value="${this.filters.max_price}" onkeydown="if(event.key==='Enter') app.applySidebarFilters()" />
            </div>
          </div>

          <div class="mk-f-block">
            <div class="mk-f-title">${this.tr('ระดับแรงค์บัญชี', 'Account tier')}</div>
            <label class="mk-chk"><input type="checkbox" ${this.filters.tiers.has('radiant') ? 'checked' : ''} onchange="app.toggleTierFilter('radiant')" /><span>Radiant</span><em>${countTier('radiant')}</em></label>
            <label class="mk-chk"><input type="checkbox" ${this.filters.tiers.has('immortal') ? 'checked' : ''} onchange="app.toggleTierFilter('immortal')" /><span>Immortal</span><em>${countTier('immortal')}</em></label>
            <label class="mk-chk"><input type="checkbox" ${this.filters.tiers.has('diamond') ? 'checked' : ''} onchange="app.toggleTierFilter('diamond')" /><span>Diamond</span><em>${countTier('diamond')}</em></label>
          </div>

          <div class="mk-f-block">
            <div class="mk-f-title">${this.tr('ความสะอาดของบัญชี', 'Login cleanliness')}</div>
            <label class="mk-chk"><input type="checkbox" ${this.filters.cleanliness.has('Original Owner') ? 'checked' : ''} onchange="app.toggleCleanFilter('Original Owner')" /><span>${this.tr('มือเดียว (Original owner)', 'Original owner')}</span><em>${countClean('Original Owner')}</em></label>
            <label class="mk-chk"><input type="checkbox" ${this.filters.cleanliness.has('Unlinked Email') ? 'checked' : ''} onchange="app.toggleCleanFilter('Unlinked Email')" /><span>${this.tr('พร้อมเปลี่ยนเมล (Unlinked)', 'Unlinked email')}</span><em>${countClean('Unlinked Email')}</em></label>
            <label class="mk-chk"><input type="checkbox" ${this.filters.cleanliness.has('Clean History') ? 'checked' : ''} onchange="app.toggleCleanFilter('Clean History')" /><span>${this.tr('ประวัติขาวสะอาด (Clean)', 'Clean history')}</span><em>${countClean('Clean History')}</em></label>
          </div>

          <div class="mk-f-block">
            <label class="mk-chk"><input id="f-neg" type="checkbox" ${this.filters.negotiable ? 'checked' : ''} onchange="app.applySidebarFilters()" /><span>${this.tr('เฉพาะรายการที่ต่อรองได้', 'Negotiable only')}</span></label>
          </div>

          <button class="mk-apply" onclick="app.applySidebarFilters()">${this.tr('ใช้ตัวกรอง', 'Apply filters')}</button>
          <div class="mk-help" style="cursor:pointer;" onclick="app.openSupportView('live_support')">${this.tr('ต้องการความช่วยเหลือ? ติดต่อแอดมิน 24/7', 'Need help? Live support 24/7')}</div>
        </aside>

        <main class="mk-main">
          <div class="mk-toolbar">
            <div class="mk-count"><strong class="tabular">${totalItems}</strong> ${this.tr('รายการในระบบ', 'accounts')}</div>
            <div class="mk-sort">
              <span>${this.tr('เรียงตาม', 'Sort by')}</span>
              <select onchange="app.changeSort(this.value)">
                <option value="newest" ${this.filters.sort === 'newest' ? 'selected' : ''}>${this.tr('แนะนำล่าสุด', 'Recommended')}</option>
                <option value="price_asc" ${this.filters.sort === 'price_asc' ? 'selected' : ''}>${this.tr('ราคา: ต่ำ ไป สูง', 'Price, low to high')}</option>
                <option value="price_desc" ${this.filters.sort === 'price_desc' ? 'selected' : ''}>${this.tr('ราคา: สูง ไป ต่ำ', 'Price, high to low')}</option>
                <option value="trust_score" ${this.filters.sort === 'trust_score' ? 'selected' : ''}>${this.tr('ความน่าเชื่อถือผู้ขาย', 'Seller trust')}</option>
              </select>
            </div>
          </div>

          <div class="pc-grid">${cardsHtml}</div>

          <div class="mk-pager">
            <span>${this.tr(`แสดง ${showStart}-${showEnd} จากทั้งหมด ${totalItems} รายการที่ผ่านการตรวจสอบ`, `Showing ${showStart}-${showEnd} of ${totalItems} verified accounts`)}</span>
            <div class="mk-pages">${pageBtns.join('')}</div>
          </div>
        </main>
      </div>

      <footer class="mk-footer">
        <span class="mk-foot-main" style="cursor:pointer;" onclick="app.openSupportView('how_escrow')">${this.tr('ซื้อขายปลอดภัยผ่านคนกลาง 100%', 'Trade with confidence. Not with strangers.')}</span>
        <span style="cursor:pointer;" onclick="app.openSupportView('pay_securely')">${this.tr('1. พักเงินปลอดภัย', 'Pay securely')}</span>
        <span style="cursor:pointer;" onclick="app.openSupportView('verify_account')">${this.tr('2. คนกลางตรวจสเปก', 'Verify your account')}</span>
        <span style="cursor:pointer;" onclick="app.openSupportView('release_seller')">${this.tr('3. โอนเงินเมื่อตรวจผ่าน', 'Release to seller')}</span>
        <span class="mk-foot-right">
          2026 VaultX Escrow Game Vault.
          <a href="javascript:void(0)" style="color:inherit;text-decoration:underline;margin-left:4px;" onclick="app.openSupportView('terms')">${this.tr('ข้อตกลง', 'Terms')}</a>,
          <a href="javascript:void(0)" style="color:inherit;text-decoration:underline;" onclick="app.openSupportView('privacy')">${this.tr('ความเป็นส่วนตัว', 'Privacy')}</a>,
          <a href="javascript:void(0)" style="color:inherit;text-decoration:underline;" onclick="app.openSupportView('live_support')">${this.tr('ศูนย์ช่วยเหลือ', 'Help center')}</a>.
        </span>
      </footer>
    `;
  }

  // ==========================================================================
  // VIEW 2: FULL-PAGE ITEM DETAIL & LIVE NEGOTIATION CHAT (Split 60% / 40%)
  // ==========================================================================
  async openListingDetail(listingId) {
    try {
      const res = await fetch(`/api/v1/listings/${listingId}`);
      const json = await res.json();
      if (!json.success) {
        this.toast(json.error || 'ไม่พบรายการสินค้า');
        return;
      }
      this.activeListing = json.data;

      // Load or create item-bound chat thread for current user
      const curUid = (this.currentUser && this.currentUser.user_id) || 'user_buyer_01';
      if (this.currentUser && this.currentUser.user_id === json.data.seller_id) {
        try {
          const threadsRes = await fetch(`/api/v1/chats/my-threads?userId=${curUid}`);
          const threadsJson = await threadsRes.json();
          const existingThread = threadsJson.data && threadsJson.data.find(t => t.listing_id === listingId);
          if (existingThread) {
            await this.reloadActiveThread(existingThread.thread_id);
          } else {
            this.activeThread = null;
            this.activeOffer = null;
          }
        } catch (_) {
          this.activeThread = null;
          this.activeOffer = null;
        }
      } else {
        const chatRes = await fetch('/api/v1/chats/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listingId,
            buyerId: curUid
          })
        });
        const chatJson = await chatRes.json();
        if (chatJson.success) {
          await this.reloadActiveThread(chatJson.data.thread_id);
        }
      }

      this.currentView = 'detail';
      this.render();
      window.scrollTo(0, 0);
    } catch (e) {
      console.error(e);
      this.toast('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า');
    }
  }

  async reloadActiveThread(threadId) {
    const res = await fetch(`/api/v1/chats/${threadId}`);
    const json = await res.json();
    if (json.success) {
      this.activeThread = json.data;
      this.activeOffer = json.data.active_offer || null;
    }
  }

  async sendChatMessage() {
    const input = document.getElementById('chat-msg-input');
    if (!input || !input.value.trim() || !this.activeThread) return;

    const senderId = (this.currentUser && this.currentUser.user_id) || 'user_buyer_01';

    try {
      const res = await fetch(`/api/v1/chats/${this.activeThread.thread_id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId,
          text: input.value.trim()
        })
      });
      const json = await res.json();
      if (json.success) {
        if (json.security_filter && json.security_filter.was_sanitized) {
          this.toast('ระบบ DLP เซ็นเซอร์ข้อมูลติดต่อนอกแพลตฟอร์มเพื่อความปลอดภัย');
        }
        input.value = '';
        await this.reloadActiveThread(this.activeThread.thread_id);
        this.render();
      } else {
        this.toast(json.error || 'ส่งข้อความไม่สำเร็จ');
      }
    } catch (e) {
      this.toast('เกิดข้อผิดพลาดในการส่งข้อความ');
    }
  }

  async submitPriceOffer() {
    const priceInput = document.getElementById('offer-price-input');
    if (!priceInput || !priceInput.value || !this.activeThread) return;
    const buyerId = (this.currentUser && this.currentUser.user_id) || 'user_buyer_01';

    try {
      const res = await fetch(`/api/v1/chats/${this.activeThread.thread_id}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId,
          offeredPrice: Number(priceInput.value),
          message: 'พร้อมโอนเข้าห้อง Escrow ทันทีหากตกลงราคานี้ครับ'
        })
      });
      const json = await res.json();
      if (json.success) {
        this.toast(json.message);
        await this.reloadActiveThread(this.activeThread.thread_id);
        this.render();
      } else {
        this.toast(json.error);
      }
    } catch (e) {
      this.toast('ไม่สามารถยื่นข้อเสนอได้');
    }
  }

  async respondToOffer(action) {
    if (!this.activeThread || !this.activeOffer) return;
    let counterPrice = null;
    if (action === 'counter') {
      const entered = prompt('ระบุราคาที่ต้องการเสนอสวนกลับ (THB):', Math.round((this.activeOffer.offered_price + this.activeOffer.original_price) / 2));
      if (!entered) return;
      counterPrice = Number(entered);
    }

    try {
      const res = await fetch(`/api/v1/chats/${this.activeThread.thread_id}/offers/${this.activeOffer.offer_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: (this.currentUser && this.currentUser.user_id) || 'user_seller_01',
          action,
          counterPrice
        })
      });
      const json = await res.json();
      if (json.success) {
        this.toast(json.message);
        await this.reloadActiveThread(this.activeThread.thread_id);
        this.render();
      } else {
        this.toast(json.error);
      }
    } catch (e) {
      this.toast('ไม่สามารถตอบรับข้อเสนอได้');
    }
  }

  async initiateDirectEscrow(listingId) {
    const buyerId = (this.currentUser && this.currentUser.user_id) || 'user_buyer_01';
    try {
      const res = await fetch('/api/v1/escrow/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId,
          listingId
        })
      });
      const json = await res.json();
      if (json.success) {
        this.toast(json.message);
        await this.fetchCurrentUser();
        await this.fetchListings();
        await this.fetchEscrows();
        this.activeEscrowId = json.data.escrow_id;
        await this.navigate('escrow');
      } else {
        this.toast(json.error);
      }
    } catch (e) {
      this.toast(this.tr('ไม่สามารถเริ่มสัญญา Escrow ได้', 'Failed to initiate Escrow contract'));
    }
  }

  async startEscrowFromOffer(threadId, offerId) {
    const buyerId = (this.currentUser && this.currentUser.user_id) || 'user_buyer_01';
    try {
      const res = await fetch(`/api/v1/chats/${threadId}/offers/${offerId}/escrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId })
      });
      const json = await res.json();
      if (json.success) {
        this.toast(json.message);
        await this.fetchCurrentUser();
        await this.fetchListings();
        await this.fetchEscrows();
        this.activeEscrowId = json.data.escrow_id;
        await this.navigate('escrow');
      } else {
        this.toast(json.error);
      }
    } catch (e) {
      this.toast(this.tr('เกิดข้อผิดพลาดในการสร้างสัญญา Escrow', 'Error creating Escrow contract'));
    }
  }

  renderDetailView() {
    const item = this.activeListing;
    if (!item) return '';

    const specs = item.inventory_specs || {};
    const ignoredKeys = ['listing_id', 'category_type', 'platform_id', 'skins', 'submitted_at'];
    const specEntries = Object.entries(specs).filter(([k]) => !ignoredKeys.includes(k));

    const specCellsHtml = specEntries.map(([key, val]) => {
      const label = this.specLabel(key);
      const formattedVal = key === 'estimated_market_value' ? this.formatTHB(val) : String(val);
      return `
        <div class="spec-cell">
          <span class="spec-key">${label}</span>
          <span class="spec-val ${key === 'estimated_market_value' ? 'tabular' : ''}">${formattedVal}</span>
        </div>
      `;
    }).join('');

    const assetTableHeading = item.category_type === 'game_library'
      ? this.tr('รายชื่อเกมเด่นและบริการในคลังพร้อมราคาประเมิน', 'Included AAA Titles, DLCs & Subscriptions Valuation')
      : item.category_type === 'ingame_item'
      ? this.tr('รายการไอเทม / สกุลเงินที่ส่งมอบและราคาประเมิน', 'Tradeable Items & Currency Breakdown')
      : this.t('skin_list_title');

    const assetCol1Label = item.category_type === 'game_library'
      ? this.tr('ชื่อเกม / แพ็กเกจในคลัง', 'Game Title / Subscription')
      : item.category_type === 'ingame_item'
      ? this.tr('ชื่อไอเทม / สกุลเงินในเกม', 'In-Game Item / Currency')
      : this.tr('ชื่อสกิน / ตัวละคร / ไอเทมแรร์', 'Skin / Character / Rare Asset');

    const skinsTableHtml = Array.isArray(specs.skins) && specs.skins.length > 0 ? `
      <div>
        <div class="section-heading">
          <span>${assetTableHeading} (${specs.skins.length} ${this.tr('รายการ', 'items')})</span>
        </div>
        <div class="listings-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>${assetCol1Label}</th>
                <th>${this.tr('ระดับ / หมวดหมู่ (Tier)', 'Rarity / Tier')}</th>
                <th style="text-align:right;">${this.tr('ราคาประเมินรายชิ้น', 'Est. Individual Value')}</th>
              </tr>
            </thead>
            <tbody>
              ${specs.skins.map(sk => `
                <tr>
                  <td style="font-weight:500;">${sk.name}</td>
                  <td><span class="skin-micro-tag">${sk.tier}</span></td>
                  <td class="tabular" style="text-align:right;">${this.formatTHB(sk.value ?? sk.est_value ?? 0)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : '';

    const feeAmount = +(item.asking_price * (item.escrow_fee_percent / 100)).toFixed(2);
    const sellerNet = +(item.asking_price - feeAmount).toFixed(2);
    const curUserId = this.currentUser ? this.currentUser.user_id : null;
    const isOwnerOfListing = curUserId === item.seller_id;

    // Active Offer Banner in Right Chat Column
    const offer = this.activeOffer;
    let offerCardHtml = '';
    if (offer) {
      offerCardHtml = `
        <div class="active-offer-card">
          <div class="offer-row-top">
            <span style="font-size:12px;font-weight:600;color:var(--text-secondary);">${this.tr('ข้อเสนอต่อรองราคาล่าสุด', 'Latest Price Offer')}</span>
            <span class="offer-status-badge ${offer.status}">${offer.status}</span>
          </div>
          <div style="display:flex;align-items:baseline;justify-content:space-between;">
            <div>
              <span class="tabular" style="font-size:18px;font-weight:700;color:var(--text-primary);">${this.formatTHB(offer.offered_price)}</span>
              <span class="tabular" style="font-size:12px;color:var(--text-muted);text-decoration:line-through;margin-left:6px;">${this.formatTHB(offer.original_price)}</span>
            </div>
            <span class="tabular" style="font-size:12px;color:var(--status-green-text);">${this.tr('ประหยัด', 'Save')} ${this.formatTHB(offer.discount_amount)} (-${offer.discount_percent}%)</span>
          </div>

          ${offer.status === 'accepted' ? `
            ${curUserId === offer.buyer_id ? `
              <button class="btn-green" style="width:100%;margin-top:4px;" onclick="app.startEscrowFromOffer('${this.activeThread.thread_id}', '${offer.offer_id}')">
                ${this.tr('ชำระเงินเข้า Escrow ราคาที่ตกลง', 'Pay into Escrow at Agreed Price')} (${this.formatTHB(offer.offered_price)})
              </button>
            ` : `
              <div style="font-size:12px;color:var(--status-green-text);background:#18191f;padding:8px 10px;border-radius:4px;margin-top:4px;text-align:center;">
                ${this.tr('ยอมรับราคาแล้ว รอผู้ซื้อเริ่มกระบวนการชำระเงินเข้า Escrow Vault', 'Offer accepted. Waiting for buyer to initiate Escrow deposit.')}
              </div>
            `}
          ` : ''}

          ${offer.status === 'pending' ? `
            ${curUserId === offer.seller_id ? `
              <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
                <button class="btn-green" style="flex:1;padding:6px 10px;font-size:12px;" onclick="app.respondToOffer('accept')">
                  ${this.tr('ผู้ขาย: กดตกลงรับราคา (Accept)', 'Seller: Accept Offer')}
                </button>
                <button class="btn-secondary" style="padding:6px 10px;font-size:12px;" onclick="app.respondToOffer('counter')">
                  ${this.tr('เสนอราคาสวน (Counter)', 'Counter Offer')}
                </button>
                <button class="btn-secondary" style="padding:6px 10px;font-size:12px;color:var(--status-red-text);" onclick="app.respondToOffer('decline')">
                  ${this.tr('ปฏิเสธ', 'Decline')}
                </button>
              </div>
            ` : `
              <div style="font-size:12px;color:var(--text-secondary);background:#18191f;padding:8px 10px;border-radius:4px;margin-top:4px;text-align:center;">
                ${this.tr('ส่งข้อเสนอแล้ว รอผู้ขายพิจารณาตอบรับหรือเสนอราคาสวนกลับ', 'Offer submitted. Waiting for seller review or counter-offer.')}
              </div>
            `}
          ` : ''}

          ${offer.status === 'countered' ? `
            ${curUserId === offer.buyer_id ? `
              <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
                <button class="btn-green" style="flex:1;padding:6px 10px;font-size:12px;" onclick="app.respondToOffer('accept')">
                  ${this.tr('ผู้ซื้อ: ยอมรับราคาสวนกลับ (Accept Counter)', 'Buyer: Accept Counter Offer')}
                </button>
                <button class="btn-secondary" style="padding:6px 10px;font-size:12px;color:var(--status-red-text);" onclick="app.respondToOffer('decline')">
                  ${this.tr('ปฏิเสธ', 'Decline')}
                </button>
              </div>
            ` : `
              <div style="font-size:12px;color:var(--text-secondary);background:#18191f;padding:8px 10px;border-radius:4px;margin-top:4px;text-align:center;">
                ${this.tr('คุณได้ยื่นราคาสวนกลับไปแล้ว รอผู้ซื้อพิจารณาตอบรับ', 'Counter-offer sent. Awaiting buyer confirmation.')}
              </div>
            `}
          ` : ''}

          ${offer.status === 'escrowed' ? `
            <button class="btn-primary" style="width:100%;" onclick="app.activeEscrowId='${offer.escrow_id}'; app.navigate('escrow');">
              ${this.tr('เข้าสู่ห้องส่งมอบไอดี Escrow', 'Enter Live Escrow Room')} (${offer.escrow_id})
            </button>
          ` : ''}
        </div>
      `;
    }

    const messages = (this.activeThread && this.activeThread.messages) || [];
    const sellerDisplayName = (item.seller && item.seller.display_name) || item.seller_name || 'VerifiedSeller';
    const sellerTrustScore = (item.seller && item.seller.trust_score) || item.seller_trust || 98;
    const safeSellerName = sellerDisplayName.replace(/'/g, "\\'");

    return `
      <!-- TOP DETAIL BREADCRUMB BAR -->
      <div class="detail-topbar">
        <div class="breadcrumb-left">
          <button class="btn-back" onclick="app.navigate('market')">${this.t('back_to_market')}</button>
          <span>/</span>
          <span class="platform-tag">${item.game_type}</span>
          <span class="tabular" style="color:var(--text-muted);">ID: ${item.listing_id}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <button class="btn-secondary" style="height:30px;padding:0 10px;font-size:12px;" onclick="app.toggleFavorite('${item.listing_id}')">
            ${this.savedIds.has(item.listing_id) ? this.tr('บันทึกแล้ว (Saved)', 'Saved in Wishlist') : this.tr('บันทึกเข้า Wishlist', 'Save to Wishlist')}
          </button>
          <span class="verify-tag ${item.verification_tier}">
            ${item.verification_tier === 'admin_verified' ? this.tr('ตรวจสอบสเปกโดยแอดมินแล้ว', 'Admin Verified Specs') : this.tr('คุ้มครองโดยระบบ Escrow 100%', '100% Escrow Protected')}
          </span>
        </div>
      </div>

      <!-- FULL-SCREEN 2-COLUMN SPLIT: LEFT SPECS (60%) / RIGHT NEGOTIATION CHAT (40%) -->
      <div class="detail-split-layout">
        <!-- LEFT COLUMN: FULL SPECIFICATIONS & DIRECT ESCROW BUY -->
        <div class="detail-left-col">
          <div class="detail-header-block">
            <div style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap;">
              ${(() => {
                const dImg = this.productImage(item);
                const isGenshin = dImg && dImg.includes('genshin_');
                const isFullCover = dImg && dImg.endsWith('.jpg') && !isGenshin;
                return `
                  <div style="width:220px;height:132px;border-radius:8px;overflow:hidden;background:radial-gradient(circle at 50% 45%, #272b35 0%, #1b1d23 78%);display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:${isFullCover ? '0' : isGenshin ? '4px' : '12px'};">
                    <img src="${dImg}" alt="${item.title}" style="width:100%;height:100%;object-fit:${isFullCover ? 'cover' : 'contain'};border-radius:6px;" />
                  </div>
                `;
              })()}
              <div style="flex:1;min-width:260px;">
                <div class="detail-badges">
                  <span class="platform-tag">${item.game_type}</span>
                  ${item.rank_badge ? `<span class="skin-micro-tag" style="color:#93c5fd;">${item.rank_badge}</span>` : ''}
                  <span class="skin-micro-tag">${this.t('warranty_days')} ${item.warranty_days} ${this.t('days_unit')}</span>
                  <span class="skin-micro-tag">${this.t('escrow_fee_note')} ${item.escrow_fee_percent}%</span>
                  <span class="skin-micro-tag" style="color:var(--status-green-text);cursor:pointer;text-decoration:underline;" onclick="app.openSellerProfile('${safeSellerName}')">${this.tr('ผู้ขาย:', 'Seller:')} ${sellerDisplayName} (Trust ${sellerTrustScore}% · ${this.tr('คลิกดูโปรไฟล์', 'View Profile')})</span>
                </div>
                <h1 class="detail-title" style="margin-top:8px;">${item.title}</h1>
                <p class="detail-desc" style="margin-top:6px;">${item.description}</p>
              </div>
            </div>
          </div>

          <!-- DIRECT ESCROW PURCHASE BOX -->
          <div class="buy-summary-box">
            <div class="buy-price-group">
              <span class="buy-price-label">${this.tr('ราคาตั้งขาย (Asking Price)', 'Asking Price')}</span>
              <span class="buy-price-main tabular">${this.formatTHB(item.asking_price)}</span>
              <span class="buy-fee-note tabular">
                ${this.tr(`ผู้ขายได้รับสุทธิ ${this.formatTHB(sellerNet)} (หักค่าบริการคนกลาง ${item.escrow_fee_percent}% = ${this.formatTHB(feeAmount)})`, `Seller receives net ${this.formatTHB(sellerNet)} (${item.escrow_fee_percent}% Escrow fee = ${this.formatTHB(feeAmount)})`)}
              </span>
            </div>
            <div class="buy-actions">
              ${item.status === 'available' ? `
                ${isOwnerOfListing ? `
                  <div style="background:#18191f;padding:10px 14px;border-radius:6px;font-size:12.5px;color:var(--text-secondary);text-align:center;width:100%;">
                    ${this.tr('นี่คือประกาศขายของคุณเอง (ไม่สามารถซื้อหรือยื่นข้อเสนอให้ตนเองได้)', 'This is your own listing (Self-purchase not allowed)')}
                  </div>
                ` : `
                  <button class="btn-primary" onclick="app.openCheckoutView('${item.listing_id}')">
                    ${this.t('buy_now_escrow')}
                  </button>
                `}
              ` : `
                <button class="btn-secondary" onclick="app.navigate('escrow')">
                  ${this.tr('รายการนี้อยู่ในห้องคนกลางแล้ว (ดูห้อง Escrow)', 'Currently in Escrow Room (View Escrow)')}
                </button>
              `}
            </div>
          </div>

          <!-- DYNAMIC NOSQL SPECIFICATION TABLE -->
          <div>
            <div class="section-heading">
              <span>${this.t('spec_table_title')}</span>
              <span class="tabular" style="font-size:11px;color:var(--text-muted);">SCHEMA: ${item.platform_id.toUpperCase()}</span>
            </div>
            <div class="specs-grid-table">
              ${specCellsHtml}
            </div>
          </div>

          ${skinsTableHtml}

          <!-- ESCROW 5-STEP GUARANTEE EXPLANATION TABLE -->
          <div class="vault-card">
            <div class="section-heading" style="margin-bottom:4px;">
              <span>${this.tr('ขั้นตอนการคุ้มครองเงินและตรวจรับไอดี (5-Step Escrow Protocol)', '5-Step Escrow Fund & Account Verification Protocol')}</span>
              <span class="tabular" style="font-size:11px;color:var(--status-green-text);">AES-256-GCM VAULT</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;font-size:12px;color:var(--text-secondary);">
              <div style="padding:10px;background:#131418;border-radius:6px;">
                <strong style="color:var(--text-primary);display:block;">${this.tr('1. ล็อกเงินซื้อ', '1. Lock Funds')}</strong>
                ${this.tr('ระบบพักเงินผู้ซื้อไว้ใน Vault 100%', 'Buyer funds locked 100% in Vault')}
              </div>
              <div style="padding:10px;background:#131418;border-radius:6px;">
                <strong style="color:var(--text-primary);display:block;">${this.tr('2. ส่งมอบรหัส', '2. Submit Creds')}</strong>
                ${this.tr('ผู้ขายส่งรหัสเข้ากล่องนิรภัยเข้ารหัส', 'Seller submits AES-256 credentials')}
              </div>
              <div style="padding:10px;background:#131418;border-radius:6px;">
                <strong style="color:var(--text-primary);display:block;">${this.tr('3. คนกลางตรวจ', '3. Admin Verify')}</strong>
                ${this.tr('Inspector เช็กสกินจริงและสับเปลี่ยนอีเมลผูก', 'Inspector verifies skins & rebinds email')}
              </div>
              <div style="padding:10px;background:#131418;border-radius:6px;">
                <strong style="color:var(--text-primary);display:block;">${this.tr('4. ผู้ซื้อตรวจรับ', '4. Buyer Test')}</strong>
                ${this.tr('ผู้ซื้อล็อกอินเข้าเกมทดสอบและกดยืนยัน', 'Buyer logs in-game & confirms receipt')}
              </div>
              <div style="padding:10px;background:#131418;border-radius:6px;">
                <strong style="color:var(--text-primary);display:block;">${this.tr('5. โอนเงินผู้ขาย', '5. Payout')}</strong>
                ${this.tr('ระบบโอนเงินสุทธิเข้ากระเป๋าผู้ขายทันที', 'Net payout released to seller wallet')}
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: PINNED ITEM-BOUND CHAT & NEGOTIATION OFFER ENGINE -->
        <aside class="detail-right-col">
          <div class="chat-panel-header">
            <div class="chat-seller-info">
              <span class="chat-seller-title">${this.t('chat_header_title')}</span>
              <span class="chat-dlp-sub">${this.t('chat_dlp_notice')}</span>
            </div>
            <span class="platform-tag">LIVE CHAT</span>
          </div>

          <!-- NEGOTIATION OFFER ENGINE BAR -->
          <div class="offer-engine-bar">
            ${offerCardHtml}
            ${item.negotiable && item.status === 'available' && !isOwnerOfListing ? `
              <div class="offer-form-inline">
                <input
                  id="offer-price-input"
                  type="number"
                  class="input-field tabular"
                  placeholder="${this.t('offer_input_placeholder')}"
                  value="${Math.round(item.asking_price * 0.92)}"
                />
                <button class="btn-secondary" style="white-space:nowrap;" onclick="app.submitPriceOffer()">
                  ${this.t('btn_send_offer')}
                </button>
              </div>
            ` : ''}
          </div>

          <!-- CHAT MESSAGE HISTORY -->
          <div class="chat-messages-scroll" id="detail-chat-scroll">
            ${messages.map(m => `
              <div class="chat-msg ${m.role}">
                <div class="chat-msg-meta">
                  <span class="chat-msg-sender">${m.sender_name} (${m.role.toUpperCase()})</span>
                  <span class="tabular">${new Date(m.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div class="chat-msg-text">${m.text}</div>
              </div>
            `).join('')}
          </div>

          <!-- CHAT INPUT BAR -->
          <div class="chat-input-bar">
            <input
              id="chat-msg-input"
              type="text"
              class="input-field"
              placeholder="${this.t('msg_placeholder')}"
              onkeydown="if(event.key==='Enter') app.sendChatMessage()"
            />
            <button class="btn-primary" onclick="app.sendChatMessage()">${this.t('btn_send_msg')}</button>
          </div>
        </aside>
      </div>
    `;
  }

  // ==========================================================================
  // VIEW 3: 5-STEP LIVE ESCROW ROOM
  // ==========================================================================
  async loadEscrowWorkspace() {
    await this.fetchEscrows();
    if (this.activeEscrowId) {
      await this.fetchEscrowDetail(this.activeEscrowId);
    }
    this.render();
  }

  async selectEscrowRoom(escrowId) {
    this.activeEscrowId = escrowId;
    this.decryptedCreds = null;
    await this.fetchEscrowDetail(escrowId);
    this.render();
  }

  async fetchEscrowDetail(escrowId) {
    try {
      const res = await fetch(`/api/v1/escrow/${escrowId}/status`);
      const json = await res.json();
      if (json.success) {
        this.activeEscrowDetail = json.data;
      }
    } catch (e) {
      console.error(e);
    }
  }

  async submitStep2Credentials() {
    if (!this.activeEscrowDetail) return;
    const uEl = document.getElementById('esc-cred-user');
    const pEl = document.getElementById('esc-cred-pass');
    const eEl = document.getElementById('esc-cred-oge');

    const credentials = {
      username: uEl ? uEl.value : 'val_immortal_thai01',
      password: pEl ? pEl.value : 'VaultPass#9981!',
      original_email_note: eEl ? eEl.value : 'ปลด 2FA เรียบร้อย พร้อมให้แอดมินเปลี่ยนเมลผูก'
    };

    const uId = (this.currentUser && this.currentUser.user_id) || 'user_seller_01';
    try {
      const res = await fetch(`/api/v1/escrow/${this.activeEscrowDetail.escrow_id}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: uId,
          credentials
        })
      });
      const json = await res.json();
      if (json.success) {
        this.toast(json.message);
        await this.loadEscrowWorkspace();
      } else {
        this.toast(json.error);
      }
    } catch (e) {
      this.toast('ส่งมอบรหัสผ่านไม่สำเร็จ');
    }
  }

  async decryptVaultCredentials() {
    if (!this.activeEscrowDetail) return;
    const reqId = (this.currentUser && this.currentUser.user_id) || 'user_inspector_01';
    try {
      const res = await fetch(`/api/v1/escrow/${this.activeEscrowDetail.escrow_id}/credentials?requesterId=${reqId}`);
      const json = await res.json();
      if (json.success) {
        this.decryptedCreds = json.data;
        this.toast('ถอดรหัสข้อมูล AES-256-GCM สำเร็จ');
        this.render();
      } else {
        this.toast(json.error);
      }
    } catch (e) {
      this.toast('ไม่สามารถถอดรหัสได้');
    }
  }

  async executeStep3InspectorVerify() {
    if (!this.activeEscrowDetail) return;
    const inspId = (this.currentUser && this.currentUser.user_id) || 'user_inspector_01';
    try {
      const res = await fetch(`/api/v1/escrow/${this.activeEscrowDetail.escrow_id}/verify-rebind`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectorId: inspId })
      });
      const json = await res.json();
      if (json.success) {
        this.toast(json.message);
        await this.loadEscrowWorkspace();
      } else {
        this.toast(json.error);
      }
    } catch (e) {
      this.toast('ยืนยันการตรวจสอบไม่สำเร็จ');
    }
  }

  async executeStep4BuyerConfirm() {
    if (!this.activeEscrowDetail) return;
    const buyerId = (this.currentUser && this.currentUser.user_id) || 'user_buyer_01';
    try {
      const res = await fetch(`/api/v1/escrow/${this.activeEscrowDetail.escrow_id}/confirm-receipt`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId })
      });
      const json = await res.json();
      if (json.success) {
        this.toast(json.message);
        await this.loadEscrowWorkspace();
      } else {
        this.toast(json.error);
      }
    } catch (e) {
      this.toast('ไม่สามารถยืนยันรับสินค้าได้');
    }
  }

  async executeStep5ReleaseFunds() {
    if (!this.activeEscrowDetail) return;
    try {
      const callerId = (this.currentUser && this.currentUser.user_id) || 'user_buyer_01';
      const res = await fetch(`/api/v1/escrow/${this.activeEscrowDetail.escrow_id}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callerId })
      });
      const json = await res.json();
      if (json.success) {
        this.toast(json.message);
        await this.fetchCurrentUser();
        await this.loadEscrowWorkspace();
      } else {
        this.toast(json.error);
      }
    } catch (e) {
      this.toast('ปล่อยเงินไม่สำเร็จ');
    }
  }

  async callAdminIntervention(reason) {
    if (!this.activeEscrowDetail) return;
    const callerId = (this.currentUser && this.currentUser.user_id) || 'user_buyer_01';
    const note = prompt(
      this.tr(
        'ระบุรายละเอียดหรือข้อความถึง Admin (เช่น รหัสผ่านผิดเข้าไม่ได้ หรือส่งของแล้วผู้ซื้อไม่ยอมกดรับ):',
        'Enter details for the Admin (e.g. wrong password or item delivered but buyer unresponsive):'
      ),
      reason === 'wrong_credentials' ? 'รหัสผ่านผิด เข้าสู่ระบบไม่ได้ครับ' : 'ส่งมอบของในเกมเรียบร้อยแล้ว แต่ผู้ซื้อไม่ยอมกดยืนยันครับ'
    );
    if (note === null) return; // user cancelled

    try {
      const res = await fetch(`/api/v1/escrow/${this.activeEscrowDetail.escrow_id}/call-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callerId, reason, note })
      });
      const json = await res.json();
      if (json.success) {
        this.toast(json.message);
        await this.loadEscrowWorkspace();
      } else {
        this.toast(json.error || 'ไม่สามารถเรียก Admin ได้');
      }
    } catch (e) {
      this.toast('เกิดข้อผิดพลาดในการเรียก Admin');
    }
  }

  async resolveDisputeAdmin(decision) {
    if (!this.activeEscrowDetail) return;
    const adminNote = prompt(
      decision === 'refund_buyer'
        ? this.tr('ระบุเหตุผลการตัดสิน "คืนเงินเต็มจำนวนให้ผู้ซื้อ":', 'Enter reason for refunding buyer:')
        : this.tr('ระบุเหตุผลการตัดสิน "ปล่อยเงินให้ผู้ขาย":', 'Enter reason for releasing payout to seller:'),
      decision === 'refund_buyer' ? 'ตรวจสอบแล้วพบว่ารหัสผ่านไม่ถูกต้องจริง คืนเงินผู้ซื้อ 100%' : 'ตรวจสอบหลักฐานการเทรดแล้วพบว่าส่งมอบถูกต้องสมบูรณ์ ปล่อยเงินผู้ขาย'
    );
    if (adminNote === null) return;

    try {
      const res = await fetch(`/api/v1/escrow/${this.activeEscrowDetail.escrow_id}/resolve-dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: (this.currentUser && this.currentUser.user_id) || 'user_inspector_01',
          decision,
          note: adminNote
        })
      });
      const json = await res.json();
      if (json.success) {
        this.toast(json.message);
        await this.fetchCurrentUser();
        await this.loadEscrowWorkspace();
      } else {
        this.toast(json.error || 'ไม่สามารถตัดสินข้อพิพาทได้');
      }
    } catch (e) {
      this.toast('เกิดข้อผิดพลาดในการตัดสินข้อพิพาท');
    }
  }

  async sendEscrowRoomMessage() {
    const input = document.getElementById('escrow-msg-input');
    if (!input || !input.value.trim() || !this.activeEscrowDetail) return;
    try {
      const res = await fetch(`/api/v1/escrow/${this.activeEscrowDetail.escrow_id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: this.currentUser ? this.currentUser.display_name : 'Trader',
          role: this.currentUser ? this.currentUser.role : 'user',
          text: input.value.trim()
        })
      });
      const json = await res.json();
      if (json.success) {
        input.value = '';
        await this.fetchEscrowDetail(this.activeEscrowDetail.escrow_id);
        this.render();
      }
    } catch (e) {
      console.error(e);
    }
  }

  getStepIndexFromStatus(status) {
    switch (status) {
      case 'funds_locked': return 2; // Step 1 done, now on Step 2 (Seller submit)
      case 'credentials_submitted':
      case 'item_delivered_pending_verification': return 3; // Step 2 done, now on Step 3 (Inspector verify)
      case 'awaiting_buyer_confirm':
      case 'rebind_complete':
      case 'trade_verified': return 4; // Step 3 done, now on Step 4 (Buyer confirm)
      case 'buyer_confirmed': return 5; // Step 4 done, now on Step 5 (Release funds)
      case 'completed':
      case 'released_completed': return 6; // All 5 steps done
      default: return 2;
    }
  }

  renderEscrowView() {
    if (this.escrows.length === 0) {
      return `
        <div class="single-page-container">
          <div class="vault-card" style="text-align:center;padding:48px 24px;align-items:center;">
            <span class="platform-tag">ESCROW VAULT</span>
            <h2 style="font-size:18px;font-weight:700;">${this.tr('ยังไม่มีสัญญาซื้อขายในห้องคนกลาง', 'No Active Escrow Contracts')}</h2>
            <p style="color:var(--text-secondary);max-width:520px;">
              ${this.tr('คุณสามารถเริ่มเปิดห้องคนกลาง 5 ขั้นตอนได้ทันที โดยการกดปุ่ม "ซื้อทันทีผ่าน Escrow" ในหน้ารายละเอียดสินค้า หรือกดสร้างสัญญาจากดีลมีด CS2 ที่ต่อรองราคาสำเร็จไว้แล้วด้านล่างนี้', 'You can initiate a 5-step Escrow room by clicking "Buy via Escrow" on any listing, or test our live CS2/Valorant demo contracts below.')}
            </p>
            <div style="display:flex;gap:10px;margin-top:8px;">
              <button class="btn-green" onclick="app.startEscrowFromOffer('thread_cs2_buyer_seller', 'offer_cs2_demo_01')">
                ${this.tr('เปิดห้อง Escrow ดีลมีด CS2 (฿17,200) ทันที', 'Launch CS2 Knife Escrow Deal (฿17,200)')}
              </button>
              <button class="btn-secondary" onclick="app.initiateDirectEscrow('list_val_001')">
                ${this.tr('ทดสอบเปิดห้อง Escrow ไอดี Valorant (฿7,500)', 'Launch Valorant Demo Escrow (฿7,500)')}
              </button>
            </div>
          </div>
        </div>
      `;
    }

    const esc = this.activeEscrowDetail || this.escrows[0];
    const escStatus = esc.status || esc.step_status || 'funds_locked';
    const currentStepIdx = this.getStepIndexFromStatus(escStatus);
    const encVault = esc.encrypted_credentials || esc.credentials || null;
    const decPayload = this.decryptedCreds ? (this.decryptedCreds.decrypted_payload || this.decryptedCreds) : null;

    const curUserId = this.currentUser ? this.currentUser.user_id : null;
    const curUserRole = this.currentUser ? this.currentUser.role : 'user';
    const isBuyer = curUserId === esc.buyer_id;
    const isSeller = curUserId === esc.seller_id;
    const isInspectorOrAdmin = curUserRole === 'inspector' || curUserRole === 'owner' || curUserRole === 'admin' || curUserId === esc.inspector_id;

    const stepsMeta = [
      { idx: 1, title: this.tr('1. ล็อกเงินค้ำประกัน', '1. Lock Buyer Funds'), sub: 'Buyer Funds Locked' },
      { idx: 2, title: this.tr('2. ส่งมอบข้อมูลไอดี', '2. Submit Credentials'), sub: 'Seller Credentials Vault' },
      { idx: 3, title: this.tr('3. คนกลางตรวจสเปก', '3. Inspector Verify'), sub: 'Inspector Verification' },
      { idx: 4, title: this.tr('4. ผู้ซื้อตรวจรับไอดี', '4. Buyer Login Test'), sub: 'Buyer Login Test' },
      { idx: 5, title: this.tr('5. โอนเงินให้ผู้ขาย', '5. Release Payout'), sub: 'Settlement Released' }
    ];

    return `
      <div class="escrow-layout">
        <!-- LEFT SIDEBAR: LIST OF ESCROW CONTRACTS -->
        <aside class="escrow-list-sidebar">
          <div style="font-size:12px;font-weight:600;color:var(--text-secondary);padding-bottom:6px;border-bottom:1px solid var(--border-subtle);">
            ${this.tr('รายการสัญญาคนกลาง', 'Escrow Contracts')} (${this.escrows.length})
          </div>
          ${this.escrows.map(item => {
            const st = item.status || item.step_status || 'funds_locked';
            const isDone = st === 'completed' || st === 'released_completed';
            return `
            <div class="escrow-room-item ${item.escrow_id === esc.escrow_id ? 'active' : ''}" onclick="app.selectEscrowRoom('${item.escrow_id}')">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span class="tabular" style="font-size:11px;font-weight:700;color:var(--text-primary);">${item.escrow_id}</span>
                <span class="offer-status-badge ${isDone ? 'accepted' : 'pending'}">${st}</span>
              </div>
              <div style="font-size:12px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${item.listing_title || item.listing_id}
              </div>
              <div class="tabular" style="font-size:13px;font-weight:600;color:var(--text-primary);">
                ${this.formatTHB(item.total_amount)}
              </div>
            </div>
          `;
          }).join('')}
        </aside>

        <!-- MAIN 5-STEP ESCROW WORKSPACE -->
        <main class="escrow-main-area">
          <!-- CONTRACT HEADER -->
          <div class="escrow-header-card">
            <div style="flex:1;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
                <span class="platform-tag">CONTRACT #${esc.escrow_id}</span>
                <span class="offer-status-badge ${esc.is_disputed ? 'countered' : (escStatus === 'completed' || escStatus === 'released_completed') ? 'accepted' : 'pending'}">
                  ${esc.is_disputed ? 'DISPUTE · กำลังอยู่ในการตรวจสอบของ Admin' : `STATUS: ${escStatus.toUpperCase()}`}
                </span>
                ${esc.is_disputed ? `
                  <span class="skin-micro-tag" style="background:#ef4444;color:#fff;">ADMIN INTERVENED</span>
                ` : ''}
              </div>
              <h2 style="font-size:18px;font-weight:700;">${this.tr('รายการอ้างอิง:', 'Listing Ref:')} ${esc.listing_id} (${esc.buyer_name} · ${esc.seller_name})</h2>
            </div>

            <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
              <div>
                <div style="font-size:11px;color:var(--text-muted);">${this.tr('ยอดล็อกใน Vault', 'Locked in Vault')}</div>
                <div class="tabular" style="font-size:18px;font-weight:700;color:var(--status-green-text);">${this.formatTHB(esc.total_amount)}</div>
              </div>
              <div>
                <div style="font-size:11px;color:var(--text-muted);">${this.tr('ค่าธรรมเนียมคนกลาง', 'Escrow Fee')}</div>
                <div class="tabular" style="font-size:15px;font-weight:600;color:var(--text-secondary);">${this.formatTHB(esc.commission_fee)}</div>
              </div>
              <div>
                <div style="font-size:11px;color:var(--text-muted);">${this.tr('ผู้ขายรับสุทธิ', 'Seller Net')}</div>
                <div class="tabular" style="font-size:18px;font-weight:700;color:var(--text-primary);">${this.formatTHB(esc.seller_net_income)}</div>
              </div>
              ${!esc.is_disputed && escStatus !== 'completed' && escStatus !== 'released_completed' ? `
                <button class="btn-secondary" style="height:34px;padding:0 12px;font-size:12px;color:#f87171;border-color:rgba(239,68,68,0.4);" onclick="app.callAdminIntervention('wrong_credentials')">
                  ${this.tr('เรียก Admin ด่วน (Dispute)', 'Call Admin Desk')}
                </button>
              ` : ''}
            </div>
          </div>

          ${esc.is_disputed ? `
            <!-- DISPUTE ACTIVE BANNER & ADMIN ARBITRATION CONTROLS -->
            <div class="vault-card" style="background:linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(17,18,20,0.95) 100%);border-left:4px solid #ef4444;padding:16px 20px;gap:10px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">
                <div>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <strong style="color:#f87171;font-size:15px;">ข้อพิพาทเปิดอยู่: มีการเรียก Admin กลางเข้ามาตัดสิน</strong>
                    <span class="offer-status-badge countered">${esc.dispute_reason}</span>
                  </div>
                  <p style="font-size:13px;color:var(--text-primary);margin-top:6px;line-height:1.5;">
                    <strong>รายละเอียดที่แจ้ง:</strong> ${esc.dispute_note || 'ผู้ใช้แจ้งปัญหาในสัญญาและขอให้คนกลางตรวจสอบหลักฐาน'}
                  </p>
                  <p style="font-size:12px;color:var(--text-muted);margin-top:2px;">
                    * ระบบสั่งระงับการปล่อยเงินอัตโนมัติชั่วคราว เงิน <strong>${this.formatTHB(esc.total_amount)}</strong> ยังถูกล็อกปลอดภัยอยู่ใน Vault 100% จนกว่า Admin Inspector จะมีคำตัดสิน
                  </p>
                </div>

                ${(this.currentUser && (this.currentUser.role === 'inspector' || this.currentUser.role === 'owner' || this.currentUser.role === 'admin')) ? `
                  <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn-primary" style="background:#16a34a;height:36px;font-size:12.5px;" onclick="app.resolveDisputeAdmin('release_seller')">
                      Admin: ตัดสินปล่อยเงินให้ผู้ขาย
                    </button>
                    <button class="btn-primary" style="background:#dc2626;height:36px;font-size:12.5px;" onclick="app.resolveDisputeAdmin('refund_buyer')">
                      Admin: ตัดสินคืนเงินเต็มจำนวนให้ผู้ซื้อ
                    </button>
                  </div>
                ` : `
                  <div style="font-size:12px;color:var(--text-secondary);align-self:center;background:#18191f;padding:8px 12px;border-radius:6px;">
                    แอดมินคนกลางได้รับตั๋วแล้ว และกำลังตรวจสอบข้อมูลในแชทด้านขวา
                  </div>
                `}
              </div>
            </div>
          ` : ''}

          <!-- 5-STEP PROGRESS BAR -->
          <div class="stepper-bar">
            ${stepsMeta.map(st => {
              const stateClass = st.idx < currentStepIdx ? 'done' : (st.idx === currentStepIdx ? 'current' : '');
              const prefix = st.idx < currentStepIdx ? 'COMPLETED' : (st.idx === currentStepIdx ? '- ACTIVE STEP' : '- PENDING');
              return `
                <div class="step-box ${stateClass}">
                  <span class="step-num">${prefix}</span>
                  <span class="step-label">${st.title}</span>
                  <span style="font-size:11px;color:var(--text-muted);">${st.sub}</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- SPLIT WORKSPACE: LEFT VAULT DESK / RIGHT AUDIT TIMELINE & CHAT -->
          <div class="escrow-work-grid">
            <div style="display:flex;flex-direction:column;gap:16px;">
              <!-- STEP ACTION DESK -->
              <div class="vault-card">
                <div class="section-heading" style="margin-bottom:0;">
                  <span>${this.tr('ศูนย์ปฏิบัติการส่งมอบและตรวจสอบไอดี (Step Execution Desk)', 'Step Execution & Credential Verification Desk')}</span>
                  <span class="tabular" style="font-size:11px;color:var(--text-muted);">AES-256-GCM ENVELOPE</span>
                </div>

                ${currentStepIdx === 2 ? `
                  ${isSeller ? `
                    <div style="display:flex;flex-direction:column;gap:12px;">
                      <p style="font-size:13px;color:var(--text-secondary);">
                        <strong>${this.tr('ขั้นตอนที่ 2 (สำหรับผู้ขาย):', 'Step 2 (Seller Action):')}</strong> ${this.tr('เงินของผู้ซื้อถูกล็อกไว้ในระบบแล้ว กรุณากรอก Username และรหัสผ่านเพื่อเข้ารหัสด้วย AES-256-GCM ส่งให้คนกลางตรวจสอบ', 'Buyer funds are locked in Vault. Enter account credentials below to encrypt via AES-256-GCM for Inspector verification.')}
                      </p>
                      <div class="form-group" style="margin-bottom:0;">
                        <label class="form-label">Account Username / Riot ID / Garena ID</label>
                        <input id="esc-cred-user" class="input-field tabular" value="val_immortal_thai01" />
                      </div>
                      <div class="form-group" style="margin-bottom:0;">
                        <label class="form-label">${this.tr('Password (จะถูกเข้ารหัส AES-256-GCM ทันที)', 'Password (Encrypted with AES-256-GCM immediately)')}</label>
                        <input id="esc-cred-pass" class="input-field tabular" value="SecuredVault#2026!" />
                      </div>
                      <div class="form-group" style="margin-bottom:0;">
                        <label class="form-label">${this.tr('หมายเหตุการผูกอีเมล / รหัสสำรอง', 'Original Email (OGE) & 2FA Notes')}</label>
                        <input id="esc-cred-oge" class="input-field" value="${this.tr('ปลดล็อก 2FA แล้ว แอดมินสามารถเปลี่ยนอีเมลผูกเป็นของผู้ซื้อได้ทันที', '2FA unlocked, ready for Inspector email rebind to buyer')}" />
                      </div>
                      <button class="btn-primary" onclick="app.submitStep2Credentials()">
                        ${this.tr('เข้ารหัสและส่งมอบข้อมูลเข้าห้องนิรภัย (Submit Step 2)', 'Encrypt & Submit Credentials to Vault (Step 2)')}
                      </button>
                    </div>
                  ` : `
                    <div style="display:flex;flex-direction:column;gap:8px;padding:12px;background:#18191f;border-radius:6px;">
                      <div style="display:flex;align-items:center;gap:8px;">
                        <span class="offer-status-badge pending">AWAITING SELLER</span>
                        <strong style="font-size:13px;color:var(--text-primary);">${this.tr('รอผู้ขายส่งมอบข้อมูลไอดีเข้าห้องนิรภัย', 'Waiting for Seller to Submit Credentials')}</strong>
                      </div>
                      <p style="font-size:12.5px;color:var(--text-secondary);margin:0;line-height:1.5;">
                        ${this.tr(`เงินค้ำประกันจำนวน ${this.formatTHB(esc.total_amount)} ถูกล็อกปลอดภัยอยู่ใน Vault เรียบร้อยแล้ว ผู้ขายกำลังดำเนินการส่งมอบข้อมูลไอดีและรหัสผ่านเข้ารหัส AES-256-GCM เพื่อส่งต่อให้คนกลางตรวจสอบ`, `Escrow funds of ${this.formatTHB(esc.total_amount)} are safely locked in Vault. Waiting for seller to submit encrypted credentials.`)}
                      </p>
                    </div>
                  `}
                ` : ''}

                ${currentStepIdx === 3 ? `
                  ${isInspectorOrAdmin ? `
                    <div style="display:flex;flex-direction:column;gap:12px;">
                      <p style="font-size:13px;color:var(--text-secondary);">
                        <strong>${this.tr('ขั้นตอนที่ 3 (สำหรับคนกลาง Inspector):', 'Step 3 (Inspector Action):')}</strong> ${this.tr('ผู้ขายส่งมอบรหัสผ่านเข้าตู้เซฟแล้ว กรุณาถอดรหัสเพื่อตรวจสอบสกินในเกมและสับเปลี่ยนอีเมลผูกให้เป็นของผู้ซื้อ', 'Seller submitted encrypted credentials. Decrypt to verify in-game skins and rebind primary email to buyer.')}
                      </p>
                      <div style="display:flex;gap:10px;flex-wrap:wrap;">
                        <button class="btn-secondary" onclick="app.decryptVaultCredentials()">
                          ${this.tr('ถอดรหัสเปิดดูข้อมูลบัญชี (Decrypt AES-256-GCM)', 'Decrypt Vault Credentials (AES-256-GCM)')}
                        </button>
                        <button class="btn-green" onclick="app.executeStep3InspectorVerify()">
                          ${this.tr('ยืนยันผลตรวจสกินครบ & สับเมลสำเร็จ (Approve Step 3)', 'Approve Skin Audit & Email Rebind (Step 3)')}
                        </button>
                      </div>
                    </div>
                  ` : `
                    <div style="display:flex;flex-direction:column;gap:8px;padding:12px;background:#18191f;border-radius:6px;">
                      <div style="display:flex;align-items:center;gap:8px;">
                        <span class="offer-status-badge pending">INSPECTOR AUDITING</span>
                        <strong style="font-size:13px;color:var(--text-primary);">${this.tr('คนกลางกำลังตรวจสอบไอดีและสับเปลี่ยนอีเมล', 'Inspector Auditing Specs & Rebinding Email')}</strong>
                      </div>
                      <p style="font-size:12.5px;color:var(--text-secondary);margin:0;line-height:1.5;">
                        ${this.tr('ผู้ขายได้ส่งมอบรหัสผ่านเข้าสู่ห้องนิรภัยแล้ว ขณะนี้คนกลาง (Certified Inspector) กำลังเข้าตรวจเช็กสเปกในเกมและดำเนินการสับเปลี่ยนอีเมลผูกบัญชีเป็นของผู้ซื้อเพื่อความปลอดภัยสูงสุด', 'Seller submitted credentials to vault. Certified Inspector is auditing specs and rebinding account email to buyer.')}
                      </p>
                    </div>
                  `}
                ` : ''}

                ${currentStepIdx === 4 ? `
                  ${isBuyer ? `
                    <div style="display:flex;flex-direction:column;gap:12px;">
                      <p style="font-size:13px;color:var(--text-secondary);">
                        <strong>${this.tr('ขั้นตอนที่ 4 (สำหรับผู้ซื้อ):', 'Step 4 (Buyer Action):')}</strong> ${this.tr('คนกลางตรวจสอบสเปกและเปลี่ยนอีเมลผูกให้เรียบร้อยแล้ว กรุณาเปิดดูรหัสผ่านเพื่อล็อกอินเข้าเกมตรวจสอบและกดยืนยันรับสินค้า', 'Inspector verified all specs and rebound email. Reveal credentials to test login in-game and confirm receipt.')}
                      </p>
                      <div style="display:flex;gap:10px;flex-wrap:wrap;">
                        <button class="btn-secondary" onclick="app.decryptVaultCredentials()">
                          ${this.tr('เปิดดูรหัสผ่านที่ตรวจแล้ว (Reveal Credentials)', 'Reveal Verified Credentials')}
                        </button>
                        <button class="btn-green" onclick="app.executeStep4BuyerConfirm()">
                          ${this.tr('ผู้ซื้อตรวจสอบไอดีแล้ว ยืนยันรับสินค้า (Confirm Step 4)', 'Confirm Account Receipt (Step 4)')}
                        </button>
                        <button class="btn-secondary" style="color:#f87171;" onclick="app.callAdminIntervention('wrong_credentials')">
                          ${this.tr('แจ้งปัญหา: รหัสผิด / เรียก Admin เข้ามาช่วย', 'Report: Wrong Pass / Call Admin')}
                        </button>
                      </div>
                    </div>
                  ` : isSeller ? `
                    <div style="display:flex;flex-direction:column;gap:8px;padding:12px;background:#18191f;border-radius:6px;">
                      <div style="display:flex;align-items:center;gap:8px;">
                        <span class="offer-status-badge pending">BUYER TESTING</span>
                        <strong style="font-size:13px;color:var(--text-primary);">${this.tr('อยู่ระหว่างผู้ซื้อเข้าทดสอบและตรวจรับสินค้า', 'Buyer Testing Login & Confirming Delivery')}</strong>
                      </div>
                      <p style="font-size:12.5px;color:var(--text-secondary);margin:0;line-height:1.5;">
                        ${this.tr('คนกลางส่งมอบข้อมูลให้ผู้ซื้อทดสอบล็อกอินเข้าเล่นเกมจริงแล้ว เมื่อผู้ซื้อตรวจรับเสร็จสมบูรณ์ ระบบจะเปิดให้ปล่อยเงินสุทธิเข้ากระเป๋าของคุณ', 'Inspector handed over credentials to buyer for in-game testing. Once verified, payout will be released.')}
                      </p>
                      <div style="margin-top:4px;">
                        <button class="btn-secondary" style="color:#f87171;font-size:12px;height:32px;" onclick="app.callAdminIntervention('seller_delivered_buyer_unresponsive')">
                          ${this.tr('ผู้ขายเรียก Admin (กรณีผู้ซื้อไม่ยอมกดยืนยันหรือเงียบหาย)', 'Seller: Call Admin (Buyer Unresponsive)')}
                        </button>
                      </div>
                    </div>
                  ` : `
                    <div style="display:flex;flex-direction:column;gap:12px;">
                      <p style="font-size:13px;color:var(--text-secondary);">
                        <strong>${this.tr('ขั้นตอนที่ 4 (สถานะตรวจรับ):', 'Step 4 (Buyer Inspection):')}</strong> ${this.tr('คนกลางส่งมอบรหัสผ่านให้ผู้ซื้อทดสอบล็อกอินเข้าเกมแล้ว กำลังรอผู้ซื้อกดยืนยันตรวจรับสินค้า', 'Credentials handed over to buyer. Waiting for buyer in-game verification.')}
                      </p>
                      <div style="display:flex;gap:10px;">
                        <button class="btn-secondary" onclick="app.decryptVaultCredentials()">
                          ${this.tr('เปิดดูรหัสผ่าน (Inspector Audit View)', 'Inspect Verified Credentials')}
                        </button>
                      </div>
                    </div>
                  `}
                ` : ''}

                ${currentStepIdx === 5 ? `
                  ${(isBuyer || isInspectorOrAdmin) ? `
                    <div style="display:flex;flex-direction:column;gap:12px;">
                      <p style="font-size:13px;color:var(--text-secondary);">
                        <strong>${this.tr('ขั้นตอนที่ 5 (ปิดสัญญาและโอนเงิน):', 'Step 5 (Final Settlement):')}</strong> ${this.tr(`ผู้ซื้อยืนยันการรับมอบไอดีสมบูรณ์แล้ว กดปุ่มด้านล่างเพื่อโอนเงินสุทธิ ${this.formatTHB(esc.seller_net_income)} เข้ากระเป๋าผู้ขาย`, `Buyer confirmed account receipt. Click below to release net payout of ${this.formatTHB(esc.seller_net_income)} to seller.`)}
                      </p>
                      <div style="display:flex;gap:10px;flex-wrap:wrap;">
                        <button class="btn-green" onclick="app.executeStep5ReleaseFunds()">
                          ${this.tr('ปล่อยเงินให้ผู้ขายและออกใบเสร็จบัญชีคู่ (Release Funds Step 5)', 'Release Seller Payout & Ledger Receipt (Step 5)')}
                        </button>
                      </div>
                    </div>
                  ` : isSeller ? `
                    <div style="display:flex;flex-direction:column;gap:8px;padding:12px;background:#18191f;border-radius:6px;">
                      <div style="display:flex;align-items:center;gap:8px;">
                        <span class="offer-status-badge accepted">BUYER CONFIRMED</span>
                        <strong style="font-size:13px;color:var(--text-primary);">${this.tr('ผู้ซื้อกดยืนยันรับมอบไอดีแล้ว', 'Buyer Confirmed Account Receipt')}</strong>
                      </div>
                      <p style="font-size:12.5px;color:var(--text-secondary);margin:0;line-height:1.5;">
                        ${this.tr(`ระบบกำลังเตรียมปล่อยเงินสุทธิ ${this.formatTHB(esc.seller_net_income)} เข้ากระเป๋าเงินของคุณ หากเงินยังไม่เข้า สามารถเรียก Admin ตรวจสอบได้`, `Escrow is releasing net payout of ${this.formatTHB(esc.seller_net_income)} to your wallet. You may call Admin if there is any delay.`)}
                      </p>
                      <div style="margin-top:4px;">
                        <button class="btn-secondary" style="color:#f87171;font-size:12px;height:32px;" onclick="app.callAdminIntervention('seller_delivered_buyer_unresponsive')">
                          ${this.tr('ผู้ขายเรียก Admin (กรณีระบบยังไม่ปล่อยเงิน)', 'Seller: Call Admin')}
                        </button>
                      </div>
                    </div>
                  ` : ''}
                ` : ''}

                ${currentStepIdx === 6 ? `
                  <div style="padding:14px;background:var(--status-green-bg);border-radius:6px;color:var(--status-green-text);">
                    <strong>${this.tr('ธุรกรรมเสร็จสมบูรณ์ (ESCROW COMPLETED):', 'ESCROW COMPLETED:')}</strong> ${this.tr(`โอนเงินสุทธิ ${this.formatTHB(esc.seller_net_income)} เข้ากระเป๋าผู้ขาย และหักค่าธรรมเนียมแพลตฟอร์ม ${this.formatTHB(esc.commission_fee)} บันทึกลงสมุดบัญชีแยกประเภทคู่ (Double-Entry Ledger) เรียบร้อยแล้ว`, `Net payout of ${this.formatTHB(esc.seller_net_income)} released to seller (${this.formatTHB(esc.commission_fee)} fee recorded in Double-Entry Ledger).`)}
                  </div>
                ` : ''}

                <!-- ENCRYPTED VAULT DISPLAY -->
                <div class="credential-secret-box">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:var(--text-muted);">VAULT PAYLOAD STATUS</span>
                    <span style="font-size:11px;color:var(--status-green-text);">
                      ${encVault ? 'ENCRYPTED (AES-256-GCM)' : 'WAITING FOR SELLER INPUT'}
                    </span>
                  </div>
                  ${decPayload ? `
                    <div style="padding-top:8px;">
                      <div>USERNAME: <strong style="color:var(--text-primary);">${decPayload.username || '-'}</strong></div>
                      <div>PASSWORD: <strong style="color:var(--status-green-text);">${decPayload.password || decPayload.pass || '-'}</strong></div>
                      <div>NOTE: <span style="color:var(--text-secondary);">${decPayload.original_email_note || '-'}</span></div>
                    </div>
                  ` : `
                    <div style="color:var(--text-muted);">
                      ${encVault
                        ? (isBuyer && currentStepIdx < 4
                            ? this.tr('รหัสผ่านถูกล็อกและเข้ารหัสไว้ รอคนกลางตรวจสเปกและสับเปลี่ยนเมลในขั้นตอนที่ 3 จึงจะสามารถเปิดดูได้', 'Credentials locked in vault. Will be revealed after inspector verification in Step 3')
                            : `CIPHERTEXT: ${String(encVault.ciphertext || '••••••••••••').substring(0, 42)}... (${this.tr('กดปุ่ม Decrypt เพื่อเปิดดู', 'Click Decrypt to reveal')})`)
                        : this.tr('รหัสผ่านจะถูกซ่อนและเข้ารหัสไว้จนกว่าผู้ขายจะกดส่งมอบ', 'Credentials remain encrypted until seller submits Step 2')}
                    </div>
                  `}
                </div>
              </div>

              <!-- CRYPTOGRAPHIC TIMELINE LOG -->
              <div class="vault-card">
                <div class="section-heading" style="margin-bottom:0;">
                  <span>${this.tr('บันทึกเหตุการณ์ธุรกรรม (Immutable Escrow Audit Log)', 'Immutable Escrow Audit Log')}</span>
                </div>
                <div>
                  ${(esc.timeline || []).map(ev => `
                    <div class="timeline-item">
                      <div style="display:flex;justify-content:space-between;font-size:11px;">
                        <span class="tabular" style="font-weight:600;color:var(--status-green-text);">${String(ev.event || ev.action || 'STEP_LOG').toUpperCase()}</span>
                        <span class="tabular" style="color:var(--text-muted);">${ev.ts || (ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString('th-TH') : '')}</span>
                      </div>
                      <div style="font-size:13px;color:var(--text-primary);">${ev.detail || ev.msg || ''}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- RIGHT PANEL: 3-PARTY ESCROW AUDIT CHAT -->
            <div class="vault-card" style="justify-content:space-between;height:520px;">
              <div>
                <div class="section-heading">
                  <span>${this.tr('ห้องสนทนา 3 ฝ่าย (Buyer · Seller · Inspector)', '3-Party Escrow Room Chat (Buyer · Seller · Inspector)')}</span>
                </div>
              </div>
              <div class="chat-messages-scroll" style="padding:4px 0;">
                ${(esc.messages || []).map(m => `
                  <div class="chat-msg">
                    <div class="chat-msg-meta">
                      <span class="chat-msg-sender">${m.sender} (${m.role})</span>
                      <span class="tabular">${m.ts || ''}</span>
                    </div>
                    <div class="chat-msg-text">${m.text}</div>
                  </div>
                `).join('')}
              </div>
              <div style="display:flex;gap:8px;padding-top:10px;">
                <input id="escrow-msg-input" class="input-field" placeholder="${this.tr('พิมพ์ข้อความในห้องคนกลาง...', 'Message Buyer, Seller & Inspector...')}" onkeydown="if(event.key==='Enter') app.sendEscrowRoomMessage()" />
                <button class="btn-primary" onclick="app.sendEscrowRoomMessage()">${this.tr('ส่ง', 'Send')}</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
  }

  // ==========================================================================
  // VIEW 4: SELL / DYNAMIC SCHEMA FORM
  // ==========================================================================
  async loadSellSchema(platformId) {
    this.sellPlatform = platformId;
    try {
      const res = await fetch(`/api/v1/categories/schema/${platformId}`);
      const json = await res.json();
      if (json.success) {
        this.sellSchema = json.data;
        this.sellCategory = json.data.category_type || 'individual_game';
      }
    } catch (e) {
      console.error(e);
    }
    this.render();
  }

  async submitNewListing() {
    const title = document.getElementById('sell-title')?.value;
    const desc = document.getElementById('sell-desc')?.value;
    const price = document.getElementById('sell-price')?.value;
    const warranty = document.getElementById('sell-warranty')?.value;

    if (!title || !price) {
      this.toast('กรุณากรอกชื่อประกาศและราคาตั้งขาย');
      return;
    }

    const dynamicSpecs = {};
    document.querySelectorAll('[data-spec-key]').forEach(el => {
      const k = el.getAttribute('data-spec-key');
      dynamicSpecs[k] = el.value;
    });

    try {
      const res = await fetch('/api/v1/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: 'user_seller_01',
          categoryType: this.sellCategory,
          platformId: this.sellPlatform,
          title,
          description: desc,
          askingPrice: Number(price),
          negotiable: true,
          warrantyDays: Number(warranty || 14),
          dynamicSpecs
        })
      });
      const json = await res.json();
      if (json.success) {
        this.toast('ลงประกาศขายสินค้าสำเร็จ!');
        await this.fetchListings();
        this.openListingDetail(json.data.listing_id);
      } else {
        this.toast(json.error);
      }
    } catch (e) {
      this.toast('ไม่สามารถสร้างประกาศขายได้');
    }
  }

  renderSellView() {
    const fields = (this.sellSchema && this.sellSchema.required_fields) || [];
    return `
      <div class="single-page-container">
        <div style="margin-bottom:20px;">
          <h1 style="font-size:20px;font-weight:700;">${this.tr('สร้างประกาศขายไอดี / คลังเกม / ไอเทม (Dynamic Schema Form)', 'Create New Account / Library / Item Listing (Dynamic Schema Form)')}</h1>
          <p style="color:var(--text-secondary);font-size:13px;">
            ${this.tr('ฟอร์มจะปรับเปลี่ยนช่องกรอกสเปกอัตโนมัติตามเกมที่คุณเลือก เพื่อให้ผู้ซื้อและคนกลางตรวจสอบข้อมูลได้ครบถ้วน', 'Specification fields automatically adapt to your selected game so buyers and Inspectors can verify every detail.')}
          </p>
        </div>

        <div class="form-grid-2col">
          <div class="vault-card">
            <div class="form-group">
              <label class="form-label">${this.tr('1. เลือกเกมหรือแพลตฟอร์ม (ตารางสเปกจะเปลี่ยนตามเกมทันที)', '1. Select Game or Platform (Spec fields update automatically)')}</label>
              <select class="input-field" onchange="app.loadSellSchema(this.value)">
                <option value="valorant" ${this.sellPlatform === 'valorant' ? 'selected' : ''}>VALORANT (${this.tr('ไอดีเกมเดี่ยว', 'Single Game ID')})</option>
                <option value="rov" ${this.sellPlatform === 'rov' ? 'selected' : ''}>RoV : Arena of Valor (${this.tr('ไอดีเกมเดี่ยว', 'Single Game ID')})</option>
                <option value="roblox" ${this.sellPlatform === 'roblox' ? 'selected' : ''}>Roblox (${this.tr('ไอดีเกมเดี่ยว', 'Single Game ID')})</option>
                <option value="genshin" ${this.sellPlatform === 'genshin' ? 'selected' : ''}>Genshin Impact (${this.tr('ไอดีเกมเดี่ยว', 'Single Game ID')})</option>
                <option value="steam_library" ${this.sellPlatform === 'steam_library' ? 'selected' : ''}>Steam Account Library (${this.tr('คลังเกมรวม', 'Game Library')})</option>
                <option value="psn" ${this.sellPlatform === 'psn' ? 'selected' : ''}>PlayStation Network (${this.tr('คลังเกมรวม', 'Game Library')})</option>
                <option value="cs2_item" ${this.sellPlatform === 'cs2_item' ? 'selected' : ''}>CS2 Skins & Knives (${this.tr('ไอเทมในเกม', 'In-Game Item')})</option>
                <option value="ragnarok_item" ${this.sellPlatform === 'ragnarok_item' ? 'selected' : ''}>Ragnarok Zeny & Boss Cards (${this.tr('ไอเทมในเกม', 'In-Game Item')})</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">${this.tr('2. หัวข้อประกาศขาย (Title)', '2. Listing Title')}</label>
              <input id="sell-title" class="input-field" placeholder="${this.tr('เช่น ID Valorant Ascendant 3 | Kuronami Vandal + เมลสะอาดมือเดียว', 'e.g. Valorant Ascendant 3 | Kuronami Vandal + Clean OGE')}" />
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label">${this.tr('ราคาตั้งขาย (THB)', 'Asking Price (THB)')}</label>
                <input id="sell-price" type="number" class="input-field tabular" placeholder="4500" value="4500" />
              </div>
              <div class="form-group">
                <label class="form-label">${this.tr('ระยะเวลารับประกันดึงคืน (วัน)', 'Buyback Warranty (Days)')}</label>
                <input id="sell-warranty" type="number" class="input-field tabular" value="14" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">${this.tr('รายละเอียดเพิ่มเติม', 'Description & Account Notes')}</label>
              <textarea id="sell-desc" class="textarea-field" placeholder="${this.tr('ระบุรายละเอียดความสะอาดของบัญชี ประวัติการเติมเงิน หรือนัดเวลาส่งมอบ...', 'Describe account cleanliness, purchase receipts, or preferred delivery time...')}"></textarea>
            </div>

            <div style="padding-top:14px;">
              <div class="section-heading">
                <span>${this.tr(`3. สเปกเฉพาะของ ${this.sellPlatform.toUpperCase()} (Dynamic Fields)`, `3. ${this.sellPlatform.toUpperCase()} Specific Attributes (Dynamic Fields)`)}</span>
              </div>
              ${fields.map(f => `
                <div class="form-group">
                  <label class="form-label">${f.label}</label>
                  ${f.type === 'select' ? `
                    <select class="input-field" data-spec-key="${f.key}">
                      ${(f.options || []).map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                    </select>
                  ` : `
                    <input class="input-field" data-spec-key="${f.key}" placeholder="${f.placeholder || ''}" />
                  `}
                </div>
              `).join('')}
            </div>

            <button class="btn-primary" style="width:100%;" onclick="app.submitNewListing()">
              ${this.tr('เผยแพร่ประกาศขายขึ้นตลาดกลางทันที', 'Publish Listing to Marketplace')}
            </button>
          </div>

          <div class="vault-card">
            <div class="section-heading"><span>${this.tr('สรุปเงื่อนไขคนกลาง Escrow', 'Escrow Protection Terms')}</span></div>
            <p style="font-size:13px;color:var(--text-secondary);">
              ${this.tr('ทุกรายการที่ลงขายจะได้รับความคุ้มครองโดยระบบพักเงินอัตโนมัติ ผู้ซื้อต้องโอนเงินเข้า Vault เต็มจำนวนก่อนที่ผู้ขายจะส่งมอบรหัสผ่าน', 'Every listing is protected by our automated Escrow Vault. Buyers lock 100% of funds before you submit credentials.')}
            </p>
            <div style="padding-top:12px;font-size:13px;display:flex;flex-direction:column;gap:6px;">
              <div style="display:flex;justify-content:space-between;">
                <span style="color:var(--text-muted);">${this.tr('หมวดหมู่:', 'Category:')}</span>
                <span class="tabular">${this.sellCategory}</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:var(--text-muted);">${this.tr('ค่าธรรมเนียมคนกลาง:', 'Escrow Fee:')}</span>
                <span class="tabular">${this.sellCategory === 'ingame_item' ? '5.0%' : '7.5%'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // VIEW 5: FRAUD BLACKLIST DATABASE CHECKER
  // ==========================================================================
  async searchBlacklist(q) {
    this.blacklistQuery = q;
    try {
      const res = await fetch(`/api/v1/blacklist?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (json.success) {
        this.blacklistItems = json.data || [];
      }
    } catch (e) {
      console.error(e);
    }
    this.render();
  }

  renderBlacklistView() {
    return `
      <div class="single-page-container">
        <div style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px;">
          <div>
            <h1 style="font-size:20px;font-weight:700;">${this.tr('ฐานข้อมูลตรวจสอบประวัติมิจฉาชีพ (Fraud Blacklist Registry)', 'Fraud & Scammer Blacklist Registry')}</h1>
            <p style="color:var(--text-secondary);font-size:13px;">
              ${this.tr('ค้นหาด้วยเลขบัญชีธนาคาร ชื่อ-นามสกุล หรือ Game UID ที่เคยมีประวัติโกงหรือดึงไอดีคืน', 'Search by bank account number, full name, or Game UID reported for fraud or account pullback.')}
            </p>
          </div>
          <div style="display:flex;gap:8px;width:360px;">
            <input
              id="bl-search-input"
              class="input-field"
              placeholder="${this.tr('ค้นหาเลขบัญชี, ชื่อ, หรือ UID...', 'Search bank account, name, or UID...')}"
              value="${this.blacklistQuery}"
              onkeydown="if(event.key==='Enter') app.searchBlacklist(this.value)"
            />
            <button class="btn-primary" onclick="app.searchBlacklist(document.getElementById('bl-search-input').value)">${this.tr('ค้นหา', 'Search')}</button>
          </div>
        </div>

        <div class="listings-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>${this.tr('รหัสอ้างอิง', 'Reference ID')}</th>
                <th>${this.tr('ชื่อผู้กระทำผิด', 'Reported Name')}</th>
                <th>${this.tr('เลขบัญชี / ธนาคาร', 'Bank Account')}</th>
                <th>Game UID</th>
                <th>${this.tr('พฤติกรรมการโกง', 'Offense / Method')}</th>
                <th>${this.tr('วันที่บันทึก', 'Reported Date')}</th>
              </tr>
            </thead>
            <tbody>
              ${this.blacklistItems.map(b => `
                <tr>
                  <td class="tabular" style="color:var(--status-red-text);font-weight:600;">${b.blacklist_id}</td>
                  <td style="font-weight:600;">${b.scammer_name}</td>
                  <td class="tabular">${b.bank_account_number} (${b.bank_name})</td>
                  <td class="tabular">${b.game_uid || '-'}</td>
                  <td style="color:var(--text-secondary);">${b.scam_method}</td>
                  <td class="tabular" style="color:var(--text-muted);">${b.reported_at}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // VIEW 6: UNIFIED CHAT HUB (ห้องแชทรวม — Public Lobby + All Item Negotiations)
  // ==========================================================================
  async fetchChatHubData() {
    const uid = this.currentUser ? this.currentUser.user_id : 'user_buyer_01';
    try {
      const [threadsRes, lobbyRes] = await Promise.all([
        fetch(`/api/v1/chats/my-threads?userId=${encodeURIComponent(uid)}`),
        fetch('/api/v1/chats/lobby')
      ]);
      const threadsJson = await threadsRes.json();
      const lobbyJson = await lobbyRes.json();
      if (threadsJson.success) {
        this.myThreads = threadsJson.data || [];
      }
      if (lobbyJson.success) {
        this.lobbyMessages = lobbyJson.data || [];
      }
      const navCount = document.getElementById('nav-chats-count');
      if (navCount) {
        navCount.textContent = (this.myThreads.length + 1); // +1 for Public Lobby
      }
    } catch (e) {
      console.error('Failed to fetch chat hub data', e);
    }
  }

  async loadChatsHub() {
    await this.fetchChatHubData();
    if (this.activeChatChannel !== 'PUBLIC_LOBBY') {
      await this.reloadActiveThread(this.activeChatChannel);
      if (this.activeThread && this.activeThread.listing_id) {
        const res = await fetch(`/api/v1/listings/${this.activeThread.listing_id}`);
        const json = await res.json();
        if (json.success) this.activeListing = json.data;
      }
    }
    this.render();
  }

  async selectChatChannel(channelId) {
    this.activeChatChannel = channelId;
    if (channelId !== 'PUBLIC_LOBBY') {
      await this.reloadActiveThread(channelId);
      if (this.activeThread && this.activeThread.listing_id) {
        const res = await fetch(`/api/v1/listings/${this.activeThread.listing_id}`);
        const json = await res.json();
        if (json.success) this.activeListing = json.data;
      }
    }
    this.render();
  }

  setChatFilter(filter) {
    this.chatChannelFilter = filter;
    this.render();
  }

  async sendLobbyMessage() {
    const input = document.getElementById('lobby-msg-input');
    const tagSel = document.getElementById('lobby-tag-select');
    const linkSel = document.getElementById('lobby-listing-select');
    if (!input || !input.value.trim()) return;

    const senderId = this.currentUser ? this.currentUser.user_id : 'user_buyer_01';
    const tag = tagSel ? tagSel.value : 'CHAT';
    const linkedListingId = linkSel && linkSel.value ? linkSel.value : null;

    try {
      const res = await fetch('/api/v1/chats/lobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId,
          text: input.value.trim(),
          tag,
          linkedListingId
        })
      });
      const json = await res.json();
      if (json.success) {
        if (json.security_filter && json.security_filter.was_sanitized) {
          this.toast('ระบบ DLP เซ็นเซอร์ข้อมูลติดต่อนอกแพลตฟอร์มอัตโนมัติ');
        }
        input.value = '';
        await this.fetchChatHubData();
        this.render();
      } else {
        this.toast(json.error || 'ไม่สามารถส่งข้อความได้');
      }
    } catch (e) {
      this.toast('เกิดข้อผิดพลาดในการส่งข้อความ');
    }
  }

  async sendHubThreadMessage() {
    const input = document.getElementById('hub-thread-msg-input');
    if (!input || !input.value.trim() || !this.activeThread) return;

    const senderId = (this.currentUser && this.currentUser.user_id === 'user_seller_01')
      ? 'user_seller_01'
      : 'user_buyer_01';

    try {
      const res = await fetch(`/api/v1/chats/${this.activeThread.thread_id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId,
          text: input.value.trim()
        })
      });
      const json = await res.json();
      if (json.success) {
        if (json.security_filter && json.security_filter.was_sanitized) {
          this.toast('ระบบ DLP เซ็นเซอร์ข้อมูลติดต่อนอกแพลตฟอร์มเพื่อความปลอดภัย');
        }
        input.value = '';
        await this.loadChatsHub();
      } else {
        this.toast(json.error);
      }
    } catch (e) {
      this.toast('ส่งข้อความไม่สำเร็จ');
    }
  }

  async submitHubOffer() {
    const priceInput = document.getElementById('hub-offer-price-input');
    if (!priceInput || !priceInput.value || !this.activeThread) return;

    try {
      const res = await fetch(`/api/v1/chats/${this.activeThread.thread_id}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: 'user_buyer_01',
          offeredPrice: Number(priceInput.value),
          message: 'ยื่นข้อเสนอจากห้องแชทรวม พร้อมโอนเข้า Escrow ทันทีครับ'
        })
      });
      const json = await res.json();
      if (json.success) {
        this.toast(json.message);
        await this.loadChatsHub();
      } else {
        this.toast(json.error);
      }
    } catch (e) {
      this.toast('ไม่สามารถยื่นข้อเสนอได้');
    }
  }

  async respondToHubOffer(action) {
    await this.respondToOffer(action);
    await this.fetchChatHubData();
    this.render();
  }

  renderChatsHubView() {
    const isLobby = this.activeChatChannel === 'PUBLIC_LOBBY';
    const showLobbyChannel = this.chatChannelFilter === 'all' || this.chatChannelFilter === 'lobby';
    const showDealChannels = this.chatChannelFilter === 'all' || this.chatChannelFilter === 'deals';

    // Left Channel List
    const lobbyChannelHtml = showLobbyChannel ? `
      <div class="channel-card ${isLobby ? 'active' : ''}" onclick="app.selectChatChannel('PUBLIC_LOBBY')">
        <div class="channel-card-top">
          <span class="platform-tag" style="background:rgba(43,92,246,0.18);border-color:rgba(43,92,246,0.45);color:#93c5fd;">PUBLIC LOBBY</span>
          <span class="tabular" style="font-size:11px;color:var(--status-green-text);">- LIVE (${this.lobbyMessages.length})</span>
        </div>
        <div class="channel-title">${this.tr('ห้องแชทรวมตลาดกลาง (WTB / WTS)', 'Public Trading Lobby (WTB / WTS)')}</div>
        <div class="channel-preview">
          ${this.lobbyMessages.length > 0 ? this.lobbyMessages[this.lobbyMessages.length - 1].text : this.tr('พูดคุย ประกาศตามหาไอดี และเช็กราคาตลาด', 'Discuss market prices, post WTB/WTS requests')}
        </div>
      </div>
    ` : '';

    const dealChannelsHtml = showDealChannels ? this.myThreads.map(th => {
      const active = this.activeChatChannel === th.thread_id;
      const offerBadge = th.active_offer
        ? `<span class="offer-status-badge ${th.active_offer.status}">${th.active_offer.status} ${this.formatTHB(th.active_offer.offered_price)}</span>`
        : `<span class="tabular" style="font-size:11px;color:var(--text-muted);">${this.formatTHB(th.listing_price)}</span>`;
      return `
        <div class="channel-card ${active ? 'active' : ''}" onclick="app.selectChatChannel('${th.thread_id}')">
          <div class="channel-card-top">
            <span class="platform-tag">${th.game_type || 'DEAL'}</span>
            ${offerBadge}
          </div>
          <div class="channel-title">${th.listing_title}</div>
          <div class="channel-preview">${th.last_message}</div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-top:2px;">
            <span>${this.tr('คู่สนทนา:', 'Trader:')} ${th.other_user ? th.other_user.display_name : 'Trader'}</span>
            <span class="tabular">${new Date(th.updated_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      `;
    }).join('') : '';

    // Center Stream Content
    let centerStreamHtml = '';
    let rightInspectorHtml = '';

    if (isLobby) {
      centerStreamHtml = `
        <div class="chats-stream-header">
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <h2 style="font-size:16px;font-weight:700;">${this.tr('ห้องแชทรวมตลาดกลาง (Public Trading & WTB/WTS Lobby)', 'Public Trading & WTB/WTS Lobby')}</h2>
              <span class="offer-status-badge accepted">DLP PROTECTED</span>
            </div>
            <div style="font-size:12px;color:var(--text-secondary);">
              ${this.tr('พื้นที่กลางสำหรับประกาศตั้งรับไอดี (WTB), แนะนำรายการขาย (WTS), และพูดคุยกับเทรดเดอร์และคนกลางในระบบ', 'Central lobby for Want-To-Buy (WTB), Want-To-Sell (WTS), and live discussions with verified traders & Inspectors.')}
            </div>
          </div>
          <span class="tabular" style="font-size:12px;color:var(--text-muted);">${this.lobbyMessages.length} ${this.tr('ข้อความ', 'messages')}</span>
        </div>

        <div class="chats-stream-body">
          ${this.lobbyMessages.map(m => {
            const tagColor = m.tag.includes('WTB')
              ? 'color:#fbbf24;'
              : (m.tag.includes('WTS') ? 'color:#4ade80;' : 'color:#93c5fd;');
            return `
              <div class="lobby-msg-card ${m.role === 'inspector' ? 'inspector' : ''}">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                  <div style="display:flex;align-items:center;gap:8px;">
                    <span class="verify-tag" style="${tagColor}">${m.tag}</span>
                    <strong style="font-size:13px;color:var(--text-primary);">${m.sender_name}</strong>
                    <span class="tabular" style="font-size:11px;color:var(--status-green-text);">Trust ${m.trust_score}%</span>
                  </div>
                  <span class="tabular" style="font-size:11px;color:var(--text-muted);">
                    ${new Date(m.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div style="font-size:13.5px;color:var(--text-primary);line-height:1.5;">${m.text}</div>

                ${m.linked_listing ? `
                  <div class="lobby-linked-item" onclick="app.openListingDetail('${m.linked_listing.listing_id}')">
                    <div>
                      <span class="platform-tag" style="margin-right:6px;">${m.linked_listing.game_type}</span>
                      <span style="font-size:12.5px;font-weight:600;color:var(--text-primary);">${m.linked_listing.title}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">
                      <span class="tabular" style="font-weight:700;color:var(--text-primary);">${this.formatTHB(m.linked_listing.asking_price)}</span>
                      <span style="font-size:12px;color:var(--accent-blue);font-weight:600;">${this.tr('ดูสเปก / ต่อรอง', 'View / Negotiate')}</span>
                    </div>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <div class="chats-composer-bar">
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <select id="lobby-tag-select" class="input-field" style="width:165px;height:30px;font-size:12px;">
              <option value="WTB / ตั้งรับ">${this.tr('แท็ก: WTB / ตั้งรับไอดี', 'Tag: WTB / Looking to Buy')}</option>
              <option value="WTS / ขาย">${this.tr('แท็ก: WTS / แนะนำสินค้า', 'Tag: WTS / Selling')}</option>
              <option value="พูดคุยทั่วไป">${this.tr('แท็ก: พูดคุย / สอบถามราคา', 'Tag: General Discussion')}</option>
            </select>
            <select id="lobby-listing-select" class="input-field" style="flex:1;height:30px;font-size:12px;">
              <option value="">${this.tr('-- แนบการ์ดรายการสินค้าในตลาด (ไม่บังคับ) --', '-- Attach a Marketplace Listing Card (Optional) --')}</option>
              ${this.listings.map(l => `<option value="${l.listing_id}">[${l.game_type}] ${l.title} (${this.formatTHB(l.asking_price)})</option>`).join('')}
            </select>
          </div>
          <div style="display:flex;gap:8px;">
            <input
              id="lobby-msg-input"
              class="input-field"
              placeholder="${this.tr('พิมพ์ประกาศตามหาไอดี หรือพูดคุยในห้องแชทรวม...', 'Post a WTB/WTS message or ask the lobby...')}"
              onkeydown="if(event.key==='Enter') app.sendLobbyMessage()"
            />
            <button class="btn-primary" onclick="app.sendLobbyMessage()">${this.tr('ส่งเข้าห้องรวม', 'Post to Lobby')}</button>
          </div>
        </div>
      `;

      rightInspectorHtml = `
        <div>
          <div class="section-heading"><span>${this.tr('คนกลางที่พร้อมให้บริการ (Online Inspectors)', 'Online Certified Inspectors')}</span></div>
          <div class="vault-card" style="padding:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong style="font-size:13px;">Admin_Inspector_01</strong>
              <span class="offer-status-badge accepted">ONLINE</span>
            </div>
            <div style="font-size:12px;color:var(--text-secondary);">
              ${this.tr('คนกลางรับรองโดยแพลตฟอร์ม ตรวจสกินจริงและสับเปลี่ยนอีเมลผูกในห้อง 5-Step Escrow', 'Platform-certified Inspector verifying skins and rebinding OGE emails in 5-Step Escrow rooms.')}
            </div>
          </div>
        </div>

        <div>
          <div class="section-heading"><span>${this.tr('ดีลต่อรองราคาที่กำลังดำเนินการ', 'Active Deal Negotiations')} (${this.myThreads.length})</span></div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${this.myThreads.map(th => `
              <div class="escrow-room-item" onclick="app.selectChatChannel('${th.thread_id}')">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span class="platform-tag">${th.game_type}</span>
                  ${th.active_offer ? `<span class="offer-status-badge ${th.active_offer.status}">${th.active_offer.status}</span>` : ''}
                </div>
                <div style="font-size:12px;font-weight:600;color:var(--text-primary);">${th.listing_title}</div>
                <div class="tabular" style="font-size:12px;color:var(--status-green-text);">
                  ${th.active_offer ? `${this.tr('ราคาที่ต่อรอง:', 'Offer:')} ${this.formatTHB(th.active_offer.offered_price)}` : `${this.tr('ราคาตั้งขาย:', 'Asking:')} ${this.formatTHB(th.listing_price)}`}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="vault-card" style="padding:12px;">
          <div style="font-size:12px;font-weight:600;color:var(--text-primary);">${this.tr('กฎความปลอดภัยห้องแชทรวม', 'Lobby DLP Security Policy')}</div>
          <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;">
            ${this.tr('ระบบ DLP จะบล็อกเลขบัญชีธนาคารและไอดี Line อัตโนมัติ ทุกการซื้อขายต้องกดสร้างสัญญาเข้าห้อง Escrow เพื่อล็อกเงินค้ำประกัน 100%', 'DLP automatically masks off-platform bank accounts and Line IDs. All trades are protected 100% via Escrow.')}
          </p>
        </div>
      `;
    } else {
      const th = this.activeThread;
      const offer = this.activeOffer;
      const item = this.activeListing || (th && th.listing) || {};
      const msgs = (th && th.messages) || [];

      centerStreamHtml = `
        <div class="chats-stream-header">
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="platform-tag">${item.game_type || 'ITEM DEAL'}</span>
              <h2 style="font-size:15px;font-weight:700;">${th ? th.listing_title : ''}</h2>
            </div>
            <div style="font-size:12px;color:var(--text-secondary);">
              ${this.tr('ผู้ซื้อ:', 'Buyer:')} ${th && th.buyer ? th.buyer.display_name : 'Buyer'} · ${this.tr('ผู้ขาย:', 'Seller:')} ${th && th.seller ? th.seller.display_name : 'Seller'}
            </div>
          </div>
          <button class="btn-secondary" style="padding:5px 10px;font-size:12px;" onclick="app.openListingDetail('${th ? th.listing_id : ''}')">
            ${this.tr('เปิดหน้าสินค้าเต็มจอ', 'Open Full Listing')}
          </button>
        </div>

        <!-- PINNED OFFER BAR IN UNIFIED CHAT -->
        <div class="offer-engine-bar">
          ${offer ? `
            <div class="active-offer-card">
              <div class="offer-row-top">
                <span style="font-size:12px;font-weight:600;color:var(--text-secondary);">${this.tr('สถานะการต่อรองราคาประจำดีลนี้', 'Current Negotiation Offer Status')}</span>
                <span class="offer-status-badge ${offer.status}">${offer.status}</span>
              </div>
              <div style="display:flex;align-items:baseline;justify-content:space-between;">
                <div>
                  <span class="tabular" style="font-size:18px;font-weight:700;color:var(--text-primary);">${this.formatTHB(offer.offered_price)}</span>
                  <span class="tabular" style="font-size:12px;color:var(--text-muted);text-decoration:line-through;margin-left:6px;">${this.formatTHB(offer.original_price)}</span>
                </div>
                <span class="tabular" style="font-size:12px;color:var(--status-green-text);">${this.tr('ส่วนลด', 'Discount')} ${this.formatTHB(offer.discount_amount)} (-${offer.discount_percent}%)</span>
              </div>

              ${offer.status === 'accepted' ? `
                <button class="btn-green" style="width:100%;margin-top:4px;" onclick="app.startEscrowFromOffer('${th.thread_id}', '${offer.offer_id}')">
                  ${this.tr('ชำระเงินเปิดสัญญา Escrow ราคาที่ตกลง', 'Lock Funds in Escrow at Agreed Price')} (${this.formatTHB(offer.offered_price)})
                </button>
              ` : ''}

              ${(offer.status === 'pending' || offer.status === 'countered') ? `
                <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
                  <button class="btn-green" style="flex:1;padding:6px 10px;font-size:12px;" onclick="app.respondToHubOffer('accept')">
                    ${this.tr('ผู้ขาย: ตกลงรับราคา (Accept)', 'Seller: Accept Offer')}
                  </button>
                  <button class="btn-secondary" style="padding:6px 10px;font-size:12px;" onclick="app.respondToHubOffer('counter')">
                    ${this.tr('เสนอราคาสวน (Counter)', 'Counter Offer')}
                  </button>
                  <button class="btn-secondary" style="padding:6px 10px;font-size:12px;color:var(--status-red-text);" onclick="app.respondToHubOffer('decline')">
                    ${this.tr('ปฏิเสธ', 'Decline')}
                  </button>
                </div>
              ` : ''}
            </div>
          ` : ''}

          <div class="offer-form-inline">
            <input
              id="hub-offer-price-input"
              type="number"
              class="input-field tabular"
              placeholder="${this.tr('ระบุราคาที่ต้องการยื่นต่อรองใหม่ (THB)...', 'Enter new offer amount (THB)...')}"
              value="${item.asking_price ? Math.round(item.asking_price * 0.92) : 5000}"
            />
            <button class="btn-secondary" style="white-space:nowrap;" onclick="app.submitHubOffer()">
              ${this.tr('ยื่นข้อเสนอราคาใหม่', 'Submit New Offer')}
            </button>
          </div>
        </div>

        <div class="chats-stream-body">
          ${msgs.map(m => `
            <div class="chat-msg ${m.role}">
              <div class="chat-msg-meta">
                <span class="chat-msg-sender">${m.sender_name} (${m.role.toUpperCase()})</span>
                <span class="tabular">${new Date(m.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div class="chat-msg-text">${m.text}</div>
            </div>
          `).join('')}
        </div>

        <div class="chat-input-bar">
          <input
            id="hub-thread-msg-input"
            class="input-field"
            placeholder="${this.tr('พิมพ์ข้อความคุยกับคู่ค้าในดีลนี้...', 'Type a message to the counterparty...')}"
            onkeydown="if(event.key==='Enter') app.sendHubThreadMessage()"
          />
          <button class="btn-primary" onclick="app.sendHubThreadMessage()">${this.tr('ส่งข้อความ', 'Send')}</button>
        </div>
      `;

      const specs = (item && item.inventory_specs) || {};
      const specRows = Object.entries(specs)
        .filter(([k]) => !['listing_id', 'category_type', 'platform_id', 'skins', 'submitted_at'].includes(k))
        .slice(0, 6);

      rightInspectorHtml = `
        <div>
          <div class="section-heading"><span>${this.tr('ข้อมูลรายการที่กำลังเจรจา', 'Active Deal Listing')}</span></div>
          <div class="vault-card" style="padding:14px;gap:10px;">
            <span class="platform-tag" style="align-self:flex-start;">${item.game_type || 'GAME'}</span>
            <div style="font-size:14px;font-weight:700;color:var(--text-primary);">${item.title || ''}</div>
            <div class="tabular" style="font-size:20px;font-weight:700;color:var(--text-primary);">
              ${this.formatTHB(item.asking_price || 0)}
            </div>
            <div style="font-size:12px;color:var(--text-secondary);">
              ${this.tr('ประกันดึงคืน', 'Warranty')} ${item.warranty_days || 14} ${this.tr('วัน', 'days')} · ${this.tr('ค่าธรรมเนียมคนกลาง', 'Escrow fee')} ${item.escrow_fee_percent || 7.5}%
            </div>
            <button class="btn-primary" style="width:100%;" onclick="app.openCheckoutView('${item.listing_id}')">
              ${this.tr('ซื้อทันทีด้วยราคาตั้งขาย', 'Buy via Escrow')} (${this.formatTHB(item.asking_price || 0)})
            </button>
          </div>
        </div>

        <div>
          <div class="section-heading"><span>${this.tr('สเปกสำคัญของรายการนี้', 'Key Specifications')}</span></div>
          <div class="vault-card" style="padding:12px;gap:8px;">
            ${specRows.map(([k, v]) => `
              <div style="display:flex;justify-content:space-between;gap:8px;font-size:12px;padding-bottom:6px;">
                <span style="color:var(--text-muted);">${this.specLabel(k)}</span>
                <span style="color:var(--text-primary);font-weight:500;text-align:right;">${k === 'estimated_market_value' ? this.formatTHB(v) : v}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    return `
      <div class="chats-hub-layout">
        <!-- LEFT COLUMN: ALL CHAT CHANNELS (PUBLIC LOBBY + ITEM DEAL THREADS) -->
        <aside class="chats-sidebar">
          <div class="chats-sidebar-top">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-size:14px;font-weight:700;">${this.tr('ห้องแชทรวม & ดีลต่อรอง', 'Chat Hub & Deal Threads')}</span>
              <span class="tabular" style="font-size:11px;color:var(--text-muted);">${this.myThreads.length + 1} ${this.tr('ห้อง', 'rooms')}</span>
            </div>
            <div class="tier-tabs" style="width:100%;display:grid;grid-template-columns:repeat(3,1fr);">
              <button class="tier-tab ${this.chatChannelFilter === 'all' ? 'active' : ''}" onclick="app.setChatFilter('all')">${this.tr('ทั้งหมด', 'All')}</button>
              <button class="tier-tab ${this.chatChannelFilter === 'lobby' ? 'active' : ''}" onclick="app.setChatFilter('lobby')">${this.tr('แชทตลาด', 'Lobby')}</button>
              <button class="tier-tab ${this.chatChannelFilter === 'deals' ? 'active' : ''}" onclick="app.setChatFilter('deals')">${this.tr('ดีลสินค้า', 'Deals')} (${this.myThreads.length})</button>
            </div>
          </div>

          <div class="chats-channel-list">
            ${lobbyChannelHtml}
            ${dealChannelsHtml}
          </div>
        </aside>

        <!-- CENTER COLUMN: ACTIVE CHAT & NEGOTIATION STREAM -->
        <main class="chats-center-stream">
          ${centerStreamHtml}
        </main>

        <!-- RIGHT COLUMN: DEAL & ITEM CONTEXT INSPECTOR -->
        <aside class="chats-right-inspector">
          ${rightInspectorHtml}
        </aside>
      </div>
    `;
  }

  render() {
    const root = document.getElementById('app-viewport');
    if (!root) return;

    if (this.currentView === 'market') {
      root.innerHTML = this.renderMarketView();
    } else if (this.currentView === 'chats') {
      root.innerHTML = this.renderChatsHubView();
    } else if (this.currentView === 'detail') {
      root.innerHTML = this.renderDetailView();
    } else if (this.currentView === 'checkout') {
      root.innerHTML = this.renderCheckoutView();
    } else if (this.currentView === 'escrow') {
      root.innerHTML = this.renderEscrowView();
    } else if (this.currentView === 'sell') {
      root.innerHTML = this.renderSellView();
    } else if (this.currentView === 'blacklist') {
      root.innerHTML = this.renderBlacklistView();
    } else if (this.currentView === 'wallet') {
      root.innerHTML = this.renderWalletView();
    } else if (this.currentView === 'seller_profile') {
      root.innerHTML = this.renderSellerProfileView();
    } else if (this.currentView === 'wishlist') {
      root.innerHTML = this.renderWishlistView();
    } else if (this.currentView === 'support') {
      root.innerHTML = this.renderSupportView();
    } else if (this.currentView === 'auth') {
      root.innerHTML = this.renderAuthView();
      this.mountGoogleButton();
    }
  }

  // ==========================================================================
  // AUTH: LOGIN / REGISTER / GOOGLE SIGN-IN
  // ==========================================================================
  async fetchAuthConfig() {
    try {
      const res = await fetch('/api/v1/auth/config');
      const json = await res.json();
      this.authConfig = json.success ? json.data : { googleEnabled: false };
    } catch (_) {
      this.authConfig = { googleEnabled: false };
    }
  }

  openAuth(mode = 'login') {
    this.authMode = mode;
    this.authError = '';
    this.currentView = 'auth';
    this.render();
    window.scrollTo(0, 0);
  }

  setAuthMode(mode) {
    this.authMode = mode;
    this.authError = '';
    this.render();
  }

  renderAuthHeader() {
    const el = document.getElementById('auth-area');
    if (!el) return;
    const u = this.currentUser;
    const walletBox = document.querySelector('.wallet-box');

    // Seed demo accounts are treated as "guest perspective" until a real login happens
    if (!u || !this.isAuthenticated) {
      if (walletBox) walletBox.style.display = 'none';
      el.innerHTML = `
        <button class="auth-btn" onclick="app.openAuth('login')">${this.tr('เข้าสู่ระบบ', 'Log in')}</button>
        <button class="auth-btn solid" onclick="app.openAuth('register')">${this.tr('ลงทะเบียน', 'Sign up')}</button>
      `;
      return;
    }
    if (walletBox) walletBox.style.display = 'flex';
    const initial = (u.display_name || u.email || '?').trim().charAt(0).toUpperCase();
    el.innerHTML = `
      <div class="auth-user-chip" title="${u.email || ''}">
        ${u.photo_url ? `<img src="${u.photo_url}" alt="" referrerpolicy="no-referrer" />` : `<span class="auth-avatar">${initial}</span>`}
        <span class="auth-name">${u.display_name}</span>
        <button onclick="app.logout()">${this.tr('ออกจากระบบ', 'Log out')}</button>
      </div>
    `;
  }

  renderAuthView() {
    const isLogin = this.authMode !== 'register';
    const g = this.authConfig || {};
    return `
      <div class="auth-page">
        <div class="auth-pitch">
          <h1>${isLogin ? this.tr('ยินดีต้อนรับกลับ', 'Welcome back') : this.tr('สร้างบัญชีเพื่อซื้อขายไอดีอย่างปลอดภัย', 'Create an account to trade safely')}</h1>
          <p>${this.tr('ทุกดีลมีคนกลางตรวจสอบ เงินถูกล็อกไว้ใน Escrow จนกว่าคุณจะได้รับไอดีครบถ้วน', 'Every deal is inspected. Funds stay locked in Escrow until you receive the account.')}</p>
          <ul>
            <li>${this.tr('เงินถูกพักไว้ใน Vault จนกว่าจะตรวจรับสำเร็จ', 'Funds held in Vault until delivery is confirmed')}</li>
            <li>${this.tr('รหัสผ่านไอดีเข้ารหัส AES-256-GCM', 'Account credentials encrypted with AES-256-GCM')}</li>
            <li>${this.tr('เรียก Admin ตัดสินได้ทุกเมื่อหากมีปัญหา', 'Call an Admin to arbitrate any dispute')}</li>
          </ul>
        </div>

        <div class="auth-card">
          <div class="auth-tabs">
            <button class="${isLogin ? 'active' : ''}" onclick="app.setAuthMode('login')">${this.tr('เข้าสู่ระบบ', 'Log in')}</button>
            <button class="${!isLogin ? 'active' : ''}" onclick="app.setAuthMode('register')">${this.tr('ลงทะเบียน', 'Sign up')}</button>
          </div>

          <div class="auth-google-slot" id="google-btn-slot">
            ${g.googleEnabled ? '' : `
              <button type="button" class="btn-google-action" onclick="app.openGoogleAuthModal()">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>${isLogin ? this.tr('เข้าสู่ระบบด้วยบัญชี Google', 'Sign in with Google') : this.tr('ลงทะเบียนด้วยบัญชี Google', 'Sign up with Google')}</span>
              </button>
            `}
          </div>

          <div class="auth-divider">${this.tr('หรือใช้อีเมล', 'or use email')}</div>

          <form onsubmit="event.preventDefault(); app.submitAuthForm();" style="display:flex;flex-direction:column;gap:12px;">
            ${!isLogin ? `
              <div class="form-group">
                <label class="form-label">${this.tr('ชื่อที่แสดง', 'Display name')}</label>
                <input id="auth-name" class="input-field" autocomplete="nickname" required maxlength="40" />
              </div>
            ` : ''}
            <div class="form-group">
              <label class="form-label">${this.tr('อีเมล', 'Email')}</label>
              <input id="auth-email" type="email" class="input-field" autocomplete="email" required />
            </div>
            <div class="form-group">
              <label class="form-label">${this.tr('รหัสผ่าน', 'Password')}${!isLogin ? ` <span style="color:var(--text-muted);font-weight:400;">(${this.tr('อย่างน้อย 6 ตัวอักษร', 'min 6 characters')})</span>` : ''}</label>
              <input id="auth-password" type="password" class="input-field" autocomplete="${isLogin ? 'current-password' : 'new-password'}" required minlength="6" />
            </div>
            ${this.authError ? `<div class="auth-error">${this.authError}</div>` : ''}
            <button type="submit" class="auth-submit" id="auth-submit-btn">
              ${isLogin ? this.tr('เข้าสู่ระบบ', 'Log in') : this.tr('สร้างบัญชี', 'Create account')}
            </button>
          </form>

          <div class="auth-note">
            ${isLogin
              ? `${this.tr('ยังไม่มีบัญชี?', 'No account yet?')} <a href="#" onclick="event.preventDefault();app.setAuthMode('register')" style="color:var(--accent-blue-hover);">${this.tr('ลงทะเบียน', 'Sign up')}</a>`
              : `${this.tr('มีบัญชีอยู่แล้ว?', 'Already have an account?')} <a href="#" onclick="event.preventDefault();app.setAuthMode('login')" style="color:var(--accent-blue-hover);">${this.tr('เข้าสู่ระบบ', 'Log in')}</a>`}
          </div>
        </div>
      </div>
    `;
  }

  openGoogleAuthModal() {
    let modal = document.getElementById('google-auth-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'google-auth-modal';
      modal.className = 'google-modal-backdrop';
      document.body.appendChild(modal);
    }
    const isLogin = this.authMode !== 'register';
    modal.innerHTML = `
      <div class="google-modal-card">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="display:flex;align-items:center;gap:10px;">
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <strong style="font-size:16px;">${isLogin ? this.tr('เข้าสู่ระบบด้วยบัญชี Google', 'Sign in with Google Account') : this.tr('ลงทะเบียนด้วยบัญชี Google จริง', 'Register with Real Google Account')}</strong>
          </div>
          <button style="background:transparent;border:none;color:var(--text-muted);font-size:18px;cursor:pointer;" onclick="app.closeGoogleModal()">&times;</button>
        </div>

        <p style="font-size:13px;color:var(--text-secondary);line-height:1.5;margin:0;">
          ${this.tr('กรอกอีเมล Google (@gmail.com หรือ Google Workspace) ของคุณเพื่อลงทะเบียนและสร้างโปรไฟล์ผู้ใช้ทันที', 'Enter your real Google email address (@gmail.com) to register and login immediately.')}
        </p>

        <form onsubmit="event.preventDefault(); app.submitGoogleDirect();" style="display:flex;flex-direction:column;gap:12px;">
          <div class="form-group">
            <label class="form-label">${this.tr('อีเมล Google ของคุณ', 'Your Google Email')}</label>
            <input id="g-direct-email" type="email" class="input-field" placeholder="yourname@gmail.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">${this.tr('ชื่อที่แสดงในระบบ (Display Name)', 'Display Name')}</label>
            <input id="g-direct-name" class="input-field" placeholder="เช่น Somchai Gamer" />
          </div>
          <div id="g-direct-error" style="display:none;" class="auth-error"></div>
          <button type="submit" class="auth-submit" style="background:#2b5cf6;" id="g-direct-btn">
            ${isLogin ? this.tr('เข้าสู่ระบบด้วย Google', 'Continue with Google') : this.tr('ลงทะเบียนด้วย Google ทันที', 'Complete Google Registration')}
          </button>
        </form>

        <div style="border-top:1px solid var(--border-subtle);padding-top:12px;display:flex;flex-direction:column;gap:6px;">
          <div style="font-size:12px;color:var(--text-muted);display:flex;justify-content:space-between;align-items:center;">
            <span>${this.tr('ต้องการเปิดใช้ Google Popup ปุ่มแท้?', 'Want authentic Google OAuth popup?')}</span>
            <button style="background:transparent;border:none;color:var(--accent-blue-hover);font-size:12px;cursor:pointer;" onclick="app.toggleGoogleConfigInput()">${this.tr('ใส่ Client ID', 'Enter Client ID')}</button>
          </div>
          <div id="g-config-box" style="display:none;margin-top:8px;flex-direction:column;gap:8px;">
            <input id="g-config-input" class="input-field" placeholder="xxxx.apps.googleusercontent.com" style="font-size:12px;" />
            <button class="btn-secondary" style="height:32px;font-size:12px;" onclick="app.saveGoogleClientId()">${this.tr('บันทึกและเปิดใช้ปุ่มแท้', 'Save & Enable One-Tap')}</button>
          </div>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
  }

  closeGoogleModal() {
    const modal = document.getElementById('google-auth-modal');
    if (modal) modal.style.display = 'none';
  }

  toggleGoogleConfigInput() {
    const box = document.getElementById('g-config-box');
    if (box) box.style.display = box.style.display === 'none' ? 'flex' : 'none';
  }

  async saveGoogleClientId() {
    const input = document.getElementById('g-config-input');
    if (!input || !input.value.trim()) return;
    try {
      const res = await fetch('/api/v1/auth/google-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleClientId: input.value.trim() })
      });
      const json = await res.json();
      if (json.success) {
        this.toast(json.message);
        this.authConfig = json.data;
        this.closeGoogleModal();
        this.render();
      } else {
        this.toast(json.error);
      }
    } catch (_) {
      this.toast('ไม่สามารถบันทึกได้');
    }
  }

  async submitGoogleDirect() {
    const email = (document.getElementById('g-direct-email') || {}).value || '';
    const displayName = (document.getElementById('g-direct-name') || {}).value || '';
    const errEl = document.getElementById('g-direct-error');
    const btn = document.getElementById('g-direct-btn');
    if (btn) btn.disabled = true;
    try {
      const res = await fetch('/api/v1/auth/google-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, displayName })
      });
      const json = await res.json();
      if (!json.success) {
        if (errEl) { errEl.textContent = json.error; errEl.style.display = 'block'; }
        return;
      }
      this.closeGoogleModal();
      this.onAuthSuccess(json);
    } catch (e) {
      if (errEl) { errEl.textContent = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'; errEl.style.display = 'block'; }
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  mountGoogleButton(attempt = 0) {
    const g = this.authConfig || {};
    const slot = document.getElementById('google-btn-slot');
    if (!slot || !g.googleEnabled) return;
    if (!(window.google && google.accounts && google.accounts.id)) {
      // GIS script loads async; retry briefly
      if (attempt < 20) setTimeout(() => this.mountGoogleButton(attempt + 1), 250);
      else slot.innerHTML = `<div class="auth-note">${this.tr('โหลด Google Sign-In ไม่สำเร็จ', 'Failed to load Google Sign-In')}</div>`;
      return;
    }
    if (!this._gisInitialized) {
      google.accounts.id.initialize({
        client_id: g.googleClientId,
        callback: (resp) => this.handleGoogleCredential(resp),
        ux_mode: 'popup'
      });
      this._gisInitialized = true;
    }
    slot.innerHTML = '';
    google.accounts.id.renderButton(slot, {
      theme: 'filled_black',
      size: 'large',
      shape: 'pill',
      width: 360,
      text: this.authMode === 'register' ? 'signup_with' : 'signin_with',
      locale: this.lang === 'th' ? 'th' : 'en'
    });
  }

  async handleGoogleCredential(resp) {
    try {
      const res = await fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: resp.credential })
      });
      const json = await res.json();
      if (!json.success) {
        this.authError = json.error;
        this.render();
        return;
      }
      this.onAuthSuccess(json);
    } catch (e) {
      this.authError = this.tr('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'Could not reach server');
      this.render();
    }
  }

  async submitAuthForm() {
    const isLogin = this.authMode !== 'register';
    const email = (document.getElementById('auth-email') || {}).value || '';
    const password = (document.getElementById('auth-password') || {}).value || '';
    const displayName = (document.getElementById('auth-name') || {}).value || '';
    const btn = document.getElementById('auth-submit-btn');
    if (btn) btn.disabled = true;
    try {
      const res = await fetch(`/api/v1/auth/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin ? { email, password } : { email, password, displayName })
      });
      const json = await res.json();
      if (!json.success) {
        this.authError = json.error;
        this.render();
        const emailEl = document.getElementById('auth-email');
        if (emailEl) emailEl.value = email;
        return;
      }
      this.onAuthSuccess(json);
    } catch (e) {
      this.authError = this.tr('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'Could not reach server');
      this.render();
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async onAuthSuccess(json) {
    this.currentUser = json.data;
    this.isAuthenticated = true;
    localStorage.setItem('vx_auth', '1');
    this.authError = '';
    this.updateWalletHeader();
    this.toast(json.message);
    await Promise.all([this.fetchEscrows(), this.fetchChatHubData(), this.fetchWalletHistory()]);
    this.navigate('market');
  }

  async logout() {
    try { await fetch('/api/v1/auth/logout', { method: 'POST' }); } catch (_) {}
    if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect();
    this.isAuthenticated = false;
    localStorage.removeItem('vx_auth');
    await this.fetchCurrentUser();
    this.toast(this.tr('ออกจากระบบเรียบร้อยแล้ว', 'Logged out'));
    this.navigate('market');
  }

  // ==========================================================================
  // VIEW 7: NEGOTIATE SHORTCUT & ESCROW CHECKOUT CONFIRMATION PAGE
  // ==========================================================================
  async openNegotiateView(listingId) {
    await this.openListingDetail(listingId);
    setTimeout(() => {
      const offerInput = document.getElementById('offer-price-input') || document.getElementById('chat-msg-input');
      if (offerInput) {
        offerInput.focus();
        offerInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      this.toast(this.tr('เข้าสู่ห้องเจรจาต่อรองราคาสดกับผู้ขาย', 'Opened live price negotiation desk with seller'));
    }, 80);
  }

  async openCheckoutView(listingId) {
    try {
      const res = await fetch(`/api/v1/listings/${listingId}`);
      const json = await res.json();
      if (!json.success) {
        this.toast(json.error || 'ไม่พบรายการสินค้า');
        return;
      }
      if (this.currentUser && this.currentUser.user_id === json.data.seller_id) {
        this.toast(this.tr('คุณไม่สามารถซื้อสินค้าของตนเองได้', 'You cannot purchase your own listing'));
        return;
      }
      this.checkoutListing = json.data;
      this.currentView = 'checkout';
      this.render();
      window.scrollTo(0, 0);
    } catch (e) {
      this.toast('ไม่สามารถเปิดหน้าชำระเงินได้');
    }
  }

  setCheckoutPayMethod(method) {
    this.checkoutPayMethod = method;
    this.render();
  }

  async confirmCheckoutEscrow() {
    if (!this.checkoutListing) return;
    const item = this.checkoutListing;
    const balance = this.currentUser ? this.currentUser.wallet_balance : 0;

    if (this.checkoutPayMethod === 'promptpay_qr' && balance < item.asking_price) {
      // Auto top-up the difference via PromptPay simulation before locking into Escrow
      const diff = Math.ceil(item.asking_price - balance);
      await fetch('/api/v1/auth/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_buyer_01',
          amount: diff
        })
      });
    }
    await this.initiateDirectEscrow(item.listing_id);
  }

  renderCheckoutView() {
    const item = this.checkoutListing || this.activeListing || this.listings[0];
    if (!item) return '';

    const balance = this.currentUser ? this.currentUser.wallet_balance : 0;
    const feeAmount = +(item.asking_price * ((item.escrow_fee_percent || 7.5) / 100)).toFixed(2);
    const sellerNet = +(item.asking_price - feeAmount).toFixed(2);
    const hasEnoughWallet = balance >= item.asking_price;
    const img = this.productImage(item);
    const sellerName = (item.seller && item.seller.display_name) || item.seller_name || 'VerifiedSeller';

    return `
      <div class="detail-topbar">
        <div class="breadcrumb-left">
          <button class="btn-back" onclick="app.navigate('market')">${this.tr('กลับสู่ตลาดกลาง', 'Back to Marketplace')}</button>
          <span>/</span>
          <span class="platform-tag">ESCROW CHECKOUT</span>
          <span class="tabular" style="color:var(--text-muted);">ORDER REF: ${item.listing_id}</span>
        </div>
        <span class="verify-tag admin_verified">AES-256-GCM ESCROW PROTECTION</span>
      </div>

      <div class="single-page-container">
        <div style="margin-bottom:20px;">
          <h1 style="font-size:22px;font-weight:700;">${this.tr('ยืนยันคำสั่งซื้อและล็อกเงินค้ำประกัน (Escrow Checkout)', 'Confirm Order & Lock Funds in Escrow (Escrow Checkout)')}</h1>
          <p style="font-size:13px;color:var(--text-secondary);">
            ${this.tr('เงินของคุณจะถูกพักไว้ในตู้เซฟกลาง VaultX 100% และจะยังไม่ถูกโอนให้ผู้ขายจนกว่าคนกลางและคุณจะตรวจสอบไอดีเสร็จสมบูรณ์', 'Your payment is locked 100% in the VaultX Escrow account and is only released after the Inspector and you verify the account.')}
          </p>
        </div>

        <div class="form-grid-2col">
          <div style="display:flex;flex-direction:column;gap:16px;">
            <!-- ITEM SUMMARY CARD -->
            <div class="vault-card" style="padding:18px;gap:14px;">
              <div class="section-heading"><span>${this.tr('1. รายการสินค้าที่สั่งซื้อ', '1. Selected Account / Item Summary')}</span></div>
              <div style="display:flex;gap:16px;align-items:center;">
                <div style="width:120px;height:80px;background:#111214;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:8px;flex-shrink:0;">
                  ${img ? `<img src="${img}" alt="${item.title}" style="max-width:100%;max-height:100%;object-fit:contain;" />` : `<span class="platform-tag">${item.game_type}</span>`}
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;">
                  <div style="display:flex;gap:8px;align-items:center;">
                    <span class="platform-tag">${item.game_type}</span>
                    <span class="skin-micro-tag">${this.tr(`รับประกันดึงคืน ${item.warranty_days || 14} วัน`, `${item.warranty_days || 14}-Day Buyback Warranty`)}</span>
                  </div>
                  <h3 style="font-size:16px;font-weight:700;color:var(--text-primary);">${item.title}</h3>
                  <div style="font-size:12px;color:var(--text-secondary);">
                    ${this.tr('ผู้ขาย:', 'Seller:')} <strong style="color:var(--status-green-text);cursor:pointer;text-decoration:underline;" onclick="app.openSellerProfile('${sellerName.replace(/'/g, "\\'")}')">${sellerName}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- PAYMENT METHOD SELECTOR -->
            <div class="vault-card" style="padding:18px;gap:14px;">
              <div class="section-heading"><span>${this.tr('2. เลือกช่องทางชำระเงินเข้าห้องคนกลาง', '2. Select Escrow Payment Method')}</span></div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="escrow-room-item ${this.checkoutPayMethod === 'wallet' ? 'active' : ''}" style="padding:14px;" onclick="app.setCheckoutPayMethod('wallet')">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <strong style="font-size:13.5px;color:var(--text-primary);">VaultX Wallet Balance</strong>
                    <span class="offer-status-badge ${hasEnoughWallet ? 'accepted' : 'countered'}">${hasEnoughWallet ? this.tr('พร้อมชำระทันที', 'READY') : this.tr('ยอดไม่พอ', 'LOW BALANCE')}</span>
                  </div>
                  <div class="tabular" style="font-size:16px;font-weight:700;color:var(--status-green-text);margin-top:4px;">
                    ${this.tr('คงเหลือ', 'Available')} ${this.formatTHB(balance)}
                  </div>
                  <div style="font-size:11.5px;color:var(--text-muted);">${this.tr('หักจากกระเป๋าเงินในระบบทันที ไม่มีค่าธรรมเนียมโอน', 'Instant deduction from your VaultX balance, zero transfer fee')}</div>
                </div>

                <div class="escrow-room-item ${this.checkoutPayMethod === 'promptpay_qr' ? 'active' : ''}" style="padding:14px;" onclick="app.setCheckoutPayMethod('promptpay_qr')">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <strong style="font-size:13.5px;color:var(--text-primary);">Thai QR PromptPay</strong>
                    <span class="offer-status-badge accepted">INSTANT</span>
                  </div>
                  <div class="tabular" style="font-size:16px;font-weight:700;color:var(--text-primary);margin-top:4px;">
                    ${this.tr('สแกนจ่าย', 'Scan QR')} ${this.formatTHB(item.asking_price)}
                  </div>
                  <div style="font-size:11.5px;color:var(--text-muted);">${this.tr('รองรับทุกธนาคารไทย เติมและล็อกเข้าสัญญาอัตโนมัติ', 'Supports all Thai banking apps with instant Escrow lock')}</div>
                </div>
              </div>

              ${!hasEnoughWallet && this.checkoutPayMethod === 'wallet' ? `
                <div style="padding:12px;background:rgba(245,158,11,0.12);border-radius:8px;display:flex;justify-content:space-between;align-items:center;gap:12px;">
                  <span style="font-size:12.5px;color:#fbbf24;">${this.tr(`ยอดเงินในกระเป๋าไม่เพียงพอ ขาดอีก ${this.formatTHB(item.asking_price - balance)}`, `Insufficient wallet balance, short by ${this.formatTHB(item.asking_price - balance)}`)}</span>
                  <button class="btn-secondary" style="font-size:12px;padding:6px 12px;" onclick="app.navigate('wallet')">${this.tr('ไปหน้าเติมเงิน Wallet', 'Top-up Wallet')}</button>
                </div>
              ` : ''}
            </div>

            <!-- ESCROW GUARANTEE SUMMARY -->
            <div class="vault-card" style="padding:18px;gap:10px;">
              <div class="section-heading"><span>${this.tr('3. เงื่อนไขการคุ้มครองผู้ซื้อ (Escrow SLA)', '3. Buyer Protection SLA')}</span></div>
              <div style="font-size:12.5px;color:var(--text-secondary);display:flex;flex-direction:column;gap:6px;line-height:1.55;">
                <div>${this.tr('1. ผู้ขายต้องส่งมอบรหัสผ่านเข้าตู้เซฟ AES-256-GCM ภายในเวลาที่กำหนด', '1. Seller must submit encrypted credentials into the AES-256-GCM Vault.')}</div>
                <div>${this.tr('2. แอดมินคนกลาง (Inspector) จะล็อกอินตรวจสกินจริงและเปลี่ยนอีเมลหลักให้เป็นของคุณ', '2. Certified Inspector verifies in-game skins and rebinds the primary email to you.')}</div>
                <div>${this.tr('3. หากสเปกไม่ตรงตามประกาศ หรือผู้ขายไม่สามารถปลดล็อกอีเมลเดิมได้ ระบบคืนเงินเต็มจำนวน 100% ทันที', '3. If specs do not match or OGE cannot be unbound, 100% of your funds are refunded immediately.')}</div>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: FINANCIAL BREAKDOWN & CONFIRM BUTTON -->
          <div class="vault-card" style="padding:20px;gap:14px;">
            <div class="section-heading"><span>${this.tr('สรุปยอดชำระเข้าสัญญา Escrow', 'Escrow Settlement Summary')}</span></div>

            <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;">
              <div style="display:flex;justify-content:space-between;">
                <span style="color:var(--text-secondary);">${this.tr('ราคาสินค้าตั้งขาย', 'Listing Price')}</span>
                <span class="tabular" style="font-weight:600;">${this.formatTHB(item.asking_price)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:var(--text-secondary);">${this.tr('ค่าธรรมเนียมผู้ซื้อ (Buyer Fee)', 'Buyer Fee')}</span>
                <span class="tabular" style="color:var(--status-green-text);font-weight:600;">฿0 (${this.tr(`ผู้ขายรับผิดชอบ ${item.escrow_fee_percent || 7.5}%`, `Seller pays ${item.escrow_fee_percent || 7.5}%`)})</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:var(--text-secondary);">${this.tr('หักค่าบริการคนกลางจากฝั่งผู้ขาย', 'Escrow Fee Deducted from Seller')}</span>
                <span class="tabular" style="color:var(--text-muted);">${this.formatTHB(feeAmount)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:var(--text-secondary);">${this.tr('ยอดสุทธิที่ผู้ขายจะได้รับเมื่อจบงาน', 'Seller Net Payout on Completion')}</span>
                <span class="tabular" style="color:var(--text-muted);">${this.formatTHB(sellerNet)}</span>
              </div>
            </div>

            <div style="padding:14px;background:#111214;border-radius:8px;display:flex;justify-content:space-between;align-items:baseline;">
              <span style="font-size:13px;font-weight:600;color:var(--text-secondary);">${this.tr('ยอดชำระสุทธิที่ล็อกใน Vault', 'Total Locked in Vault')}</span>
              <span class="tabular" style="font-size:22px;font-weight:700;color:var(--status-green-text);">${this.formatTHB(item.asking_price)}</span>
            </div>

            <button class="btn-primary" style="width:100%;height:42px;font-size:14px;" onclick="app.confirmCheckoutEscrow()">
              ${this.tr('ยืนยันชำระเงินและเปิดห้อง Escrow 5 ขั้นตอน', 'Confirm Payment & Launch 5-Step Escrow Room')}
            </button>

            <button class="btn-secondary" style="width:100%;" onclick="app.openNegotiateView('${item.listing_id}')">
              ${this.tr('ต้องการต่อรองราคาก่อนซื้อ (Negotiate)', 'Negotiate Price Before Buying')}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // VIEW 8: WALLET, TOP-UP, WITHDRAW & DOUBLE-ENTRY LEDGER PAGE
  // ==========================================================================
  async fetchWalletHistory() {
    const uid = this.currentUser ? this.currentUser.user_id : 'user_buyer_01';
    const scope = this.walletScope || 'all';
    try {
      const res = await fetch(`/api/v1/auth/wallet-history?userId=${encodeURIComponent(uid)}&scope=${encodeURIComponent(scope)}`);
      const json = await res.json();
      if (json.success) {
        const list = Array.isArray(json.data) ? json.data : (json.data.history || json.data.items || []);
        this.walletHistory = list;
      }
    } catch (e) {
      console.error(e);
    }
  }

  async loadWalletView(tab) {
    if (tab) this.walletTab = tab;
    this.currentView = 'wallet';
    await this.fetchCurrentUser();
    await this.fetchWalletHistory();
    this.render();
  }

  async setWalletScope(scope) {
    this.walletScope = scope;
    await this.fetchWalletHistory();
    this.render();
  }

  async setWalletTab(tab) {
    this.walletTab = tab;
    if (tab === 'history') {
      await this.fetchWalletHistory();
    }
    this.render();
  }

  setTopupMethod(method) {
    this.topupMethod = method;
    this.render();
  }

  setTopupQuickAmount(amt) {
    this.topupAmount = amt;
    const el = document.getElementById('wallet-topup-input');
    if (el) el.value = amt;
  }

  async submitWalletTopup() {
    const el = document.getElementById('wallet-topup-input');
    const amount = Number(el ? el.value : this.topupAmount);
    if (!amount || amount <= 0) {
      this.toast(this.tr('กรุณาระบุจำนวนเงินที่ต้องการเติม', 'Please enter a valid top-up amount'));
      return;
    }
    const uid = this.currentUser ? this.currentUser.user_id : 'user_buyer_01';
    try {
      const res = await fetch('/api/v1/auth/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          method: this.topupMethod,
          amount
        })
      });
      const json = await res.json();
      if (json.success) {
        this.toast(json.message);
        await this.loadWalletView('history');
      } else {
        this.toast(json.error);
      }
    } catch (e) {
      this.toast(this.tr('ไม่สามารถเติมเงินได้', 'Top-up failed'));
    }
  }

  async submitWalletWithdraw() {
    const amtEl = document.getElementById('wallet-withdraw-amount');
    const bankEl = document.getElementById('wallet-withdraw-bank');
    const accEl = document.getElementById('wallet-withdraw-acc');
    const amount = Number(amtEl ? amtEl.value : 0);
    const bankName = bankEl ? bankEl.value : 'KBANK';
    const accountNumber = accEl ? accEl.value : '';

    if (!amount || amount < 100) {
      this.toast(this.tr('กรุณาระบุยอดถอนขั้นต่ำ ฿100', 'Minimum withdrawal is ฿100'));
      return;
    }
    if (!accountNumber.trim()) {
      this.toast(this.tr('กรุณากรอกเลขบัญชีธนาคารรับเงิน', 'Please enter your bank account number'));
      return;
    }

    const uid = this.currentUser ? this.currentUser.user_id : 'user_buyer_01';
    try {
      const res = await fetch('/api/v1/auth/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          amount,
          bankName,
          accountNumber
        })
      });
      const json = await res.json();
      if (json.success) {
        this.toast(json.message);
        await this.loadWalletView('history');
      } else {
        this.toast(json.error);
      }
    } catch (e) {
      this.toast(this.tr('ไม่สามารถถอนเงินได้', 'Withdrawal failed'));
    }
  }

  renderWalletView() {
    const balance = this.currentUser ? this.currentUser.wallet_balance : 0;
    const lockedTotal = this.escrows
      .filter(e => {
        const st = e.status || e.step_status || '';
        return st !== 'completed' && st !== 'released_completed';
      })
      .reduce((sum, e) => sum + Number(e.total_amount || 0), 0);

    return `
      <div class="detail-topbar">
        <div class="breadcrumb-left">
          <button class="btn-back" onclick="app.navigate('market')">${this.tr('กลับสู่ตลาดกลาง', 'Back to Marketplace')}</button>
          <span>/</span>
          <span class="platform-tag">VAULTX WALLET & LEDGER</span>
        </div>
        <span class="verify-tag admin_verified">DOUBLE-ENTRY AUDITED WALLET</span>
      </div>

      <div class="single-page-container">
        <!-- TOP WALLET OVERVIEW CARDS -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px;">
          <div class="vault-card" style="padding:18px;">
            <span style="font-size:12px;color:var(--text-muted);">${this.tr('ยอดเงินคงเหลือพร้อมใช้งาน (Available Balance)', 'Available Wallet Balance')}</span>
            <div class="tabular" style="font-size:26px;font-weight:700;color:var(--status-green-text);margin-top:4px;">${this.formatTHB(balance)}</div>
            <span style="font-size:11.5px;color:var(--text-secondary);">${this.tr('บัญชี:', 'Account:')} ${this.currentUser ? this.currentUser.display_name : 'Kittisak_TH'} (KYC Verified)</span>
          </div>
          <div class="vault-card" style="padding:18px;">
            <span style="font-size:12px;color:var(--text-muted);">${this.tr('ยอดเงินค้ำประกันในห้องคนกลาง (Locked in Escrow)', 'Funds Locked in Active Escrow')}</span>
            <div class="tabular" style="font-size:26px;font-weight:700;color:var(--text-primary);margin-top:4px;">${this.formatTHB(lockedTotal)}</div>
            <span style="font-size:11.5px;color:var(--text-secondary);">${this.escrows.filter(e => { const st = e.status || e.step_status || ''; return st !== 'completed' && st !== 'released_completed'; }).length} ${this.tr('สัญญาที่กำลังดำเนินการ', 'active contracts')}</span>
          </div>
          <div class="vault-card" style="padding:18px;">
            <span style="font-size:12px;color:var(--text-muted);">${this.tr('สถานะความคุ้มครองบัญชี (Vault Security)', 'Ledger Accounting Standard')}</span>
            <div style="font-size:18px;font-weight:700;color:#93c5fd;margin-top:6px;">Double-Entry Ledger</div>
            <span style="font-size:11.5px;color:var(--text-secondary);">${this.tr('บันทึกเดบิต/เครดิตแบบตรวจสอบย้อนกลับได้ 100%', '100% auditable debit/credit journal entries')}</span>
          </div>
        </div>

        <!-- WALLET TABS -->
        <div style="display:flex;gap:8px;margin-bottom:18px;">
          <button class="cat-tab ${this.walletTab === 'topup' ? 'active' : ''}" onclick="app.setWalletTab('topup')">${this.tr('เติมเงินเข้ากระเป๋า (Top-up)', 'Top-up Balance')}</button>
          <button class="cat-tab ${this.walletTab === 'withdraw' ? 'active' : ''}" onclick="app.setWalletTab('withdraw')">${this.tr('ถอนเงินเข้าธนาคาร (Withdraw)', 'Withdraw to Bank')}</button>
          <button class="cat-tab ${this.walletTab === 'history' ? 'active' : ''}" onclick="app.setWalletTab('history')">${this.tr('สมุดบัญชีและประวัติธุรกรรม', 'Double-Entry Ledger History')} (${this.walletHistory.length})</button>
        </div>

        ${this.walletTab === 'topup' ? `
          <div class="form-grid-2col">
            <div class="vault-card" style="padding:20px;gap:14px;">
              <div class="section-heading"><span>${this.tr('เติมเงินเข้ากระเป๋า VaultX ทันที', 'Instant VaultX Wallet Top-up')}</span></div>

              <div class="form-group">
                <label class="form-label">${this.tr('1. เลือกช่องทางการเติมเงิน', '1. Select Payment Channel')}</label>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
                  <div class="escrow-room-item ${this.topupMethod === 'promptpay' ? 'active' : ''}" onclick="app.setTopupMethod('promptpay')">
                    <strong style="font-size:13px;">Thai QR PromptPay</strong>
                    <span style="font-size:11px;color:var(--status-green-text);">${this.tr('ฟรีค่าธรรมเนียม · เข้าทันที', '0% Fee · Instant')}</span>
                  </div>
                  <div class="escrow-room-item ${this.topupMethod === 'bank' ? 'active' : ''}" onclick="app.setTopupMethod('bank')">
                    <strong style="font-size:13px;">${this.tr('โอนผ่านแอปธนาคาร', 'Bank Transfer')}</strong>
                    <span style="font-size:11px;color:var(--text-secondary);">KBANK / SCB / BBL</span>
                  </div>
                  <div class="escrow-room-item ${this.topupMethod === 'truemoney' ? 'active' : ''}" onclick="app.setTopupMethod('truemoney')">
                    <strong style="font-size:13px;">TrueMoney Wallet</strong>
                    <span style="font-size:11px;color:var(--text-secondary);">${this.tr('เข้าอัตโนมัติ 24 ชม.', '24/7 Auto Credit')}</span>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">${this.tr('2. เลือกยอดเงินด่วน หรือระบุจำนวนเงิน (THB)', '2. Quick Select or Enter Amount (THB)')}</label>
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
                  ${[1000, 3000, 5000, 10000, 20000].map(amt => `
                    <button class="btn-secondary tabular" style="padding:6px 12px;font-size:12px;" onclick="app.setTopupQuickAmount(${amt})">
                      +${this.formatTHB(amt)}
                    </button>
                  `).join('')}
                </div>
                <input id="wallet-topup-input" type="number" class="input-field tabular" value="${this.topupAmount}" placeholder="${this.tr('ระบุจำนวนเงิน (THB)', 'Enter amount (THB)')}" />
              </div>

              <button class="btn-primary" style="width:100%;height:40px;" onclick="app.submitWalletTopup()">
                ${this.tr('ยืนยันการเติมเงินเข้ากระเป๋า VaultX', 'Confirm Wallet Top-up')}
              </button>
            </div>

            <div class="vault-card" style="padding:20px;gap:12px;">
              <div class="section-heading"><span>${this.tr('ข้อมูลการตรวจสอบธุรกรรมอัตโนมัติ', 'Automated Ledger Verification')}</span></div>
              <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                ${this.tr('ทุกยอดการเติมเงินจะถูกบันทึกลงในสมุดบัญชีแยกประเภทคู่ (Double-Entry Ledger) ทันทีโดยไม่มีค่าธรรมเนียมการเติม และสามารถถอนคืนเข้าบัญชีธนาคารที่ตรงกับชื่อยืนยันตัวตน KYC ได้ตลอด 24 ชั่วโมง', 'Every top-up is recorded in our Double-Entry Ledger with zero deposit fees and can be withdrawn 24/7 to your KYC-verified bank account.')}
              </p>
            </div>
          </div>
        ` : ''}

        ${this.walletTab === 'withdraw' ? `
          <div class="form-grid-2col">
            <div class="vault-card" style="padding:20px;gap:14px;">
              <div class="section-heading"><span>${this.tr('ถอนเงินออกจากกระเป๋าเข้าบัญชีธนาคาร', 'Withdraw Balance to Bank Account')}</span></div>

              <div class="form-group">
                <label class="form-label">${this.tr('ธนาคารปลายทาง (ชื่อบัญชีต้องตรงกับ KYC: Kittisak_TH)', 'Destination Bank (Must match KYC name: Kittisak_TH)')}</label>
                <select id="wallet-withdraw-bank" class="input-field">
                  <option value="KBANK">${this.tr('ธนาคารกสิกรไทย (KBANK)', 'Kasikornbank (KBANK)')}</option>
                  <option value="SCB">${this.tr('ธนาคารไทยพาณิชย์ (SCB)', 'Siam Commercial Bank (SCB)')}</option>
                  <option value="BBL">${this.tr('ธนาคารกรุงเทพ (BBL)', 'Bangkok Bank (BBL)')}</option>
                  <option value="KTB">${this.tr('ธนาคารกรุงไทย (KTB)', 'Krungthai Bank (KTB)')}</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">${this.tr('เลขที่บัญชีธนาคาร', 'Bank Account Number')}</label>
                <input id="wallet-withdraw-acc" class="input-field tabular" value="089-2-44910-8" placeholder="xxx-x-xxxxx-x" />
              </div>

              <div class="form-group">
                <label class="form-label">${this.tr(`จำนวนเงินที่ต้องการถอน (สูงสุด ${this.formatTHB(balance)})`, `Withdrawal Amount (Max ${this.formatTHB(balance)})`)}</label>
                <input id="wallet-withdraw-amount" type="number" class="input-field tabular" value="2000" placeholder="${this.tr('ระบุจำนวนเงิน', 'Enter amount')}" />
              </div>

              <button class="btn-primary" style="width:100%;height:40px;" onclick="app.submitWalletWithdraw()">
                ${this.tr('ยืนยันคำสั่งถอนเงินเข้าบัญชีธนาคาร', 'Confirm Bank Withdrawal')}
              </button>
            </div>

            <div class="vault-card" style="padding:20px;gap:12px;">
              <div class="section-heading"><span>${this.tr('มาตรการป้องกันการฟอกเงิน (AML & KYC)', 'AML & KYC Payout Compliance')}</span></div>
              <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
                ${this.tr('ระบบอนุญาตให้ถอนเงินเข้าเฉพาะบัญชีธนาคารที่มีชื่อตรงกับข้อมูลยืนยันตัวตน KYC ของคุณเท่านั้น เพื่อป้องกันมิจฉาชีพนำบัญชีม้ามาใช้ในตลาดกลาง', 'Withdrawals are strictly restricted to bank accounts matching your verified KYC identity to prevent mule accounts.')}
              </p>
            </div>
          </div>
        ` : ''}

        ${this.walletTab === 'history' ? `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:10px;">
            <div class="section-heading" style="margin-bottom:0;">
              <span>${this.tr('สมุดบัญชีบันทึกเงินเข้า-ออกทั้งหมด (Double-Entry Ledger Audit Trail)', 'Complete Inflow & Outflow Double-Entry Ledger')}</span>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn-secondary" style="height:32px;padding:0 12px;font-size:12px;${this.walletScope === 'all' ? 'background:#2b5cf6;color:#fff;' : ''}" onclick="app.setWalletScope('all')">
                ${this.tr('ธุรกรรมทั้งหมดในระบบ (All System Flows)', 'All System Flows')}
              </button>
              <button class="btn-secondary" style="height:32px;padding:0 12px;font-size:12px;${this.walletScope === 'user' ? 'background:#2b5cf6;color:#fff;' : ''}" onclick="app.setWalletScope('user')">
                ${this.tr(`เฉพาะบัญชีปัจจุบัน (${this.currentUser ? this.currentUser.display_name : 'My Account'})`, `Current Role Only (${this.currentUser ? this.currentUser.display_name : 'My Account'})`)}
              </button>
            </div>
          </div>
          <div class="listings-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>${this.tr('รหัสบัญชี (Entry ID)', 'Entry ID')}</th>
                  <th>${this.tr('ประเภทธุรกรรม', 'Transaction Type')}</th>
                  <th>${this.tr('บัญชีเดบิต (Debit)', 'Debit Account')}</th>
                  <th>${this.tr('บัญชีเครดิต (Credit)', 'Credit Account')}</th>
                  <th style="text-align:right;">${this.tr('เงินเข้า / ออก (Amount)', 'Inflow / Outflow')}</th>
                  <th style="text-align:right;">${this.tr('คงเหลือหลังทำรายการ', 'Balance After')}</th>
                  <th>${this.tr('เวลาที่บันทึก', 'Timestamp')}</th>
                </tr>
              </thead>
              <tbody>
                ${this.walletHistory.length > 0 ? this.walletHistory.map(h => {
                  const isOut = h.is_outflow || Number(h.signed_amount ?? h.amount) < 0;
                  const absVal = Math.abs(Number(h.signed_amount ?? h.amount ?? 0));
                  const signStr = isOut ? '-' : '+';
                  const amtColor = isOut ? '#f87171' : 'var(--status-green-text)';
                  const badgeClass = isOut ? 'countered' : 'accepted';
                  return `
                  <tr>
                    <td class="tabular" style="font-weight:600;color:var(--text-primary);">${h.entry_id || h.ledger_id}</td>
                    <td>
                      <span class="offer-status-badge ${badgeClass}">${h.type || h.entry_type}</span>
                      ${h.description ? `<div style="font-size:11.5px;color:var(--text-muted);margin-top:3px;">${h.description}</div>` : ''}
                    </td>
                    <td class="tabular" style="color:var(--text-secondary);font-size:12px;">${h.debit_account}</td>
                    <td class="tabular" style="color:var(--text-secondary);font-size:12px;">${h.credit_account}</td>
                    <td class="tabular" style="text-align:right;font-weight:700;color:${amtColor};">${signStr}${this.formatTHB(absVal)}</td>
                    <td class="tabular" style="text-align:right;font-weight:600;color:var(--text-primary);">${h.balance_after !== undefined ? this.formatTHB(h.balance_after) : '-'}</td>
                    <td class="tabular" style="color:var(--text-muted);font-size:12px;">${new Date(h.created_at).toLocaleString('th-TH')}</td>
                  </tr>
                `;
                }).join('') : `
                  <tr>
                    <td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">${this.tr('ยังไม่มีรายการเคลื่อนไหวในตัวกรองนี้', 'No ledger entries found for this filter.')}</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        ` : ''}
      </div>
    `;
  }

  // ==========================================================================
  // VIEW 9: SELLER PROFILE, VERIFICATION & BUYER REVIEWS PAGE
  // ==========================================================================
  openSellerProfile(sellerName) {
    this.activeSellerName = sellerName || 'ViperStore';
    this.currentView = 'seller_profile';
    this.render();
    window.scrollTo(0, 0);
  }

  submitSellerReview() {
    const ratingEl = document.getElementById('seller-review-rating');
    const textEl = document.getElementById('seller-review-text');
    if (!textEl || !textEl.value.trim()) {
      this.toast(this.tr('กรุณาพิมพ์ข้อความรีวิวผู้ขาย', 'Please enter a review comment'));
      return;
    }
    this.sellerReviews.unshift({
      id: `rev_${Date.now()}`,
      seller: this.activeSellerName,
      buyer: this.currentUser ? this.currentUser.display_name : 'Kittisak_TH',
      rating: Number(ratingEl ? ratingEl.value : 5),
      game: 'VALORANT',
      comment: textEl.value.trim(),
      date: this.tr('วันนี้', 'Today')
    });
    textEl.value = '';
    this.toast(this.tr('บันทึกรีวิวผู้ขายเรียบร้อยแล้ว', 'Seller review submitted'));
    this.render();
  }

  renderSellerProfileView() {
    const sName = this.activeSellerName || 'ViperStore';
    const sellerListings = this.listings.filter(l => (l.seller_name || '').toLowerCase() === sName.toLowerCase());
    const sample = sellerListings[0] || {};
    const trust = sample.seller_trust || 99.4;
    const deals = sample.seller_deals || 180;
    const reviews = this.sellerReviews.filter(r => r.seller.toLowerCase() === sName.toLowerCase() || this.sellerReviews.indexOf(r) < 3);

    return `
      <div class="detail-topbar">
        <div class="breadcrumb-left">
          <button class="btn-back" onclick="app.navigate('market')">${this.tr('กลับสู่ตลาดกลาง', 'Back to Marketplace')}</button>
          <span>/</span>
          <span class="platform-tag">VERIFIED SELLER PROFILE</span>
          <span style="color:var(--text-primary);font-weight:600;">${sName}</span>
        </div>
        <span class="verify-tag admin_verified">KYC & NATIONAL ID VERIFIED</span>
      </div>

      <div class="single-page-container">
        <!-- SELLER HEADER SUMMARY -->
        <div class="vault-card" style="padding:22px;margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
            <div style="display:flex;align-items:center;gap:16px;">
              <div style="width:56px;height:56px;border-radius:14px;background:#2b5cf6;color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;">
                ${sName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <h1 style="font-size:22px;font-weight:700;">${sName}</h1>
                  <span class="offer-status-badge accepted">VERIFIED MERCHANT</span>
                </div>
                <div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">
                  ${this.tr('ยืนยันตัวตนด้วยบัตรประชาชนและบัญชีธนาคารตรงชื่อ · ประวัติขาวสะอาด 0 ข้อพิพาทดึงไอดีคืน', 'National ID & KYC Bank Verified · 0 Pullback Disputes')}
                </div>
              </div>
            </div>

            <div style="display:flex;gap:24px;">
              <div>
                <div style="font-size:11px;color:var(--text-muted);">${this.tr('คะแนนความน่าเชื่อถือ', 'Trust Score')}</div>
                <div class="tabular" style="font-size:22px;font-weight:700;color:var(--status-green-text);">${trust}%</div>
              </div>
              <div>
                <div style="font-size:11px;color:var(--text-muted);">${this.tr('ส่งมอบสำเร็จผ่าน Escrow', 'Completed Escrow Deals')}</div>
                <div class="tabular" style="font-size:22px;font-weight:700;color:var(--text-primary);">${deals} ${this.tr('ดีล', 'deals')}</div>
              </div>
              <div>
                <div style="font-size:11px;color:var(--text-muted);">${this.tr('กำลังวางขาย', 'Active Listings')}</div>
                <div class="tabular" style="font-size:22px;font-weight:700;color:#93c5fd;">${sellerListings.length} ${this.tr('รายการ', 'items')}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ACTIVE LISTINGS BY THIS SELLER -->
        <div style="margin-bottom:24px;">
          <div class="section-heading"><span>${this.tr(`รายการที่กำลังวางขายโดย ${sName} (${sellerListings.length} รายการ)`, `Active Listings by ${sName} (${sellerListings.length})`)}</span></div>
          <div class="pc-grid">
            ${sellerListings.map(item => {
              const img = this.productImage(item);
              const isGenshinArt = img && img.includes('genshin_');
              const isCover = img && img.endsWith('.jpg') && !isGenshinArt;
              const rank = item.rank_badge || item.game_type;
              return `
                <article class="pc" onclick="app.openListingDetail('${item.listing_id}')">
                  <div class="pc-media" style="${isCover ? 'padding:0;' : isGenshinArt ? 'padding:6px 10px;' : ''}">
                    ${img ? `<img src="${img}" class="${isCover ? 'cover-img' : ''}" alt="${item.title}" loading="lazy" />` : `<span class="pc-noimg">${item.game_type}</span>`}
                    <span class="pc-rank">${rank}</span>
                  </div>
                  <div class="pc-body">
                    <div class="pc-sub">${item.game_type} / ${item.region_tag || 'APAC'}</div>
                    <h3 class="pc-title">${item.title}</h3>
                    <div class="pc-price-row">
                      <span class="pc-price">${this.formatTHB(item.asking_price)}</span>
                      <span class="pc-note">${this.tr('คุ้มครองโดย Escrow', 'Escrow protected')}</span>
                    </div>
                    <div class="pc-actions">
                      <button class="pc-btn ghost" onclick="event.stopPropagation();app.openNegotiateView('${item.listing_id}')"><span>${this.tr('ต่อรองราคา', 'Negotiate')}</span></button>
                      <button class="pc-btn solid" onclick="event.stopPropagation();app.openCheckoutView('${item.listing_id}')"><span>${this.tr('ซื้อผ่าน Escrow', 'Buy via Escrow')}</span></button>
                    </div>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        </div>

        <!-- BUYER REVIEWS & ADD REVIEW -->
        <div class="form-grid-2col">
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div class="section-heading"><span>${this.tr(`รีวิวจากผู้ซื้อที่ทำธุรกรรมจริง (${reviews.length})`, `Verified Buyer Reviews (${reviews.length})`)}</span></div>
            ${reviews.map(r => `
              <div class="vault-card" style="padding:14px;gap:6px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <div style="display:flex;gap:8px;align-items:center;">
                    <strong style="font-size:13px;">${r.buyer}</strong>
                    <span class="platform-tag">${r.game}</span>
                    <span class="offer-status-badge accepted">Rating ${r.rating}.0 / 5.0</span>
                  </div>
                  <span style="font-size:11.5px;color:var(--text-muted);">${r.date}</span>
                </div>
                <div style="font-size:13px;color:var(--text-secondary);line-height:1.5;">${r.comment}</div>
              </div>
            `).join('')}
          </div>

          <div class="vault-card" style="padding:18px;gap:12px;">
            <div class="section-heading"><span>${this.tr(`เขียนรีวิวให้ผู้ขาย ${sName}`, `Write a Review for ${sName}`)}</span></div>
            <div class="form-group">
              <label class="form-label">${this.tr('คะแนนความพึงพอใจ', 'Rating')}</label>
              <select id="seller-review-rating" class="input-field">
                <option value="5">${this.tr('5.0 คะแนน — ส่งมอบไว สเปกตรงปก 100%', '5.0 — Fast delivery, 100% accurate specs')}</option>
                <option value="4">${this.tr('4.0 คะแนน — ดีมาก แนะนำ', '4.0 — Very good seller')}</option>
                <option value="3">${this.tr('3.0 คะแนน — ปานกลาง', '3.0 — Average')}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">${this.tr('ความคิดเห็นจากการซื้อขายผ่าน Escrow', 'Your Escrow Trade Experience')}</label>
              <textarea id="seller-review-text" class="textarea-field" placeholder="${this.tr('แชร์ประสบการณ์การตรวจรับไอดีกับผู้ขายรายนี้...', 'Share your experience trading with this seller...')}"></textarea>
            </div>
            <button class="btn-primary" style="width:100%;" onclick="app.submitSellerReview()">${this.tr('บันทึกรีวิวผู้ขาย', 'Submit Review')}</button>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // VIEW 10: SAVED WISHLIST & SIDE-BY-SIDE SPEC COMPARISON PAGE
  // ==========================================================================
  renderWishlistView() {
    const sourceList = (this.allCatalogListings && this.allCatalogListings.length > 0) ? this.allCatalogListings : this.listings;
    const savedItems = sourceList.filter(item => this.savedIds.has(item.listing_id));

    return `
      <div class="detail-topbar">
        <div class="breadcrumb-left">
          <button class="btn-back" onclick="app.navigate('market')">${this.tr('กลับสู่ตลาดกลาง', 'Back to Marketplace')}</button>
          <span>/</span>
          <span class="platform-tag">SAVED WISHLIST & COMPARE</span>
        </div>
        <span class="tabular" style="font-size:12px;color:var(--text-secondary);">${this.tr(`บันทึกไว้ ${savedItems.length} รายการ`, `${savedItems.length} saved items`)}</span>
      </div>

      <div class="single-page-container">
        <div style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px;">
          <div>
            <h1 style="font-size:20px;font-weight:700;">${this.tr('รายการที่บันทึกไว้ & ตารางเปรียบเทียบสเปก (Wishlist & Spec Comparison)', 'Saved Wishlist & Side-by-Side Spec Comparison')}</h1>
            <p style="font-size:13px;color:var(--text-secondary);">
              ${this.tr('เปรียบเทียบราคา แรงค์ จำนวนสกิน และระยะเวลารับประกันของไอดีที่คุณกดหัวใจบันทึกไว้แบบหมัดต่อหมัด', 'Compare asking prices, ranks, cleanliness tags, and warranty terms across your saved accounts.')}
            </p>
          </div>
          <button class="btn-secondary" onclick="app.navigate('market')">${this.tr('เลือกดูไอดีเพิ่มในตลาดกลาง', 'Browse More Accounts')}</button>
        </div>

        ${savedItems.length === 0 ? `
          <div class="vault-card" style="padding:48px 24px;text-align:center;align-items:center;">
            <h3 style="font-size:16px;font-weight:700;">${this.tr('ยังไม่มีรายการใน Wishlist', 'Your Wishlist is Empty')}</h3>
            <p style="font-size:13px;color:var(--text-secondary);">${this.tr('กดปุ่มรูปหัวใจมุมขวาบนของการ์ดสินค้าในหน้าตลาดกลางเพื่อบันทึกเปรียบเทียบสเปก', 'Click the heart icon on any marketplace card to save and compare accounts.')}</p>
            <button class="btn-primary" style="margin-top:8px;" onclick="app.navigate('market')">${this.tr('ไปหน้าตลาดกลาง', 'Go to Marketplace')}</button>
          </div>
        ` : `
          <div class="listings-table-wrap" style="margin-bottom:24px;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>${this.tr('รายการสินค้า', 'Listing Title')}</th>
                  <th>${this.tr('เกม / โซน', 'Game')}</th>
                  <th>${this.tr('แรงค์ / ระดับ', 'Rank / Tier')}</th>
                  <th>${this.tr('ความสะอาดบัญชี', 'Account Cleanliness')}</th>
                  <th>${this.tr('ผู้ขาย (Trust)', 'Seller (Trust)')}</th>
                  <th>${this.tr('ประกันดึงคืน', 'Warranty')}</th>
                  <th style="text-align:right;">${this.tr('ราคาตั้งขาย', 'Asking Price')}</th>
                  <th style="text-align:right;">${this.tr('การจัดการ', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                ${savedItems.map(item => `
                  <tr>
                    <td style="font-weight:600;cursor:pointer;" onclick="app.openListingDetail('${item.listing_id}')">${item.title}</td>
                    <td><span class="platform-tag">${item.game_type}</span></td>
                    <td>${item.rank_badge || '-'}</td>
                    <td style="font-size:12px;color:var(--text-secondary);">${(item.cleanliness_tags || []).join(' · ')}</td>
                    <td class="tabular" style="color:var(--status-green-text);cursor:pointer;text-decoration:underline;" onclick="app.openSellerProfile('${(item.seller_name || '').replace(/'/g, "\\'")}')">${item.seller_name} (${item.seller_trust}%)</td>
                    <td class="tabular">${item.warranty_days || 14} ${this.tr('วัน', 'days')}</td>
                    <td class="tabular" style="text-align:right;font-weight:700;">${this.formatTHB(item.asking_price)}</td>
                    <td style="text-align:right;">
                      <div style="display:flex;gap:6px;justify-content:flex-end;">
                        <button class="btn-primary" style="padding:5px 10px;font-size:11.5px;" onclick="app.openCheckoutView('${item.listing_id}')">Buy Escrow</button>
                        <button class="btn-secondary" style="padding:5px 10px;font-size:11.5px;" onclick="app.toggleFavorite('${item.listing_id}')">${this.tr('ลบ', 'Remove')}</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }

  // ==========================================================================
  // VIEW 11: HELP CENTER, ESCROW GUIDE & 24/7 LIVE SUPPORT TICKET CENTER
  // ==========================================================================
  openSupportView(tab) {
    this.supportTab = tab || 'how_escrow';
    this.currentView = 'support';
    this.render();
    window.scrollTo(0, 0);
  }

  submitSupportTicket() {
    const subjEl = document.getElementById('sup-ticket-subject');
    const refEl = document.getElementById('sup-ticket-ref');
    const descEl = document.getElementById('sup-ticket-desc');
    if (!subjEl || !subjEl.value.trim()) {
      this.toast(this.tr('กรุณาระบุหัวข้อเรื่องที่ต้องการติดต่อฝ่ายสนับสนุน', 'Please enter a ticket subject'));
      return;
    }
    this.supportTickets.unshift({
      ticket_id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: `${subjEl.value.trim()}${refEl && refEl.value ? ` (Ref: ${refEl.value})` : ''}`,
      status: this.tr('RECEIVED · กำลังตรวจสอบโดย Inspector', 'RECEIVED · Assigned to Inspector'),
      updated_at: this.tr('เมื่อสักครู่', 'Just now')
    });
    subjEl.value = '';
    if (descEl) descEl.value = '';
    this.toast(this.tr('ส่งคำร้องไปยังทีม Live Support 24/7 เรียบร้อยแล้ว', 'Support ticket submitted to 24/7 Live Support'));
    this.render();
  }

  renderSupportView() {
    const tabs = [
      ['how_escrow', this.tr('ขั้นตอนระบบคนกลาง 5 ขั้นตอน', '5-Step Escrow Protocol')],
      ['pay_securely', this.tr('การพักเงินและชำระเงินปลอดภัย', 'Pay Securely')],
      ['verify_account', this.tr('การตรวจสเปกและเปลี่ยนเมลผูก', 'Verify Your Account')],
      ['release_seller', this.tr('การปล่อยเงินและประกันดึงคืน', 'Release to Seller')],
      ['live_support', this.tr('ติดต่อแอดมิน Live Support 24/7', '24/7 Live Support Desk')],
      ['terms', this.tr('ข้อตกลงการใช้งาน (Terms & Privacy)', 'Terms & Privacy Policy')]
    ];

    return `
      <div class="detail-topbar">
        <div class="breadcrumb-left">
          <button class="btn-back" onclick="app.navigate('market')">${this.tr('กลับสู่ตลาดกลาง', 'Back to Marketplace')}</button>
          <span>/</span>
          <span class="platform-tag">HELP CENTER & 24/7 ESCROW SUPPORT</span>
        </div>
        <span class="verify-tag admin_verified">SLA RESPONSE TIME &lt; 3 MINS</span>
      </div>

      <div class="single-page-container">
        <div style="margin-bottom:18px;">
          <h1 style="font-size:22px;font-weight:700;">${this.tr('ศูนย์ช่วยเหลือและมาตรฐานความปลอดภัย VaultX Escrow', 'VaultX Escrow Help Center & Security Protocol')}</h1>
          <p style="font-size:13px;color:var(--text-secondary);">
            ${this.tr('คู่มือการซื้อขายไอดีเกมผ่านคนกลาง มาตรฐานการเข้ารหัส AES-256-GCM และระบบแจ้งเรื่องด่วนตลอด 24 ชั่วโมง', 'Complete guide to 5-step Escrow trading, AES-256-GCM credential protection, and 24/7 Inspector assistance.')}
          </p>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">
          ${tabs.map(([id, label]) => `
            <button class="cat-tab ${this.supportTab === id ? 'active' : ''}" onclick="app.openSupportView('${id}')">${label}</button>
          `).join('')}
        </div>

        ${this.supportTab === 'live_support' ? `
          <div class="form-grid-2col">
            <div class="vault-card" style="padding:20px;gap:14px;">
              <div class="section-heading"><span>${this.tr('เปิดตั๋วแจ้งเรื่องด่วนถึง Inspector (24/7 Live Support)', 'Submit Priority Ticket to Inspector (24/7 Live Support)')}</span></div>
              <div class="form-group">
                <label class="form-label">${this.tr('หัวข้อปัญหาหรือสิ่งที่ต้องการให้ช่วยเหลือ', 'Subject / Inquiry Topic')}</label>
                <input id="sup-ticket-subject" class="input-field" placeholder="${this.tr('เช่น ขอให้แอดมินช่วยเร่งตรวจห้อง Escrow หรือแจ้งเบาะแสมิจฉาชีพ', 'e.g. Request urgent Escrow room inspection or report suspicious seller')}" />
              </div>
              <div class="form-group">
                <label class="form-label">${this.tr('รหัสสัญญา Escrow หรือรหัสสินค้าอ้างอิง (ถ้ามี)', 'Escrow Contract ID or Listing Ref (Optional)')}</label>
                <input id="sup-ticket-ref" class="input-field tabular" placeholder="esc_demo_val_001 / list_val_figma_001" />
              </div>
              <div class="form-group">
                <label class="form-label">${this.tr('รายละเอียดเพิ่มเติม', 'Details')}</label>
                <textarea id="sup-ticket-desc" class="textarea-field" placeholder="${this.tr('อธิบายรายละเอียดเพื่อให้เจ้าหน้าที่ตรวจสอบได้ทันที...', 'Provide details so our Inspector team can assist immediately...')}"></textarea>
              </div>
              <button class="btn-primary" style="width:100%;" onclick="app.submitSupportTicket()">${this.tr('ส่งเรื่องถึงทีมงาน Live Support ทันที', 'Submit Ticket to Live Support')}</button>
            </div>

            <div class="vault-card" style="padding:20px;gap:12px;">
              <div class="section-heading"><span>${this.tr(`รายการคำร้องของคุณ (${this.supportTickets.length})`, `Your Support Tickets (${this.supportTickets.length})`)}</span></div>
              ${this.supportTickets.map(t => `
                <div class="escrow-room-item" style="cursor:default;">
                  <div style="display:flex;justify-content:space-between;">
                    <span class="tabular" style="font-weight:700;font-size:12px;">${t.ticket_id}</span>
                    <span class="offer-status-badge accepted">${t.status}</span>
                  </div>
                  <div style="font-size:13px;color:var(--text-primary);margin-top:4px;">${t.subject}</div>
                  <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${this.tr('อัปเดตล่าสุด:', 'Updated:')} ${t.updated_at}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="vault-card" style="padding:24px;gap:16px;">
            <div class="section-heading">
              <span>${tabs.find(t => t[0] === this.supportTab)?.[1] || this.tr('มาตรฐานความปลอดภัย', 'Security Standard')}</span>
              <span class="tabular" style="font-size:11px;color:var(--status-green-text);">VAULTX PROTOCOL V2.4</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;">
              <div style="padding:16px;background:#111214;border-radius:10px;">
                <strong style="font-size:14px;color:var(--text-primary);display:block;margin-bottom:6px;">${this.tr('1. Pay Securely (พักเงิน 100%)', '1. Pay Securely (100% Escrow Lock)')}</strong>
                <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.6;">
                  ${this.tr('ผู้ซื้อชำระเงินเข้าสู่บัญชีพักเงินของแพลตฟอร์ม ระบบจะล็อกยอดเงินไว้ในสมุดบัญชีแยกประเภทคู่ (Double-Entry Ledger) ผู้ขายจะเห็นสถานะว่ามีเงินค้ำประกันจริงแต่ยังไม่สามารถถอนออกได้', 'Buyer funds are locked in our Double-Entry Escrow Vault. The seller sees verified locked funds before handing over credentials.')}
                </p>
              </div>
              <div style="padding:16px;background:#111214;border-radius:10px;">
                <strong style="font-size:14px;color:var(--text-primary);display:block;margin-bottom:6px;">${this.tr('2. Verify Your Account (ตรวจสเปกจริง)', '2. Verify Your Account (Inspector Audit)')}</strong>
                <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.6;">
                  ${this.tr('รหัสผ่านที่ผู้ขายส่งจะถูกเข้ารหัสด้วย AES-256-GCM ทันที แอดมินคนกลางจะถอดรหัสเพื่อเข้าตรวจสอบจำนวนสกิน แรงค์ และช่วยสับเปลี่ยนอีเมลหลักรวมถึงปลดล็อก 2FA เดิมออกทั้งหมด', 'Submitted credentials are encrypted with AES-256-GCM. Our Inspector logs in to verify skins/ranks and rebinds the primary email & 2FA to the buyer.')}
                </p>
              </div>
              <div style="padding:16px;background:#111214;border-radius:10px;">
                <strong style="font-size:14px;color:var(--text-primary);display:block;margin-bottom:6px;">${this.tr('3. Release to Seller (โอนเมื่อตรวจผ่าน)', '3. Release to Seller (Verified Payout)')}</strong>
                <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.6;">
                  ${this.tr('เมื่อผู้ซื้อล็อกอินเข้าเกมและกดยืนยันรับมอบไอดี ระบบจึงจะปล่อยเงินสุทธิเข้ากระเป๋าผู้ขาย พร้อมออกใบรับประกันการดึงไอดีคืนตามระยะเวลาที่ระบุในประกาศ', 'Once the buyer logs in and confirms receipt, net funds are released to the seller wallet along with your buyback warranty certificate.')}
                </p>
              </div>
            </div>
            <div style="display:flex;gap:10px;margin-top:6px;">
              <button class="btn-primary" onclick="app.navigate('market')">${this.tr('กลับไปเลือกซื้อไอดีในตลาดกลาง', 'Back to Marketplace')}</button>
              <button class="btn-secondary" onclick="app.openSupportView('live_support')">${this.tr('ติดต่อเจ้าหน้าที่ Live Support 24/7', 'Contact 24/7 Live Support')}</button>
            </div>
          </div>
        `}
      </div>
    `;
  }
}

const app = new VaultApp();
window.app = app;
window.addEventListener('DOMContentLoaded', () => app.init());
