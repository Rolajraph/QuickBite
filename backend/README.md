# QuickBite — Backend

REST API for the QuickBite food ordering application, built with Express 5 and MongoDB.

## Stack
- Node.js + Express 5
- MongoDB with Mongoose 9
- JWT authentication + bcrypt password hashing
- Zod for request validation
- Cloudinary for image uploads (via Multer)

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:
| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Port the server listens on |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs — generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |
| `CLIENT_URL` | Frontend origin, for CORS — e.g. `http://localhost:5173` |

## Scripts
```bash
npm run dev    # start with auto-restart on file changes
npm run start  # production start
npm run seed   # populate the database with sample categories and foods
```

## Project Structure
backend/
├── config/ # DB and Cloudinary configuration
├── constants/ # roles, order status enum + allowed transitions
├── models/ # Mongoose schemas
├── controllers/ # request/response handling
├── services/ # business logic
├── routes/ # route definitions
├── middleware/ # auth, validation, error handling, uploads
├── validators/ # Zod schemas
├── seed/ # sample data + seed script
└── server.js # entry point


## Architecture Notes
- **Layered design**: routes → controllers (thin, HTTP-only) → services (business logic, framework-agnostic) → models. Services never touch `req`/`res`, which keeps them independently testable.
- **Centralized error handling**: all errors flow through `errorMiddleware.js` via a custom `ApiError` class, giving every response a consistent shape.
- **RBAC**: `protect` middleware verifies identity; `isAdmin` middleware checks role — kept as two separate middlewares so routes can require login-only or login-plus-admin as needed.