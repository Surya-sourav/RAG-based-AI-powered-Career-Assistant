export interface UserProfile {
  _id: string;
  userId: string;
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
  uploadedDocuments: UploadedDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface UploadedDocument {
  filename: string;
  originalName: string;
  uploadDate: string;
  type: 'resume' | 'transcript' | 'other';
}

export interface Session {
  _id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

export interface Chat {
  _id: string;
  sessionId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  retrievedContext?: string[];
  createdAt: string;
}
