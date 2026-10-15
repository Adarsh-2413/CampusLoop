import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('\n================================================================');
    console.warn('⚠️  MONGODB_URI is not set in backend/.env');
    console.warn('   The backend server will run in offline/memory mode for health check.');
    console.warn('   To enable persistent database features, create backend/.env and');
    console.warn('   add your MongoDB Atlas connection string:');
    console.warn('   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/campusloop');
    console.warn('================================================================\n');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
};
