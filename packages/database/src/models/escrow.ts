import { randomUUID } from 'crypto';

import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

interface EscrowMilestone {
  name: string;
  completedAt?: Date;
}

export interface EscrowDocument {
  id: string;
  tradeId: string;
  buyerUserId: string;
  sellerUserId: string;
  status: string;
  milestones: EscrowMilestone[];
  totalAmountUsd: number;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<EscrowMilestone>(
  {
    name: { type: String, required: true },
    completedAt: { type: Date },
  },
  { _id: false },
);

type EscrowEntity = EscrowDocument & { _id: string };

const escrowSchema = new Schema<EscrowEntity>(
  {
    _id: { type: String, default: () => randomUUID() },
    tradeId: { type: String, required: true, unique: true, index: true },
    buyerUserId: { type: String, required: true },
    sellerUserId: { type: String, required: true },
    status: {
      type: String,
      enum: ['initiated', 'funds_captured', 'assets_received', 'settled', 'refunded', 'cancelled'],
      default: 'initiated',
    },
    milestones: { type: [milestoneSchema], default: [] },
    totalAmountUsd: { type: Number, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type EscrowMongoDocument = HydratedDocument<EscrowEntity>;

export const EscrowModel: Model<EscrowEntity> = model<EscrowEntity>('Escrow', escrowSchema);
