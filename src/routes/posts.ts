import { Router, Response } from 'express';
import mongoose from 'mongoose';
import Post from '../models/post';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res: Response) => {
  try {
    const { sender } = req.query;
    if (sender) {
      const posts = await Post.find({ sender: sender as string });
      res.json(posts);
    } else {
      const posts = await Post.find();
      res.json(posts);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.get('/:id', async (req, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }
    const userId = new mongoose.Types.ObjectId(req.user!._id);
    const newPost = new Post({
      title,
      content,
      sender: userId,
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user!._id);
    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id, sender: userId },
      { title, content },
      { new: true, runValidators: true }
    );
    if (!updatedPost) {
      res.status(404).json({ error: 'Post not found or not owned by you' });
      return;
    }
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update post' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!._id);
    const deletedPost = await Post.findOneAndDelete({
      _id: req.params.id,
      sender: userId,
    });
    if (!deletedPost) {
      res.status(404).json({ error: 'Post not found or not owned by you' });
      return;
    }
    res.json(deletedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
