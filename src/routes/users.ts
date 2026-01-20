import { Router, Response } from 'express';
import User from '../models/user';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET all users (protected)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password -refreshTokens');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET user by ID (protected)
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password -refreshTokens');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT update user by ID (protected - only own profile)
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;

    // Users can only update their own profile
    if (req.user?._id !== id) {
      res.status(403).json({ error: 'You can only update your own profile' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE user by ID (protected - only own profile)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Users can only delete their own profile
    if (req.user?._id !== id) {
      res.status(403).json({ error: 'You can only delete your own profile' });
      return;
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
