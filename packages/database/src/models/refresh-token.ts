import { randomUUID } from 'crypto';

import { Schema, model, type Model } from 'mongoose';

export interface RefreshTokenDocument {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<RefreshTokenDocument>(
  {
    _id: { type: String, default: () => randomUUID() },
    userId: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshTokenModel: Model<RefreshTokenDocument> = model<RefreshTokenDocument>(
  'RefreshToken',
  refreshTokenSchema,
);
