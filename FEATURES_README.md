# ✨ Features & Platform Capabilities — Goblin Basket (Tomato Code)

Goblin Basket is a complete food ordering and delivery ecosystem modeled after production platforms like Zomato and Swiggy. It supports **four user roles** with dedicated views and real-time workflows.

---

## 👥 Multi-Role User System

```
                  ┌──────────────────────────────┐
                  │       Single Login           │
                  └──────────────┬───────────────┘
                                 │
         ┌───────────────┬───────┴───────┬───────────────┐
         ▼               ▼               ▼               ▼
   [ Customer ]     [ Seller ]       [ Rider ]       [ Admin ]
```

### 1. 🍽️ Customer Mode
- **Browse & Search**:
  - Filter restaurants by category, rating, delivery time, and cuisines.
  - Interactive dish cards with prices, descriptions, and dietary badges.
- **Cart & Dynamic Pricing**:
  - Add items from multiple menus with quantity increments/decrements.
  - Automatic tax and delivery fee calculations.
- **Address & Geolocation**:
  - Save multiple delivery addresses (Home, Work, Other).
  - One-click GPS location detection using browser Geolocation API.
- **Multi-Gateway Checkout**:
  - **Razorpay**: Direct integration with UPI, Net Banking, and Cards via Razorpay Modal.
  - **Stripe**: Card checkout with Stripe Elements.
  - Cash on Delivery (COD) mode.
- **Live Order Tracking**:
  - Status pipeline: `Placed` ➔ `Confirmed` ➔ `Cooking` ➔ `Ready` ➔ `Out for Delivery` ➔ `Delivered`.
  - Interactive OpenStreetMap (Leaflet) view showing restaurant location, customer pin, and moving rider marker.

---

### 2. 🏪 Restaurant / Seller Mode
- **Restaurant Onboarding**:
  - Register kitchen name, phone, address, and exact coordinates.
  - Upload banner images and restaurant profile pictures.
- **Menu Management**:
  - Add dishes with title, description, category, price, and food photo.
  - Toggle item availability status (In Stock / Out of Stock).
  - Edit pricing and delete retired menu items.
- **Real-time Order Dashboard**:
  - Instant audio alerts (`faaah.mp3` and `quack.mp3`) when a new order arrives.
  - Accept or reject incoming orders.
  - Advance orders through preparation steps (`cooking` ➔ `ready`).
  - Automatic dispatch: Marking order as `ready` triggers an asynchronous RabbitMQ event to search for nearby riders.

---

### 3. 🛵 Delivery Rider Mode
- **Duty Toggle**:
  - Switch between **Online** and **Offline** states.
- **Order Dispatch Modal**:
  - Popup with sound alerts for new delivery requests within the rider's service radius.
  - Displays restaurant pickup location, customer drop-off point, and distance.
  - Single-click Accept / Decline actions.
- **Live GPS Navigation**:
  - Interactive Leaflet map showing full turn-by-turn route from restaurant to customer.
  - Periodic location updates emitted via WebSocket to customer screen.
- **Delivery Fulfillment**:
  - Confirm order pickup from kitchen.
  - Confirm delivery handover with customer.

---

### 4. 🛡️ Admin Portal
- **Restaurant Verification**:
  - Review newly registered restaurants before they appear to customers.
  - Verify seller phone numbers and food licenses.
- **Rider Verification**:
  - Review rider registrations and approve vehicles.
- **Platform Analytics**:
  - Monitor total orders, revenue metrics, active restaurants, and verified riders.

---

## ⚡ Real-Time & Event-Driven Engine

- **WebSockets (Socket.IO)**:
  - Instant state sync between Customer, Kitchen, and Rider dashboards.
  - Visual connection indicator on the frontend:
    - 🟢 **Green ("Connected")**: WebSocket established with Realtime service.
    - 🔴 **Orange ("Disconnected")**: Connection dropped or services offline.
- **Message Queues (RabbitMQ)**:
  - Decoupled asynchronous architecture prevents payment or ordering timeouts.
  - Survives network blips with durable persistent queues.

---

## 🔒 Security & Auth Architecture

- **Token-based Authentication**: Stateless JSON Web Tokens (JWT) signed with HMAC SHA256.
- **Role-Based Access Control (RBAC)**: Backend endpoints protected by role middleware (`isAuth`, `isAdmin`).
- **Google OAuth 2.0**: Integrated client-side and server-side token validation.
- **Cross-Service Authentication**: Internal REST endpoints protected by `x-internal-service-key` headers to prevent unauthorized external calls.
