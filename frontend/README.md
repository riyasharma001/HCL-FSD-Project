# OrderCraft — Angular Material Frontend

Modern Angular application for **OrderCraft: Manufacturing Order Management System**, built with **Angular 22** and **Angular Material**.

---

## 🛠️ Tech Stack & Features

- **Angular 22** (Standalone Components, Signals, Router with lazy loading)
- **Angular Material** (Material 3 components, tabs, tables, cards, snackbars, form fields)
- **SCSS Styling** (Custom theme matching OrderCraft branding `#1b4332` / `#2d6a4f`)
- **Proxy Configuration** (`proxy.conf.json`) forwarding `/api` requests to Spring Boot on `http://localhost:8082`

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **npm** (v9+)
- **Spring Boot Backend** running on `http://localhost:8082`

### 2. Run Development Server
```bash
npm start
# or
ng serve --proxy-config proxy.conf.json
```
Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### 3. Production Build
```bash
npm run build
```
The build artifacts will be stored in the `dist/frontend` directory.

---

## 📱 Modules & Pages

1. **Dashboard (`/dashboard`)**:
   - Executive revenue & sales KPIs
   - Order-to-Cash visual progress pipeline
   - Recent orders overview & low-stock raw materials warning table
2. **Master Data (`/masters`)**:
   - Tabbed catalog for Customers, Finished Products, Raw Materials, and Bill of Materials (BOM)
   - Add/edit modal forms with real-time validation
3. **Sales Orders (`/orders`)**:
   - Interactive order creation with multi-product cart
   - Dynamic BOM explosion and shortage analysis
   - Order lifecycle workflow: Create POs, Confirm, Advance (Shipped/Completed), Cancel, and Invoice
4. **Procurement (`/procurement`)**:
   - Purchase orders tracking
   - "Receive Delivery" action that automatically restocks inventory
5. **Finance & Invoicing (`/finance`)**:
   - Accounts receivable ledger with 18% GST calculation
   - Payment collection modal (Cash, UPI, Card, Bank Transfer)
   - Transaction audit history
6. **Authentication (`/login`)**:
   - Clean sign-in screen (Demo: `admin` / `admin123`)
