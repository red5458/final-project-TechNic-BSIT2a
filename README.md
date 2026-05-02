# Uniformity

<p align="center">
  <img src="https://res.cloudinary.com/dbx0kk6wq/image/upload/v1776216871/Uniformity-logo_bevwxj.png" alt="Uniformity Logo" width="200"/>
</p>

Uniformity is a web-based marketplace for buying and selling pre-loved uniforms safely, conveniently, and sustainably.

## Project Overview

Uniformity helps students and other users exchange uniforms that are still in good condition. Buyers can browse listings, add products to cart, check out selected items, and track orders. Sellers can create listings, manage inventory, and fulfill incoming order items.

## Group Information

**Group Name:** TechNic  
**Course & Block:** BSIT-2A  
**School:** Bicol University Polangui

| Member | Role |
|---|---|
| Mcxyron B. Cipriano | Back-End Developer |
| Jay L. Romano | Front-End Developer |
| Paul Orlando B. Red | Project, Database, GitHub Manager & Documentation Officer |
| Kurt Jushua S. Hernandez | Database Manager, Tester & Debugger |
| Mharie Franz Registrado | Tester & Debugger |

## Current Features

- User registration, login, JWT authentication, email OTP verification, forgot password, and protected account flows
- Product listing creation with category, size, price, stock quantity, description, and optional Cloudinary image upload
- Product browsing with search, filters, sorting, pagination, and product detail pages
- Cart management with quantity controls, selected-item checkout, delete confirmation modal, and stock-aware limits
- Dynamic checkout summary based on selected cart items
- Seller-aware checkout: products from different sellers become separate orders; products from the same seller stay grouped in one order
- Buyer order history and order details pages
- Pending order cancellation with confirmation modal and stock restoration
- Seller incoming orders table with item-level fulfillment
- Cancelled-order handling on buyer and seller screens
- Profile page with live user details, buyer/seller stats, and recent order activity
- Shared UI polish including lighter typography, smoother hover states, modal animations, and reduced-motion support

## Main Folders

```text
finalprojectTechNic-BSIT2a/
|-- backend/      Express, MongoDB, API routes, models, controllers
|-- database/     Planning/database resources
|-- docs/         Project documentation assets
|-- frontend/     HTML, CSS, Bootstrap, and vanilla JavaScript UI
`-- README.md
```

## Development Timeline

| Phase | Focus Area |
|---|---|
| Phase 1 | Project planning, proposal, system architecture, feature list, database schema, repository setup |
| Phase 2 | Node.js, Express, MongoDB, Mongoose models, and backend route scaffolding |
| Phase 3 | HTML, CSS, Bootstrap layouts, landing page, auth pages, dashboard UI |
| Phase 4 | Form submissions, API integration, validation, and MongoDB data insertion |
| Phase 5 | Data retrieval and display for products, cart, orders, profile, and seller pages |
| Phase 6 | Update/delete flows, cart deletion confirmation, listing edit/delete, order fulfillment, order cancellation |
| Phase 7 | UI cleanup, mobile testing, animation polish, documentation, and final debugging |

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

Default backend URL:

```text
http://localhost:5000
```

### Frontend

Open the files in `frontend/` using a local static server such as VS Code Live Server. The frontend expects the API base URL in `frontend/js/api.js`:

```js
const API_BASE = 'http://localhost:5000/api';
```

## System Design & Diagrams

### Data Flow Diagram

<p align="center">
  <img src="https://res.cloudinary.com/dbx0kk6wq/image/upload/v1776955475/DFD_apfxk4.png" alt="DFD Diagram" width="700"/>
</p>

### Entity Relationship Diagram

<p align="center">
  <img src="https://res.cloudinary.com/dbx0kk6wq/image/upload/v1776955476/ERD_yib3lb.png" alt="ERD Diagram" width="700"/>
</p>

### Unified Modeling Language

<p align="center">
  <img src="https://res.cloudinary.com/dbx0kk6wq/image/upload/v1776955475/UML_kcun7a.png" alt="UML Diagram" width="700"/>
</p>
