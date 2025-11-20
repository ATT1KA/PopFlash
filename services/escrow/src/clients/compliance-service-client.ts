import type {
  ComplianceVerification,
  VerificationScope,
  VerificationStatus,
} from '@popflash/shared';
import axios, { type AxiosInstance } from 'axios';

import { env } from '../config/env.js';

const client: AxiosInstance = axios.create({
  baseURL: env.complianceServiceUrl,
  timeout: env.complianceRequestTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchEscrowVerifications = async (tradeId: string) => {
  const response = await client.get<ComplianceVerification[]>('/v1/compliance/verifications', {
    params: {
      relatedEntityType: 'escrow',
      relatedEntityId: tradeId,
      limit: 5,
    },
  });

  return response.data;
};

export const startEscrowVerification = async (
  tradeId: string,
  scope: VerificationScope[],
  metadata: { notes?: string; initiatedByUserId?: string; initiatedByLabel?: string } = {},
) => {
  const response = await client.post<ComplianceVerification>('/v1/compliance/verifications', {
    relatedEntityType: 'escrow',
    relatedEntityId: tradeId,
    scope,
    notes: metadata.notes,
    initiatedByUserId: metadata.initiatedByUserId,
    initiatedByLabel: metadata.initiatedByLabel,
  });

  return response.data;
};

export const updateEscrowVerificationStatus = async (
  verificationId: string,
  payload: {
    status: VerificationStatus;
    notes?: string;
    reviewerUserId?: string;
    evidenceIds?: string[];
    actorLabel?: string;
  },
) => {
  const response = await client.patch<ComplianceVerification>(
    `/v1/compliance/verifications/${verificationId}/status`,
    payload,
  );

  return response.data;
};
