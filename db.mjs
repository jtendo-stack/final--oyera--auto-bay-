import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/oyeraAuto';
  try {
    // Recommended options are defaults in modern mongoose, but kept explicit for clarity
    await mongoose.connect(uri, { connectTimeoutMS: 10000 });
    console.log('✅ MongoDB Connected:', uri);
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed to', uri, '-', error.message || error);
    return false;
  }
};

export default connectDB;