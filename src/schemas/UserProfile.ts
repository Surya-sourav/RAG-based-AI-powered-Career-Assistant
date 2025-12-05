import mongoose, { Document, Schema } from 'mongoose';

export interface IUserProfile extends Document {
  userId: mongoose.Types.ObjectId;
  academicProfile?: {
    institution?: string;
    degree?: string;
    major?: string;
    graduationYear?: number;
    gpa?: number;
  };
  technicalSkills: string[];
  softSkills: string[];
  interests: string[];
  personalityInsights?: string;
  careerGoals?: string;
  uploadedDocuments: {
    filename: string;
    originalName: string;
    uploadDate: Date;
    type: 'resume' | 'transcript' | 'other';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    academicProfile: {
      institution: String,
      degree: String,
      major: String,
      graduationYear: Number,
      gpa: Number,
    },
    technicalSkills: {
      type: [String],
      default: [],
    },
    softSkills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    personalityInsights: String,
    careerGoals: String,
    uploadedDocuments: [
      {
        filename: String,
        originalName: String,
        uploadDate: { type: Date, default: Date.now },
        type: {
          type: String,
          enum: ['resume', 'transcript', 'other'],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const UserProfile = mongoose.model<IUserProfile>(
  'UserProfile',
  UserProfileSchema
);
