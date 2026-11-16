# ⚠️ Issues, Bugs, and Error Catalog — Goblin Basket (Tomato Code)

> **Notice**: This document catalogues known bugs, configuration mismatches, edge-case failures, and architectural issues currently present in the codebase. As requested, these issues are documented here for developers and users to inspect, understand, and reproduce without silent modifications.

---

## 🛑 1. Deployment & Network Issues

### Issue 1.1: Render Microservices 404 / "Not Found" on Root (`/`)
- **Symptoms**: Opening backend Render URLs (e.g., `https://goblin-basket-auth.onrender.com`) in a web browser shows `Not Found` or `Cannot GET /`.
- **Root Cause**:
  - Express microservices (`auth`, `restaurant`, `rider`, `utils`, `realtime`) are purely headless REST APIs.
  - While health checks exist at `GET /`, if a service spins down due to Render's free tier inactivity, Render returns a native `404 Not Found` page or takes 50–90 seconds to wake up (cold start).
  - Furthermore, if Render auto-generated a unique suffix (e.g. `goblin-basket-auth-8x2a.onrender.com`), requests to the hardcoded default URL will fail to resolve.

### Issue 1.2: Hardcoded Localhost Fallbacks in Frontend
- **File**: `frontend/src/main.tsx` (Lines 9–14)
- **Code**:
  ```ts
  export const authService = import.meta.env.VITE_AUTH_SERVICE || "http://localhost:5000";
  export const restaurantService = import.meta.env.VITE_RESTAURANT_SERVICE || "http://localhost:5001";
  export const utilsService = import.meta.env.VITE_UTILS_SERVICE || "http://localhost:5002";
  export const realtimeService = import.meta.env.VITE_REALTIME_SERVICE || "http://localhost:5004";
  export const riderService = import.meta.env.VITE_RIDER_SERVICE || "http://localhost:5005";
  export const adminService = import.meta.env.VITE_ADMIN_SERVICE || "http://localhost:5006";
  ```
- **Problem**:
  If the frontend is built or deployed without setting explicit `VITE_*` environment variables in the hosting dashboard (e.g. Vercel, Netlify, or Render), it falls back to `localhost:500X`. In production, browser network requests will attempt to reach `http://localhost:5000` on the visitor's local machine, causing instant `ERR_CONNECTION_REFUSED` errors.

### Issue 1.3: Unused Root Test Script Causing Confusion
- **File**: `c:\Users\ASUS\OneDrive\Desktop\tomato-code\backend_server.py`
- **Problem**:
  A basic Python `http.server` listening on port `8000` exists in the root directory alongside `index.html`. This file is completely separate from the actual Node.js microservices inside `tomato-code/services`. Launching this script only serves a static "Hello from your Local Backend!" HTML page and does not communicate with the food delivery application.

---

## 🔌 2. WebSocket & Realtime Issues

### Issue 2.1: Disconnected Status Badge When User is Not Logged In
- **File**: `frontend/src/context/SocketContext.tsx` (Lines 28–36)
- **Code**:
  ```ts
  useEffect(() => {
    if (!isAuth) {
      if (socketInstance) {
        socketInstance.disconnect();
        setSocketInstance(null);
        setIsConnected(false);
      }
      return;
    }
    // ... connect socket
  }, [isAuth]);
  ```
- **Symptoms**: The floating badge in the bottom-right corner displays `Disconnected` (orange) on the home page even when backend services are active.
- **Root Cause**: The socket deliberately only connects if `isAuth` is `true`. Guests and unauthenticated visitors will always see "Disconnected" until they log in.

### Issue 2.2: Missing CORS Origins for WebSockets in Production
- **File**: `services/realtime/src/socket.ts`
- **Problem**:
  Socket.IO CORS origin settings must explicitly whitelist the deployed frontend URL (e.g. `https://goblin-basket-frontend.onrender.com` or custom Vercel domains). If the origin does not match or credentials are required, browsers block the WebSocket handshake with a CORS preflight failure:
  `Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy`.

---

## 💳 3. Payment Gateway Configuration Issues

### Issue 3.1: Placeholder Payment Keys Crash Checkout
- **Files**:
  - `tomato-code/frontend/src/pages/Checkout.tsx`
  - `tomato-code/services/utils/src/config/razorpay.ts`
  - `tomato-code/services/utils/src/config/verifyRazorpay.ts`
  - `tomato-code/services/utils/.env`
