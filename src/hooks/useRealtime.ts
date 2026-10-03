/**
 * React Hook for Real-Time Updates via SSE
 * Automatically connects/disconnects and provides event listeners
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: string;
}

export type RealtimeEventHandler = (event: RealtimeEvent) => void;

interface UseRealtimeOptions {
  onNotification?: RealtimeEventHandler;
  onOrderStatusUpdate?: RealtimeEventHandler;
  onParcelStatusUpdate?: RealtimeEventHandler;
  onReturnStatusUpdate?: RealtimeEventHandler;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Event) => void;
  autoConnect?: boolean;
}

export const useRealtime = (options: UseRealtimeOptions = {}) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const {
    onNotification,
    onOrderStatusUpdate,
    onParcelStatusUpdate,
    onReturnStatusUpdate,
    onConnected,
    onDisconnected,
    onError,
    autoConnect = true,
  } = options;

  const connect = useCallback(() => {
    // Only customers can connect to realtime updates
    if (!user || user.role !== 'customer') {
      console.warn('[Realtime] Only customers can connect to real-time updates');
      return;
    }

    // Already connected
    if (eventSourceRef.current) {
      console.warn('[Realtime] Already connected');
      return;
    }

    const token = localStorage.getItem('swiftroute_token');
    if (!token) {
      console.warn('[Realtime] No auth token found');
      return;
    }

    try {
      // Create EventSource with auth token
      const eventSource = new EventSource(`/api/realtime/stream`, {
        withCredentials: true,
      });

      // Connected
      eventSource.addEventListener('connected', (e) => {
        console.log('[Realtime] Connected:', e.data);
        setIsConnected(true);
        onConnected?.();
      });

      // Ping (keep-alive)
      eventSource.addEventListener('ping', () => {
        // Silent heartbeat
      });

      // Notification event
      eventSource.addEventListener('notification', (e) => {
        try {
          const data = JSON.parse(e.data);
          const event: RealtimeEvent = {
            type: 'notification',
            data: data.notification,
            timestamp: data.timestamp,
          };
          setLastEvent(event);
          onNotification?.(event);
        } catch (err) {
          console.error('[Realtime] Failed to parse notification:', err);
        }
      });

      // Order status update
      eventSource.addEventListener('order_status_update', (e) => {
        try {
          const data = JSON.parse(e.data);
          const event: RealtimeEvent = {
            type: 'order_status_update',
            data: { order: data.order, tracking: data.tracking },
            timestamp: data.timestamp,
          };
          setLastEvent(event);
          onOrderStatusUpdate?.(event);
        } catch (err) {
          console.error('[Realtime] Failed to parse order status update:', err);
        }
      });

      // Parcel status update
      eventSource.addEventListener('parcel_status_update', (e) => {
        try {
          const data = JSON.parse(e.data);
          const event: RealtimeEvent = {
            type: 'parcel_status_update',
            data: { parcel: data.parcel, checkpoint: data.checkpoint },
            timestamp: data.timestamp,
          };
          setLastEvent(event);
          onParcelStatusUpdate?.(event);
        } catch (err) {
          console.error('[Realtime] Failed to parse parcel status update:', err);
        }
      });

      // Return status update
      eventSource.addEventListener('return_status_update', (e) => {
        try {
          const data = JSON.parse(e.data);
          const event: RealtimeEvent = {
            type: 'return_status_update',
            data: data.returnRequest,
            timestamp: data.timestamp,
          };
          setLastEvent(event);
          onReturnStatusUpdate?.(event);
        } catch (err) {
          console.error('[Realtime] Failed to parse return status update:', err);
        }
      });

      // Error handling
      eventSource.onerror = (error) => {
        console.error('[Realtime] Connection error:', error);
        setIsConnected(false);
        onError?.(error);
        disconnect();
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('[Realtime] Failed to establish connection:', error);
    }
  }, [user, onNotification, onOrderStatusUpdate, onParcelStatusUpdate, onReturnStatusUpdate, onConnected, onError]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      onDisconnected?.();
      console.log('[Realtime] Disconnected');
    }
  }, [onDisconnected]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    // Temporarily disable auto-connect to prevent errors
    // TODO: Fix authentication for SSE endpoints
    if (autoConnect && user && user.role === 'customer' && false) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, user, connect, disconnect]);

  return {
    isConnected,
    lastEvent,
    connect,
    disconnect,
  };
};
