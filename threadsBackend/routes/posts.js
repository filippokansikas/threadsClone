const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

// Create post
router.post('/', auth, async (req, res) => {
  try {
    const post = await Post.create({ userId: req.user.id, content: req.body.content });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [{ model: User, attributes: ['id', 'username', 'profilePicture', 'bio'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(posts);
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get posts from followed users
router.get('/following', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { include: [{ model: User, as: 'Following' }] });
    const followingIds = user.Following.map(u => u.id);
    const posts = await Post.findAll({
      where: { userId: followingIds },
      include: [{ model: User, attributes: ['id', 'username', 'profilePicture', 'bio'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like a post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    let likes = post.likes || [];
    if (likes.includes(req.user.id)) {
      likes = likes.filter(id => id !== req.user.id);
    } else {
      likes.push(req.user.id);
    }
    post.likes = likes;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this post' });
    }
    await post.destroy();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 