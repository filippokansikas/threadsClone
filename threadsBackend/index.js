require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Op } = require('sequelize');
const { Conversation, Message, User } = require('./models/associations');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import associations to ensure all model relationships are set up
require('./models/associations');

// Routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const { router: notificationRoutes } = require('./routes/notifications');
const userRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

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

// --- SOCKET.IO SETUP ---
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  // Start or get a conversation between two users
  socket.on('start_conversation', async ({ user1Id, user2Id }, callback) => {
    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { user1Id, user2Id },
          { user1Id: user2Id, user2Id: user1Id }
        ]
      }
    });
    if (!conversation) {
      conversation = await Conversation.create({ user1Id, user2Id });
    }
    callback(conversation);
  });

  // Send a message
  socket.on('send_message', async ({ conversationId, senderId, content }) => {
    const message = await Message.create({ conversationId, senderId, content });
    const fullMessage = await Message.findByPk(message.id, {
      include: [{ model: User, attributes: ['id', 'username', 'profilePicture'] }]
    });
    io.to(`conversation_${conversationId}`).emit('receive_message', fullMessage);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

module.exports.io = io;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 