- **Problem**:
  The environment variables default to placeholder strings:
  ```env
  RAZORPAY_KEY_ID=your_razorpay_key
  RAZORPAY_KEY_SECRET=your_razorpay_secret
  STRIPE_SECRET_KEY=sk_test_placeholder
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
  ```
  Attempting to pay via Razorpay or Stripe without replacing these with valid test keys triggers:
  - Razorpay: `Authentication failed` popup or `Invalid API Key`.
  - Stripe: `Error: The Provided Stripe Key Is Invalid`.

### Issue 3.2: Missing Webhook Secret Verification for Webhook Calls
- **File**: `services/utils/src/controllers/payment.ts`
- **Problem**:
  In Razorpay verification, raw body payload verification is required for signature calculation. If JSON parser middleware strips or mutates the raw payload string, signature verification throws a cryptographic mismatch error (`Razorpay verification failed`).

---

## 🐰 4. Message Broker (RabbitMQ) Issues

### Issue 4.1: Microservice Startup Crash When RabbitMQ is Unreachable
- **Files**:
  - `services/restaurant/src/index.ts` (Line 15: `await connectRabbitMQ();`)
  - `services/rider/src/index.ts`
  - `services/utils/src/index.ts`
- **Symptoms**: Microservices fail to start with `Error: connect ECONNREFUSED 127.0.0.1:5672`.
- **Root Cause**:
  `await connectRabbitMQ()` is called at the top level before Express starts listening. If RabbitMQ is not running locally (via Docker) or if the CloudAMQP URL has expired/rate-limited, the entire Node process terminates immediately with an unhandled rejection.

### Issue 4.2: Shared Queue Message Consumption Overlapping
- **File**: `services/rider/src/config/orderReady.consumer.ts`
- **Problem**:
  If multiple instances of the rider service or test workers subscribe to `order_ready_queue` without distinct consumer tags or idempotency checks, messages can be acknowledged and consumed by one instance while another rider misses the alert.

---

## 🗄️ 5. Database & Seeding Issues

### Issue 5.1: Database Connection Timeouts on Cloud MongoDB
- **Files**: `services/*/src/config/db.ts`
- **Code**:
  ```env
  MONGO_URI=mongodb+srv://32004lucky_db_user:<YOUR_MONGODB_PASSWORD>@cluster0.c3ernby.mongodb.net/goblin_basket?retryWrites=true&w=majority
  ```
- **Problem**:
  If the database password contains special characters (`@`, `:`, `#`, `%`) that are not URL-encoded, Mongoose throws a `URIError: URI malformed`. Additionally, if Network Access in MongoDB Atlas does not whitelist `0.0.0.0/0`, connections from Render or local machines are denied with `MongooseServerSelectionError: connection timed out`.

### Issue 5.2: Inconsistent Database Names in Microservices
- **Problem**:
  Some services default to `mongodb://localhost:27017/Zomato_Clone` while others look for `goblin_basket`. If different services read and write to different database names, user authentication, restaurant menus, and order records will not synchronize.

---

## 🔊 6. Browser Audio Autoplay Restrictions

### Issue 6.1: Audio Notification Errors (`Uncaught DOMException: play() failed`)
- **Files**:
  - `frontend/src/components/RestaurantOrders.tsx` (Lines 18–25)
  - `frontend/src/components/RiderOrderRequest.tsx`
- **Problem**:
  Modern browsers (Chrome, Edge, Safari) prohibit audio files (`quack.mp3`, `faaah.mp3`) from playing automatically before the user has performed at least one user-gesture interaction (click/tap) on the page. If a notification arrives while the window is inactive, the console outputs:
  `NotAllowedError: play() failed because the user didn't interact with the document first.`

---

## 📋 Summary Table of Issues

| ID | Category | Severity | File / Service | Impact |
| :--- | :--- | :--- | :--- | :--- |
| **1.1** | Deployment | High | Render Services | 404 on root URLs / Cold starts |
| **1.2** | Frontend | High | `frontend/src/main.tsx` | Production API calls default to `localhost` |
| **1.3** | Architecture | Low | `backend_server.py` | Fake test server causes confusion |
| **2.1** | Realtime | Medium | `frontend/src/context/SocketContext.tsx` | "Disconnected" badge shown for guests |
| **2.2** | Realtime | Medium | `services/realtime/src/socket.ts` | CORS failure across different domains |
| **3.1** | Payments | High | `services/utils/.env` & `Checkout.tsx` | Checkout fails with invalid API key errors |
| **4.1** | Broker | Critical | `services/restaurant/src/index.ts` | Backend crashes if RabbitMQ is unavailable |
| **5.1** | Database | High | `services/*/src/config/db.ts` | Atlas IP whitelist block or URI encoding failure |
| **6.1** | UI / Audio | Low | `RestaurantOrders.tsx` | Autoplay policy blocks incoming order sounds |
