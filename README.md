# Bogsila (Expo + React Native)

A mobile storefront built with Expo, React Native, NativeWind, and an Express + MongoDB backend.

## Features
- Drawer + Stack navigation (black theme, centered logo)
- Hero banner, Collections grid, Bestsellers banner
- Shared pill-shaped bottom navbar on all key screens
- Category pages fetching from MongoDB collections
- All Products grid and Product Detail with size selector and CTAs

## Tech
- Expo (React Native)
- NativeWind/TailwindCSS
- React Navigation (Drawer + Native Stack)
- Node/Express + MongoDB Driver

## Setup

1) Install deps
```bash
npm install
```

2) Environment (.env in my-expo-app/)
```env
MONGODB_URI=your_atlas_connection_string
MONGODB_DB=bogsila
MONGODB_PRODUCTS_COLLECTION=All_products
PORT=3001
```

3) Start API server
```bash
node server.js
```
- Health: `GET http://localhost:3001/health`
- DB ping: `GET http://localhost:3001/db-ping`
- Products: `GET http://localhost:3001/api/products?limit=20`
- Collections:
  - `GET /api/bottoms`
  - `GET /api/coord`
  - `GET /api/shirts`
  - `GET /api/tshirts`
  - Generic: `GET /api/collection/:key?limit=20` (keys: `all`, `bottoms`, `coord`, `shirts`, `tshirts`)

4) Run the app
```bash
npm run start
# or
npm run ios
npm run android
```
If using a device/emulator, replace `http://localhost:3001` in screens with your machine IP (e.g., `http://192.168.1.x:3001`).

## Structure
```
App.tsx
navigation/RootNavigator.tsx        # Drawer inside Stack
components/BottomNav.tsx            # Shared bottom navbar
screens/
  HomeScreen.tsx                    # Hero, Collections, Bestsellers
  Allproductsscreen.tsx             # All products grid
  ProductDetailScreen.tsx           # Image, price, size selection, CTAs
  BottomsScreen.tsx                 # Category: Bottoms
  CoordScreen.tsx                   # Category: Co-ord
  ShirtsScreen.tsx                  # Category: Shirts
  TeesScreen.tsx                    # Category: T-Shirts
server.js                           # Express API + MongoDB
```

## Notes
- Images live in `assest/` (current folder name).
- Product detail requires selecting a size before Add to Cart/Buy Now.

## Troubleshooting
- Empty results: verify DB `bogsila` and collection names (case-sensitive) and your `.env`.
- Connection from device: use LAN IP instead of localhost.

License: ISC
