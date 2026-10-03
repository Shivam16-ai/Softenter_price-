-- CreateEnum
CREATE TYPE "UserRoleType" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'DISPATCHER', 'COURIER_AGENT', 'CUSTOMER', 'HUB_MANAGER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('INDIVIDUAL', 'COMMERCIAL_SME', 'ENTERPRISE_CORPORATE');

-- CreateEnum
CREATE TYPE "AgentEmploymentStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'PROBATION', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('MOTORCYCLE', 'ELECTRIC_SCOOTER', 'SEDAN', 'CARGO_VAN', 'HEAVY_BOX_TRUCK', 'SEMI_TRAILER', 'BICYCLE');

-- CreateEnum
CREATE TYPE "AgentAvailabilityStatus" AS ENUM ('AVAILABLE', 'ON_DELIVERY_RUN', 'BUSY', 'ON_BREAK', 'OFF_DUTY');

-- CreateEnum
CREATE TYPE "BranchType" AS ENUM ('HEADQUARTERS', 'METRO_SORTING_HUB', 'REGIONAL_DISTRIBUTION_DEPOT', 'LOCAL_BRANCH', 'LOCKER_KIOSK');

-- CreateEnum
CREATE TYPE "CheckpointType" AS ENUM ('ORIGIN_FACILITY', 'TRANSIT_HUB_SCAN', 'WEIGH_INSPECTION', 'CUSTOMS_BORDER', 'SORTING_CENTER', 'DESTINATION_DEPOT', 'OUT_FOR_DELIVERY_DISPATCH', 'RECIPIENT_LOCATION');

-- CreateEnum
CREATE TYPE "ParcelType" AS ENUM ('STANDARD', 'EXPRESS', 'FRAGILE', 'HEAVY_FREIGHT', 'DOCUMENT', 'COLD_CHAIN', 'HAZARDOUS_MATERIAL');

