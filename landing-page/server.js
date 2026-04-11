/**
 * Simple Express server for AI chat API
 * Runs alongside the React dev server
 */

require('dotenv').config({ path: '.env.local' });
const express = require('express');
const Groq = require('groq-sdk');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

console.log('🚀 API Server starting...');
console.log('✓ GROQ_API_KEY configured:', !!process.env.GROQ_API_KEY);

const SYSTEM_PROMPT = `You are FinBot, a helpful AI assistant for FinTrack personal finance app.

FinTrack Features:
- Free: Unlimited transactions, 2 budgets/goals/bills, all 7 calculators, basic reports
- Pro ($9.99/mo): 5 budgets/goals/bills, 3 custom categories, PDF/CSV export, priority chat support
- Business ($29.99/mo): Unlimited budgets/goals/bills, team collaboration (5 users), tax reports, dedicated manager

Key Facts:
- Payment: Paddle (Visa, Mastercard, Amex)
- Trial: 7 days free, no credit card needed
- Refund: 14-day money-back guarantee
- Security: AES-256 encryption, 2FA available
- Discounts: 50% off nonprofits & students

Be friendly, accurate, and helpful. Answer questions about features, pricing, and how to use FinTrack.`;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running' });
});

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    console.log('📨 Chat request received:', message.substring(0, 50) + '...');

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY not configured');
      return res.status(500).json({ 
        error: 'GROQ_API_KEY not configured. Add to .env.local' 
      });
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    console.log('🤖 Calling Groq API with', messages.length, 'messages...');

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1024,
      temperature: 0.7
    });

    const reply = response.choices[0]?.message?.content || 'No response';

    console.log('✅ Response generated:', reply.substring(0, 50) + '...');
    res.status(200).json({ message: reply });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Status:', error.status);
    
    // Return useful error info
    res.status(500).json({ 
      error: error.message || 'Failed to get AI response',
      type: error.type
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   FinTrack AI Chat Server Running      ║
║   http://localhost:${PORT}                  ║
║   React Dev Server: http://localhost:3002   ║
╚════════════════════════════════════════╝
  `);
});
