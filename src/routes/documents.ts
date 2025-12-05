import express from 'express';
import type { Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { processDocument } from '../ai/documentProcessor.js';
import { UserProfile } from '../schemas/UserProfile.js';
import fs from 'fs/promises';

const router = express.Router();

// Upload document
router.post(
  '/upload',
  authMiddleware,
  upload.single('document'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const { type = 'other' } = req.body;
      const userId = req.userId!;

      // Process document and store in vector DB
      await processDocument(userId, req.file.path, req.file.mimetype, {
        documentType: type,
        filename: req.file.originalname,
      });

      // Update user profile
      const profile = await UserProfile.findOneAndUpdate(
        { userId },
        {
          $push: {
            uploadedDocuments: {
              filename: req.file.filename,
              originalName: req.file.originalname,
              uploadDate: new Date(),
              type,
            },
          },
        },
        { new: true }
      );

      res.json({
        message: 'Document uploaded and processed successfully',
        document: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          type,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to process document' });
    }
  }
);

// Get uploaded documents
router.get(
  '/',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const profile = await UserProfile.findOne({ userId: req.userId });
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }

      res.json({ documents: profile.uploadedDocuments });
    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete document
router.delete(
  '/:filename',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { filename } = req.params;
      const userId = req.userId!;

      // Remove from profile
      await UserProfile.findOneAndUpdate(
        { userId },
        {
          $pull: {
            uploadedDocuments: { filename },
          },
        }
      );

      // Delete file
      try {
        await fs.unlink(`uploads/${filename}`);
      } catch (error) {
        console.log('File not found on disk, but removed from database');
      }

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;
