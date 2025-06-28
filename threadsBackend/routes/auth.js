const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');
const { createNotification } = require('./notifications');

const router = express.Router();

// Middleware to verify JWT
function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, profilePicture, bio } = req.body;
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword, profilePicture, bio });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow a user
router.post('/follow/:id', auth, async (req, res) => {
  try {
    const userToFollow = await User.findByPk(req.params.id);
    if (!userToFollow) return res.status(404).json({ message: 'User not found' });
    if (userToFollow.id === req.user.id) return res.status(400).json({ message: 'Cannot follow yourself' });
    
    const currentUser = await User.findByPk(req.user.id);
    const isFollowing = await currentUser.hasFollowing(userToFollow);
    
    if (isFollowing) {
      await currentUser.removeFollowing(userToFollow);
    } else {
      await currentUser.addFollowing(userToFollow);
      // Create notification for follow
      await createNotification(userToFollow.id, req.user.id, 'follow');
    }
    
    res.json({ message: isFollowing ? 'Unfollowed' : 'Followed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Unfollow a user
router.post('/unfollow/:id', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    const toUnfollow = await User.findByPk(req.params.id);
    if (!user || !toUnfollow) return res.status(404).json({ message: 'User not found' });
    await user.removeFollowing(toUnfollow);
    res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get following list
router.get('/following', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { include: [{ model: User, as: 'Following' }] });
    res.json(user.Following);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get followers list
router.get('/followers', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { include: [{ model: User, as: 'Followers' }] });
    res.json(user.Followers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 