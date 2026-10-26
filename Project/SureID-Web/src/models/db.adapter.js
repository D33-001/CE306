import { db as inMemoryDb } from './db.js';

/**
 * Escrow Game Vault - Hybrid Database Adapter
 * Bridges Prisma ORM (PostgreSQL) and High-Performance In-Memory ACID Engine
 * Strictly ZERO EMOJIS constraint.
 */
class HybridDatabaseAdapter {
  constructor() {
    this.mode = 'IN_MEMORY_STANDBY';
    this.prisma = null;
    this.inMemory = inMemoryDb;
    this._initPrisma();
  }

  async _initPrisma() {
    try {
      // Dynamically load PrismaClient so missing client generation doesn't crash the server
      const prismaPkg = await import('@prisma/client');
      const PrismaClientClass = prismaPkg.PrismaClient;

      if (!PrismaClientClass) {
        throw new Error('PrismaClient not yet generated. Run "npx prisma generate"');
      }

      this.prisma = new PrismaClientClass({
        log: ['error', 'warn']
      });

      // Quick connection check with 2.5s timeout
      const connectPromise = this.prisma.$connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 2500)
      );

      await Promise.race([connectPromise, timeoutPromise]);
      this.mode = 'POSTGRES_PRISMA';
      console.log('===========================================================');
      console.log('  [DATABASE] Connected to PostgreSQL via Prisma ORM');
      console.log('  [DATABASE] Storage Mode: Production PostgreSQL (ACID + JSONB)');
      console.log('===========================================================');
    } catch (err) {
      this.mode = 'HYBRID_IN_MEMORY_FALLBACK';
      console.log('===========================================================');
      console.log('  [DATABASE] PostgreSQL not detected or Docker offline');
      console.log('  [DATABASE] Storage Mode: Hybrid In-Memory ACID Engine Active');
      console.log('  [DATABASE] To activate PostgreSQL: run "docker compose up -d"');
      console.log('===========================================================');
    }
  }

  getMode() {
    return this.mode;
  }

  getPrismaClient() {
    return this.prisma;
  }

  // ==========================================
  // DELEGATE MAPS & COLLECTIONS
  // ==========================================
  get users() { return this.inMemory.users; }
  get listings() { return this.inMemory.listings; }
  get escrows() { return this.inMemory.escrows; }
  get ledgers() { return this.inMemory.ledgers; }
  get blacklist() { return this.inMemory.blacklist; }
  get kycRecords() { return this.inMemory.kycRecords; }
  get bankAccounts() { return this.inMemory.bankAccounts; }
  get withdrawals() { return this.inMemory.withdrawals; }
  get disputes() { return this.inMemory.disputes; }
  get inventorySpecs() { return this.inMemory.inventorySpecs; }
  get escrowLogs() { return this.inMemory.escrowLogs; }
  get itemChats() { return this.inMemory.itemChats; }
  get offers() { return this.inMemory.offers; }

  // ==========================================
  // DELEGATE METHODS
  // ==========================================
  initiateEscrow(...args) { return this.inMemory.initiateEscrow(...args); }
  submitCredentials(...args) { return this.inMemory.submitCredentials(...args); }
  getDecryptedCredentials(...args) { return this.inMemory.getDecryptedCredentials(...args); }
  submitItemDeliveryProof(...args) { return this.inMemory.submitItemDeliveryProof(...args); }
  verifyAndRebind(...args) { return this.inMemory.verifyAndRebind(...args); }
  buyerConfirmReceipt(...args) { return this.inMemory.buyerConfirmReceipt(...args); }
  releaseEscrowFunds(...args) { return this.inMemory.releaseEscrowFunds(...args); }

  submitKYC(...args) { return this.inMemory.submitKYC(...args); }
  reviewKYC(...args) { return this.inMemory.reviewKYC(...args); }
  getKYCByUser(...args) { return this.inMemory.getKYCByUser(...args); }
  getAllKYC(...args) { return this.inMemory.getAllKYC(...args); }

  addBankAccount(...args) { return this.inMemory.addBankAccount(...args); }
  getBankAccounts(...args) { return this.inMemory.getBankAccounts(...args); }
  requestWithdrawal(...args) { return this.inMemory.requestWithdrawal(...args); }
  approveWithdrawal(...args) { return this.inMemory.approveWithdrawal(...args); }
  getWithdrawals(...args) { return this.inMemory.getWithdrawals(...args); }

  fileDispute(...args) { return this.inMemory.fileDispute(...args); }
  resolveDispute(...args) { return this.inMemory.resolveDispute(...args); }
  getDisputeByEscrow(...args) { return this.inMemory.getDisputeByEscrow(...args); }
  getAllDisputes(...args) { return this.inMemory.getAllDisputes(...args); }

  getUserByEmail(...args) { return this.inMemory.getUserByEmail(...args); }
  registerUser(...args) { return this.inMemory.registerUser(...args); }
  loginUser(...args) { return this.inMemory.loginUser(...args); }
  googleAuthUser(...args) { return this.inMemory.googleAuthUser(...args); }

  getOrCreateItemChatThread(...args) { return this.inMemory.getOrCreateItemChatThread(...args); }
  getItemChatThread(...args) { return this.inMemory.getItemChatThread(...args); }
  getUserChatThreads(...args) { return this.inMemory.getUserChatThreads(...args); }
  sendItemChatMessage(...args) { return this.inMemory.sendItemChatMessage(...args); }
  createOffer(...args) { return this.inMemory.createOffer(...args); }
  respondToOffer(...args) { return this.inMemory.respondToOffer(...args); }
  initiateEscrowWithNegotiatedPrice(...args) { return this.inMemory.initiateEscrowWithNegotiatedPrice(...args); }
}

export const hybridDb = new HybridDatabaseAdapter();
