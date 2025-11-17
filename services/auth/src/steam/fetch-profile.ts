import axios from 'axios';

import { env } from '../config/env.js';

interface PlayerSummary {
  steamid: string;
  personaname: string;
  avatarfull?: string;
  loccountrycode?: string;
  personastate?: number;
}

interface GetPlayerSummariesResponse {
  response: {
    players: PlayerSummary[];
  };
}

export const fetchSteamProfile = async (steamId: string) => {
  const params = new URLSearchParams({
    key: env.steamApiKey,
    steamids: steamId,
  });

  const { data } = await axios.get<GetPlayerSummariesResponse>(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?${params.toString()}`,
  );

  const profile = data.response.players[0];

  if (!profile) {
    return null;
  }

  return {
    displayName: profile.personaname,
    avatarUrl: profile.avatarfull,
    countryCode: profile.loccountrycode ?? env.defaultCountryCode,
  };
};