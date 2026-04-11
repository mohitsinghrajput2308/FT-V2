/**
 * AI Chat API Endpoint - Using Groq (FREE & FAST) 
 * Groq API is completely free with no credit card needed
 * https://console.groq.com
 */

const Groq = require('groq-sdk');

const FINTRACK_SYSTEM_PROMPT = `You are FinBot, an intelligent AI assistant for FinTrack - a personal finance management platform. 

FinTrack helps users track income, expenses, budgets, goals, investments, and bills. Here's what FinTrack offers:

## Features
- **Free Plan**: Unlimited transactions, investments, calculators, 2 budgets/goals/bills, basic analytics, email support
- **Pro Plan** ($9.99/month): 5 budgets/goals/bills, 3 custom categories, CSV & PDF export, API access, priority support + live chat
- **Business Plan** ($29.99/month): Unlimited budgets/goals/bills, unlimited custom categories, team collaboration (up to 5), tax reports, custom integrations, dedicated account manager

## Key Information
- Payment: Processed via Paddle (Visa, Mastercard, Amex accepted)
- Trial: 7-day free trial on Pro/Business (no credit card required)
- Refund: 14-day money-back guarantee
- Security: AES-256 encryption, TLS 1.3, 2FA available
- Support: Email response in 24hrs (Free) or 2hrs (Pro/Business)
- Discounts: 50% off for nonprofits and students

IMPORTANT: Be helpful, accurate, friendly, and concise. Answer questions about features, pricing, billing, and account management.`;

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check API key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('GROQ_API_KEY not set');
      return res.status(500).json({ 
        error: 'AI service not configured. Get free key at https://console.groq.com then add GROQ_API_KEY to .env.local' 
      });
    }

    // Build conversation messages
    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    // Call Groq API (FREE & FAST!)
    const response = await client.chat.completions.create({
      model: 'mixtral-8x7b-32768', // Free, fast, open source
      max_tokens: 1024,
      system: FINTRACK_SYSTEM_PROMPT,
      messages: messages
    });

    const aiMessage = response.choices[0].message.content;

    res.status(200).json({
      message: aiMessage
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    if (error.status === 401) {
      return res.status(401).json({ error: 'Invalid GROQ_API_KEY. Get a free key at https://console.groq.com' });
    }
    
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limited. Free tier has limits - try again in a moment.' });
    }

    res.status(500).json({ 
      error: 'Failed to process message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
