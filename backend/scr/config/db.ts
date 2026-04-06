import mongoose from 'mongoose';
import { env } from './env';

const connectDB = async () => {
  if (!env.mongoUri) {
    console.error('❌ MONGODB_URI is not defined in the environment variables (.env).');
    process.exit(1);
  }

  try {
    await mongoose.connect(env.mongoUri);
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1); // Dừng app nếu không kết nối được DB
  }
};

export default connectDB;
