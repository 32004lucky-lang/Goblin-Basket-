# 🍅 Tomato Code - Multi-Service Food Delivery System

Welcome to the Tomato Code multi-service application! This project is built using **TypeScript, Node.js (Express), React (Vite)**, with **MongoDB** as the database and **RabbitMQ** as the message broker.

We have added tools to automate the setup and run all 7 services (Frontend + 6 Backend services) concurrently with a single command.

---

## 🛠️ Prerequisites

Before you start, make sure you have the following installed:
1. **Node.js** (v22 or higher) & **npm**
2. **Python** (v3.8 or higher) (used for orchestration)
3. **Docker Desktop** (used to run MongoDB and RabbitMQ easily)

---

## 🚀 Quick Start (Recommended)

The easiest way to configure, bootstrap, and run the entire application is using the custom Python manager.

### Step 1: Install Python Orchestrator Dependencies
Install the required packages for the Python runner:
```bash
pip install -r requirements.txt
```

### Step 2: Spin Up & Run Everything
Run the manager script:
```bash
python run.py
```

**What the Python runner does for you:**
1. **Validates Environment**: Checks that `node`, `npm`, and `docker` are available.
2. **Auto-Configures `.env`**: Replaces placeholder `your_mongo_Db_url` values with your local MongoDB container URI (`mongodb://localhost:27017/Zomato_Clone`) if you haven't set them up yet.
3. **Launches Databases**: Automatically runs `docker compose up -d` to spin up MongoDB and RabbitMQ.
4. **Bootstraps Packages**: Installs node modules recursively in all services if missing.
5. **Concurrent Execution**: Launches the 6 backend services and the frontend simultaneously in a single terminal.
6. **Unified Logs**: Color-codes and prefixes all logs (e.g., `[auth]`, `[restaurant]`, `[frontend]`) so you can watch everything interact.
7. **Clean Teardown**: Gracefully shuts down all child processes when you press `Ctrl + C` (avoiding port-conflict issues).

---

## 📦 Alternate Run Options

If you prefer not to use the Python manager, you can use these standard methods:

### Option B: Using npm Scripts
We added scripts at the root level `package.json` to manage services using `concurrently`:

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```
2. **Run databases (MongoDB & RabbitMQ):**
   ```bash
   docker compose up -d
   ```
3. **Run all services (Frontend & Backends):**
   ```bash
   npm run dev:all
   ```
4. **Run backends only:**
   ```bash
   npm run dev:services
   ```

### Option C: Manual Launch (7 Terminals)
You can run each service individually inside its folder:
```bash
# Databases
docker compose up -d

# Frontend
cd frontend && npm install && npm run dev

# Backend Services (run npm install && npm run dev in each folder):
cd services/auth
cd services/restaurant
cd services/utils
cd services/realtime
cd services/rider
cd services/admin
```

---

## 🌐 Port Mapping & Services

| Service | Folder | Local URL | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | `/frontend` | `http://localhost:5173` | React/Vite customer dashboard |
| **Auth Service** | `/services/auth` | `http://localhost:5000` | Google Login & JWT Authentication |
| **Restaurant Service** | `/services/restaurant` | `http://localhost:5001` | Menu and Order placements |
| **Utils Service** | `/services/utils` | `http://localhost:5002` | Stripe payments & Cloudinary uploads |
| **Realtime Service** | `/services/realtime` | `http://localhost:5004` | WebSockets connection for live updates |
| **Rider Service** | `/services/rider` | `http://localhost:5005` | Delivery rider status and tracking |
| **Admin Service** | `/services/admin` | `http://localhost:5006` | Administrative metrics and setup |
| **RabbitMQ Web UI** | *Docker* | `http://localhost:15672` | Message broker manager (User: `admin` / Pass: `admin123`) |
| **MongoDB** | *Docker* | `mongodb://localhost:27017` | Local Database (Database: `Zomato_Clone`) |

---

## 🔑 External API Configuration (Optional)
To use payment gateways, social login, and image uploads, configure the corresponding credentials in the service `.env` files:
- **Google OAuth**: Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `services/auth/.env` and `main.tsx` on the frontend.
- **Stripe**: Set `STRIPE_SECRET_KEY` in `services/utils/.env` and publishable key in `frontend/.env`.
- **Razorpay**: Set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` in `services/utils/.env`.
- **Cloudinary**: Set `CLOUD_NAME`, `CLOUD_API_KEY`, and `CLOUD_SECRET_KEY` in `services/utils/.env`.
