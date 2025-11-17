import { env } from '../config/env.js';
import { HttpError } from '../utils/http-error.js';
import { validateSteamTicket } from '../steam/validate-ticket.js';
import { fetchSteamProfile } from '../steam/fetch-profile.js';
import { upsertUserBySteamId, findUserById } from '../repositories/user-repository.js';
import {
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshTokens,
} from '../repositories/refresh-token-repository.js';
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshTokenSignature,
} from './token-service.js';

export const authenticateWithSteam = async (ticket: string) => {
  const { steamId } = await validateSteamTicket(ticket);
  const profile = await fetchSteamProfile(steamId);

  const user = await upsertUserBySteamId({
    steamId,
    displayName: profile?.displayName ?? `Steam user ${steamId}`,
    avatarUrl: profile?.avatarUrl,
    countryCode: profile?.countryCode ?? env.defaultCountryCode,
  });

  const payload = { sub: user.id, steamId: user.steamId, role: user.role };
  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);

  await storeRefreshToken(user.id, refreshToken);

  return {
    user,
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

export const rotateRefreshToken = async (token: string) => {
  let decoded: { sub: string; steamId: string; role: string };

  try {
    decoded = verifyRefreshTokenSignature(token);
  } catch (error) {
    throw new HttpError(401, 'Invalid refresh token signature', error);
  }

  const isValid = await verifyRefreshToken(decoded.sub, token);

  if (!isValid) {
    throw new HttpError(401, 'Refresh token has expired or been revoked');
  }

  const user = await findUserById(decoded.sub);

  if (!user) {
    await revokeRefreshTokens(decoded.sub);
    throw new HttpError(404, 'User not found for refresh token');
  }

  const payload = { sub: user.id, steamId: user.steamId, role: user.role };
  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);

  await storeRefreshToken(user.id, refreshToken);

  return {
    user,
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};