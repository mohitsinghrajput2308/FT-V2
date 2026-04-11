export const STOCK_FOREX_UNIVERSE = [
    // Top Tech / Mega Cap
    { id: 'AAPL', symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock', price: 178.25, change24h: 1.25 },
    { id: 'MSFT', symbol: 'MSFT', name: 'Microsoft Corp.', type: 'Stock', price: 415.50, change24h: 3.10 },
    { id: 'NVDA', symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'Stock', price: 850.20, change24h: 12.50 },
    { id: 'GOOGL', symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Stock', price: 140.20, change24h: 0.80 },
    { id: 'AMZN', symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Stock', price: 175.35, change24h: -0.50 },
    { id: 'META', symbol: 'META', name: 'Meta Platforms', type: 'Stock', price: 480.00, change24h: -5.00 },
    { id: 'TSLA', symbol: 'TSLA', name: 'Tesla Inc.', type: 'Stock', price: 202.10, change24h: -2.40 },
    { id: 'AVGO', symbol: 'AVGO', name: 'Broadcom Inc.', type: 'Stock', price: 1300.50, change24h: 15.20 },
    { id: 'BRK.B', symbol: 'BRK.B', name: 'Berkshire Hathaway', type: 'Stock', price: 405.10, change24h: 2.15 },
    { id: 'LLY', symbol: 'LLY', name: 'Eli Lilly and Co.', type: 'Stock', price: 750.80, change24h: -4.30 },

    // Financials
    { id: 'JPM', symbol: 'JPM', name: 'JPMorgan Chase', type: 'Stock', price: 190.10, change24h: 1.50 },
    { id: 'V', symbol: 'V', name: 'Visa Inc.', type: 'Stock', price: 280.00, change24h: 2.10 },
    { id: 'MA', symbol: 'MA', name: 'Mastercard Inc.', type: 'Stock', price: 470.50, change24h: 3.80 },
    { id: 'BAC', symbol: 'BAC', name: 'Bank of America', type: 'Stock', price: 34.20, change24h: 0.15 },
    { id: 'WFC', symbol: 'WFC', name: 'Wells Fargo', type: 'Stock', price: 56.40, change24h: -0.25 },

    // Healthcare & Consumer
    { id: 'JNJ', symbol: 'JNJ', name: 'Johnson & Johnson', type: 'Stock', price: 155.30, change24h: 0.40 },
    { id: 'UNH', symbol: 'UNH', name: 'UnitedHealth Group', type: 'Stock', price: 480.20, change24h: 5.60 },
    { id: 'WMT', symbol: 'WMT', name: 'Walmart Inc.', type: 'Stock', price: 60.50, change24h: -0.20 },
    { id: 'PG', symbol: 'PG', name: 'Procter & Gamble', type: 'Stock', price: 158.40, change24h: 1.10 },
    { id: 'KO', symbol: 'KO', name: 'Coca-Cola Co.', type: 'Stock', price: 60.20, change24h: 0.30 },
    { id: 'PEP', symbol: 'PEP', name: 'PepsiCo Inc.', type: 'Stock', price: 165.70, change24h: -1.20 },
    { id: 'COST', symbol: 'COST', name: 'Costco Wholesale', type: 'Stock', price: 720.30, change24h: 8.50 },
    { id: 'MCD', symbol: 'MCD', name: 'McDonald\'s Corp.', type: 'Stock', price: 290.10, change24h: -2.30 },

    // Retail & Entertainment
    { id: 'NFLX', symbol: 'NFLX', name: 'Netflix Inc.', type: 'Stock', price: 600.50, change24h: 4.20 },
    { id: 'DIS', symbol: 'DIS', name: 'Walt Disney Co.', type: 'Stock', price: 110.80, change24h: 1.50 },
    { id: 'SBUX', symbol: 'SBUX', name: 'Starbucks Corp.', type: 'Stock', price: 92.40, change24h: -0.80 },
    { id: 'NKE', symbol: 'NKE', name: 'NIKE Inc.', type: 'Stock', price: 102.50, change24h: 0.90 },

    // Semiconductors & Tech Hardware
    { id: 'AMD', symbol: 'AMD', name: 'Advanced Micro Devices', type: 'Stock', price: 180.20, change24h: 3.40 },
    { id: 'INTC', symbol: 'INTC', name: 'Intel Corp.', type: 'Stock', price: 43.10, change24h: -0.50 },
    { id: 'QCOM', symbol: 'QCOM', name: 'QUALCOMM Inc.', type: 'Stock', price: 155.60, change24h: 2.10 },
    { id: 'IBM', symbol: 'IBM', name: 'Intl Business Machines', type: 'Stock', price: 188.40, change24h: 1.20 },
    { id: 'CRM', symbol: 'CRM', name: 'Salesforce Inc.', type: 'Stock', price: 305.80, change24h: -1.90 },
    { id: 'ADBE', symbol: 'ADBE', name: 'Adobe Inc.', type: 'Stock', price: 540.20, change24h: 6.30 },

    // Energy & Industrials
    { id: 'XOM', symbol: 'XOM', name: 'Exxon Mobil Corp.', type: 'Stock', price: 108.50, change24h: 0.60 },
    { id: 'CVX', symbol: 'CVX', name: 'Chevron Corp.', type: 'Stock', price: 152.30, change24h: 0.40 },
    { id: 'GE', symbol: 'GE', name: 'General Electric', type: 'Stock', price: 145.80, change24h: 2.20 },
    { id: 'BA', symbol: 'BA', name: 'Boeing Co.', type: 'Stock', price: 205.40, change24h: -3.50 },
    { id: 'CAT', symbol: 'CAT', name: 'Caterpillar Inc.', type: 'Stock', price: 335.10, change24h: 1.80 },

    // ETFs
    { id: 'SPY', symbol: 'SPY', name: 'SPDR S&P 500 ETF', type: 'ETF', price: 510.40, change24h: 2.50 },
    { id: 'QQQ', symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'ETF', price: 440.10, change24h: 3.20 },
    { id: 'DIA', symbol: 'DIA', name: 'SPDR Dow Jones ETF', type: 'ETF', price: 390.50, change24h: 1.10 },
    { id: 'VTI', symbol: 'VTI', name: 'Vanguard Total Stock', type: 'ETF', price: 255.80, change24h: 1.30 },
    { id: 'ARKK', symbol: 'ARKK', name: 'ARK Innovation ETF', type: 'ETF', price: 50.20, change24h: -0.40 },
    { id: 'GLD', symbol: 'GLD', name: 'SPDR Gold Trust', type: 'ETF', price: 200.50, change24h: -1.20 },

    // Major Forex Pairs
    { id: 'EUR/USD', symbol: 'EURUSD=X', name: 'Euro / US Dollar', type: 'Forex', price: 1.0852, change24h: 0.0015 },
    { id: 'USD/JPY', symbol: 'USDJPY=X', name: 'US Dollar / Yen', type: 'Forex', price: 150.20, change24h: -0.50 },
    { id: 'GBP/USD', symbol: 'GBPUSD=X', name: 'British Pound / USD', type: 'Forex', price: 1.2650, change24h: -0.0020 },
    { id: 'AUD/USD', symbol: 'AUDUSD=X', name: 'Australian Dollar / USD', type: 'Forex', price: 0.6520, change24h: 0.0010 },
    { id: 'USD/CAD', symbol: 'USDCAD=X', name: 'US Dollar / Canadian Dollar', type: 'Forex', price: 1.3520, change24h: -0.0010 },
    { id: 'USD/CHF', symbol: 'USDCHF=X', name: 'US Dollar / Swiss Franc', type: 'Forex', price: 0.8800, change24h: 0.0005 },
    { id: 'NZD/USD', symbol: 'NZDUSD=X', name: 'New Zealand Dollar / USD', type: 'Forex', price: 0.6105, change24h: 0.0012 },
    { id: 'EUR/GBP', symbol: 'EURGBP=X', name: 'Euro / British Pound', type: 'Forex', price: 0.8550, change24h: -0.0008 },
    { id: 'EUR/JPY', symbol: 'EURJPY=X', name: 'Euro / Yen', type: 'Forex', price: 163.40, change24h: 0.20 },
    { id: 'GBP/JPY', symbol: 'GBPJPY=X', name: 'British Pound / Yen', type: 'Forex', price: 190.50, change24h: 0.15 },


    // Precious Metals (Commodities)
    { id: 'XAUUSD', symbol: 'GC=F', name: 'Gold vs US Dollar', type: 'Commodity', price: 2150.50, change24h: 12.40 },
    { id: 'XAGUSD', symbol: 'SI=F', name: 'Silver vs US Dollar', type: 'Commodity', price: 24.50, change24h: 0.35 },
    { id: 'XPTUSD', symbol: 'PL=F', name: 'Platinum vs US Dollar', type: 'Commodity', price: 920.40, change24h: -5.20 },
    { id: 'XPDUSD', symbol: 'PA=F', name: 'Palladium vs US Dollar', type: 'Commodity', price: 1050.20, change24h: 15.30 },

    // Cryptocurrencies
    { id: 'BTC', symbol: 'BTC-USD', name: 'Bitcoin', type: 'Crypto', price: 65000.50, change24h: 1200.20 },
    { id: 'ETH', symbol: 'ETH-USD', name: 'Ethereum', type: 'Crypto', price: 3450.80, change24h: 50.40 },
    { id: 'SOL', symbol: 'SOL-USD', name: 'Solana', type: 'Crypto', price: 145.20, change24h: 8.50 },
    { id: 'BNB', symbol: 'BNB-USD', name: 'Binance Coin', type: 'Crypto', price: 420.30, change24h: 5.20 },
    { id: 'XRP', symbol: 'XRP-USD', name: 'Ripple', type: 'Crypto', price: 0.62, change24h: 0.02 },
    { id: 'ADA', symbol: 'ADA-USD', name: 'Cardano', type: 'Crypto', price: 0.58, change24h: -0.01 },
    { id: 'AVAX', symbol: 'AVAX-USD', name: 'Avalanche', type: 'Crypto', price: 42.10, change24h: 2.15 },

    // Indices
    { id: 'SPX', symbol: '^GSPC', name: 'S&P 500 Index', type: 'Index', price: 5100.80, change24h: 25.40 },
    { id: 'NDX', symbol: '^IXIC', name: 'NASDAQ 100', type: 'Index', price: 18050.20, change24h: 110.50 },
    { id: 'DJI', symbol: '^DJI', name: 'Dow Jones Industrial', type: 'Index', price: 39000.50, change24h: 85.20 },
    { id: 'VIX', symbol: '^VIX', name: 'CBOE Volatility Index', type: 'Index', price: 14.50, change24h: -0.20 },
    { id: 'RUT', symbol: '^RUT', name: 'Russell 2000', type: 'Index', price: 2050.30, change24h: 15.60 },

    // Bonds
    { id: 'US10Y', symbol: '^TNX', name: 'US 10-Year Treasury', type: 'Bond', price: 4.25, change24h: 0.05 },
    { id: 'US02Y', symbol: '^IRX', name: 'US 2-Year Treasury', type: 'Bond', price: 4.60, change24h: 0.02 },
    { id: 'US30Y', symbol: '^TYX', name: 'US 30-Year Treasury', type: 'Bond', price: 4.35, change24h: 0.04 },
    { id: 'DE10Y', symbol: '^TNX', name: 'Germany 10-Year Bund (Proxy)', type: 'Bond', price: 2.40, change24h: 0.01 },
    { id: 'UK10Y', symbol: '^TNX', name: 'UK 10-Year Gilt (Proxy)', type: 'Bond', price: 4.05, change24h: 0.06 },

    // Futures
    { id: 'ES=F', symbol: 'ES=F', name: 'E-Mini S&P 500', type: 'Future', price: 5120.50, change24h: 18.50 },
    { id: 'NQ=F', symbol: 'NQ=F', name: 'E-Mini NASDAQ 100', type: 'Future', price: 18100.20, change24h: 95.40 },
    { id: 'CL=F', symbol: 'CL=F', name: 'Crude Oil WTI', type: 'Future', price: 78.50, change24h: -0.40 },
    { id: 'GC=F', symbol: 'GC=F', name: 'Gold Futures', type: 'Future', price: 2160.20, change24h: 15.80 },
    { id: 'ZC=F', symbol: 'ZC=F', name: 'Corn Futures', type: 'Future', price: 430.50, change24h: 2.20 },

    // Options (Representative)
    { id: 'AAPL240119C00150000', symbol: 'AAPL Call 150', name: 'AAPL Jan 19 Call', type: 'Option', price: 28.50, change24h: 1.25 },
    { id: 'SPY240119P00500000', symbol: 'SPY Put 500', name: 'SPY Jan 19 Put', type: 'Option', price: 12.30, change24h: -0.80 },
    { id: 'TSLA240119C00200000', symbol: 'TSLA Call 200', name: 'TSLA Jan 19 Call', type: 'Option', price: 15.20, change24h: 2.50 },

    // Economy
    { id: 'USINFR', symbol: 'INFL', name: 'US Inflation Rate (%)', type: 'Economy', price: 3.10, change24h: 0.00 },
    { id: 'USGDP', symbol: 'GDP', name: 'US GDP Growth (%)', type: 'Economy', price: 3.30, change24h: 0.00 },
    { id: 'USUNEMP', symbol: 'UNEMP', name: 'US Unemployment (%)', type: 'Economy', price: 3.70, change24h: 0.00 }
].map(asset => {
    // Dynamically calculate initial changePercent to keep data concise
    const oldPrice = asset.price - asset.change24h;
    const changePercent = oldPrice > 0 ? (asset.change24h / oldPrice) * 100 : 0;
    return { ...asset, changePercent, isCrypto: false };
});
