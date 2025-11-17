import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

import { env } from '../config/env.js';

interface TokenPayload {
  sub: string;
  steamId: string;
  role: string;
}

export const createAccessToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: `${env.jwtExpirationMinutes}m` });

export const createRefreshToken = (payload: TokenPayload) =>
  jwt.sign({ ...payload, jti: randomUUID() }, env.jwtRefreshSecret, {
    expiresIn: `${env.refreshExpirationDays}d`,
  });

export const verifyRefreshTokenSignature = (token: string) =>
  jwt.verify(token, env.jwtRefreshSecret) as TokenPayload & { jti: string };