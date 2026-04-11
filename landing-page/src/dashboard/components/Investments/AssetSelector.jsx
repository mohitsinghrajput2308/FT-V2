import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { STOCK_FOREX_UNIVERSE } from '../../data/marketAssets';

// Map Investments.jsx type labels → STOCK_FOREX_UNIVERSE type labels
const TYPE_ALIAS = {
    Stocks:    'Stock',
    Funds:     'ETF',
    Futures:   'Future',
    Forex:     'Forex',
    Crypto:    'Crypto',
    Indices:   'Index',
    Bonds:     'Bond',
    Economy:   'Economy',
    Options:   'Option',
    Commodity: 'Commodity',
};

const AssetSelector = ({ assetType, onSelect, selectedAsset }) => {
    const [query, setQuery]     = useState('');
    const [open, setOpen]       = useState(false);
    const containerRef          = useRef(null);
    const inputRef              = useRef(null);

    const internalType = TYPE_ALIAS[assetType];

    const filtered = useMemo(() => {
        if (!internalType) return [];
        const q = query.toLowerCase();
        return STOCK_FOREX_UNIVERSE
            .filter(a =>
                a.type === internalType &&
                (a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
            )
            .slice(0, 25);
    }, [internalType, query]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Reset search when asset type changes
    useEffect(() => {
        setQuery('');
        setOpen(false);
    }, [assetType]);

    const handleSelect = (asset) => {
        onSelect(asset);
        setOpen(false);
        setQuery('');
    };

    const handleClear = () => {
        onSelect(null);
        setQuery('');
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    if (!internalType) return null;

    return (
        <div className="space-y-1.5" ref={containerRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Asset <span className="text-gray-400 font-normal">(optional — or type name manually above)</span>
            </label>

            {/* Selected chip */}
            {selectedAsset ? (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-primary-400 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600">
                    <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-[9px] font-bold text-primary-700 dark:text-primary-300 flex-shrink-0">
                        {selectedAsset.symbol.replace(/[^A-Z]/gi, '').slice(0, 3).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{selectedAsset.symbol.replace('=X', '')}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{selectedAsset.name}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-1 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 text-primary-500 transition"
                        title="Change asset"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            ) : (
                /* Search input */
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={`Search ${assetType} assets…`}
                        value={query}
                        onChange={e => { setQuery(e.target.value); setOpen(true); }}
                        onFocus={() => setOpen(true)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white dark:bg-dark-200 border border-gray-300 dark:border-dark-400 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition text-sm"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {/* Dropdown */}
                    {open && (
                        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-dark-200 border border-gray-200 dark:border-dark-400 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                            {filtered.length > 0 ? (
                                filtered.map(asset => (
                                    <button
                                        key={asset.symbol}
                                        type="button"
                                        onClick={() => handleSelect(asset)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-dark-300 border-b border-gray-50 dark:border-dark-400 last:border-0 transition"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-dark-300 flex items-center justify-center text-[9px] font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">
                                            {asset.symbol.replace(/[^A-Z]/gi, '').slice(0, 3).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{asset.symbol.replace('=X', '')}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{asset.name}</p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                    {query ? `No results for "${query}"` : `No ${assetType} assets available`}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AssetSelector;
