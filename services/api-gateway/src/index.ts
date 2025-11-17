import { config } from './config.js';
import { createServer } from './server.js';

const app = createServer();

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API Gateway listening on port ${config.port}`);
});
