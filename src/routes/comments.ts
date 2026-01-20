import { Router, Request, Response } from 'express';
import Comment from '../models/comment';
import Post from '../models/post';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET all comments OR filter by postId (query param)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { postId } = req.query;

    if (postId) {
      const comments = await Comment.find({ postId: postId as string });
      res.json(comments);
    } else {
      const comments = await Comment.find();
      res.json(comments);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// GET comment by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comment' });
  }
});

// POST create a new comment
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { content, postId } = req.body;

    if (!content || !postId) {
      res.status(400).json({ error: 'Content and postId are required' });
      return;
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const newComment = new Comment({
      content,
      sender: req.user!._id,
      postId,
    });

    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// PUT update a comment by ID
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;

    const updatedComment = await Comment.findOneAndUpdate(
      { _id: req.params.id, sender: req.user!._id },
      { content },
      { new: true, runValidators: true }
    );

    if (!updatedComment) {
      res.status(404).json({ error: 'Comment not found or not owned by you' });
      return;
    }

    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// DELETE a comment by ID
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const deletedComment = await Comment.findOneAndDelete({
      _id: req.params.id,
      sender: req.user!._id,
    });

    if (!deletedComment) {
      res.status(404).json({ error: 'Comment not found or not owned by you' });
      return;
    }

    res.json({ message: 'Comment deleted successfully', comment: deletedComment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
