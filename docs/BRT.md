# OrderCraft — Business Requirements Document (BRD)

| | |
|---|---|
| **Project** | OrderCraft — Manufacturing Order Management System |
| **Document version** | 1.0 (draft for review) |
| **Date** | 29 Sep 2026 |
| **Source** | `README.md`, `PROJECT_MODULES.md` (v1.0, 28 Sep 2026) |
| **Status** | Draft. Items marked **[Assumption]** or **[TBC]** need business confirmation. |

---

## 1. Executive summary

General-purpose manufacturers often run the commercial side of their business on spreadsheets and email: taking customer orders, working out which raw materials to buy, raising purchase orders, invoicing and chasing payments. This is slow, error-prone and gives management no real-time view.

**OrderCraft** is a web-based Order Management System that digitises the entire **order-to-cash** cycle: sales orders, automatic bill-of-materials (BOM) explosion, procurement, lightweight inventory, customer and vendor invoicing, payment tracking, configurable approvals and dashboards.

## 2. Business objectives

| # | Objective | Business outcome |
|---|---|---|
| BO-1 | Streamline order processing | Replace spreadsheet/manual order tracking with one central system |
| BO-2 | Automate BOM generation | Material requirements calculated automatically when an order is approved |
| BO-3 | Automate procurement | Purchase orders suggested/created from material shortfalls against current stock |
| BO-4 | Financial visibility | Full accounts receivable (customer invoices) and accounts payable (vendor payments) tracking |
| BO-5 | Approval control | Configurable multi-step approvals for sales orders, purchase orders and invoices |
| BO-6 | Real-time insight | Dashboards for order pipeline, revenue, overdue payments and stock status |

## 3. Scope

### 3.1 In scope
Authentication and role-based access; user/role management; customer, vendor and item masters; BOM with versioning and costing; sales orders; purchase orders and goods receipt; lightweight inventory; AR/AP invoicing with credit notes; payment tracking; approval workflow engine; dashboards and reports (PDF/CSV); audit fields on all records; system configuration.

### 3.2 Out of scope
| Item | Handled by |
|---|---|
| Production / work-order tracking | External (shop-floor systems or manual) |
| Warehouse management (bins, zones, locations) | Not supported; aggregate stock only |
| Shipping and logistics / dispatch tracking | Not supported |
| Email / push notifications | Not in v1; users rely on dashboards. May be added later |

### 3.3 Delivery status (as of README)
Only **Module 1 (Authentication & Authorization)** and the user/role/permission data model are built. All other modules and the Angular frontend are specified but not yet implemented.

## 4. Stakeholders and user roles

| Stakeholder / role | Interest | Key needs |
|---|---|---|
| **Business owner / management** | Visibility and control | Dashboards, reports, approval oversight |
| **Admin** | System governance | User/role management, configuration, override of stuck approvals, audit review |
| **Sales user** | Capture customer demand | Create, edit, submit and cancel sales orders |
| **Approver** | Control spend and commitments | Unified approval queue; approve/reject with comments |
| **Procurement user** | Keep materials available | Shortfall report, PO creation, sending POs to vendors |
| **Warehouse / operations user** | Track physical flow | Record goods receipts; mark SO in progress/completed |
| **Finance user** | Cash and receivables | Invoices, payments, aging, statements, credit notes |
| **Product manager** | Master data quality | Items, BOM creation and versioning |
| **Customers / vendors** | External parties | Receive orders, invoices, PDFs (no system login in v1) **[Assumption]** |

## 5. Current state and problem statement

- Orders, material needs and payments are tracked in spreadsheets or manually.
- Material requirements per order are calculated by hand, leading to shortages or over-purchasing.
- No single view of what is receivable, payable, overdue or low in stock.
- Approvals are informal and not auditable.

## 6. Business requirements

Requirement priority uses MoSCoW. **[Assumption]**: priorities are proposed from the dependency order of the modules and the stated objectives, and should be confirmed.

### 6.1 Security and administration

| ID | Requirement | Priority | Objective |
|---|---|---|---|
| BR-01 | Users must log in with username and password; passwords stored hashed (bcrypt) | Must | — |
| BR-02 | Every API and screen must be protected by permission-based access control | Must | BO-5 |
| BR-03 | Admin can create, edit, deactivate/reactivate users; inactive users cannot log in | Must | — |
| BR-04 | Admin can define custom roles and assign granular permissions; users can hold multiple roles | Must | BO-5 |
| BR-05 | Admin can reset a user's password; users can update their own profile | Must | — |
| BR-06 | Sessions can be ended, and a logged-out token must no longer be usable | Should | — |

