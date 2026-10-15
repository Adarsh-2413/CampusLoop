# CampusLoop — Session & Context Memory

## 1. Project Overview & Current State
- **Project Name:** CampusLoop
- **Status:** **ALL PHASES (Phase 1 through Phase 8) COMPLETE & FULLY VERIFIED.**
- **Test Status:** 45 automated backend tests across 6 test suites passing (0 failures).
- **Frontend Build Status:** Vite production build compiles 1644 modules cleanly in ~7s with 0 errors.

---

## 2. Completed Milestones

### Documentation Suite (Root `docs/`)
- [x] [PRD.md](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/docs/PRD.md): Product scope, personas (Buyer, Seller, Admin), functional & non-functional requirements, acceptance criteria.
- [x] [ARCHITECTURE.md](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/docs/ARCHITECTURE.md): Modular monolith, Mongoose schemas (`User`, `Product`, `Cart`, `Order`, `Payment`, `Report`, `AuditLog`), Razorpay checkout sequence diagram, and inventory concurrency controls.
- [x] [RULES.md](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/docs/RULES.md): Engineering standards, response contracts, monetary representation in integer paise, and security rules.
- [x] [DESIGN.md](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/docs/DESIGN.md): Design tokens (Slate, Teal, Emerald), typography, component states, and handover UX.
- [x] [TASKS.md](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/docs/TASKS.md): Phased task checklist tracking Phase 1 through Phase 8 (all complete).
- [x] [MEMORY.md](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/docs/MEMORY.md): Living context memory.
- [x] Root [.gitignore](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/.gitignore) & [README.md](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/README.md).

### Phase 1: Frontend Prototype & UI
- [x] React 18 + Vite + Tailwind CSS + Lucide React + React Router v6.
- [x] Complete catalog, cart, checkout, sell form, seller/admin dashboards, and order tracking.
- [x] Verified via clean `npm run build` and browser subagent end-to-end journey.

### Phase 2: Backend Architecture & Database Initialization
- [x] Express REST server with Helmet security headers, CORS with credentials, and health check (`/api/health`).
- [x] Database connection manager ([db.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/src/config/db.js)).
- [x] 7 Mongoose models: `User`, `Product`, `Cart`, `Order`, `Payment`, `Report`, `AuditLog`.
- [x] Seed script ([seed.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/src/scripts/seed.js)).
- [x] Automated tests ([health.test.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/tests/health.test.js)).

### Phase 3: Authentication & Role-Based Access Control
- [x] JWT token management with HTTP-only cookies ([token.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/src/utils/token.js)).
- [x] College email domain validator ([emailValidator.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/src/utils/emailValidator.js)).
- [x] Auth middleware ([authMiddleware.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/src/middleware/authMiddleware.js)) & controller ([authController.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/src/controllers/authController.js)).
- [x] Automated tests ([auth.test.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/tests/auth.test.js)).

### Phase 4: Marketplace CRUD & Catalog Features
- [x] Product controller ([productController.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/src/controllers/productController.js)) with category/condition filters, price bounds, sorting, pagination, search.
- [x] Product ownership middleware ([ownershipMiddleware.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/src/middleware/ownershipMiddleware.js)).
- [x] Student report controller & routes ([reportController.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/src/controllers/reportController.js)).
- [x] Automated tests ([products.test.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/tests/products.test.js)).

### Phase 5: Cart Persistence & Order Lifecycle
- [x] Cart controller ([cartController.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/src/controllers/cartController.js)) & routes: Subtotal calculations in paise, self-purchase blocking, and quantity limits.
- [x] Order controller ([orderController.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/src/controllers/orderController.js)) & routes: Server-calculated pricing, atomic inventory locks, historic snapshot subdocuments, and cancellation with inventory restoration.
- [x] Automated tests ([orders.test.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/tests/orders.test.js)).

### Phase 6: Razorpay Payments & Webhooks
- [x] Razorpay client configuration ([razorpay.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/src/config/razorpay.js)) with simulation fallback when keys are unconfigured.
- [x] Payment controller ([paymentController.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/src/controllers/paymentController.js)) & routes ([paymentRoutes.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/src/routes/paymentRoutes.js)):
  - `POST /api/payments/create-order`: Computes exact integer paise amount, creates Razorpay payment order.
  - `POST /api/payments/verify`: Timing-safe cryptographic HMAC-SHA256 signature verification ([crypto.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/src/utils/crypto.js)).
  - `POST /api/payments/webhook`: Raw-body buffer verification (`req.rawBody`) with `webhookEventId` idempotency cache to eliminate duplicate charge processing.
- [x] Frontend API client integration: `paymentService` wired in [api.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/frontend/src/services/api.js).
- [x] Automated tests ([payments.test.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/tests/payments.test.js)).

### Phase 7: Admin Moderation & Audit Logging
- [x] Audit Logger service ([auditService.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/src/services/auditService.js)) recording immutable compliance events into `AuditLog` collection.
- [x] Admin controller ([adminController.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/src/controllers/adminController.js)) & routes ([adminRoutes.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/src/routes/adminRoutes.js)):
  - `GET /api/admin/dashboard`: Metrics aggregation (students, catalog items, volume in paise, open flags).
  - `GET /api/admin/reports` & `PATCH /api/admin/reports/:id`: Review and resolve/dismiss student flags.
  - `PATCH /api/admin/products/:id/status`: Delist prohibited or suspicious items with audit trail.
  - `GET /api/admin/users` & `PATCH /api/admin/users/:id/status`: Student account moderation with self-suspension safeguards.
  - `GET /api/admin/audit-logs`: Audit trail for regulatory and integrity review.
- [x] Admin UI Integration: [AdminDashboardPage.jsx](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/frontend/src/pages/AdminDashboardPage.jsx) wired with live metrics, report actions, student directory moderation, and real-time audit trail.
- [x] Automated tests ([admin.test.js](file:///c:/Users/adars/OneDrive/Desktop/CampusLoop/backend/tests/admin.test.js)).

### Phase 8: Testing, Security Hardening & Handover
- [x] Complete automated test suite: 45 tests across 6 suites passing cleanly.
- [x] OWASP security review:
  - Helmet security headers active.
  - Credentialed CORS configuration strictly bounding origin access.
  - Global rate limiter on `/api/` (300 req/15min) + dedicated brute-force rate limiter on `/api/auth/login` and `/register`.
  - Passwords hashed with bcrypt (salt rounds: 10).
  - JWT tokens stored in HTTP-only, SameSite cookies with timing-safe verification.
  - Integer paise representation eliminating floating-point rounding errors.
  - Raw body buffer preserved specifically for cryptographic webhook signatures.
- [x] Production build validation: Vite builds cleanly with 0 errors.

---

## 3. Key Architecture & Security Invariants
1. **Integer Paise Financial Arithmetic:** All product prices, cart subtotals, order amounts, and Razorpay transactions are strictly stored and computed in integer paise (1 INR = 100 paise).
2. **Server-Side Pricing & Inventory Locks:** Order amounts are never accepted from client payloads. The backend calculates totals from the database and uses atomic `$inc` with conditions to reserve inventory.
3. **Cryptographic Integrity & Timing-Safe Verification:** Payment signatures and webhooks are validated using HMAC-SHA256 with `crypto.timingSafeEqual` to prevent timing attacks.
4. **College Domain Whitelist:** Registration is restricted to authorized college email domains via `COLLEGE_EMAIL_DOMAINS`.
5. **Role Escalation Protection:** Admin role cannot be self-selected during registration; administrative accounts are seeded or granted only by existing admins.
