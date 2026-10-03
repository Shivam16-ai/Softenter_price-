import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: 3000,
  jwtSecret: process.env.JWT_SECRET || 'swiftroute-enterprise-jwt-secret-key-2026-courier-system',
  jwtExpiresIn: '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: 'SwiftRoute Enterprise Parcel System',
  corsOrigin: '*',
  uploadDir: 'backend/uploads',
  
  // Google OAuth Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
  },
  
  // Session Configuration
  sessionSecret: process.env.SESSION_SECRET || 'swiftroute-session-secret-change-in-production',
};
