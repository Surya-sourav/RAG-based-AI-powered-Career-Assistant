import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  sessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  retrievedContext?: string[];
  createdAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    retrievedContext: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for efficient querying of chats in a session
ChatSchema.index({ sessionId: 1, createdAt: 1 });

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
