# Uniformity Frontend

Frontend interface for the Uniformity marketplace using HTML, CSS, Bootstrap, Bootstrap Icons, and vanilla JavaScript.

## Current Scope

The frontend connects to the backend API for the main buyer, seller, and account workflows.

Implemented areas include:

- authentication
- product listing
- product browsing and details
- cart handling
- checkout
- buyer orders
- seller listings
- seller incoming orders
- order cancellation
- order fulfillment
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
|-- css/
|   `-- style.css
|-- img/
|   `-- logo.png
|-- js/
|   |-- api.js
|   |-- cart.js
|   |-- dashboard.js
|   |-- main.js
|   |-- my-listings.js
|   |-- my-order-details.js
|   |-- my-orders.js
|   |-- product-detail.js
|   `-- profile.js
|-- add-listing.html
|-- cart.html
|-- checkout.html
|-- dashboard.html
|-- index.html
|-- login.html
|-- my-listings.html
|-- my-order-details.html
|-- my-orders.html
|-- product-detail.html
|-- profile.html
`-- register.html
```

## Page Overview

| Page | Purpose |
|---|---|
| `index.html` | Landing page |
| `login.html` | Login form with working back-to-home navigation |
| `register.html` | Registration form |
| `dashboard.html` | Product browsing with search, filters, sorting, and pagination |
| `product-detail.html` | Single product view, quantity selection, and add-to-cart |
| `cart.html` | Cart management, selected-item checkout, quantity controls, and delete confirmation modal |
| `checkout.html` | Delivery details, dynamic order summary, and order placement |
| `my-orders.html` | Buyer order history with cancel/received actions |
| `my-order-details.html` | Buyer order details, cancellation state, and receipt confirmation |
| `add-listing.html` | Seller listing creation with image preview |
| `my-listings.html` | Seller inventory, listing edit/delete, incoming orders, and fulfillment |
| `profile.html` | User profile, edit profile modal, stats, and recent orders |

## JavaScript Modules

| File | Responsibility |
|---|---|
| `main.js` | Auth guard, login status helper, sidebar, profile dropdown, logout, cart/order badges |
| `api.js` | Shared auth helpers, forms, add-to-cart, checkout, profile update, API base URL |
| `dashboard.js` | Product fetch, search, filter, sort, pagination, add-to-cart entry point |
| `product-detail.js` | Product detail fetch, quantity controls, detailed add-to-cart payload |
| `cart.js` | Cart display, totals, quantity changes, selected checkout snapshot, delete confirmation |
| `my-orders.js` | Buyer order history, cancel order modal, confirm receipt modal |
| `my-order-details.js` | Buyer order detail display, cancelled states, cancel/receipt actions |
| `my-listings.js` | Seller listings, edit/delete listing, incoming order items, cancelled states, fulfillment |
| `profile.js` | Profile info, user stats, seller snapshot, recent orders |

## Backend Dependency

The frontend expects the backend API at:

```js
const API_BASE = 'http://localhost:5000/api';
```

That value is defined in:

```text
frontend/js/api.js
```

Start the backend before testing authenticated features, cart, checkout, and order flows.

## Implemented UX Details

- Working public pages and auth guard
- Live sidebar badges for cart and order counts
- Add-listing image preview before upload
- Product cards with stock status and disabled sold-out action
- Clickable cart items that open product details
- Cart delete confirmation modal
- Stock-aware cart quantity limit in the UI
- Dynamic checkout summary based on selected cart items
- Seller-split checkout behavior supported through backend order creation
- Buyer cancel order confirmation modal
- Buyer confirm receipt confirmation modal
- Seller listing delete confirmation modal
- Seller order fulfillment confirmation modal
- Cancelled order/item display for buyers and sellers
- Centered loading and empty states on key pages
- Lighter typography pass to reduce excessive bold text
- Shared motion polish for page entry, cards, buttons, modals, and table rows
- Reduced-motion media query for accessibility

## Local Notes

- The frontend relies on `localStorage` for token, user data, and selected cart snapshot state.
- Old orders already stored in the database keep their original structure and status.
- New checkout, cancel, and fulfillment behavior applies to new actions after the latest backend code is running.
