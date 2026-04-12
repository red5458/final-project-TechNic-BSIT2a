# Uniformity - Backend

A RESTful API for **Uniformity**, an e-commerce platform for pre-loved school and professional uniforms.

---

## ⚙️ Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- dotenv, cors, nodemon

---

## 📁 Folder Structure

```
/backend
├── server.js
├── seed.js
├── .env
├── /config
│   └── db.js
├── /models
│   ├── User.js
│   ├── Category.js
│   ├── Product.js
│   ├── Cart.js
│   ├── CartItem.js
│   ├── Order.js
│   └── OrderItem.js
├── /controllers
│   ├── userController.js
│   ├── categoryController.js
│   ├── productController.js
│   ├── cartController.js
│   └── orderController.js
└── /routes
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
| User | Stores buyer/seller accounts |
| Category | Uniform categories (School, Professional) |
| Product | Uniform listings by sellers |
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

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/products` | List a uniform |
| GET | `/api/products` | Browse all uniforms |
| GET | `/api/products/:id` | Get uniform details |
| PUT | `/api/products/:id` | Update a listing |
| DELETE | `/api/products/:id` | Delete a listing |

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
