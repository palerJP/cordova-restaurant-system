# Cordova Eats — Municipal Restaurant Discovery & Recommendation System

A modern restaurant discovery, recommendation, and municipal business management platform tailored for the Municipality of Cordova, Cebu.

---

## 📌 Implementation Summary & System Reminders (Sept 7, 2026)

### 1. 🔍 Unified AI Smart Search in Home Page
- **Integrated Search Experience**: Unified the natural language AI semantic search directly into the main Home search bar (`frontend/src/app/page.tsx`).
- **Real-Time Dynamic Filtering**: Users can seamlessly combine AI keyword search with quick cuisine / category chips (`Cafe`, `Restaurant`, `Fast Food`, `Street Food`, `Resto Bar`, `Pizza`).
- **Cleaned Navigation**: Removed redundant standalone AI Search navigation links from the top navbar.

### 2. 🍽️ Restaurant Directory & Business Verification Auto-Sync
- **26 Verified Establishments**: Maintained and organized all 26 verified Cordova restaurants in [`frontend/src/data/restaurants.ts`](file:///c:/Users/Hp/Desktop/CordovaEATs/cordova-restaurant-system/cordova-restaurant-system/frontend/src/data/restaurants.ts) with standardized numbering, slugs, and complete metadata.
- **Automated Frontend Sync (`restaurantSync.service.js`)**: When an admin verifies a new business, it is automatically synchronized into `restaurants.ts` and PostgreSQL without duplicate keys or loss of existing entries.
- **Logo & Photo Registration**: Full backend and frontend support for business logo, cover photo URLs, and multi-photo galleries during business registration.

### 3. ⭐ User Taste Preferences & Personalized Recommendations
- **Embedded in Profile (`/profile#taste-preferences`)**: Integrated full Dining & Taste Preferences management inside the User Profile (`frontend/src/app/profile/page.tsx`), featuring:
  - Multi-select Preferred Cuisines
  - Dietary requirements (Halal, Vegetarian, Vegan, Gluten-Free, Dairy-Free)
  - Preferred Price Range tiers (Budget ₱, Moderate ₱₱, Upscale ₱₱₱, Fine Dining ₱₱₱₱)
  - Preferred Amenities & Atmosphere (WiFi, Parking, Pet Friendly, Al Fresco, Ocean View, Live Music)
  - Proximity radius slider (1 km – 20 km)
- **Home Carousel ("Recommended For You")**: Swipeable, horizontally scrollable recommendation section on the Home page ranked dynamically by user preferences with direct link to adjust preferences in profile.

### 4. 🎨 UI & Layout Polishing
- **Explore & Recommendation Rules**: "Recommended For You" section displays when logged in or signed up; unauthenticated users are guided with a sign-in prompt.
- **Footer Centering**: Centered copyright text: `"© 2026 Cordova Eats — Municipality of Cordova, Cebu. All rights reserved."`
- **Original Photo Display**: Preserved and restored the exact original cover photos for all 27 establishments across frontend, sync scripts, and PostgreSQL database without aggressive fallback overrides.

---

## 🚀 Local Development Guide

### 1. Start Database (PostgreSQL)
```bash
# Using Docker Compose (recommended):
cd cordova-restaurant-system
docker-compose up -d

# Or create DB locally:
createdb cordova_restaurants
```

### 2. Backend Setup
```bash
cd cordova-restaurant-system/backend
npm install
npm run db:migrate
npm run db:seed
npm run dev
```
Backend runs at `http://localhost:4000` (API documentation at `http://localhost:4000/api-docs`).

### 3. Frontend Setup
```bash
cd cordova-restaurant-system/frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`.

### 4. Useful Scripts
- **Synchronize Database & Directory**:
  ```bash
  cd cordova-restaurant-system/backend
  node src/scripts/sync-all-to-restaurants-ts.js
  ```
- **Run Backend Tests**:
  ```bash
  cd cordova-restaurant-system/backend
  npm test
  ```
- **Type-check Frontend**:
  ```bash
  cd cordova-restaurant-system/frontend
  npx tsc --noEmit
  ```

