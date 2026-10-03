/**
 * Service Registry
 * 
 * Tracks which services are available and their URLs.
 * As services are migrated, they are registered here.
 */

interface ServiceEndpoint {
  name: string;
  url: string;
  enabled: boolean;
  routes: string[];
}

class ServiceRegistry {
  private services: Map<string, ServiceEndpoint> = new Map();

  constructor() {
    // Register monolith as the default service
    this.register({
      name: 'monolith',
      url: process.env.MONOLITH_URL || 'http://localhost:3000',
      enabled: true,
      routes: ['*'] // Handles all routes by default
    });

    // Register future services (disabled until migrated)
    this.register({
      name: 'auth-service',
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
      enabled: false, // Will be enabled in Phase 3
      routes: ['/api/auth/*']
    });

    this.register({
      name: 'notification-service',
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4002',
      enabled: false,
      routes: ['/api/notifications/*']
    });

    this.register({
      name: 'order-service',
      url: process.env.ORDER_SERVICE_URL || 'http://localhost:4003',
      enabled: false,
      routes: ['/api/orders/*', '/api/order-hub/*']
    });

    this.register({
      name: 'shipment-service',
      url: process.env.SHIPMENT_SERVICE_URL || 'http://localhost:4004',
      enabled: false,
      routes: ['/api/parcels/*', '/api/tracking/*']
    });

    this.register({
      name: 'delivery-service',
      url: process.env.DELIVERY_SERVICE_URL || 'http://localhost:4005',
      enabled: false,
      routes: ['/api/deliveries/*']
    });

    this.register({
      name: 'admin-service',
      url: process.env.ADMIN_SERVICE_URL || 'http://localhost:4006',
      enabled: false,
      routes: ['/api/admin/*']
    });
  }

  register(service: ServiceEndpoint): void {
    this.services.set(service.name, service);
  }

  getService(name: string): ServiceEndpoint | undefined {
    return this.services.get(name);
  }

  enableService(name: string): void {
    const service = this.services.get(name);
    if (service) {
      service.enabled = true;
    }
  }

  disableService(name: string): void {
    const service = this.services.get(name);
    if (service) {
      service.enabled = false;
    }
  }

  getHealthStatus(): any {
    const status: any = {};
    this.services.forEach((service, name) => {
      status[name] = {
        enabled: service.enabled,
        url: service.url,
        routes: service.routes
      };
    });
    return status;
  }

  getAllServices(): ServiceEndpoint[] {
    return Array.from(this.services.values());
  }
}

export const serviceRegistry = new ServiceRegistry();
