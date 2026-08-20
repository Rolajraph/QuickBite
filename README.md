# QuickBite 🍽️

A full-stack food ordering web application connecting customers with local food vendors — built as a capstone project.

**Live app:** [quickbite-frontend-bt6m.onrender.com](https://quickbite-frontend-bt6m.onrender.com)
**API:** [quickbite-backend-bqzt.onrender.com](https://quickbite-backend-bqzt.onrender.com)

Customers can browse a live menu, add items to a cart, check out (including real card payments via Paystack), and track their orders. Vendors (admins) manage the food catalog, categories, and incoming orders through a dedicated dashboard.

## Tech Stack

**Frontend:** React 19, React Router, Axios, Vite, plain CSS (custom design system, light/dark mode)
**Backend:** Node.js, Express 5, MongoDB (Mongoose 9), JWT authentication, bcrypt
**Payments:** Paystack (card payments, server-side verified)
**Image Storage:** Cloudinary
**Validation:** Zod
**Testing:** Node's built-in test runner + Supertest (backend integration tests)
**Hosting:** Render (backend + frontend)

## Features

### Customer
- Browse a live, searchable, filterable, sortable, and paginated menu
- View individual food details with ratings
- Persistent shopping cart (survives page refresh), with toast confirmation on add
- Register / login with JWT-based authentication
- Checkout with Cash on Delivery, Bank Transfer, or real card payment via Paystack
- View order history with toast notifications when an order's status changes
- Profile page
- Light/dark mode toggle

### Admin
- Dashboard with live stats (orders, revenue, customers, foods) and a 7-day revenue chart
- Full CRUD for food items, including real image upload (Cloudinary) and pagination
- Full CRUD for categories, with referential-integrity protection
- Order management with an enforced status workflow (pending → preparing → on the way → delivered / cancelled)
- Role-based access control — admin routes are inaccessible to regular customers

## Project Structure

QuickBite/
├── backend/ # Express REST API
└── frontend/ # React (Vite) client

Each has its own `README.md` with setup-specific notes.

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB instance)
- A Cloudinary account (for image uploads)
- A Paystack account, test mode (for card payments)

### 1. Clone the repo
```bash
git clone https://github.com/Rolajraph/QuickBite.git
cd QuickBite
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```
Fill in `.env` with your real values (MongoDB URI, JWT secret, Cloudinary credentials, Paystack test keys — see `.env.example` for the full list).

Seed the database with sample data:
```bash
npm run seed
```

Start the server:
```bash
npm run dev
```
Backend runs on `http://localhost:3000` by default.

### 3. Frontend setup
```bash
cd ../frontend
npm install
cp .env.example .env
```
Confirm `VITE_API_BASE_URL` in `.env` points to your backend (default: `http://localhost:3000/api`).

Start the dev server:
```bash
npm run dev
```
Frontend runs on `http://localhost:5173` by default.

### 4. Create an admin account
Registration always creates a `customer` account (by design — no self-service admin signup). To test admin features, register a normal account, then manually change that user's `role` field to `"admin"` in your MongoDB database (via Atlas or Compass).

## Testing

The backend has an automated test suite covering Auth, Foods, and Orders (20+ tests) against a dedicated test database.

```bash
cd backend
npm test
```

Requires a `TEST_MONGO_URI` in `.env`, separate from your main database.

## API Overview

All endpoints are prefixed with `/api`.

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/profile`, `GET /auth/users` (admin) |
| Foods | `GET /foods`, `GET /foods/:id`, `POST /foods` (admin), `PUT /foods/:id` (admin), `DELETE /foods/:id` (admin) |
| Categories | `GET /categories`, `GET /categories/:id`, `POST /categories` (admin), `PUT /categories/:id` (admin), `DELETE /categories/:id` (admin) |
| Orders | `POST /orders`, `GET /orders/my-orders`, `GET /orders` (admin), `GET /orders/:id`, `PATCH /orders/:id/status` (admin) |
| Payments | `POST /payments/initialize`, `GET /payments/verify/:reference` |

## Notable Design Decisions

- **Order price snapshotting** — order line items store the food's name/price at the moment of purchase, so historical orders remain accurate even if a food's price changes later.
- **Server-side price calculation** — the client never sends a price or total; the backend always recalculates from live database values at checkout.
- **Server-side payment verification** — card payments are verified directly against Paystack's API before an order is ever created; the client's word that "payment succeeded" is never trusted on its own.
- **Category deletion guard** — a category can't be deleted while foods still reference it, preventing orphaned data.
- **Order status state machine** — status transitions are validated against an explicit allow-list (e.g. an order can't jump from "pending" straight to "delivered").

## License

This project was built for educational purposes as part of a software engineering capstone.