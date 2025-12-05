# Quick Start Guide - Career Assistant

## Prerequisites Check

Before starting, make sure you have:
- ✅ MongoDB installed and running (or MongoDB Atlas connection string)
- ✅ Pinecone account with API key
- ✅ Google Gemini API key

## Step-by-Step Setup

### 1. Setup API Keys

Get your API keys:
1. **MongoDB**: Local `mongodb://localhost:27017/career-assistant` or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Pinecone**: Sign up at [pinecone.io](https://www.pinecone.io/)
   - Create a new index named "career-assistant"
   - Use dimension: **768** (for Gemini embedding-001)
   - Use metric: **cosine**
3. **Gemini**: Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 2. Configure Environment Variables

Edit `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/career-assistant
JWT_SECRET=change-this-to-a-random-secret-string
GEMINI_API_KEY=your-actual-gemini-api-key
PINECONE_API_KEY=your-actual-pinecone-api-key
PINECONE_ENVIRONMENT=us-east-1-aws  # or your pinecone environment
PINECONE_INDEX_NAME=career-assistant
FRONTEND_URL=http://localhost:5173
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or on macOS
brew services start mongodb-community
```

**Option B: MongoDB Atlas**
- Use your Atlas connection string in `MONGODB_URI`

### 4. Start Backend Server

```bash
# From the root directory
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📊 Environment: development
MongoDB connected successfully
Pinecone initialized successfully
```

### 5. Start Frontend

Open a new terminal:

```bash
cd frontend/career-assistant
npm run dev
```

You should see:
```
VITE vX.X.X  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### 6. Open the Application

Navigate to http://localhost:5173 in your browser

## First Time Usage

1. **Register**: Create a new account
2. **Setup Profile**: Add your skills, interests, and career goals
3. **Upload Documents**: Upload your resume or other career documents
4. **Start Chatting**: Ask the AI about career advice!

## Example Questions to Ask

- "Can you review my skills and suggest areas for improvement?"
- "What career paths align with my interests?"
- "How can I improve my resume?"
- "What skills should I learn for a career in data science?"
- "Give me tips for my upcoming interview"

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify API keys in `.env`
- Check if port 5000 is available

### Frontend won't connect to backend
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `frontend/career-assistant/.env`

### Upload not working
- Ensure `uploads/` directory exists (created automatically)
- Check file size (max 10MB)
- Only PDF and DOCX files are supported

### AI responses not personalized
- Make sure you've uploaded documents
- Check if Pinecone index is created correctly
- Verify Gemini API key is valid

## Development Tips

### Backend Hot Reload
The backend uses `tsx watch` for hot reload. Changes will automatically restart the server.

### Frontend Hot Reload
Vite provides instant HMR (Hot Module Replacement) for React components.

### API Testing
Use tools like Postman or Thunder Client to test API endpoints:
- Base URL: `http://localhost:5000/api`
- Add token to headers: `Authorization: Bearer <token>`

## Building for Production

### Backend
```bash
npm run build
npm start
```

### Frontend
```bash
cd frontend/career-assistant
npm run build
# Deploy the dist/ folder
```

## Need Help?

- Check the main README.md for detailed documentation
- Review API endpoints in `src/routes/`
- Check database schemas in `src/schemas/`

---

Happy coding! 🚀
