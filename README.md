# E-commerce Full Stack (React + Spring Boot + MongoDB + Gemini)

This project is a full-stack e-commerce demo with:
- React + Vite frontend
- Java Spring Boot backend
- MongoDB database
- Gemini-powered chatbot restricted to e-commerce topics

## Features

- Product browsing with category/search filter
- Budget guard with hard-block when cart actions exceed budget
- Cart, wishlist, order placement, and order tracking
- Voice search support (browser dependent)
- Floating chatbot popup for e-commerce assistance and product recommendations
- Toast notifications for key actions and validations

## Project Structure

- `frontend/` React app
- `backend/` Spring Boot API
- `backend/start-backend.cmd` backend start script
- `backend/stop-backend.ps1` backend stop script
- `install-java.bat` Java installer helper script (Windows)

## Prerequisites

- Windows PowerShell
- Node.js 18+ and npm
- Java 17+
- Maven 3.9+
- MongoDB 6+ (local or remote)
- Gemini API key

## 1) Install Java (separate batch script)

From project root:

```powershell
.\install-java.bat
```

This script installs Java 17 with Scoop (if needed), sets `JAVA_HOME` (user env), and validates Java.

After script completes, close and reopen terminal.

## 2) Backend Environment Setup

Create backend env values (PowerShell):

```powershell
$env:MONGODB_URI="mongodb://localhost:27017/ecommerce"
$env:GEMINI_API_KEY="your_gemini_api_key"
$env:GEMINI_MODEL="gemini-1.5-flash"
$env:FRONTEND_ORIGIN="http://localhost:5173"
$env:SERVER_PORT="8080"
```

Reference template:
- `backend/.env.example`

## 3) Start MongoDB

If installed via Scoop:

```powershell
mongod --config "$env:USERPROFILE\scoop\apps\mongodb\current\bin\mongod.cfg"
```

Keep this terminal open.

## 4) Start Backend

In a new terminal:

```powershell
cd backend
.\start-backend.cmd
```

Backend runs on `http://localhost:8080`.

Stop backend:

```powershell
powershell -ExecutionPolicy Bypass -File .\stop-backend.ps1
```

## 5) Frontend Environment Setup

Optional env values in `frontend/.env`:

```env
VITE_API_BASE_URL=
VITE_DEV_API_TARGET=http://localhost:8080
```

- Keep `VITE_API_BASE_URL` empty for same-origin/proxy behavior in local dev.

## 6) Start Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## 7) Build Commands

Frontend production build:

```powershell
cd frontend
npm run build
```

Backend package:

```powershell
cd backend
mvn -DskipTests package
```

## 8) Insert Mock Database Data

Mock datasets are available in the `database/` folder.

Import all mock collections in one command:

```powershell
.\database\import-mock-data.cmd
```

Use custom URI if required:

```powershell
.\database\import-mock-data.cmd "mongodb://localhost:27017/ecommerce"
```

Collections imported:
- `products`
- `cart_items`
- `wishlist_items`
- `orders`

More details:
- `database/README.md`

## API Endpoints

### Products
- `GET /api/products?search=&category=All`

### Cart
- `GET /api/cart?sessionId=<sessionId>`
- `POST /api/cart/items`
- `DELETE /api/cart/items/{productId}?sessionId=<sessionId>`

### Wishlist
- `GET /api/wishlist?sessionId=<sessionId>`
- `POST /api/wishlist/items`
- `DELETE /api/wishlist/items/{productId}?sessionId=<sessionId>`

### Orders
- `GET /api/orders?sessionId=<sessionId>`
- `POST /api/orders`
- `GET /api/orders/track/{orderId}?sessionId=<sessionId>`

### Chatbot
- `POST /api/chat`
- restricted to e-commerce domain for this app
- includes in-catalog product recommendation context

## Troubleshooting

- `mvn is not recognized`: verify Java installed and `JAVA_HOME` set, reopen terminal.
- `Failed to connect MongoDB`: verify `mongod` is running and `MONGODB_URI` is correct.
- `CORS error`: set `FRONTEND_ORIGIN=http://localhost:5173` for backend.
- Chatbot API key error: set `GEMINI_API_KEY` before backend start.

## Production Notes

Current app is production-oriented in structure, but before real production rollout add:
- real authentication (JWT/session + hashed passwords in DB)
- role-based authorization
- HTTPS and secret manager integration
- API rate limiting and observability (metrics/log tracing)
- CI/CD and containerized deployment
