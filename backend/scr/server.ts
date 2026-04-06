import app from './app';
import connectDB from './config/db';
import { env } from './config/env';

const startServer = async () => {
  // Kết nối Database
  await connectDB();

  // Khởi động Express server
  app.listen(env.port, () => {
    console.log(`🚀 Server is running on port http://localhost:${env.port}`);
    console.log(`📚 Swagger API Docs available at http://localhost:${env.port}/api-docs`);
  });
};

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
