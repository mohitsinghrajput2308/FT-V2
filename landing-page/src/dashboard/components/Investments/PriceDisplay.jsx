import { TrendingUp, TrendingDown, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const PriceDisplay = ({ label, price, change, isLoading, error, lastUpdated, onRefresh, editable, name, onChange, placeholder }) => {
    const isUp = (change ?? 0) >= 0;

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                <div className="flex items-center gap-1.5">
                    {lastUpdated && !isLoading && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    )}
                    {error ? (
                        <WifiOff className="w-3.5 h-3.5 text-danger-500" title={error} />
                    ) : lastUpdated ? (
                        <Wifi className="w-3.5 h-3.5 text-green-500" />
                    ) : null}
                    {onRefresh && (
                        <button
                            type="button"
                            onClick={onRefresh}
                            disabled={isLoading}
                            title="Refresh price"
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-300 text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                </div>
            </div>

            <div className={`flex items-center rounded-lg border transition-all ${
                error
                    ? 'border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/10'
                    : price != null
                        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                        : 'border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-200'
            }`}>
                {/* Price value — editable if override allowed */}
                {editable ? (
                    <input
                        type="text"
                        inputMode="decimal"
                        name={name}
                        value={price != null ? price : ''}
                        onChange={onChange}
                        placeholder={isLoading ? 'Fetching…' : placeholder || 'Enter price'}
                        className="flex-1 px-3 py-2.5 bg-transparent text-sm font-mono font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none rounded-lg"
                    />
                ) : (
                    <div className="flex-1 px-3 py-2.5">
                        {isLoading ? (
                            <span className="text-sm text-gray-400 flex items-center gap-2">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Fetching live price…
                            </span>
                        ) : price !== null && price !== '' && !isNaN(Number(price)) ? (
                            <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                                ${Number(price) < 1 ? Number(price).toFixed(4) : Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        ) : price != null && price !== '' ? (
                            <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">${price}</span>
                        ) : (
                            <span className="text-sm text-gray-400">{error ? 'API unavailable — enter manually' : '—'}</span>
                        )}
                    </div>
                )}

                {/* Change badge */}
                {change != null && !isLoading && (
                    <span className={`mr-2 inline-flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-md flex-shrink-0 ${
                        isUp ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? '+' : ''}{change.toFixed(2)}%
                    </span>
                )}
            </div>

            {error && (
                <p className="text-xs text-orange-600 dark:text-orange-400">
                    ⚠︎ {error} — you can still enter a price manually above.
                </p>
            )}
        </div>
    );
};

export default PriceDisplay;
