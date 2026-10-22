# ChallengeRate.com Clone (MERN Stack)

A B2B Wholesale Marketplace platform built with the **MERN Stack** (MongoDB, Express.js, React, Node.js), inspired by [ChallengeRate.com](https://challengerate.com).

## 🚀 Overview

This platform connects bulk buyers with verified Indian manufacturers and wholesale distributors across textiles, fertilizers, agricultural commodities, polymers, and industrial goods.

### Key Features Implemented:
- **Product Catalog & Filtering**: Categorized browsing (Textiles, Agro & Fertilizer, Supari & Spices, Polymers) with instant search.
- **B2B Product Details View**: 
  - Verified supplier badge, MOQ, packing units, and views counter.
  - Tiered wholesale pricing calculation.
  - Payment options breakdown (*Online Payment Best* vs *10-Day Credit*).
  - Business Information (*GST rate, Min. Order, Order Multiples*).
- **Core Section Pages**:
  - 🔄 **Repeat Orders**: Quick 1-click re-ordering of past bulk purchases.
  - 💳 **B2B Escrow Wallet**: Balance management and instant top-ups with buyer escrow protection.
  - 🤝 **Manufacturer Partner Portal**: Supplier registration and onboarding form.
  - 👤 **Profile & Business Settings**: GSTIN, registered company details, and verified warehouse address.
- **Responsive Navigation**: Header with live search and fixed mobile bottom navigation bar.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Custom CSS Design System
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB (Local / Atlas / MongoDB Compass compatible)

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://localhost:27017` or MongoDB Atlas URI)

### 1. Backend Setup
```bash
cd server
npm install
npm start
```
*Backend runs on `http://localhost:5000` (auto-seeds B2B catalog on start).*

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*
