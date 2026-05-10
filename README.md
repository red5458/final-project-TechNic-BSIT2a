# Uniformity

<p align="center">
  <img src="https://res.cloudinary.com/dbx0kk6wq/image/upload/v1776216871/Uniformity-logo_bevwxj.png" alt="Uniformity Logo" width="200"/>
</p>

Uniformity is a full-stack web marketplace for buying and selling pre-loved school uniforms. The system helps students browse available uniforms, manage a cart, place orders, sell their own listings, and track fulfillment through a buyer-seller order flow. It also includes an admin panel for managing users, products, categories, and orders without hardcoded data changes.

The application is served as a single Render web service: the Express backend provides the REST API and also serves the static frontend files. A basic Progressive Web App layer is included so the app can be installed and can load cached pages when offline.

## Live Demo

[Open Uniformity on Render](https://final-project-technic-bsit2a.onrender.com)

## Features

- User registration, login, JWT authentication, and protected routes
- Student account flow that can act as both buyer and seller
- Product browsing with search, category/size filters, sorting, and pagination
- Product detail page with seller contact area, image preview overlay, and related products
- Cart management with quantity controls, delete confirmation, stock-aware limits, and live badge count
- Checkout with saved name/phone fields and delivery details
- Seller-aware order creation: items from different sellers become separate orders
- Buyer order history, order details, pending order cancellation, received confirmation, and order history deletion
- Seller listing management with add, edit, delete, and incoming order fulfillment
- Seller order status flow from pending to fulfilled, then delivered after buyer receipt confirmation
- Admin dashboard with statistics and management sections
- Admin controls for users, products, categories, and orders
- Search/filter tools inside admin sections
- Responsive layouts for desktop, tablet, and mobile screens
- Sticky topbars, mobile sidebar, modal confirmations, and polished UI states
- PWA support with `manifest.json`, service worker caching, installability, and basic offline app-shell loading

## Technologies Used

### Frontend

- HTML5
- CSS3
- Bootstrap 5
- Bootstrap Icons
- Vanilla JavaScript
- Progressive Web App assets: Web App Manifest and Service Worker

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token authentication
- bcrypt password hashing
- Cloudinary image upload support

### Tools and Deployment

- Git and GitHub
- Render Web Service
- VS Code
- Chrome DevTools for PWA testing

## Installation Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd finalprojectTechNic-BSIT2a
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

## Project Structure

```text
finalprojectTechNic-BSIT2a/
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- utils/
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

## Screenshots

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

## System Diagrams

### Data Flow Diagram

<p align="center">
  <img src="https://res.cloudinary.com/dbx0kk6wq/image/upload/v1776955475/DFD_apfxk4.png" alt="Data Flow Diagram" width="700"/>
</p>

### Entity Relationship Diagram

<p align="center">
  <img src="docs/planning/ERD.png" alt="Entity Relationship Diagram" width="700"/>
</p>

### Unified Modeling Language Diagram

<p align="center">
  <img src="docs/planning/UML.svg" alt="UML Diagram" width="700"/>
</p>

## Contributors

| Name | Role |
|---|---|
| Mcxyron B. Cipriano | Back-End Developer |
| Jay L. Romano | Front-End Developer |
| Paul Orlando B. Red | Project Manager, Database Manager, GitHub Manager, Documentation Officer |
| Kurt Jushua S. Hernandez | Database Manager, Tester, Debugger |
| Mharie Franz Registrado | Tester, Debugger |

## Group Information

**Group Name:** TechNic  
**Course & Block:** BSIT-2A  
**School:** Bicol University Polangui

## Notes

- `node_modules/` and `.env` are excluded through `.gitignore`.
- Runtime secrets should stay inside `backend/.env` and should not be committed.
- PWA files are intentionally kept in `frontend/` because that folder is served as the site root.
- Documentation assets are kept in `docs/` for lab reports, planning diagrams, and screenshots.
