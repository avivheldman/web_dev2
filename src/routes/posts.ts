import { Router, Request, Response } from 'express';
import Post from '../models/post';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET all posts OR filter by sender (query param)
router.get('/', async (req: Request, res: Response) => {
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

// GET post by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// POST create a new post
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    const newPost = new Post({
      title,
      content,
      sender: req.user!._id,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PUT update a post by ID
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;

    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id, sender: req.user!._id },
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

// DELETE a post by ID
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const deletedPost = await Post.findOneAndDelete({
      _id: req.params.id,
      sender: req.user!._id,
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
