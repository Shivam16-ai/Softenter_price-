# SwiftRoute Enterprise Parcel Management System
## Production Database Architecture & Prisma ORM Technical Specification

This document provides the complete enterprise database architecture for the **SwiftRoute Enterprise Parcel Management System**. It specifies the third normal form (3NF) relational design, Prisma ORM schema, security controls, indexing strategies, telemetry pipelines, and reporting rollups engineered to rival tier-1 global logistics carriers such as DHL, FedEx, UPS, and Blue Dart.

---

## 1. Architectural Overview & Normalization (3NF)

The database is built on **PostgreSQL** using **Prisma ORM**, strictly adhering to **Third Normal Form (3NF)** principles:

1. **First Normal Form (1NF)**:
   - Every column contains atomic (indivisible) values.
   - Repeating groups and comma-separated denormalized arrays are eliminated. Multi-channel notifications, route checkpoints, invoice line items, and audit trails reside in dedicated relational tables with unique primary keys (`cuid()`).
2. **Second Normal Form (2NF)**:
   - All non-key attributes are fully functionally dependent on the primary key.
   - Composite keys (such as `RolePermission` and `AgentAvailability`) only hold junction or temporal attributes; all domain entities use immutable surrogate keys.
3. **Third Normal Form (3NF)**:
   - Transitive dependencies are removed.
   - For example: Customer addresses are decoupled from parcels and customers; vehicle specifications belong to `AgentVehicle` rather than `DeliveryAgent` or `Parcel`; hub capacities and geographic centroids are decoupled from route entities; shipping calculations reference versioned `ParcelCategory` tariffs rather than hardcoded parcel formulas.

---

