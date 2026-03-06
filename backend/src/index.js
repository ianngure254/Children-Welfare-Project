import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';


const PORT = process.env.PORT || 3000;

 const StartServer = async () => {
    try {
        // Connect to MongoDB (temporarily disabled for testing)
        try {
            await connectDB();
            console.log('✅ Database connected successfully');
        } catch (dbError) {
            console.log('⚠️ Database connection skipped (MongoDB not installed)');
            console.log('🔧 To enable: Install MongoDB and ensure it\'s running');
        }

        //start Server

        const server = app.listen(PORT, () => {
            console.log(`💯Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
            console.log(`🚀 Server running on http://localhost:${PORT}/health`);

        });

         //Graceful shutdown
         process.on('SIGTERM', () => {
            console.log('🤐SIGTERM received shuttingdown gracefully');
            server.close(() => {
                console.log('❌Process terminated');
                process.exit(0);
            });
         });

          process.on('SIGINT', () => {
      console.log('⚠️ SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Process terminated');
        process.exit(0);
      });
    });

    } catch (error) {
       console.error('❌ Database connection failed:', error.message);
    process.exit(1);  
    }
 };
 
 //unhandled promise rejection

   process.on('unhandledRejection', (error) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(error.name, error.message);
  process.exit(1);
   })
     //start the server
 StartServer();





 