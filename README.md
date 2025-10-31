# Bogsila (Expo + React Native)

**Bogsila** is a modern, full-stack fashion e-commerce mobile application designed to provide users with a seamless shopping experience. Built with cutting-edge technologies, the app offers a complete online shopping platform with product browsing, shopping cart management, secure payments, and user account features.

## Description

Bogsila is a premium fashion e-commerce mobile app that allows users to browse, search, and purchase fashion products including shirts, t-shirts, bottoms, co-ords, and exclusive collections. The app features a sleek dark-themed user interface with intuitive navigation, making it easy for users to discover and purchase their favorite fashion items.

The application includes comprehensive e-commerce functionality including user authentication, product catalog management, shopping cart with size selection, favorites system, secure payment integration via Razorpay, cash on delivery options, order history tracking, and profile management with address handling. Built with React Native and Expo for cross-platform compatibility, the app delivers a native-like experience on both iOS and Android devices.

**Key Highlights:**
- Full-featured e-commerce shopping experience
- Secure payment processing with Razorpay integration
- User authentication and profile management
- Real-time product search and filtering
- Shopping cart and favorites functionality
- Order history and tracking
- Modern dark theme UI/UX design
- Cloud-based image management with Cloudinary
- Scalable MongoDB Atlas database backend

## Features

### User Experience
- **Modern Dark Theme UI**: Sleek black theme with centered Bogsila logo on all screens
- **Intuitive Navigation**: Drawer menu and bottom navigation bar for easy access to all sections
- **Hero Banner**: Eye-catching homepage banner showcasing featured products
- **Collection Grid**: Browse products by categories (Shirts, Tees, Bottoms, Co-ords, Exclusives)
- **Product Search**: Quick search functionality to find products by name, category, or description
- **Product Details**: Comprehensive product pages with image galleries, size selection, pricing, and descriptions

### Shopping Features
- **Shopping Cart**: Add products to cart with size selection and quantity management
- **Favorites System**: Save favorite products for quick access later
- **User Authentication**: Secure login/registration with JWT token-based authentication
- **User Profile**: Manage personal information, addresses, and account settings
- **Order History**: View past orders and track order status

### Payment & Checkout
- **Secure Payment Integration**: Razorpay payment gateway for online transactions
- **Cash on Delivery**: Option for COD payment method
- **Address Management**: Save and manage multiple delivery addresses
- **Order Management**: Complete checkout flow with order confirmation

### Performance
- **Fast Loading**: Optimized API calls and image loading for quick page loads
- **Smooth Scrolling**: Performance-optimized FlatLists for seamless browsing
- **Offline Support**: Favorite products and cart items saved locally

## Tech Stack

### Frontend
- **Expo** - React Native framework for mobile app development
- **React Native** - Cross-platform mobile app framework
- **TypeScript** - Type-safe JavaScript for better code quality
- **NativeWind/TailwindCSS** - Utility-first CSS framework for styling
- **React Navigation** - Navigation library (Drawer + Native Stack)
- **React Native Reanimated** - Smooth animations and gestures
- **React Native Safe Area Context** - Safe area handling for different screen sizes
- **AsyncStorage** - Local data persistence for cart and user preferences
- **Expo Vector Icons** - Icon library (Ionicons)

### Backend
- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Web application framework for Node.js
- **MongoDB Atlas** - Cloud-hosted NoSQL database
- **Mongoose** - MongoDB object modeling for Node.js
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing for secure authentication
- **dotenv** - Environment variable management

### Services & APIs
- **Cloudinary** - Cloud-based image and video management service
- **Razorpay** - Payment gateway integration for online transactions
- **Render.com** - Cloud hosting platform for backend deployment
- **EAS (Expo Application Services)** - Build and deployment service for Expo apps

### Development Tools
- **EAS Build** - Cloud build service for iOS and Android apps
- **EAS Update** - Over-the-air updates for Expo apps
- **Metro Bundler** - JavaScript bundler for React Native
- **ESLint** - Code linting and quality checking
- **Prettier** - Code formatting tool

## How Clients Can Access the App

### QR Code Scanner
Scan this QR code with Expo Go to access the app:

