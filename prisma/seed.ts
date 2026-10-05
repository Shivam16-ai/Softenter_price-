import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('📦 Starting SwiftRoute Enterprise Database Seed...');

  // 1. ROLES & PERMISSIONS
  console.log('Seeding RBAC Roles & Permissions...');
  const roles = [
    { code: 'SUPER_ADMIN', name: 'Super Administrator', description: 'Complete system sovereignty and audit oversight', isSystem: true },
    { code: 'ADMIN', name: 'Operations Administrator', description: 'Logistics management, fleet dispatch, user oversight', isSystem: true },
    { code: 'DISPATCHER', name: 'Fleet Dispatcher', description: 'Route optimization, courier assignment, manifest tracking', isSystem: true },
    { code: 'COURIER_AGENT', name: 'Courier Agent', description: 'Field delivery, pickup, checkpoint scanning, electronic POD', isSystem: true },
    { code: 'CUSTOMER', name: 'Commercial Shipper', description: 'Booking consignments, billing management, live telemetry', isSystem: true },
    { code: 'HUB_MANAGER', name: 'Depot & Hub Manager', description: 'Inbound/outbound sorting, dock management, weighbridge', isSystem: true },
  ];

  const roleMap = new Map<string, string>();
  for (const r of roles) {
    const roleRecord = await prisma.role.upsert({
      where: { code: r.code as any },
      update: { name: r.name, description: r.description },
      create: r as any,
    });
    roleMap.set(r.code, roleRecord.id);
  }

  // 2. SYSTEM SETTINGS
  console.log('Seeding System Settings...');
  const settings = [
    { key: 'company_name', value: 'SwiftRoute Logistics Enterprise Inc.', dataType: 'STRING', category: 'GENERAL', isPublic: true },
    { key: 'support_email', value: 'support@swiftroute.com', dataType: 'STRING', category: 'GENERAL', isPublic: true },
    { key: 'support_phone', value: '+1 (800) 555-SWIFT', dataType: 'STRING', category: 'GENERAL', isPublic: true },
    { key: 'currency', value: 'INR', dataType: 'STRING', category: 'PRICING', isPublic: true },
    { key: 'base_rate_per_kg', value: '5.50', dataType: 'NUMBER', category: 'PRICING', isPublic: true },
    { key: 'express_surcharge', value: '18.00', dataType: 'NUMBER', category: 'PRICING', isPublic: true },
    { key: 'fragile_surcharge', value: '12.00', dataType: 'NUMBER', category: 'PRICING', isPublic: true },
    { key: 'tax_rate_percent', value: '8.5', dataType: 'NUMBER', category: 'PRICING', isPublic: true },
    { key: 'enable_email_notifications', value: 'true', dataType: 'BOOLEAN', category: 'NOTIFICATIONS', isPublic: false },
    { key: 'enable_sms_notifications', value: 'true', dataType: 'BOOLEAN', category: 'NOTIFICATIONS', isPublic: false },
    { key: 'maintenance_mode', value: 'false', dataType: 'BOOLEAN', category: 'SYSTEM', isPublic: true },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, category: s.category as any, dataType: s.dataType as any, isPublic: s.isPublic },
      create: s as any,
    });
  }

  // 3. PARCEL CATEGORIES
  console.log('Seeding Parcel Categories...');
  const categories = [
    { code: 'STANDARD', name: 'Standard Freight', description: 'Regular ground logistics parcels (1-3 business days)', baseRateMultiplier: 1.0, handlingSurcharge: 0.0, maxAllowedWeightKg: 70.0, requiresSpecialHandling: false },
    { code: 'EXPRESS', name: 'Priority Express Next-Day', description: 'Urgent air/express transit with guaranteed next-morning delivery', baseRateMultiplier: 1.75, handlingSurcharge: 18.0, maxAllowedWeightKg: 30.0, requiresSpecialHandling: false },
    { code: 'FRAGILE', name: 'Fragile & Sensitive Cargo', description: 'Glass, electronics, ceramics with air-cushioned transit & shock sensor', baseRateMultiplier: 1.35, handlingSurcharge: 12.0, maxAllowedWeightKg: 25.0, requiresSpecialHandling: true },
    { code: 'HEAVY_FREIGHT', name: 'Heavy Palletized Freight', description: 'Industrial machinery, crated equipment (>50kg)', baseRateMultiplier: 0.85, handlingSurcharge: 45.0, maxAllowedWeightKg: 1000.0, requiresSpecialHandling: true },
    { code: 'DOCUMENT', name: 'Secure Legal Document Pouch', description: 'Tamper-evident satchels for confidential legal & corporate papers', baseRateMultiplier: 0.9, handlingSurcharge: 4.0, maxAllowedWeightKg: 3.0, requiresSpecialHandling: false },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const c = await prisma.parcelCategory.upsert({
      where: { code: cat.code },
      update: cat as any,
      create: cat as any,
    });
    categoryMap.set(cat.code, c.id);
  }

  // 4. BRANCHES & HUBS
  console.log('Seeding Logistics Infrastructure (Branches, Hubs, Routes)...');
  const sfBranch = await prisma.branch.upsert({
    where: { code: 'BR-SFO-01' },
    update: {},
    create: {
      code: 'BR-SFO-01',
      name: 'San Francisco Metro Dispatch Center',
      branchType: 'METRO_SORTING_HUB',
      streetAddress: '742 Evergreen Terrace, Suite 500',
      city: 'San Francisco',
      stateProvince: 'CA',
      postalCode: '94107',
      countryCode: 'US',
      contactPhone: '+1 (415) 555-0199',
      contactEmail: 'sfo.dispatch@swiftroute.com',
      operatingHours: '24/7 Operations',
    },
  });

  const oakBranch = await prisma.branch.upsert({
    where: { code: 'BR-OAK-02' },
    update: {},
    create: {
      code: 'BR-OAK-02',
      name: 'East Bay Regional Distribution Depot',
      branchType: 'REGIONAL_DISTRIBUTION_DEPOT',
      streetAddress: '12 Logistics Way, Bay Area Hub',
      city: 'Oakland',
      stateProvince: 'CA',
      postalCode: '94607',
      countryCode: 'US',
      contactPhone: '+1 (510) 555-0288',
      contactEmail: 'oak.depot@swiftroute.com',
      operatingHours: '05:00 - 23:00',
    },
  });

  const sfHub = await prisma.hub.upsert({
    where: { code: 'HUB-BAY-01' },
    update: {},
    create: {
      code: 'HUB-BAY-01',
      name: 'Central Bay Automated Sorting Facility',
      branchId: sfBranch.id,
      address: '742 Evergreen Freight Terminal Bay 3',
      city: 'San Francisco',
      stateProvince: 'CA',
      latitude: 37.7749,
      longitude: -122.4194,
      capacityVolumeCbm: 2500.0,
    },
  });

  // Route
  await prisma.route.upsert({
    where: { routeCode: 'RT-SFO-OAK-EXP' },
    update: {},
    create: {
      routeCode: 'RT-SFO-OAK-EXP',
      name: 'Trans-Bay Express Corridor',
      originBranchId: sfBranch.id,
      destinationBranchId: oakBranch.id,
      originHubId: sfHub.id,
      standardDurationMinutes: 45,
      distanceKm: 18.5,
      estimatedFuelCost: 12.50,
      tollCost: 7.00,
    },
  });

  // 5. USERS (ADMIN, COURIERS, CUSTOMERS)
  console.log('Seeding Users with Bcrypt Hashes...');
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);
  const agentPasswordHash = bcrypt.hashSync('agent123', salt);
  const customerPasswordHash = bcrypt.hashSync('customer123', salt);

  // Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@swiftroute.com' },
    update: { fullName: 'Arthur Pendelton', passwordHash: adminPasswordHash },
    create: {
      email: 'admin@swiftroute.com',
      passwordHash: adminPasswordHash,
      fullName: 'Arthur Pendelton',
      phone: '+1 (555) 019-2831',
      address: '742 Evergreen Terrace, Suite 500, Metro City',
      status: 'ACTIVE',
      roleId: roleMap.get('ADMIN')!,
      isEmailVerified: true,
    },
  });

  // Courier Agent 1 (Marcus)
  const agent1User = await prisma.user.upsert({
    where: { email: 'agent.marcus@swiftroute.com' },
    update: { fullName: 'Marcus Vance', passwordHash: agentPasswordHash },
    create: {
      email: 'agent.marcus@swiftroute.com',
      passwordHash: agentPasswordHash,
      fullName: 'Marcus Vance',
      phone: '+1 (555) 234-5678',
      address: '12 Logistics Way, Bay Area Hub',
      status: 'ACTIVE',
      roleId: roleMap.get('COURIER_AGENT')!,
      isEmailVerified: true,
    },
  });

  const agent1 = await prisma.deliveryAgent.upsert({
    where: { userId: agent1User.id },
    update: {},
    create: {
      userId: agent1User.id,
      employeeCode: 'AGT-SF-101',
      assignedBranchId: sfBranch.id,
      assignedHubId: sfHub.id,
      licenseNumber: 'DL-CA-928104',
      rating: 4.95,
      totalDeliveriesCount: 428,
      successfulDeliveriesCount: 421,
      failedDeliveriesCount: 7,
      employmentStatus: 'ACTIVE',
    },
  });

  // Agent Vehicle
  await prisma.agentVehicle.upsert({
    where: { licensePlate: '7XTR892' },
    update: {},
    create: {
      agentId: agent1.id,
      vehicleType: 'CARGO_VAN',
      make: 'Mercedes-Benz',
      model: 'Sprinter 2500 High Roof',
      year: 2024,
      licensePlate: '7XTR892',
      maxWeightCapacityKg: 1500.0,
      maxVolumeCapacityCbm: 14.0,
    },
  });

  // Customer 1 (David Chen)
  const customer1User = await prisma.user.upsert({
    where: { email: 'customer@swiftroute.com' },
    update: { fullName: 'David Chen', passwordHash: customerPasswordHash },
    create: {
      email: 'customer@swiftroute.com',
      passwordHash: customerPasswordHash,
      fullName: 'David Chen',
      phone: '+1 (555) 345-6789',
      address: '582 Market St, Floor 14, San Francisco, CA 94104',
      status: 'ACTIVE',
      roleId: roleMap.get('CUSTOMER')!,
      isEmailVerified: true,
    },
  });

  const customer1 = await prisma.customer.upsert({
    where: { userId: customer1User.id },
    update: {},
    create: {
      userId: customer1User.id,
      accountType: 'COMMERCIAL_SME',
      companyName: 'Apex Precision Engineering LLC',
      taxId: 'US-EIN-94-3829104',
      billingEmail: 'billing@apexprecision.com',
      billingPhone: '+1 (555) 345-6780',
      creditLimit: 25000.0,
      paymentTermsDays: 30,
    },
  });

  // Customer Address Book
  await prisma.customerAddress.create({
    data: {
      customerId: customer1.id,
      label: 'Main Corporate HQ - Dock 2',
      contactPerson: 'David Chen',
      phoneNumber: '+1 (555) 345-6789',
      streetAddress1: '582 Market St, Floor 14',
      city: 'San Francisco',
      stateProvince: 'CA',
      postalCode: '94104',
      countryCode: 'US',
      isDefaultPickup: true,
      isDefaultDelivery: true,
      deliveryNotes: 'Freight elevator key card with building security in lobby.',
    },
  });

  // 6. SAMPLE PARCEL & TRACKING JOURNEY
  console.log('Seeding Sample Consignment & Tracking Journey...');
  const sampleParcel = await prisma.parcel.upsert({
    where: { trackingNumber: 'SWIFT-2026-X82A9K' },
    update: {},
    create: {
      trackingNumber: 'SWIFT-2026-X82A9K',
      waybillBarcode: 'WB-9481029481',
      senderId: customer1User.id,
      customerId: customer1.id,
      categoryId: categoryMap.get('EXPRESS')!,
      parcelType: 'EXPRESS',
      status: 'OUT_FOR_DELIVERY',
      senderName: 'Apex Precision Engineering',
      senderPhone: '+1 (555) 345-6789',
      senderEmail: 'customer@swiftroute.com',
      pickupAddress: '582 Market St, Floor 14, San Francisco, CA 94104',
      recipientName: 'Dr. Rebecca Vance',
      recipientPhone: '+1 (555) 456-7890',
      recipientEmail: 'rebecca.vance@stanford.edu',
      deliveryAddress: '450 Jane Stanford Way, Building 160, Stanford, CA 94305',
      weightKg: 4.8,
      dimensionsText: '35x25x18 cm',
      declaredValue: 2400.0,
      isInsured: true,
      insuranceAmount: 2400.0,
      baseShippingCost: 26.40,
      surchargeAmount: 18.00,
      taxAmount: 3.77,
      totalShippingCost: 48.17,
      paymentStatus: 'PAID',
      paymentTerms: 'PREPAID',
      assignedAgentId: agent1.id,
      assignedAt: new Date(Date.now() - 4 * 3600000),
      originBranchId: sfBranch.id,
      currentHubId: sfHub.id,
      estimatedDeliveryDate: new Date(Date.now() + 6 * 3600000),
      specialInstructions: 'High precision calibration sensors. Handle with care. Temperature sensitive.',
      fragileHandling: true,
      signatureRequired: true,
    },
  });

  // Tracking Checkpoints
  await prisma.trackingHistory.createMany({
    data: [
      {
        parcelId: sampleParcel.id,
        trackingNumber: sampleParcel.trackingNumber,
        status: 'PENDING',
        subStatus: 'BOOKING_CONFIRMED',
        facilityName: 'Customer Portal Booking',
        locationText: 'San Francisco, CA',
        description: 'Consignment booking created by shipper. Waybill barcode WB-9481029481 generated.',
        checkpointTimestamp: new Date(Date.now() - 12 * 3600000),
      },
      {
        parcelId: sampleParcel.id,
        trackingNumber: sampleParcel.trackingNumber,
        status: 'PICKED_UP',
        subStatus: 'COURIER_PICKUP_SCAN',
        facilityName: 'Market Street Commercial Center',
        locationText: 'San Francisco, CA',
        description: 'Package picked up from shipper dock by Courier Marcus Vance.',
        agentId: agent1.id,
        checkpointTimestamp: new Date(Date.now() - 8 * 3600000),
      },
      {
        parcelId: sampleParcel.id,
        trackingNumber: sampleParcel.trackingNumber,
        status: 'ARRIVED_AT_HUB',
        subStatus: 'HUB_SORTING_PASSED',
        facilityName: 'Central Bay Automated Sorting Facility',
        locationText: 'San Francisco, CA',
        hubId: sfHub.id,
        description: 'Inbound weight verified (4.8 kg). Dimensions verified. Package sorted to Bay Area South corridor.',
        checkpointTimestamp: new Date(Date.now() - 5 * 3600000),
      },
      {
        parcelId: sampleParcel.id,
        trackingNumber: sampleParcel.trackingNumber,
        status: 'OUT_FOR_DELIVERY',
        subStatus: 'LOADED_ON_COURIER_VAN',
        facilityName: 'San Francisco Metro Dispatch Center',
        locationText: 'San Francisco, CA',
        agentId: agent1.id,
        description: 'Loaded onto courier van (License: 7XTR892). Courier en route to consignee destination.',
        checkpointTimestamp: new Date(Date.now() - 1 * 3600000),
      },
    ],
  });

  // Invoice & Payment
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: `INV-${sampleParcel.trackingNumber}`,
      customerId: customer1.id,
      parcelId: sampleParcel.id,
      billedUserId: customer1User.id,
      subtotalAmount: 26.40,
      surchargeAmount: 18.00,
      taxAmount: 3.77,
      totalAmount: 48.17,
      amountPaid: 48.17,
      balanceDue: 0.00,
      status: 'PAID',
      issuedDate: new Date(Date.now() - 12 * 3600000),
      dueDate: new Date(Date.now() + 18 * 86400000),
      paidAt: new Date(Date.now() - 12 * 3600000),
      lineItems: {
        create: [
          { description: 'Express Next-Day Air Freight Base Rate (4.8 kg)', itemType: 'BASE_SHIPPING', unitPrice: 26.40, quantity: 1, totalPrice: 26.40 },
          { description: 'Priority Air Transit Surcharge', itemType: 'EXPRESS_SURCHARGE', unitPrice: 18.00, quantity: 1, totalPrice: 18.00 },
          { description: 'Commercial Logistics Sales Tax (8.5%)', itemType: 'TAX', unitPrice: 3.77, quantity: 1, totalPrice: 3.77 },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      paymentReference: `PAY-${sampleParcel.trackingNumber}`,
      parcelId: sampleParcel.id,
      invoiceId: invoice.id,
      payerUserId: customer1User.id,
      amount: 48.17,
      paymentMethod: 'CREDIT_CARD',
      transactionId: `TXN-STRIPE-${Date.now()}`,
      status: 'COMPLETED',
      processedAt: new Date(Date.now() - 12 * 3600000),
    },
  });

  console.log('✅ SwiftRoute Enterprise Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
