# AURA Laboratories (Gravita)

Three apps that run together:

| App | Folder | Stack | Dev URL |
|---|---|---|---|
| API | `gravuta-backend` | Express 5, Mongoose 9, MongoDB | http://localhost:5000/api |
| Storefront | `pharmaa` | Next.js 16, React 19, Zustand | http://localhost:3000 |
| Admin dashboard | `dp-dashboard/dpdashboard` | Vite, React 18, React Query | http://localhost:5173 |

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
npm install
npm run dev                   # VITE_API_URL / VITE_STOREFRONT_URL in .env
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

## Not wired up yet

- **Card / Apple Pay / Google Pay**: orders are cash on delivery until a payment gateway (Moyasar, Tap, Stripe…) is connected. Then set `ONLINE_PAYMENTS_ENABLED=true` in the API.
- **Forgot password, Google/Facebook sign-in**: need an email service and OAuth apps.
- **Storefront profile "Balance" and "Bank cards" tabs**: there is no wallet or saved-card backend.
