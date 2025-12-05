# API Testing Guide - Career Assistant

Test the API endpoints using curl, Postman, or Thunder Client.

## Base URL
```
Local: http://localhost:5000/api
Production: https://your-backend-url.com/api
```

## 1. Authentication Endpoints

### Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "673abc...",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:** Same as register

---

## 2. Profile Endpoints

**Note:** All profile endpoints require authentication. Add the token to headers.

### Get Profile
```bash
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "_id": "673...",
  "userId": "672...",
  "technicalSkills": ["Python", "JavaScript"],
  "softSkills": ["Communication", "Leadership"],
  "interests": ["AI", "Data Science"],
  "careerGoals": "Become a data scientist...",
  "personalityInsights": "Detail-oriented...",
  "uploadedDocuments": [],
  "createdAt": "2024-12-05T...",
  "updatedAt": "2024-12-05T..."
}
```

### Update Profile
```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "technicalSkills": ["Python", "JavaScript", "React"],
    "softSkills": ["Communication", "Problem-solving"],
    "interests": ["AI", "Machine Learning"],
    "careerGoals": "I want to become a senior software engineer",
    "personalityInsights": "I am detail-oriented and enjoy collaborative work",
    "academicProfile": {
      "institution": "University of Example",
      "degree": "BS Computer Science",
      "major": "Computer Science",
      "graduationYear": 2024,
      "gpa": 3.8
    }
  }'
```

---

## 3. Document Endpoints

### Upload Document
```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "document=@/path/to/your/resume.pdf" \
  -F "type=resume"
```

**Response:**
```json
{
  "message": "Document uploaded and processed successfully",
  "document": {
    "filename": "uuid-filename.pdf",
    "originalName": "resume.pdf",
    "type": "resume"
  }
}
```

### Get All Documents
```bash
curl -X GET http://localhost:5000/api/documents \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "documents": [
    {
      "filename": "uuid-filename.pdf",
      "originalName": "resume.pdf",
      "uploadDate": "2024-12-05T...",
      "type": "resume"
    }
  ]
}
```

### Delete Document
```bash
curl -X DELETE http://localhost:5000/api/documents/uuid-filename.pdf \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "message": "Document deleted successfully"
}
```

---

## 4. Chat Endpoints

### Create New Session
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Career Advice Session"
  }'
```

**Response:**
```json
{
  "_id": "673...",
  "userId": "672...",
  "title": "Career Advice Session",
  "createdAt": "2024-12-05T...",
  "updatedAt": "2024-12-05T...",
  "lastMessageAt": "2024-12-05T..."
}
```

### Get All Sessions
```bash
curl -X GET http://localhost:5000/api/chat \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
[
  {
    "_id": "673...",
    "userId": "672...",
    "title": "Career Advice Session",
    "createdAt": "2024-12-05T...",
    "updatedAt": "2024-12-05T...",
    "lastMessageAt": "2024-12-05T..."
  }
]
```

### Get Session with Chats
```bash
curl -X GET http://localhost:5000/api/chat/SESSION_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "session": {
    "_id": "673...",
    "userId": "672...",
    "title": "Career Advice Session",
    "createdAt": "2024-12-05T...",
    "updatedAt": "2024-12-05T...",
    "lastMessageAt": "2024-12-05T..."
  },
  "chats": [
    {
      "_id": "674...",
      "sessionId": "673...",
      "userId": "672...",
      "role": "user",
      "content": "How can I improve my resume?",
      "createdAt": "2024-12-05T..."
    },
    {
      "_id": "675...",
      "sessionId": "673...",
      "userId": "672...",
      "role": "assistant",
      "content": "Based on your profile...",
      "retrievedContext": ["...context from documents..."],
      "createdAt": "2024-12-05T..."
    }
  ]
}
```

### Send Message (RAG-Powered)
```bash
curl -X POST http://localhost:5000/api/chat/SESSION_ID/chat \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What skills should I focus on developing?"
  }'
```

**Response:**
```json
{
  "userMessage": {
    "_id": "674...",
    "sessionId": "673...",
    "userId": "672...",
    "role": "user",
    "content": "What skills should I focus on developing?",
    "createdAt": "2024-12-05T..."
  },
  "assistantMessage": {
    "_id": "675...",
    "sessionId": "673...",
    "userId": "672...",
    "role": "assistant",
    "content": "Based on your current skills and career goals, I recommend...",
    "retrievedContext": [
      "...relevant context from your documents..."
    ],
    "createdAt": "2024-12-05T..."
  }
}
```

### Update Session Title
```bash
curl -X PATCH http://localhost:5000/api/chat/SESSION_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Session Title"
  }'
```

### Delete Session
```bash
curl -X DELETE http://localhost:5000/api/chat/SESSION_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "message": "Session deleted successfully"
}
```

---

## 5. Health Check

### Check API Status
```bash
curl -X GET http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Career Assistant API is running"
}
```

---

## Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "Career Assistant API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {"raw": "{{baseUrl}}/auth/register"}
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"john@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {"raw": "{{baseUrl}}/auth/login"}
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```
or
```json
{
  "error": "Invalid token"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Server error"
}
```

---

## Testing Workflow

1. **Register** → Get token
2. **Login** → Get token (if needed)
3. **Update Profile** → Add skills and goals
4. **Upload Document** → Upload resume/CV
5. **Create Session** → Start chat session
6. **Send Messages** → Test RAG functionality
7. **Get Sessions** → Verify history

---

## Tips

- Save the token from login/register response
- Use the token in all subsequent requests
- Replace `YOUR_TOKEN_HERE` and `SESSION_ID` with actual values
- For file uploads, use `multipart/form-data`
- Check backend logs for detailed error messages

---

Happy testing! 🧪
