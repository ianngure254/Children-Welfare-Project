import mongoose from 'mongoose';

const connectDB = async () => {
    try {
  
    const conn = await mongoose.connect(process.env.MONGODB_URI, {

    });
     console.log(`MongoDB Connected: ${conn.connection.host}`);
          
         //handles connection events
          mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
         //Graceful Shutdown
       const graceFulShutdown= async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    };

    process.on('SIGINT', graceFulShutdown);
    process.on('SIGTERM', graceFulShutdown);
    
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        throw error;
    }
};

export default connectDB;