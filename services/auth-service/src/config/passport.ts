import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { config } from './index';
import prisma from './prisma';
import { logger } from './logger';

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

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done: any) => {
      try {
        const email = profile.emails?.[0]?.value;
        const fullName = profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`.trim();
        const avatarUrl = profile.photos?.[0]?.value || null;

        if (!email) return done(new Error('No email in Google profile'), null);

        let dbUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          include: { role: true, customerProfile: true, deliveryAgentProfile: true },
        });

        if (dbUser) {
          if (avatarUrl && dbUser.avatarUrl !== avatarUrl) {
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: { avatarUrl },
              include: { role: true, customerProfile: true, deliveryAgentProfile: true },
            });
          }
          return done(null, mapPrismaUserToLegacy(dbUser));
        }

        const customerRole = await prisma.role.findUnique({ where: { code: 'CUSTOMER' } });
        if (!customerRole) return done(new Error('CUSTOMER role not found'), null);

        const newDbUser = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            passwordHash: '',
            fullName,
            phone: '',
            address: '',
            roleId: customerRole.id,
            status: 'ACTIVE',
            isEmailVerified: true,
            avatarUrl,
          },
          include: { role: true },
        });

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

        logger.info(`New Google OAuth user: ${email}`);
        return done(null, {
          id: newDbUser.id, email: newDbUser.email, full_name: newDbUser.fullName,
          phone: newDbUser.phone, address: '', avatar_url: avatarUrl,
          role: 'customer', status: 'active',
          created_at: newDbUser.createdAt.toISOString(),
          updated_at: newDbUser.updatedAt.toISOString(),
        });
      } catch (error: any) {
        logger.error(`Google OAuth error: ${error.message}`);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user: any, done) => done(null, user.id));

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true, customerProfile: true, deliveryAgentProfile: true },
    });
    if (user) done(null, mapPrismaUserToLegacy(user));
    else done(new Error('User not found'), null);
  } catch (error) { done(error, null); }
});

export { mapPrismaUserToLegacy };
export default passport;
