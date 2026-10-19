# Gravuta API Reference

Base URL: `http://localhost:5000/api` (set `PORT` in `.env`). Postman: `postman/pharmaa_gravuta.postman_collection.json` (`npm run postman` regenerates it).

## Conventions

- **Auth**: `Authorization: Bearer <token>`. Tokens come from `POST /auth/login` / `POST /auth/register` (`{ token, data: { user } }`). Admin routes need `role: "admin"`.
- **Success**: `{ status: "success", message?, data, pagination? }`
- **Error**: `{ status: "fail" | "error", message, errors? }` — `400` validation, `401` not logged in / bad token, `403` not allowed, `404` not found, `409` conflict (stock, duplicates, in-use).
- **Pagination** (lists): `?page=1&limit=10` (max 100) → `pagination: { currentPage, totalPages, totalItems, limit, hasNextPage, hasPrevPage }`.
- **Ids**: every public "detail" route accepts the Mongo `_id` **or** the `slug`.
- **Images**: `/uploads/...` are served by this API (prefix with the API origin). `/assets/...` are storefront files (prefix with the storefront origin). `http(s)://` URLs are absolute.
- **Bilingual fields**: `nameEn/nameAr`, `descriptionEn/descriptionAr`, … Products/categories also expose `name`/`description` (= English) for older clients.
- **Money**: whole SAR numbers.

## Shapes

```ts
Category { _id, slug, nameEn, nameAr, descriptionEn, descriptionAr, image, sortOrder, isActive, productCount? }

Product {
  _id, slug, nameEn, nameAr, subtitleEn, subtitleAr, descriptionEn, descriptionAr,
  ingredientsEn, ingredientsAr, howToUseEn, howToUseAr, skinTypeEn, skinTypeAr,
  benefitsEn: string[], benefitsAr: string[],
  price, discountPrice: number | null, finalPrice,          // finalPrice = discountPrice ?? price
  size, image, galleryImages: string[],
  category: Category (populated: _id, slug, nameEn, nameAr) | id,
  stock, lowStockThreshold, stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock',
  isBestSeller, isNew, soldCount, rating, reviewCount,      // rating = ratingAvg, reviewCount = ratingCount
  isActive, createdAt
}

Bundle {
  _id, slug, nameEn, nameAr, subtitleEn, subtitleAr, descriptionEn, descriptionAr, image,
  items: [{ product: Product, stepEn, stepAr, benefitEn, benefitAr, quantity, order }],
  discountPercentage, originalPrice, bundlePrice, savings,
  benefitsEn, benefitsAr, sortOrder, isActive,
  available, maxQuantity, effectiveOriginalPrice            // computed on read
}

Cart {   // every /cart response returns this, fully priced by the server
  _id,
  items: [{
    itemType: 'product' | 'bundle', product?: Product, bundle?: Bundle,
    quantity, unitPrice, lineTotal, maxQuantity, available
  }],
  itemCount, coupon: { code, discountType, value, valid, message } | null,
  subtotal, discount, shippingFee, codFee, total, allAvailable, freeShippingThreshold
}

Address { _id, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault }

Order {
  _id, orderNumber /* AURA-123456 */, user,
  items: [{ itemType, product?, bundle?, nameEn, nameAr, image, size, quantity, unitPrice, lineTotal,
            bundleSnapshot?: { originalPrice, discountPercentage, items: [{ product, nameEn, nameAr, quantity, stepEn, stepAr }] } }],
  contact: { name, email, phone }, shippingAddress: Address (no _id/isDefault), notes,
  paymentMethod: 'cod' | 'credit_card' | 'apple_pay' | 'google_pay', paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  coupon?: { code, discountType, value },
  subtotal, discount, shippingFee, codFee, total,
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'return_requested' | 'returned',
  statusHistory: [{ status, at, note, by }], trackingNumber, estimatedDelivery, deliveredAt, cancelReason, returnReason, createdAt
}

Review { _id, product, user, authorName, avatar, rating, comment, lang, commentEn, commentAr, photo, verified, helpfulCount, isApproved, createdAt }

Coupon { _id, code, discountType: 'percentage' | 'fixed', value, minOrderAmount, maxDiscount, expiresAt, usageLimit, usedCount, perUserLimit, descriptionEn, descriptionAr, isActive }

User { _id, name, email, phone, role: 'user' | 'admin', isActive, addresses: Address[], wishlist: id[], createdAt }
```

## Public / storefront

| Method | Path | Notes |
|---|---|---|
| GET | `/categories` | active, sorted, with `productCount` |
| GET | `/categories/:idOrSlug` | |
| GET | `/products` | `category` (slug/id), `skinType`, `minPrice`, `maxPrice`, `q`, `bestSeller`, `isNew`, `inStock`, `sort` = `best-selling` \| `price-low-high` \| `price-high-low` \| `newest` \| `rating` |
| GET | `/products/:idOrSlug` | |
| GET | `/products/:idOrSlug/related?limit=4` | same category |
| GET | `/products/:idOrSlug/reviews` | + `summary: { ratingAvg, ratingCount, distribution }` |
| GET | `/bundles` | active bundles |
| GET | `/bundles/:idOrSlug` | |
| GET | `/bundles/by-product/:productId` | bundles containing a product |
| GET | `/reviews/featured?limit=6` | home testimonials |
| POST | `/newsletter` | `{ email, lang }` |

## Auth & profile (logged in)

