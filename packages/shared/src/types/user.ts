import { Prisma } from "@plinkk/prisma";

export type UserWithIncludeStrict = Prisma.UserGetPayload<{
  include: {
    role?: true,
    announcement?: true,
    backgroundColors?: true,
    cosmetics?: true,
    host?: true,
    labels?: true,
    links?: true,
    neonColors?: true,
    plinkks?: true,
    socialIcons?: true,
    statusbar?: true,
    themes?: true
  };
}>;

export type UserWithInclude = Omit<UserWithIncludeStrict, keyof UserWithIncludeStrict> &
  Partial<UserWithIncludeStrict>;

export type SafeUser = Omit<UserWithInclude, 'password' | 'twoFactorSecret' | 'apiKey' | 'stripeCustomerId' | 'twoFactorEnabled' | 'mustChangePassword' | 'onboardingCompleted' | 'plinkkGems' | 'premiumSource' | 'premiumUntil' | 'lastLogin'>;

export function toSafeUser(user: UserWithInclude): SafeUser {
  const { password, twoFactorSecret, apiKey, stripeCustomerId, twoFactorEnabled, mustChangePassword, onboardingCompleted, plinkkGems, premiumSource, premiumUntil, lastLogin, ...safe } = user;
  return safe;
}