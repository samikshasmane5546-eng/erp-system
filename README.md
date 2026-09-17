# ERP Sales & Inventory Management System

A full-stack ERP application for managing the complete sales lifecycle from **customer enquiry to final dispatch**, with secure authentication, role-based access control, quotation management, and transaction-safe inventory reservation.

**Customer Enquiry → Quotation → Sales Order → Inventory Reservation → Dispatch**

---

## Overview

The system digitizes a structured sales workflow where enquiries are converted into quotations, accepted quotations become sales orders, and confirmed orders reserve inventory before dispatch.

The application is designed around **backend business rules and database consistency**, rather than being a simple CRUD application.

---

## Tech Stack

| Layer            | Technology          |
| ---------------- | ------------------- |
| Frontend         | React.js, Vite      |
| Backend          | Node.js, Express.js |
| Database         | PostgreSQL          |
| ORM              | Prisma              |
| Authentication   | JWT                 |
| Password Hashing | bcrypt              |
| Testing          | Jest, Supertest     |

---

## Key Features

### Authentication & Authorization

* JWT-based authentication
* Secure password hashing using bcrypt
* Role-based access control
* ADMIN and SALES user roles
* Backend-protected operations

### Sales Workflow

* Customer enquiry management
* Multiple products per enquiry
* Quotation generation
* Automatic discount and GST calculation
* Accepted quotation → Sales Order conversion
* Duplicate order prevention

### Inventory Management

* Physical stock tracking
* Reserved stock tracking
* Available stock calculation
* Transaction-based inventory reservation
* Row-level inventory locking
* Prevention of over-reservation
* Inventory update after dispatch
* Reserved stock release during eligible cancellation

### Dispatch

* ADMIN-only dispatch
* Courier and tracking information
* Duplicate dispatch prevention
* Prevention of dispatch beyond reserved quantity

---

## User Roles

| Feature                     | ADMIN | SALES |
| --------------------------- | :---: | :---: |
| View Enquiries              |   ✓   |   ✓   |
| Create Enquiries            |   ✓   |   ✓   |
| Create Quotations           |   ✓   |   ✓   |
| Update Quotation Status     |   ✓   |   ✓   |
| Convert Accepted Quotations |   ✓   |   ✓   |
| View Inventory              |   ✓   |   ✓   |
| Manage Products             |   ✓   |   —   |
| Confirm Sales Orders        |   ✓   |   —   |
| Dispatch Orders             |   ✓   |   —   |
| Cancel Sales Orders         |   ✓   |   —   |

---

## Business Workflow

```text
┌─────────────────────┐
│  Customer Enquiry   │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│      Quotation      │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Accepted Quotation  │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│    Sales Order      │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Order Confirmation │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Inventory Reserved  │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│      Dispatch       │
└─────────────────────┘
```

### Status Flow

**Enquiry**

`NEW → QUOTED → WON / LOST`

**Quotation**

`DRAFT → SENT → ACCEPTED / REJECTED`

**Sales Order**

`PENDING → CONFIRMED → DISPATCHED`

---

## Inventory Logic

```text
Available Quantity
       =
Physical Quantity - Reserved Quantity
```

Inventory confirmation is performed inside a **database transaction** with row-level locking.

This ensures that concurrent confirmations cannot reserve more stock than is available.

The system prevents:

* Negative inventory
* Reservation beyond available stock
* Duplicate sales orders
* Duplicate dispatches
* Dispatch beyond reserved quantity

---

## Database Design

The application uses **PostgreSQL with Prisma ORM**.

### Main Entities

```text
Users
Customers
Products
Inventory
Enquiries
EnquiryItems
Quotations
QuotationItems
SalesOrders
SalesOrderItems
Dispatches
```

The database uses primary keys, foreign keys, unique constraints and transactional operations to maintain relational integrity.

---

## Project Structure

```text
erp-system/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   └── tests/
│
├── frontend/
│   └── src/
│
├── docs/
│   ├── API.md
│   └── ERD.md
│
├── README.md
└── .gitignore
```

---

## API Documentation

Detailed API documentation is available here:

**[API Documentation](docs/API.md)**

**[ERD / Database Design](docs/ERD.md)**

---

## Running the Project

### 1. Clone the Repository

```bash
git clone https://github.com/samikshasmane5546-eng/erp-system.git
cd erp-system
```

### 2. Start the Backend

```bash
cd backend
npm install
npx prisma generate
node src/index.js
```

Backend:

`http://localhost:5000`

### 3. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

`http://localhost:5173`

> Database credentials and JWT secrets are configured through environment variables and are not committed to the repository.

---

## Testing

Backend API tests can be executed using:

```bash
cd backend
npm test
```

The test suite covers authentication, role authorization and important sales-order business rules.

---

## Security

The application implements:

* JWT authentication
* bcrypt password hashing
* Backend role-based authorization
* Protected REST APIs
* Input validation
* Environment-based configuration
* Transaction-safe inventory operations
* Database-level uniqueness constraints

---

## Documentation

The repository contains supporting technical documentation covering:

* REST API endpoints
* Database entities and relationships
* Authentication and authorization
* Inventory management
* Transaction handling
* Business workflow

A separate detailed project documentation link is provided with the project submission.

---

## Repository

**GitHub:**
https://github.com/samikshasmane5546-eng/erp-system


