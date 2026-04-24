# Uniformity Frontend

Frontend interface for the Uniformity marketplace using HTML, CSS, Bootstrap, and vanilla JavaScript.

## Current Scope

The frontend is no longer just static UI. It now connects to the backend API for core flows including:

- authentication
- product listing
- product browsing
- product details
- cart handling
- checkout
- buyer orders
- seller listings
- seller incoming orders
- live profile stats

## Stack

- HTML5
- CSS3
- Bootstrap 5
- Bootstrap Icons
- Vanilla JavaScript

## Structure

```text
frontend/
├── css/
│   └── style.css
├── img/
│   └── logo.png
├── js/
│   ├── api.js
│   ├── cart.js
│   ├── dashboard.js
│   ├── main.js
│   ├── my-listings.js
│   ├── my-order-details.js
│   ├── my-orders.js
│   ├── product-detail.js
│   └── profile.js
├── add-listing.html
├── cart.html
├── checkout.html
├── dashboard.html
├── index.html
├── login.html
├── my-listings.html
├── my-order-details.html
├── my-orders.html
├── product-detail.html
├── profile.html
└── register.html
```

## Page Overview

| Page | Purpose |
|---|---|
| `index.html` | Landing page |
| `login.html` | Login form |
| `register.html` | Registration form |
| `dashboard.html` | Product browsing with search and filters |
| `product-detail.html` | Single product view and add-to-cart |
| `cart.html` | Cart management and checkout selection |
| `checkout.html` | Delivery details and order placement |
| `my-orders.html` | Buyer order history |
| `my-order-details.html` | Buyer order details |
| `add-listing.html` | Seller listing creation with image preview |
| `my-listings.html` | Seller listings and incoming orders |
| `profile.html` | User profile and activity stats |

## JavaScript Modules

| File | Responsibility |
|---|---|
| `main.js` | Sidebar, auth guard, profile dropdown, cart badge |
| `api.js` | Shared auth helpers, forms, add-to-cart, checkout, profile update |
| `dashboard.js` | Product fetch, search, filter, sort, pagination |
| `product-detail.js` | Product detail fetch and quantity controls |
| `cart.js` | Cart rendering, totals, quantity change, product click-through |
| `my-orders.js` | Buyer order history rendering |
| `my-order-details.js` | Buyer order detail rendering |
| `my-listings.js` | Seller listings and incoming orders |
| `profile.js` | Profile info, stats, recent orders |

## Backend Dependency

The frontend expects the backend API at:

```js
const API_BASE = 'http://localhost:5000/api';
```

That value is currently defined in:

[api.js](/C:/Users/Paw%20Red/Desktop/PHASE%204/frontend/js/api.js)

## Implemented UX Details

- add-listing image preview before upload
- cart count badge in sidebar and topbar
- clickable cart items that open product detail
- stock-aware cart quantity limit in UI
- centered loading states on key pages
- profile stats from live backend data

## Notes

- Some older sample placeholders in the HTML have been replaced by live-rendered sections
- The frontend relies on `localStorage` for token, user, and selected cart snapshot state
- For full functionality, start the backend first
