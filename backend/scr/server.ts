import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import cron from 'node-cron';
import app from './app';
import connectDB from './config/db';
import { evaluateAlertsAndNotify } from './jobs/alertChecker.job';
import { setupPriceSocket } from './realtime/price.socket';

const PORT = process.env.PORT || 5000;
const ALERT_CRON = process.env.ALERT_CRON || '*/5 * * * *';

const startServer = async () => {
  // Kết nối Database
  await connectDB();

  cron.schedule(ALERT_CRON, () => {
    evaluateAlertsAndNotify().catch((err) => console.error('Alert cron error:', err));
  });
  console.log(`⏱️  Alert checker cron: ${ALERT_CRON}`);

  const httpServer = createServer(app);
  setupPriceSocket(httpServer);
  console.log('🔌 WebSocket realtime price stream enabled');

  // Khởi động Express server
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📚 Swagger API Docs available at http://localhost:${PORT}/api-docs`);
  });
};

startServer();
