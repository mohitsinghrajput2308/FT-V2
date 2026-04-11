/**
 * FinTrack AI Chat API - Powered by Groq (FREE!)
 * No credit card needed, completely free
 */

import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

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

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, conversationHistory = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ 
      error: 'GROQ_API_KEY not configured. Add to .env.local and restart.' 
    });
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1024,
      temperature: 0.7
    });

    const reply = response.choices[0]?.message?.content || 'No response';

    res.status(200).json({ message: reply });
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get response' 
    });
  }
}


