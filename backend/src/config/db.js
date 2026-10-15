import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_MONGODB_URI = 'mongodb+srv://adarshsug24_db_user:VGJhR7pBOfN72zmI@cluster0.rih7zcu.mongodb.net/campusloop?retryWrites=true&w=majority';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    return null;
  }
};

