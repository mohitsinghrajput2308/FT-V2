import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Search, Star, Lock } from 'lucide-react';
import { STOCK_FOREX_UNIVERSE } from '../../data/marketAssets';
import { useNavigate } from 'react-router-dom';

// ── Constants ──────────────────────────────────────────────────────────────
const FIXED_SYMBOLS = new Set(STOCK_FOREX_UNIVERSE.map(a => a.symbol));

const TABS = ['All', 'Stocks', 'Funds', 'Futures', 'Forex', 'Crypto', 'Indices', 'Bonds', 'Economy', 'Options', 'Commodity'];

const TYPE_MAP = {
    Stocks:    ['Stock'],
    Funds:     ['ETF'],
    Futures:   ['Future'],
    Forex:     ['Forex'],
    Crypto:    ['Crypto'],
    Indices:   ['Index'],
    Bonds:     ['Bond'],
    Economy:   ['Economy'],
    Options:   ['Option'],
    Commodity: ['Commodity'],
};

// Pre-built per-tab symbol lists derived from the static universe
const TAB_SYMBOLS = {
    Stocks:    STOCK_FOREX_UNIVERSE.filter(a => a.type === 'Stock').map(a => a.symbol),
    Funds:     STOCK_FOREX_UNIVERSE.filter(a => a.type === 'ETF').map(a => a.symbol),
    Futures:   STOCK_FOREX_UNIVERSE.filter(a => a.type === 'Future').map(a => a.symbol),
    Forex:     STOCK_FOREX_UNIVERSE.filter(a => a.type === 'Forex').map(a => a.symbol),
    Crypto:    STOCK_FOREX_UNIVERSE.filter(a => a.type === 'Crypto').map(a => a.symbol),
    Indices:   STOCK_FOREX_UNIVERSE.filter(a => a.type === 'Index').map(a => a.symbol),
    Bonds:     STOCK_FOREX_UNIVERSE.filter(a => a.type === 'Bond').map(a => a.symbol),
    Commodity: STOCK_FOREX_UNIVERSE.filter(a => a.type === 'Commodity').map(a => a.symbol),
    Economy:   STOCK_FOREX_UNIVERSE.filter(a => a.type === 'Economy').map(a => a.symbol),
    Options:   STOCK_FOREX_UNIVERSE.filter(a => a.type === 'Option').map(a => a.symbol),
};

// ❌ REMOVED: TAB_FALLBACK was showing stale prices!
// We will NEVER use cached assets - always fetch fresh data from API

// ── API helpers ────────────────────────────────────────────────────────────
const yahooQuote = async (symbols) => {
    if (!symbols.length) return [];
    const res = await fetch(`/api/quote?symbols=${symbols.join(',')}`);
    if (!res.ok) throw new Error('Yahoo quote failed');
    const data = await res.json();
    return data.quoteResponse?.result || [];
};

const yahooSearch = async (query) => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Yahoo search failed');
    const data = await res.json();
    return data.quotes || [];
};

const yTypeToLocal = (quoteType = '') => {
    const m = {
        EQUITY: 'Stock', ETF: 'ETF', MUTUALFUND: 'ETF',
        CURRENCY: 'Forex', CRYPTOCURRENCY: 'Crypto',
        INDEX: 'Index', FUTURE: 'Future', OPTION: 'Option',
    };
    return m[quoteType] || 'Stock';
};

const fromYahooQuote = (q) => ({
    id: q.symbol,
    symbol: q.symbol,
    name: q.longName || q.shortName || q.symbol,
    type: yTypeToLocal(q.quoteType),
    price: q.regularMarketPrice || 0,
    changePercent: q.regularMarketChangePercent || 0,
    change24h: q.regularMarketChange || 0,
    isDynamic: true,
});

