# CampusLoop — Campus Second-Hand Marketplace

CampusLoop is a secure, student-exclusive marketplace web application designed for university campuses. Students can buy and sell used textbooks, scientific calculators, cycles, lab equipment, and hostel essentials from verified peers with secure payments and on-campus handover coordination.

Built as a production-grade full-stack project demonstrating database design, authentication, role-based access control, cryptographic signature verification, atomic inventory controls, and administrative moderation.

---

## 1. Key Features

- **Peer-to-Peer Campus Marketplace:** Catalog with categorization, condition badges (New, Like New, Good, Fair), price filtering, and full-text keyword search.
- **College Student Verification:** University email domain verification (`COLLEGE_EMAIL_DOMAINS`) with development fallback mode.
- **Cart & Buy Now:** Persistent shopping cart, item quantity management, and strict single-unit constraints on unique used items.
- **Test-Mode Payments:** Razorpay Standard Checkout with server-side HMAC-SHA256 signature verification and idempotent webhook processing.
- **On-Campus Handover Flow:** Designated meetup location coordination (library, hostel gates, student center) without shipping complexity.
- **Safety & Moderation Console:** Student peer reporting system, administrative delisting, student account moderation, and immutable audit logging.

---

## 2. Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Lucide React icons, Axios
- **Backend:** Node.js, Express.js REST API (ES modules)
- **Database:** MongoDB Atlas with Mongoose ODM
- **Authentication:** bcrypt password hashing (10 rounds), HTTP-only secure cookies, JWT sessions, role-based authorization (`BUYER`, `SELLER`, `ADMIN`)
- **Payments:** Razorpay Standard Checkout (Test Mode) with integer paise arithmetic and timing-safe signature verification
- **Architecture:** Modular monolith (`frontend/` + `backend/`)

---

## 3. Project Structure

```
campusloop/
├── docs/                   # Comprehensive project documentation
│   ├── PRD.md              # Product Requirements Document
│   ├── ARCHITECTURE.md     # Architecture diagrams & DB schemas
│   ├── RULES.md            # Engineering rules and conventions
│   ├── DESIGN.md           # UI/UX design tokens and component specs
│   ├── TASKS.md            # Phased task checklist (Phase 1 to 8 completed)
│   └── MEMORY.md           # Living context memory
├── frontend/               # React + Vite + Tailwind frontend application
│   ├── src/
│   │   ├── components/     # UI components (Navbar, Footer, ProductCard, etc.)
│   │   ├── context/        # AuthContext, CartContext, ToastContext
│   │   ├── pages/          # Home, Detail, Cart, Checkout, Orders, Sell, Dashboards
│   │   ├── services/       # API client & backend service modules
│   │   └── utils/          # Currency formatters and date helpers
│   └── package.json
├── backend/                # Node.js + Express backend
│   ├── src/
│   │   ├── config/         # Database and Razorpay client configuration
│   │   ├── controllers/    # Auth, Product, Cart, Order, Payment, Admin controllers
│   │   ├── middleware/     # Auth, Ownership, Error, and Rate-limiting middlewares
│   │   ├── models/         # Mongoose schemas (User, Product, Cart, Order, etc.)
│   │   ├── routes/         # REST API routes
│   │   ├── scripts/        # Database seed script
│   │   └── utils/          # JWT, email validation, and crypto helpers
│   ├── tests/              # 45 automated unit and integration tests
│   └── package.json
└── README.md
```

---

## 4. Quick Start & Setup Guide

### Prerequisites
- Node.js (v18.x or higher — tested on v23.1.0)
- npm (v9.x or higher — tested on v11.18.0)
- MongoDB Atlas connection string (or local MongoDB)

### Step 1: Clone & Configure Backend
1. Open a terminal in the root directory:
   ```bash
   cd backend
   npm install
   ```

2. Copy the sample environment configuration:
   ```bash
   cp .env.example .env
   ```

3. Configure your variables in `backend/.env`:
   ```ini
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   JWT_SECRET=your_jwt_secret_key_at_least_32_characters_long
   MONGODB_URI=your_mongodb_connection_string
   COLLEGE_EMAIL_DOMAINS=student.nitk.edu.in,nitk.edu.in,student.iitb.ac.in,campus.edu
   RAZORPAY_KEY_ID=rzp_test_yourKeyIdHere
   RAZORPAY_KEY_SECRET=yourRazorpaySecretHere
   RAZORPAY_WEBHOOK_SECRET=yourWebhookSecretHere
   ```
   *(Note: The backend gracefully runs in test/simulation mode if MongoDB or Razorpay keys are not yet configured)*

4. (Optional) Seed the database with sample products and accounts:
   ```bash
   npm run seed
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:5000/api/health`.

### Step 2: Configure & Start Frontend
1. Open a second terminal:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:5173`.

---

## 5. Running Automated Tests

CampusLoop includes 45 automated unit and integration tests covering:
- Authentication & college email domain validation
- Role escalation rejection
- Product catalog filters, pagination, and ownership controls
- Cart persistence and integer paise totals
- Atomic inventory reservation preventing over-ordering
- Razorpay HMAC-SHA256 signature verification & raw-body webhook verification
- Admin RBAC access controls, user suspension, and audit logging

To execute the test suite:
```bash
cd backend
npm test
```

Expected result:
```
ℹ tests 45
ℹ suites 6
ℹ pass 45
ℹ fail 0
```

To run a production build check on the frontend:
```bash
cd frontend
npm run build
```

---

## 6. Seed Accounts & Credentials

When the database is seeded (`npm run seed` in `backend/`), the following accounts are initialized:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin.moderator@nitk.edu.in` | `AdminPass@123` | Full access to Moderation Console, Reports, and Users |
| **Seller** | `arjun.seller@student.nitk.edu.in` | `StudentPass@123` | Can create, manage, and edit owned listings |
| **Buyer** | `sneha.buyer@student.iitb.ac.in` | `StudentPass@123` | Can browse catalog, manage cart, and purchase items |

---

## 7. Security Architecture

1. **Integer Arithmetic:** All monetary values are processed and stored as integer paise (`1 INR = 100 paise`), avoiding binary floating-point representation bugs.
2. **Server-Side Pricing Ground Truth:** Order amounts are never trusted from client payloads. Totals are computed server-side from fresh database records.
3. **Atomic Stock Locking:** Inventory reservation uses MongoDB atomic queries (`findOneAndUpdate` with `$inc: -quantity`) to eliminate race conditions on unique used items.
4. **Timing-Safe Crypto:** Payment signatures and webhooks are validated using HMAC-SHA256 with `crypto.timingSafeEqual` to prevent timing attacks.
5. **Raw Body Buffer:** Express JSON parser is configured with a custom verify hook (`req.rawBody = buf`) preserving raw bytes for cryptographic webhook validation.
6. **Defense in Depth:** Helmet HTTP security headers, credentialed CORS origin checking, global API rate limiting, and dedicated brute-force protection on authentication endpoints.
