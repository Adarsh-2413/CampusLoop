# CampusLoop — Engineering Rules & Conventions

## 1. Core Principles
1. **Zero Unnecessary Complexity:** No microservices, Redis, Kubernetes, or multi-cloud abstraction layers. CampusLoop is a clean, modular monolith with distinct frontend and backend folders.
2. **Server-Side Ground Truth:** Never trust input from the client. Stock availability, pricing, role authorization, and totals must be verified strictly on the server.
3. **No Phantom UI:** Every button, toggle, and link in the user interface must perform a real action, provide stateful feedback, or show an explanatory dialog—never inert clickable decoys.
4. **Honest Security & Status:** Never fake authentication or payments. Clearly log test modes and document limitations.

---

## 2. Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| React Components | PascalCase | `ProductCard.jsx`, `Navbar.jsx` |
| React Hooks | camelCase prefixed with `use` | `useAuth.js`, `useCart.js` |
| Helper / Service files | camelCase | `formatCurrency.js`, `orderService.js` |
| Express Controllers | camelCase suffixed with `Controller` | `productController.js`, `authController.js` |
| Mongoose Models | PascalCase singular | `User.js`, `Product.js`, `Order.js` |
| REST Endpoints | lowercase kebab-case, plural nouns | `/api/products`, `/api/cart/items` |
| Database Fields | camelCase | `priceInPaise`, `isUniqueItem`, `sellerId` |
| Environment Variables | UPPER_SNAKE_CASE | `MONGODB_URI`, `RAZORPAY_KEY_ID` |

---

## 3. API Response Contract

All REST APIs must adhere strictly to the following unified JSON response structure:

### 3.1 Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... }
}
```

### 3.2 Error Response
```json
{
  "success": false,
  "error": "Human-readable error description.",
  "code": "SPECIFIC_ERROR_CODE",
  "details": [ ... ]
}
```
*Note: In production (`NODE_ENV=production`), `stack` traces must never be sent to the client.*

---

## 4. Error Handling & Validation
- **Controller Safety:** Wrap all async controller functions with an async handler or standard `try/catch` delegating to `next(err)`.
- **Input Validation:** Validate request body and query params before business logic. Return `400 Bad Request` with structured error messages.
- **Authentication Errors:** Use generic messages for login failures (e.g. `"Invalid email or password"`) to prevent email enumeration.
- **Not Found Responses:** Return `404` with `"Resource not found"` when database query returns null.

---

## 5. Authorization & RBAC Rules
- **Layered Defense:** React route guards are solely for UX and redirection; backend authorization middlewares (`authenticateToken`, `requireRole(['ADMIN'])`, `verifyOwnership`) are the true security boundary.
- **Self-Purchase Prevention:** Buyers cannot purchase listings where `sellerId === req.user._id`.
- **Administrative Privileges:** Admin role cannot be self-assigned during registration; it must be provisioned via controlled script or explicit server-side seeding.

---

## 6. Monetary Values & Financial Integrity
- Always represent money in **integer paise** (1 INR = 100 paise) in backend models, payment gateways, and calculations.
- Convert to Rupees (e.g. `₹450.00`) only on the UI layer using `formatCurrency(paise)`.
- Historical order records must store order-item snapshots (price, name, seller ID) at the moment of checkout, rather than relying on current product documents.

---

## 7. Environment Variables & Secret Hygiene
- Never commit `.env` files. Ensure `.env` is listed in `.gitignore`.
- Provide complete `.env.example` templates in both `frontend/` and `backend/` with clear placeholder descriptions.
- Startup Validation: The backend must inspect critical environment variables on startup and exit cleanly with an informative log if required variables are missing.
