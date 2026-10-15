# CampusLoop — Phased Development Task Checklist

## Phase 1: Documentation, Frontend Scaffolding & Prototype UI
- [x] Inspect workspace and verify zero-polluted baseline.
- [x] Create core documentation suite in `docs/` (`PRD.md`, `ARCHITECTURE.md`, `RULES.md`, `DESIGN.md`, `TASKS.md`, `MEMORY.md`).
- [x] Create root `README.md` and `.gitignore`.
- [x] Initialize `frontend/` using Vite + React.
- [x] Install frontend dependencies: `tailwindcss`, `postcss`, `autoprefixer`, `react-router-dom`, `axios`, `lucide-react`.
- [x] Configure Tailwind CSS, design tokens, and base styles in `frontend/src/index.css`.
- [x] Implement Mock Data Catalog (`frontend/src/data/mockProducts.js`) covering all required categories.
- [x] Implement State Management:
  - [x] `AuthContext` (mock authentication with Buyer, Seller, Admin role switching for Phase 1).
  - [x] `CartContext` (real in-memory cart with persistence in localStorage, quantity management, single-unit limits).
  - [x] `ToastContext` (interactive notifications for user actions).
- [x] Implement Core Shared Components:
  - [x] `Navbar` (search bar, cart badge, role switcher, links).
  - [x] `Footer` (campus safety promise, category links, copyright).
  - [x] `ProductCard` (condition pills, image preview, quick Add-to-Cart & Buy-Now buttons).
  - [x] `ToastContainer` & Alert Banners.
- [x] Implement Required Public & Buyer Pages:
  - [x] Home / Marketplace (`/`) with Hero, Category chips, Search, Condition filters, and Sorting.
  - [x] Product Detail (`/products/:id`) with image gallery, seller info, safety guide, and Report modal.
  - [x] Shopping Cart (`/cart`) with live quantity counters, subtotal calculation, and empty state.
  - [x] Checkout Preview (`/checkout`) with campus pickup spot selector and mock payment review.
  - [x] Login & Registration (`/login`, `/register`) with role picker and domain validation preview.
  - [x] Create / Sell Listing Form (`/sell`) with condition selector and instant preview.
  - [x] Buyer Orders (`/orders`) with order cards and status timeline.
  - [x] Seller Dashboard (`/seller`) with active listings and incoming handovers.
  - [x] Admin Dashboard (`/admin`) with platform metrics and moderation queue preview.
  - [x] 404 Not Found (`*`).
- [x] Verify Phase 1 acceptance criteria: Clean builds (`npm run build`), no console errors, mobile responsive checks.

---

## Phase 2: Backend Architecture & Database Initialization
- [x] Initialize `backend/` package and install dependencies (`express`, `mongoose`, `dotenv`, `cors`, `helmet`, `cookie-parser`, `express-rate-limit`, `bcryptjs`, `razorpay`).
- [x] Setup Express server entrypoints (`src/app.js`, `src/server.js`) with security middlewares and health check (`/api/health`).
- [x] Implement MongoDB Atlas connection manager with error handling.
- [x] Implement Mongoose Schemas & Models:
  - [x] `User.js`
  - [x] `Product.js`
  - [x] `Cart.js`
  - [x] `Order.js`
  - [x] `Payment.js`
  - [x] `Report.js`
  - [x] `AuditLog.js`
- [x] Implement Seed Script (`src/scripts/seed.js`) with fictional college marketplace items.
- [x] Verify Phase 2 acceptance criteria: Backend boots, connects when URI provided, rejects malformed payloads.

---

## Phase 3: Authentication & Role-Based Access Control
- [x] Implement `authController.js` (register, login, logout, me, verify-email).
- [x] Implement college email domain validation via `COLLEGE_EMAIL_DOMAINS` env.
- [x] Implement development fallback email verification mode.
- [x] Implement HTTP-only cookie session handling.
- [x] Implement auth and role middlewares (`authenticateToken`, `requireRole`).
- [x] Wire frontend `AuthContext` to backend API client.
- [x] Verify Phase 3 acceptance criteria: Secure registration, login, cookie setting, protected route rejection.

---

## Phase 4: Marketplace CRUD & Catalog Features
- [x] Implement `productController.js` (list with filters/search/pagination, getById, create, update, delete).
- [x] Implement seller ownership verification middleware.
- [x] Implement product reporting endpoint (`POST /api/reports`).
- [x] Integrate frontend catalog with real backend REST endpoints.
- [x] Verify Phase 4 acceptance criteria: Products save to MongoDB, sellers modify only own listings, reports logged.

---

## Phase 5: Cart Persistence & Order Lifecycle
- [x] Implement `cartController.js` (fetch cart, add item, update quantity, remove item, clear).
- [x] Implement atomic inventory checks preventing over-ordering or double-selling single-unit items.
- [x] Implement `orderController.js` (create pending order, fetch user orders, cancel order).
- [x] Integrate frontend Cart and Checkout with live backend order creation.
- [x] Verify Phase 5 acceptance criteria: Cart syncs with database, amounts calculated on server, atomic quantity locks.

---

## Phase 6: Razorpay Payments & Webhooks
- [x] Configure Razorpay client in backend (`src/config/razorpay.js`).
- [x] Implement `POST /api/payments/create-order` (computes exact amount in paise, creates Razorpay order).
- [x] Implement `POST /api/payments/verify` (verifies HMAC SHA256 signature server-side).
- [x] Implement `POST /api/payments/webhook` with raw request body verification and event idempotency check.
- [x] Connect frontend Razorpay Standard Checkout SDK.
- [x] Verify Phase 6 acceptance criteria: Orders transition to `PAID` only upon verified signatures or webhooks.

---

## Phase 7: Admin Moderation & Audit Logging
- [x] Implement `adminController.js` (metrics overview, list users, moderate listings, resolve reports).
- [x] Implement Audit Logger service (`src/services/auditService.js`).
- [x] Wire Admin UI with real admin endpoints.
- [x] Verify Phase 7 acceptance criteria: Admin actions require verified admin identity and produce audit records.

---

## Phase 8: Testing, Security Hardening & Handover
- [x] Implement unit & integration tests (`backend/tests/`).
- [x] Test auth, cart quantity constraints, price calculation, payment signature verification, duplicate webhook rejection.
- [x] Review OWASP security checklist (Helmet, CORS, rate limits, no secret leakage).
- [x] Verify final build and update all documentation.
