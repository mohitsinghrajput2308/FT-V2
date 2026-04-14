# 🚀 FinTrack Development Startup Guide

## Quick Start

```bash
cd landing-page
npm install                    # Install dependencies (first time only)
npm run dev                    # Start both API server and React dev server
```

The app will be available at: **http://localhost:3000**

---

## 📋 What Gets Started

When you run `npm run dev`, it automatically starts two servers:

1. **React Dev Server** (port 3000)
   - Main frontend application
   - Hot module reloading (HMR)
   - Available at: http://localhost:3000

2. **API Server** (port 3001)
   - AI Chat API endpoint
   - Health check endpoint
   - Available at: http://localhost:3001/api/chat

---

## ✅ Health Check

After starting `npm run dev`, verify both servers are running:

```bash
# Check React dev server
curl http://localhost:3000

# Check API server
curl http://localhost:3001/health
# Expected response: { "status": "ok", "message": "API server is running" }
```

---

## 🔧 Port Configuration

### Change Port Numbers

If ports 3000 or 3001 are already in use, override them:

```bash
# Change API server port
SERVER_PORT=4001 npm run dev

# Change React dev server port
PORT=4000 npm run dev

# Both
PORT=4000 SERVER_PORT=4001 npm run dev
```

### Find & Kill Running Processes

**Linux/Mac:**
```bash
# Find process on port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

**Windows (PowerShell):**
```bash
# Find process on port 3000
netstat -ano | findstr :3000

# Kill it
taskkill /PID <PID> /F
```

---

## 🐛 Common Issues & Solutions

### Issue: "ERR_CONNECTION_REFUSED" on Resources

**Problem:** Images and assets fail to load with `net::ERR_CONNECTION_REFUSED`

**Solutions:**
1. **Ensure dev server is running:**
   ```bash
   npm run dev
   ```

2. **Check if port 3000 is already in use:**
   ```bash
   # On Windows:
   netstat -ano | findstr :3000
   # On Mac/Linux:
   lsof -i :3000
   ```

3. **Kill other processes and restart:**
   ```bash
   # Windows:
   taskkill /PID <PID> /F
   
   # Then restart:
   npm run dev
   ```

### Issue: WebSocket Connection Errors

**Problem:** Console shows `WebSocket connection to 'ws://localhost:3000/ws' failed`

**Solution:** This is normal during development (React DevTools extension).  ✓ Not an error - safe to ignore.

### Issue: "Port Already in Use"

**Problem:** "EADDRINUSE: address already in use :::3001"

**Solution:**

```bash
# Option 1: Use a different port
SERVER_PORT=4001 npm run dev

# Option 2: Kill the existing process
# Windows:
taskkill /PID <PID> /F

# Mac/Linux:
kill -9 <PID>
```

### Issue: API Key Not Configured

**Problem:** Chat feature doesn't work, console says "GROQ_API_KEY not configured"

**Solution:**
1. Create `.env.local` in `landing-page/` directory:
   ```bash
   cd landing-page
   echo "GROQ_API_KEY=your_groq_key_here" > .env.local
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

---

## 🌐 Environment Variables

Create `.env.local` in the `landing-page/` directory:

```env
# AI Chat API (Groq)
GROQ_API_KEY=your_groq_api_key_here

# Supabase (usually auto-detected from code)
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_KEY=your_supabase_key

# Optional: Override ports
# SERVER_PORT=4001
# PORT=4000
```

---

## 📊 Console Logs to Expect

**Should see:**
```
✓ Starting both servers...
🚀 API Server starting...
✓ GROQ_API_KEY configured: true
✅ FinTrack API Server Ready
   📡 Chat API:  http://localhost:3001/api/chat
   🏥 Health:    http://localhost:3001/health
   🚀 React Dev Server should start on port 3000
[AuthContext] ✓ Subscription loaded: { tier: 'free', isPro: false, proFlag: false }
```

**May see (harmless):**
- WebSocket connection errors (Dev Tools)
- "React DevTools" messages
- Service worker registration logs

---

## 🚦 Troubleshooting Checklist

Before asking for help, verify:

- [ ] `npm install` completed without errors
- [ ] `.env.local` has `GROQ_API_KEY` set (if using AI chat)
- [ ] Both ports 3000 and 3001 are available
- [ ] `npm run dev` command ran without errors
- [ ] Browser shows content at http://localhost:3000
- [ ] No CORS errors in browser console
- [ ] Supabase credentials are correct

---

## 🔍 Debug Mode

Run with verbose logging:

```bash
DEBUG=* npm run dev
```

---

## 📝 Common Commands

```bash
# Development
npm run dev               # Start dev servers
npm start                 # Start React only (for testing)

# Production
npm run build             # Build optimization
npm test                  # Run tests

# Cleanup
npm install               # Reinstall dependencies
rm -rf node_modules       # Deep clean
```

---

## ✨ Features

- ✅ Hot module reloading (HMR) on file changes
- ✅ CORS properly configured for both servers
- ✅ Static assets served from `public/` directory
- ✅ API server supports Yahoo Finance and local dev endpoints
- ✅ Service worker for offline support (production only)
- ✅ Auto-retry on connection failures
- ✅ Graceful error handling and logging

---

## 📞 Need Help?

If issues persist:

1. Check browser **DevTools** → **Console** tab for errors
2. Check all running processes on ports 3000 and 3001
3. Verify `.env.local` file exists and has correct keys
4. Try a clean restart: kill all processes and `npm run dev` again
5. Check the [troubleshooting guide](./TROUBLESHOOTING.md)

---

**Status:** ✅ All systems configured correctly
**Last Updated:** April 12, 2026
