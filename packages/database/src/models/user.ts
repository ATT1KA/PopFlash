import { randomUUID } from 'crypto';

import type { User } from '@popflash/shared';
import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

type UserEntity = User & { _id: string };

const userSchema = new Schema<UserEntity>(
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

export type UserDocument = HydratedDocument<UserEntity>;

export const UserModel: Model<UserEntity> = model<UserEntity>('User', userSchema);
