# 💻 Frontend Documentation — Goblin Basket (Tomato Code)

Welcome to the **Frontend** documentation for Goblin Basket, a food delivery platform built with **React 19, TypeScript, Vite, Tailwind CSS**, and **Socket.io-client**.

---

## 🏗️ Architecture & Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript (`.tsx`, `.ts`)
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **State Management & Context**:
  - `AppContext.tsx`: Handles authentication state (`token`, `user`), user role selection (`customer`, `seller`, `rider`, `admin`), active orders, and shopping cart.
  - `SocketContext.tsx`: Manages persistent WebSocket connection to the Realtime microservice via `socket.io-client`.
- **Mapping & Geolocation**: Leaflet & React-Leaflet with OpenStreetMap tiles.
- **Payments**: Razorpay Checkout SDK & Stripe Elements integration.
- **Routing**: React Router (`react-router-dom`) with `protectedRote.tsx` and `publicRoute.tsx`.

---

## 📁 Directory Structure

```
frontend/
├── public/                 # Static assets (favicon.ico, favicon.png, logo.png, vite.svg)
├── src/
│   ├── assets/             # Audio alert files (faaah.mp3, quack.mp3)
│   ├── components/         # Reusable modular UI components
│   │   ├── AddMenuItem.tsx          # Form for restaurant sellers to add menu items
│   │   ├── AddRestaurant.tsx        # Restaurant creation and GPS onboarding
│   │   ├── AdminRestaurantCard.tsx  # Admin approval & verification card
│   │   ├── ConnectionStatus.tsx     # Socket.io connection pill (Connected / Disconnected)
│   │   ├── MenuItems.tsx            # Restaurant food item list with edit/delete
│   │   ├── navbar.tsx               # Responsive navigation bar with role switcher
│   │   ├── OrderCard.tsx            # Order summary card for customers
│   │   ├── RestaurantOrders.tsx     # Real-time incoming order dashboard for restaurants
│   │   ├── RestaurantProfile.tsx    # Seller profile settings & location updater
│   │   ├── RiderAdmin.tsx           # Rider status management
│   │   ├── RiderCurrentOrder.tsx    # Active delivery tracker for riders
│   │   ├── RiderOrderMap.tsx        # Live GPS routing map for riders
│   │   ├── RiderOrderRequest.tsx    # Incoming order alert modal with sound
│   │   ├── UserOrderMap.tsx         # Live delivery tracker map for customers
│   │   ├── protectedRote.tsx        # Protected route wrapper (Auth required)
│   │   └── publicRoute.tsx          # Public route wrapper (Guest only)
│   ├── context/
│   │   ├── AppContext.tsx           # Global app context (Cart, Auth, User data)
│   │   └── SocketContext.tsx        # WebSocket client provider
│   ├── pages/
│   │   ├── Account.tsx              # User profile & logout
│   │   ├── Address.tsx              # Customer delivery address manager (GPS + manual)
│   │   ├── Admin.tsx                # Admin dashboard (approve restaurants, verify riders)
│   │   ├── Cart.tsx                 # Cart view with quantity adjustment & pricing
│   │   ├── Checkout.tsx             # Payment checkout (Razorpay & Stripe integration)
│   │   ├── Home.tsx                 # Homepage listing restaurants & popular dishes
│   │   ├── Login.tsx                # Google OAuth & Email/Password login
│   │   ├── OrderPage.tsx            # Single order details & status timeline
│   │   ├── Orders.tsx               # Order history list
│   │   ├── OrderSuccess.tsx         # Post-order placement confirmation
│   │   ├── PaymentSuccess.tsx       # Post-payment callback page
│   │   ├── Restaurant.tsx           # Seller dashboard (menu, orders, profile)
│   │   ├── RestaurantPage.tsx       # Customer view of single restaurant menu
│   │   ├── RiderDashboard.tsx       # Rider hub (toggle online, accept deliveries)
│   │   └── SelectRole.tsx           # Switch active mode (Customer / Seller / Rider / Admin)
│   ├── types.ts                     # TypeScript interface definitions
│   ├── App.tsx                      # Main router definitions
│   └── main.tsx                     # Entry point, environment variables export, root render
├── .env                             # Frontend environment variables
├── .env.example                     # Sample environment variable template
├── package.json                     # Dependencies & scripts
└── vite.config.ts                   # Vite configuration
```

---

## ⚙️ Environment Variables (`.env`)

The frontend reads configuration through Vite's `import.meta.env`:

| Variable | Description | Default Local Value |
| :--- | :--- | :--- |
| `VITE_AUTH_SERVICE` | URL of the Auth microservice | `http://localhost:5000` |
| `VITE_RESTAURANT_SERVICE` | URL of the Restaurant microservice | `http://localhost:5001` |
| `VITE_UTILS_SERVICE` | URL of the Utils microservice (Payments/Cloudinary) | `http://localhost:5002` |
| `VITE_REALTIME_SERVICE` | URL of the Realtime microservice (Socket.io) | `http://localhost:5004` |
| `VITE_RIDER_SERVICE` | URL of the Rider microservice | `http://localhost:5005` |
| `VITE_ADMIN_SERVICE` | URL of the Admin microservice | `http://localhost:5006` |
| `VITE_STRIPE_PUBLISHABLE_KEY`| Stripe publishable API key | `pk_test_...` |
| `VITE_INTERNAL_SERVICE_KEY` | Shared secret header for cross-service calls | Internal security string |

---

## 🏃 Running the Frontend

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```
Starts development server on [http://localhost:5173](http://localhost:5173).

### 3. Build for Production
```bash
npm run build
```
Generates optimized static bundle in `frontend/dist/`.

### 4. Preview Production Build
```bash
npm run preview
```
