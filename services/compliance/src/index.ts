import { env } from './config/env.js';
import { createServer } from './server.js';

const bootstrap = async () => {
  try {
    const app = await createServer();
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Compliance service listening on port ${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Compliance service failed to start', error);
    process.exit(1);
  }
};

void bootstrap();
