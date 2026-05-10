# Uniformity

<p align="center">
  <img src="https://res.cloudinary.com/dbx0kk6wq/image/upload/v1776216871/Uniformity-logo_bevwxj.png" alt="Uniformity Logo" width="220"/>
</p>

<h3 align="center">Uniformity: A Pre-Loved Uniform Marketplace</h3>

<p align="center">
  <em>Buy, sell, and manage school/professional uniforms in one simple full-stack web app.</em>
</p>

<hr/>

<p align="center">
  <a href="https://final-project-technic-bsit2a.onrender.com">
    <img src="https://img.shields.io/badge/LIVE%20DEMO-Open%20App-2D6A4F?style=for-the-badge&logo=render&logoColor=white" alt="Live Demo"/>
  </a>
  <img src="https://img.shields.io/badge/VERSION-1.0-95B8A4?style=for-the-badge" alt="Version 1.0"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white" alt="HTML5"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white" alt="CSS3"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/Bootstrap-7952B3?style=flat&logo=bootstrap&logoColor=white" alt="Bootstrap"/>
  <img src="https://img.shields.io/badge/Node.js-5FA04E?style=flat&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white" alt="Express.js"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Render-000000?style=flat&logo=render&logoColor=white" alt="Render"/>
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=flat&logo=cloudinary&logoColor=white" alt="Cloudinary"/>
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=flat&logo=pwa&logoColor=white" alt="PWA"/>
</p>

<hr/>

## 🌱 About the Project

Uniformity is a full-stack web marketplace for buying and selling pre-loved uniforms. The system helps students browse available uniforms, manage a cart, place orders, sell their own listings, and track fulfillment through a buyer-seller order flow.

The application is served as a single Render web service. The Express backend provides the REST API and also serves the static frontend files. A basic Progressive Web App layer is included so the app can be installed and can load cached pages when offline.

## ✨ Features

- 🔐 User registration, login, JWT authentication, and protected routes
- 👥 Student account flow that can act as both buyer and seller
- 🔎 Product browsing with search, category/size filters, sorting, and pagination
- 🧵 Product detail page with seller contact area, image preview overlay, and related products
- 🛒 Cart management with quantity controls, delete confirmation, stock-aware limits, and live badge count
- 📦 Checkout with saved name/phone fields and delivery details
- 🧾 Seller-aware order creation where items from different sellers become separate orders
- 📍 Buyer order history, order details, cancellation, receipt confirmation, and history deletion
- 🏷️ Seller listing management with add, edit, delete, and incoming order fulfillment
- 🚚 Seller order status flow from pending to fulfilled, then delivered after buyer receipt confirmation
- 🛠️ Admin dashboard for users, products, categories, and orders
- 📱 Responsive layouts for desktop, tablet, and mobile screens
- ⚡ PWA support with `manifest.json`, service worker caching, installability, and basic offline app-shell loading

## 🚀 Live Demo

Open the deployed project here:

[https://final-project-technic-bsit2a.onrender.com](https://final-project-technic-bsit2a.onrender.com)

## 🧰 Tech Stack

| Frontend | Backend | Database & Storage | Tools & Deployment |
|---|---|---|---|
| HTML5 | Node.js | MongoDB | Git & GitHub |
| CSS3 | Express.js | Mongoose | Render Web Service |
| Bootstrap 5 | JSON Web Token | Cloudinary | VS Code |
| Bootstrap Icons | bcryptjs |  | Chrome DevTools |
| Vanilla JavaScript | Multer |  |  |
| PWA Manifest & Service Worker | dotenv |  |  |

## ⚙️ Installation Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd final-project-TechNic-BSIT2a
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Run the App Locally

```bash
npm run dev
```

Then open:

```text
http://localhost:5000
```

The backend serves the frontend from the `frontend/` folder, so the same local server handles both static pages and `/api` routes.

## 🗂️ Project Structure

```text
final-project-TechNic-BSIT2a/
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   `-- server.js
|-- database/
|-- docs/
|   |-- lab11/
|   `-- planning/
|-- frontend/
|   |-- css/
|   |-- img/
|   |-- js/
|   |-- manifest.json
|   |-- sw.js
|   `-- *.html
|-- .gitignore
`-- README.md
```

## 📸 Screenshots

### Landing Page

![Landing Page](docs/lab11/Landing%20Page.png)

### Browse Uniforms

![Browse Uniforms](docs/lab11/Browse%20Uniforms.png)

### Product Detail

![Product Detail](docs/lab11/Product%20Detail.png)

### Cart

![Cart](docs/lab11/Cart.png)

### Checkout

![Checkout](docs/lab11/Checkout.png)

### My Orders

![My Orders](docs/lab11/Orders.png)

### My Listings

![My Listings](docs/lab11/Listings.png)

### My Profile

![My Profile](docs/lab11/My%20Profile.png)

## 🧭 System Diagrams

### Data Flow Diagram

<p align="center">
  <img src="https://res.cloudinary.com/dbx0kk6wq/image/upload/v1776955475/DFD_apfxk4.png" alt="Data Flow Diagram" width="700"/>
</p>

### Entity Relationship Diagram

<p align="center">
  <img src="docs/planning/Final-ERD.png" alt="Entity Relationship Diagram" width="700"/>
</p>

### Unified Modeling Language Diagram

<p align="center">
  <img src="docs/planning/Final-UML.svg" alt="UML Diagram" width="700"/>
</p>

## 👨‍💻 Contributors

| Name | Role |
|---|---|
| Mcxyron B. Cipriano | Back-End Developer |
| Jay L. Romano | Front-End Developer |
| Paul Orlando B. Red | Project Manager, Database Manager, GitHub Manager, Documentation Officer |
| Kurt Jushua S. Hernandez | Database Manager, Tester, Debugger |
| Mharie Franz Registrado | Tester, Debugger |

## 🎓 Group Information

**Group Name:** TechNic  
**Course & Block:** BSIT-2A  
**School:** Bicol University Polangui

## 📝 Notes

- `node_modules/` and `.env` are excluded through `.gitignore`.
- Runtime secrets should stay inside `backend/.env` and should not be committed.
- PWA files are intentionally kept in `frontend/` because that folder is served as the site root.
- Documentation assets are kept in `docs/` for lab reports, planning diagrams, and screenshots.
