import { RefreshTokenModel } from '@popflash/database';
import { compare, hash } from 'bcryptjs';

import { env } from '../config/env.js';

const SALT_ROUNDS = 10;
const DAY_IN_MS = 86_400_000;

export const storeRefreshToken = async (userId: string, token: string) => {
  const tokenHash = await hash(token, SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + env.refreshExpirationDays * DAY_IN_MS);

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

  return compare(token, record.tokenHash);
};

export const revokeRefreshTokens = (userId: string) =>
  RefreshTokenModel.deleteMany({ userId }).exec();