-- CreateEnum
CREATE TYPE "ParcelStatus" AS ENUM ('PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_SORTING', 'IN_TRANSIT', 'ARRIVED_AT_HUB', 'OUT_FOR_DELIVERY', 'DELIVERED', 'ATTEMPTED_DELIVERY', 'FAILED', 'RETURNED_TO_SENDER', 'CANCELLED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'DECLINED', 'TRANSFERRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED', 'WAIVED');

-- CreateEnum
CREATE TYPE "PaymentTerms" AS ENUM ('PREPAID', 'CASH_ON_DELIVERY', 'CREDIT_LINE_MONTHLY', 'THIRD_PARTY_CONSIGNEE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH_ON_DELIVERY', 'DIGITAL_WALLET', 'STRIPE', 'PAYPAL', 'CORPORATE_ACCOUNT');

-- CreateEnum
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CHARGE', 'REFUND', 'ADJUSTMENT', 'REVERSAL', 'PAYOUT', 'FEE');

-- CreateEnum
CREATE TYPE "TransactionRecordStatus" AS ENUM ('SUCCESS', 'PENDING', 'FAILED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'VOID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LineItemType" AS ENUM ('BASE_SHIPPING', 'WEIGHT_SURCHARGE', 'EXPRESS_SURCHARGE', 'FRAGILE_HANDLING', 'FUEL_SURCHARGE', 'INSURANCE_PREMIUM', 'CUSTOMS_DUTY', 'DISCOUNT', 'TAX');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH_DEVICE', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PARCEL_BOOKED', 'STATUS_UPDATE', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_FAILED', 'PAYMENT_SUCCESS', 'INVOICE_GENERATED', 'AGENT_ASSIGNED', 'SECURITY_ALERT', 'SYSTEM_ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('DELAYED_DELIVERY', 'DAMAGED_PARCEL', 'LOST_SHIPMENT', 'BILLING_DISPUTE', 'ADDRESS_CORRECTION', 'SERVICE_COMPLAINT', 'GENERAL_INQUIRY');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'URGENT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AuditActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'ACCESS', 'PERMISSION_CHANGE', 'STATUS_CHANGE', 'AUTHENTICATION', 'CONFIG_CHANGE');

-- CreateEnum
CREATE TYPE "AuditSeverity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SettingDataType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON');

-- CreateEnum
CREATE TYPE "SettingCategory" AS ENUM ('GENERAL', 'PRICING', 'LOGISTICS', 'NOTIFICATIONS', 'SECURITY', 'SYSTEM');

-- CreateEnum
CREATE TYPE "RecipientProofRelationship" AS ENUM ('SELF', 'FAMILY_MEMBER', 'COLLEAGUE', 'SECURITY_GUARD', 'MAILROOM_CLERK', 'NEIGHBOR', 'AUTHORIZED_REPRESENTATIVE');

-- CreateEnum
CREATE TYPE "ExternalPlatform" AS ENUM ('AMAZON', 'FLIPKART', 'MYNTRA', 'MEESHO', 'SWIGGY', 'ZOMATO', 'EBAY', 'ETSY', 'OTHER', 'MANUAL');

-- CreateEnum
CREATE TYPE "ExternalAccountStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'EXPIRED', 'ERROR', 'PENDING_AUTH');

-- CreateEnum
CREATE TYPE "ExternalOrderStatus" AS ENUM ('ORDERED', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELAYED', 'RETURNED', 'CANCELLED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT_TO_WAREHOUSE', 'RECEIVED_AT_WAREHOUSE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReturnReason" AS ENUM ('DAMAGED_PRODUCT', 'WRONG_PRODUCT', 'MISSING_ITEM', 'PRODUCT_DEFECT', 'SIZE_ISSUE', 'COLOR_ISSUE', 'CHANGED_MIND', 'NOT_AS_DESCRIBED', 'QUALITY_ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "DeliveryPreferenceType" AS ENUM ('CALL_BEFORE_DELIVERY', 'LEAVE_AT_DOORSTEP', 'REQUIRE_OTP', 'SIGNATURE_REQUIRED', 'NO_CONTACT_DELIVERY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "fullName" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "address" VARCHAR(255),
    "avatarUrl" VARCHAR(500),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "roleId" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" VARCHAR(255),
    "lastLoginAt" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockoutUntil" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "code" "UserRoleType" NOT NULL,
    "description" VARCHAR(255),
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "module" VARCHAR(60) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    "deviceInfo" VARCHAR(120),
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" VARCHAR(45),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountType" "CustomerType" NOT NULL DEFAULT 'INDIVIDUAL',
    "companyName" VARCHAR(150),
    "taxId" VARCHAR(50),
    "billingEmail" VARCHAR(255),
    "billingPhone" VARCHAR(30),
    "creditLimit" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "currentBalance" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "paymentTermsDays" INTEGER NOT NULL DEFAULT 0,
    "customDiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_addresses" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "label" VARCHAR(60) NOT NULL,
    "contactPerson" VARCHAR(100) NOT NULL,
    "phoneNumber" VARCHAR(30) NOT NULL,
    "streetAddress1" VARCHAR(200) NOT NULL,
    "streetAddress2" VARCHAR(100),
    "city" VARCHAR(100) NOT NULL,
    "stateProvince" VARCHAR(100) NOT NULL,
    "postalCode" VARCHAR(20) NOT NULL,
    "countryCode" VARCHAR(3) NOT NULL DEFAULT 'US',
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "isDefaultPickup" BOOLEAN NOT NULL DEFAULT false,
    "isDefaultDelivery" BOOLEAN NOT NULL DEFAULT false,
    "deliveryNotes" VARCHAR(255),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_agents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeCode" VARCHAR(40) NOT NULL,
    "assignedBranchId" TEXT,
    "assignedHubId" TEXT,
    "licenseNumber" VARCHAR(60),
    "licenseExpiry" TIMESTAMP(3),
    "identityDocumentType" VARCHAR(50),
    "identityDocumentNumber" VARCHAR(60),
    "emergencyContactName" VARCHAR(100),
    "emergencyContactPhone" VARCHAR(30),
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    "totalDeliveriesCount" INTEGER NOT NULL DEFAULT 0,
    "successfulDeliveriesCount" INTEGER NOT NULL DEFAULT 0,
    "failedDeliveriesCount" INTEGER NOT NULL DEFAULT 0,
    "employmentStatus" "AgentEmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_vehicles" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL DEFAULT 'CARGO_VAN',
    "make" VARCHAR(60) NOT NULL,
    "model" VARCHAR(60) NOT NULL,
    "year" INTEGER NOT NULL,
    "licensePlate" VARCHAR(30) NOT NULL,
    "maxWeightCapacityKg" DECIMAL(8,2) NOT NULL,
    "maxVolumeCapacityCbm" DECIMAL(6,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "insurancePolicyNumber" VARCHAR(80),
    "insuranceExpiry" TIMESTAMP(3),
    "registrationExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_availabilities" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "status" "AgentAvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "currentLatitude" DECIMAL(10,7),
    "currentLongitude" DECIMAL(10,7),
    "batteryLevelPercent" INTEGER,
    "lastLocationUpdate" TIMESTAMP(3),
    "shiftDate" DATE NOT NULL,
    "shiftStartTime" TIMESTAMP(3),
    "shiftEndTime" TIMESTAMP(3),
    "notes" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "branchType" "BranchType" NOT NULL DEFAULT 'LOCAL_BRANCH',
    "streetAddress" VARCHAR(200) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "stateProvince" VARCHAR(100) NOT NULL,
    "postalCode" VARCHAR(20) NOT NULL,
    "countryCode" VARCHAR(3) NOT NULL DEFAULT 'US',
    "contactPhone" VARCHAR(30) NOT NULL,
    "contactEmail" VARCHAR(255) NOT NULL,
    "operatingHours" VARCHAR(100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hubs" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "branchId" TEXT NOT NULL,
    "address" VARCHAR(200) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "stateProvince" VARCHAR(100) NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "capacityVolumeCbm" DECIMAL(8,2) NOT NULL DEFAULT 1000.00,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "routeCode" VARCHAR(50) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "originBranchId" TEXT NOT NULL,
    "destinationBranchId" TEXT NOT NULL,
    "originHubId" TEXT,
    "destinationHubId" TEXT,
    "standardDurationMinutes" INTEGER NOT NULL,
    "distanceKm" DECIMAL(8,2) NOT NULL,
    "estimatedFuelCost" DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    "tollCost" DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_checkpoints" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "sequenceOrder" INTEGER NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "hubId" TEXT,
    "expectedTransitMinutes" INTEGER NOT NULL,
    "mandatoryStop" BOOLEAN NOT NULL DEFAULT false,
    "checkpointType" "CheckpointType" NOT NULL DEFAULT 'TRANSIT_HUB_SCAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_checkpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcel_categories" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" VARCHAR(255),
    "baseRateMultiplier" DECIMAL(4,2) NOT NULL DEFAULT 1.00,
    "handlingSurcharge" DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    "maxAllowedWeightKg" DECIMAL(8,2) NOT NULL DEFAULT 100.00,
    "requiresSpecialHandling" BOOLEAN NOT NULL DEFAULT false,
    "insuranceRequired" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parcel_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcels" (
    "id" TEXT NOT NULL,
    "trackingNumber" VARCHAR(50) NOT NULL,
    "waybillBarcode" VARCHAR(80),
    "senderId" TEXT NOT NULL,
    "customerId" TEXT,
    "categoryId" TEXT NOT NULL,
    "parcelType" "ParcelType" NOT NULL DEFAULT 'STANDARD',
    "status" "ParcelStatus" NOT NULL DEFAULT 'PENDING',
    "senderName" VARCHAR(120) NOT NULL,
    "senderPhone" VARCHAR(30) NOT NULL,
    "senderEmail" VARCHAR(255),
    "pickupAddress" VARCHAR(255) NOT NULL,
    "pickupCity" VARCHAR(100),
    "pickupPostalCode" VARCHAR(20),
    "recipientName" VARCHAR(120) NOT NULL,
    "recipientPhone" VARCHAR(30) NOT NULL,
    "recipientEmail" VARCHAR(255),
    "deliveryAddress" VARCHAR(255) NOT NULL,
    "deliveryCity" VARCHAR(100),
    "deliveryPostalCode" VARCHAR(20),
    "originBranchId" TEXT,
    "destinationBranchId" TEXT,
    "currentHubId" TEXT,
    "assignedRouteId" TEXT,
    "assignedAgentId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "weightKg" DECIMAL(8,2) NOT NULL,
    "lengthCm" DECIMAL(6,2),
    "widthCm" DECIMAL(6,2),
    "heightCm" DECIMAL(6,2),
    "volumetricWeightKg" DECIMAL(8,2),
    "dimensionsText" VARCHAR(50),
    "declaredValue" DECIMAL(10,2),
    "isInsured" BOOLEAN NOT NULL DEFAULT false,
    "insuranceAmount" DECIMAL(10,2) DEFAULT 0.00,
    "baseShippingCost" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "surchargeAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "taxAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "totalShippingCost" DECIMAL(10,2) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "paymentTerms" "PaymentTerms" NOT NULL DEFAULT 'PREPAID',
    "estimatedDeliveryDate" TIMESTAMP(3) NOT NULL,
    "actualDeliveryDate" TIMESTAMP(3),
    "pickupScheduledAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "specialInstructions" TEXT,
    "fragileHandling" BOOLEAN NOT NULL DEFAULT false,
    "signatureRequired" BOOLEAN NOT NULL DEFAULT true,
    "temperatureControlled" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parcels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcel_assignments" (
    "id" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "assignedByUserId" TEXT,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedAt" TIMESTAMP(3),
    "reasonForTransfer" VARCHAR(255),
    "notes" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parcel_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_histories" (
    "id" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "trackingNumber" VARCHAR(50) NOT NULL,
    "status" "ParcelStatus" NOT NULL,
    "subStatus" VARCHAR(80),
    "facilityName" VARCHAR(120) NOT NULL,
    "locationText" VARCHAR(200) NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "hubId" TEXT,
    "agentId" TEXT,
    "recordedByUserId" TEXT,
    "description" VARCHAR(500) NOT NULL,
    "checkpointTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_proofs" (
    "id" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "recipientName" VARCHAR(120) NOT NULL,
    "recipientRelationship" "RecipientProofRelationship" NOT NULL DEFAULT 'SELF',
    "signatureUrl" TEXT,
    "signatureSvg" TEXT,
    "photoProofUrl" TEXT,
    "deliveryLatitude" DECIMAL(10,7),
    "deliveryLongitude" DECIMAL(10,7),
    "gpsAccuracyMeters" DOUBLE PRECISION,
    "notes" TEXT,
    "deliveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedByAdminId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_proofs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" VARCHAR(60) NOT NULL,
    "customerId" TEXT,
    "parcelId" TEXT,
    "billedUserId" TEXT NOT NULL,
    "subtotalAmount" DECIMAL(10,2) NOT NULL,
    "surchargeAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "taxAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "balanceDue" DECIMAL(10,2) NOT NULL,
    "currencyCode" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    "issuedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "notes" VARCHAR(255),
    "pdfUrl" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "itemType" "LineItemType" NOT NULL DEFAULT 'BASE_SHIPPING',
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "paymentReference" VARCHAR(60) NOT NULL,
    "parcelId" TEXT,
    "invoiceId" TEXT,
    "payerUserId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currencyCode" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CREDIT_CARD',
    "transactionId" VARCHAR(120) NOT NULL,
    "gatewayResponseCode" VARCHAR(40),
    "gatewayMessage" VARCHAR(255),
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "processedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "refundedAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "receiptUrl" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_histories" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "transactionType" "TransactionType" NOT NULL DEFAULT 'CHARGE',
    "amount" DECIMAL(10,2) NOT NULL,
    "balanceAfter" DECIMAL(10,2),
    "currencyCode" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "referenceNumber" VARCHAR(100) NOT NULL,
    "gatewayTransactionId" VARCHAR(120),
    "status" "TransactionRecordStatus" NOT NULL DEFAULT 'SUCCESS',
    "errorMessage" VARCHAR(255),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "message" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "type" "NotificationType" NOT NULL DEFAULT 'STATUS_UPDATE',
    "entityType" VARCHAR(50),
    "entityId" VARCHAR(60),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "deliveryStatus" "NotificationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "failureReason" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationType" "NotificationType" NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "ticketNumber" VARCHAR(50) NOT NULL,
    "customerId" TEXT NOT NULL,
    "parcelId" TEXT,
    "externalOrderId" TEXT,
    "assignedToAdminId" TEXT,
    "subject" VARCHAR(200) NOT NULL,
    "category" "TicketCategory" NOT NULL DEFAULT 'GENERAL_INQUIRY',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_messages" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "isInternalNote" BOOLEAN NOT NULL DEFAULT false,
    "messageBody" TEXT NOT NULL,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userName" VARCHAR(120),
    "userRole" VARCHAR(50),
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(60) NOT NULL,
    "entityId" VARCHAR(60),
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(255),
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "performedByUserId" TEXT,
    "actionType" "AuditActionType" NOT NULL DEFAULT 'ACCESS',
    "tableName" VARCHAR(80) NOT NULL,
    "recordId" VARCHAR(80) NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(255),
    "severity" "AuditSeverity" NOT NULL DEFAULT 'INFO',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "dataType" "SettingDataType" NOT NULL DEFAULT 'STRING',
    "category" "SettingCategory" NOT NULL DEFAULT 'GENERAL',
    "description" VARCHAR(255),
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_operational_metrics" (
    "id" TEXT NOT NULL,
    "metricDate" DATE NOT NULL,
    "totalBookedCount" INTEGER NOT NULL DEFAULT 0,
    "totalDeliveredCount" INTEGER NOT NULL DEFAULT 0,
    "totalFailedCount" INTEGER NOT NULL DEFAULT 0,
    "totalInTransitCount" INTEGER NOT NULL DEFAULT 0,
    "totalGrossRevenue" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "totalNetRevenue" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "totalTaxCollected" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "avgDeliveryTimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "firstAttemptSuccessRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "activeAgentsCount" INTEGER NOT NULL DEFAULT 0,
    "newCustomersCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_operational_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_performance_metrics" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "periodDate" DATE NOT NULL,
    "totalAssignedParcels" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "failedDeliveryCount" INTEGER NOT NULL DEFAULT 0,
    "attemptedDeliveryCount" INTEGER NOT NULL DEFAULT 0,
    "averageDeliveryMinutes" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "onTimeDeliveryRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "customerSatisfactionScore" DOUBLE PRECISION,
    "totalDistanceTraveledKm" DECIMAL(8,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_accounts" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "platform" "ExternalPlatform" NOT NULL,
    "platformUserId" VARCHAR(255),
    "platformUserEmail" VARCHAR(255),
    "platformUserName" VARCHAR(255),
    "status" "ExternalAccountStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "connectionMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_orders" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "externalAccountId" TEXT,
    "platform" "ExternalPlatform" NOT NULL,
    "platformOrderId" VARCHAR(255) NOT NULL,
    "platformTrackingNumber" VARCHAR(255),
    "productName" VARCHAR(500) NOT NULL,
    "productCategory" VARCHAR(100),
    "productImageUrl" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "orderAmount" DECIMAL(10,2),
    "currencyCode" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "status" "ExternalOrderStatus" NOT NULL DEFAULT 'ORDERED',
    "orderDate" TIMESTAMP(3) NOT NULL,
    "expectedDeliveryDate" TIMESTAMP(3),
    "actualDeliveryDate" TIMESTAMP(3),
    "courierName" VARCHAR(150),
    "deliveryAddress" TEXT NOT NULL,
    "deliveryCity" VARCHAR(100),
    "deliveryPostalCode" VARCHAR(20),
    "recipientName" VARCHAR(150),
    "recipientPhone" VARCHAR(30),
    "currentLocation" VARCHAR(255),
    "currentLatitude" DECIMAL(10,7),
    "currentLongitude" DECIMAL(10,7),
    "estimatedTimeMinutes" INTEGER,
    "specialInstructions" TEXT,
    "isImported" BOOLEAN NOT NULL DEFAULT false,
    "rawData" JSONB,
    "lastTrackingUpdate" TIMESTAMP(3),
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_order_tracking" (
    "id" TEXT NOT NULL,
    "externalOrderId" TEXT NOT NULL,
    "status" "ExternalOrderStatus" NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "eventTimestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "external_order_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_requests" (
    "id" TEXT NOT NULL,
    "returnNumber" VARCHAR(50) NOT NULL,
    "customerId" TEXT NOT NULL,
    "parcelId" TEXT,
    "externalOrderId" TEXT,
    "productName" VARCHAR(500) NOT NULL,
    "orderPlatform" "ExternalPlatform",
    "orderReference" VARCHAR(255),
    "reason" "ReturnReason" NOT NULL,
    "reasonDescription" TEXT,
    "status" "ReturnStatus" NOT NULL DEFAULT 'REQUESTED',
    "pickupAddress" TEXT NOT NULL,
    "pickupCity" VARCHAR(100),
    "pickupPostalCode" VARCHAR(20),
    "preferredPickupDate" TIMESTAMP(3),
    "actualPickupDate" TIMESTAMP(3),
    "assignedAgentId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "pickupProofUrl" TEXT,
    "warehouseReceivedAt" TIMESTAMP(3),
    "refundAmount" DECIMAL(10,2),
    "refundProcessedAt" TIMESTAMP(3),
    "approvedByAdminId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "return_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_preferences" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "preferenceType" "DeliveryPreferenceType" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "preferredTimeStart" VARCHAR(10),
    "preferredTimeEnd" VARCHAR(10),
    "specialInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_notifications" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "priority" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "parcelId" TEXT,
    "externalOrderId" TEXT,
    "returnRequestId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "actionUrl" VARCHAR(500),
    "actionLabel" VARCHAR(100),
    "sentViaEmail" BOOLEAN NOT NULL DEFAULT false,
    "sentViaSms" BOOLEAN NOT NULL DEFAULT false,
    "sentViaPush" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_roleId_idx" ON "users"("roleId");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "permissions_module_idx" ON "permissions"("module");

-- CreateIndex
CREATE INDEX "role_permissions_permissionId_idx" ON "role_permissions"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_tokenHash_key" ON "user_sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "user_sessions_userId_isValid_idx" ON "user_sessions"("userId", "isValid");

-- CreateIndex
CREATE INDEX "user_sessions_tokenHash_idx" ON "user_sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "user_sessions_expiresAt_idx" ON "user_sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_tokenHash_key" ON "password_resets"("tokenHash");

-- CreateIndex
CREATE INDEX "password_resets_userId_idx" ON "password_resets"("userId");

-- CreateIndex
CREATE INDEX "password_resets_tokenHash_idx" ON "password_resets"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "customers_userId_key" ON "customers"("userId");

-- CreateIndex
CREATE INDEX "customers_accountType_idx" ON "customers"("accountType");

-- CreateIndex
CREATE INDEX "customers_companyName_idx" ON "customers"("companyName");

-- CreateIndex
CREATE INDEX "customer_addresses_customerId_idx" ON "customer_addresses"("customerId");

-- CreateIndex
CREATE INDEX "customer_addresses_city_postalCode_idx" ON "customer_addresses"("city", "postalCode");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_agents_userId_key" ON "delivery_agents"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_agents_employeeCode_key" ON "delivery_agents"("employeeCode");

-- CreateIndex
CREATE INDEX "delivery_agents_employeeCode_idx" ON "delivery_agents"("employeeCode");

-- CreateIndex
CREATE INDEX "delivery_agents_employmentStatus_idx" ON "delivery_agents"("employmentStatus");

-- CreateIndex
CREATE INDEX "delivery_agents_assignedBranchId_idx" ON "delivery_agents"("assignedBranchId");

-- CreateIndex
CREATE INDEX "delivery_agents_assignedHubId_idx" ON "delivery_agents"("assignedHubId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_vehicles_licensePlate_key" ON "agent_vehicles"("licensePlate");

-- CreateIndex
CREATE INDEX "agent_vehicles_agentId_idx" ON "agent_vehicles"("agentId");

-- CreateIndex
CREATE INDEX "agent_vehicles_licensePlate_idx" ON "agent_vehicles"("licensePlate");

-- CreateIndex
CREATE INDEX "agent_vehicles_isActive_idx" ON "agent_vehicles"("isActive");

-- CreateIndex
CREATE INDEX "agent_availabilities_agentId_shiftDate_idx" ON "agent_availabilities"("agentId", "shiftDate");

-- CreateIndex
CREATE INDEX "agent_availabilities_status_idx" ON "agent_availabilities"("status");

-- CreateIndex
CREATE UNIQUE INDEX "branches_code_key" ON "branches"("code");

-- CreateIndex
CREATE INDEX "branches_code_idx" ON "branches"("code");

-- CreateIndex
CREATE INDEX "branches_city_stateProvince_idx" ON "branches"("city", "stateProvince");

-- CreateIndex
CREATE INDEX "branches_isActive_idx" ON "branches"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "hubs_code_key" ON "hubs"("code");

-- CreateIndex
CREATE INDEX "hubs_code_idx" ON "hubs"("code");

-- CreateIndex
CREATE INDEX "hubs_branchId_idx" ON "hubs"("branchId");

-- CreateIndex
CREATE INDEX "hubs_isActive_idx" ON "hubs"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "routes_routeCode_key" ON "routes"("routeCode");

-- CreateIndex
CREATE INDEX "routes_routeCode_idx" ON "routes"("routeCode");

-- CreateIndex
CREATE INDEX "routes_originBranchId_destinationBranchId_idx" ON "routes"("originBranchId", "destinationBranchId");

-- CreateIndex
CREATE INDEX "routes_isActive_idx" ON "routes"("isActive");

-- CreateIndex
CREATE INDEX "route_checkpoints_routeId_idx" ON "route_checkpoints"("routeId");

-- CreateIndex
CREATE INDEX "route_checkpoints_hubId_idx" ON "route_checkpoints"("hubId");

-- CreateIndex
CREATE UNIQUE INDEX "route_checkpoints_routeId_sequenceOrder_key" ON "route_checkpoints"("routeId", "sequenceOrder");

-- CreateIndex
CREATE UNIQUE INDEX "parcel_categories_code_key" ON "parcel_categories"("code");

-- CreateIndex
CREATE INDEX "parcel_categories_code_idx" ON "parcel_categories"("code");

-- CreateIndex
CREATE INDEX "parcel_categories_isActive_idx" ON "parcel_categories"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "parcels_trackingNumber_key" ON "parcels"("trackingNumber");

-- CreateIndex
CREATE UNIQUE INDEX "parcels_waybillBarcode_key" ON "parcels"("waybillBarcode");

-- CreateIndex
CREATE INDEX "parcels_trackingNumber_idx" ON "parcels"("trackingNumber");

-- CreateIndex
CREATE INDEX "parcels_status_idx" ON "parcels"("status");

-- CreateIndex
CREATE INDEX "parcels_senderId_idx" ON "parcels"("senderId");

-- CreateIndex
CREATE INDEX "parcels_customerId_idx" ON "parcels"("customerId");

-- CreateIndex
CREATE INDEX "parcels_assignedAgentId_idx" ON "parcels"("assignedAgentId");

-- CreateIndex
CREATE INDEX "parcels_paymentStatus_idx" ON "parcels"("paymentStatus");

-- CreateIndex
CREATE INDEX "parcels_estimatedDeliveryDate_idx" ON "parcels"("estimatedDeliveryDate");

-- CreateIndex
CREATE INDEX "parcels_createdAt_idx" ON "parcels"("createdAt");

-- CreateIndex
CREATE INDEX "parcels_originBranchId_destinationBranchId_idx" ON "parcels"("originBranchId", "destinationBranchId");

-- CreateIndex
CREATE INDEX "parcels_deletedAt_idx" ON "parcels"("deletedAt");

-- CreateIndex
CREATE INDEX "parcel_assignments_parcelId_idx" ON "parcel_assignments"("parcelId");

-- CreateIndex
CREATE INDEX "parcel_assignments_agentId_status_idx" ON "parcel_assignments"("agentId", "status");

-- CreateIndex
CREATE INDEX "parcel_assignments_assignedAt_idx" ON "parcel_assignments"("assignedAt");

-- CreateIndex
CREATE INDEX "tracking_histories_parcelId_checkpointTimestamp_idx" ON "tracking_histories"("parcelId", "checkpointTimestamp");

-- CreateIndex
CREATE INDEX "tracking_histories_trackingNumber_idx" ON "tracking_histories"("trackingNumber");

-- CreateIndex
CREATE INDEX "tracking_histories_status_idx" ON "tracking_histories"("status");

-- CreateIndex
CREATE INDEX "tracking_histories_checkpointTimestamp_idx" ON "tracking_histories"("checkpointTimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_proofs_parcelId_key" ON "delivery_proofs"("parcelId");

-- CreateIndex
CREATE INDEX "delivery_proofs_parcelId_idx" ON "delivery_proofs"("parcelId");

-- CreateIndex
CREATE INDEX "delivery_proofs_agentId_idx" ON "delivery_proofs"("agentId");

-- CreateIndex
CREATE INDEX "delivery_proofs_deliveredAt_idx" ON "delivery_proofs"("deliveredAt");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_invoiceNumber_idx" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_billedUserId_idx" ON "invoices"("billedUserId");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_dueDate_idx" ON "invoices"("dueDate");

-- CreateIndex
CREATE INDEX "invoices_createdAt_idx" ON "invoices"("createdAt");

-- CreateIndex
CREATE INDEX "invoice_line_items_invoiceId_idx" ON "invoice_line_items"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentReference_key" ON "payments"("paymentReference");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");

-- CreateIndex
CREATE INDEX "payments_paymentReference_idx" ON "payments"("paymentReference");

-- CreateIndex
CREATE INDEX "payments_parcelId_idx" ON "payments"("parcelId");

-- CreateIndex
CREATE INDEX "payments_invoiceId_idx" ON "payments"("invoiceId");

-- CreateIndex
CREATE INDEX "payments_payerUserId_idx" ON "payments"("payerUserId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_transactionId_idx" ON "payments"("transactionId");

-- CreateIndex
CREATE INDEX "payments_createdAt_idx" ON "payments"("createdAt");

-- CreateIndex
CREATE INDEX "transaction_histories_paymentId_idx" ON "transaction_histories"("paymentId");

-- CreateIndex
CREATE INDEX "transaction_histories_referenceNumber_idx" ON "transaction_histories"("referenceNumber");

-- CreateIndex
CREATE INDEX "transaction_histories_createdAt_idx" ON "transaction_histories"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_recipientUserId_isRead_idx" ON "notifications"("recipientUserId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_recipientUserId_createdAt_idx" ON "notifications"("recipientUserId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notification_preferences_userId_idx" ON "notification_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_notificationType_key" ON "notification_preferences"("userId", "notificationType");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticketNumber_key" ON "support_tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "support_tickets_ticketNumber_idx" ON "support_tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "support_tickets_customerId_idx" ON "support_tickets"("customerId");

-- CreateIndex
CREATE INDEX "support_tickets_parcelId_idx" ON "support_tickets"("parcelId");

-- CreateIndex
CREATE INDEX "support_tickets_externalOrderId_idx" ON "support_tickets"("externalOrderId");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_priority_idx" ON "support_tickets"("priority");

-- CreateIndex
CREATE INDEX "support_tickets_createdAt_idx" ON "support_tickets"("createdAt");

-- CreateIndex
CREATE INDEX "ticket_messages_ticketId_createdAt_idx" ON "ticket_messages"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");

-- CreateIndex
CREATE INDEX "activity_logs_entityType_entityId_idx" ON "activity_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_tableName_recordId_idx" ON "audit_logs"("tableName", "recordId");

-- CreateIndex
CREATE INDEX "audit_logs_performedByUserId_idx" ON "audit_logs"("performedByUserId");

-- CreateIndex
CREATE INDEX "audit_logs_actionType_idx" ON "audit_logs"("actionType");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "system_settings_key_idx" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "system_settings_category_idx" ON "system_settings"("category");

-- CreateIndex
CREATE UNIQUE INDEX "daily_operational_metrics_metricDate_key" ON "daily_operational_metrics"("metricDate");

-- CreateIndex
CREATE INDEX "daily_operational_metrics_metricDate_idx" ON "daily_operational_metrics"("metricDate");

-- CreateIndex
CREATE INDEX "agent_performance_metrics_agentId_idx" ON "agent_performance_metrics"("agentId");

-- CreateIndex
CREATE INDEX "agent_performance_metrics_periodDate_idx" ON "agent_performance_metrics"("periodDate");

-- CreateIndex
CREATE UNIQUE INDEX "agent_performance_metrics_agentId_periodDate_key" ON "agent_performance_metrics"("agentId", "periodDate");

-- CreateIndex
CREATE INDEX "external_accounts_customerId_idx" ON "external_accounts"("customerId");

-- CreateIndex
CREATE INDEX "external_accounts_platform_idx" ON "external_accounts"("platform");

-- CreateIndex
CREATE INDEX "external_accounts_status_idx" ON "external_accounts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "external_accounts_customerId_platform_key" ON "external_accounts"("customerId", "platform");

-- CreateIndex
CREATE INDEX "external_orders_customerId_idx" ON "external_orders"("customerId");

-- CreateIndex
CREATE INDEX "external_orders_externalAccountId_idx" ON "external_orders"("externalAccountId");

-- CreateIndex
CREATE INDEX "external_orders_platform_idx" ON "external_orders"("platform");

-- CreateIndex
CREATE INDEX "external_orders_status_idx" ON "external_orders"("status");

-- CreateIndex
CREATE INDEX "external_orders_orderDate_idx" ON "external_orders"("orderDate");

-- CreateIndex
CREATE INDEX "external_orders_expectedDeliveryDate_idx" ON "external_orders"("expectedDeliveryDate");

-- CreateIndex
CREATE INDEX "external_orders_platformTrackingNumber_idx" ON "external_orders"("platformTrackingNumber");

-- CreateIndex
CREATE UNIQUE INDEX "external_orders_platform_platformOrderId_key" ON "external_orders"("platform", "platformOrderId");

-- CreateIndex
CREATE INDEX "external_order_tracking_externalOrderId_eventTimestamp_idx" ON "external_order_tracking"("externalOrderId", "eventTimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "return_requests_returnNumber_key" ON "return_requests"("returnNumber");

-- CreateIndex
CREATE INDEX "return_requests_returnNumber_idx" ON "return_requests"("returnNumber");

-- CreateIndex
CREATE INDEX "return_requests_customerId_idx" ON "return_requests"("customerId");

-- CreateIndex
CREATE INDEX "return_requests_parcelId_idx" ON "return_requests"("parcelId");

-- CreateIndex
CREATE INDEX "return_requests_externalOrderId_idx" ON "return_requests"("externalOrderId");

-- CreateIndex
CREATE INDEX "return_requests_status_idx" ON "return_requests"("status");

-- CreateIndex
CREATE INDEX "return_requests_createdAt_idx" ON "return_requests"("createdAt");

-- CreateIndex
CREATE INDEX "delivery_preferences_customerId_idx" ON "delivery_preferences"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_preferences_customerId_preferenceType_key" ON "delivery_preferences"("customerId", "preferenceType");

-- CreateIndex
CREATE INDEX "customer_notifications_customerId_isRead_idx" ON "customer_notifications"("customerId", "isRead");

-- CreateIndex
CREATE INDEX "customer_notifications_customerId_createdAt_idx" ON "customer_notifications"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "customer_notifications_type_idx" ON "customer_notifications"("type");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_agents" ADD CONSTRAINT "delivery_agents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_agents" ADD CONSTRAINT "delivery_agents_assignedBranchId_fkey" FOREIGN KEY ("assignedBranchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_agents" ADD CONSTRAINT "delivery_agents_assignedHubId_fkey" FOREIGN KEY ("assignedHubId") REFERENCES "hubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_vehicles" ADD CONSTRAINT "agent_vehicles_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "delivery_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_availabilities" ADD CONSTRAINT "agent_availabilities_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "delivery_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hubs" ADD CONSTRAINT "hubs_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_originBranchId_fkey" FOREIGN KEY ("originBranchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_destinationBranchId_fkey" FOREIGN KEY ("destinationBranchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_originHubId_fkey" FOREIGN KEY ("originHubId") REFERENCES "hubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_destinationHubId_fkey" FOREIGN KEY ("destinationHubId") REFERENCES "hubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_checkpoints" ADD CONSTRAINT "route_checkpoints_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_checkpoints" ADD CONSTRAINT "route_checkpoints_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "hubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "parcel_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "delivery_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_originBranchId_fkey" FOREIGN KEY ("originBranchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_destinationBranchId_fkey" FOREIGN KEY ("destinationBranchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_currentHubId_fkey" FOREIGN KEY ("currentHubId") REFERENCES "hubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_assignedRouteId_fkey" FOREIGN KEY ("assignedRouteId") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcel_assignments" ADD CONSTRAINT "parcel_assignments_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcel_assignments" ADD CONSTRAINT "parcel_assignments_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "delivery_agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcel_assignments" ADD CONSTRAINT "parcel_assignments_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "agent_vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_histories" ADD CONSTRAINT "tracking_histories_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_histories" ADD CONSTRAINT "tracking_histories_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "hubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_histories" ADD CONSTRAINT "tracking_histories_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "delivery_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_proofs" ADD CONSTRAINT "delivery_proofs_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_proofs" ADD CONSTRAINT "delivery_proofs_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "delivery_agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_proofs" ADD CONSTRAINT "delivery_proofs_verifiedByAdminId_fkey" FOREIGN KEY ("verifiedByAdminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_billedUserId_fkey" FOREIGN KEY ("billedUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_payerUserId_fkey" FOREIGN KEY ("payerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_histories" ADD CONSTRAINT "transaction_histories_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_externalOrderId_fkey" FOREIGN KEY ("externalOrderId") REFERENCES "external_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assignedToAdminId_fkey" FOREIGN KEY ("assignedToAdminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performedByUserId_fkey" FOREIGN KEY ("performedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_performance_metrics" ADD CONSTRAINT "agent_performance_metrics_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "delivery_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_accounts" ADD CONSTRAINT "external_accounts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_orders" ADD CONSTRAINT "external_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_orders" ADD CONSTRAINT "external_orders_externalAccountId_fkey" FOREIGN KEY ("externalAccountId") REFERENCES "external_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_order_tracking" ADD CONSTRAINT "external_order_tracking_externalOrderId_fkey" FOREIGN KEY ("externalOrderId") REFERENCES "external_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_externalOrderId_fkey" FOREIGN KEY ("externalOrderId") REFERENCES "external_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "delivery_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_preferences" ADD CONSTRAINT "delivery_preferences_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_notifications" ADD CONSTRAINT "customer_notifications_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
