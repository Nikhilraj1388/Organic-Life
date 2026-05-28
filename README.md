<p align="center">
  <img src="public/Images/logo.png" alt="Organic Life Logo" width="120" />
</p>

<h1 align="center">🌿 Organic Life</h1>

<p align="center">
  <strong>Delhi's freshest organic products — a full-stack marketplace connecting farmers directly with consumers.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Razorpay-Payments-0C2451?logo=razorpay&logoColor=white" />
  <img src="https://img.shields.io/badge/Three.js-3D_Hero-000000?logo=threedotjs&logoColor=white" />
</p>

---

## 📖 Overview

**Organic Life** is a production-ready, full-stack e-commerce platform for organic food in **Delhi, India (₹ INR)**. It features a multi-role authentication system (Consumer, Farmer, Admin), a visually rich marketplace with 3D hero animations, Razorpay payment integration, Google Maps for address management, a farmer dashboard for product management, an admin panel for platform moderation, and a complete order lifecycle — all backed by MongoDB Atlas.

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           CLIENT  (React 18 SPA)                        │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                     CONTEXT PROVIDERS                              │  │
│  │  CartProvider → AuthProvider → UserProfileProvider → QueryClient   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────┐  ┌────────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │  16 Pages  │  │  18 Components │  │ 3 Contexts │  │ 50 UI Prims  │  │
│  │ (lazy)     │  │                │  │            │  │ (Radix UI)   │  │
│  │            │  │ Header         │  │ Auth       │  │              │  │
│  │ Index      │  │ Hero (3D)      │  │ Cart       │  │ Button       │  │
│  │ Marketplace│  │ ProductCard    │  │ Profile    │  │ Dialog       │  │
│  │ Login      │  │ CartDrawer     │  │            │  │ Sheet        │  │
│  │ Dashboard  │  │ PaymentModal   │  │            │  │ Toast        │  │
│  │ Admin      │  │ FarmerRoute    │  │            │  │ Tabs         │  │
│  │ FarmerDash │  │ AdminRoute     │  │            │  │ Table        │  │
│  │ Checkout   │  │ ProtectedRoute │  │            │  │ Select       │  │
│  │ Payment    │  │ ProductFilter  │  │            │  │ Carousel     │  │
│  │ Orders     │  │ FeaturedCats   │  │            │  │ Calendar     │  │
│  │ Address*2  │  │ SeasonalOffers │  │            │  │ Chart        │  │
│  │ Contact    │  │ Reviews        │  │            │  │ ...40+ more  │  │
│  │ About      │  │ ExploreJourney │  │            │  │              │  │
│  │ ResetPwd   │  │ Footer         │  │            │  │              │  │
│  │ NotFound   │  │ ErrorBoundary  │  │            │  │              │  │
│  └────────────┘  └────────────────┘  └────────────┘  └──────────────┘  │
│                                                                          │
│  React Router 6 (SPA) │ TailwindCSS 3 │ Framer Motion │ Recharts       │
│  React Three Fiber     │ TanStack Query│ Acme Font     │ Lucide Icons   │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │  HTTP  /api/*
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    SERVER  (Express 5 + Vite Dev Plugin)                 │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                     MIDDLEWARE PIPELINE                            │  │
│  │  CORS → JSON Parser → URL Encoded → API Logger → Static Files    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                     API ROUTES  (/api/*)                           │  │
│  │                                                                    │  │
│  │  🔓 Public                    🔒 Protected (JWT)                   │  │
│  │  ├─ auth/                     ├─ cart/                             │  │
│  │  │  ├ POST register           │  ├ GET  /:userId                  │  │
│  │  │  ├ POST login              │  └ POST /sync                     │  │
│  │  │  ├ POST send-otp           ├─ orders/                          │  │
│  │  │  ├ POST verify-otp         │  ├ POST /                         │  │
│  │  │  ├ GET  verify             │  ├ GET  /:userId                  │  │
│  │  │  ├ POST forgot-password    │  └ PATCH /:id/status              │  │
│  │  │  └ POST reset-password     ├─ profile/                         │  │
│  │  ├─ products/                 │  ├ POST /avatar                   │  │
│  │  │  ├ GET  /                  │  └ POST /avatar/delete            │  │
│  │  │  └ GET  /:id               │                                    │  │
│  │  └─ categories/               🌾 Farmer Only                      │  │
│  │     └ GET  /                  ├─ farmer/                           │  │
│  │                               │  ├ GET    /dashboard               │  │
│  │                               │  ├ GET    /products                │  │
│  │                               │  ├ POST   /products                │  │
│  │                               │  ├ PATCH  /products/:id            │  │
│  │                               │  ├ DELETE /products/:id            │  │
│  │                               │  ├ GET    /orders                  │  │
│  │                               │  ├ CRUD   /promotions              │  │
│  │                               │  └ GET    /categories              │  │
│  │                               │                                    │  │
│  │                               🛡️ Admin Only                       │  │
│  │                               └─ admin/                            │  │
│  │                                  ├ CRUD  /products                 │  │
│  │                                  ├ PATCH /products/:id/approve     │  │
│  │                                  ├ PATCH /products/:id/remove      │  │
│  │                                  ├ GET   /users                    │  │
│  │                                  ├ GET   /stats                    │  │
│  │                                  ├ GET   /analytics                │  │
│  │                                  ├ CRUD  /orders                   │  │
│  │                                  ├ CRUD  /promotions               │  │
│  │                                  ├ GET   /inventory                │  │
│  │                                  ├ GET   /reports/:type            │  │
│  │                                  └ CRUD  /categories               │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Mongoose ODM │ JWT Auth │ bcryptjs │ Multer (uploads) │ Nodemailer     │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │  Mongoose
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      DATABASE  (MongoDB Atlas)                           │
│                      Cluster: organic-life.o8actcj.mongodb.net           │
│                      Database: organic-life                              │
│                                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐              │
│  │  users   │  │ products │  │  orders  │  │ categories │              │
│  │          │  │          │  │          │  │            │              │
│  │ authId   │→←│ farmerId │  │ userId   │  │ name       │              │
│  │ email    │  │ name     │  │ items[]  │  │ key ⚷      │              │
│  │ phone    │  │ price    │  │ status   │  │ image      │              │
│  │ role ◆   │  │ category │→─│ total    │  │ order      │              │
│  │ password │  │ image    │  │ payment  │  └────────────┘              │
│  │ farmName │  │ status ◆ │  │ address  │                              │
│  │ farmLoc. │  │ published│  └──────────┘  ┌────────────┐              │
│  │ status   │  │ quantity │                │ promotions │              │
│  └──────────┘  │ unit ◆   │  ┌──────────┐  │            │              │
│                │ options[]│  │  carts   │  │ code ⚷     │              │
│  ┌──────────┐  └──────────┘  │          │  │ discount%  │              │
│  │ profiles │                │ userId ⚷ │  │ productId  │              │
│  │          │                │ items[]  │  │ farmerId   │              │
│  │ userId ⚷ │                └──────────┘  │ dates      │              │
│  │ avatar   │                              └────────────┘              │
│  │ address  │                                                          │
│  └──────────┘       ◆ = enum    ⚷ = unique index                      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🎭 Role-Based Access

The platform supports three user roles, each with tailored UI and API access:

| Feature | 👤 Consumer | 🌾 Farmer | 🛡️ Admin |
|---|:---:|:---:|:---:|
| Browse marketplace | ✅ | ✅ | ✅ |
| Search, filter & sort products | ✅ | ✅ | ✅ |
| Add to cart & checkout (₹ INR) | ✅ | ✅ | ✅ |
| Razorpay online payment | ✅ | ✅ | ✅ |
| Cash on Delivery (+ ₹20) | ✅ | ✅ | ✅ |
| View order history | ✅ | ✅ | ✅ |
| Edit profile & avatar | ✅ | ✅ | ✅ |
| Google Maps address management | ✅ | ✅ | ✅ |
| Farmer Dashboard | ❌ | ✅ | ❌ |
| Add / edit own products | ❌ | ✅ | ❌ |
| View incoming orders | ❌ | ✅ | ❌ |
| Create promotions | ❌ | ✅ | ❌ |
| Admin Panel (9 tabs) | ❌ | ❌ | ✅ |
| Approve / reject products | ❌ | ❌ | ✅ |
| Manage all users | ❌ | ❌ | ✅ |
| Analytics & reports (Recharts) | ❌ | ❌ | ✅ |
| Inventory management | ❌ | ❌ | ✅ |
| Category management | ❌ | ❌ | ✅ |

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| **Primary Font** | `Acme` (Google Fonts) | Headings, brand text |
| **organic-cream** | `#F4E8D3` | Background, cards |
| **organic-brown** | `#59452C` | Primary brand color |
| **organic-white** | `#FFFFFF` | Content backgrounds |
| **organic-black** | `#000000` | Text |
| **Dark Mode** | HSL custom properties | Full dark theme support |
| **Animations** | Framer Motion + CSS | `animate-fade-up`, hover effects |
| **3D Elements** | React Three Fiber + Drei | Hero section |

---

## 🗺️ Route Map

### 🔓 Public Routes
| Path | Page | Description |
|---|---|---|
| `/` | `Index` | Landing page with 3D hero, categories, seasonal offers, reviews |
| `/marketplace` | `Marketplace` | Product grid with search, filters, sort, pagination |
| `/about` | `About` | About Organic Life |
| `/contact` | `Contact` | Contact information |
| `/login` | `Login` | Sign in / sign up (email, phone OTP, Google) |
| `/reset-password` | `ResetPassword` | Password reset flow |

### 🔒 Protected Routes (authenticated users)
| Path | Page | Description |
|---|---|---|
| `/dashboard` | `Dashboard` | Profile, recent orders, address (3 tabs) |
| `/checkout` | `Checkout` | Cart review & payment method selection |
| `/payment` | `Payment` | Razorpay payment processing |
| `/order-history` | `OrderHistory` | Complete order history with status |
| `/address-setup` | `AddressSetup` | First-time address configuration |
| `/address-management` | `AddressManagement` | Manage saved addresses |

### 🌾 Farmer Routes
| Path | Page | Description |
|---|---|---|
| `/farmer-dashboard` | `FarmerDashboard` | Products, orders, promotions, overview (4 tabs) |

### 🛡️ Admin Routes
| Path | Page | Description |
|---|---|---|
| `/admin` | `Admin` | Full admin panel (9 tabs: products, users, orders, promotions, inventory, analytics, reports, settings, categories) |

> All pages are **lazy-loaded** with `React.lazy()` + `<Suspense>` for optimal bundle splitting.

---

## 📂 Project Structure

```
Organic-Life/
├── client/                          # React SPA frontend
│   ├── pages/                       # 16 route page components
│   │   ├── Index.tsx                #   Landing page (Hero 3D + 4 sections)
│   │   ├── Marketplace.tsx          #   Product listing (362 lines)
│   │   ├── Login.tsx                #   Auth (email + OTP + Google)
│   │   ├── Dashboard.tsx            #   User dashboard (389 lines, 3 tabs)
│   │   ├── Admin.tsx                #   Admin panel (1,476 lines, 9 tabs)
│   │   ├── FarmerDashboard.tsx      #   Farmer dashboard (716 lines, 4 tabs)
│   │   ├── Checkout.tsx             #   Cart + payment (235 lines)
│   │   ├── Payment.tsx              #   Razorpay processing
│   │   ├── OrderHistory.tsx         #   Order history (162 lines)
│   │   ├── About.tsx                #   About page
│   │   ├── Contact.tsx              #   Contact page
│   │   ├── AddressSetup.tsx         #   First-time address
│   │   ├── AddressManagement.tsx    #   Manage addresses
│   │   ├── ResetPassword.tsx        #   Password reset
│   │   ├── ProfileSetup.tsx         #   Profile onboarding
│   │   └── not-found.tsx            #   404 page
│   ├── components/                  # 18 shared components
│   │   ├── Hero.tsx                 #   3D hero (React Three Fiber, 12.5KB)
│   │   ├── Header.tsx               #   Nav bar with role-based menus
│   │   ├── Footer.tsx               #   Site footer
│   │   ├── ProductCard.tsx          #   Product display card
│   │   ├── ProductFilter.tsx        #   Category filter sidebar
│   │   ├── CartDrawer.tsx           #   Slide-out cart panel
│   │   ├── CartSidebar.tsx          #   Cart sidebar variant
│   │   ├── CartItemRow.tsx          #   Cart line item
│   │   ├── PaymentModal.tsx         #   Payment dialog (Razorpay)
│   │   ├── FeaturedCategories.tsx   #   Homepage categories (7.8KB)
│   │   ├── SeasonalOffers.tsx       #   Homepage offers (9.8KB)
│   │   ├── Reviews.tsx              #   Customer testimonials (10.5KB)
│   │   ├── ExploreJourney.tsx       #   Homepage CTA (12.2KB)
│   │   ├── Layout.tsx               #   Header + Outlet + Footer
│   │   ├── ProtectedRoute.tsx       #   Auth route guard
│   │   ├── AdminRoute.tsx           #   Admin role guard
│   │   ├── FarmerRoute.tsx          #   Farmer role guard
│   │   ├── ErrorBoundary.tsx        #   Error boundary
│   │   └── ui/                      #   50 Radix UI primitives
│   ├── contexts/
│   │   ├── AuthContext.tsx          #   JWT auth, roles, login/register
│   │   ├── CartContext.tsx          #   Cart state & server sync
│   │   └── UserProfileContext.tsx   #   Profile, avatar, address
│   ├── lib/
│   │   └── utils.ts                 #   cn() — clsx + tailwind-merge
│   ├── App.tsx                      #   Router, providers, lazy routes
│   └── global.css                   #   TailwindCSS theme & design tokens
│
├── server/                          # Express API backend
│   ├── index.ts                     #   Server setup & route mounting
│   ├── db.ts                        #   MongoDB connection (Mongoose)
│   ├── start.ts                     #   Standalone server entry
│   ├── models/                      #   7 Mongoose schemas
│   │   ├── User.ts                  #     Users (3 roles, auth fields)
│   │   ├── Product.ts               #     Products (approval workflow)
│   │   ├── Order.ts                 #     Orders (6-stage lifecycle)
│   │   ├── Cart.ts                  #     Per-user cart sync
│   │   ├── Category.ts              #     Product categories
│   │   ├── Profile.ts               #     Extended user profiles
│   │   └── Promotion.ts             #     Discount promotions
│   └── routes/                      #   9 API route handlers
│       ├── auth.ts                  #     14KB — register, login, OTP, reset
│       ├── admin.ts                 #     23KB — full admin API
│       ├── farmer.ts                #     21KB — full farmer API
│       ├── orders.ts                #     Order CRUD & status updates
│       ├── products.ts              #     Public product listing
│       ├── categories.ts            #     Category CRUD
│       ├── cart.ts                  #     Cart sync
│       ├── profile.ts               #     Avatar upload (Multer)
│       └── demo.ts                  #     Demo endpoint
│
├── shared/                          #   Shared types (client ↔ server)
│   └── api.ts                       #     Shared API interfaces
│
├── scripts/                         #   19 utility & diagnostic scripts
│   ├── check-mongo-connection.ts    #     MongoDB connection diagnostic
│   ├── full-db-flash.ts             #     Dump all database data
│   ├── list-all-databases.ts        #     List all DBs on cluster
│   ├── seed-admin.mjs               #     Seed admin user
│   └── ...                          #     Migration & cleanup scripts
│
├── public/
│   └── Images/                      #   Product images, logo, banners
│
├── .env.example                     #   Environment variable template
├── package.json                     #   Dependencies & scripts (pnpm)
├── vite.config.ts                   #   Vite + Express dev integration
├── tailwind.config.ts               #   TailwindCSS theme (organic palette)
├── netlify.toml                     #   Netlify deployment config
└── tsconfig.json                    #   TypeScript configuration
```

---

## ✨ Features

### 🏠 Landing Page
- **3D animated hero** section powered by React Three Fiber & Drei
- Featured product categories with image cards
- Seasonal offers section with promotional banners
- Customer reviews & testimonials carousel
- "Explore the Journey" CTA section
- Smooth scroll animations via Framer Motion

### 🛒 Marketplace
- Responsive product grid (1/2/3/4 columns across breakpoints)
- Category-based sidebar filtering
- Full-text search with URL query param support (`?q=`)
- Sort by name (A-Z / Z-A) or price (low → high / high → low)
- Pagination (12 items per page) with top & bottom controls
- Product cards with images, pricing in ₹, stock status & quantity options
- Loading skeletons, error states, and empty states
- Free delivery above ₹499 banner

### 🔐 Authentication
- **Email + password** registration & login
- **Phone OTP** verification (6-digit code, 60s resend timer)
- **Google OAuth** integration (ready for Google Identity Services)
- JWT token authentication with auto-verification on mount
- Remember me (localStorage vs sessionStorage)
- Forgot password / reset password via email (Nodemailer)
- Role selection during registration (Consumer or Farmer)
- Farmer-specific fields (farm name, farm location)
- Role-based post-login redirects
- Dev mode admin bypass (`?dev_admin=1`)

### 🌾 Farmer Dashboard (4 Tabs)
- **Overview** — Stats cards (total/active products, orders, revenue in ₹), quick actions
- **Products** — Add/edit products with image upload, category selection, pricing, stock toggle; products require admin approval (pending → approved)
- **Orders** — View incoming orders from consumers with status badges and payment method
- **Promotions** — Create/manage discount codes with percentage, date ranges, product targeting

### 🛡️ Admin Panel (9 Tabs)
- **Products** — Full CRUD with image upload, bulk publish/unpublish, approval workflow, deep-link editing
- **Users** — Paginated user list with role/status filters and search
- **Orders** — All platform orders with status management (6-stage lifecycle)
- **Promotions** — Store-wide and product-specific promo code management
- **Inventory** — Stock level monitoring with low-stock indicators
- **Analytics** — Interactive charts (Bar, Line, Pie via Recharts) with type/year/month filters, total earnings
- **Reports** — Generate reports by type
- **Settings** — Platform configuration
- **Categories** — CRUD categories with image upload and drag reorder

### 💳 Payments & Checkout
- **Razorpay** online payment integration
- **Cash on Delivery** option (+ ₹20 surcharge)
- ₹50 flat delivery charge
- Complete order summary (subtotal, delivery, COD charges)
- Cart with quantity controls and server-side sync

### 📦 Order Lifecycle
- Order history with color-coded status badges
- INR formatting (`Intl.NumberFormat('en-IN')`)

### 👤 User Profile & Address
- Avatar upload with server-side storage (Multer)
- Personal details (name, DOB, gender, dietary restrictions)
- Newsletter & notification preferences
- **Google Maps** powered address management
- First-time address setup flow

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + TypeScript | UI framework |
| **Routing** | React Router 6 (SPA) | Client-side navigation |
| **Styling** | TailwindCSS 3 + tailwindcss-animate | Utility-first CSS |
| **UI Library** | Radix UI (50 primitives) | Accessible components |
| **Icons** | Lucide React | Icon system |
| **3D Graphics** | React Three Fiber + Drei | 3D hero section |
| **Animations** | Framer Motion | Page & element animations |
| **Charts** | Recharts | Admin analytics |
| **Data Fetching** | TanStack React Query | Server state management |
| **Forms** | React Hook Form + Zod | Form validation |
| **Carousel** | Embla Carousel | Image carousels |
| **Backend** | Express 5 + Node.js | API server |
| **Database** | MongoDB Atlas + Mongoose 8 | Data persistence |
| **Auth** | JWT + bcryptjs | Authentication |
| **Payments** | Razorpay | Online payments |
| **Email** | Nodemailer | Password reset emails |
| **File Upload** | Multer | Image uploads |
| **Validation** | Zod | Schema validation |
| **Build Tool** | Vite 7 + SWC | Dev server & bundling |
| **Testing** | Vitest + Testing Library | Unit & component tests |
| **Package Manager** | pnpm 10 | Dependency management |
| **Deployment** | Netlify | Cloud hosting |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 10
- **MongoDB Atlas** account (or local MongoDB)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Nikhilraj1388/Organic-Life.git
cd Organic-Life

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### Environment Variables

Create a `.env` file in the root:

```env
# Database — include the database name after the host!
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/organic-life?appName=Organic-Life

# JWT Secret — change this in production!
JWT_SECRET=your-super-secret-jwt-key

# Server Port
PORT=5001

# Ping message (testing)
PING_MESSAGE=pong
```

> ⚠️ **Important**: Make sure to include `/organic-life` in the connection string. Without it, Mongoose defaults to the `test` database and your data won't appear.

### Running

```bash
# Start development server (client + server on single port 8080)
pnpm dev

# Run MongoDB connection check
pnpm check:db

# Dump all database contents
pnpm flash:db

# Seed an admin user
node scripts/seed-admin.mjs

# Build for production
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test

# Type checking
pnpm typecheck
```

---

## 🔄 Order Lifecycle

```
 ┌──────────┐     ┌───────────┐     ┌────────────┐     ┌──────────┐     ┌───────────┐
 │ PENDING  │────▶│ CONFIRMED │────▶│ PROCESSING │────▶│ SHIPPED  │────▶│ DELIVERED │
 └──────────┘     └───────────┘     └────────────┘     └──────────┘     └───────────┘
      │                                                                        
      └─────────────────────────────▶ CANCELLED
```

| Status | Badge Color | Description |
|---|---|---|
| **Pending** | 🟡 Yellow | Order placed by consumer |
| **Confirmed** | 🔵 Blue | Farmer accepts the order |
| **Processing** | 🟣 Purple | Order is being prepared |
| **Shipped** | 🟠 Orange | Order dispatched for delivery |
| **Delivered** | 🟢 Green | Order received by consumer |
| **Cancelled** | 🔴 Red | Order cancelled at any stage |

---

## 🗄️ Database Schema (ERD)

```mermaid
erDiagram
    USERS {
        ObjectId _id PK
        String authId UK
        String email UK
        String phone UK
        String name
        String password
        String role "user | farmer | admin"
        String farmName
        String farmLocation
        String status "active | suspended"
        Boolean profileComplete
        Date createdAt
    }

    PRODUCTS {
        ObjectId _id PK
        String name
        Number price
        String category
        String farmerId FK
        String image
        Boolean inStock
        Number quantity
        String unit "kg | unit | litre | dozen | gram"
        String status "pending | approved | removed"
        Boolean published
        String description
        Date createdAt
    }

    ORDERS {
        ObjectId _id PK
        String userId FK
        Date createdAt
        String status "pending | confirmed | processing | shipped | delivered | cancelled"
        Number total
        String paymentMethod "online | cod"
        String paymentStatus "pending | paid | failed"
        Object deliveryAddress
        Array items
    }

    CATEGORIES {
        ObjectId _id PK
        String name
        String key UK
        String image
        Number order
    }

    CARTS {
        ObjectId _id PK
        ObjectId userId FK UK
        Array items
        Date updatedAt
    }

    PROFILES {
        ObjectId _id PK
        ObjectId userId FK UK
        String avatarUrl
        String firstName
        String lastName
        String gender
        Boolean notifications
    }

    PROMOTIONS {
        ObjectId _id PK
        String code UK
        Number discountPercent
        String productId FK
        String farmerId FK
        Date startDate
        Date endDate
        String status "active | inactive"
    }

    USERS ||--o{ PRODUCTS : "farms"
    USERS ||--o{ ORDERS : "places"
    USERS ||--o| CARTS : "has"
    USERS ||--o| PROFILES : "has"
    USERS ||--o{ PROMOTIONS : "creates"
    PRODUCTS ||--o{ PROMOTIONS : "has"
    CATEGORIES ||--o{ PRODUCTS : "contains"
```

---

## 📡 API Reference

### 🔓 Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user (consumer or farmer) |
| `POST` | `/api/auth/login` | Login with email & password |
| `POST` | `/api/auth/send-otp` | Send OTP to phone number |
| `POST` | `/api/auth/verify-otp` | Verify OTP code |
| `GET` | `/api/auth/verify` | Verify JWT token (Bearer) |
| `POST` | `/api/auth/forgot-password` | Request password reset email |
| `POST` | `/api/auth/reset-password` | Reset password with token |

### 📦 Products & Categories (Public)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List all published products |
| `GET` | `/api/products/:id` | Get product by ID |
| `GET` | `/api/categories` | List all categories |

### 🛒 Cart (Protected)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cart/:userId` | Get user's cart |
| `POST` | `/api/cart/sync` | Sync cart to server |

### 📋 Orders (Protected)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/orders` | Create new order |
| `GET` | `/api/orders/:userId` | Get user's order history |
| `PATCH` | `/api/orders/:id/status` | Update order status |

### 👤 Profile (Protected)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/profile/avatar` | Upload avatar image |
| `POST` | `/api/profile/avatar/delete` | Delete avatar |

### 🌾 Farmer Routes (Auth Required — Farmer role)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/farmer/dashboard` | Dashboard stats |
| `GET` | `/api/farmer/products` | Farmer's own products |
| `POST` | `/api/farmer/products` | Add new product (+ image) |
| `PATCH` | `/api/farmer/products/:id` | Update product |
| `DELETE` | `/api/farmer/products/:id` | Delete product |
| `GET` | `/api/farmer/orders` | Orders for farmer's products |
| `CRUD` | `/api/farmer/promotions` | Manage promotions |
| `GET` | `/api/farmer/categories` | Available categories |

### 🛡️ Admin Routes (Auth Required — Admin role)
| Method | Endpoint | Description |
|---|---|---|
| `CRUD` | `/api/admin/products` | Full product management |
| `PATCH` | `/api/admin/products/:id/approve` | Approve farmer product |
| `PATCH` | `/api/admin/products/:id/remove` | Remove product |
| `GET` | `/api/admin/users` | All platform users |
| `GET` | `/api/admin/stats` | Platform statistics |
| `GET` | `/api/admin/analytics` | Analytics data (charts) |
| `CRUD` | `/api/admin/orders` | All order management |
| `CRUD` | `/api/admin/promotions` | All promotions |
| `GET` | `/api/admin/inventory` | Inventory levels |
| `GET` | `/api/admin/reports/:type` | Generate reports |
| `CRUD` | `/api/admin/categories` | Category management |

---

## 🧪 Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start dev server (client + API, single port) |
| `pnpm build` | Production build (client + server) |
| `pnpm start` | Start production server |
| `pnpm test` | Run Vitest test suite |
| `pnpm typecheck` | TypeScript validation |
| `pnpm check:db` | MongoDB connection diagnostic |
| `pnpm flash:db` | Dump all database contents |
| `pnpm verify:farmer` | Verify farmer system integrity |
| `pnpm migrate:farmer` | Run farmer data migration |
| `pnpm fix:farmer:now` | Fix farmer product data |
| `pnpm fix:farmerid:type` | Fix farmerId type mismatches |
| `pnpm cleanup:products` | Clean up invalid products |

---

## 🚢 Deployment

### Netlify (configured)
A `netlify.toml` is included for seamless deployment:
```bash
pnpm build   # Outputs: dist/spa (client) + dist/server (server)
```

### Environment
Set the same `.env` variables in your hosting provider's environment settings.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and not licensed for public distribution.

---

<p align="center">
  Made with 💚 by the Organic Life team
</p>