### 6.2 Master data

| ID | Requirement | Priority | Objective |
|---|---|---|---|
| BR-07 | Maintain customers with auto-generated codes, contact and billing details, active/inactive status, and duplicate email/phone warning | Must | BO-1 |
| BR-08 | Maintain vendors with auto-generated codes, contact details and active/inactive status | Must | BO-3 |
| BR-09 | Maintain one item master for finished goods and raw materials, with unit of measure, selling price (finished goods), standard cost (raw materials), category and reorder level | Must | BO-1 |
| BR-10 | Deactivated customers, vendors and items cannot be used on new documents | Must | — |
| BR-11 | Each finished good has a BOM of raw materials and quantities per unit, with versioning (Draft → Active → Archived), cost roll-up, copy, and "where used" lookup | Must | BO-2 |

### 6.3 Sales and procurement

| ID | Requirement | Priority | Objective |
|---|---|---|---|
| BR-12 | Create sales orders with customer, dates, multiple finished-good lines, auto-filled (overridable) prices, tax and totals | Must | BO-1 |
| BR-13 | Sales orders follow a controlled lifecycle (draft, approval, in progress, completed, cancelled) and can be cancelled only with a reason | Must | BO-1, BO-5 |
| BR-14 | On sales order approval the system explodes the active BOMs and calculates total raw-material requirements | Must | BO-2 |
| BR-15 | The system compares requirements with current stock and reports material shortfalls | Must | BO-3 |
| BR-16 | The system can generate draft purchase orders from a shortfall, grouped by vendor | Must | BO-3 |
| BR-17 | Create purchase orders manually or automatically; POs follow a controlled lifecycle through approval, ordering and receipt | Must | BO-3, BO-5 |
| BR-18 | Record goods receipts (partial or full) against a PO, compare received to ordered quantities, and flag discrepancies | Must | BO-3 |
| BR-19 | Generate printable PDFs of sales orders and purchase orders | Should | BO-1 |

### 6.4 Inventory

| ID | Requirement | Priority | Objective |
|---|---|---|---|
| BR-20 | Track one aggregate stock quantity per item | Must | BO-3 |
| BR-21 | Stock increases automatically on goods receipt; authorised users can manually adjust with a mandatory reason | Must | BO-3 |
| BR-22 | Keep a full stock-movement history per item | Must | BO-6 |
| BR-23 | Flag items below reorder level and provide a low-stock view | Should | BO-6 |
| BR-24 | Report stock valuation (Σ quantity × standard cost) | Should | BO-6 |

### 6.5 Finance

| ID | Requirement | Priority | Objective |
|---|---|---|---|
| BR-25 | Issue customer (AR) invoices, auto-generated from completed sales orders or created manually | Must | BO-4 |
| BR-26 | Record vendor (AP) invoices against received purchase orders | Must | BO-4 |
| BR-27 | Invoices calculate tax and due date from configurable payment terms and follow a controlled lifecycle including approval | Must | BO-4, BO-5 |
| BR-28 | The system automatically flags invoices past their due date as overdue | Must | BO-4 |
| BR-29 | Issue credit notes against AR invoices to reduce the outstanding balance | Should | BO-4 |
| BR-30 | Record incoming (customer) and outgoing (vendor) payments by cash, bank transfer, cheque, UPI or credit card, with a reference number | Must | BO-4 |
| BR-31 | Support partial payments, multi-invoice payments and advance (unapplied) payments; invoice status updates automatically | Must | BO-4 |
| BR-32 | Payments can be reversed with a reason (e.g., bounced cheque), restoring the invoice outstanding | Must | BO-4 |
| BR-33 | Generate invoice PDFs, aging analysis (Current, 1–30, 31–60, 61–90, 90+ days), and customer/vendor statements | Should | BO-4, BO-6 |

### 6.5 Approvals

