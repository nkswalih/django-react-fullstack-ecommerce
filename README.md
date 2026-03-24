# Echoo Ecommerce

Full-stack ecommerce project with a Django REST backend and a React + Vite frontend.

This project now runs with:
- Django 6 + Django REST Framework
- JWT authentication with `djangorestframework-simplejwt`
- React 19 + React Router + Vite
- Tailwind CSS + Framer Motion
- SQLite by default, with PostgreSQL-ready settings support

## Project Structure

```text
ecommerce/
├─ backend/
│  ├─ core/                 # Django settings and root URLs
│  ├─ users/                # auth, profile, admin user APIs
│  ├─ products/             # product models, product APIs, product seeding
│  ├─ cart/                 # cart APIs
│  ├─ orders/               # order APIs
│  ├─ db.sqlite3            # default local database
│  └─ manage.py
├─ frontend/
│  ├─ src/
│  │  ├─ api/               # axios client and API service layer
│  │  ├─ app/               # router setup
│  │  ├─ components/        # reusable UI sections
│  │  ├─ contexts/          # auth context
│  │  ├─ hooks/             # API hooks
│  │  ├─ pages/             # user/admin route pages
│  │  └─ data/db.json       # legacy product source used for backend seeding
│  └─ package.json
└─ README.md
```

## What Is Used Where

### Backend

- `backend/core/settings.py`
  - Django app setup
  - CORS configuration
  - JWT auth config
  - SQLite default database
- `backend/users/`
  - register, login, profile, admin user management
- `backend/products/`
  - product catalog
  - image handling
  - legacy product import command
- `backend/cart/`
  - add/update/remove cart items for logged-in users
- `backend/orders/`
  - create orders from the live cart
  - reduce stock on order creation
  - cancel orders and restore stock

### Frontend

- `frontend/src/api/apiService.js`
  - central axios client
  - JWT attach/refresh flow
  - all API helpers
- `frontend/src/contexts/AuthContext.jsx`
  - frontend auth state
- `frontend/src/app/router.jsx`
  - route tree
  - lazy-loaded pages
- `frontend/src/pages/user/`
  - storefront, product page, cart, profile, auth pages
- `frontend/src/pages/admin/`
  - admin dashboard, products, users, orders
- `frontend/src/components/OrderPage/Checkout.jsx`
  - checkout form using live cart/order APIs
- `frontend/src/components/OrderPage/OrderConfirmation.jsx`
  - fetches and shows the real created order

## Backend API Overview

Base URL:

```text
http://127.0.0.1:8000/api/
```

### Auth and Users

- `POST /register/`
- `POST /login/`
- `POST /token/refresh/`
- `GET /profile/`
- `PATCH /profile/`
- `GET /admin/users/`
- `PATCH /admin/users/:id/`
- `DELETE /admin/users/:id/`

### Products

- `GET /products/`
- `POST /products/`
- `GET /products/:slug/`
- `PUT /products/:slug/`
- `PATCH /products/:slug/`
- `DELETE /products/:slug/`
- `POST /products/bulk/`

### Cart

- `GET /cart/`
- `POST /cart/`
- `PATCH /cart/:id/`
- `DELETE /cart/:id/`
- `DELETE /cart/clear/`

### Orders

- `GET /orders/`
- `POST /orders/`
- `GET /orders/:id/`
- `PATCH /orders/:id/cancel/`
- `GET /admin/orders/`
- `PATCH /admin/orders/:id/`

## Main Data Flow

### Auth

1. User registers or logs in from the frontend.
2. Backend returns `user` + JWT tokens.
3. Frontend stores `access_token`, `refresh_token`, and `currentUser`.
4. Axios attaches the access token automatically.
5. On `401`, the frontend refreshes the token and retries once.

### Products

1. Store and search UI call `getProducts()`.
2. Django returns products with nested images.
3. Admin product forms send product updates back through the same API layer.

### Cart

1. Product page sends `product_id`, `quantity`, `storage`, and `ram`.
2. Backend validates stock and creates or updates the cart item.
3. Cart and checkout read from `/api/cart/`.

### Orders

1. Checkout submits shipping and payment info.
2. Backend reads the authenticated user’s cart.
3. Backend creates the order and order items.
4. Backend reduces stock and clears the cart.
5. Frontend redirects to the confirmation page and loads the real order.

## Local Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_products --replace
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default dev URL:

```text
http://127.0.0.1:5173
```

Backend default dev URL:

```text
http://127.0.0.1:8000
```

## Product Seed Command

The old frontend product catalog can be imported into Django with:

```bash
cd backend
python manage.py seed_products --replace
```

This reads:

```text
frontend/src/data/db.json
```

## 50-User Smoke/Load Test

A repeatable test command now exists:

```bash
cd backend
python manage.py load_test_users --users 50
```

What it does:
- registers 50 temporary users
- logs each one in
- fetches products
- adds an item to cart
- places an order
- fetches the user’s orders
- cleans up created users and temporary test product after the run

Keep generated data if needed:

```bash
python manage.py load_test_users --users 50 --keep-data
```

### Latest Local Result

Latest successful run:
- `50/50` users passed
- total run time: about `113s`
- average per user: about `2.26s`
- product, cart, and order endpoints stayed fast
- register/login were the slowest steps at about `1.1s` each on local machine

Important note:
- this is a sequential smoke/load test, not a true distributed concurrency benchmark
- it is useful for breakage detection and rough local performance validation

## Verification Commands

Backend:

```bash
cd backend
python manage.py check
python manage.py migrate
python manage.py load_test_users --users 50
```

Frontend:

```bash
cd frontend
npm run build
```

## Known Notes

- `backend/core/settings.py` now includes `testserver` in `ALLOWED_HOSTS` so Django APIClient and automated smoke tests work correctly.
- If products look empty, seed them again with `python manage.py seed_products --replace`.
- The frontend build currently passes, but there is still a large vendor chunk warning from Vite.
- Tailwind config still has a noisy content-pattern warning that can be cleaned up in a later optimization pass.
- JWT emitted a warning during the load test because the current development `SECRET_KEY` is shorter than the recommended 32 bytes for SHA-256 signing. For production, replace it with a longer secure secret.

## Recommended Next Improvements

- move secrets and DB settings to real environment loading for production
- trim unused legacy files under `frontend/backend/` and `frontend/src/data/`
- add proper backend unit tests per app in addition to the smoke/load command
- add route-level or component-level error boundaries in the frontend
- reduce frontend vendor bundle size further
