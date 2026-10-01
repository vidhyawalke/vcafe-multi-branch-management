require('dotenv').config();
const app = require('./app');
const initializeDatabase = require('./db/initDb');
const seed = require('./db/seed');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Ensure DB is initialized and seeded on boot
    await initializeDatabase();
    await seed();

    // 2. Start HTTP listener
    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`☕ VCafe Multi-Branch Management Server`);
      console.log(`🚀 Live on: http://localhost:${PORT}`);
      console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
      console.log(`👑 Demo Owner: owner@vcafe.com (admin123)`);
      console.log(`👔 Panjim Manager: manager.panjim@vcafe.com (manager123)`);
      console.log(`☕ Anjuna Staff: staff.anjuna@vcafe.com (staff123)`);
      console.log('====================================================');
    });
  } catch (err) {
    console.error('Fatal: Failed to start VCafe server:', err);
    process.exit(1);
  }
}

startServer();
