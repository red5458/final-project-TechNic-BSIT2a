# Uniformity - Backend

A RESTful API for **Uniformity**, an e-commerce platform for pre-loved school and professional uniforms.

---

## ⚙️ Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- bcryptjs, jsonwebtoken (auth)
- multer, cloudinary (media uploads)
- dotenv, cors, nodemon

---

## 📁 Folder Structure

```
/backend
├── server.js
├── seed.js
├── .env
├── /config
│   ├── db.js
│   └── cloudinary.js
├── /middleware
│   └── auth.js
├── /models
│   ├── User.js
│   ├── Category.js
│   ├── Product.js
│   ├── Cart.js
│   ├── CartItem.js
│   ├── Order.js
│   └── OrderItem.js
├── /controllers
│   ├── authController.js
│   ├── userController.js
│   ├── categoryController.js
│   ├── productController.js
│   ├── cartController.js
│   └── orderController.js
└── /routes
    ├── authRoutes.js
    ├── userRoutes.js
    ├── categoryRoutes.js
    ├── productRoutes.js
    ├── cartRoutes.js
    └── orderRoutes.js
```

---

## 🗄️ Models

| Model | Description |
|---|---|
| User | Stores buyer/seller accounts with hashed passwords |
| Category | Uniform categories (School, Professional) |
| Product | Uniform listings by sellers, with Cloudinary image URL |
| Cart | Shopping cart per user |
| CartItem | Individual items inside a cart |
| Order | Orders placed by buyers |
| OrderItem | Individual items per order with seller reference |

---

## 🔌 Connection Setup

1. Create a `.env` file inside `/backend`:

```
MONGO_URI=your_mongodb_connection_string_here
PORT=5000
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

2. Install dependencies:

```bash
npm install
```

3. Seed categories (run once only):

```bash
node seed.js
```

4. Start the server:

```bash
npm start
```

---

## 🔐 Authentication

Authentication uses **JWT (JSON Web Tokens)**. Passwords are hashed with **bcryptjs** before storage.

- Tokens are issued on login and must be sent in the `x-auth-token` request header to access protected routes.
- The `auth` middleware in `/middleware/auth.js` verifies the token before allowing access to private endpoints.
- Protected routes: creating, updating, and deleting products require a valid token. The `seller_id` is automatically set from the token.

### Auth `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user (password is hashed) |
| POST | `/api/auth/login` | Login and receive a JWT |
| GET | `/api/auth/me` | Get logged-in user's data (requires token) |

---

## 📡 API Routes

### Users `/api/users`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users` | Register a new user |
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Categories `/api/categories`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/categories` | Create a category |
| GET | `/api/categories` | Get all categories |
| DELETE | `/api/categories/:id` | Delete a category |

### Products `/api/products`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/products` | List a uniform (image uploaded to Cloudinary) | ✅ |
| GET | `/api/products` | Browse all uniforms | ❌ |
| GET | `/api/products/:id` | Get uniform details | ❌ |
| PUT | `/api/products/:id` | Update a listing | ✅ |
| DELETE | `/api/products/:id` | Delete a listing | ✅ |

### Cart `/api/cart`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cart/:userId` | Get or create user cart |
| POST | `/api/cart/add` | Add item to cart |
| DELETE | `/api/cart/item/:itemId` | Remove item from cart |

### Orders `/api/orders`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Place an order |
| GET | `/api/orders/buyer/:userId` | Get buyer's orders |
| GET | `/api/orders/seller/:sellerId` | Get seller's order items |
| PATCH | `/api/orders/item/:itemId/fulfill` | Seller fulfills an item |
| PATCH | `/api/orders/:orderId/deliver` | Buyer marks as delivered |

---

## 👥 Group

**TechNic** — BSIT-2A | Bicol University Polangui
