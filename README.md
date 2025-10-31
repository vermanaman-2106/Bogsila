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

## How Clients Can Access the App

### QR Code Scanner
Scan this QR code with Expo Go to access the app:

```
[QR CODE WILL BE PASTED HERE]
```

---

### Step 1: Install Expo Go App
- **Android**: Download [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) from Google Play Store
- **iOS**: Download [Expo Go](https://apps.apple.com/app/expo-go/id982107779) from App Store

### Step 2: Scan QR Code
You will receive a QR code from the developer. Use one of these methods to scan it:

**On Android:**
1. Open the Expo Go app
2. Tap "Scan QR Code"
3. Point your camera at the QR code
4. The app will load automatically

**On iPhone:**
1. Open the Camera app (built-in iPhone camera)
2. Point it at the QR code
3. Tap the notification that appears
4. The app will open in Expo Go

### Step 3: Wait for App to Load
- First time loading takes about 30 seconds
- The Bogsila app will appear on your phone
- You can now browse and shop!

### Alternative: Enter URL Manually
If you have a URL (like `exp://192.168.1.100:8081`):
1. Open Expo Go app
2. Tap "Enter URL manually"
3. Paste the URL you received
4. Tap "Connect"

### Troubleshooting
- **Can't scan QR code?** Make sure your phone has camera permissions enabled
- **App won't load?** Check your internet connection and try again
- **Need help?** Contact the developer for support

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
