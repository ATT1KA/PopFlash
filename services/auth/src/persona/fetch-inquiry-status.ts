import axios from 'axios';

import { env } from '../config/env.js';

const PERSONA_API_BASE = 'https://withpersona.com/api/v1';

interface InquiryStatus {
  id: string;
  status: 'created' | 'pending' | 'completed' | 'failed' | 'needs_review' | 'approved' | 'declined' | 'expired';
  referenceId: string;
  completedAt: string | null;
  failedAt: string | null;
  decisionedAt: string | null;
  verifications: Array<{
    id: string;
    type: string;
    status: string;
  }>;
}

export const fetchInquiryStatus = async (inquiryId: string): Promise<InquiryStatus> => {
  if (!env.personaApiKey) {
    throw new Error('Persona API key not configured');
  }

  const response = await axios.get(`${PERSONA_API_BASE}/inquiries/${inquiryId}`, {
    headers: {
      Authorization: `Bearer ${env.personaApiKey}`,
      'Content-Type': 'application/json',
      'Persona-Version': '2023-01-05',
      'Key-Inflection': 'camel',
    },
    params: {
      include: 'verifications',
    },
  });

  const inquiry = response.data.data;
  const included = response.data.included ?? [];

  const verifications = included
    .filter((item: { type: string }) => item.type === 'verification')
    .map((v: { id: string; type: string; attributes: { status: string } }) => ({
      id: v.id,
      type: v.type,
      status: v.attributes.status,
    }));

  return {
    id: inquiry.id,
    status: inquiry.attributes.status,
    referenceId: inquiry.attributes.referenceId,
    completedAt: inquiry.attributes.completedAt,
    failedAt: inquiry.attributes.failedAt,
    decisionedAt: inquiry.attributes.decisionedAt,
    verifications,
  };
};

export const mapPersonaStatusToKyc = (
  personaStatus: InquiryStatus['status']
): 'unverified' | 'pending' | 'verified' | 'rejected' => {
  switch (personaStatus) {
    case 'created':
    case 'pending':
    case 'needs_review':
      return 'pending';
    case 'completed':
    case 'approved':
      return 'verified';
    case 'failed':
    case 'declined':
    case 'expired':
      return 'rejected';
    default:
      return 'unverified';
  }
};
