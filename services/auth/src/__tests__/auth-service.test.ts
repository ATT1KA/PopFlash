import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/env.js', () => ({
  env: {
    jwtSecret: 'test-jwt-secret-minimum-32-characters-here',
    jwtRefreshSecret: 'test-refresh-secret-minimum-32-chars',
    jwtExpirationMinutes: 15,
    refreshExpirationDays: 30,
    defaultCountryCode: 'US',
  },
}));

const mockUser = {
  id: 'user-123',
  steamId: '76561198012345678',
  displayName: 'TestUser',
  avatarUrl: 'https://example.com/avatar.jpg',
  role: 'user',
  countryCode: 'US',
};

const mockSteamProfile = {
  displayName: 'TestUser',
  avatarUrl: 'https://example.com/avatar.jpg',
  countryCode: 'US',
};

vi.mock('../steam/validate-ticket.js', () => ({
  validateSteamTicket: vi.fn().mockResolvedValue({ steamId: '76561198012345678' }),
}));

vi.mock('../steam/fetch-profile.js', () => ({
  fetchSteamProfile: vi.fn().mockResolvedValue(mockSteamProfile),
}));

vi.mock('../repositories/user-repository.js', () => ({
  upsertUserBySteamId: vi.fn().mockResolvedValue(mockUser),
  findUserById: vi.fn().mockResolvedValue(mockUser),
}));

vi.mock('../repositories/refresh-token-repository.js', () => ({
  storeRefreshToken: vi.fn().mockResolvedValue(undefined),
  verifyRefreshToken: vi.fn().mockResolvedValue(true),
  revokeRefreshTokens: vi.fn().mockResolvedValue(undefined),
}));

const { authenticateWithSteam, rotateRefreshToken } = await import('../services/auth-service.js');
const { validateSteamTicket } = await import('../steam/validate-ticket.js');
const { fetchSteamProfile } = await import('../steam/fetch-profile.js');
const { upsertUserBySteamId, findUserById } = await import('../repositories/user-repository.js');
const { verifyRefreshToken, revokeRefreshTokens } = await import(
  '../repositories/refresh-token-repository.js'
);

describe('auth-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authenticateWithSteam', () => {
    it('validates Steam ticket and creates tokens', async () => {
      const result = await authenticateWithSteam('valid-ticket');

      expect(validateSteamTicket).toHaveBeenCalledWith('valid-ticket');
      expect(fetchSteamProfile).toHaveBeenCalledWith('76561198012345678');
      expect(upsertUserBySteamId).toHaveBeenCalled();

      expect(result.user).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('uses default display name when profile is unavailable', async () => {
      vi.mocked(fetchSteamProfile).mockResolvedValueOnce(null);

      await authenticateWithSteam('valid-ticket');

      expect(upsertUserBySteamId).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: expect.stringContaining('Steam user'),
        })
      );
    });

    it('propagates Steam validation errors', async () => {
      vi.mocked(validateSteamTicket).mockRejectedValueOnce(new Error('Invalid ticket'));

      await expect(authenticateWithSteam('invalid-ticket')).rejects.toThrow('Invalid ticket');
    });
  });

  describe('rotateRefreshToken', () => {
    it('issues new tokens for valid refresh token', async () => {
      const { createRefreshToken } = await import('../services/token-service.js');
      const validToken = createRefreshToken({
        sub: 'user-123',
        steamId: '76561198012345678',
        role: 'user',
      });

      const result = await rotateRefreshToken(validToken);

      expect(verifyRefreshToken).toHaveBeenCalledWith('user-123', validToken);
      expect(result.user).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('throws error for invalid token signature', async () => {
      await expect(rotateRefreshToken('invalid-token')).rejects.toThrow();
    });

    it('throws error for revoked token', async () => {
      vi.mocked(verifyRefreshToken).mockResolvedValueOnce(false);

      const { createRefreshToken } = await import('../services/token-service.js');
      const token = createRefreshToken({
        sub: 'user-123',
        steamId: '76561198012345678',
        role: 'user',
      });

      await expect(rotateRefreshToken(token)).rejects.toThrow('expired or been revoked');
    });

    it('revokes tokens and throws when user not found', async () => {
      vi.mocked(findUserById).mockResolvedValueOnce(null);

      const { createRefreshToken } = await import('../services/token-service.js');
      const token = createRefreshToken({
        sub: 'deleted-user',
        steamId: '76561198012345678',
        role: 'user',
      });

      await expect(rotateRefreshToken(token)).rejects.toThrow('User not found');
      expect(revokeRefreshTokens).toHaveBeenCalledWith('deleted-user');
    });
  });
});
