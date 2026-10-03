/**
 * Real-Time Update Service
 * Manages server-sent events (SSE) for real-time status updates to customers
 */

import { Response } from 'express';

interface SSEConnection {
  customerId: string;
  response: Response;
  lastPing: number;
}

class RealtimeService {
  private connections: Map<string, SSEConnection[]> = new Map();
  private pingInterval: NodeJS.Timeout;

  constructor() {
    // Keep connections alive with periodic pings every 30 seconds
    this.pingInterval = setInterval(() => {
      this.pingAllConnections();
    }, 30000);
  }

  /**
   * Register a new SSE connection for a customer
   */
  addConnection(customerId: string, res: Response): void {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();

    const connection: SSEConnection = {
      customerId,
      response: res,
      lastPing: Date.now(),
    };

    // Add connection to customer's connection list
    if (!this.connections.has(customerId)) {
      this.connections.set(customerId, []);
    }
    this.connections.get(customerId)!.push(connection);

    // Send initial connection confirmation
    this.sendEvent(res, 'connected', { message: 'Real-time updates connected' });

    // Handle client disconnect
    res.on('close', () => {
      this.removeConnection(customerId, res);
    });

    console.log(`[Realtime] Customer ${customerId} connected. Total connections: ${this.getTotalConnections()}`);
  }

  /**
   * Remove a connection when client disconnects
   */
  private removeConnection(customerId: string, res: Response): void {
    const customerConnections = this.connections.get(customerId);
    if (customerConnections) {
      const filtered = customerConnections.filter((conn) => conn.response !== res);
      if (filtered.length > 0) {
        this.connections.set(customerId, filtered);
      } else {
        this.connections.delete(customerId);
      }
    }
    console.log(`[Realtime] Customer ${customerId} disconnected. Total connections: ${this.getTotalConnections()}`);
  }

  /**
   * Broadcast an event to a specific customer's connections
   */
  notifyCustomer(customerId: string, eventType: string, data: any): void {
    const customerConnections = this.connections.get(customerId);
    if (!customerConnections || customerConnections.length === 0) {
      console.log(`[Realtime] No active connections for customer ${customerId}`);
      return;
    }

    customerConnections.forEach((conn) => {
      try {
        this.sendEvent(conn.response, eventType, data);
      } catch (error) {
        console.error(`[Realtime] Failed to send event to customer ${customerId}:`, error);
      }
    });

    console.log(`[Realtime] Event '${eventType}' sent to ${customerConnections.length} connection(s) for customer ${customerId}`);
  }

  /**
   * Broadcast an event to all connected customers
   */
  broadcastToAll(eventType: string, data: any): void {
    this.connections.forEach((customerConnections, customerId) => {
      this.notifyCustomer(customerId, eventType, data);
    });
  }

  /**
   * Send SSE event to a specific response
   */
  private sendEvent(res: Response, eventType: string, data: any): void {
    const formattedData = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    res.write(formattedData);
  }

  /**
   * Ping all connections to keep them alive
   */
  private pingAllConnections(): void {
    const now = Date.now();
    this.connections.forEach((customerConnections, customerId) => {
      customerConnections.forEach((conn) => {
        try {
          this.sendEvent(conn.response, 'ping', { timestamp: now });
          conn.lastPing = now;
        } catch (error) {
          console.error(`[Realtime] Ping failed for customer ${customerId}:`, error);
          this.removeConnection(customerId, conn.response);
        }
      });
    });
  }

  /**
   * Get total number of active connections
   */
  getTotalConnections(): number {
    let total = 0;
    this.connections.forEach((conns) => {
      total += conns.length;
    });
    return total;
  }

  /**
   * Get number of connections for a specific customer
   */
  getCustomerConnections(customerId: string): number {
    return this.connections.get(customerId)?.length || 0;
  }

  /**
   * Cleanup on service shutdown
   */
  shutdown(): void {
    clearInterval(this.pingInterval);
    this.connections.forEach((customerConnections) => {
      customerConnections.forEach((conn) => {
        conn.response.end();
      });
    });
    this.connections.clear();
    console.log('[Realtime] Service shutdown complete');
  }
}

// Singleton instance
export const realtimeService = new RealtimeService();
