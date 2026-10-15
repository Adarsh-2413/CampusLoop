# CampusLoop — Product Requirements Document (PRD)

## 1. Project Overview & Problem Statement
College campuses have a thriving circular economy where students frequently buy and sell second-hand academic and personal essentials—including textbooks, scientific calculators, bicycles, electronics, lab coats/kits, and hostel appliances. Currently, these transactions happen through disorganized WhatsApp groups, unindexed Telegram channels, or physical noticeboards. This leads to:
- High incidence of spam, fraudulent listings, and flaky meetups.
- No central catalog with condition ratings, search, or category filtering.
- Inconvenient and untracked cash/UPI exchanges with no dispute or order trail.
- Safety and privacy concerns regarding personal contact detail exposure.

**CampusLoop** solves this by providing a unified, secure, student-exclusive marketplace tailored for university campuses. It provides college email verification, structured cataloging, integrated cart and test-mode payment escrow simulation, seller order management, and administrative moderation.

---

## 2. Target Personas & Roles

### 2.1 Buyer
- **Goal:** Quickly search, filter, and purchase affordable pre-owned campus necessities from verified peers.
- **Key Journey:**
  1. Register/Login with verified student email.
  2. Search and filter listings by category, condition, price range, and sorting.
  3. Inspect listing details, seller profile, and condition breakdown.
  4. Add items to cart or click "Buy Now".
  5. Complete checkout via Razorpay Standard Checkout (Test Mode).
  6. Track order status (from payment to campus handover) in "My Orders".
  7. Report fraudulent or misleading listings if encountered.

### 2.2 Seller
- **Goal:** Easily list unwanted items for cash, manage inventory, and coordinate on-campus handovers.
- **Key Journey:**
  1. Access Seller Dashboard / Create Listing form.
  2. Input product details (title, description, category, condition, price, inventory quantity, image).
  3. Publish, edit, mark as sold, or deactivate listings.
  4. Receive orders, review buyer contact details, and update fulfillment status to `READY_FOR_HANDOVER` and `COMPLETED`.

### 2.3 Admin
- **Goal:** Maintain campus platform integrity, moderate listings, handle student fraud reports, and inspect platform analytics.
- **Key Journey:**
  1. Access secure Admin Dashboard with role-guarded APIs.
  2. Monitor key metrics (total users, active listings, order volume, transaction value).
  3. Moderate flagged listings (approve, remove, warn seller).
  4. Manage user accounts (deactivate abusive or unverified accounts).
  5. Audit log tracking of administrative actions.

---

## 3. Functional Requirements

### 3.1 Authentication & Student Identity
- **Student Email Verification:** Support registration with student email domains configured via server environment variables (`COLLEGE_EMAIL_DOMAINS`).
- **Development Verification Mode:** When email SMTP credentials are not configured, use an explicit development fallback verification mode logged clearly on the server without breaking developer workflow.
- **Secure Password Storage:** Use bcrypt with salt rounds >= 10.
- **Server-Side Session / Token:** HTTP-only cookies with `SameSite=Lax` (or `None` for cross-site with `Secure`), protected against XSS and CSRF.
- **Role-Based Access Control (RBAC):** Roles: `BUYER`, `SELLER`, `ADMIN`. Ordinary users cannot escalate their privileges.

### 3.2 Product Catalog & Marketplace
- **Categories:** Books, Electronics, Calculators, Cycles, Hostel Essentials, Lab Equipment, Other.
- **Conditions:** New, Like New, Good, Fair.
- **Item Modality:**
  - *Unique single-unit used items* (cycles, specific textbooks, individual calculators): Max purchasable quantity = 1; auto-deactivated upon completion/purchase.
  - *Multi-unit items* (stationery batches, standard lab notebooks): Tracked stock count.
- **Search & Filter:** Keyword search on title/description, filter by category, price bounds, condition, and sort order (price asc/desc, newest).
- **Listing Ownership:** Sellers can only edit/delete their own listings; users cannot purchase their own listings.

