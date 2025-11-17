import axios from 'axios';

import { env } from '../config/env.js';
import { HttpError } from '../utils/http-error.js';

interface SteamTicketResponse {
  response?: {
    params?: {
      steamid: string;
      ownersteamid: string;
      vacbanned: boolean;
      publisherbanned: boolean;
    };
    error?: {
      errorcode: number;
      errordesc: string;
    };
  };
}

export const validateSteamTicket = async (ticket: string) => {
  try {
    const form = new URLSearchParams({
      key: env.steamApiKey,
      appid: env.steamAppId,
      ticket,
    });

    const { data } = await axios.post<SteamTicketResponse>(
      'https://api.steampowered.com/ISteamUserAuth/AuthenticateUserTicket/v1/',
      form,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    const params = data.response?.params;

    if (!params) {
      throw new HttpError(401, 'Invalid Steam ticket', data.response?.error);
    }

    if (params.vacbanned || params.publisherbanned) {
      throw new HttpError(403, 'Steam account restricted');
    }

    return {
      steamId: params.steamid,
      ownerSteamId: params.ownersteamid,
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(
      401,
      'Steam validation failed',
      error instanceof Error ? error.message : error,
    );
  }
};
