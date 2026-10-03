import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { CustomerLayout } from './layouts/CustomerLayout';
import { UniversalOrderHub } from './pages/customer/UniversalOrderHub';
import { MySwiftRouteParcels } from './pages/customer/MySwiftRouteParcels';
import { BookShipment } from './pages/customer/BookShipment';
import { ReturnsManagement } from './pages/customer/ReturnsManagement';
import { NotificationCenter } from './pages/customer/NotificationCenter';
import { PaymentsInvoices } from './pages/customer/PaymentsInvoices';
import { DeliveryPreferences } from './pages/customer/DeliveryPreferences';
import { CustomerAnalytics } from './pages/customer/CustomerAnalytics';
import { ProfileSettings } from './pages/customer/ProfileSettings';
import { AgentDashboard } from './pages/agent/AgentDashboard';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminDispatch } from './pages/admin/Dispatch';
import { AdminParcels } from './pages/admin/Parcels';
import { AdminFleetLive } from './pages/admin/FleetLive';
import { AdminExceptions } from './pages/admin/Exceptions';
import { AdminShippers } from './pages/admin/Shippers';
import { AdminCouriers } from './pages/admin/Couriers';
import { AdminCourierVerification } from './pages/admin/CourierVerification';
import { AdminSupport } from './pages/admin/Support';
import { AdminRevenue } from './pages/admin/Revenue';
import { AdminPayments } from './pages/admin/Payments';
import { AdminReports } from './pages/admin/Reports';
import { AdminNotifications } from './pages/admin/Notifications';
import { AdminAuditLogs } from './pages/admin/AuditLogs';
import { AdminSystemHealth } from './pages/admin/SystemHealth';
import { AdminConfig } from './pages/admin/Config';

// Component to handle OAuth callback and redirect to auth page
const OAuthCallbackHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('token') || params.has('error')) {
      navigate('/auth' + location.search, { replace: true });
    }
  }, [location, navigate]);

  return null;
};

// Protected route wrapper for authenticated users
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Initializing SwiftRoute Logistics Platform...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'agent') return <Navigate to="/agent" replace />;
    return <Navigate to="/customer/order-hub" replace />;
  }

  return <>{children}</>;
};

// Public route wrapper - redirects authenticated users to their respective portal
// EXCEPT when processing OAuth callback (token or error in URL)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Initializing SwiftRoute Logistics Platform...</p>
        </div>
      </div>
    );
  }

  // Check if we're processing an OAuth callback (token or error in URL)
  const urlParams = new URLSearchParams(location.search);
  const hasOAuthCallback = urlParams.has('token') || urlParams.has('error');

  // Don't redirect if we're processing OAuth callback - let the AuthPage handle it
  if (hasOAuthCallback && location.pathname === '/auth') {
    return <>{children}</>;
  }

  // Redirect authenticated users to their respective portal
  if (isAuthenticated && user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'agent') {
      return <Navigate to="/agent" replace />;
    } else {
      return <Navigate to="/customer/order-hub" replace />;
    }
  }

  return <>{children}</>;
};

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col selection:bg-blue-600 selection:text-white transition-colors duration-200">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <>
                <Navbar
                  onNavigateHome={() => {}}
                  onNavigateDashboard={() => {}}
                  onNavigateAuth={() => {}}
                  currentView="home"
                />
                <main className="flex-1">
                  <LandingPage />
                </main>
                <footer className="bg-[#030408] border-t border-white/5 text-slate-400 text-xs py-10 font-mono">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm tracking-tight">SWIFTRoute</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400 text-xs font-sans">Enterprise Logistics & Parcel Operating System</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                      <span>256-Bit Cryptographic Ledger</span>
                      <span>·</span>
                      <span>Autonomous Route Engine</span>
                      <span>·</span>
                      <span>ISO 9001 & 27001 Certified</span>
                    </div>
                  </div>
                </footer>
              </>
            </PublicRoute>
          }
        />

        <Route
          path="/auth"
          element={
            <PublicRoute>
              <main className="flex-1">
                <AuthPage />
              </main>
            </PublicRoute>
          }
        />

        {/* OAuth Callback Handler */}
        <Route path="/oauth-callback" element={<OAuthCallbackHandler />} />

        {/* Customer Portal Routes */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/customer/order-hub" replace />} />
          <Route path="order-hub" element={<UniversalOrderHub />} />
          <Route path="parcels" element={<MySwiftRouteParcels />} />
          <Route path="book-shipment" element={<BookShipment />} />
          <Route path="returns" element={<ReturnsManagement />} />
          <Route path="notifications" element={<NotificationCenter />} />
          <Route path="payments" element={<PaymentsInvoices />} />
          <Route path="delivery-preferences" element={<DeliveryPreferences />} />
          <Route path="analytics" element={<CustomerAnalytics />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>

        {/* Agent Portal Routes */}
        <Route
          path="/agent"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Portal Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dispatch" element={<AdminDispatch />} />
          <Route path="parcels" element={<AdminParcels />} />
          <Route path="fleet/live" element={<AdminFleetLive />} />
          <Route path="exceptions" element={<AdminExceptions />} />
          <Route path="shippers" element={<AdminShippers />} />
          <Route path="couriers" element={<AdminCouriers />} />
          <Route path="couriers/verification" element={<AdminCourierVerification />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="revenue" element={<AdminRevenue />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="audit" element={<AdminAuditLogs />} />
          <Route path="system-health" element={<AdminSystemHealth />} />
          <Route path="config" element={<AdminConfig />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
