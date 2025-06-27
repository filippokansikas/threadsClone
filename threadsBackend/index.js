require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./models/sequelize');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Placeholder route
app.get('/', (req, res) => {
  res.send('ThreadsClone backend is running');
});

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

(async () => {
  try {
    await sequelize.sync();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to sync database:', err);
  }
})(); 