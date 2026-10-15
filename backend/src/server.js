import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to database
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 CampusLoop API Server running on port ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🛡️  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`==================================================\n`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\nShutting down server gracefully...');
    server.close(() => {
      console.log('Server stopped.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer();
