require('node:dns').setDefaultResultOrder('ipv4first');
export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  try {
    const YF = require('yahoo-finance2').default;
    const yahooFinance = new YF({ suppressNotices: ['yahooSurvey'] });
    const results = await yahooFinance.search(q, { quotesCount: 10, newsCount: 0 });
    res.status(200).json(results);
  } catch (error) {
    console.error('Yahoo Search Error:', error);
    res.status(500).json({ error: 'Failed to fetch search', details: error.message });
  }
}
