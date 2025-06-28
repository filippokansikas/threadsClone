require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import associations to ensure all model relationships are set up
require('./models/associations');

// Routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const { router: notificationRoutes } = require('./routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);

(async () => {
  try {
    const sequelize = require('./models/sequelize');
    await sequelize.sync();
    console.log('Database synced');
  } catch (error) {
    console.error('Database sync error:', error);
  }
})();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 