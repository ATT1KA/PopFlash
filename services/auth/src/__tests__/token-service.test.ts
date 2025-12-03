import { sign, verify } from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/env.js', () => ({
  env: {
    jwtSecret: 'test-jwt-secret-minimum-32-characters-here',
    jwtRefreshSecret: 'test-refresh-secret-minimum-32-chars',
    jwtExpirationMinutes: 15,
    refreshExpirationDays: 30,
  },
}));

const { createAccessToken, createRefreshToken, verifyRefreshTokenSignature } = await import(
  '../services/token-service.js'
);

describe('token-service', () => {
  const mockPayload = {
    sub: 'user-123',
    steamId: '76561198012345678',
    role: 'user',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAccessToken', () => {
    it('creates a valid JWT access token', () => {
      const token = createAccessToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('includes payload data in the token', () => {
      const token = createAccessToken(mockPayload);
      const decoded = verify(token, 'test-jwt-secret-minimum-32-characters-here') as typeof mockPayload;

      expect(decoded.sub).toBe(mockPayload.sub);
      expect(decoded.steamId).toBe(mockPayload.steamId);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it('sets expiration time', () => {
      const token = createAccessToken(mockPayload);
      const decoded = verify(token, 'test-jwt-secret-minimum-32-characters-here') as { exp: number };

      expect(decoded.exp).toBeDefined();
      const expectedExp = Math.floor(Date.now() / 1000) + 15 * 60;
      expect(decoded.exp).toBeCloseTo(expectedExp, -1);
    });
  });

  describe('createRefreshToken', () => {
    it('creates a valid JWT refresh token', () => {
      const token = createRefreshToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('includes a unique jti claim', () => {
      const token1 = createRefreshToken(mockPayload);
      const token2 = createRefreshToken(mockPayload);

      const decoded1 = verify(token1, 'test-refresh-secret-minimum-32-chars') as { jti: string };
      const decoded2 = verify(token2, 'test-refresh-secret-minimum-32-chars') as { jti: string };

      expect(decoded1.jti).toBeDefined();
      expect(decoded2.jti).toBeDefined();
      expect(decoded1.jti).not.toBe(decoded2.jti);
    });

    it('sets longer expiration than access token', () => {
      const token = createRefreshToken(mockPayload);
      const decoded = verify(token, 'test-refresh-secret-minimum-32-chars') as { exp: number };

      const expectedExp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
      expect(decoded.exp).toBeCloseTo(expectedExp, -2);
    });
  });

  describe('verifyRefreshTokenSignature', () => {
    it('verifies and decodes a valid refresh token', () => {
      const token = createRefreshToken(mockPayload);
      const decoded = verifyRefreshTokenSignature(token);

      expect(decoded.sub).toBe(mockPayload.sub);
      expect(decoded.steamId).toBe(mockPayload.steamId);
      expect(decoded.role).toBe(mockPayload.role);
      expect(decoded.jti).toBeDefined();
    });

    it('throws error for invalid token signature', () => {
      const invalidToken = sign(mockPayload, 'wrong-secret');

      expect(() => verifyRefreshTokenSignature(invalidToken)).toThrow();
    });

    it('throws error for expired token', () => {
      const expiredToken = sign(
        { ...mockPayload, jti: 'test-jti' },
        'test-refresh-secret-minimum-32-chars',
        { expiresIn: '-1s' }
      );

      expect(() => verifyRefreshTokenSignature(expiredToken)).toThrow();
    });

    it('throws error for malformed token', () => {
      expect(() => verifyRefreshTokenSignature('invalid-token')).toThrow();
    });
  });
});
