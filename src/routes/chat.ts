import express from 'express';
import type { Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { Session } from '../schemas/Session.js';
import { Chat } from '../schemas/Chat.js';
import { getEmbedding, generateResponse } from '../ai/cerebras.js';
import { queryVectors } from '../ai/pinecone.js';

const router = express.Router();

// Create new session
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title = 'New Conversation' } = req.body;
    
    const session = new Session({
      userId: req.userId,
      title,
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all sessions for user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await Session.find({ userId: req.userId })
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get session by ID with chats
router.get('/:sessionId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.userId,
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const chats = await Chat.find({ sessionId }).sort({ createdAt: 1 });

    res.json({ session, chats });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message in session (RAG-powered)
router.post('/:sessionId/chat', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const userId = req.userId!;

    // Verify session belongs to user
    const session = await Session.findOne({
      _id: sessionId,
      userId,
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Save user message
    const userChat = new Chat({
      sessionId,
      userId,
      role: 'user',
      content: message,
    });
    await userChat.save();

    // Generate embedding for the query
    const queryEmbedding = await getEmbedding(message);
    console.log(`🔍 Query embedding: dim=${queryEmbedding.length}, mag=${Math.sqrt(queryEmbedding.reduce((s,v) => s+v*v, 0)).toFixed(4)}`);

    // Retrieve relevant context from Pinecone
    const matches = await queryVectors(userId, queryEmbedding, 5);
    
    // Filter by similarity score (0.3 threshold temporarily - will increase after proper embeddings confirmed)
    const context = matches
      .filter((match) => match.score && match.score > 0.3)
      .map((match) => match.metadata?.text || '')
      .filter((text) => text.length > 0);

    console.log(`📊 RAG Stats: Found ${matches.length} matches, ${context.length} passed threshold (>0.3)`);
    if (matches.length > 0) {
      console.log(`   Top score: ${matches[0].score?.toFixed(4)}`);
      console.log(`   Context chunks retrieved: ${context.length}`);
      console.log(`   All scores: [${matches.map(m => m.score?.toFixed(4)).join(', ')}]`);
    }

    // Generate AI response
    const aiResponse = await generateResponse(message, context);

    // Save assistant message
    const assistantChat = new Chat({
      sessionId,
      userId,
      role: 'assistant',
      content: aiResponse,
      retrievedContext: context,
    });
    await assistantChat.save();

    // Update session lastMessageAt
    session.lastMessageAt = new Date();
    await session.save();

    res.json({
      userMessage: userChat,
      assistantMessage: assistantChat,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Update session title
router.patch('/:sessionId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;

    const session = await Session.findOneAndUpdate(
      { _id: sessionId, userId: req.userId },
      { title },
      { new: true }
    );

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json(session);
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete session
router.delete('/:sessionId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    // Delete all chats in session
    await Chat.deleteMany({ sessionId });

    // Delete session
    const session = await Session.findOneAndDelete({
      _id: sessionId,
      userId: req.userId,
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