## 2. Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    %% Auth & RBAC
    User ||--o{ Role : "assigned"
    Role ||--|{ RolePermission : "contains"
    Permission ||--|{ RolePermission : "grants"
    User ||--o{ UserSession : "establishes"
    User ||--o{ PasswordReset : "requests"
    User ||--o{ ActivityLog : "triggers"
    User ||--o{ AuditLog : "initiates"

    %% Customer & Agent Subtypes
    User ||--o| Customer : "specializes as"
    User ||--o| DeliveryAgent : "operates as"
    Customer ||--|{ CustomerAddress : "maintains"

    %% Fleet & Delivery Management
    DeliveryAgent ||--|{ AgentVehicle : "operates"
    DeliveryAgent ||--|{ AgentAvailability : "logs shifts"
    DeliveryAgent ||--o{ ParcelAssignment : "assigned runs"
    DeliveryAgent ||--o{ DeliveryProof : "captures"

    %% Logistics Infrastructure
    Branch ||--|{ Hub : "supervises"
    Branch ||--o{ DeliveryAgent : "bases"
    Branch ||--o{ Route : "originates / terminates"
    Hub ||--o{ RouteCheckpoint : "hosts"
    Route ||--|{ RouteCheckpoint : "sequences"

    %% Parcel Management & Tracking
    User ||--o{ Parcel : "ships (sender)"
    Customer ||--o{ Parcel : "bills corporate"
    ParcelCategory ||--|{ Parcel : "classifies"
    Parcel ||--o{ ParcelAssignment : "routed through"
    Parcel ||--|{ TrackingHistory : "audits journey"
    Parcel ||--o| DeliveryProof : "concludes with"

    %% Financials & Invoicing
    Parcel ||--o{ Invoice : "billed via"
    Customer ||--o{ Invoice : "invoiced"
    User ||--o{ Invoice : "payer account"
    Invoice ||--|{ InvoiceLineItem : "itemizes"
    Invoice ||--o{ Payment : "settled by"
    Parcel ||--o{ Payment : "direct payment"
    Payment ||--|{ TransactionHistory : "reconciles"

    %% Notifications & Support
    User ||--o{ Notification : "receives"
    User ||--|{ NotificationPreference : "configures"
    User ||--o{ SupportTicket : "opens"
    SupportTicket ||--|{ TicketMessage : "threads"
    Parcel ||--o{ SupportTicket : "references"
```

---

## 3. Database Subsystem Specifications

### Subsystem 1: Identity, Authentication & Role-Based Access Control (RBAC)

* **`users`**: Central authentication identity table storing Bcrypt/Argon2 password hashes, multi-factor authentication (2FA) secrets, lockouts, email verification, and soft-delete markers (`deletedAt`).
* **`roles`**: System roles (`SUPER_ADMIN`, `ADMIN`, `DISPATCHER`, `COURIER_AGENT`, `CUSTOMER`, `HUB_MANAGER`).
* **`permissions`**: Fine-grained capability matrix (`parcels:create`, `dispatch:assign`, `finance:refund`, `reports:export`).
* **`role_permissions`**: Many-to-many junction table with cascade deletion.
* **`user_sessions`**: High-concurrency session registry storing SHA-256 token hashes, client IP addresses, User-Agents, and revocation states.
* **`password_resets`**: Single-use, time-expiring cryptographic reset tokens.

### Subsystem 2: Customer Management & Address Book

* **`customers`**: Specialized customer profile linked 1:1 with `users`, tracking account classifications (`INDIVIDUAL`, `COMMERCIAL_SME`, `ENTERPRISE_CORPORATE`), corporate tax IDs, credit limits, accounts receivable balances, and custom discount terms.
* **`customer_addresses`**: Normalised multi-address book for shippers and corporate clients, supporting geocoding (`latitude`, `longitude`), gate codes, dock instructions, and default pickup/delivery flags.

### Subsystem 3: Delivery Agents, Fleet Vehicles & Telemetry

* **`delivery_agents`**: Courier profiles with employee codes, driving license validity, background verification records, customer satisfaction ratings, and branch/hub stationing.
* **`agent_vehicles`**: Fleet management tracking cargo vans, box trucks, motorcycles, license plates, payload capacities (`maxWeightCapacityKg`, `maxVolumeCapacityCbm`), and insurance expiration dates.
* **`agent_availabilities`**: Shift management recording GPS telemetry, battery levels, shift active windows, and duty statuses (`AVAILABLE`, `ON_DELIVERY_RUN`, `ON_BREAK`, `OFF_DUTY`).

### Subsystem 4: Logistics Infrastructure (Branches, Hubs, Routes & Waypoints)

* **`branches`**: Physical facilities (Headquarters, Sorting Centers, Regional Depots, Local Drop-off points) with geographic metadata and operating hours.
* **`hubs`**: High-throughput automated distribution centers equipped with sorting machinery and volume capacity ratings.
* **`routes`**: Standardized transit corridors linking branches and hubs with target transit durations, distances, estimated fuel consumption, and toll budgets.
* **`route_checkpoints`**: Waypoints and mandatory inspection stops (weighbridges, customs stations) sequenced along each corridor.

### Subsystem 5: Parcel Lifecycle, Dynamic Pricing & Electronic POD

* **`parcel_categories`**: Pricing tariff tiers (`STANDARD`, `EXPRESS`, `FRAGILE`, `HEAVY_FREIGHT`, `DOCUMENT`, `COLD_CHAIN`) with rate multipliers and special handling surcharges.
* **`parcels`**: Core shipment entity with globally unique tracking numbers (`trackingNumber`, indexed with B-Tree), barcode waybills, volumetric calculations, insurance coverage, payment terms, and status state machine (`PENDING` through `DELIVERED`).
* **`parcel_assignments`**: Immutable audit log of every courier dispatch run, vehicle assignment, transfer, or reassignment.
* **`tracking_histories`**: Granular immutable telemetry checkpoints recorded at every scan event, capturing GPS coordinates, facility names, operator IDs, and public tracking descriptions.
* **`delivery_proofs`**: Electronic Proof of Delivery (e-POD) securing physical deliveries with recipient signatures, high-resolution photographic proof, GPS geofence verification, and admin audit sign-offs.

### Subsystem 6: Invoicing, Payments & Fiscal Ledger

* **`invoices`**: Multi-currency fiscal documents supporting Net 30 corporate terms, tax calculations, and balance tracking.
* **`invoice_line_items`**: Atomic breakdown of base freight, fuel surcharges, priority fees, customs duties, and applied corporate discounts.
* **`payments`**: Payment processing ledger recording transaction IDs, processor response codes, payment channels (`CREDIT_CARD`, `BANK_TRANSFER`, `CASH_ON_DELIVERY`, `DIGITAL_WALLET`), and settlement statuses.
* **`transaction_histories`**: Double-entry ledger recording charges, refunds, chargebacks, and adjustments with raw processor payload archives.

### Subsystem 7: Communications & Customer Support

* **`notifications`**: Multi-channel message queue (`IN_APP`, `EMAIL`, `SMS`, `PUSH_DEVICE`, `WEBHOOK`) with delivery receipts and read timestamps.
* **`notification_preferences`**: User-defined notification routing matrix.
* **`support_tickets`**: Customer inquiry resolution pipeline linked to consignments with SLA priority queues (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`, `URGENT`).
* **`ticket_messages`**: Real-time communication thread between support engineers, dispatchers, and customers with file attachments.

### Subsystem 8: Enterprise Auditing, Telemetry & Reporting Rollups

* **`activity_logs`**: Operational audit log recording user actions, IP addresses, and changed entities.
* **`audit_logs`**: Immutable security ledger capturing `oldValues` and `newValues` JSON diffs for SOC2/ISO27001 compliance.
* **`system_settings`**: Key-value system configurations with typed casting (`STRING`, `NUMBER`, `BOOLEAN`, `JSON`) and administrative access restrictions.
* **`daily_operational_metrics`**: Pre-aggregated daily analytical summaries for instant executive dashboard performance without running expensive sequential scans over millions of historical parcel rows.
* **`agent_performance_metrics`**: Daily and weekly courier performance metrics (on-time delivery rate, delivery attempt success rate, SLA compliance).

---

## 4. Query Optimization & Indexing Strategy

To guarantee sub-10 millisecond response times under enterprise query loads, the schema implements targeted single and composite B-Tree indexes:

| Table | Index Columns | Purpose |
| :--- | :--- | :--- |
| `parcels` | `[trackingNumber]` (UNIQUE) | Constant-time O(1) public tracking lookups |
| `parcels` | `[status]` | Accelerated dispatch queue and hub sorting filters |
| `parcels` | `[senderId, createdAt]` | Fast customer shipment history pagination |
| `parcels` | `[assignedAgentId, status]` | Real-time courier active run manifest |
| `parcels` | `[estimatedDeliveryDate]` | SLA breach monitoring and priority escalation queries |
| `tracking_histories`| `[parcelId, checkpointTimestamp]` | Chronological parcel milestone reconstruction |
| `invoices` | `[invoiceNumber]` (UNIQUE) | Instant billing and tax invoice lookups |
| `invoices` | `[billedUserId, status]` | Accounts receivable aging and payment reconciliation |
| `payments` | `[transactionId]` (UNIQUE) | Webhook idempotency and fraud duplicate prevention |
| `user_sessions` | `[tokenHash]` (UNIQUE) | Microsecond authentication token validation |
| `audit_logs` | `[tableName, recordId]` | Complete compliance audit history for any given record |

---

## 5. Security & Compliance Architecture

1. **Password Storage**: Only cryptographic hashes generated via Bcrypt (cost factor 10+) or Argon2id are stored. Plaintext passwords never touch persistent storage.
2. **Token Security**: Session and password reset tokens are stored as SHA-256 hashes (`tokenHash`). Even in the event of a database snapshot leak, active session tokens cannot be reverse-engineered.
3. **Soft-Delete Support**: High-value entities (`User`, `Customer`, `CustomerAddress`, `DeliveryAgent`, `Parcel`) implement nullable `deletedAt` timestamps. Records are flagged as deleted while preserving foreign-key referential integrity and audit compliance.
4. **Referential Integrity**: Cascading rules are strictly mapped:
   - `onDelete: Cascade` for child components that cannot exist independently (`UserSession`, `PasswordReset`, `CustomerAddress`, `InvoiceLineItem`, `TicketMessage`).
   - `onDelete: Restrict` for financial, user, and parcel master records to prevent accidental deletion of critical transaction data.
   - `onDelete: SetNull` for non-critical relationships (`currentHubId`, `assignedAgentId`).

---

## 6. Migration & Deployment Playbook

### Step 1: Environment Configuration
Define your PostgreSQL connection URL in your environment:
```bash
DATABASE_URL="postgresql://db_user:secure_pass@postgres-host.internal:5432/swiftroute_prod?schema=public&connection_limit=20&pool_timeout=10"
```

### Step 2: Validate the Schema
```bash
npm run db:validate
```

### Step 3: Generate the Prisma Client
```bash
npm run db:generate
```

### Step 4: Run Migrations
For local/development databases:
```bash
npx prisma migrate dev --name init_enterprise_parcel_schema
```

For staging and production CI/CD pipelines:
```bash
npx prisma migrate deploy
```

### Step 5: Seed Core Roles, Tariffs, and Master Data
```bash
npm run db:seed
```

---

## 7. Reporting & Analytics Query Recipes

### Executive Daily Revenue & Volume Rollup
```typescript
const dailySummary = await prisma.parcel.aggregate({
  where: {
    createdAt: {
      gte: new Date('2026-09-01T00:00:00Z'),
      lte: new Date('2026-09-01T23:59:59Z'),
    },
  },
  _count: { id: true },
  _sum: {
    totalShippingCost: true,
    taxAmount: true,
    weightKg: true,
  },
  _avg: {
    totalShippingCost: true,
  },
});
```

### Courier First-Attempt Delivery SLA Rate
```typescript
const courierMetrics = await prisma.deliveryProof.count({
  where: {
    agentId: 'agt_sf_101',
    deliveredAt: { gte: new Date(Date.now() - 7 * 86400000) },
    parcel: {
      status: 'DELIVERED',
    },
  },
});
```
