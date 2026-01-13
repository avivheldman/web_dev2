import { Router, Request, Response } from 'express';
import Comment from '../models/comment';
import Post from '../models/post';

const router = Router();

// GET all comments OR filter by postId (query param)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { postId } = req.query;

    if (postId) {
      // Get comments by post
      const comments = await Comment.find({ postId: postId as string });
      res.json(comments);
    } else {
      // Get all comments
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
router.post('/', async (req: Request, res: Response) => {
  try {
    const { content, sender, postId } = req.body;

    if (!content || !sender || !postId) {
      res.status(400).json({ error: 'Content, sender, and postId are required' });
      return;
    }

    // Verify the post exists
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const newComment = new Comment({
      content,
      sender,
      postId,
    });

    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// PUT update a comment by ID
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, sender } = req.body;

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { content, sender },
      { new: true, runValidators: true }
    );

    if (!updatedComment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// DELETE a comment by ID
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedComment = await Comment.findByIdAndDelete(id);

    if (!deletedComment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    res.json({ message: 'Comment deleted successfully', comment: deletedComment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
