# Uniformity Backend

Express and MongoDB backend for the Uniformity marketplace.

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing
- multer + Cloudinary for image uploads

## Folder Structure

```text
backend/
├── config/
│   ├── cloudinary.js
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── cartController.js
│   ├── categoryController.js
│   ├── orderController.js
│   ├── productController.js
│   └── userController.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Cart.js
│   ├── CartItem.js
│   ├── Category.js
│   ├── Order.js
│   ├── OrderItem.js
│   ├── Product.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   ├── categoryRoutes.js
│   ├── orderRoutes.js
│   ├── productRoutes.js
│   └── userRoutes.js
├── seed.js
├── server.js
└── package.json
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

Default port:

```text
http://localhost:5000
```

## Authentication

Protected routes use the `x-auth-token` header.

Example:

```http
x-auth-token: your_jwt_here
```

`auth.js` verifies the token and exposes the authenticated user as `req.user`.

## Models

| Model | Purpose |
|---|---|
| User | Stores account info and hashed password |
| Category | Product category records |
| Product | Uniform listings with seller, category, price, quantity, and image URL |
| Cart | One cart per user |
| CartItem | Product entries inside a cart |
| Order | Top-level order record for a buyer |
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
| PUT | `/:id` | Update user | No |
| DELETE | `/:id` | Delete user | No |

### Categories `/api/categories`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/` | Create category | No |
| GET | `/` | Get categories | No |
| DELETE | `/:id` | Delete category | No |

### Products `/api/products`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/` | Create listing with optional image upload | Yes |
| GET | `/` | Get all products, supports seller/category query | No |
| GET | `/:id` | Get single product | No |
| PUT | `/:id` | Update product | Yes |
| DELETE | `/:id` | Delete product | Yes |

### Cart `/api/cart`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/:userId` | Get or create cart for user | No |
| POST | `/add` | Add item to cart with stock validation | No |
| DELETE | `/item/:itemId` | Remove cart item | No |

### Orders `/api/orders`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/` | Create order and deduct stock | Yes |
| GET | `/` | Get current buyer orders | Yes |
| GET | `/buyer/:userId` | Get buyer orders by user ID | Yes |
| GET | `/seller/:sellerId` | Get seller grouped incoming orders | Yes |
| GET | `/:orderId` | Get full order details | Yes |
| PATCH | `/item/:itemId/fulfill` | Mark order item fulfilled | Yes |
| PATCH | `/:orderId/deliver` | Mark order delivered | Yes |

## Behavior Notes

- Listing creation sets `seller_id` from the logged-in user token
- Cart add requests validate requested quantity against product stock
- Checkout validates stock again on the server before creating the order
- Successful orders reduce `Product.quantity`
- Profile stats are computed from `Order`, `OrderItem`, and `Product`

## Available Script

```bash
npm start
```

This runs:

```bash
nodemon server.js
```
