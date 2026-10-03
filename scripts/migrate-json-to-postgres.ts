#!/usr/bin/env tsx
// SwiftRoute Enterprise - JSON to PostgreSQL Data Migration Script
// This script migrates all existing data from datastore.json to PostgreSQL via Prisma

import fs from 'fs';
import path from 'path';
import prisma from '../backend/database/prisma';
import { logger } from '../backend/utils/logger';

interface MigrationReport {
  entity: string;
  oldCount: number;
  migrated: number;
  failed: number;
  skipped: number;
  errors: string[];
}

const report: MigrationReport[] = [];

function addReport(entity: string, oldCount: number, migrated: number, failed: number, skipped: number, errors: string[] = []) {
  report.push({ entity, oldCount, migrated, failed, skipped, errors });
}

async function migrateData() {
  console.log('='.repeat(80));
  console.log('SwiftRoute Enterprise - JSON to PostgreSQL Data Migration');
  console.log('='.repeat(80));
  console.log('');

  const datastorePath = path.resolve(process.cwd(), 'backend/database/datastore.json');
  
  if (!fs.existsSync(datastorePath)) {
    console.error('✗ datastore.json not found at:', datastorePath);
    process.exit(1);
  }

  console.log('✓ Loading datastore.json...');
  const rawData = fs.readFileSync(datastorePath, 'utf-8');
  const datastore = JSON.parse(rawData);
  console.log('✓ Datastore loaded successfully\n');

  try {
    // STEP 1: Create default roles first (required for users)
    console.log('STEP 1: Creating default roles...');
    const roles = [
      { name: 'Super Administrator', code: 'SUPER_ADMIN', description: 'Full system access', isSystem: true },
      { name: 'Administrator', code: 'ADMIN', description: 'Administrative access', isSystem: true },
      { name: 'Dispatcher', code: 'DISPATCHER', description: 'Dispatch operations', isSystem: true },
      { name: 'Courier Agent', code: 'COURIER_AGENT', description: 'Delivery agent', isSystem: true },
      { name: 'Customer', code: 'CUSTOMER', description: 'Customer user', isSystem: true },
      { name: 'Hub Manager', code: 'HUB_MANAGER', description: 'Hub management', isSystem: true },
    ];

    let rolesCreated = 0;
    const roleMap: Record<string, string> = {}; // Map old role names to new role IDs

    for (const role of roles) {
      try {
        const existing = await prisma.role.findUnique({ where: { code: role.code } });
        if (!existing) {
          const created = await prisma.role.create({ data: role });
          rolesCreated++;
          console.log(`  ✓ Created role: ${role.name} (${role.code})`);
          
          // Map common role names
          if (role.code === 'ADMIN') roleMap['admin'] = created.id;
          if (role.code === 'COURIER_AGENT') roleMap['agent'] = created.id;
          if (role.code === 'CUSTOMER') roleMap['customer'] = created.id;
        } else {
          console.log(`  - Role already exists: ${role.name}`);
          if (role.code === 'ADMIN') roleMap['admin'] = existing.id;
          if (role.code === 'COURIER_AGENT') roleMap['agent'] = existing.id;
          if (role.code === 'CUSTOMER') roleMap['customer'] = existing.id;
        }
      } catch (err: any) {
        console.error(`  ✗ Failed to create role ${role.name}:`, err.message);
      }
    }
    console.log(`✓ Roles: ${rolesCreated} created\n`);

    // STEP 2: Migrate Users
    console.log('STEP 2: Migrating users...');
    const users = datastore.users || [];
    let usersMigrated = 0;
    let usersFailed = 0;
    const userErrors: string[] = [];
    const userIdMap: Record<string, string> = {}; // Map old user IDs to new user IDs

    for (const oldUser of users) {
      try {
        // Check if user already exists
        const existing = await prisma.user.findUnique({
          where: { email: oldUser.email }
        });

        if (existing) {
          console.log(`  - User already exists: ${oldUser.email}`);
          userIdMap[oldUser.id] = existing.id;
          continue;
        }

        // Get role ID
        const roleId = roleMap[oldUser.role];
        if (!roleId) {
          throw new Error(`Role not found for: ${oldUser.role}`);
        }

        // Create user
        const newUser = await prisma.user.create({
          data: {
            email: oldUser.email,
            passwordHash: oldUser.password_hash || '',
            fullName: oldUser.full_name || oldUser.email,
            phone: oldUser.phone || '',
            address: oldUser.address || '',
            avatarUrl: oldUser.avatar_url || null,
            roleId: roleId,
            status: oldUser.status === 'active' ? 'ACTIVE' : 'SUSPENDED',
            isEmailVerified: true,
            createdAt: oldUser.created_at ? new Date(oldUser.created_at) : new Date(),
            updatedAt: oldUser.updated_at ? new Date(oldUser.updated_at) : new Date(),
          }
        });

        userIdMap[oldUser.id] = newUser.id;
        usersMigrated++;
        console.log(`  ✓ Migrated user: ${oldUser.email} (${oldUser.role})`);

        // If user is an agent, create delivery agent profile
        if (oldUser.role === 'agent') {
          await prisma.deliveryAgent.create({
            data: {
              userId: newUser.id,
              employeeCode: oldUser.employee_id || `EMP-${newUser.id.substring(0, 8).toUpperCase()}`,
              licenseNumber: oldUser.license_number || null,
              employmentStatus: oldUser.verification_status === 'approved' ? 'ACTIVE' : 'PROBATION',
              rating: 5.0,
              createdAt: new Date(oldUser.created_at || Date.now()),
              updatedAt: new Date(oldUser.updated_at || Date.now()),
            }
          });
          console.log(`    ✓ Created delivery agent profile for: ${oldUser.email}`);
        }

        // If user is a customer, create customer profile
        if (oldUser.role === 'customer') {
          await prisma.customer.create({
            data: {
              userId: newUser.id,
              accountType: 'INDIVIDUAL',
              creditLimit: 0,
              currentBalance: 0,
              paymentTermsDays: 0,
              customDiscountPercent: 0,
              createdAt: new Date(oldUser.created_at || Date.now()),
              updatedAt: new Date(oldUser.updated_at || Date.now()),
            }
          });
          console.log(`    ✓ Created customer profile for: ${oldUser.email}`);
        }

      } catch (err: any) {
        usersFailed++;
        userErrors.push(`${oldUser.email}: ${err.message}`);
        console.error(`  ✗ Failed to migrate user ${oldUser.email}:`, err.message);
      }
    }
    addReport('Users', users.length, usersMigrated, usersFailed, users.length - usersMigrated - usersFailed, userErrors);
    console.log(`✓ Users: ${usersMigrated} migrated, ${usersFailed} failed\n`);

    // STEP 3: Create default parcel category
    console.log('STEP 3: Creating default parcel categories...');
    const categories = [
      { code: 'STANDARD', name: 'Standard Delivery', baseRateMultiplier: 1.0, handlingSurcharge: 0, maxAllowedWeightKg: 100, isActive: true },
      { code: 'EXPRESS', name: 'Express Delivery', baseRateMultiplier: 1.5, handlingSurcharge: 15, maxAllowedWeightKg: 50, isActive: true },
      { code: 'FRAGILE', name: 'Fragile Handling', baseRateMultiplier: 1.3, handlingSurcharge: 7.5, maxAllowedWeightKg: 75, requiresSpecialHandling: true, isActive: true },
      { code: 'DOCUMENT', name: 'Document Delivery', baseRateMultiplier: 0.8, handlingSurcharge: 0, maxAllowedWeightKg: 5, isActive: true },
      { code: 'HEAVY', name: 'Heavy Freight', baseRateMultiplier: 1.8, handlingSurcharge: 25, maxAllowedWeightKg: 1000, requiresSpecialHandling: true, isActive: true },
    ];

    let categoriesCreated = 0;
    const categoryMap: Record<string, string> = {};

    for (const cat of categories) {
      try {
        const existing = await prisma.parcelCategory.findUnique({ where: { code: cat.code } });
        if (!existing) {
          const created = await prisma.parcelCategory.create({ data: cat });
          categoriesCreated++;
          categoryMap[cat.code.toLowerCase()] = created.id;
          console.log(`  ✓ Created category: ${cat.name}`);
        } else {
          categoryMap[cat.code.toLowerCase()] = existing.id;
          console.log(`  - Category already exists: ${cat.name}`);
        }
      } catch (err: any) {
        console.error(`  ✗ Failed to create category ${cat.name}:`, err.message);
      }
    }
    console.log(`✓ Categories: ${categoriesCreated} created\n`);

    // STEP 4: Migrate Parcels
    console.log('STEP 4: Migrating parcels...');
    const parcels = datastore.parcels || [];
    let parcelsMigrated = 0;
    let parcelsFailed = 0;
    const parcelErrors: string[] = [];
    const parcelIdMap: Record<string, string> = {};

    for (const oldParcel of parcels) {
      try {
        // Check if parcel already exists
        const existing = await prisma.parcel.findUnique({
          where: { trackingNumber: oldParcel.tracking_number }
        });

        if (existing) {
          console.log(`  - Parcel already exists: ${oldParcel.tracking_number}`);
          parcelIdMap[oldParcel.id] = existing.id;
          continue;
        }

        // Map old sender ID to new user ID
        const senderId = userIdMap[oldParcel.sender_id];
        if (!senderId) {
          throw new Error(`Sender user not found: ${oldParcel.sender_id}`);
        }

        // Get customer ID if exists
        const customer = await prisma.customer.findUnique({
          where: { userId: senderId }
        });

        // Get category ID
        const parcelType = (oldParcel.parcel_type || 'standard').toLowerCase();
        const categoryId = categoryMap[parcelType] || categoryMap['standard'];

        // Map status
        const statusMap: Record<string, string> = {
          'pending': 'PENDING',
          'assigned': 'ASSIGNED',
          'picked_up': 'PICKED_UP',
          'in_transit': 'IN_TRANSIT',
          'out_for_delivery': 'OUT_FOR_DELIVERY',
          'delivered': 'DELIVERED',
          'failed': 'FAILED',
          'cancelled': 'CANCELLED',
        };
        const status = statusMap[oldParcel.status] || 'PENDING';

        // Map payment status
        const paymentStatusMap: Record<string, string> = {
          'paid': 'PAID',
          'unpaid': 'UNPAID',
          'partially_paid': 'PARTIALLY_PAID',
        };
        const paymentStatus = paymentStatusMap[oldParcel.payment_status] || 'UNPAID';

        // Map assigned agent
        const assignedAgentId = oldParcel.assigned_agent_id ? userIdMap[oldParcel.assigned_agent_id] : null;
        let assignedAgentPrismaId = null;
        if (assignedAgentId) {
          const agent = await prisma.deliveryAgent.findUnique({
            where: { userId: assignedAgentId }
          });
          assignedAgentPrismaId = agent?.id || null;
        }

        // Create parcel
        const newParcel = await prisma.parcel.create({
          data: {
            trackingNumber: oldParcel.tracking_number,
            senderId: senderId,
            customerId: customer?.id || null,
            categoryId: categoryId,
            parcelType: parcelType.toUpperCase() as any,
            status: status as any,
            senderName: oldParcel.sender_name,
            senderPhone: oldParcel.sender_phone || '',
            senderEmail: oldParcel.sender_email || null,
            pickupAddress: oldParcel.pickup_address,
            pickupCity: oldParcel.pickup_city || null,
            pickupPostalCode: oldParcel.pickup_postal_code || null,
            recipientName: oldParcel.recipient_name,
            recipientPhone: oldParcel.recipient_phone,
            recipientEmail: oldParcel.recipient_email || null,
            deliveryAddress: oldParcel.delivery_address,
            deliveryCity: oldParcel.delivery_city || null,
            deliveryPostalCode: oldParcel.delivery_postal_code || null,
            assignedAgentId: assignedAgentPrismaId,
            weightKg: oldParcel.weight_kg || 1.0,
            dimensionsText: oldParcel.dimensions || null,
            baseShippingCost: oldParcel.shipping_cost || 0,
            totalShippingCost: oldParcel.shipping_cost || 0,
            paymentStatus: paymentStatus as any,
            paymentTerms: oldParcel.payment_status === 'paid' ? 'PREPAID' : 'CASH_ON_DELIVERY',
            estimatedDeliveryDate: oldParcel.estimated_delivery ? new Date(oldParcel.estimated_delivery) : new Date(),
            actualDeliveryDate: oldParcel.actual_delivery_date ? new Date(oldParcel.actual_delivery_date) : null,
            specialInstructions: oldParcel.special_instructions || null,
            createdAt: oldParcel.created_at ? new Date(oldParcel.created_at) : new Date(),
            updatedAt: oldParcel.updated_at ? new Date(oldParcel.updated_at) : new Date(),
          }
        });

        parcelIdMap[oldParcel.id] = newParcel.id;
        parcelsMigrated++;
        console.log(`  ✓ Migrated parcel: ${oldParcel.tracking_number} (${status})`);

      } catch (err: any) {
        parcelsFailed++;
        parcelErrors.push(`${oldParcel.tracking_number}: ${err.message}`);
        console.error(`  ✗ Failed to migrate parcel ${oldParcel.tracking_number}:`, err.message);
      }
    }
    addReport('Parcels', parcels.length, parcelsMigrated, parcelsFailed, parcels.length - parcelsMigrated - parcelsFailed, parcelErrors);
    console.log(`✓ Parcels: ${parcelsMigrated} migrated, ${parcelsFailed} failed\n`);

    // STEP 5: Migrate Tracking History
    console.log('STEP 5: Migrating parcel tracking...');
    const tracking = datastore.parcel_tracking || [];
    let trackingMigrated = 0;
    let trackingFailed = 0;
    const trackingErrors: string[] = [];

    for (const oldTracking of tracking) {
      try {
        // Map parcel ID
        const parcelId = parcelIdMap[oldTracking.parcel_id];
        if (!parcelId) {
          throw new Error(`Parcel not found: ${oldTracking.parcel_id}`);
        }

        // Map status
        const statusMap: Record<string, string> = {
          'pending': 'PENDING',
          'picked_up': 'PICKED_UP',
          'in_transit': 'IN_TRANSIT',
          'out_for_delivery': 'OUT_FOR_DELIVERY',
          'delivered': 'DELIVERED',
        };
        const status = statusMap[oldTracking.status] || 'IN_TRANSIT';

        await prisma.trackingHistory.create({
          data: {
            parcelId: parcelId,
            trackingNumber: oldTracking.tracking_number,
            status: status as any,
            facilityName: oldTracking.location || 'Unknown Location',
            locationText: oldTracking.location || 'Unknown Location',
            description: oldTracking.description,
            checkpointTimestamp: oldTracking.timestamp ? new Date(oldTracking.timestamp) : new Date(),
            createdAt: oldTracking.timestamp ? new Date(oldTracking.timestamp) : new Date(),
          }
        });

        trackingMigrated++;
        console.log(`  ✓ Migrated tracking: ${oldTracking.tracking_number} - ${status}`);

      } catch (err: any) {
        trackingFailed++;
        trackingErrors.push(`${oldTracking.tracking_number}: ${err.message}`);
        console.error(`  ✗ Failed to migrate tracking:`, err.message);
      }
    }
    addReport('Tracking Events', tracking.length, trackingMigrated, trackingFailed, tracking.length - trackingMigrated - trackingFailed, trackingErrors);
    console.log(`✓ Tracking: ${trackingMigrated} migrated, ${trackingFailed} failed\n`);

    // STEP 6: Migrate Payments
    console.log('STEP 6: Migrating payments...');
    const payments = datastore.payments || [];
    let paymentsMigrated = 0;
    let paymentsFailed = 0;
    const paymentErrors: string[] = [];

    for (const oldPayment of payments) {
      try {
        // Check if payment already exists
        const existing = await prisma.payment.findUnique({
          where: { transactionId: oldPayment.transaction_id }
        });

        if (existing) {
          console.log(`  - Payment already exists: ${oldPayment.transaction_id}`);
          continue;
        }

        // Map parcel and user IDs
        const parcelId = parcelIdMap[oldPayment.parcel_id];
        const payerUserId = userIdMap[oldPayment.user_id];

        if (!parcelId || !payerUserId) {
          throw new Error(`Parcel or user not found`);
        }

        // Map payment method
        const methodMap: Record<string, string> = {
          'card': 'CREDIT_CARD',
          'wallet': 'DIGITAL_WALLET',
          'cash': 'CASH_ON_DELIVERY',
        };
        const method = methodMap[oldPayment.payment_method] || 'CREDIT_CARD';

        // Map status
        const statusMap: Record<string, string> = {
          'completed': 'COMPLETED',
          'pending': 'PENDING',
          'failed': 'FAILED',
        };
        const status = statusMap[oldPayment.status] || 'COMPLETED';

        await prisma.payment.create({
          data: {
            paymentReference: `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            parcelId: parcelId,
            payerUserId: payerUserId,
            amount: oldPayment.amount,
            paymentMethod: method as any,
            transactionId: oldPayment.transaction_id,
            status: status as any,
            processedAt: oldPayment.created_at ? new Date(oldPayment.created_at) : new Date(),
            createdAt: oldPayment.created_at ? new Date(oldPayment.created_at) : new Date(),
          }
        });

        paymentsMigrated++;
        console.log(`  ✓ Migrated payment: ${oldPayment.transaction_id} ($${oldPayment.amount})`);

      } catch (err: any) {
        paymentsFailed++;
        paymentErrors.push(`${oldPayment.transaction_id}: ${err.message}`);
        console.error(`  ✗ Failed to migrate payment:`, err.message);
      }
    }
    addReport('Payments', payments.length, paymentsMigrated, paymentsFailed, payments.length - paymentsMigrated - paymentsFailed, paymentErrors);
    console.log(`✓ Payments: ${paymentsMigrated} migrated, ${paymentsFailed} failed\n`);

    // STEP 7: Migrate Delivery Proofs
    console.log('STEP 7: Migrating delivery proofs...');
    const proofs = datastore.delivery_proofs || [];
    let proofsMigrated = 0;
    let proofsFailed = 0;
    const proofErrors: string[] = [];

    for (const oldProof of proofs) {
      try {
        // Check if proof already exists
        const parcelId = parcelIdMap[oldProof.parcel_id];
        if (!parcelId) {
          throw new Error(`Parcel not found: ${oldProof.parcel_id}`);
        }

        const existing = await prisma.deliveryProof.findUnique({
          where: { parcelId: parcelId }
        });

        if (existing) {
          console.log(`  - Delivery proof already exists for parcel: ${oldProof.parcel_id}`);
          continue;
        }

        // Map agent ID
        const agentUserId = userIdMap[oldProof.agent_id];
        if (!agentUserId) {
          throw new Error(`Agent user not found: ${oldProof.agent_id}`);
        }

        const agent = await prisma.deliveryAgent.findUnique({
          where: { userId: agentUserId }
        });

        if (!agent) {
          throw new Error(`Delivery agent profile not found for user: ${agentUserId}`);
        }

        await prisma.deliveryProof.create({
          data: {
            parcelId: parcelId,
            agentId: agent.id,
            recipientName: oldProof.recipient_name,
            signatureUrl: oldProof.signature_url || null,
            photoProofUrl: oldProof.photo_url || null,
            notes: oldProof.notes || null,
            deliveredAt: oldProof.delivered_at ? new Date(oldProof.delivered_at) : new Date(),
            createdAt: oldProof.delivered_at ? new Date(oldProof.delivered_at) : new Date(),
          }
        });

        proofsMigrated++;
        console.log(`  ✓ Migrated delivery proof for: ${oldProof.recipient_name}`);

      } catch (err: any) {
        proofsFailed++;
        proofErrors.push(`Parcel ${oldProof.parcel_id}: ${err.message}`);
        console.error(`  ✗ Failed to migrate delivery proof:`, err.message);
      }
    }
    addReport('Delivery Proofs', proofs.length, proofsMigrated, proofsFailed, proofs.length - proofsMigrated - proofsFailed, proofErrors);
    console.log(`✓ Delivery Proofs: ${proofsMigrated} migrated, ${proofsFailed} failed\n`);

    // STEP 8: Migrate Activity Logs
    console.log('STEP 8: Migrating activity logs...');
    const logs = datastore.activity_logs || [];
    let logsMigrated = 0;
    let logsFailed = 0;

    for (const oldLog of logs) {
      try {
        const userId = oldLog.user_id ? userIdMap[oldLog.user_id] : null;

        await prisma.activityLog.create({
          data: {
            userId: userId,
            userName: oldLog.user_name || null,
            userRole: oldLog.user_role || null,
            action: oldLog.action,
            entityType: oldLog.entity_type,
            entityId: oldLog.entity_id || null,
            details: oldLog.details,
            createdAt: oldLog.created_at ? new Date(oldLog.created_at) : new Date(),
          }
        });

        logsMigrated++;

      } catch (err: any) {
        logsFailed++;
        console.error(`  ✗ Failed to migrate activity log:`, err.message);
      }
    }
    addReport('Activity Logs', logs.length, logsMigrated, logsFailed, logs.length - logsMigrated - logsFailed);
    console.log(`✓ Activity Logs: ${logsMigrated} migrated, ${logsFailed} failed\n`);

    // STEP 9: Migrate External Orders (if any)
    console.log('STEP 9: Migrating external orders...');
    const externalOrders = datastore.external_orders || [];
    addReport('External Orders', externalOrders.length, 0, 0, externalOrders.length);
    console.log(`✓ External Orders: ${externalOrders.length} found (skipped - will be synced from external platforms)\n`);

    // STEP 10: Migrate System Settings
    console.log('STEP 10: Migrating system settings...');
    const settings = datastore.system_settings || {};
    let settingsMigrated = 0;

    const settingsToMigrate = [
      { key: 'company_name', value: settings.company_name || 'SwiftRoute Global Logistics', dataType: 'STRING', category: 'GENERAL' },
      { key: 'support_email', value: settings.support_email || 'support@swiftroute.com', dataType: 'STRING', category: 'GENERAL' },
      { key: 'support_phone', value: settings.support_phone || '+1 (800) 555-SWIFT', dataType: 'STRING', category: 'GENERAL' },
      { key: 'currency', value: settings.currency || 'USD', dataType: 'STRING', category: 'PRICING' },
      { key: 'base_rate_per_kg', value: String(settings.base_rate_per_kg || 8.5), dataType: 'NUMBER', category: 'PRICING' },
      { key: 'tax_rate_percent', value: String(settings.tax_rate_percent || 8.25), dataType: 'NUMBER', category: 'PRICING' },
    ];

    for (const setting of settingsToMigrate) {
      try {
        await prisma.systemSetting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: setting as any,
        });
        settingsMigrated++;
      } catch (err: any) {
        console.error(`  ✗ Failed to migrate setting ${setting.key}:`, err.message);
      }
    }
    addReport('System Settings', settingsToMigrate.length, settingsMigrated, 0, 0);
    console.log(`✓ System Settings: ${settingsMigrated} migrated\n`);

    // Print final migration report
    console.log('='.repeat(80));
    console.log('MIGRATION REPORT');
    console.log('='.repeat(80));
    console.log('');

    let totalOld = 0;
    let totalMigrated = 0;
    let totalFailed = 0;

    for (const item of report) {
      totalOld += item.oldCount;
      totalMigrated += item.migrated;
      totalFailed += item.failed;

      console.log(`${item.entity}:`);
      console.log(`  Old Count:  ${item.oldCount}`);
      console.log(`  Migrated:   ${item.migrated}`);
      console.log(`  Failed:     ${item.failed}`);
      console.log(`  Skipped:    ${item.skipped}`);
      
      if (item.errors.length > 0 && item.errors.length <= 5) {
        console.log(`  Errors:`);
        item.errors.forEach(err => console.log(`    - ${err}`));
      } else if (item.errors.length > 5) {
        console.log(`  Errors: ${item.errors.length} errors (showing first 3)`);
        item.errors.slice(0, 3).forEach(err => console.log(`    - ${err}`));
      }
      console.log('');
    }

    console.log('='.repeat(80));
    console.log(`TOTAL: ${totalOld} records found, ${totalMigrated} migrated, ${totalFailed} failed`);
    console.log('='.repeat(80));
    console.log('');
    console.log('✓ Migration completed successfully!');
    console.log('');

  } catch (error: any) {
    console.error('\n✗ Migration failed with error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateData()
  .then(() => {
    console.log('✓ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Fatal error:', error);
    process.exit(1);
  });
