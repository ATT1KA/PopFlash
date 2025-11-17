import { randomUUID } from 'crypto';

import { sign, verify } from 'jsonwebtoken';

import { env } from '../config/env.js';

interface TokenPayload {
  sub: string;
  steamId: string;
  role: string;
}

export const createAccessToken = (payload: TokenPayload) =>
  sign(payload, env.jwtSecret, { expiresIn: `${env.jwtExpirationMinutes}m` });

export const createRefreshToken = (payload: TokenPayload) =>
  sign({ ...payload, jti: randomUUID() }, env.jwtRefreshSecret, {
    expiresIn: `${env.refreshExpirationDays}d`,
  });

export const verifyRefreshTokenSignature = (token: string) =>
  verify(token, env.jwtRefreshSecret) as TokenPayload & { jti: string };
