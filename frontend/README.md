# Uniformity Frontend

Frontend interface for the Uniformity marketplace using HTML, CSS, Bootstrap, Bootstrap Icons, and vanilla JavaScript.

## Current Scope

The frontend connects to the backend API for the main buyer, seller, and account workflows.

Implemented areas include:

- registration and login with JWT authentication
- role-aware sidebar and admin-only admin panel access
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
- admin user, product, order, and category management

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
|   |-- admin.js
|   |-- cart.js
|   |-- dashboard.js
|   |-- main.js
|   |-- my-listings.js
|   |-- my-order-details.js
|   |-- my-orders.js
|   |-- product-detail.js
|   `-- profile.js
|-- add-listing.html
|-- admin.html
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
| `login.html` | Login form and working back-to-home navigation |
| `register.html` | Registration form |
| `dashboard.html` | Product browsing with search, filters, sorting, and pagination |
| `product-detail.html` | Single product view, image overlay preview, related products, quantity selection, and add-to-cart |
| `cart.html` | Cart management, selected-item checkout, quantity controls, and delete confirmation modal |
| `checkout.html` | Delivery details, saved name/phone reuse, dynamic order summary, and order placement |
| `my-orders.html` | Buyer order history with cancel/received actions |
| `my-order-details.html` | Buyer order details, cancellation state, and receipt confirmation |
| `add-listing.html` | Seller listing creation with image preview |
| `my-listings.html` | Seller inventory, listing edit/delete, incoming orders, and fulfillment |
| `profile.html` | User profile, edit profile modal, stats, and recent orders |
| `admin.html` | Admin dashboard for users, products, orders, and categories |

## JavaScript Modules

| File | Responsibility |
|---|---|
| `main.js` | Auth guard, login status helper, sidebar, profile dropdown, logout, cart/order badges |
| `api.js` | Shared auth helpers, forms, add-to-cart, checkout, profile update, API base URL |
| `admin.js` | Admin page data loading, search/filter, edit modals, status controls, and no-flash section updates |
| `dashboard.js` | Product fetch, search, filter, sort, pagination, add-to-cart entry point |
| `product-detail.js` | Product detail fetch, quantity controls, detailed add-to-cart payload |
| `cart.js` | Cart display, totals, quantity changes, selected checkout snapshot, delete confirmation |
| `my-orders.js` | Buyer order history, cancel order modal, confirm receipt modal |
| `my-order-details.js` | Buyer order detail display, cancelled states, cancel/receipt actions |
| `my-listings.js` | Seller listings, edit/delete listing, incoming order items, cancelled states, fulfillment |
| `profile.js` | Profile info, user stats, seller snapshot, recent orders |

## Backend Dependency

The frontend API base URL is defined in:

```text
frontend/js/api.js
```

Start the backend before testing authenticated features, cart, checkout, and order flows.

## Implemented UX Details

- Working public pages and auth guard
- Sticky topbar and shared sidebar with role-aware Admin Panel link
- Live sidebar badges for cart and order counts
- Add-listing image preview before upload
- Product cards with stock status and disabled sold-out action
- Product detail full-image overlay preview
- Related products section in product details
- Clickable cart items that open product details
- Cart delete confirmation modal
- Stock-aware cart quantity limit in the UI
- Dynamic checkout summary based on selected cart items
- Seller-split checkout behavior supported through backend order creation
- Checkout name and phone fields are reused from the user profile or previous checkout when available
- Buyer cancel order confirmation modal
- Buyer confirm receipt confirmation modal
- Seller listing delete confirmation modal
- Seller order fulfillment confirmation modal
- Cancelled order/item display for buyers and sellers
- Admin search inside users, products, orders, and categories sections
- Admin status filter chips for orders
- Admin edit modals for users and products
- Admin receipt-style order details modal
- Admin category add/edit/delete workflow
- Admin UI updates rows in place after changes to avoid empty loading flashes
- Centered loading and empty states on key pages
- Responsive mobile layout improvements for product grids, cart cards, listing tables, seller panels, and topbar actions
- Shared motion polish for page entry, cards, buttons, modals, tables, and admin rows
- Modal scroll locking so page scroll does not fight modal scroll
- Reduced-motion media query for accessibility

## Local Notes

- The frontend relies on `localStorage` for token, user data, and selected cart snapshot state.
- Old orders already stored in the database keep their original structure and status.
- Order status uses `pending`, `shipped`, `delivered`, and `cancelled` in data. The UI displays `shipped` as fulfilled.
- New checkout, cancel, fulfillment, and admin behavior applies to new actions after the latest backend code is running.
