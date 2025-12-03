import { connectMongo } from '@popflash/database';

import { env } from './config/env.js';
import { createServer } from './server.js';

const start = async () => {
  try {
    await connectMongo(env.mongoUri);
    console.log('Connected to MongoDB');

    const app = createServer();

    app.listen(env.port, () => {
      console.log(`Payments service running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start payments service:', error);
    process.exit(1);
  }
};

start();
