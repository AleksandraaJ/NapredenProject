require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const habitsRouter = require('./routes/habits');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/habits', habitsRouter);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.json({ status: 'ok', database: 'disconnected' });
  }
});

// Serve frontend statically
app.use(express.static(path.join(__dirname, '../client')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Database connection and server start
const startServer = async () => {
  try {
    // Wait for database to be ready (useful in Docker)
    let retries = 10;
    while (retries > 0) {
      try {
        await sequelize.authenticate();
        console.log('✔ Поврзано со MySQL база / Connected to MySQL database');
        break;
      } catch (err) {
        retries--;
        console.log(`⏳ Чекање на базата... (обиди: ${retries}) / Waiting for database... (retries: ${retries})`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Sync database tables
    await sequelize.sync({ alter: true });
    console.log('✔ Табелите се синхронизирани / Tables synchronized');

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✔ Серверот работи на http://localhost:${PORT}`);
      console.log(`✔ Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Грешка при стартување / Startup error:', error);
    process.exit(1);
  }
};

startServer();
