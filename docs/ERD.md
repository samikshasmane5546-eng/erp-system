\# ERP Sales \& Inventory Management System — ERD



\## Database



PostgreSQL



\## Entity Relationship Overview



The system uses a relational database to maintain customers, enquiries, quotations, sales orders, products, inventory and dispatch records.



\## Entities



\### 1. User



\* `id` — Primary Key

\* `name`

\* `email` — Unique

\* `passwordHash`

\* `role`

\* `createdAt`



\### 2. Customer



\* `id` — Primary Key

\* `name`

\* `email`

\* `phone`

\* `address`

\* `createdAt`



\### 3. Product



\* `id` — Primary Key

\* `name`

\* `sku` — Unique

\* `description`

\* `unitPrice`

\* `createdAt`



\### 4. Inventory



\* `id` — Primary Key

\* `productId` — Foreign Key, Unique

\* `physicalQty`

\* `reservedQty`

\* `updatedAt`



Available inventory is calculated as:



`physicalQty - reservedQty`



\### 5. Enquiry



\* `id` — Primary Key

\* `customerId` — Foreign Key

\* `details`

\* `status`

\* `createdAt`



\### 6. EnquiryItem



\* `id` — Primary Key

\* `enquiryId` — Foreign Key

\* `productId` — Foreign Key

\* `quantity`



Unique constraint:



`(enquiryId, productId)`



\### 7. Quotation



\* `id` — Primary Key

\* `enquiryId` — Foreign Key, Unique

\* `validUntil`

\* `discount`

\* `gst`

\* `grandTotal`

\* `status`

\* `createdAt`



\### 8. QuotationItem



\* `id` — Primary Key

\* `quotationId` — Foreign Key

\* `productId` — Foreign Key

\* `quantity`

\* `unitPrice`

\* `lineAmount`



Unique constraint:



`(quotationId, productId)`



\### 9. SalesOrder



\* `id` — Primary Key

\* `quotationId` — Foreign Key, Unique

\* `status`

\* `createdAt`

\* `confirmedAt`

\* `dispatchedAt`



\### 10. SalesOrderItem



\* `id` — Primary Key

\* `salesOrderId` — Foreign Key

\* `productId` — Foreign Key

\* `quantity`



Unique constraint:



`(salesOrderId, productId)`



\### 11. Dispatch



\* `id` — Primary Key

\* `salesOrderId` — Foreign Key, Unique

\* `dispatchDate`

\* `courierName`

\* `trackingNo`

\* `notes`



\## Relationships



```text

User

&#x20; └── Authentication / Authorization



Customer

&#x20; │

&#x20; └── 1 ──── N Enquiry

&#x20;                   │

&#x20;                   ├── 1 ──── N EnquiryItem ──── N : 1 Product

&#x20;                   │

&#x20;                   └── 1 ──── 1 Quotation

&#x20;                                     │

&#x20;                                     ├── 1 ──── N QuotationItem ──── N : 1 Product

&#x20;                                     │

&#x20;                                     └── 1 ──── 1 SalesOrder

&#x20;                                                       │

&#x20;                                                       ├── 1 ──── N SalesOrderItem ──── N : 1 Product

&#x20;                                                       │

&#x20;                                                       └── 1 ──── 1 Dispatch



Product

&#x20; │

&#x20; └── 1 ──── 1 Inventory

```



\## Relationship Summary



| Relationship                | Cardinality |

| --------------------------- | ----------- |

| Customer → Enquiry          | 1 : N       |

| Enquiry → EnquiryItem       | 1 : N       |

| Product → EnquiryItem       | 1 : N       |

| Enquiry → Quotation         | 1 : 1       |

| Quotation → QuotationItem   | 1 : N       |

| Product → QuotationItem     | 1 : N       |

| Quotation → SalesOrder      | 1 : 1       |

| SalesOrder → SalesOrderItem | 1 : N       |

| Product → SalesOrderItem    | 1 : N       |

| Product → Inventory         | 1 : 1       |

| SalesOrder → Dispatch       | 1 : 1       |



\## Data Integrity



The database uses:



\* Primary keys

\* Foreign keys

\* Unique constraints

\* Cascading deletes for dependent item records

\* Database transactions for inventory reservation and dispatch

\* Row-level locking during inventory confirmation



These mechanisms help maintain consistency throughout the sales and inventory workflow.



