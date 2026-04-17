# Uniformity: Pre-loved Uniform E-Commerce Platform
**Phase 3: Frontend Development (Static UI Implementation)**

## 🚀 Project Overview
Uniformity is a peer-to-peer marketplace designed for students and professionals to buy and sell pre-loved school and departmental uniforms. This phase focused on translating the system design (ERD, DFD, and UML Use Cases) into a fully functional, responsive, and professional frontend interface using Bootstrap 5.

## 📅 What Was Implemented (Phase 3)
This week, the project transitioned from a theoretical plan to a tangible user interface. Key implementations include:

* **Static UI Architecture:** Developed 12 core HTML pages covering the entire user journey from landing to order fulfillment.
* **Responsive Design:** Utilized Bootstrap 5 and custom CSS media queries to ensure the platform scales across mobile, tablet, and desktop views.
* **Navigation & Layout:** Built a persistent dashboard sidebar for authenticated users and a clean, action-oriented navbar for the landing page.
* **Interactive Components:** Implemented functional UI toggles for mobile menus, account popups, and Bootstrap modals for profile/listing edits.
* **Static Data Mocking:** Hardcoded product grids, cart items, and order histories to demonstrate layout behavior without requiring a live database connection.

## 📂 Detailed Folder Structure
```text
/
├── frontend/
│   ├── css/
│   │   └── style.css            # Main stylesheet (Grid, Typography, UI Overrides)
│   ├── img/
│   │   └── logo.png             # Project Brand Logo
│   ├── js/
│   │   ├── api.js               # Placeholder for Phase 4 API Fetch functions
│   │   └── main.js              # Active UI Toggles (Sidebar & Profile Popup)
│   ├── index.html               # Landing Page (System Overview)
│   ├── login.html               # User Login Form
│   ├── register.html            # User Registration Form
│   ├── profile.html             # User Account & Activity Dashboard
│   ├── dashboard.html           # Main Marketplace / Browse Uniforms
│   ├── product-detail.html      # Individual Uniform Details View
│   ├── cart.html                # Shopping Cart Management
│   ├── checkout.html            # Delivery Details & Order Placement
│   ├── my-orders.html           # Buyer Order History List
│   ├── my-order-details.html    # Detailed Order Tracking & Status
│   ├── add-listing.html         # New Uniform Listing Form
│   └── my-listings.html         # Seller Inventory & Fulfillment Dashboard
│   └── README.md         