![Bogsila QR Code](./assest/qr.webp)

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

## How the App Works

### Getting Started
1. **Install Expo Go**: Download Expo Go app from your device's app store
2. **Scan QR Code**: Use the QR code provided to connect to the app
3. **Browse Products**: Navigate through categories using the drawer menu or collection grid on the homepage

### Shopping Flow
1. **Browse & Search**: 
   - View all products or filter by category (Shirts, Tees, Bottoms, Co-ords, Exclusives)
   - Use the search feature to find specific products
   - Browse featured products on the homepage

2. **Product Selection**:
   - Tap on any product to view details
   - View product images, description, and pricing
   - Select size (S, M, L, XL) before adding to cart

3. **Add to Cart or Favorites**:
   - Add products to cart with size and quantity
   - Save products to favorites for later
   - Manage cart items with quantity adjustments

4. **Checkout Process**:
   - Review cart items and totals
   - Select or add delivery address
   - Choose payment method (Online Payment via Razorpay or Cash on Delivery)
   - Complete payment and receive order confirmation

### Account Management
- **Sign Up/Login**: Create an account or log in with existing credentials
- **Profile**: Update personal information, phone number, and profile picture
- **Addresses**: Add, edit, or delete delivery addresses
- **Orders**: View order history and track order status
- **Favorites**: Access saved favorite products anytime

### Key Interactions
- **Bottom Navigation**: Quick access to Home, Search, Favorites, Profile, and Cart
- **Drawer Menu**: Access all product categories and app sections
- **Product Cards**: Tap to view details, swipe through image galleries
- **Pull to Refresh**: Refresh product lists by pulling down
- **Search**: Real-time search across all products

## Setup

### Prerequisites
- **Node.js** (v18 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **Expo CLI** - Install globally: `npm install -g @expo/cli`
- **MongoDB Atlas Account** - [Sign up for MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Cloudinary Account** - [Sign up for Cloudinary](https://cloudinary.com/)
- **Razorpay Account** - [Sign up for Razorpay](https://razorpay.com/)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** in the `backend` directory:
   ```env
   # MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bogsila
   MONGODB_DB=bogsila
   MONGODB_PRODUCTS_COLLECTION=All_products
   MONGODB_ORDERS_COLLECTION=orders

   # JWT Authentication
   JWT_ACCESS_SECRET=your_access_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   TOKEN_EXP=15m
   REFRESH_EXP=7d

   # Razorpay
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_secret_key
   RAZORPAY_CURRENCY=INR
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

   # Cloudinary (if using)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Server
   PORT=3001
   ```

4. **Start the backend server**
   ```bash
   npm start
   # or
   node server.js
   ```

5. **Verify backend is running**
   - Health check: `GET http://localhost:3001/health`
   - Database ping: `GET http://localhost:3001/db-ping`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd my-expo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint** in `config/api.ts`:
   ```typescript
   // For local development
   export const BASE_URL = 'http://localhost:3001';
   
   // For deployed backend
   // export const BASE_URL = 'https://bogsila-backend.onrender.com';
   
   // For testing on physical device (replace with your computer's IP)
   // export const BASE_URL = 'http://192.168.1.100:3001';
   ```

4. **Start the Expo development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

5. **Run on device/emulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

### Database Collections Setup

Ensure these collections exist in your MongoDB Atlas database:
- `All_products` - Main product catalog
- `Bottoms` - Bottom wear products
- `Shirts` - Shirt products
- `tshirts` - T-shirt products
- `coord` - Co-ord sets
- `users` - User accounts (created automatically)
- `orders` - Order history (created automatically)

### Testing the Setup

1. **Backend health check**: Visit `http://localhost:3001/health`
2. **Frontend**: Scan QR code from terminal with Expo Go
3. **Test API**: `GET http://localhost:3001/api/products?limit=20`

## Notes
- Images live in `assest/` (current folder name).
- Product detail requires selecting a size before Add to Cart/Buy Now.

## Troubleshooting
- Empty results: verify DB `bogsila` and collection names (case-sensitive) and your `.env`.
- Connection from device: use LAN IP instead of localhost.

License: ISC
