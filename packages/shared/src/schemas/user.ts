import { z } from 'zod';

export const userRoleSchema = z.enum(['user', 'moderator', 'admin', 'compliance']);

export const kycStatusSchema = z.enum([
  'unverified',
  'pending',
  'verified',
  'enhanced',
  'rejected',
]);

export const userSchema = z.object({
  id: z.string().uuid(),
  steamId: z.string(),
  email: z.string().email().optional(),
  displayName: z.string().min(2),
  avatarUrl: z.string().url().optional(),
  role: userRoleSchema,
  kycStatus: kycStatusSchema.default('unverified'),
  personaInquiryId: z.string().optional(),
  countryCode: z.string().length(2),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof userSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type KycStatus = z.infer<typeof kycStatusSchema>;
