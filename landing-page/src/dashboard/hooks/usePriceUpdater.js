import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * usePriceUpdater
 * Fetches live price for a single Yahoo Finance symbol and keeps it updated.
 *
 * @param {string|null} symbol   - Yahoo Finance ticker (e.g. 'AAPL', 'EURUSD=X')
 * @param {number}      interval - polling interval in ms (default 10 000 ms)
 */
const usePriceUpdater = (symbol, interval = 10000) => {
    const [price, setPrice]           = useState(null);
    const [change, setChange]         = useState(null); // regularMarketChangePercent
    const [isLoading, setIsLoading]   = useState(false);
    const [error, setError]           = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const activeRef = useRef(true);

    const fetchPrice = useCallback(async () => {
        if (!symbol) return;
        setIsLoading(true);
        try {
            const res  = await fetch(`/api/quote?symbols=${encodeURIComponent(symbol)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const q    = data.quoteResponse?.result?.[0];
            if (q && activeRef.current) {
                setPrice(q.regularMarketPrice ?? null);
                setChange(q.regularMarketChangePercent ?? null);
                setLastUpdated(new Date());
                setError(null);
            }
        } catch (err) {
            if (activeRef.current) setError(err.message);
        } finally {
            if (activeRef.current) setIsLoading(false);
        }
    }, [symbol]);

    // Re-fetch whenever symbol changes
    useEffect(() => {
        activeRef.current = true;
        setPrice(null);
        setChange(null);
        setError(null);
        setLastUpdated(null);

        if (!symbol) return;

        fetchPrice();

        const id = setInterval(fetchPrice, interval);
        return () => {
            activeRef.current = false;
            clearInterval(id);
        };
    }, [symbol, interval, fetchPrice]);

    return { price, change, isLoading, error, lastUpdated, refetch: fetchPrice };
};

export default usePriceUpdater;
