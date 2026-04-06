import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Kết nối Database
  await connectDB();

  // Khởi động Express server
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📚 Swagger API Docs available at http://localhost:${PORT}/api-docs`);
  });
};

startServer();
