-- ====================================================================
-- ESCROW GAME ACCOUNT & SKIN TRADING VAULT
-- Relational Database Schema (SQL - PostgreSQL / MySQL Compatible)
-- Designed for ACID Transactions, Auditing, and Zero Financial Race Conditions
-- ====================================================================

-- 1. Users Table (Platform Accounts, Roles & Trust Score)
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    display_name VARCHAR(100) NOT NULL,
    oauth_provider VARCHAR(50) DEFAULT 'google',
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'inspector', 'admin', 'owner')),
    wallet_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (wallet_balance >= 0.00),
    escrow_locked_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (escrow_locked_balance >= 0.00),
    trust_score INT NOT NULL DEFAULT 100 CHECK (trust_score BETWEEN 0 AND 100),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. Game Listings Table (Marketplace Catalog & Asking Prices)
CREATE TABLE IF NOT EXISTS game_listings (
    listing_id VARCHAR(36) PRIMARY KEY,
    seller_id VARCHAR(36) NOT NULL,
    game_type VARCHAR(50) NOT NULL CHECK (game_type IN ('VALORANT', 'ROV', 'GENSHIN', 'STEAM', 'FREEFIRE')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    asking_price DECIMAL(10, 2) NOT NULL CHECK (asking_price > 0),
    escrow_fee_percent DECIMAL(4, 2) NOT NULL DEFAULT 7.50, -- 5.00% to 10.00%
    is_featured_boost BOOLEAN NOT NULL DEFAULT FALSE,
    verification_tier VARCHAR(20) DEFAULT 'standard' CHECK (verification_tier IN ('standard', 'admin_verified', 'guaranteed')),
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_escrow', 'sold', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_listings_game_status ON game_listings(game_type, status);
CREATE INDEX idx_listings_seller ON game_listings(seller_id);
CREATE INDEX idx_listings_boost ON game_listings(is_featured_boost, created_at DESC);

-- 3. Escrow Transactions Table (Live 5-Step Escrow Contract)
CREATE TABLE IF NOT EXISTS escrow_transactions (
    escrow_id VARCHAR(36) PRIMARY KEY,
    listing_id VARCHAR(36) NOT NULL UNIQUE,
    buyer_id VARCHAR(36) NOT NULL,
    seller_id VARCHAR(36) NOT NULL,
    inspector_id VARCHAR(36), -- Assigned System Admin / Inspector
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount > 0),
    commission_fee DECIMAL(10, 2) NOT NULL,
    seller_net_income DECIMAL(10, 2) NOT NULL,
    current_step INT NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 5),
    -- Step 1: Deposit & Lock Funds
    -- Step 2: Seller Submits Credentials to Vault
    -- Step 3: Inspector Verifies & Rebinds Email/2FA
    -- Step 4: Buyer Inspects Game Account
    -- Step 5: Funds Released to Seller
    step_status VARCHAR(30) NOT NULL DEFAULT 'funds_locked' CHECK (step_status IN (
        'funds_locked',          -- Step 1 Done
        'credentials_pending',   -- Step 2 In Progress
        'credentials_submitted', -- Step 2 Done
        'inspecting_rebind',     -- Step 3 In Progress
        'rebind_complete',       -- Step 3 Done
        'buyer_testing',         -- Step 4 In Progress
        'buyer_confirmed',       -- Step 4 Done
        'released_completed',    -- Step 5 Done
        'disputed',              -- Paused due to dispute
        'refunded_cancelled'     -- Cancelled & funds returned
    )),
    dispute_reason TEXT,
    auto_release_timeout TIMESTAMP, -- Auto-releases after 24 hours if buyer is unresponsive in Step 4
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES game_listings(listing_id),
    FOREIGN KEY (buyer_id) REFERENCES users(user_id),
    FOREIGN KEY (seller_id) REFERENCES users(user_id),
    FOREIGN KEY (inspector_id) REFERENCES users(user_id)
);

CREATE INDEX idx_escrow_buyer ON escrow_transactions(buyer_id);
CREATE INDEX idx_escrow_seller ON escrow_transactions(seller_id);
CREATE INDEX idx_escrow_status ON escrow_transactions(current_step, step_status);