| ID | Requirement | Priority | Objective |
|---|---|---|---|
| BR-34 | Admin configures approval workflows per document type (sales order, PO, invoice) with ordered steps assigned to a role or a user | Must | BO-5 |
| BR-35 | Routing depends on document amount (min/max thresholds); documents below a threshold may auto-approve | Must | BO-5 |
| BR-36 | Approvers see one queue of pending items across document types and can approve or reject (rejection requires a comment) | Must | BO-5 |
| BR-37 | Full approval history (who, what, when, comments) is visible on each document | Must | BO-5 |
| BR-38 | Admin can force-approve a stuck workflow; the override is logged | Should | BO-5 |

### 6.6 Reporting, audit and configuration

| ID | Requirement | Priority | Objective |
|---|---|---|---|
| BR-39 | Dashboard (landing page) with 11 widgets: order pipeline, revenue trend, top 5 customers, PO status, AR and AP aging, overdue summary, low stock, cash flow, pending approvals, recent activity; date-range filter and drill-down | Must | BO-6 |
| BR-40 | Eight reports exportable to PDF/CSV: sales orders, purchase orders, invoice aging, payments, inventory, BOM cost, customer statement, vendor statement | Should | BO-6 |
| BR-41 | Every record shows who created and last modified it, and when | Must | BO-5 |
| BR-42 | Admin configures tax rate and mode, payment terms, number sequences (prefix, year, next number), company profile, currency, UOMs, categories | Must | BO-1 |

## 7. Business process (to-be)

1. Sales user creates a sales order (Draft) and submits it.
2. The approval workflow routes it by amount. Rejected orders return to the sales user.
3. On approval, the system explodes BOMs and compares requirements with stock.
4. For shortfalls, procurement generates purchase orders grouped by vendor; POs go through approval and are sent to vendors.
5. Warehouse records goods receipts; inventory updates automatically.
6. Manufacturing happens outside OrderCraft; the SO is marked In Progress, then Completed.
7. Finance generates the AR invoice from the completed SO; it is approved and sent. Vendor (AP) invoices are recorded against received POs.
8. Payments are recorded against invoices; status moves to Partially Paid / Paid; overdue invoices are flagged automatically.
9. Revenue, receivables, payables and stock are reflected on dashboards.

(See `OrderCraft_Documentation.md` for the flowchart and state diagrams.)

## 8. Business rules

| ID | Rule |
|---|---|
| BRL-01 | Only finished goods can be sold or have a BOM; only raw materials can be BOM components or PO lines |
| BRL-02 | A finished good has at most one Active BOM; editing an active BOM creates a new version and archives the old one |
| BRL-03 | Sales orders are editable only in Draft or Pending Approval; locked once Approved |
| BRL-04 | Cancelling a sales order requires a reason and reverses stock reservations; cancelling a PO requires a reason and already-received goods stay in stock |
| BRL-05 | Default tax is 18% GST, configurable; applies to sales orders, POs and invoices |
| BRL-06 | Document numbers are unique and configurable (e.g. `SO-2026-0001`, `INV-`, `VINV-`, `PO-`, `PAY-`, `CN-`) |
| BRL-07 | Invoice outstanding = total − paid; outstanding of zero sets status to Paid |
| BRL-08 | A rejection comment is mandatory; approval overrides are auditable |
| BRL-09 | Manual stock adjustments require a reason |
| BRL-10 | Inactive users cannot log in; roles assigned to users cannot be deleted; system roles cannot be deleted |

## 9. Non-functional requirements

| Category | Requirement |
|---|---|
| Performance | CRUD API responses < 500 ms; dashboard load < 2 s |
| Scalability | 100 concurrent users; 10,000+ orders per year |
| Security | JWT auth, bcrypt, HTTPS in production, CORS configured, parameterised queries |
| Data integrity | Foreign keys, transactions for multi-table operations, optimistic locking |
| Availability | 99.5% uptime target; graceful error handling; no data loss on failure |
| Browser / device | Latest two versions of Chrome, Firefox, Edge; desktop-responsive |
| Quality | Layered architecture, DTOs, global exception handling, input validation |
| Testing | JUnit 5 + Mockito, repository integration tests, Angular Jasmine/Karma |
| Documentation | Swagger UI, project documentation |

## 10. Assumptions, constraints and dependencies

**Assumptions**
- Single company, single currency (default INR/India) and a single stock pool. **[Assumption]**
- Customers and vendors do not log in; they receive PDFs. **[Assumption]**
- Users work on desktop browsers on a reliable network.

