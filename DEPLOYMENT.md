# Deployment Guide - Career Assistant

## Overview
This guide covers deploying the Career Assistant application to production environments.

## Prerequisites

- Domain name (optional but recommended)
- Cloud hosting accounts (suggestions below)
- API keys configured

## Backend Deployment Options

### Option 1: Render (Recommended - Free tier available)

1. **Prepare for Deployment**
   ```bash
   # Ensure your package.json has these scripts:
   "scripts": {
     "build": "tsc",
     "start": "node dist/index.js"
   }
   ```

2. **Deploy to Render**
   - Create account at [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Environment**: Node
   
3. **Add Environment Variables**
   - Go to Environment section
   - Add all variables from `.env`:
     - MONGODB_URI (use MongoDB Atlas)
     - JWT_SECRET
     - GEMINI_API_KEY
     - PINECONE_API_KEY
     - PINECONE_ENVIRONMENT
     - PINECONE_INDEX_NAME
     - FRONTEND_URL (your frontend URL)
     - NODE_ENV=production

### Option 2: Railway

1. **Deploy**
   - Visit [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository

2. **Configuration**
   - Railway auto-detects Node.js
   - Add environment variables in Settings
   - Set `RAILWAY_HEALTHCHECK_TIMEOUT=300` if needed

### Option 3: Heroku

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set GEMINI_API_KEY=your-key
# ... (set all env vars)

# Deploy
git push heroku main
```

## Frontend Deployment Options

### Option 1: Vercel (Recommended)

1. **Prepare**
   ```bash
   cd frontend/career-assistant
   
   # Update .env with production API URL
   echo "VITE_API_URL=https://your-backend-url.com/api" > .env.production
   ```

2. **Deploy**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: frontend/career-assistant
     - **Build Command**: `npm run build`
     - **Output Directory**: dist
   
3. **Environment Variables**
   - Add `VITE_API_URL` with your backend URL

### Option 2: Netlify

1. **Build Settings**
   - Base directory: `frontend/career-assistant`
   - Build command: `npm run build`
   - Publish directory: `frontend/career-assistant/dist`

2. **Deploy**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   cd frontend/career-assistant
   netlify deploy --prod
   ```

### Option 3: GitHub Pages

```bash
# Add to vite.config.ts
export default defineConfig({
  base: '/career-assistant/',
  // ... other config
})

# Build
npm run build

# Deploy using gh-pages
npm install -g gh-pages
gh-pages -d dist
```

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
   - Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create free M0 cluster
   - Create database user
   - Whitelist IP (0.0.0.0/0 for production)

2. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Use in `MONGODB_URI`

## Pinecone Setup

1. **Create Index**
   - Visit [app.pinecone.io](https://app.pinecone.io)
   - Click "Create Index"
   - Name: `career-assistant`
   - Dimensions: **768**
   - Metric: **cosine**
   - Pod Type: Starter (free tier)

2. **Get API Key**
   - Go to API Keys section
   - Copy your API key
   - Note your environment (e.g., `us-east-1-aws`)

## Google Gemini API

1. **Get API Key**
   - Visit [makersuite.google.com](https://makersuite.google.com/app/apikey)
   - Create API key
   - Copy for use in environment variables

## Production Checklist

### Security
- [ ] Change JWT_SECRET to strong random string
- [ ] Use HTTPS for all endpoints
- [ ] Enable CORS only for your frontend domain
- [ ] Set secure HTTP headers
- [ ] Rate limiting on API endpoints
- [ ] Input validation on all endpoints

### Performance
- [ ] Enable MongoDB indexes
- [ ] Use CDN for static assets
- [ ] Enable gzip compression
- [ ] Optimize images
- [ ] Implement caching where appropriate

### Monitoring
- [ ] Set up error logging (e.g., Sentry)
- [ ] Monitor API response times
- [ ] Track database performance
- [ ] Monitor API usage and costs

### Backup
- [ ] Enable MongoDB automatic backups
- [ ] Backup environment variables
- [ ] Document deployment process

## Environment Variables Summary

### Backend (Production)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/career-assistant
JWT_SECRET=your-super-secure-random-string-min-32-chars
GEMINI_API_KEY=your-gemini-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=career-assistant
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (Production)
```env
VITE_API_URL=https://your-backend-domain.com/api
```

## Custom Domain Setup

### Backend (Render/Railway)
1. Add custom domain in platform settings
2. Update DNS records (A or CNAME)
3. Wait for SSL certificate provisioning

### Frontend (Vercel/Netlify)
1. Go to Domain settings
2. Add your domain
3. Update DNS records as instructed
4. SSL is automatic

## Post-Deployment Testing

1. **Test Registration**
   ```bash
   curl -X POST https://your-backend.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","password":"test123"}'
   ```

2. **Test Login**
   ```bash
   curl -X POST https://your-backend.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

3. **Test Frontend**
   - Open your frontend URL
   - Register new account
   - Upload document
   - Send chat message
   - Verify all features work

## Troubleshooting

### Backend won't start
- Check logs for errors
- Verify all environment variables are set
- Check MongoDB connection
- Verify Pinecone API key is valid

### Frontend can't connect to backend
- Check CORS settings
- Verify VITE_API_URL is correct
- Check if backend is running
- Verify SSL certificates

### File uploads failing
- Check backend has write permissions
- Verify file size limits
- Check Multer configuration

### AI responses not working
- Verify Gemini API key
- Check Pinecone connection
- Verify documents were uploaded successfully
- Check embedding dimensions match (768)

## Scaling Considerations

### When to scale
- More than 100 concurrent users
- Database queries getting slow
- High API response times

### How to scale
- **Backend**: Use load balancer, multiple instances
- **Database**: Upgrade MongoDB Atlas tier
- **Pinecone**: Upgrade to paid tier for better performance
- **Frontend**: Already scaled via CDN

## Cost Estimates (Monthly)

### Free Tier (Development)
- MongoDB Atlas: $0 (M0)
- Pinecone: $0 (Starter)
- Gemini API: $0 (generous free tier)
- Render: $0 (free web service)
- Vercel: $0 (hobby plan)
**Total: $0/month**

### Production (Small Scale)
- MongoDB Atlas: $0-$9 (M0 or M2)
- Pinecone: $70 (Standard)
- Gemini API: $0-$50 (pay per use)
- Render: $7 (basic plan)
- Vercel: $0 (hobby) or $20 (pro)
**Total: ~$77-$156/month**

## Maintenance

### Regular Tasks
- Monitor error logs weekly
- Check API usage and costs
- Update dependencies monthly
- Backup database regularly
- Review security advisories

### Updates
```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Rebuild and test
npm run build
npm test
```

## Support & Resources

- MongoDB Atlas: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- Pinecone: [docs.pinecone.io](https://docs.pinecone.io)
- Gemini API: [ai.google.dev/docs](https://ai.google.dev/docs)
- Render: [render.com/docs](https://render.com/docs)
- Vercel: [vercel.com/docs](https://vercel.com/docs)

---

Good luck with your deployment! 🚀
