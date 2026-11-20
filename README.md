# 🏷️ PriceTrail - Multi-Platform Price Comparison App

A modern full-stack product price comparison application built with **React Native (Expo)** on the frontend and **Node.js + Cheerio** on the backend. It live-scrapes e-commerce platforms including **Amazon India**, **Flipkart**, and **Snapdeal**, normalizes product and pricing data, filters out irrelevant accessories, and highlights the **best deal** with real savings.

---

## 🌟 Key Features

- **Latest Tech Stack**: Powered by **Expo SDK 58**, **React Native 0.88.1**, and **React 19.3.0** with Metro bundler and `@expo/metro-runtime`.
- **Intelligent Product Matching & Relevance Engine**:
  - **Intent & Category Classifier**: Detects user intent (main device vs explicit accessory search) and classifies products into Smartphones, Laptops, Audio, Smartwatches, and Accessories.
  - **Strict Model & Tier Gate**: Strictly distinguishes between models (e.g. *iPhone 15* vs *15 Pro* vs *15 Pro Max*; *Galaxy S24* vs *S24 Ultra*).
  - **Accessory Rejection**: Automatically filters out phone cases, covers, tempered glass, cables, and bags from device searches, preventing accessories from falsely winning best device deals.
  - **Variant Matching**: Clusters identical storage (128GB vs 256GB), RAM (8GB vs 16GB), and chipset specs so different variants are never compared as equivalent.
  - **Relevance Scoring (0-100)**: Multi-factor scoring taking into account Brand, Model, Category, Specification Match, and Token Similarity.
- **Cheerio HTML Web Scraping**: Extracts live product titles, images, ratings, reviews, current prices, original MRPs, and canonical direct `/dp/ASIN` product URLs with 100% live scraping.
- **Calm, Utilitarian Mobile-First UI**:
  - Centralized design tokens with clean neutral light surfaces, 8pt spacing grid, 12px max radius, and tabular price numerals.
  - Clean light theme designed for readability and focus.
  - Single integrated search bar and compact Store and Sort dropdowns.
  - Direct 1-tap "View" button opening exact product pages.

---

## 🏗️ Architecture & Project Structure

```text
PriceTrail/
├── client/                           # React Native Expo Frontend
│   ├── src/
│   │   ├── app/                      # Expo Router layout & screens
│   │   │   ├── _layout.jsx           # Root SafeArea & Theme providers
│   │   │   └── index.jsx             # Main search & offer comparison feed
│   │   ├── components/               # Utilitarian UI components
│   │   │   ├── FilterSortBar.jsx     # Store & Sort dropdowns
│   │   │   ├── Header.jsx            # Top navigation bar
│   │   │   ├── OfferCard.jsx         # Product offer cards with lowest-price highlighting
│   │   │   ├── SearchBar.jsx         # Integrated search input
│   │   │   ├── SkeletonLoader.jsx    # Pulsing skeleton layout
│   │   │   └── TrendingChips.jsx     # Collapsible trending search chips
│   │   └── theme/                    # Design tokens & context
│   │       ├── ThemeContext.jsx
│   │       └── tokens.js
│   ├── app.json
│   └── package.json
│
├── server/                           # Node.js + Express Backend
│   ├── src/
│   │   ├── controllers/              # Route controllers
│   │   │   ├── compareController.js
│   │   │   └── productController.js
│   │   ├── routes/                   # API routes
│   │   │   └── productRoutes.js
│   │   ├── scrapers/                 # Live Cheerio web scrapers
│   │   │   ├── amazonScraper.js      # Amazon scraper with ASIN extraction
│   │   │   ├── flipkartScraper.js    # Flipkart list/grid scraper
│   │   │   └── snapdealScraper.js    # Snapdeal scraper
│   │   ├── services/                 # Matching & pricing services
│   │   │   ├── pricing/
│   │   │   │   ├── calculateDealScore.js
│   │   │   │   └── comparePrices.js
│   │   │   └── productMatching/
│   │   │       ├── calculateRelevance.js
│   │   │       ├── classifyProduct.js
│   │   │       ├── extractAttributes.js
│   │   │       ├── filterProducts.js
│   │   │       ├── matchVariants.js
│   │   │       └── normalizeTitle.js
│   │   ├── utils/                    # Headers & parsing utilities
│   │   │   ├── headers.js
│   │   │   └── parser.js
│   │   └── index.js
│   ├── package.json
│   └── index.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **npm** or **pnpm**
- **Expo Go** mobile app (optional, for physical device testing)

### 2. Backend Setup
```bash
cd server
npm install
nodemon index.js
# Server starts on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
npm install
npx expo start
```
- Press `w` to open in browser.
- Scan the QR code in the Expo Go app on your phone.

---

## 📄 License
MIT