**Constraints**
- Technology fixed: Java 17 / Spring Boot 3, Angular 17+, Oracle DB 19c/21c, Maven, Flyway.
- No production, warehouse or shipping functionality.
- Flat (single-level) BOM only; no sub-assemblies.

**Dependencies**
- Oracle database availability and licensing for production (XE is for development).
- PDF library selection (iText or JasperReports). iText licensing should be reviewed. **[TBC]**

## 11. Risks

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| R-1 | Only 1 of 15 modules is built | Schedule | Phase delivery by dependency order (section 12) |
| R-2 | Gaps in lifecycle specification (e.g. no invoice `REJECTED` status; unclear cancel paths) | Rework | Resolve open items (section 13) before building affected modules |
| R-3 | Flat BOM cannot model sub-assemblies | Functional limit | Confirm acceptable for target customers; revisit if not |
| R-4 | No notifications in v1 | Approvals may stall | Dashboard pending-approvals widget; admin override; add notifications in a later phase |
| R-5 | Default admin credentials and DB passwords in documentation | Security | Change on first deployment; secrets via environment variables |
| R-6 | Oracle licensing cost outside XE limits | Cost | Confirm production edition early |

## 12. Proposed delivery phases **[Assumption]**

| Phase | Modules | Rationale |
|---|---|---|
| 1 | Auth, User & Role (built), System Config, Audit base | Foundation for everything else |
| 2 | Customers, Vendors, Items, BOM | Master data required by orders |
| 3 | Sales Orders, Approval Engine, Inventory | Core order flow and BOM explosion |
| 4 | Purchase Orders, Goods Receipt | Procurement loop |
| 5 | Invoicing, Payments | Financial tracking |
| 6 | Dashboard and Reports | Depends on data from all above |

## 13. Open questions for the business

1. What should happen when an **invoice** is rejected? The statuses have no `REJECTED`.
2. From which states may a sales order or PO be cancelled, and what happens to linked POs when a sales order is cancelled?
3. After a sales order or PO is rejected, is it edited and resubmitted as the same document?
4. Does "reverse stock reservations" imply reserving stock at SO approval? No reservation data is modelled today.
5. How should AP invoices move through statuses (the `SENT` step seems AR-only)?
6. What are the actual approval thresholds (the ₹10,000 / ₹50,000 values in the spec are examples)?
7. Which roles/user groups map to the named actors (Sales, Procurement, Finance, Warehouse), given only Admin and General User are seeded?
8. Are multiple currencies, companies or tax slabs per item needed?

## 14. Acceptance criteria (high level)

| Area | Criterion |
|---|---|
| Access | A user without a required permission receives 403; without a valid or after logout receives 401 |
| Order flow | Approving a sales order produces correct raw-material requirements = Σ(line quantity × BOM quantity) |
| Procurement | Shortfall = required − available stock; generated POs are grouped by vendor |
| Inventory | A goods receipt raises stock by the received quantity and writes a movement record |
| Invoicing | An invoice from a completed SO copies its lines and totals; due date follows payment terms |
| Payments | Partial payment sets `PARTIALLY_PAID`; outstanding of zero sets `PAID`; reversal restores outstanding |
| Approvals | Routing follows amount thresholds; rejection requires a comment; history is visible on the document |
| Reporting | Dashboard loads within 2 s; reports export to PDF/CSV |
| Audit | Every record shows creator, last modifier and timestamps |

## 15. Glossary

| Term | Meaning |
|---|---|
| **BOM** | Bill of Materials: raw materials and quantities needed to make one unit of a finished good |
| **BOM explosion** | Multiplying BOM quantities by order quantity to get total material needs |
| **SO / PO** | Sales Order / Purchase Order |
| **AR / AP** | Accounts Receivable (customer invoices) / Accounts Payable (vendor invoices) |
| **Goods receipt** | Record of materials physically received against a PO |
| **Shortfall** | Required material quantity minus available stock |
| **UOM** | Unit of measure (PCS, KG, LTR, MTR, SET) |
| **Credit note** | Document reducing the amount owed on an invoice |
| **Order-to-cash** | End-to-end process from customer order to cash collection |

## 16. Sign-off

| Role | Name | Date | Signature |
|---|---|---|---|
| Business owner | | | |
| Product owner | | | |
| Technical lead | | | |
| Finance representative | | | |