### 3.3 Shopping Cart (Mandatory)
- Persistent shopping cart supporting both logged-in and guest states with proper synchronization upon login.
- Subtotal calculations, item quantity controls, removal, and clear-cart actions.
- Real-time stock validation preventing additions exceeding available stock.
- Single-unit constraints enforced (cannot add more than 1 unit of a unique item).

### 3.4 Checkout, Orders & Payment Processing
- **Server-Side Truth:** All totals, prices, and stock validations are calculated strictly on the backend. Frontend amounts are never trusted.
- **Razorpay Integration:** Test mode integration using Razorpay Standard Checkout modal.
- **Server-Side Signature Verification:** HMAC-SHA256 verification of `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
- **Webhook Handling:** Raw body webhook signature verification with idempotency protection against duplicate event IDs.
- **Order States:**
  - `PENDING_PAYMENT`
  - `PAID`
  - `PROCESSING`
  - `READY_FOR_HANDOVER`
  - `COMPLETED`
  - `CANCELLED`
  - `REFUND_PENDING`
  - `REFUNDED`
- **Campus Handover:** On-campus pickup coordinate details provided to buyer & seller upon confirmed payment.

### 3.5 Reporting & Moderation
- Students can report suspicious listings with categorized reason codes (Suspicious listing, Misleading description, Duplicate listing, Prohibited item, Other).
- Admin dashboard surfaces reported items with reporter notes and rapid action buttons (Dismiss report, Delist item, Suspend user).
- System audit logging for critical administrative events.

---

## 4. Non-Functional Requirements

### 4.1 Security
- OWASP Top 10 mitigation: Helmet security headers, CORS restricted to frontend origin, express rate limiting on auth routes, mongo injection sanitization, request payload size limits.
- No credentials or API secrets exposed in client bundles.
- Atomic database updates preventing race conditions in simultaneous purchases of single-unit items.

### 4.2 Usability & UI/UX
- Responsive design tailored for mobile, tablet, and desktop screens.
- Aesthetic, trustworthy campus theme: Deep navy/slate text, emerald/teal accents, subtle borders, polished micro-interactions.
- Accessible contrast, clear form validation error indicators, and helpful empty/loading states.

### 4.3 Performance
- Fast client bundle via Vite and code-splitting.
- Indexed database queries on frequent fields (`category`, `price`, `status`, `sellerId`, `createdAt`).

---

## 5. Scope & Acceptance Criteria (By Phase)

| Phase | Scope | Acceptance Criteria |
|---|---|---|
| **Phase 1** | Docs, React + Vite + Tailwind scaffolding, UI components & pages with mock state | App runs with clean layout; homepage, product cards, filters, detail, cart modal/page, checkout preview, sell form, and auth screens render cleanly without overflow or broken links. |
| **Phase 2** | Backend Express setup, Mongoose models, DB connection, error handling | Server starts with health check, connects to MongoDB Atlas, models validate schemas, rejection of malformed payloads. |
| **Phase 3** | Authentication & RBAC | Register, login, session cookies, email verification flow, role check middlewares. |
| **Phase 4** | Marketplace CRUD & Search | Product APIs connected to DB; image upload handling; search & filter endpoints; seller ownership enforced. |
| **Phase 5** | Cart & Order Lifecycles | Backend cart sync, atomic inventory reservation, server-side price recalculation, order creation. |
| **Phase 6** | Razorpay Test Payments | Order creation in integer paise, client modal checkout, server signature verification, raw-body webhook handler with idempotency. |
| **Phase 7** | Admin & Reporting | Admin dashboard, listing moderation, report handling, audit logging. |
| **Phase 8** | Testing, Hardening & Final Documentation | Automated tests pass (auth, cart validation, signature verification, duplicate webhook), production readiness checklist verified. |
