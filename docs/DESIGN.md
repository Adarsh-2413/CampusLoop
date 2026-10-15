# CampusLoop — UI/UX Design System & Specification

## 1. Design Philosophy
CampusLoop prioritizes a **trustworthy, crisp, student-tailored marketplace aesthetic**. Because second-hand campus trading relies heavily on peer trust and physical handovers, the visual language avoids flashy gimmicks or distracting gradients, focusing instead on:
- High readability with deep slate/navy typography.
- Reassuring emerald/teal accents indicating verified status and good deals.
- Clear condition indicators (New, Like New, Good, Fair) with color-coded badges.
- Intuitive card layouts with subtle borders, refined elevation, and interactive micro-states.

---

## 2. Design Tokens & Palette

### 2.1 Color Palette
- **Primary / Slate Dark:**
  - Background: `#F8FAFC` (Slate 50)
  - Surface / Card: `#FFFFFF` (Pure White)
  - Text Primary: `#0F172A` (Slate 900)
  - Text Secondary: `#475569` (Slate 600)
  - Text Muted: `#94A3B8` (Slate 400)
  - Border Subtle: `#E2E8F0` (Slate 200)
  - Border Focus: `#0D9488` (Teal 600)
- **Brand & Accent (Teal / Emerald):**
  - Brand Primary: `#0D9488` (Teal 600)
  - Brand Hover: `#0F766E` (Teal 700)
  - Brand Light: `#F0FDFA` (Teal 50)
  - Brand Border: `#99F6E4` (Teal 200)
- **Feedback & Badges:**
  - Success / Verified: `#059669` (Emerald 600) / `#ECFDF5`
  - Warning / Attention: `#D97706` (Amber 600) / `#FFFBEB`
  - Danger / Urgent: `#DC2626` (Red 600) / `#FEF2F2`
  - Info / Highlight: `#2563EB` (Blue 600) / `#EFF6FF`
- **Condition Badges:**
  - *New:* Emerald pill (`bg-emerald-50 text-emerald-700 border-emerald-200`)
  - *Like New:* Teal pill (`bg-teal-50 text-teal-700 border-teal-200`)
  - *Good:* Blue pill (`bg-blue-50 text-blue-700 border-blue-200`)
  - *Fair:* Amber pill (`bg-amber-50 text-amber-700 border-amber-200`)

### 2.2 Typography
- **Font Family:** `Inter`, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif.
- **Scale:**
  - Display / Hero Title: `text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900`
  - Section Heading: `text-2xl font-bold tracking-tight text-slate-900`
  - Card Title: `text-base font-semibold text-slate-800 line-clamp-2`
  - Body Text: `text-sm text-slate-600 leading-relaxed`
  - Small / Caption: `text-xs font-medium text-slate-500`

### 2.3 Radiuses & Elevation
- Buttons & Badges: `rounded-lg` or `rounded-full` for chips
- Cards & Containers: `rounded-xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-shadow`
- Modals & Drawers: `rounded-2xl shadow-xl border border-slate-200`

---

## 3. Core UI Components

### 3.1 Header / Navbar
- **Left:** CampusLoop Logo with graduation cap / loop icon and college badge indicator.
- **Center:** Wide search input with instant clear button and category quick-filter dropdown.
- **Right:**
  - Sell Item Button (`+ Sell Item`, distinct teal button).
  - Cart Icon with live animated badge count.
  - User Menu / Login trigger: Avatar with dropdown (My Orders, My Listings, Wishlist, Admin Panel, Logout).
- **Mobile:** Sticky bottom bar or responsive hamburger drawer with touch-friendly links.

### 3.2 Product Card
- Fixed aspect-ratio image container (`aspect-square` or `aspect-[4/3]`) with zoom-on-hover.
- Floating condition pill on the top-left; wishlist heart toggle on the top-right.
- Category tag and relative post time (e.g., "Calculators • 2 hours ago").
- Bold Rupee price formatted with INR symbol (e.g., `₹850`).
- Quick actions: "Add to Cart" and "Buy Now".
- Single-unit warning badge if only 1 unit is available.

### 3.3 Shopping Cart Page
- Two-column responsive layout (Item List left 65%, Summary breakdown right 35%).
- Individual item cards with thumbnail, title, seller college/name, unit price, quantity increment/decrement, and trash button.
- Pricing Summary Card:
  - Items Subtotal
  - Campus Handover Fee (`FREE`)
  - Platform / Guarantee Fee (`₹0` or nominal)
  - Final Amount in bold
  - "Proceed to Campus Checkout" primary CTA button
  - Security reassurance banner (Protected by CampusLoop escrow simulation).

### 3.4 Product Detail Page
- Two-column hero: Image carousel/gallery on left, action panel on right.
- Item condition rating breakdown and detailed description.
- Seller Trust Card: Verified student tag, college department, total listings, meetup spot recommendation.
- Handover safety guidelines accordion.
- Report Listing modal trigger.

### 3.5 Checkout Page
- Order review list with items and quantities.
- Campus Handover Coordinate picker (e.g. Central Library, Student Center, Main Gate, Hostel Block).
- Buyer contact verification (Mobile number & hostel room for handover coordination).
- Razorpay Test Mode notice: "This is a simulated test checkout. No real money is charged."
- Big "Pay & Confirm Order" button with live loading spinner.

### 3.6 Empty, Loading, and Toast States
- **Empty States:** Custom SVG illustrations for Empty Cart ("Your bag is empty. Explore campus gear!"), Empty Orders, and No Search Results.
- **Skeleton Loaders:** Shimmering animated skeletons for product cards, details, and tables while fetching data.
- **Toast Notifications:** Fixed top-right notifications for "Added to cart", "Listing created", "Logged in successfully", and errors.
