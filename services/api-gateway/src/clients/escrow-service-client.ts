import { createHttpClient, get, post } from './http-client.js';
import { config } from '../config.js';

interface EscrowStatus {
  tradeId: string;
  status: string;
  milestones: Array<{
    name: string;
    completedAt?: string;
  }>;
  totalAmountUsd: number;
  buyerUserId: string;
  sellerUserId: string;
  createdAt: string;
  updatedAt: string;
}

interface InitiateEscrowRequest {
  tradeId: string;
  buyerUserId: string;
  sellerUserId: string;
  totalAmountUsd: number;
}

interface CompleteMilestoneRequest {
  milestoneName: 'Funds Captured' | 'Assets Deposited' | 'Settlement Completed';
}

const client = createHttpClient(config.escrowServiceUrl, config.requestTimeoutMs);

export const fetchEscrowStatus = (tradeId: string, authHeader?: string) =>
  get<EscrowStatus>(client, `/v1/escrow/${tradeId}`, {
    headers: {
      Authorization: authHeader,
    },
  });

export const initiateEscrow = (payload: InitiateEscrowRequest, authHeader?: string) =>
  post<EscrowStatus>(client, `/v1/escrow`, payload, {
    headers: {
      Authorization: authHeader,
    },
  });

export const completeEscrowMilestone = (
  tradeId: string,
  payload: CompleteMilestoneRequest,
  authHeader?: string,
) =>
  post<EscrowStatus>(client, `/v1/escrow/${tradeId}/milestones`, payload, {
    headers: {
      Authorization: authHeader,
    },
  });