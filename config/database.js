import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    
    const mongoURI = process.env.MONGODB_URI;
    console.log('MongoDB URI present:', !!mongoURI);
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    // Remove deprecated options
    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log('🚀 Database connection ready!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error Message:', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

export default connectDB;