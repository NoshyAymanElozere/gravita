# AURA Laboratories (Gravita)

Three apps that run together:

| App | Folder | Stack | Dev URL |
|---|---|---|---|
| API | `gravuta-backend` | Express 5, Mongoose 9, MongoDB | http://localhost:5000/api |
| Storefront | `pharmaa` | Next.js 16, React 19, Zustand | http://localhost:3000 |
| Admin dashboard | `dp-dashboard/dpdashboard` | Vite, React 18, React Query, Recharts | http://localhost:5173 |

The storefront and the dashboard read and write the same data through the API. Prices, stock, orders and customers change in one place and show up in both.

## First-time setup

```bash
# 1. API
cd gravuta-backend
cp .env.example .env          # set MONGO_URI and a long random JWT_SECRET
npm install
npm run migrate -- --dry-run  # only if the database already has data from the old schema; then run without --dry-run
npm run seed                  # categories, products, bundles, coupons, reviews + demo accounts
npm run dev

# 2. Storefront
cd pharmaa
npm install
npm run dev                   # NEXT_PUBLIC_API_URL defaults to http://localhost:5000/api

# 3. Dashboard
cd dp-dashboard/dpdashboard
npm install --legacy-peer-deps   # the template has a peer-dependency conflict
npm run dev                      # VITE_API_URL / VITE_STOREFRONT_URL in .env; use `npx vite --port 5180` if 5173 is taken
```

Demo accounts created by the seed:

| Role | Email | Password |
|---|---|---|
| Admin (dashboard) | admin@gmail.com | Admin |
| Customer (storefront) | user@test.com | password123 |

Change the admin password after the first login (dashboard → Profile).

## Where to read more

- `gravuta-backend/API_REFERENCE.md`: every endpoint and response shape.
- `gravuta-backend/postman/pharmaa_gravuta.postman_collection.json`: ready-to-run requests (`npm run postman` regenerates it).
- `pharmaa/BACKEND_IMPLEMENTATION_PLAN.md`: data model, bundle ↔ product relationship, design decisions.

## Payments

Two payment methods work out of the box, no gateway needed:

- **Cash on delivery (COD)**: adds the `COD_FEE` surcharge; marked paid automatically on delivery.
- **Bank transfer (IBAN)**: the checkout shows the store bank account (set `BANK_NAME`, `BANK_IBAN`, `BANK_ACCOUNT_NAME` in the API `.env`, served at `GET /api/config`). The admin confirms the transfer with **Mark as paid** on the order page.

Card / Apple Pay / Google Pay stay disabled until a payment gateway (Moyasar, Tap, Stripe…) is connected; then set `ONLINE_PAYMENTS_ENABLED=true`.

## Reports & full-cycle test

- Dashboard → **Reports**: revenue, orders, units, new customers for any period, with breakdowns by payment method / status / top sellers and a CSV export (`GET /api/admin/stats/report`).
- Admins change any user's password from Customers → Edit (the e2e test verifies it).
- `npm run test:cycle` in `gravuta-backend` (with the API running and seeded) exercises the whole cycle: register → cart (product + bundle) → coupon → bank-transfer order → stock → mark paid → confirm/ship/deliver → COD order → cancel + restock → stats/report/CSV → admin password change.

## Not wired up yet

- **Forgot password**: needs an email service.
