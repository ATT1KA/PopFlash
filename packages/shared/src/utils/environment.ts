const requiredEnvVars = [
  'POPFLASH_MONGO_URI',
  'POPFLASH_JWT_SECRET',
  'POPFLASH_STEAM_API_KEY',
  'POPFLASH_STRIPE_SECRET_KEY',
  'POPFLASH_PERSONA_API_KEY',
];

export const loadEnv = (env: NodeJS.ProcessEnv = process.env) => {
  const missing = requiredEnvVars.filter((variable) => !env[variable]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    mongoUri: env.POPFLASH_MONGO_URI!,
    jwtSecret: env.POPFLASH_JWT_SECRET!,
    steamApiKey: env.POPFLASH_STEAM_API_KEY!,
    stripeSecretKey: env.POPFLASH_STRIPE_SECRET_KEY!,
    personaApiKey: env.POPFLASH_PERSONA_API_KEY!,
  } as const;
};
