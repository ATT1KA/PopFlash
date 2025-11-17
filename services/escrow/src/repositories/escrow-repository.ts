import { EscrowModel } from '@popflash/database';

export const createEscrow = (input: {
  tradeId: string;
  buyerUserId: string;
  sellerUserId: string;
  totalAmountUsd: number;
  status: string;
  milestones: Array<{ name: string; completedAt?: Date }>;
}) => EscrowModel.create(input);

export const findEscrowByTradeId = (tradeId: string) =>
  EscrowModel.findOne({ tradeId }).lean().exec();

export const updateEscrowStatus = (tradeId: string, status: string) =>
  EscrowModel.findOneAndUpdate(
    { tradeId },
    { $set: { status, updatedAt: new Date() } },
    { new: true, lean: true },
  ).exec();

export const updateEscrowMilestones = (
  tradeId: string,
  milestones: Array<{ name: string; completedAt?: Date }>,
) =>
  EscrowModel.findOneAndUpdate(
    { tradeId },
    { $set: { milestones, updatedAt: new Date() } },
    { new: true, lean: true },
  ).exec();
