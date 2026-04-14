# FinTrack AI Chat Setup Guide

## Overview
The AI Assistant now uses Claude API (Anthropic) for real AI conversations instead of simple pattern matching.

## Setup Steps

### 1. Install Required Package
```bash
cd landing-page
npm install @anthropic-ai/sdk
```

### 2. Get Claude API Key
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Create an API key
4. Copy the key

### 3. Add Environment Variable
Create or update `.env.local` in `landing-page/` directory:
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

For Vercel deployment, add via Vercel Dashboard:
- Go to Settings > Environment Variables
- Add `ANTHROPIC_API_KEY` with your Claude API key

### 4. Verify Setup
- Start dev server: `npm start`
- Open dashboard and click chat button
- Ask a question to test

## How It Works

1. **User sends message** → Stored in `LiveChatBot.jsx` state
2. **Frontend calls `/api/chat` endpoint** → Sends message + conversation history
3. **Backend passes to Claude API** → With FinTrack system prompt for context
4. **Claude responds with intelligent answer** → Understands conversation context
5. **Response displayed to user** → Formatted nicely with line breaks

## System Prompt
The AI assistant has FinTrack-specific knowledge including:
- All pricing tier details
- Feature explanations  
- How to use each section
- Support resources
- Payment/billing info

## Cost Estimation
Claude 3.5 Sonnet pricing (as of April 2026):
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens

Typical conversation:
- User message: ~50 tokens
- AI response: ~150 tokens
- Cost per exchange: ~$0.0006 (less than 1 cent)

## Testing Prompts

Try these to test the AI:
1. **"How do I connect my bank account?"** → Should mention Plaid (if available) or contact support
2. **"What's the difference between Pro and Business?"** → Should detail feature differences
3. **"How do I create a budget?"** → Should give step-by-step instructions
4. **"Can I export my data?"** → Should explain export options by plan
5. **"I'm a student, do you have discounts?"** → Should mention 50% nonprofit/student discount

## Troubleshooting

**Chat not responding?**
- Check `ANTHROPIC_API_KEY` is set in `.env.local`
- Check API key is valid and has available balance
- Check browser console for errors

**Getting "AI service not configured" error?**
- API key not set in environment
- For local dev: restart dev server after adding `.env.local`
- For production: verify Vercel environment variables

**Slow responses?**
- First response may take 1-2 seconds while API initializes
- Normal conversation speed: 500ms-1s per response
- Check your internet connection

**Rate limit errors?**
- You've hit Claude API rate limits  
- Wait a few minutes and try again
- Consider upgrading Claude API plan

## Future Enhancements

1. **Conversation persistence** → Save chat history to database
2. **User profile context** → Use user's current plan/features when answering
3. **Intent routing** → Route to human support for certain questions
4. **Analytics** → Track common questions to improve help docs
5. **Multi-language** → Support other languages besides English

## Support
For issues or questions:
- Email: support@fintrack.app
- Check `/api/chat.js` logs for backend errors
