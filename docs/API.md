\# ERP Sales \& Inventory Management System — API Documentation



\## Base URL



`http://localhost:5000`



\## Authentication



The API uses JWT authentication.



For protected endpoints, send:



`Authorization: Bearer <JWT\_TOKEN>`



Roles:



\* `ADMIN`

\* `SALES`



\---



\## 1. Authentication



\### POST `/auth/login`



Logs in a user and returns a JWT token.



\*\*Request Body\*\*



```json

{

&#x20; "email": "admin@erp.com",

&#x20; "password": "Admin@123"

}

```



\*\*Response\*\*



```json

{

&#x20; "message": "Login successful",

&#x20; "token": "<JWT\_TOKEN>",

&#x20; "user": {

&#x20;   "id": 1,

&#x20;   "name": "Admin",

&#x20;   "email": "admin@erp.com",

&#x20;   "role": "ADMIN"

&#x20; }

}

```



\---



\## 2. Products



\### GET `/api/products`



Returns all products with inventory information.



\*\*Authorization:\*\* ADMIN, SALES



\*\*Response includes:\*\*



\* Product name

\* SKU

\* Unit price

\* Physical quantity

\* Reserved quantity

\* Available quantity



Available quantity:



`available = physicalQty - reservedQty`



\### POST `/api/products`



Creates a new product.



\*\*Authorization:\*\* ADMIN only



\*\*Request Body\*\*



```json

{

&#x20; "name": "Industrial Motor",

&#x20; "sku": "IM-007",

&#x20; "description": "Industrial motor",

&#x20; "unitPrice": 30000,

&#x20; "physicalQty": 20

}

```



Negative quantities and duplicate SKUs are rejected.



\---



\## 3. Customer Enquiries



\### POST `/api/enquiries`



Creates a customer enquiry with multiple products.



\*\*Authorization:\*\* ADMIN, SALES



\*\*Request Body\*\*



```json

{

&#x20; "customer": {

&#x20;   "name": "ABC Manufacturing",

&#x20;   "email": "abc@example.com",

&#x20;   "phone": "9876543210"

&#x20; },

&#x20; "details": "Need hydraulic pumps for production line",

&#x20; "items": \[

&#x20;   {

&#x20;     "productId": 1,

&#x20;     "quantity": 5

&#x20;   }

&#x20; ]

}

```



Initial status:



`NEW`



\### GET `/api/enquiries`



Returns enquiries with customer, products and quotation information.



\*\*Authorization:\*\* ADMIN, SALES



\---



\## 4. Quotations



\### POST `/api/quotations`



Creates a quotation for a NEW enquiry.



\*\*Authorization:\*\* ADMIN, SALES



The backend calculates:



\* Line amount

\* Subtotal

\* Discount

\* GST

\* Grand total



The client cannot directly override the calculated grand total.



\*\*Request Body\*\*



```json

{

&#x20; "enquiryId": 1,

&#x20; "validUntil": "2026-09-30",

&#x20; "discount": 10,

&#x20; "gst": 18

}

```



Quotation status:



`DRAFT`



The related enquiry changes from:



`NEW → QUOTED`



\### GET `/api/quotations`



Returns quotations with enquiry, customer, products and sales order information.



\*\*Authorization:\*\* ADMIN, SALES



\### PATCH `/api/quotations/:id/status`



Updates quotation status.



\*\*Authorization:\*\* ADMIN, SALES



\*\*Request Body\*\*



```json

{

&#x20; "status": "ACCEPTED"

}

```



Supported statuses:



`DRAFT | SENT | ACCEPTED | REJECTED`



\---



\## 5. Convert Quotation to Sales Order



\### POST `/api/quotations/:id/convert`



Converts an accepted quotation into a sales order.



\*\*Authorization:\*\* ADMIN, SALES



Only `ACCEPTED` quotations can be converted.



DRAFT and REJECTED quotations are rejected.



Duplicate conversion is prevented.



The quotation remains traceable to the generated sales order.



The related enquiry becomes:



`QUOTED → WON`



\---



\## 6. Sales Orders



\### GET `/api/sales-orders`



Returns sales orders with customer, quotation, items and dispatch information.



\*\*Authorization:\*\* ADMIN, SALES



\### POST `/api/sales-orders/:id/confirm`



Confirms a pending sales order and reserves inventory.



\*\*Authorization:\*\* ADMIN only



During confirmation:



1\. Inventory rows are locked using a database transaction.

2\. Available quantity is calculated.

3\. The requested quantity is checked.

4\. Reserved quantity is increased.

5\. Order status becomes `CONFIRMED`.



Reservation beyond available stock is rejected.



\### POST `/api/sales-orders/:id/dispatch`



Dispatches a confirmed sales order.



\*\*Authorization:\*\* ADMIN only



\*\*Request Body\*\*



```json

{

&#x20; "courierName": "DHL",

&#x20; "trackingNo": "TRK-001",

&#x20; "notes": "Dispatched successfully"

}

```



During dispatch:



\* Physical quantity decreases.

\* Reserved quantity decreases.

\* Dispatch record is created.

\* Order status becomes `DISPATCHED`.



Duplicate dispatch is prevented.



Dispatch quantity cannot exceed reserved inventory.



\### PATCH `/api/sales-orders/:id/cancel`



Cancels an eligible sales order.



\*\*Authorization:\*\* ADMIN only



If the order was already confirmed, its reserved inventory is released.



A dispatched or already cancelled order cannot be cancelled.



\---



\## 7. HTTP Status Codes



| Status | Meaning                               |

| ------ | ------------------------------------- |

| 200    | Successful operation                  |

| 201    | Resource created                      |

| 400    | Invalid request/business rule         |

| 401    | Authentication required/invalid token |

| 403    | Insufficient permissions              |

| 404    | Resource not found                    |

| 409    | Duplicate/conflicting operation       |

| 500    | Internal server error                 |



\---



\## 8. Security



The backend implements:



\* JWT authentication

\* bcrypt password hashing

\* Protected routes

\* Backend role-based authorization

\* Input validation

\* Database transactions for inventory operations

\* Environment-based configuration for secrets/database credentials



\---



\## 9. Main API Workflow



`POST /api/enquiries`



↓



`POST /api/quotations`



↓



`PATCH /api/quotations/:id/status`



↓



`POST /api/quotations/:id/convert`



↓



`POST /api/sales-orders/:id/confirm`



↓



`POST /api/sales-orders/:id/dispatch`



This represents the complete ERP sales and inventory workflow.



