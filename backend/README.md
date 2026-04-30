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
|   |-- authController.js
|   |-- cartController.js
|   |-- categoryController.js
|   |-- orderController.js
|   |-- productController.js
|   `-- userController.js
|-- middleware/
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
| User | Stores account info and hashed password |
| Category | Product category records |
| Product | Uniform listings with seller, category, price, quantity, description, and image URL |
| Cart | One cart per user |
| CartItem | Product entries inside a cart |
| Order | Top-level buyer order record |
| OrderItem | Per-product order line tied to seller and order |

## API Routes

### Auth `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/register` | Register user | No |
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
| POST | `/` | Create category | No |
| GET | `/` | Get all categories | No |
| DELETE | `/:id` | Delete category | No |

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

## Order Behavior

- Checkout validates every item against the latest product record before creating orders.
- Items from different sellers are split into separate `Order` documents.
- Multiple items from the same seller stay inside one order.
- Successful checkout deducts product stock and clears the buyer cart.
- Pending orders can be cancelled by the buyer.
- Cancelling an order marks its order items as cancelled and restores stock.
- Sellers cannot fulfill cancelled items or cancelled orders.
- Seller fulfillment is item-level; when every item in an order is fulfilled, the order moves to `shipped`.
- Buyers can mark shipped orders as delivered.

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
