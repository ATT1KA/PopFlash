import { randomUUID } from 'crypto';

import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

export interface RefreshTokenDocument {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

type RefreshTokenEntity = RefreshTokenDocument & { _id: string };

const refreshTokenSchema = new Schema<RefreshTokenEntity>(
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

export type RefreshTokenMongoDocument = HydratedDocument<RefreshTokenEntity>;

export const RefreshTokenModel: Model<RefreshTokenEntity> = model<RefreshTokenEntity>(
  'RefreshToken',
  refreshTokenSchema,
);
