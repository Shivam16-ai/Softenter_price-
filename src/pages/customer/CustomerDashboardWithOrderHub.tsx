import React, { useState } from 'react';
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
} from 'lucide-react';
import { DashboardLayout, NavItem } from '../../components/common/DashboardLayout';
import { UniversalOrderHub } from './UniversalOrderHub';
import { ReturnsManagement } from './ReturnsManagement';
import { NotificationCenter } from './NotificationCenter';
import { CustomerAnalytics } from './CustomerAnalytics';
import { DeliveryPreferences } from './DeliveryPreferences';
import { CustomerDashboard } from './CustomerDashboard';

export const CustomerDashboardWithOrderHub: React.FC = () => {
  const [activeView, setActiveView] = useState<'order-hub' | 'returns' | 'notifications' | 'analytics' | 'preferences' | 'my-parcels' | 'book' | 'payments' | 'profile'>('order-hub');

  // Define navItems FIRST - before any early returns that reference it
  const navItems: NavItem[] = [
    { id: 'order-hub', label: 'Universal Order Hub', icon: Sparkles, badge: 0 },
    { id: 'my-parcels', label: 'My SwiftRoute Parcels', icon: Package },
    { id: 'book', label: 'Book Shipment', icon: PlusCircle },
    { id: 'returns', label: 'Returns & Pickups', icon: RotateCcw },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: 0 },
    { id: 'payments', label: 'Payments & Invoices', icon: CreditCard },
    { id: 'preferences', label: 'Delivery Preferences', icon: Settings },
    { id: 'analytics', label: 'My Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile Settings', icon: User },
  ];

  const handleNavigation = (id: string) => {
    if (id === 'my-parcels') {
      setActiveView('my-parcels');
    } else if (id === 'book') {
      setActiveView('book');
    } else if (id === 'returns') {
      setActiveView('returns');
    } else if (id === 'notifications') {
      setActiveView('notifications');
    } else if (id === 'payments') {
      setActiveView('payments');
    } else if (id === 'preferences') {
      setActiveView('preferences');
    } else if (id === 'analytics') {
      setActiveView('analytics');
    } else if (id === 'profile') {
      setActiveView('profile');
    } else if (id === 'order-hub') {
      setActiveView('order-hub');
    } else {
      console.log('Unknown nav selected:', id);
    }
  };

  // My SwiftRoute Parcels (My Parcels tab from CustomerDashboard)
  if (activeView === 'my-parcels') {
    return <CustomerDashboard initialTab="parcels" />;
  }

  // Book Shipment - Extract from CustomerDashboard as separate view
  if (activeView === 'book') {
    return <CustomerDashboard initialTab="book" />;
  }

  // Payments & Invoices
  if (activeView === 'payments') {
    return <CustomerDashboard initialTab="payments" />;
  }

  // Profile Settings
  if (activeView === 'profile') {
    return <CustomerDashboard initialTab="profile" />;
  }

  if (activeView === 'returns') {
    return (
      <DashboardLayout
        title="Returns & Reverse Logistics"
        subtitle="Manage product returns and pickup requests"
        roleBadgeText="Customer"
        roleBadgeColor="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
        navItems={navItems}
        activeNavId="returns"
        onSelectNav={(id) => handleNavigation(id)}
        breadcrumbs={[
          { label: 'Customer Portal' },
          { label: 'Returns & Pickups', active: true },
        ]}
      >
        <ReturnsManagement />
      </DashboardLayout>
    );
  }

  if (activeView === 'notifications') {
    return (
      <DashboardLayout
        title="Notification Center"
        subtitle="Stay updated with delivery notifications"
        roleBadgeText="Customer"
        roleBadgeColor="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
        navItems={navItems}
        activeNavId="notifications"
        onSelectNav={(id) => handleNavigation(id)}
        breadcrumbs={[
          { label: 'Customer Portal' },
          { label: 'Notifications', active: true },
        ]}
      >
        <NotificationCenter />
      </DashboardLayout>
    );
  }

  if (activeView === 'analytics') {
    return (
      <DashboardLayout
        title="My Analytics"
        subtitle="Track your delivery performance and spending insights"
        roleBadgeText="Customer"
        roleBadgeColor="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
        navItems={navItems}
        activeNavId="analytics"
        onSelectNav={(id) => handleNavigation(id)}
        breadcrumbs={[
          { label: 'Customer Portal' },
          { label: 'Analytics', active: true },
        ]}
      >
        <CustomerAnalytics />
      </DashboardLayout>
    );
  }

  if (activeView === 'preferences') {
    return (
      <DashboardLayout
        title="Delivery Preferences"
        subtitle="Customize your delivery experience and set smart rules"
        roleBadgeText="Customer"
        roleBadgeColor="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
        navItems={navItems}
        activeNavId="preferences"
        onSelectNav={(id) => handleNavigation(id)}
        breadcrumbs={[
          { label: 'Customer Portal' },
          { label: 'Delivery Preferences', active: true },
        ]}
      >
        <DeliveryPreferences />
      </DashboardLayout>
    );
  }

  const getBreadcrumbs = () => {
    return [
      { label: 'Customer Portal' },
      { label: 'Universal Order Hub', active: true },
    ];
  };

  return (
    <DashboardLayout
      title="Universal Order Hub"
      subtitle="Manage all your deliveries from multiple platforms in one intelligent dashboard"
      roleBadgeText="Customer"
      roleBadgeColor="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
      navItems={navItems}
      activeNavId="order-hub"
      onSelectNav={(id) => handleNavigation(id)}
      breadcrumbs={getBreadcrumbs()}
    >
      <UniversalOrderHub />
    </DashboardLayout>
  );
};
