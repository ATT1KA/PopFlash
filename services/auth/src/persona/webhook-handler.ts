import crypto from 'crypto';

import { env } from '../config/env.js';

interface PersonaWebhookEvent {
  id: string;
  type: string;
  attributes: {
    name: string;
    payload: {
      data: {
        id: string;
        type: string;
        attributes: {
          status: string;
          referenceId: string;
          [key: string]: unknown;
        };
      };
    };
    createdAt: string;
  };
}

export const verifyWebhookSignature = (
  payload: string,
  signature: string
): boolean => {
  if (!env.personaWebhookSecret) {
    console.warn('Persona webhook secret not configured, skipping verification');
    return true;
  }

  const parts = signature.split(',');
  const timestampPart = parts.find((p) => p.startsWith('t='));
  const signaturePart = parts.find((p) => p.startsWith('v1='));

  if (!timestampPart || !signaturePart) {
    return false;
  }

  const timestamp = timestampPart.slice(2);
  const providedSignature = signaturePart.slice(3);

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', env.personaWebhookSecret)
    .update(signedPayload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(providedSignature),
    Buffer.from(expectedSignature)
  );
};

export const parseWebhookEvent = (payload: string): PersonaWebhookEvent => {
  const parsed = JSON.parse(payload);
  return parsed.data as PersonaWebhookEvent;
};

export const extractInquiryFromEvent = (event: PersonaWebhookEvent) => {
  const inquiryData = event.attributes.payload.data;

  return {
    eventName: event.attributes.name,
    inquiryId: inquiryData.id,
    status: inquiryData.attributes.status,
    referenceId: inquiryData.attributes.referenceId,
  };
};

export const isInquiryEvent = (eventName: string): boolean => {
  const inquiryEvents = [
    'inquiry.created',
    'inquiry.started',
    'inquiry.completed',
    'inquiry.failed',
    'inquiry.expired',
    'inquiry.approved',
    'inquiry.declined',
    'inquiry.transitioned',
  ];

  return inquiryEvents.includes(eventName);
};
