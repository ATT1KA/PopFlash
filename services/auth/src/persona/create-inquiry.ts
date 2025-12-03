import axios from 'axios';

import { env } from '../config/env.js';

const PERSONA_API_BASE = 'https://withpersona.com/api/v1';

interface CreateInquiryParams {
  referenceId: string;
  templateId?: string;
  fields?: {
    nameFirst?: string;
    nameLast?: string;
    emailAddress?: string;
  };
}

interface InquiryResponse {
  id: string;
  status: string;
  referenceId: string;
  sessionToken: string;
}

export const createPersonaInquiry = async (params: CreateInquiryParams): Promise<InquiryResponse> => {
  if (!env.personaApiKey) {
    throw new Error('Persona API key not configured');
  }

  const templateId = params.templateId ?? env.personaTemplateId;

  if (!templateId) {
    throw new Error('Persona template ID not configured');
  }

  const response = await axios.post(
    `${PERSONA_API_BASE}/inquiries`,
    {
      data: {
        type: 'inquiry',
        attributes: {
          'inquiry-template-id': templateId,
          'reference-id': params.referenceId,
          fields: params.fields
            ? {
                'name-first': params.fields.nameFirst,
                'name-last': params.fields.nameLast,
                'email-address': params.fields.emailAddress,
              }
            : undefined,
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${env.personaApiKey}`,
        'Content-Type': 'application/json',
        'Persona-Version': '2023-01-05',
        'Key-Inflection': 'camel',
      },
    }
  );

  const inquiry = response.data.data;

  return {
    id: inquiry.id,
    status: inquiry.attributes.status,
    referenceId: inquiry.attributes.referenceId,
    sessionToken: response.data.meta?.sessionToken ?? '',
  };
};
