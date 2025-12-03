import { createPersonaInquiry } from '../persona/create-inquiry.js';
import { fetchInquiryStatus, mapPersonaStatusToKyc } from '../persona/fetch-inquiry-status.js';
import {
  verifyWebhookSignature,
  parseWebhookEvent,
  extractInquiryFromEvent,
  isInquiryEvent,
} from '../persona/webhook-handler.js';
import { findUserById, updateUserKycStatus } from '../repositories/user-repository.js';
import { HttpError } from '../utils/http-error.js';

interface InitiateKycParams {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export const initiateKycVerification = async (params: InitiateKycParams) => {
  const { userId, email, firstName, lastName } = params;

  const user = await findUserById(userId);

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  if (user.kycStatus === 'verified') {
    return {
      status: 'already_verified',
      kycStatus: user.kycStatus,
    };
  }

  const inquiry = await createPersonaInquiry({
    referenceId: userId,
    fields: {
      nameFirst: firstName,
      nameLast: lastName,
      emailAddress: email,
    },
  });

  await updateUserKycStatus(userId, 'pending', inquiry.id);

  return {
    status: 'initiated',
    inquiryId: inquiry.id,
    sessionToken: inquiry.sessionToken,
    kycStatus: 'pending',
  };
};

export const getKycStatus = async (userId: string) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  if (!user.personaInquiryId) {
    return {
      kycStatus: user.kycStatus,
      inquiryId: null,
      verificationDetails: null,
    };
  }

  try {
    const inquiryStatus = await fetchInquiryStatus(user.personaInquiryId);
    const mappedStatus = mapPersonaStatusToKyc(inquiryStatus.status);

    if (mappedStatus !== user.kycStatus) {
      await updateUserKycStatus(userId, mappedStatus);
    }

    return {
      kycStatus: mappedStatus,
      inquiryId: user.personaInquiryId,
      verificationDetails: {
        personaStatus: inquiryStatus.status,
        completedAt: inquiryStatus.completedAt,
        verifications: inquiryStatus.verifications,
      },
    };
  } catch (error) {
    console.error('Error fetching Persona inquiry status:', error);

    return {
      kycStatus: user.kycStatus,
      inquiryId: user.personaInquiryId,
      verificationDetails: null,
    };
  }
};

export const processKycWebhook = async (payload: string, signature: string) => {
  if (!verifyWebhookSignature(payload, signature)) {
    throw new HttpError(401, 'Invalid webhook signature');
  }

  const event = parseWebhookEvent(payload);

  if (!isInquiryEvent(event.attributes.name)) {
    return { processed: false, reason: 'Not an inquiry event' };
  }

  const { referenceId, status } = extractInquiryFromEvent(event);
  const userId = referenceId;

  const user = await findUserById(userId);

  if (!user) {
    console.warn(`Received KYC webhook for unknown user: ${userId}`);
    return { processed: false, reason: 'User not found' };
  }

  const mappedStatus = mapPersonaStatusToKyc(status as 'approved' | 'declined' | 'pending');
  await updateUserKycStatus(userId, mappedStatus);

  return {
    processed: true,
    userId,
    previousStatus: user.kycStatus,
    newStatus: mappedStatus,
  };
};
