import express from 'express';
import type { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserProfile } from '../schemas/UserProfile.js';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await UserProfile.findOne({ userId: req.userId });
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put(
  '/',
  authMiddleware,
  [
    body('academicProfile').optional().isObject(),
    body('technicalSkills').optional().isArray(),
    body('softSkills').optional().isArray(),
    body('interests').optional().isArray(),
    body('personalityInsights').optional().isString(),
    body('careerGoals').optional().isString(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const profile = await UserProfile.findOneAndUpdate(
        { userId: req.userId },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }

      res.json(profile);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;
