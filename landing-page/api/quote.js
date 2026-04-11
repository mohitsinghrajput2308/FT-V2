require('node:dns').setDefaultResultOrder('ipv4first');
export default async function handler(req, res) {
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'Missing symbols' });

  try {
    const YF = require('yahoo-finance2').default;
    const yahooFinance = new YF({ suppressNotices: ['yahooSurvey'] });
    const symbolArray = symbols.split(',').map(s => s.trim());
    let quotes;
    try {
      quotes = await yahooFinance.quote(symbolArray);
    } catch (e) {
      if (e.name === 'FailedYahooValidationError') {
        quotes = e.result;
      } else {
        throw e;
      }
    }
    res.status(200).json({ quoteResponse: { result: Array.isArray(quotes) ? quotes : [quotes] } });
  } catch (error) {
    console.error('Yahoo Quote Error:', error);
    res.status(500).json({ error: 'Failed to fetch quote', details: error.message });
  }
}
