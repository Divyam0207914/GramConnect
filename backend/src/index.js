import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import app from "./app.js";
import { startPeriodicHashCheck } from "./utils/hashComparison.js";
import cron from "node-cron";
import { autoEscalateComplaints } from "./services/autoEscalation.js";

// Load environment variables
const result = dotenv.config({ path: './.env' });
console.log('Dotenv result:', result.parsed ? 'Loaded successfully' : 'Failed to load');
console.log('Environment variables:');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'MISSING');
console.log('- CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING');
console.log('- CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING');
console.log('- CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'USING DEV DEFAULT');

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  console.error('FATAL: JWT_SECRET environment variable is missing or insecure in production.');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.warn("Starting server without MongoDB connection.");
  }
  
  // Register routes after environment variables are loaded
  const { registerRoutes } = await import("./app.js");
  await registerRoutes(app);
  
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  
  // Start periodic hash checking every 30 minutes
  startPeriodicHashCheck(30);
  
  // Auto-escalate complaints every day at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running auto-escalation check...');
    const result = await autoEscalateComplaints();
    if (result.success) {
      console.log(`Auto-escalation: ${result.escalatedCount} complaints escalated`);
    } else {
      console.error('Auto-escalation failed:', result.error);
    }
  });
  
  console.log('Auto-escalation scheduler started (runs daily at 2:00 AM)');
};

startServer();