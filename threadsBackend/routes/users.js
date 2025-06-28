const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { User } = require('../models/associations');
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { Op } = require('sequelize');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Update user profile
router.put('/profile', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, bio, currentPassword, newPassword } = req.body;

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password' });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    // Update profile picture if uploaded
    let profilePictureUrl = user.profilePicture;
    if (req.file) {
      // Delete old profile picture if it exists and is not the default
      if (user.profilePicture && !user.profilePicture.includes('pravatar.cc')) {
        // Extract filename from full URL or relative path
        const filename = user.profilePicture.includes('/uploads/') 
          ? path.basename(user.profilePicture.split('/uploads/')[1])
          : path.basename(user.profilePicture);
        const oldPicturePath = path.join(__dirname, '../uploads', filename);
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
        }
      }
      
      // Set new profile picture URL (relative path for proxy)
      profilePictureUrl = `/uploads/${req.file.filename}`;
      user.profilePicture = profilePictureUrl;
    }

    // Update other fields
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;

    // Save the updated user
    await user.save();

    // Return updated user data (without password)
    const updatedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
      profilePicture: profilePictureUrl
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all conversations for the logged-in user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: [
        { model: User, as: 'user1', attributes: ['id', 'username', 'profilePicture'] },
        { model: User, as: 'user2', attributes: ['id', 'username', 'profilePicture'] }
      ],
      order: [['updatedAt', 'DESC']]
    });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    // Check if user is part of the conversation
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const messages = await Message.findAll({
      where: { conversationId },
      include: [{ model: User, attributes: ['id', 'username', 'profilePicture'] }],
      order: [['createdAt', 'ASC']]
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Mark messages as read in a conversation
router.put('/conversations/:conversationId/read', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    // Check if user is part of the conversation
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Update conversation's updatedAt to mark as read
    await conversation.update({ updatedAt: new Date() });
    
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
});

// Get unread message count for all conversations
router.get('/conversations/unread/count', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: [
        { model: User, as: 'user1', attributes: ['id', 'username', 'profilePicture'] },
        { model: User, as: 'user2', attributes: ['id', 'username', 'profilePicture'] }
      ],
      order: [['updatedAt', 'DESC']]
    });
    
    let unreadCount = 0;
    for (const conversation of conversations) {
      const messages = await Message.findAll({
        where: { conversationId: conversation.id },
        order: [['createdAt', 'DESC']],
        limit: 1
      });
      
      if (messages.length > 0) {
        const lastMessage = messages[0];
        // If the last message is from another user and is newer than the conversation's updatedAt
        if (lastMessage.senderId !== userId && lastMessage.createdAt > conversation.updatedAt) {
          unreadCount++;
        }
      }
    }
    
    res.json({ unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get unread count' });
  }
});

module.exports = router; 