# Career Assistant - AI-Powered RAG Career Advisor

A full-stack RAG (Retrieval-Augmented Generation) based AI career assistant that helps students and professionals with personalized career guidance, resume analysis, and skill development advice.

## 🚀 Features

- **Authentication System**: Secure user registration and login
- **Profile Management**: Store academic profile, skills, interests, and career goals
- **Document Upload**: Upload and process resumes, transcripts, and other career documents
- **RAG-Powered Chat**: AI assistant that retrieves context from your documents for personalized advice
- **Session Management**: Multiple conversation sessions with context history
- **Vector Search**: Efficient similarity search using Pinecone vector database
- **Beautiful UI**: Clean, minimalistic, and professional design with smooth animations

## 🛠️ Tech Stack

### Backend
- Node.js with TypeScript
- Express.js
- MongoDB with Mongoose
- Pinecone Vector Database
- Cerebras AI (Llama 3.3 70B)
- JWT Authentication
- Multer for file uploads
- PDF & DOCX parsing

### Frontend
- React 19 with TypeScript
- Vite
- React Router v7
- Tailwind CSS
- Framer Motion (animations)
- Zustand (state management)
- Axios
- Lucide Icons

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Pinecone account and API key
- Cerebras API key

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
cd career-assistant
```

### 2. Backend Setup

```bash
# Install backend dependencies
npm install

# Configure environment variables
# Edit .env file and add your API keys:
# - MONGODB_URI
# - JWT_SECRET
# - CEREBRAS_API_KEY
# - PINECONE_API_KEY
# - PINECONE_INDEX_NAME

# Create Pinecone index (dimension: 768 for embeddings)
# Visit https://app.pinecone.io/ and create an index

# Run backend in development mode
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend/career-assistant

# Install frontend dependencies
npm install

# Run frontend in development mode
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📁 Project Structure

```
career-assistant/
├── src/                          # Backend source
│   ├── index.ts                 # Main server file
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── schemas/                 # Mongoose models
│   │   ├── User.ts
│   │   ├── UserProfile.ts
│   │   ├── Session.ts
│   │   └── Chat.ts
│   ├── routes/                  # API routes
│   │   ├── auth.ts
│   │   ├── profile.ts
│   │   ├── documents.ts
│   │   └── chat.ts
│   ├── middleware/              # Express middleware
│   │   ├── auth.ts
│   │   └── upload.ts
   └── ai/                      # AI & RAG logic
       ├── cerebras.ts          # Cerebras AI integration
       ├── pinecone.ts         # Vector database
       └── documentProcessor.ts # Document parsing & chunking
├── frontend/career-assistant/   # Frontend source
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── store/              # Zustand stores
│   │   ├── lib/                # API client
│   │   ├── types/              # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   └── index.html
├── uploads/                     # Uploaded documents (gitignored)
├── .env                        # Environment variables
├── package.json
└── README.md
```

## 🔑 Environment Variables

### Backend (.env in root)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/career-assistant
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CEREBRAS_API_KEY=your-cerebras-api-key-here
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_ENVIRONMENT=your-pinecone-environment
PINECONE_INDEX_NAME=career-assistant
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env in frontend/career-assistant)

```env
VITE_API_URL=http://localhost:5000/api
```

## 📊 Database Schema

### One-to-Many Relationships

```
User (1) ──────> (Many) Sessions
Session (1) ────> (Many) Chats
User (1) ──────> (1) UserProfile
```

### Vector DB Structure

Each document chunk stored in Pinecone includes:
- Vector embedding (768 dimensions)
- Metadata:
  - userId (for filtering)
  - text content
  - document type
  - chunk index

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get all documents
- `DELETE /api/documents/:filename` - Delete document

### Chat
- `POST /api/chat` - Create new session
- `GET /api/chat` - Get all sessions
- `GET /api/chat/:sessionId` - Get session with chats
- `POST /api/chat/:sessionId/chat` - Send message (RAG-powered)
- `PATCH /api/chat/:sessionId` - Update session title
- `DELETE /api/chat/:sessionId` - Delete session

## 🚀 Deployment

### Backend Deployment (e.g., Render, Railway)

1. Set environment variables
2. Build: `npm run build`
3. Start: `npm start`

### Frontend Deployment (e.g., Vercel, Netlify)

1. Build: `npm run build`
2. Deploy the `dist` folder
3. Set `VITE_API_URL` to your backend URL

## 🤝 How It Works

1. **User Registration**: User creates account and profile
2. **Document Upload**: User uploads resume/documents
3. **Document Processing**: 
   - Documents are parsed (PDF/DOCX)
   - Text is chunked into smaller pieces
   - Each chunk is embedded using Gemini
   - Embeddings stored in Pinecone with userId
4. **Chat Interaction**:
   - User asks a question
   - Question is embedded
   - Similar chunks retrieved from Pinecone (filtered by userId)
   - Retrieved context + question sent to Gemini
   - AI generates personalized response
5. **Session Management**: All chats saved per session

## 🎨 UI/UX Features

- Gradient backgrounds
- Smooth animations with Framer Motion
- Responsive design (mobile-friendly)
- Loading states
- Toast notifications
- Clean, minimalistic design
- Professional color scheme

## 📝 License

MIT

## 👨‍💻 Author

Built with ❤️ for helping students and professionals in their career journey.

## 🐛 Known Issues & Future Improvements

- Add real-time chat with WebSockets
- Implement chat history export
- Add more AI models support
- Implement user feedback mechanism
- Add advanced search and filters
- Multi-language support
