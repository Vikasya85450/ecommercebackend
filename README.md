# SnapBasket — Backend (`ecomback`)

REST API for the SnapBasket e-commerce platform: authentication, product/category
catalog, cart-to-order checkout, reviews, gift cards, Razorpay payments, and an
admin panel API (stats, user/order management, activity log). Built with
Express 5 and MongoDB (Mongoose), with optional Redis response caching.

Frontend repo: [`ecommerce`](https://github.com/Vikasya85450/ecommerce) (app lives in its `a/` subfolder).

## Tech stack

| Layer | Choice |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Database | MongoDB Atlas via Mongoose |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` password hashing |
| File storage | Cloudinary (via `multer` in-memory upload) |
| Payments | Razorpay |
| Email | Nodemailer (OTP for password reset) |
| Caching | Redis (`redis` npm package) — optional, degrades gracefully if unset |

## Getting started

```bash
npm install
cp .env.example .env   # fill in the values below
npm run dev             # node --watch, auto-restarts on file changes
# or
npm start                # plain node
```

Server listens on `PORT` (default `8080`). Health check: `GET /health`.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | no | defaults to 8080 |
| `MONGO_URL` | yes | MongoDB Atlas connection string |
| `JWT_SECRET` | yes | signs auth tokens (15-day expiry) |
| `CLOUD_NAME`, `API_KEY`, `API_SECRET` | yes | Cloudinary credentials (category/product images) |
| `EMAIL_USER`, `EMAIL_PASS` | yes | Gmail SMTP for OTP password-reset emails |
| `RZP_KEY`, `RZP_SECRET` | yes | Razorpay checkout + payment verification |
| `REDIS_URL` | no | single connection string for Redis |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB` | no | alternative to `REDIS_URL`; used if it's unset |

If neither `REDIS_URL` nor `REDIS_HOST` is set, caching is silently disabled — nothing else breaks.

## Project structure

```
src/
  index.js            # app entry: middleware, route mounting, listen
  config/
    db.js             # mongoose connect
    multer.js         # in-memory upload middleware
    redis.js           # cache client wrapper (get/set/delPattern), no-ops without Redis
  models/              # User, Product, Category, Order, Address, Review, GiftCard, ActivityLog
  controllers/         # one file per resource, matches models/
  routes/              # one file per resource, mounted under /api in index.js
  utils/
    index.js           # isAuthenticated / isAdmin middleware, password + token helpers
    activityLogger.js   # writes ActivityLog entries (used by admin + category/product writes)
    mail.js             # nodemailer OTP sending
    buffer.js           # multer buffer -> data URI (for Cloudinary upload)
```

## API overview

All routes are mounted under `/api` except `/giftcard`, `/send-gift-email` (root)
and `/api/admin/*` (its own prefix). Authenticated routes expect
`Authorization: Bearer <token>`.

| Resource | Base path | Notes |
|---|---|---|
| Auth / users | `/api/user` | sign-up, sign-in, forgot/reset password (OTP), profile |
| Categories | `/api/category` | public read, admin-only write |
| Products | `/api/product` | public read/search, admin-only write |
| Addresses | `/api/address` | authenticated, scoped to caller |
| Orders | `/api/order` | authenticated; place, list own orders, self-service cancel |
| Reviews | `/api/review/:productId` | public read, authenticated write |
| Payment | `/api/payment` | Razorpay order creation + signature verification |
| Gift cards | `/giftcard`, `/send-gift-email` | public |
| Admin | `/api/admin/*` | requires `role: "admin"` — stats, users, orders, activity log, low-stock |

See the full project documentation PDF for a complete endpoint-by-endpoint reference,
request/response shapes, and data model schemas.

## Auth model

- `isAuthenticated` verifies the JWT and populates `req.user` (`{ id, email }`).
- `isAdmin` (must run after `isAuthenticated`) loads the user, checks `role === "admin"`,
  and enriches `req.user` with `name`/`role` for activity-log attribution.
- Admin-protected routes always chain `isAuthenticated, isAdmin` in that order.

## Deployment

Deployed on [Render](https://render.com) as a Web Service (Build: `npm install`,
Start: `npm start`). Render injects `PORT` automatically. Add a Render Key Value
(Redis) instance and set its connection string as `REDIS_URL` for caching in
production — optional.
