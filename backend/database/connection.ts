import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { 
  User, 
  Parcel, 
  TrackingCheckpoint, 
  Payment, 
  DeliveryProof, 
  ActivityLog, 
  SystemSettings 
} from '../../shared/types';
import { logger } from '../utils/logger';

// Import Order Hub types
import type { ExternalOrder, ExternalOrderTracking, ReturnRequest, DeliveryPreference, CustomerNotification } from '../../shared/types';

// Interface representing the existing database schema and tables exactly as configured
export interface DatabaseTables {
  users: User & { password_hash: string; google_id?: string };
  parcels: Parcel;
  parcel_tracking: TrackingCheckpoint;
  payments: Payment;
  delivery_proofs: DeliveryProof;
  activity_logs: ActivityLog;
  system_settings: SystemSettings;
  external_orders: ExternalOrder;
  external_order_tracking: ExternalOrderTracking;
  return_requests: ReturnRequest;
  delivery_preferences: DeliveryPreference;
  customer_notifications: CustomerNotification;
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'backend/database/datastore.json');

// Default initial state conforming to the existing database tables
const getInitialDatabaseState = () => {
  const salt = bcrypt.genSaltSync(10);
  const defaultAdminHash = bcrypt.hashSync('admin123', salt);
  const defaultAgentHash = bcrypt.hashSync('agent123', salt);
  const defaultCustomerHash = bcrypt.hashSync('customer123', salt);

  const initialUsers: (User & { password_hash: string })[] = [
    {
      id: 'usr_admin_01',
      full_name: 'Arthur Pendelton',
      email: 'admin@swiftroute.com',
      password_hash: defaultAdminHash,
      role: 'admin',
      phone: '+1 (555) 019-2831',
      address: '742 Evergreen Terrace, Suite 500, Metro City',
      status: 'active',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'usr_agent_01',
      full_name: 'Marcus Vance',
      email: 'agent.marcus@swiftroute.com',
      password_hash: defaultAgentHash,
      role: 'agent',
      phone: '+1 (555) 234-5678',
      address: '12 Logistics Way, Bay Area Hub',
      status: 'active',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'usr_agent_02',
      full_name: 'Elena Rostova',
      email: 'agent.elena@swiftroute.com',
      password_hash: defaultAgentHash,
      role: 'agent',
      phone: '+1 (555) 876-5432',
      address: '44 Harbor Blvd, Logistics District',
      status: 'active',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'usr_cust_01',
      full_name: 'David Chen',
      email: 'customer@swiftroute.com',
      password_hash: defaultCustomerHash,
      role: 'customer',
      phone: '+1 (555) 345-6789',
      address: '582 Market St, Floor 14, San Francisco, CA 94104',
      status: 'active',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'usr_cust_02',
      full_name: 'Sophia Martinez',
      email: 'sophia.m@gmail.com',
      password_hash: defaultCustomerHash,
      role: 'customer',
      phone: '+1 (555) 901-2345',
      address: '1080 Folsom St, Apt 3B, San Francisco, CA 94103',
      status: 'active',
      created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    }
  ];

  const initialParcels: Parcel[] = [
    {
      id: 'pcl_101',
      tracking_number: 'SR-2026CA-892104',
      sender_id: 'usr_cust_01',
      sender_name: 'David Chen',
      recipient_name: 'Aria Montgomery',
      recipient_phone: '+1 (555) 443-8821',
      recipient_email: 'aria.m@partner.org',
      pickup_address: '582 Market St, Floor 14, San Francisco, CA 94104',
      delivery_address: '224 Rosewood Lane, Palo Alto, CA 94301',
      weight_kg: 3.5,
      dimensions: '30x20x15 cm',
      parcel_type: 'express',
      status: 'out_for_delivery',
      assigned_agent_id: 'usr_agent_01',
      assigned_agent_name: 'Marcus Vance',
      shipping_cost: 44.75,
      payment_status: 'paid',
      estimated_delivery: new Date(Date.now() + 4 * 3600000).toISOString(),
      special_instructions: 'Handle with care. Leave with front desk if recipient unavailable.',
      created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'pcl_102',
      tracking_number: 'SR-2026NY-419082',
      sender_id: 'usr_cust_01',
      sender_name: 'David Chen',
      recipient_name: 'Liam Neeson',
      recipient_phone: '+1 (555) 992-1049',
      recipient_email: 'liam.n@enterprise.com',
      pickup_address: '582 Market St, Floor 14, San Francisco, CA 94104',
      delivery_address: '77 5th Ave, Floor 12, New York, NY 10003',
      weight_kg: 1.2,
      dimensions: '25x15x5 cm',
      parcel_type: 'document',
      status: 'in_transit',
      assigned_agent_id: 'usr_agent_02',
      assigned_agent_name: 'Elena Rostova',
      shipping_cost: 25.00,
      payment_status: 'paid',
      estimated_delivery: new Date(Date.now() + 24 * 3600000).toISOString(),
      special_instructions: 'Legal documents - signature required upon delivery.',
      created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    },
    {
      id: 'pcl_103',
      tracking_number: 'SR-2026TX-654321',
      sender_id: 'usr_cust_02',
      sender_name: 'Sophia Martinez',
      recipient_name: 'Dr. Evelyn Reed',
      recipient_phone: '+1 (555) 678-1234',
      recipient_email: 'evelyn.reed@biotech.org',
      pickup_address: '1080 Folsom St, Apt 3B, San Francisco, CA 94103',
      delivery_address: '1200 Technology Forest Dr, The Woodlands, TX 77381',
      weight_kg: 5.8,
      dimensions: '40x30x25 cm',
      parcel_type: 'fragile',
      status: 'delivered',
      assigned_agent_id: 'usr_agent_01',
      assigned_agent_name: 'Marcus Vance',
      shipping_cost: 68.20,
      payment_status: 'paid',
      estimated_delivery: new Date(Date.now() - 6 * 3600000).toISOString(),
      special_instructions: 'Keep temperature stable, fragile laboratory items.',
      created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    {
      id: 'pcl_104',
      tracking_number: 'SR-2026WA-118833',
      sender_id: 'usr_cust_02',
      sender_name: 'Sophia Martinez',
      recipient_name: 'Ethan Cole',
      recipient_phone: '+1 (555) 789-0123',
      recipient_email: 'ethan.cole@seattleart.com',
      pickup_address: '1080 Folsom St, Apt 3B, San Francisco, CA 94103',
      delivery_address: '1901 1st Ave, Seattle, WA 98101',
      weight_kg: 8.4,
      dimensions: '50x45x30 cm',
      parcel_type: 'standard',
      status: 'pending',
      assigned_agent_id: null,
      assigned_agent_name: null,
      shipping_cost: 71.40,
      payment_status: 'unpaid',
      estimated_delivery: new Date(Date.now() + 48 * 3600000).toISOString(),
      special_instructions: 'Package ready at front porch.',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    }
  ];

  const initialTracking: TrackingCheckpoint[] = [
    {
      id: 'trk_01',
      parcel_id: 'pcl_101',
      tracking_number: 'SR-2026CA-892104',
      status: 'pending',
      location: 'San Francisco Central Hub',
      description: 'Shipment order booked and registered in system.',
      timestamp: new Date(Date.now() - 18 * 3600000).toISOString(),
    },
    {
      id: 'trk_02',
      parcel_id: 'pcl_101',
      tracking_number: 'SR-2026CA-892104',
      status: 'picked_up',
      location: 'San Francisco Central Hub',
      description: 'Courier agent Marcus Vance accepted and picked up parcel.',
      timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
    {
      id: 'trk_03',
      parcel_id: 'pcl_101',
      tracking_number: 'SR-2026CA-892104',
      status: 'in_transit',
      location: 'Bay Area Distribution Facility',
      description: 'Sorted and departing Bay Area Regional Distribution Facility.',
      timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    {
      id: 'trk_04',
      parcel_id: 'pcl_101',
      tracking_number: 'SR-2026CA-892104',
      status: 'out_for_delivery',
      location: 'Palo Alto Delivery Hub',
      description: 'Loaded onto courier vehicle. Scheduled for delivery today.',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'trk_10',
      parcel_id: 'pcl_102',
      tracking_number: 'SR-2026NY-419082',
      status: 'pending',
      location: 'San Francisco Central Hub',
      description: 'Shipment created and electronic customs declaration logged.',
      timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
    },
    {
      id: 'trk_11',
      parcel_id: 'pcl_102',
      tracking_number: 'SR-2026NY-419082',
      status: 'in_transit',
      location: 'JFK Cargo Logistics Gateway, NY',
      description: 'In flight transit to East Coast sorting terminal.',
      timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
    },
    {
      id: 'trk_20',
      parcel_id: 'pcl_103',
      tracking_number: 'SR-2026TX-654321',
      status: 'delivered',
      location: 'The Woodlands, TX',
      description: 'Delivered directly to recipient. Signed by Dr. Evelyn Reed.',
      timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
    }
  ];

  const initialPayments: Payment[] = [
    {
      id: 'pay_01',
      parcel_id: 'pcl_101',
      user_id: 'usr_cust_01',
      amount: 44.75,
      payment_method: 'card',
      transaction_id: 'TXN-90218-VISA',
      status: 'completed',
      created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
    },
    {
      id: 'pay_02',
      parcel_id: 'pcl_102',
      user_id: 'usr_cust_01',
      amount: 25.00,
      payment_method: 'wallet',
      transaction_id: 'TXN-90244-WLT',
      status: 'completed',
      created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
    },
    {
      id: 'pay_03',
      parcel_id: 'pcl_103',
      user_id: 'usr_cust_02',
      amount: 68.20,
      payment_method: 'card',
      transaction_id: 'TXN-88124-MC',
      status: 'completed',
      created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    }
  ];

  const initialProofs: DeliveryProof[] = [
    {
      id: 'prf_01',
      parcel_id: 'pcl_103',
      agent_id: 'usr_agent_01',
      recipient_name: 'Dr. Evelyn Reed',
      signature_url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10,40 Q50,10 90,40 T170,25" fill="none" stroke="%231e293b" stroke-width="3"/></svg>',
      photo_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80',
      notes: 'Delivered to reception desk. Verified recipient ID and laboratory badge.',
      delivered_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    }
  ];

  const initialLogs: ActivityLog[] = [
    {
      id: 'log_01',
      user_id: 'usr_admin_01',
      user_name: 'Arthur Pendelton',
      user_role: 'admin',
      action: 'SYSTEM_BOOT',
      entity_type: 'system',
      details: 'Enterprise Parcel Management core database connected successfully.',
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: 'log_02',
      user_id: 'usr_agent_01',
      user_name: 'Marcus Vance',
      user_role: 'agent',
      action: 'STATUS_UPDATE',
      entity_type: 'parcel',
      entity_id: 'pcl_101',
      details: 'Updated status to out_for_delivery for parcel SR-2026CA-892104',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    }
  ];

  const initialSettings: SystemSettings = {
    company_name: 'SwiftRoute Global Logistics Inc.',
    support_email: 'dispatch@swiftroute.com',
    support_phone: '+1 (800) 555-SWIFT',
    currency: 'USD',
    base_rate_per_kg: 8.5,
    express_surcharge: 15.0,
    fragile_surcharge: 7.5,
    tax_rate_percent: 8.25,
    enable_email_notifications: true,
    enable_sms_notifications: true,
    maintenance_mode: false,
  };

  return {
    users: initialUsers,
    parcels: initialParcels,
    parcel_tracking: initialTracking,
    payments: initialPayments,
    delivery_proofs: initialProofs,
    activity_logs: initialLogs,
    system_settings: initialSettings,
    external_orders: [],
    external_order_tracking: [],
    return_requests: [],
    delivery_preferences: [],
    customer_notifications: [],
  };
};

// Database Connection Manager: maintains primary source of truth without altering existing schema
class DatabaseConnection {
  private data: ReturnType<typeof getInitialDatabaseState>;
  private isConnected: boolean = false;

  constructor() {
    this.data = getInitialDatabaseState();
    this.loadFromDisk();
  }

  public connect(): void {
    if (!this.isConnected) {
      this.isConnected = true;
      logger.info('Connected to existing Enterprise Database tables.');
    }
  }

  private loadFromDisk(): void {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.parcels) {
          this.data = parsed;
        }
      } else {
        this.saveToDisk();
      }

      // Synchronize Delivery Agent Employment fields if not present on seeded accounts
      if (this.data.users) {
        this.data.users.forEach((u: any) => {
          if (u.role === 'agent') {
            if (!u.employee_id) {
              u.employee_id = u.id === 'usr_agent_01' ? 'EMP-20481' : (u.id === 'usr_agent_02' ? 'EMP-20482' : `EMP-${u.id.slice(-5).toUpperCase()}`);
            }
            if (!u.company_email) {
              u.company_email = u.email;
            }
            if (!u.company_name) {
              u.company_name = 'SwiftRoute Global Logistics';
            }
            if (!u.vehicle_number) {
              u.vehicle_number = u.id === 'usr_agent_01' ? 'SR-VAN-01' : (u.id === 'usr_agent_02' ? 'SR-VAN-02' : 'SR-VAN-03');
            }
            if (!u.verification_status) {
              u.verification_status = 'approved';
            }
          }
        });
      }

      // Secure administrator configuration via environment variables
      const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : null;
      const adminPassword = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.trim() : null;

      if (adminEmail && adminPassword) {
        const users = this.data.users || [];
        const existingAdmin = users.find((u: any) => u.role === 'admin' || u.email.toLowerCase() === adminEmail);
        const salt = bcrypt.genSaltSync(10);
        const adminHash = bcrypt.hashSync(adminPassword, salt);

        if (existingAdmin) {
          existingAdmin.email = adminEmail;
          existingAdmin.password_hash = adminHash;
          existingAdmin.role = 'admin';
          existingAdmin.updated_at = new Date().toISOString();
          logger.info(`[Security] Existing administrator account updated securely from environment: ${adminEmail}`);
        } else {
          const newAdmin: any = {
            id: `usr_admin_${Date.now()}`,
            full_name: 'System Administrator',
            email: adminEmail,
            password_hash: adminHash,
            role: 'admin',
            phone: '+1 (555) 019-2831',
            address: 'SwiftRoute Global Operations Headquarters',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          users.unshift(newAdmin);
          logger.info(`[Security] Dedicated administrator account provisioned securely from environment: ${adminEmail}`);
        }
        this.saveToDisk();
      }

      this.isConnected = true;
    } catch (err) {
      logger.warn('Failed to load database from disk, running with in-memory database', err);
      this.isConnected = true;
    }
  }

  private saveToDisk(): void {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      logger.error('Failed to write to database datastore', err);
    }
  }

  // Table queries
  public getTable<K extends keyof ReturnType<typeof getInitialDatabaseState>>(tableName: K): ReturnType<typeof getInitialDatabaseState>[K] {
    return this.data[tableName];
  }

  public insert<K extends 'users' | 'parcels' | 'parcel_tracking' | 'payments' | 'delivery_proofs' | 'activity_logs' | 'external_orders' | 'external_order_tracking' | 'return_requests' | 'delivery_preferences' | 'customer_notifications'>(
    tableName: K,
    item: any
  ): any {
    (this.data[tableName] as any[]).push(item);
    this.saveToDisk();
    return item;
  }

  public update<K extends 'users' | 'parcels' | 'payments' | 'system_settings' | 'external_orders' | 'return_requests' | 'delivery_preferences' | 'customer_notifications'>(
    tableName: K,
    idOrFilter: string | ((item: any) => boolean),
    updates: any
  ): any {
    if (tableName === 'system_settings') {
      this.data.system_settings = { ...this.data.system_settings, ...updates };
      this.saveToDisk();
      return this.data.system_settings;
    }

    const table = this.data[tableName] as any[];
    const index = typeof idOrFilter === 'string'
      ? table.findIndex((row: any) => row.id === idOrFilter)
      : table.findIndex(idOrFilter);

    if (index === -1) return null;
    table[index] = { ...table[index], ...updates, updated_at: new Date().toISOString() };
    this.saveToDisk();
    return table[index];
  }

  public delete<K extends 'users' | 'parcels' | 'payments' | 'external_orders' | 'return_requests' | 'delivery_preferences' | 'customer_notifications'>(
    tableName: K,
    id: string
  ): boolean {
    const table = this.data[tableName] as any[];
    const index = table.findIndex((row: any) => row.id === id);
    if (index === -1) return false;
    table.splice(index, 1);
    this.saveToDisk();
    return true;
  }

  public resetToDefault(): void {
    this.data = getInitialDatabaseState();
    this.saveToDisk();
  }
}

export const db = new DatabaseConnection();
db.connect();
