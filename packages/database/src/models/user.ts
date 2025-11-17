import { randomUUID } from 'crypto';

import { Schema, model, type Model } from 'mongoose';
import type { User } from '@popflash/shared';

const userSchema = new Schema<User>(
  {
    _id: { type: String, default: () => randomUUID() },
    steamId: { type: String, required: true, index: true, unique: true },
    email: { type: String, index: true, sparse: true },
    displayName: { type: String, required: true },
    avatarUrl: { type: String },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin', 'compliance'],
      default: 'user',
    },
    kycStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'enhanced', 'rejected'],
      default: 'unverified',
    },
    countryCode: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const UserModel: Model<User> = model<User>('User', userSchema);
