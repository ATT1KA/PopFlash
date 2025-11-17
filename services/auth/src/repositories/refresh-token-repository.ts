import { addDays } from 'date-fns';
import bcrypt from 'bcryptjs';
import { RefreshTokenModel } from '@popflash/database';

import { env } from '../config/env.js';

const SALT_ROUNDS = 10;

export const storeRefreshToken = async (userId: string, token: string) => {
  const tokenHash = await bcrypt.hash(token, SALT_ROUNDS);
  const expiresAt = addDays(new Date(), env.refreshExpirationDays);

  await RefreshTokenModel.deleteMany({ userId });

  await RefreshTokenModel.create({
    userId,
    tokenHash,
    expiresAt,
  });
};

export const verifyRefreshToken = async (userId: string, token: string) => {
  const record = await RefreshTokenModel.findOne({ userId }).sort({ createdAt: -1 }).exec();

  if (!record) {
    return false;
  }

  return bcrypt.compare(token, record.tokenHash);
};

export const revokeRefreshTokens = (userId: string) =>
  RefreshTokenModel.deleteMany({ userId }).exec();