// ── Component ──────────────────────────────────────────────────────────────
const MarketWatch = () => {
    const navigate = useNavigate();

    // Persistent watchlist - initially with symbols only (no stale prices)
    const [watchlist, setWatchlist] = useState(() => {
        let custom = [];
        try { custom = JSON.parse(localStorage.getItem('fintrack_watchlist_custom') || '[]'); } catch {}
        // Map to get symbols only from STOCK_FOREX_UNIVERSE (don't use cached prices)
        const fixedAssets = STOCK_FOREX_UNIVERSE.map(a => ({ symbol: a.symbol, name: a.name, type: a.type, id: a.id }));
        const combined = [...fixedAssets, ...custom];
        const map = new Map();
        combined.forEach(a => map.set(a.symbol, a));
        return Array.from(map.values());
    });

    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Per-tab live data stored in a Map: { tabName -> assets[] }
    const [tabData, setTabData] = useState({});
    const [tabLoading, setTabLoading] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false); // Track if initial prices are fetched

    // Track which tab we're fetching for to discard stale responses
    const fetchingForTab = useRef(null);

    // Refs so the stable polling interval can always read the latest values
    const watchlistRef = useRef(watchlist);
    const tabDataRef   = useRef(tabData);
    const activeTabRef = useRef(activeTab);
    useEffect(() => { watchlistRef.current = watchlist; }, [watchlist]);
    useEffect(() => { tabDataRef.current   = tabData;   }, [tabData]);
    useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

    // ── Save custom assets ───────────────────────────────────────────────
    useEffect(() => {
        const custom = watchlist.filter(w => !FIXED_SYMBOLS.has(w.symbol));
        localStorage.setItem('fintrack_watchlist_custom', JSON.stringify(custom));
    }, [watchlist]);

    // ── INITIAL FETCH: Fetch fresh prices for "All" tab on component mount ───────────────────────
    useEffect(() => {
        if (initialLoadDone) return; // Only run once on mount

        let cancelled = false;
        const syms = watchlist.map(a => a.symbol);
        if (!syms.length) {
            setInitialLoadDone(true);
            return;
        }

        setTabLoading(true);

        const fetchInitialPrices = async () => {
            try {
                const chunks = [];
                for (let i = 0; i < syms.length; i += 40) chunks.push(syms.slice(i, i + 40));
                const allQuotes = [];
                for (const chunk of chunks) {
                    const q = await yahooQuote(chunk);
                    allQuotes.push(...q);
                }
                if (cancelled) return;

                const assets = allQuotes.map(fromYahooQuote);
                setTabData(prev => ({ ...prev, All: assets }));
                setWatchlist(prev => {
                    const updates = {};
                    allQuotes.forEach(q => {
                        updates[q.symbol] = fromYahooQuote(q);
                    });
                    return prev.map(a => updates[a.symbol] ? { ...a, ...updates[a.symbol] } : a);
                });
            } catch (err) {
                if (cancelled) return;
                // Fallback: use static data as last resort
                const fallback = STOCK_FOREX_UNIVERSE;
                setTabData(prev => ({ ...prev, All: fallback }));
                setWatchlist(prev =>
                    prev.map(p => {
                        const fb = fallback.find(f => f.symbol === p.symbol);
                        return fb ? { ...p, price: fb.price, changePercent: fb.change24h ? fb.change24h / fb.price * 100 : 0 } : p;
                    })
                );
            } finally {
                if (!cancelled) {
                    setTabLoading(false);
                    setInitialLoadDone(true);
                }
            }
        };

        fetchInitialPrices();
        return () => { cancelled = true; };
    }, []);


    useEffect(() => {
        // Always clear search when switching tabs
        setSearchQuery('');
        setSearchResults([]);

        if (activeTab === 'All') {
            // The "All" view uses the watchlist + live polling below
            return;
        }

        const syms = TAB_SYMBOLS[activeTab] || [];
        if (!syms.length) return;

        if (activeTab === 'Economy') {
            // Economy macro-indicators aren't standard Yahoo stocks; load statically
            setTabData(prev => ({ ...prev, [activeTab]: STOCK_FOREX_UNIVERSE.filter(a => syms.includes(a.symbol)) }));
            return;
        }

        // Extract exact static assets that belong to this tab
        const baseAssets = STOCK_FOREX_UNIVERSE.filter(a => a.type === (activeTab === 'Indices' ? 'Index' : activeTab === 'Funds' ? 'ETF' : activeTab.replace(/s$/, '')) || (activeTab === 'Commodity' && a.type === 'Commodity') || (activeTab === 'Futures' && a.type === 'Future') || (activeTab === 'Stocks' && a.type === 'Stock'));
        
        // Optimize: Fetch each ticker symbol exactly once avoiding duplicate API payload 
        const uniqueSyms = [...new Set(syms)];

        let cancelled = false;
        fetchingForTab.current = activeTab;
        setTabLoading(true);

        yahooQuote(uniqueSyms)
            .then(quotes => {
                if (cancelled || fetchingForTab.current !== activeTab) return;
                
                // Fast lookup for live pricing
                const liveMap = {};
                quotes.forEach(q => {
                    liveMap[q.symbol] = fromYahooQuote(q);
                });

                // Merge live pricing without overwriting custom names/ids (e.g. "Gold vs Euro")
                const finalAssets = baseAssets.map(asset => {
                    const live = liveMap[asset.symbol];
                    if (live) {
                        return { 
                            ...asset, 
                            price: live.price, 
                            changePercent: live.changePercent, 
                            change24h: live.change24h,
                            isDynamic: true 
                        };
                    }
                    return asset; // Fallback to static if no quote found
                });

                setTabData(prev => ({ ...prev, [activeTab]: finalAssets }));
            })
            .catch(() => {
                if (cancelled || fetchingForTab.current !== activeTab) return;
                setTabData(prev => ({ ...prev, [activeTab]: baseAssets }));
            })
            .finally(() => {
                if (!cancelled) setTabLoading(false);
            });

        return () => { cancelled = true; };
    }, [activeTab]);

    // ── Live price polling (10 sec) for current view ─────────────────────
    // IMPORTANT: deps array is intentionally empty [] — we use refs to read
    // the latest watchlist/tabData so the interval is never torn down/restarted
    // on state updates (which was causing Forex prices to get stuck).
    useEffect(() => {
        let active = true;

        const poll = async () => {
            // Read LATEST values from refs — no stale closure
            const currentTab  = activeTabRef.current;
            const currentList = watchlistRef.current;
            const currentData = tabDataRef.current;

            let symbols = [];
            if (currentTab === 'All') {
                symbols = currentList.map(a => a.symbol);
            } else {
                symbols = currentData[currentTab]?.map(a => a.symbol) || TAB_SYMBOLS[currentTab] || [];
            }
            symbols = symbols.filter(s => s && !['INFL', 'GDP', 'UNEMP'].includes(s));
            if (!symbols.length) return;

            try {
                const chunks = [];
                for (let i = 0; i < symbols.length; i += 100) chunks.push(symbols.slice(i, i + 100));
                const allQuotes = [];
                for (const chunk of chunks) {
                    const q = await yahooQuote(chunk);
                    allQuotes.push(...q);
                }
                if (!active) return;

                const updates = {};
                allQuotes.forEach(q => { updates[q.symbol] = fromYahooQuote(q); });

                const mergeLivePrice = (a) => {
                    const live = updates[a.symbol];
                    return live ? { ...a, price: live.price, changePercent: live.changePercent, change24h: live.change24h } : a;
                };

                setWatchlist(prev => prev.map(mergeLivePrice));
                setTabData(prev => {
                    const next = { ...prev };
                    for (const tab of Object.keys(next)) {
                        next[tab] = next[tab].map(mergeLivePrice);
                    }
                    return next;
                });
                setSearchResults(prev => prev.map(mergeLivePrice));
            } catch {}
        };

        poll();
        const id = setInterval(poll, 10000);
        return () => { active = false; clearInterval(id); };
    }, []); // stable — reads live data via refs

    // ── Search ────────────────────────────────────────────────────────────
    useEffect(() => {
        const q = searchQuery.trim();
        if (!q) { setSearchResults([]); return; }

        let cancelled = false;
        setIsSearching(true);

        const run = async () => {
            try {
                const hits = await yahooSearch(q);
                const symbols = hits.slice(0, 10).map(h => h.symbol);
                if (!symbols.length) { setSearchResults([]); return; }
                const priced = await yahooQuote(symbols);
                if (!cancelled) setSearchResults(priced.map(fromYahooQuote));
            } catch {
                if (!cancelled) {
                    const fallback = STOCK_FOREX_UNIVERSE.filter(a =>
                        a.symbol.toUpperCase().includes(q.toUpperCase()) ||
                        a.name.toUpperCase().includes(q.toUpperCase())
                    ).slice(0, 10);
                    setSearchResults(fallback);
                }
            } finally {
                if (!cancelled) setIsSearching(false);
            }
        };

        const timer = setTimeout(run, 400);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [searchQuery]);

    // ── Derive what to display ────────────────────────────────────────────
    const displayAssets = (() => {
        // If searching, show search results (these must be fetched from API)
        if (searchQuery.trim()) return searchResults;

        // For "All" tab: only show fetched data or while loading show nothing
        if (activeTab === 'All') {
            if (tabData['All'] && tabData['All'].length > 0) return tabData['All'];
            // Never show stale data - loading or empty
            return [];
        }

        // For category tabs (Stocks, Forex, Crypto, etc): only show fetched data
        // ❌ NEVER use TAB_FALLBACK (stale prices!)
        if (tabData[activeTab] && tabData[activeTab].length > 0) return tabData[activeTab];
        // Never show stale data - loading or empty
        return [];
    })();

    // Show loading state for ALL tabs until fresh data arrives
    const isLoading = !initialLoadDone || tabLoading || isSearching;

    // ── Helpers ───────────────────────────────────────────────────────────
    const formatPrice = (price, type) => {
        if (!price) return '—';
        if (type === 'Forex') return price.toFixed(4);
        if (price < 1) return price.toFixed(4);
        return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const addToWatchlist = (asset) => {
        setWatchlist(prev => prev.some(w => w.symbol === asset.symbol) ? prev : [...prev, asset]);
    };
    const removeFromWatchlist = (symbol) => {
        if (FIXED_SYMBOLS.has(symbol)) return;
        setWatchlist(prev => prev.filter(w => w.symbol !== symbol));
    };
    const isInWatchlist = (symbol) => watchlist.some(w => w.symbol === symbol);

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full bg-white dark:bg-dark-200 rounded-xl border border-gray-200 dark:border-dark-400 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex flex-col gap-3 p-4 border-b border-gray-100 dark:border-dark-400">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            Market Watch
                            {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-gray-400" />}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {searchQuery.trim()
                                ? `Results for "${searchQuery}"`
                                : activeTab === 'All' ? 'Your watchlist' : `Top ${activeTab}`}
                        </p>
                    </div>
                </div>

                {/* Search bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                        id="mw-search"
                        type="text"
                        placeholder="Search any global asset — AAPL, BTC, EUR/USD…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-dark-300 border border-gray-200 dark:border-dark-500 rounded-lg pl-9 pr-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 dark:text-white transition"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
                        >×</button>
                    )}
                </div>

                {/* Tab pills */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    {TABS.map(t => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={`px-3 py-1 text-xs font-semibold whitespace-nowrap rounded-full transition-all ${
                                activeTab === t
                                    ? 'bg-primary-500 text-white shadow'
                                    : 'bg-gray-100 dark:bg-dark-300 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-400'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Asset list */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-dark-400">
                {displayAssets.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <Search className="w-10 h-10 text-gray-300 mb-3" />
                        <p className="text-sm font-semibold text-gray-700 dark:text-white">
                            {searchQuery.trim() ? 'No results found' : `No ${activeTab} assets`}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {searchQuery.trim() ? 'Try a different symbol or name.' : 'Use the search bar above to find assets.'}
                        </p>
                    </div>
                )}

                {displayAssets.map(asset => {
                    const isFixed = FIXED_SYMBOLS.has(asset.symbol);
                    const inList = isInWatchlist(asset.symbol);
                    const isUp = (asset.changePercent || 0) >= 0;

                    return (
                        <div
                            key={asset.symbol}
                            onClick={() => navigate(`/dashboard/investments/chart/${encodeURIComponent(asset.symbol)}`)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-300/60 cursor-pointer transition group"
                        >
                            {/* Star / Lock */}
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    if (isFixed) return;
                                    inList ? removeFromWatchlist(asset.symbol) : addToWatchlist(asset);
                                }}
                                title={isFixed ? 'Fixed – cannot remove' : inList ? 'Remove from watchlist' : 'Add to watchlist'}
                                className={`flex-shrink-0 p-1.5 rounded-full transition ${isFixed ? 'cursor-default' : 'hover:bg-gray-200 dark:hover:bg-dark-400'}`}
                            >
                                {isFixed
                                    ? <Lock className="w-3.5 h-3.5 text-primary-400 opacity-70" />
                                    : <Star className={`w-3.5 h-3.5 ${inList ? 'fill-primary-500 text-primary-500' : 'text-gray-300 group-hover:text-gray-500'}`} />
                                }
                            </button>

                            {/* Avatar */}
                            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-100 dark:bg-dark-300 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-dark-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 transition">
                                {asset.symbol.replace(/[^A-Z]/gi, '').substring(0, 3).toUpperCase()}
                            </div>

                            {/* Name */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate transition">
                                    {asset.symbol.replace('=X', '')}
                                </p>
                                <p className="text-xs text-gray-400 truncate">{asset.name} · {asset.type}</p>
                            </div>

                            {/* Price + change */}
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                                    {asset.type !== 'Forex' ? '$' : ''}{formatPrice(asset.price, asset.type)}
                                </p>
                                <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded mt-0.5 ${
                                    isUp ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-red-50 text-red-500 dark:bg-red-900/20'
                                }`}>
                                    {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {isUp ? '+' : ''}{(asset.changePercent || 0).toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-100 dark:border-dark-400 text-xs text-gray-400 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live via Yahoo Finance
            </div>
        </div>
    );
};

export default MarketWatch;
