import { createHttpClient, post } from './http-client.js';
import { config } from '../config.js';

interface SteamLoginRequest {
  steamOpenIdToken: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    kycStatus: string;
  };
}

const client = createHttpClient(config.authServiceUrl, config.requestTimeoutMs);

export const loginWithSteam = (payload: SteamLoginRequest) =>
  post<LoginResponse>(client, '/v1/auth/steam', payload);

export const refreshSession = (refreshToken: string) =>
  post<LoginResponse>(client, '/v1/auth/refresh', { refreshToken });