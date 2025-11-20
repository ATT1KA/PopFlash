import type {
  ComplianceVerification,
  VerificationScope,
  VerificationStatus,
} from '@popflash/shared';
import axios from 'axios';

import {
  fetchEscrowVerifications,
  startEscrowVerification,
  updateEscrowVerificationStatus,
} from '../clients/compliance-service-client.js';
import { HttpError } from '../utils/http-error.js';

const ESCROW_VERIFICATION_SCOPES: VerificationScope[] = [
  'proof_of_funds',
  'payment_processor',
  'government_watchlist',
];

type VerificationContext = {
  buyerUserId: string;
  sellerUserId: string;
  totalAmountUsd: number;
};

const milestoneStatusUpdates: Record<
  string,
  | undefined
  | {
      status: VerificationStatus;
      note: (context: VerificationContext & { milestone: string }) => string;
    }
> = {
  'Funds Captured': {
    status: 'in_review',
    note: (context) =>
      `Funds captured for escrow trade. Total amount: $${context.totalAmountUsd.toFixed(
        2,
      )} USD. Initiating proof-of-funds verification for buyer ${context.buyerUserId}.`,
  },
  'Assets Deposited': {
    status: 'in_review',
    note: () =>
      'Assets deposited into escrow. Validating deposited asset provenance and matching trade inventory.',
  },
  'Settlement Completed': {
    status: 'passed',
    note: () =>
      'Escrow settlement completed. Compliance verification marked as passed and ready for audit trail closure.',
  },
  Refunded: {
    status: 'failed',
    note: () =>
      'Escrow refunded. Flagging verification as failed for follow-up review and incident documentation.',
  },
};

const wrapComplianceError = (error: unknown, action: string): never => {
  if (error instanceof HttpError) {
    throw error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 502;
    throw new HttpError(
      status >= 400 ? status : 502,
      `Compliance service error while ${action}`,
      error.response?.data ?? error.message,
    );
  }

  throw new HttpError(
    500,
    `Unexpected error while ${action}`,
    error instanceof Error ? error.message : error,
  );
};

const selectPrimaryVerification = (verifications: ComplianceVerification[]) =>
  verifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];

export const ensureEscrowComplianceVerification = async (
  tradeId: string,
  context: VerificationContext,
) => {
  try {
    const existing = await fetchEscrowVerifications(tradeId);

    if (existing.length > 0) {
      return selectPrimaryVerification(existing);
    }

    return await startEscrowVerification(tradeId, ESCROW_VERIFICATION_SCOPES, {
      notes: `Escrow initiated for trade ${tradeId} with total exposure of $${context.totalAmountUsd.toFixed(
        2,
      )} USD between buyer ${context.buyerUserId} and seller ${context.sellerUserId}.`,
      initiatedByLabel: 'Escrow Service',
    });
  } catch (error) {
    wrapComplianceError(error, 'ensuring escrow compliance verification');
  }
};

export const syncEscrowComplianceForMilestone = async (
  tradeId: string,
  milestoneName: string,
  context: VerificationContext,
) => {
  const updateDefinition = milestoneStatusUpdates[milestoneName];

  if (!updateDefinition) {
    return;
  }

  try {
    const verification = await ensureEscrowComplianceVerification(tradeId, context);

    await updateEscrowVerificationStatus(verification.id, {
      status: updateDefinition.status,
      notes: updateDefinition.note({ ...context, milestone: milestoneName }),
      actorLabel: 'Escrow Service',
    });
  } catch (error) {
    wrapComplianceError(error, `syncing escrow compliance for milestone ${milestoneName}`);
  }
};