-- 4. Wallet Ledgers Table (Double-Entry Financial Audit Trail)
CREATE TABLE IF NOT EXISTS wallet_ledgers (
    ledger_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    escrow_id VARCHAR(36),
    entry_type VARCHAR(30) NOT NULL CHECK (entry_type IN (
        'topup',               -- Money deposited via QR/Banking
        'escrow_lock',         -- Money moved from available to locked
        'escrow_release',      -- Seller receives net income
        'escrow_refund',       -- Money returned to buyer upon dispute
        'commission_revenue',  -- Platform takes 5-10% fee
        'boost_purchase',      -- Paid for featured listing
        'withdrawal'           -- Payout to real bank account
    )),
    amount DECIMAL(10, 2) NOT NULL,
    balance_before DECIMAL(12, 2) NOT NULL,
    balance_after DECIMAL(12, 2) NOT NULL,
    reference_slip_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (escrow_id) REFERENCES escrow_transactions(escrow_id)
);

CREATE INDEX idx_ledgers_user ON wallet_ledgers(user_id, created_at DESC);
CREATE INDEX idx_ledgers_escrow ON wallet_ledgers(escrow_id);

-- 5. Fraud Blacklist Table (Scammer Registry & Investigation Log)
CREATE TABLE IF NOT EXISTS fraud_blacklist (
    blacklist_id VARCHAR(36) PRIMARY KEY,
    scammer_name VARCHAR(150) NOT NULL,
    bank_account_number VARCHAR(100) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    game_uid VARCHAR(100),
    scam_method TEXT NOT NULL,
    evidence_url VARCHAR(500),
    reported_by VARCHAR(36) NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('under_review', 'confirmed', 'false_report')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reported_by) REFERENCES users(user_id)
);

CREATE INDEX idx_blacklist_bank ON fraud_blacklist(bank_account_number);
CREATE INDEX idx_blacklist_uid ON fraud_blacklist(game_uid);

-- ====================================================================
-- REAL-WORLD EXTENSION MODULES (KYC, Bank Payouts & Dispute System)
-- ====================================================================

-- 6. KYC Verifications Table (Real ID Card & Anti-Money Laundering)
CREATE TABLE IF NOT EXISTS kyc_verifications (
    kyc_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    full_name_th VARCHAR(150) NOT NULL,
    id_card_number VARCHAR(13) NOT NULL,
    id_card_image_url VARCHAR(500) NOT NULL,
    selfie_image_url VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    reviewed_by VARCHAR(36),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);

CREATE INDEX idx_kyc_status ON kyc_verifications(status);

-- 7. User Bank Accounts Table (For Payouts & PromptPay)
CREATE TABLE IF NOT EXISTS user_bank_accounts (
    account_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    bank_name VARCHAR(100) NOT NULL CHECK (bank_name IN ('KBANK', 'SCB', 'BBL', 'KTB', 'PROMPTPAY')),
    account_number VARCHAR(50) NOT NULL,
    account_holder_name VARCHAR(150) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_bank_accounts ON user_bank_accounts(user_id);

-- 8. Withdrawal Requests Table (Bank Transfer Cashout)
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    withdrawal_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    bank_account_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 100.00), -- Minimum 100 THB withdrawal
    fee DECIMAL(6, 2) NOT NULL DEFAULT 15.00, -- 15 THB transfer fee
    net_payout DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved_paid', 'rejected')),
    transfer_slip_url VARCHAR(500),
    processed_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (bank_account_id) REFERENCES user_bank_accounts(account_id),
    FOREIGN KEY (processed_by) REFERENCES users(user_id)
);

CREATE INDEX idx_withdrawals_status ON withdrawal_requests(status, created_at DESC);

-- 9. Escrow Disputes Table (Formal Investigation & Arbitration)
CREATE TABLE IF NOT EXISTS escrow_disputes (
    dispute_id VARCHAR(36) PRIMARY KEY,
    escrow_id VARCHAR(36) NOT NULL UNIQUE,
    claimant_id VARCHAR(36) NOT NULL,
    respondent_id VARCHAR(36) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'ACCOUNT_RECALLED',      -- Seller pulled back account
        'INCORRECT_SKINS',      -- Skins do not match listing
        'LOGIN_FAILED',         -- Password changed / 2FA locked
        'OTHER'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT, -- JSON array of screenshot URLs
    status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN (
        'open',
        'under_arbitration',
        'resolved_buyer_refund',
        'resolved_seller_payout',
        'split_settlement'
    )),
    arbitration_notes TEXT,
    arbitrated_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (escrow_id) REFERENCES escrow_transactions(escrow_id),
    FOREIGN KEY (claimant_id) REFERENCES users(user_id),
    FOREIGN KEY (respondent_id) REFERENCES users(user_id),
    FOREIGN KEY (arbitrated_by) REFERENCES users(user_id)
);

CREATE INDEX idx_disputes_status ON escrow_disputes(status);
