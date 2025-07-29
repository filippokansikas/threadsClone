const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const Repost = require('../models/Repost');
const jwt = require('jsonwebtoken');
const { createNotification } = require('./notifications');
const Comment = require('../models/Comment');
const { Op } = require('sequelize');

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

// Search posts - must come before /:id routes
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const posts = await Post.findAll({
      where: {
        content: {
          [Op.like]: `%${query.trim()}%`
        }
      },
      include: [
        { model: User, attributes: ['id', 'username', 'profilePicture', 'bio'] }
      ],
      order: [['createdAt', 'DESC']],
    });

    // Add commentCount to each post
    for (const post of posts) {
      post.dataValues.commentCount = await Comment.count({ where: { postId: post.id } });
    }

    res.json(posts);
  } catch (err) {
    console.error('Search posts error:', err);
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        { model: User, attributes: ['id', 'username', 'profilePicture', 'bio'] },
        { 
          model: Repost, 
          as: 'Reposts',
          include: [{ model: User, as: 'reposter', attributes: ['id', 'username', 'profilePicture'] }]
        }
      ],
      order: [['createdAt', 'DESC']],
    });

    // Add commentCount to each post
    for (const post of posts) {
      post.dataValues.commentCount = await Comment.count({ where: { postId: post.id } });
    }

    // Also get all reposts as separate entries
    const reposts = await Repost.findAll({
      include: [
        { model: User, as: 'reposter', attributes: ['id', 'username', 'profilePicture'] },
        { 
          model: Post, 
          as: 'originalPost',
          include: [{ model: User, attributes: ['id', 'username', 'profilePicture', 'bio'] }]
        }
      ],
      order: [['createdAt', 'DESC']],
    });

    // Add commentCount to each originalPost in reposts
    for (const repost of reposts) {
      if (repost.originalPost) {
        repost.originalPost.dataValues.commentCount = await Comment.count({ where: { postId: repost.originalPost.id } });
      }
    }

    // Combine posts and reposts, marking reposts with a type
    const feedItems = [
      ...posts.map(post => ({ type: 'post', data: post })),
      ...reposts.map(repost => ({ type: 'repost', data: repost }))
    ];

    // Sort by creation time (newest first)
    feedItems.sort((a, b) => {
      const aTime = a.type === 'post' ? new Date(a.data.createdAt) : new Date(a.data.createdAt);
      const bTime = b.type === 'post' ? new Date(b.data.createdAt) : new Date(b.data.createdAt);
      return bTime - aTime;
    });

    res.json(feedItems);
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
      include: [
        { model: User, attributes: ['id', 'username', 'profilePicture', 'bio'] },
        { 
          model: Repost, 
          as: 'Reposts',
          include: [{ model: User, as: 'reposter', attributes: ['id', 'username', 'profilePicture'] }]
        }
      ],
      order: [['createdAt', 'DESC']],
    });

    // Add commentCount to each post
    for (const post of posts) {
      post.dataValues.commentCount = await Comment.count({ where: { postId: post.id } });
    }

    // Get reposts by followed users
    const reposts = await Repost.findAll({
      include: [
        { model: User, as: 'reposter', attributes: ['id', 'username', 'profilePicture'] },
        { 
          model: Post, 
          as: 'originalPost',
          include: [{ model: User, attributes: ['id', 'username', 'profilePicture', 'bio'] }]
        }
      ],
      where: {
        '$reposter.id$': followingIds
      },
      order: [['createdAt', 'DESC']],
    });

    // Add commentCount to each originalPost in reposts
    for (const repost of reposts) {
      if (repost.originalPost) {
        repost.originalPost.dataValues.commentCount = await Comment.count({ where: { postId: repost.originalPost.id } });
      }
    }

    // Combine posts and reposts, marking reposts with a type
    const feedItems = [
      ...posts.map(post => ({ type: 'post', data: post })),
      ...reposts.map(repost => ({ type: 'repost', data: repost }))
    ];

    // Sort by creation time (newest first)
    feedItems.sort((a, b) => {
      const aTime = a.type === 'post' ? new Date(a.data.createdAt) : new Date(a.data.createdAt);
      const bTime = b.type === 'post' ? new Date(b.data.createdAt) : new Date(b.data.createdAt);
      return bTime - aTime;
    });

    res.json(feedItems);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Repost a post (toggle repost)
router.post('/:id/repost', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Check if user has already reposted this post
    const existingRepost = await Repost.findOne({
      where: { reposterId: req.user.id, originalPostId: req.params.id }
    });
    
    if (existingRepost) {
      // Remove repost
      await existingRepost.destroy();
      res.json({ message: 'Repost removed', reposted: false });
    } else {
      // Create repost
      await Repost.create({
        reposterId: req.user.id,
        originalPostId: req.params.id
      });
      
      // Create notification for repost (only if not reposting own post)
      if (post.userId !== req.user.id) {
        await createNotification(post.userId, req.user.id, 'repost', post.id);
      }
      
      res.json({ message: 'Post reposted', reposted: true });
    }
  } catch (err) {
    console.error('Repost error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if user has reposted a post
router.get('/:id/repost/check', auth, async (req, res) => {
  try {
    const repost = await Repost.findOne({
      where: { reposterId: req.user.id, originalPostId: req.params.id }
    });
    res.json({ reposted: !!repost });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get repost count for a post
router.get('/:id/repost/count', async (req, res) => {
  try {
    const count = await Repost.count({
      where: { originalPostId: req.params.id }
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like a post (toggle like)
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    let likes = Array.isArray(post.likes) ? post.likes.map(String) : [];
    const userId = String(req.user.id);
    const wasLiked = likes.includes(userId);
    
    if (wasLiked) {
      likes = likes.filter(id => id !== userId);
    } else {
      likes.push(userId);
      // Create notification for like (only if not already liked)
      if (post.userId !== req.user.id) {
        await createNotification(post.userId, req.user.id, 'like', post.id);
      }
    }
    
    post.likes = likes;
    await post.save();
    res.json({ post, likesCount: likes.length, liked: likes.includes(userId) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
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

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { postId: req.params.id },
      include: [{ model: User, attributes: ['id', 'username', 'profilePicture'] }],
      order: [['createdAt', 'ASC']]
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a comment to a post
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = await Comment.create({
      content: req.body.content,
      userId: req.user.id,
      postId: req.params.id
    });
    const fullComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['id', 'username', 'profilePicture'] }]
    });
    res.status(201).json(fullComment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 