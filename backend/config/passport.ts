import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { config } from './index';
import prisma from '../database/prisma';
import { logger } from '../utils/logger';

// Helper: Map Prisma user object to legacy flat format expected by controllers/middleware
function mapPrismaUserToLegacy(user: any) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    phone: user.phone,
    address: user.address || '',
    avatar_url: user.avatarUrl || null,
    role: user.role.code === 'ADMIN' ? 'admin' :
          user.role.code === 'COURIER_AGENT' ? 'agent' : 'customer',
    status: user.status.toLowerCase(),
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt.toISOString(),
  };
}

// Configure Google OAuth Strategy - Uses Prisma (PostgreSQL) for user storage
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done: any) => {
      try {
        // Extract user info from Google profile
        const email = profile.emails?.[0]?.value;
        const fullName = profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`.trim();
        const avatarUrl = profile.photos?.[0]?.value || null;

        if (!email) {
          return done(new Error('No email found in Google profile'), null);
        }

        // Check if user already exists in PostgreSQL (Prisma)
        let dbUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          include: {
            role: true,
            customerProfile: true,
            deliveryAgentProfile: true,
          },
        });

        if (dbUser) {
          // Update avatar URL if it changed from Google
          if (avatarUrl && dbUser.avatarUrl !== avatarUrl) {
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: { avatarUrl },
              include: {
                role: true,
                customerProfile: true,
                deliveryAgentProfile: true,
              },
            });
          }
          return done(null, mapPrismaUserToLegacy(dbUser));
        }

        // Create new user from Google profile in PostgreSQL
        const customerRole = await prisma.role.findUnique({
          where: { code: 'CUSTOMER' },
        });

        if (!customerRole) {
          logger.error('CUSTOMER role not found in database during Google OAuth signup');
          return done(new Error('Role configuration error. Please contact support.'), null);
        }

        const newDbUser = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            passwordHash: '', // No password for OAuth-only users
            fullName: fullName,
            phone: '',
            address: '',
            roleId: customerRole.id,
            status: 'ACTIVE',
            isEmailVerified: true, // Google accounts are email-verified
            avatarUrl: avatarUrl,
          },
          include: {
            role: true,
          },
        });

        // Create the customer profile
        await prisma.customer.create({
          data: {
            userId: newDbUser.id,
            accountType: 'INDIVIDUAL',
            creditLimit: 0,
            currentBalance: 0,
            paymentTermsDays: 0,
            customDiscountPercent: 0,
          },
        });

        logger.info(`New Google OAuth user created: ${email} (id: ${newDbUser.id})`);

        const mappedNew = {
          id: newDbUser.id,
          email: newDbUser.email,
          full_name: newDbUser.fullName,
          phone: newDbUser.phone,
          address: newDbUser.address || '',
          avatar_url: newDbUser.avatarUrl || null,
          role: 'customer' as const,
          status: 'active',
          created_at: newDbUser.createdAt.toISOString(),
          updated_at: newDbUser.updatedAt.toISOString(),
        };

        return done(null, mappedNew);
      } catch (error: any) {
        logger.error('Google OAuth strategy error:', error);
        return done(error, null);
      }
    }
  )
);

// Serialize user for session (store only ID)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session using Prisma
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        customerProfile: true,
        deliveryAgentProfile: true,
      },
    });

    if (user) {
      done(null, mapPrismaUserToLegacy(user));
    } else {
      done(new Error('User not found'), null);
    }
  } catch (error) {
    done(error, null);
  }
});

export { mapPrismaUserToLegacy };
export default passport;
