# Uniformity Backend

Express and MongoDB backend for the Uniformity marketplace.

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing
- multer and Cloudinary for image uploads

## Folder Structure

```text
backend/
|-- config/
|   |-- cloudinary.js
|   `-- db.js
|-- controllers/
|   |-- adminController.js
|   |-- authController.js
|   |-- cartController.js
|   |-- categoryController.js
|   |-- orderController.js
|   |-- productController.js
|   `-- userController.js
|-- middleware/
|   |-- adminOnly.js
|   `-- auth.js
|-- models/
|   |-- Cart.js
|   |-- CartItem.js
|   |-- Category.js
|   |-- Order.js
|   |-- OrderItem.js
|   |-- Product.js
|   `-- User.js
|-- routes/
|   |-- adminRoutes.js
|   |-- authRoutes.js
|   |-- cartRoutes.js
|   |-- categoryRoutes.js
|   |-- orderRoutes.js
|   |-- productRoutes.js
|   `-- userRoutes.js
|-- seed.js
|-- server.js
`-- package.json
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GMAIL_CLIENT_ID=your_google_oauth_client_id
GMAIL_CLIENT_SECRET=your_google_oauth_client_secret
GMAIL_REFRESH_TOKEN=your_google_oauth_refresh_token
GMAIL_USER=your_gmail_sender_address
```

### 3. Seed categories if needed

```bash
node seed.js
```

### 4. Start the server

```bash
npm start
```

For development with automatic restart:

```bash
npm run dev
```

Default URL:

```text
http://localhost:5000
```

## Authentication

Protected routes use the `x-auth-token` header.

```http
x-auth-token: your_jwt_here
```

`auth.js` verifies the token and exposes the authenticated user as `req.user`.

## Models

| Model | Purpose |
|---|---|
| User | Stores account info, hashed password, phone, role, and account status |
| Category | Product category records |
| Product | Uniform listings with seller, category, price, quantity, description, image URL, and listing status |
| Cart | One cart per user |
| CartItem | Product entries inside a cart |
| Order | Top-level buyer order record with delivery details, total amount, status, and buyer visibility |
| OrderItem | Per-product order line tied to seller and order |

## API Routes

### Auth `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/register` | Register user and return JWT | No |
| POST | `/verify-email` | Verify registration OTP and return JWT | No |
| POST | `/resend-otp` | Send a new registration OTP | No |
| POST | `/login` | Login and get JWT | No |
| GET | `/me` | Get current logged-in user | Yes |

### Users `/api/users`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/` | Create user | No |
| GET | `/` | Get all users | No |
| GET | `/:id` | Get user by ID | No |
| GET | `/:id/stats` | Get profile stats for current user | Yes |
| PUT | `/:id` | Update user | Yes |
| DELETE | `/:id` | Delete user | Yes |

### Categories `/api/categories`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | Get all categories | No |
| POST | `/` | Create category | Admin |
| PATCH | `/:id` | Update category | Admin |
| DELETE | `/:id` | Delete unused category | Admin |

### Products `/api/products`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/` | Create listing with optional image upload | Yes |
| GET | `/` | Get products, supports seller/category/search-style frontend usage | No |
| GET | `/:id` | Get single product | No |
| PUT | `/:id` | Update listing with optional image upload | Yes |
| DELETE | `/:id` | Delete listing | Yes |

### Cart `/api/cart`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/:userId` | Get or create cart for user | Yes |
| POST | `/add` | Add item to cart with stock validation | Yes |
| DELETE | `/item/:itemId` | Remove cart item | Yes |

### Orders `/api/orders`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/` | Create order(s), group items by seller, and deduct stock | Yes |
| GET | `/` | Get current buyer orders | Yes |
| GET | `/buyer/:userId` | Get buyer orders by user ID | Yes |
| GET | `/seller/:sellerId` | Get seller incoming orders | Yes |
| GET | `/:orderId` | Get full order details | Yes |
| PATCH | `/item/:itemId/fulfill` | Mark seller order item fulfilled | Yes |
| PATCH | `/:orderId/cancel` | Cancel pending buyer order and restore stock | Yes |
| PATCH | `/:orderId/deliver` | Mark shipped order as delivered | Yes |

### Admin `/api/admin`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/me` | Verify admin access | Admin |
| GET | `/summary` | Get admin dashboard counts | Admin |
| GET | `/users` | Get all users for account management | Admin |
| PATCH | `/users/:userId` | Update user profile fields, role, or account status | Admin |
| GET | `/products` | Get all products including removed listings | Admin |
| PATCH | `/products/:productId` | Update product details or active/removed status | Admin |
| GET | `/orders` | Get all orders with buyer and item details | Admin |
| PATCH | `/orders/:orderId` | Update order status or cancel an order | Admin |
| PATCH | `/order-items/:itemId` | Update an order item status | Admin |

## Order Behavior

- Checkout validates every item against the latest product record before creating orders.
- Items from different sellers are split into separate `Order` documents.
- Multiple items from the same seller stay inside one order.
- Successful checkout deducts product stock and clears the buyer cart.
- Pending orders can be cancelled by the buyer.
- Cancelling an order marks its order items as cancelled and restores stock.
- Sellers cannot fulfill cancelled items or cancelled orders.
- Seller fulfillment is item-level; when every item in an order is fulfilled, the order moves to `shipped`, which is displayed as fulfilled in the UI.
- Buyers can mark shipped orders as delivered.
- Admins can monitor all orders and update order status when needed.
- Admin cancellation marks order items as cancelled and restores product stock.

## Admin Behavior

- Admin-only routes require both a valid JWT and `role: admin`.
- Disabled users cannot continue through protected authentication flows.
- Admin users can edit account name, email, phone, role, and active/disabled status.
- Admin product updates support product details and active/removed listing status.
- Public product browsing excludes removed products.
- Admin category create/update/delete is centralized through protected category routes.

## Scripts

```bash
npm start
```

Runs:

```bash
node server.js
```

```bash
npm run dev
```

Runs:

```bash
nodemon server.js
```
