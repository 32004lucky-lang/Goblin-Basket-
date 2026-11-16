# ⚙️ Backend Documentation — Goblin Basket (Tomato Code)

Welcome to the **Backend Architecture** documentation for Goblin Basket. The backend is designed as an event-driven **Node.js/Express + TypeScript** microservices ecosystem backed by **MongoDB** databases and an asynchronous **RabbitMQ** message broker.

---

## 🏛️ System Architecture

```
                       ┌─────────────────────────┐
                       │    Frontend (React)     │
                       └────────────┬────────────┘
                                    │ HTTP / REST & WebSockets
        ┌──────────────┬────────────┼─────────────┬─────────────┬─────────────┐
        ▼              ▼            ▼             ▼             ▼             ▼
┌──────────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│ Auth Service │ │Restaurant │ │  Utils    │ │ Realtime  │ │  Rider    │ │  Admin    │
│  (Port 5000) │ │(Port 5001)│ │(Port 5002)│ │(Port 5004)│ │(Port 5005)│ │(Port 5006)│
└───────┬──────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
        │              │             │             │             │             │
        └──────────────┼─────────────┴─────────────┼─────────────┴─────────────┘
                       ▼                           ▼
            ┌──────────────────────┐    ┌─────────────────────┐
            │   MongoDB Database   │    │  RabbitMQ Broker    │
            │   (Zomato_Clone)     │    │  (Async Events)     │
            └──────────────────────┘    └─────────────────────┘
```

---

## 📦 Microservices Breakdown

### 1. Auth Service (`services/auth`) — Port 5000
- **Responsibilities**:
  - User registration, password hashing (`bcrypt`), and login.
  - JWT token generation & verification (`jsonwebtoken`).
  - Google OAuth token verification (`google-auth-library`).
  - User profile management and role assignment (`customer`, `seller`, `rider`, `admin`).
- **Database Collection**: `users`
- **Main Routes**:
  - `POST /api/auth/register` — Register a new account
  - `POST /api/auth/login` — Sign in with email and password
  - `POST /api/auth/google` — Authenticate via Google ID token
  - `GET /api/auth/me` — Fetch current user profile from JWT
  - `POST /api/auth/update-role` — Update user's active role

---

### 2. Restaurant Service (`services/restaurant`) — Port 5001
- **Responsibilities**:
  - Restaurant onboarding, profile details, and geographic location (longitude/latitude).
  - Food menu items management (categories, prices, images, availability).
  - Shopping cart storage and item quantity updates per user.
  - Delivery address management with GPS coordinates.
  - Order placement and lifecycle tracking (`placed`, `accepted`, `cooking`, `ready`, `delivered`).
  - Consumes payment events from RabbitMQ to automatically transition orders to confirmed.
  - Emits `order_ready_queue` events to notify delivery riders.
- **Database Collections**: `restaurants`, `menuitems`, `carts`, `addresses`, `orders`
- **RabbitMQ Integration**:
  - Consumer: Listens on `payment_event` queue to mark orders as paid.
  - Publisher: Emits to `order_ready_queue` when restaurant finishes preparation.

---

### 3. Utils Service (`services/utils`) — Port 5002
- **Responsibilities**:
  - Payment gateway orchestrations:
    - **Razorpay**: Order creation (`POST /api/payment/razorpay/order`) and cryptographic signature verification (`POST /api/payment/razorpay/verify`).
    - **Stripe**: Payment intent creation and session handling.
  - Media Uploads: Image upload pipelines using **Cloudinary** and `multer`.
  - Publishes payment confirmations to RabbitMQ (`payment_event`) so Restaurant service updates order state asynchronously.
- **Main Routes**:
  - `POST /api/payment/razorpay/order` — Create Razorpay order ID
  - `POST /api/payment/razorpay/verify` — Verify HMAC SHA256 signature
  - `POST /api/payment/stripe/create-checkout-session` — Create Stripe session
  - `POST /api/cloudinary/upload` — Upload base64/buffer image to Cloudinary

---

### 4. Realtime Service (`services/realtime`) — Port 5004
- **Responsibilities**:
  - Persistent WebSocket gateway via `socket.io`.
  - Authenticates socket handshakes with user JWT tokens.
  - User rooms: Joins sockets to `user_<userId>` rooms.
  - Internal REST bridge: Exposes `/api/v1/internal/emit` so other backend services can trigger push notifications to specific users or broadcast to riders without direct socket bindings.
- **Events**:
  - `order_update`: Real-time order state change notifications.
  - `rider_assigned`: Alert customer and restaurant that a driver picked up the delivery.
  - `live_location`: Rider GPS coordinate streaming.

---

### 5. Rider Service (`services/rider`) — Port 5005
- **Responsibilities**:
  - Rider onboarding, vehicle verification, and license documentation.
  - Online/Offline status switch.
  - Real-time GPS location streaming.
  - Delivery dispatch: Consumes `order_ready_queue` from RabbitMQ and matches orders to nearby active riders.
  - Order acceptance, pickup confirmation, and delivery fulfillment.
- **Database Collection**: `riders`

---

### 6. Admin Service (`services/admin`) — Port 5006
- **Responsibilities**:
  - Platform-wide administrative dashboard.
  - Restaurant verification and approvals (prevents unverified sellers from receiving orders).
  - Rider document approval and background clearance.
  - Aggregated metrics (total sales, active orders, system user counts).
- **Protected by**: Strict `isAdmin` middleware requiring `role === "admin"`.

---

## 📨 Message Queues (RabbitMQ)

The microservices communicate asynchronously over RabbitMQ:

| Queue Name | Producer | Consumer | Payload / Purpose |
| :--- | :--- | :--- | :--- |
| `payment_event` | `services/utils` | `services/restaurant` | Fired when payment is confirmed; updates order status to `cooking`. |
| `order_ready_queue` | `services/restaurant` | `services/rider` | Fired when kitchen marks order ready; broadcasts delivery request to riders. |
| `rider_queue` | `services/rider` | `services/restaurant` | Fired when a rider accepts an order; links rider ID to the order. |

---

## 🛠️ Environment Configuration

Each service contains a `.env` file. A unified configuration template is available in `render.env` and `render.yaml`:

```env
PORT=5000 (unique per service)
MONGO_URI=mongodb://localhost:27017/Zomato_Clone
RABBITMQ_URL=amqp://localhost:5672
JWT_SEC=your_jwt_secret_key
INTERNAL_SERVICE_KEY=your_internal_service_key
```

---

## 🚀 Running Backend Services

### Method 1: Concurrently via Root Scripts (Recommended)
From the root directory:
```bash
# Start all 6 backend services simultaneously:
npm run dev:services
```

### Method 2: Individual Service Execution
In any service directory (e.g., `services/auth`):
```bash
npm install
npm run dev
```
*(Runs with `tsx watch` for auto-reloading upon TypeScript code changes).*
