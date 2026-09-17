\# ERP Sales \& Inventory Management System



A full-stack ERP application that manages the complete business workflow:



\*\*Customer Enquiry → Quotation → Sales Order → Inventory Reservation → Dispatch\*\*



\## Tech Stack



\* \*\*Frontend:\*\* React.js, Vite

\* \*\*Backend:\*\* Node.js, Express.js

\* \*\*Database:\*\* PostgreSQL

\* \*\*ORM:\*\* Prisma

\* \*\*Authentication:\*\* JWT

\* \*\*Password Security:\*\* bcrypt

\* \*\*Testing:\*\* Jest, Supertest



\## Features



\* JWT-based authentication

\* Role-based access control

\* ADMIN and SALES roles

\* Customer enquiry management

\* Multi-product quotations

\* Automatic quotation total calculation

\* Sales order creation from accepted quotations

\* Inventory availability tracking

\* Transaction-based inventory reservation

\* Sales order confirmation and dispatch

\* Order cancellation with inventory release

\* Backend validation and error handling

\* Automated API testing



\## User Roles



| Feature                     | ADMIN | SALES |

| --------------------------- | :---: | :---: |

| View Enquiries              |   ✓   |   ✓   |

| Create Enquiries            |   ✓   |   ✓   |

| Create Quotations           |   ✓   |   ✓   |

| Convert Accepted Quotations |   ✓   |   ✓   |

| View Inventory              |   ✓   |   ✓   |

| Manage Products             |   ✓   |   —   |

| Confirm Sales Orders        |   ✓   |   —   |

| Dispatch Orders             |   ✓   |   —   |

| Cancel Orders               |   ✓   |   —   |



\## Workflow



```text

Customer Enquiry

&#x20;      ↓

Quotation

&#x20;      ↓

Accepted Quotation

&#x20;      ↓

Sales Order

&#x20;      ↓

Order Confirmation

&#x20;      ↓

Inventory Reservation

&#x20;      ↓

Dispatch

```



\### Status Flow



\*\*Enquiry\*\*



`NEW → QUOTED → WON / LOST`



\*\*Quotation\*\*



`DRAFT → SENT → ACCEPTED / REJECTED`



\*\*Sales Order\*\*



`PENDING → CONFIRMED → DISPATCHED`



\## Inventory Logic



```text

Available Quantity = Physical Quantity - Reserved Quantity

```



Inventory reservation and dispatch are handled using database transactions to maintain stock consistency.



The system prevents:



\* Reservation beyond available stock

\* Negative inventory

\* Duplicate sales orders

\* Duplicate dispatches

\* Dispatch beyond reserved quantity



\## Database



The application uses PostgreSQL with Prisma ORM.



Main entities:



\* Users

\* Customers

\* Products

\* Inventory

\* Enquiries

\* Enquiry Items

\* Quotations

\* Quotation Items

\* Sales Orders

\* Sales Order Items

\* Dispatches



\### Documentation



\* \[API Documentation](docs/API.md)

\* \[ERD / Database Design](docs/ERD.md)



\## Project Structure



```text

erp-system/

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

└── README.md

```



\## Running the Project



\### Backend



```bash

cd backend

npm install

npx prisma generate

node src/index.js

```



\### Frontend



```bash

cd frontend

npm install

npm run dev

```



\## Testing



From the backend directory:



```bash

npm test

```



The automated tests cover authentication, role authorization and important sales-order business rules.



## Documentation

Detailed project documentation covers the system workflow, database design, APIs, authentication, inventory management, transactions, testing and operational scenarios.

**Project documentation:** Add the separate documentation link here after uploading it.

## Repository

**GitHub:**
https://github.com/samikshasmane5546-eng/erp-system




