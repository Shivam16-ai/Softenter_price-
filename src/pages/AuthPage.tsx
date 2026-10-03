import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Building2,
  Upload,
  FileCheck,
  X,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'register' | 'reset';
type AuthStep = 'idle' | 'authenticating' | 'verified' | 'redirecting';
type PortalType = 'customer' | 'agent' | 'admin';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, registerAgent, resetPassword, setToken, user, isAuthenticated } = useAuth();
  
  // Portal Selection State
  const [portalType, setPortalType] = useState<PortalType>('customer');
  
  // Navigation & Form Modes
  const [mode, setMode] = useState<AuthMode>('login');
  const [authStep, setAuthStep] = useState<AuthStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Field states for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Login inputs (supports Email OR Employee ID)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register common inputs (now synced with portal type)
  const [registerType, setRegisterType] = useState<'customer' | 'agent'>('customer');
  
  // Sync register type with portal type when switching to register mode
  useEffect(() => {
    if (mode === 'register' && portalType !== 'admin') {
      setRegisterType(portalType);
    }
  }, [mode, portalType]);

  // Auto-switch to login mode when Admin portal is selected
  useEffect(() => {
    if (portalType === 'admin' && (mode === 'register' || mode === 'reset')) {
      setMode('login');
      setError(null);
      setSuccessMsg(null);
    }
  }, [portalType, mode]);
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Delivery Agent Specific Registration Fields
  const [employeeId, setEmployeeId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [department, setDepartment] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [idDocumentData, setIdDocumentData] = useState<string | null>(null);
  const [idDocumentName, setIdDocumentName] = useState<string | null>(null);
  const [idDocumentSize, setIdDocumentSize] = useState<string | null>(null);
  const [idDocError, setIdDocError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset inputs
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  // Video playback reference & clip sequence
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoIndex, setVideoIndex] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);

  const videoClips = [
    '/assets/logistics-hero.mp4',
    '/assets/logistics-highway.mp4',
  ];

  const handleVideoEnded = () => {
    setVideoIndex((prev) => (prev + 1) % videoClips.length);
  };

  // Redirect to appropriate dashboard based on user role
  const redirectToDashboard = () => {
    console.log('🚀 AUTH SUCCESS - Redirecting to portal');
    console.log('USER:', user);
    console.log('ROLE:', user?.role);
    
    if (user?.role === 'admin') {
      console.log('REDIRECT DESTINATION: /admin');
      navigate('/admin', { replace: true });
    } else if (user?.role === 'agent') {
      console.log('REDIRECT DESTINATION: /agent');
      navigate('/agent', { replace: true });
    } else {
      console.log('REDIRECT DESTINATION: /customer/order-hub');
      navigate('/customer/order-hub', { replace: true });
    }
  };

  // Google OAuth callback detection from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const errorParam = urlParams.get('error');

    if (token) {
      console.log('📨 OAuth token detected in URL');
      setAuthStep('verified');
      setToken(token);
      // Clean up URL without the token
      navigate(location.pathname, { replace: true });
    } else if (errorParam) {
      console.log('❌ OAuth error detected:', errorParam);
      setError('Google authentication could not be completed. Please verify your account and try again.');
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, setToken, navigate]);

  // Debug: Log whenever user state changes
  useEffect(() => {
    console.log('👤 User state changed:', { user: user?.email, role: user?.role, isAuthenticated });
  }, [user, isAuthenticated]);

  // Separate effect to handle redirect after user is loaded
  useEffect(() => {
    console.log('🔍 Redirect effect triggered', { authStep, user: user?.email, isAuthenticated });
    
    // Only redirect if we're in verified state and user is loaded
    if (authStep === 'verified' && user && isAuthenticated) {
      console.log('✅ User loaded, proceeding to redirect');
      setTimeout(() => {
        setAuthStep('redirecting');
        setTimeout(() => {
          redirectToDashboard();
        }, 350);
      }, 600);
    }
  }, [authStep, user, isAuthenticated, navigate]);

  // Google OAuth Trigger
  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  // Login Submission (Supports Email OR Employee ID)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = loginIdentifier.trim();
    if (!identifier || !password) {
      setError('Please provide your email or Employee ID and password.');
      return;
    }

    console.log('🔐 Login attempt:', { identifier, portalType });
    setError(null);
    setSuccessMsg(null);
    setAuthStep('authenticating');

    try {
      await login(identifier, password, portalType === 'admin' ? undefined : portalType);
      console.log('🚀 Email/Password login successful - waiting for user state');
      console.log('User after login:', user);
      console.log('isAuthenticated:', isAuthenticated);
      setAuthStep('verified');
      // The redirect will be handled by the useEffect that watches user state
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      setAuthStep('idle');
      
      // Check for role mismatch errors and provide portal-specific guidance
      const errorMsg = err.message || 'Unable to authenticate. Check your email/Employee ID and password.';
      if (errorMsg.includes('Customer') && portalType === 'agent') {
        setError('This account is registered as a Customer account. Please select "Customer / Shipper" portal to sign in.');
      } else if (errorMsg.includes('Delivery Agent') && portalType === 'customer') {
        setError('This account is registered as a Delivery Agent account. Please select "Delivery Agent" portal to sign in.');
      } else {
        setError(errorMsg);
      }
    }
  };

  // Document File Upload Handler
  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdDocError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setIdDocError('Invalid format. Please upload a JPG, PNG, or PDF file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setIdDocError('File size exceeds the 5MB maximum limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setIdDocumentData(reader.result as string);
      setIdDocumentName(file.name);
      setIdDocumentSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
    };
    reader.onerror = () => {
      setIdDocError('Failed to read document file.');
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = () => {
    setIdDocumentData(null);
    setIdDocumentName(null);
    setIdDocumentSize(null);
    setIdDocError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Register Submission (Customer or Delivery Agent)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (registerType === 'customer') {
      // Customer Registration
      if (!fullName.trim() || !regEmail.trim() || !regPassword || !regConfirmPassword || !phone.trim()) {
        setError('Please fill in all mandatory fields marked with *.');
        return;
      }

      if (regPassword !== regConfirmPassword) {
        setError('Password and confirmation password do not match.');
        return;
      }

      if (regPassword.length < 6) {
        setError('Password must contain at least 6 characters.');
        return;
      }

      setAuthStep('authenticating');

      try {
        await register({
          full_name: fullName.trim(),
          email: regEmail.trim(),
          password: regPassword,
          role: 'customer',
          phone: phone.trim(),
          address: address.trim(),
        });
        console.log('🚀 Customer registration successful - waiting for user state');
        setAuthStep('verified');
        // The redirect will be handled by the useEffect that watches user state
      } catch (err: any) {
        setAuthStep('idle');
        setError(err.message || 'Registration could not be completed. Please check your details.');
      }
    } else {
      // Delivery Agent Registration
      if (!fullName.trim() || !regEmail.trim() || !employeeId.trim() || !phone.trim() || !companyName.trim() || !vehicleNumber.trim() || !regPassword || !regConfirmPassword) {
        setError('All fields marked with * are required for delivery agent registration.');
        return;
      }

      if (!idDocumentData) {
        setError('Company identity card/document upload is mandatory for delivery agent verification.');
        return;
      }

      if (regPassword !== regConfirmPassword) {
        setError('Password and confirmation password do not match.');
        return;
      }

      if (regPassword.length < 6) {
        setError('Password must contain at least 6 characters.');
        return;
      }

      setAuthStep('authenticating');

      try {
        const res = await registerAgent({
          full_name: fullName.trim(),
          email: regEmail.trim(),
          employee_id: employeeId.trim(),
          phone: phone.trim(),
          company_name: companyName.trim(),
          department: department.trim(),
          vehicle_number: vehicleNumber.trim(),
          id_document: idDocumentData,
          password: regPassword,
          password_confirm: regConfirmPassword,
        });

        setAuthStep('idle');
        setSuccessMsg(res?.message || 'Delivery Agent registration submitted successfully! Your account is currently PENDING ADMINISTRATIVE VERIFICATION. Dispatch administration will review your identity document and vehicle details.');
        // Reset form
        setFullName('');
        setRegEmail('');
        setEmployeeId('');
        setPhone('');
        setCompanyName('');
        setDepartment('');
        setVehicleNumber('');
        removeDocument();
        setRegPassword('');
        setRegConfirmPassword('');
        setMode('login');
      } catch (err: any) {
        setAuthStep('idle');
        setError(err.message || 'Delivery agent registration could not be completed.');
      }
    }
  };

  // Reset Submission
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetNewPassword) {
      setError('Please provide your account email and new password.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (resetNewPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setAuthStep('authenticating');

    try {
      await resetPassword(resetEmail.trim(), resetNewPassword);
      console.log('🚀 Password reset successful - waiting for user state');
      setAuthStep('verified');
      // The redirect will be handled by the useEffect that watches user state
    } catch (err: any) {
      setAuthStep('idle');
      setError(err.message || 'Failed to set password. Please check your email.');
    }
  };

  const isLoading = authStep !== 'idle';

  return (
    <div className="min-h-screen bg-[#050811] text-white selection:bg-sky-500 selection:text-white flex flex-col justify-between relative overflow-x-hidden font-sans">
      {/* Main Split Grid */}
      <main className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* ======================================================== */}
        {/* LEFT SIDE: CINEMATIC LOGISTICS VIDEO BACKDROP (58%)      */}
        {/* ======================================================== */}
        <section className="hidden lg:flex lg:col-span-7 relative flex-col justify-end p-12 lg:p-16 overflow-hidden bg-slate-950 border-r border-white/10 select-none">
          {/* Continuous Real Logistics Footage */}
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            {!videoFailed ? (
              <video
                ref={videoRef}
                key={videoClips[videoIndex]}
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnded}
                onError={() => setVideoFailed(true)}
                poster="/assets/logistics-hero.jpg"
                className="w-full h-full object-cover scale-105 filter brightness-[0.72] contrast-[1.12] saturate-[1.18] transition-opacity duration-1000"
              >
                <source src={videoClips[videoIndex]} type="video/mp4" />
              </video>
            ) : (
              <img
                src="/assets/logistics-hero.jpg"
                alt="Logistics Fleet"
                className="w-full h-full object-cover filter brightness-[0.7]"
              />
            )}

            {/* Dark Studio Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-transparent to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#050811]/30 to-[#050811]" />
            <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/80" />
          </div>

          {/* Bottom Left Luxury Brand Statement */}
          <div className="relative z-20 space-y-3 pb-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-sky-400 block">
              AUTONOMOUS FREIGHT MESH
            </span>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] max-w-lg">
              Move with{' '}
              <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-white to-blue-200">
                precision.
              </span>
            </h2>

            <p className="text-sm text-slate-400 font-light max-w-md leading-relaxed">
              One connected platform for parcels, fleets, and international freight operations. Real-time telemetry without human latency.
            </p>

            <div className="pt-4 flex items-center gap-6 text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1.5 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                256-Bit SSL Encryption
              </span>
              <span>·</span>
              <span>ISO 27001 Certified</span>
              <span>·</span>
              <span>Sub-second GPS Sync</span>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* RIGHT SIDE: CLEAN PRODUCTION AUTHENTICATION INTERFACE    */}
        {/* ======================================================== */}
        <section className="lg:col-span-5 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-16 py-24 sm:py-28 bg-[#050811] relative z-20">
          {/* Mobile Background Ambient Video Layer */}
          <div className="absolute inset-0 lg:hidden pointer-events-none opacity-20">
            <img
              src="/assets/logistics-hero.jpg"
              alt="Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050811] via-[#050811]/90 to-[#050811]" />
          </div>

          <div className="w-full max-w-[480px] mx-auto relative z-10 space-y-6">
            {/* Header Titles */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-sky-400 block">
                COMMAND CENTER ACCESS
              </span>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                {mode === 'login' && (
                  <>
                    Sign in to your{' '}
                    <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-white">
                      {portalType === 'customer' ? 'Customer Portal' : portalType === 'agent' ? 'Delivery Portal' : 'Admin Portal'}
                    </span>
                  </>
                )}
                {mode === 'register' && (
                  <>
                    Create an{' '}
                    <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-white">
                      {portalType === 'customer' ? 'Customer Account' : 'Delivery Agent Account'}
                    </span>
                  </>
                )}
                {mode === 'reset' && (
                  <>
                    Reset your{' '}
                    <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-white">
                      Account Password
                    </span>
                  </>
                )}
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed">
                {mode === 'login' && portalType === 'customer' && 'Manage shipments, deliveries, invoices, and your logistics activity.'}
                {mode === 'login' && portalType === 'agent' && 'Access assigned routes, deliveries, vehicle operations, and dispatch information.'}
                {mode === 'login' && portalType === 'admin' && 'Secure access to the SWIFTRoute Enterprise Administration Portal.'}
                {mode === 'register' && portalType === 'customer' && 'Register your verified commercial shipper account for enterprise logistics.'}
                {mode === 'register' && portalType === 'agent' && 'Submit delivery agent application with work verification and vehicle assignment.'}
                {mode === 'reset' && 'Enter your registered email address to set a new password.'}
              </p>
            </div>

            {/* Portal Type Selector (Customer/Shipper vs Delivery Agent vs Admin) */}
            {mode !== 'reset' && (
              <div className="pt-2">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/70 border border-white/5 text-xs font-mono font-semibold shadow-inner">
                  <button
                    type="button"
                    onClick={() => {
                      setPortalType('customer');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-lg transition-all duration-200 cursor-pointer text-center ${
                      portalType === 'customer'
                        ? 'bg-sky-500 text-white font-bold shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    CUSTOMER / SHIPPER
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPortalType('agent');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-lg transition-all duration-200 cursor-pointer text-center ${
                      portalType === 'agent'
                        ? 'bg-orange-500 text-white font-bold shadow-[0_0_15px_rgba(255,85,0,0.4)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    DELIVERY AGENT
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPortalType('admin');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-lg transition-all duration-200 cursor-pointer text-center ${
                      portalType === 'admin'
                        ? 'bg-purple-600 text-white font-bold shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    ADMIN
                  </button>
                </div>
              </div>
            )}

            {/* Error & Success Messages */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/80 text-rose-300 text-xs flex items-start gap-2.5 font-sans"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-900/80 text-emerald-300 text-xs flex items-start gap-2.5 font-sans"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mode Switcher Segmented Control (Sign In | Register Only) - Hide Register for Admin */}
            {mode !== 'reset' ? (
              portalType === 'admin' ? (
                <div className="flex p-1 rounded-xl bg-slate-900/90 border border-white/5 text-xs font-mono font-medium">
                  <button
                    type="button"
                    className="flex-1 py-2.5 rounded-lg bg-purple-600 text-white font-bold shadow-[0_0_15px_rgba(147,51,234,0.4)] cursor-default"
                  >
                    Administrator Login
                  </button>
                </div>
              ) : (
                <div className="flex p-1 rounded-xl bg-slate-900/90 border border-white/5 text-xs font-mono font-medium">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
                    className={`flex-1 py-2.5 rounded-lg transition-all cursor-pointer ${
                      mode === 'login'
                        ? 'bg-sky-500 text-white font-bold shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
                    className={`flex-1 py-2.5 rounded-lg transition-all cursor-pointer ${
                      mode === 'register'
                        ? 'bg-sky-500 text-white font-bold shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Register
                  </button>
                </div>
              )
            ) : (
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-400 hover:text-sky-300 cursor-pointer"
              >
                <span>Back to Sign In</span>
              </button>
            )}

            {/* ======================================================== */}
            {/* 1. SIGN IN FORM (Clean Real Authentication)              */}
            {/* ======================================================== */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4" autoComplete="off">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5 tracking-wider uppercase">
                    {portalType === 'customer' ? 'Customer Email *' : portalType === 'agent' ? 'Company Email or Employee ID *' : 'Administrator Email *'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={portalType === 'customer' ? 'customer@company.com' : portalType === 'agent' ? 'company@company.com or EMP-20482' : 'admin@swiftroute.com'}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 font-mono text-xs focus:ring-1 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono text-slate-300 tracking-wider uppercase">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 font-mono text-xs focus:ring-1 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all shadow-inner"
                    />
                  </div>

                  {/* Normal "Forgot Password?" Link directly below password - Hidden for Admin */}
                  {portalType !== 'admin' && (
                    <div className="flex items-center justify-end text-[11px] mt-2 font-mono">
                      <button
                        type="button"
                        onClick={() => {
                          setMode('reset');
                          if (loginIdentifier && loginIdentifier.includes('@')) {
                            setResetEmail(loginIdentifier);
                          }
                          setError(null);
                          setSuccessMsg(null);
                        }}
                        className="text-sky-400 hover:text-sky-300 font-medium hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>

                {/* Primary Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full mt-2 py-3.5 px-4 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer group disabled:opacity-60 relative overflow-hidden ${
                    portalType === 'admin'
                      ? 'bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 shadow-[0_0_25px_rgba(147,51,234,0.4)]'
                      : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-[0_0_25px_rgba(2,132,199,0.35)]'
                  }`}
                >
                  <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

                  {authStep === 'idle' && (
                    <>
                      <span>Sign in to {portalType === 'customer' ? 'Customer' : portalType === 'agent' ? 'Delivery' : 'Admin'} Portal</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                  {authStep === 'authenticating' && (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  )}
                  {authStep === 'verified' && (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Access Verified</span>
                    </>
                  )}
                  {authStep === 'redirecting' && (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Opening {portalType === 'customer' ? 'Customer' : portalType === 'agent' ? 'Delivery' : 'Admin'} Portal...</span>
                    </>
                  )}
                </button>

                {/* Divider and Google OAuth - Hidden for Admin */}
                {portalType !== 'admin' && (
                  <>
                    <div className="relative my-5">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-[11px] font-mono">
                        <span className="px-3 bg-[#050811] text-slate-500 uppercase tracking-widest">
                          Or Enterprise OAuth
                        </span>
                      </div>
                    </div>

                    {/* Official Google OAuth Button */}
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-slate-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    <div className="pt-2 text-center text-xs text-slate-400 font-mono">
                      <span>Don't have an enterprise account? </span>
                      <button
                        type="button"
                        onClick={() => { setMode('register'); setError(null); }}
                        className="text-sky-400 hover:text-sky-300 font-bold hover:underline cursor-pointer"
                      >
                        Create {portalType === 'customer' ? 'Customer' : 'Delivery Agent'} account
                      </button>
                    </div>
                  </>
                )}

                {/* Admin Only Message */}
                {portalType === 'admin' && (
                  <div className="pt-4 text-center">
                    <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">
                      Authorized administrators only
                    </p>
                  </div>
                )}
              </form>
            )}

            {/* ======================================================== */}
            {/* 2. REGISTRATION FORM (Customer vs Delivery Agent ONLY)   */}
            {/* ======================================================== */}
            {mode === 'register' && portalType !== 'admin' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* PERSONAL INFORMATION (Common to both) */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1 tracking-wider uppercase">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 font-mono text-xs focus:ring-1 focus:ring-sky-400 focus:border-sky-400 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1 tracking-wider uppercase">
                      {registerType === 'agent' ? 'Official Company Email *' : 'Corporate / Personal Email Address *'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder={registerType === 'agent' ? 'agent@logistics-fleet.com' : 'shipper@enterprise.com'}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 font-mono text-xs focus:ring-1 focus:ring-sky-400 focus:border-sky-400 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1 tracking-wider uppercase">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 font-mono text-xs focus:ring-1 focus:ring-sky-400 focus:border-sky-400 outline-none"
                        />
                      </div>
                    </div>

                    {registerType === 'customer' ? (
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1 tracking-wider uppercase">
                          Facility / Delivery Address
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Suite 500, Metro City"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 font-mono text-xs focus:ring-1 focus:ring-sky-400 focus:border-sky-400 outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1 tracking-wider uppercase">
                          Employee ID *
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            placeholder="EMP-20482"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 font-mono text-xs uppercase focus:ring-1 focus:ring-orange-400 focus:border-orange-400 outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* DELIVERY AGENT SPECIFIC FIELDS */}
                {registerType === 'agent' && (
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange-400 block font-bold">
                      WORK INFORMATION & VEHICLE ASSIGNMENT
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1 tracking-wider uppercase">
                          Company / Organization *
                        </label>
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Bay Area Logistics Fleet"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 font-mono text-xs focus:ring-1 focus:ring-orange-400 focus:border-orange-400 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1 tracking-wider uppercase">
                          Department (Optional)
                        </label>
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          placeholder="Express Courier Unit"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 font-mono text-xs focus:ring-1 focus:ring-orange-400 focus:border-orange-400 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1 tracking-wider uppercase">
                        Vehicle Registration Number *
                      </label>
                      <div className="relative">
                        <Truck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={vehicleNumber}
                          onChange={(e) => setVehicleNumber(e.target.value)}
                          placeholder="e.g. TS09AB1234 or SR-VAN-01"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 font-mono text-xs uppercase focus:ring-1 focus:ring-orange-400 focus:border-orange-400 outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">
                        Must be a unique vehicle not actively assigned to another courier.
                      </p>
                    </div>

                    {/* IDENTITY DOCUMENT UPLOAD COMPONENT */}
                    <div className="pt-2">
                      <label className="block text-xs font-mono text-slate-300 mb-1 tracking-wider uppercase">
                        Company Identity Document / ID Card *
                      </label>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleDocumentFileChange}
                        className="hidden"
                        id="agent-id-doc-upload"
                      />

                      {!idDocumentData ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-white/15 hover:border-orange-400/50 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-900/70 group"
                        >
                          <Upload className="w-6 h-6 text-slate-400 group-hover:text-orange-400 mx-auto mb-2 transition-colors" />
                          <span className="text-xs font-bold text-slate-200 block group-hover:text-white">
                            Upload Official Company ID Card
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block mt-1">
                            Supported: JPG, PNG, PDF (Max 5MB)
                          </span>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                              <FileCheck className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">
                                {idDocumentName}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-mono block">
                                ✓ Uploaded ({idDocumentSize}) · Stored in Private Vault
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={removeDocument}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                            title="Replace document"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {idDocError && (
                        <p className="text-rose-400 text-[11px] font-mono mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{idDocError}</span>
                        </p>
                      )}

                      <p className="text-[10px] text-slate-500 font-mono mt-1">
                        Sensitive document stored in secure private storage. Only accessible by authorized dispatch administration.
                      </p>
                    </div>
                  </div>
                )}

                {/* AUTHENTICATION PASSWORDS */}
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-mono text-slate-300 tracking-wider uppercase">
                          Password *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="text-[10px] font-mono text-slate-400 hover:text-slate-200"
                        >
                          {showRegPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min. 6 chars"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 font-mono text-xs focus:ring-1 focus:ring-sky-400 focus:border-sky-400 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-mono text-slate-300 tracking-wider uppercase">
                          Confirm *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="text-[10px] font-mono text-slate-400 hover:text-slate-200"
                        >
                          {showRegConfirmPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 font-mono text-xs focus:ring-1 focus:ring-sky-400 focus:border-sky-400 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full mt-3 py-3.5 px-4 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 text-white ${
                    registerType === 'agent'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 shadow-[0_0_20px_rgba(255,85,0,0.35)]'
                      : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-[0_0_20px_rgba(2,132,199,0.35)]'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : registerType === 'agent' ? (
                    <>
                      <span>Submit Delivery Agent Application</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Register Shipper Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center text-xs text-slate-400 font-mono">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className="text-sky-400 hover:text-sky-300 font-bold hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* 3. FORGOT / RESET PASSWORD FORM                          */}
            {/* ======================================================== */}
            {mode === 'reset' && (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5 tracking-wider uppercase">
                    Account Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="account@enterprise.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 font-mono text-xs focus:ring-1 focus:ring-sky-400 focus:border-sky-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono text-slate-300 tracking-wider uppercase">
                      New Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="text-[11px] font-mono text-slate-400 hover:text-slate-200"
                    >
                      {showResetPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 font-mono text-xs focus:ring-1 focus:ring-sky-400 focus:border-sky-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5 tracking-wider uppercase">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 font-mono text-xs focus:ring-1 focus:ring-sky-400 focus:border-sky-400 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(2,132,199,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Update Password & Authenticate</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
