import { Router, Request, Response } from 'express';
import Post from '../models/post';

const router = Router();

// GET all posts OR filter by sender (query param)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { sender } = req.query;

    if (sender) {
      // Get posts by sender
      const posts = await Post.find({ sender: sender as string });
      res.json(posts);
    } else {
      // Get all posts
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
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, content, sender } = req.body;

    if (!title || !content || !sender) {
      res.status(400).json({ error: 'Title, content, and sender are required' });
      return;
    }

    const newPost = new Post({
      title,
      content,
      sender,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PUT update a post by ID
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, sender } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { title, content, sender },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update post' });
  }
});

export default router;
