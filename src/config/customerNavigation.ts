import { 
  Package, 
  PlusCircle, 
  CreditCard, 
  User, 
  Sparkles,
  RotateCcw,
  Bell,
  Settings,
  BarChart3,
  FileText,
  LucideIcon
} from 'lucide-react';

export interface CustomerNavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
}

export const customerNavigationItems: Omit<CustomerNavItem, 'badge'>[] = [
  {
    id: 'order-hub',
    label: 'Universal Order Hub',
    path: '/customer/order-hub',
    icon: Sparkles,
  },
  {
    id: 'parcels',
    label: 'My SwiftRoute Parcels',
    path: '/customer/parcels',
    icon: Package,
  },
  {
    id: 'book',
    label: 'Book Shipment',
    path: '/customer/book-shipment',
    icon: PlusCircle,
  },
  {
    id: 'returns',
    label: 'Returns & Pickups',
    path: '/customer/returns',
    icon: RotateCcw,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    path: '/customer/notifications',
    icon: Bell,
  },
  {
    id: 'payments',
    label: 'Payments & Invoices',
    path: '/customer/payments',
    icon: CreditCard,
  },
  {
    id: 'preferences',
    label: 'Delivery Preferences',
    path: '/customer/delivery-preferences',
    icon: Settings,
  },
  {
    id: 'analytics',
    label: 'My Analytics',
    path: '/customer/analytics',
    icon: BarChart3,
  },
  {
    id: 'profile',
    label: 'Profile Settings',
    path: '/customer/profile',
    icon: User,
  },
];
