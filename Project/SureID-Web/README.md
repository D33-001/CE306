# Escrow Game Account 

แพลตฟอร์มกลางซื้อ-ขายไอเทมและไอดีเกมพร้อมระบบพักเงินค้ำประกัน (Escrow) และตรวจสเปคอัตโนมัติ

---

## จุดเด่นและสถาปัตยกรรมของโปรเจกต์ (Key Architecture)

1. **สถาปัตยกรรมฐานข้อมูลแบบผสมผสาน (Hybrid SQL + NoSQL):**
   * **SQL (DDL: `database/schema.sql`):** เก็บข้อมูลการเงิน บัญชีผู้ใช้ ตารางสัญญาค้ำประกัน `escrow_transactions`, ตารางสมุดบัญชี `wallet_ledgers` (ACID Transactions), และทะเบียนประวัติมิจฉาชีพ `fraud_blacklist`
   * **NoSQL (`database/nosql_collections.json`):** เก็บสเปคคลังไอเทม/สกิน `account_inventory_specs` ที่มีความยืดหยุ่นตามประเภทเกม (Valorant, ROV, Genshin) และประวัติ Timeline & Security Chat ในห้อง Escrow
2. **ห้องส่งมอบไอดี 5 ขั้นตอนแบบเรียลไทม์ (Live 5-Step Escrow Room):**
   * **Step 1:** ผู้ซื้อโอนเงินเข้า Escrow Vault (ระบบล็อกเงินค้ำประกัน 100%)
   * **Step 2:** ผู้ขายส่งมอบรหัสผ่านและข้อมูลบัญชีเข้าห้องลับ
   * **Step 3:** คนกลาง/แอดมิน (Inspector) เข้าตรวจสอบสกินจริง และเปลี่ยนอีเมล/เบอร์โทรผูกบัญชี
   * **Step 4:** ผู้ซื้อล็อกอินเข้าเกมเพื่อตรวจรับสินค้า และกดยืนยันปิดงาน
   * **Step 5:** ปล่อยเงินเข้ากระเป๋าผู้ขาย พร้อมหักค่าธรรมเนียมตัวกลาง 5–10% เข้าแพลตฟอร์ม
3. **เครื่องมือประเมินมูลค่าไอดีสด (Interactive Valuation Calculator):**
   * คำนวณราคาประเมินตลาดกลาง คะแนนความน่าเชื่อถือ (Trust Score) และค่าธรรมเนียมตัวกลางแบบ Partial DOM Updates ทันทีที่คลิกเลือกสกิน
4. **Gaming Dark Mode SPA (มาตรฐาน `frontend-design` และ `no-slop-ui`):**
   * สะอาด คมชัด ปราศจาก Glassmorphism ฟุ้งเกินจริง
   * ขอบมน 8–12px, ขอบ 1px solid, ตอบสนองไวระดับ Sub-150ms พร้อมระบบสลับมุมมอง 4 บทบาทในคลิกเดียว (Buyer, Seller, Inspector, Owner)

---

## วิธีการเปิดรันโปรเจกต์

เซิร์ฟเวอร์เปิดทำงานบนพอร์ต **4000**:

**URL หน้าเว็บทดสอบ:** [http://localhost:4000](http://localhost:4000)  
**API Health Check:** [http://localhost:4000/api/health](http://localhost:4000/api/health)

### คำสั่งรันด้วยตัวเอง:
```bash
cd C:\Users\sande\.gemini\antigravity\scratch\escrow-game-vault
npm start
# หรือโหมด dev hot-reload:
npm run dev
```

---

## RESTful API Endpoints

| หมวดหมู่ | Method | Endpoint | รายละเอียด |
| :--- | :---: | :--- | :--- |
| **Listings** | `GET` | `/api/v1/listings` | ดึงรายการประกาศขายไอดีทั้งหมด พร้อมฟิลเตอร์ |
|  | `GET` | `/api/v1/listings/:id` | ดึงรายละเอียดประกาศและสเปคสกิน NoSQL |
|  | `POST` | `/api/v1/listings` | สร้างประกาศขายไอดีใหม่ |
| **Escrow 5-Step** | `POST` | `/api/v1/escrow/initiate` | เริ่มต้นสัญญา Escrow และล็อกเงิน (Step 1) |
|  | `GET` | `/api/v1/escrow/:id/status` | ดึงสถานะสัญญา 5 ขั้นตอน (Partial DOM) |
|  | `POST` | `/api/v1/escrow/:id/credentials` | ผู้ขายส่งมอบรหัสผ่านเข้าห้องลับ (Step 2) |
|  | `PUT` | `/api/v1/escrow/:id/verify-rebind` | แอดมินยืนยันตรวจสกินและสับเมลผูก (Step 3) |
|  | `PUT` | `/api/v1/escrow/:id/confirm-receipt` | ผู้ซื้อตรวจรับไอดีสำเร็จ (Step 4) |
|  | `POST` | `/api/v1/escrow/:id/release` | ปล่อยเงินให้ผู้ขายและหักค่าธรรมเนียม (Step 5) |
| **Valuation** | `POST` | `/api/v1/valuation/calculate` | คำนวณราคาประเมินและคะแนน Trust Score สด |
| **Blacklist** | `GET` | `/api/v1/blacklist` | ค้นหาประวัติมิจฉาชีพผ่านเลขบัญชีหรือ UID |
| **Auth & Owner** | `GET` | `/api/v1/auth/me` | ดึงข้อมูลผู้ใช้งานและยอดเงินกระเป๋า |
|  | `POST` | `/api/v1/auth/switch-role` | สลับมุมมองผู้ใช้ (Buyer/Seller/Inspector/Owner) |
|  | `GET` | `/api/v1/auth/analytics` | ดึงรายงานสรุป GMV และรายได้ค่าธรรมเนียมของเจ้าของ |