| Method | Path | Body / notes |
|---|---|---|
| POST | `/auth/register` | `{ name, email, password, phone? }` → `{ token, data: { user } }` |
| POST | `/auth/login` | `{ email, password }` → `{ token, data: { user } }` |
| GET | `/auth/me` | restore session |
| GET / PUT / DELETE | `/users/me` | PUT `{ name?, email?, phone?, password? + currentPassword }` |
| PUT | `/users/me/password` | `{ currentPassword, newPassword }` → new `token` (old tokens stop working) |
| GET / POST | `/users/me/addresses` | POST Address fields (+ `isDefault`) → `{ address, addresses }` |
| PUT / DELETE | `/users/me/addresses/:id` | → `{ addresses }` |
| PATCH | `/users/me/addresses/:id/default` | |
| GET | `/users/me/wishlist` | `{ ids, products }` |
| POST / DELETE | `/users/me/wishlist/:productId` | → `{ ids }` |

## Cart (logged in) — every response is `data.cart: Cart`

| Method | Path | Body |
|---|---|---|
| GET | `/cart?paymentMethod=cod` | include COD fee in the quote |
| POST | `/cart` | `{ productId, quantity }` (adds) |
| PUT | `/cart` | `{ productId, quantity }` (sets) |
| DELETE | `/cart/:productId` | |
| POST | `/cart/bundles` | `{ bundleId, quantity }` |
| PUT | `/cart/bundles` | `{ bundleId, quantity }` |
| DELETE | `/cart/bundles/:bundleId` | |
| POST / DELETE | `/cart/coupon` | `{ code }` |
| POST | `/cart/merge` | `{ items: [{ itemType, id, quantity }] }` → `{ cart, skipped }` (guest cart after login) |
| DELETE | `/cart` | clear |

Stock is checked on every add/update (`409` with `errors: [{ requested, available }]`).

## Orders (logged in)

| Method | Path | Body / notes |
|---|---|---|
| POST | `/orders` | `{ addressId }` **or** `{ address, saveAddress? }`, `contact?`, `paymentMethod` (`cod` only until a gateway is enabled), `notes?` → `{ order }`; reserves stock, consumes coupon, clears cart |
| GET | `/orders/my-orders?status=` | `in-transit` = `shipped`; also returns `statusCounts` |
| GET | `/orders/:id` | → `{ order, canCancel, canReturn, returnWindowDays }` |
| PATCH | `/orders/:id/cancel` | `{ reason? }` — `pending`/`confirmed` only; restocks |
| POST | `/orders/:id/return` | `{ reason }` — delivered within 14 days |
| POST | `/orders/:id/reorder` | → `{ cart, skipped }` |
| POST / DELETE | `/products/:id/reviews` | `{ rating, comment, lang? }` (one per user, re-POST updates) |
| POST | `/reviews/:id/helpful` | toggle |

## Admin (`role: admin`)

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/stats?days=30` | `revenue { total, orders, averageOrderValue }`, `ordersByStatus`, `dailySales [{date, revenue, orders}]`, `topProducts`, `lowStock`, `totals { users, products, bundles }` |
| GET / POST | `/admin/products` | list accepts the shop filters + `isActive`; POST JSON or `multipart/form-data` (`image`, `galleryImages[]` files; array fields as JSON strings) |
| GET / PUT / DELETE | `/admin/products/:id` | GET → `{ product, bundles }`; PUT re-prices bundles when `price` changes (`bundleSync`); DELETE = deactivate, `?hard=true` = delete (409 if in a bundle) |
| PATCH | `/admin/products/:id/stock` | `{ stock }` or `{ adjust }` |
| GET / POST | `/admin/categories` | multipart `image` supported |
| PUT / DELETE | `/admin/categories/:id` | DELETE 409 while it has products |
| GET / POST | `/admin/bundles` | items: `[{ product, stepEn, stepAr, benefitEn, benefitAr, quantity }]` (≥ 2), `discountPercentage` or `bundlePrice`; may return `warning` |
| GET / PUT / DELETE | `/admin/bundles/:id` | |
| PATCH | `/admin/bundles/:id/recalculate` | |
| GET | `/admin/orders?status=&q=&from=&to=` | `q` = order number / customer name / email / phone |
| GET | `/admin/orders/:id` | → `{ order, allowedTransitions }` |
| PUT | `/admin/orders/:id/status` | `{ status, note?, trackingNumber?, estimatedDelivery? }`; transitions: pending → confirmed/processing/shipped/cancelled, confirmed → processing/shipped/cancelled, processing → shipped/cancelled, shipped → delivered, delivered → returned, return_requested → returned/delivered |
| GET / POST | `/admin/users?q=&role=&isActive=` | |
| GET / PUT / DELETE | `/admin/users/:id` | GET → `{ user, stats: { ordersCount, totalSpent } }`; DELETE deactivates users with orders |
| GET / POST | `/admin/coupons` | |
| GET / PUT / DELETE | `/admin/coupons/:id` | |
| GET | `/admin/reviews?isApproved=&product=` | |
| PATCH / DELETE | `/admin/reviews/:id` | PATCH `{ isApproved }` |
| GET | `/admin/newsletter?isActive=` | |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | start with nodemon |
| `npm run migrate -- --dry-run` | preview the upgrade of existing data to this schema; drop `--dry-run` to apply (`--stock=100` sets stock for products that have none) |
| `npm run seed` | load the storefront catalog (categories, products, bundles, coupons, reviews) + `admin@gmail.com / Admin`, `user@test.com / password123`; safe to re-run (keeps stock) |
| `npm run postman` | regenerate the Postman collection |
