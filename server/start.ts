import 'dotenv/config';
import { createServer } from './index.js';
import connectDb, { getMongoUrl } from './db.js';

async function start() {
  const mongoUrl = getMongoUrl();
  await connectDb(mongoUrl);
  const app = createServer();
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
