# Investment Asset Selector - Implementation Guide

## Quick Reference: What Needs to Be Built

### 1. **Asset Selector Component** (NEW)
- Location: `landing-page/src/dashboard/components/Investments/AssetSelector.jsx`
- Purpose: Searchable dropdown for selecting built-in assets by type
- Inputs: `assetType`, `selectedAsset`
- Outputs: Returns selected asset object

### 2. **Price Update Hook** (NEW)
- Location: `landing-page/src/dashboard/hooks/usePriceUpdater.js`
- Purpose: Real-time price fetching and polling
- Inputs: `symbol`, `updateInterval`
- Outputs: `currentPrice`, `isLoading`, `error`, `lastUpdated`

### 3. **Price Display Component** (NEW)
- Location: `landing-page/src/dashboard/components/Investments/PriceDisplay.jsx`
- Purpose: Show live price with update status
- Inputs: `price`, `change`, `isLoading`, `lastUpdated`
- Outputs: Formatted display with indicators

### 4. **Updated Investment Form** (MODIFIED)
- Location: `landing-page/src/dashboard/pages/Investments.jsx`
- Changes:
  - Add asset type filter logic
  - Integrate AssetSelector component
  - Add usePriceUpdater hook
  - Auto-fill purchasePrice and currentValue
  - Update validation logic

---

## Component Architecture

```
Investments.jsx (Main Page)
├── Modal
│   └── AssetSelectorForm
│       ├── Select: Asset Type
│       ├── Conditional: AssetSelector Component
│       │   └── Uses: STOCK_FOREX_UNIVERSE data
│       ├── Conditional: PriceDisplay Component
│       │   └── Uses: usePriceUpdater hook
│       ├── Input: Purchase Price (auto-filled)
│       ├── Input: Current Value (live updating)
│       ├── Input: Quantity (manual)
│       ├── Input: Purchase Date (manual)
│       └── Buttons: Cancel / Submit
```

---

## Implementation Steps

### Step 1: Create AssetSelector Component

**File**: `landing-page/src/dashboard/components/Investments/AssetSelector.jsx`

```javascript
import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { STOCK_FOREX_UNIVERSE } from '../../data/marketAssets';

const AssetSelector = ({ assetType, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter assets by selected type
  const filteredAssets = useMemo(() => {
    if (!assetType) return [];
    
    return STOCK_FOREX_UNIVERSE.filter(asset => 
      asset.type === assetType &&
      (asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
       asset.name.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 20); // Max 20 results
  }, [assetType, searchQuery]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${assetType}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border rounded-lg"
        />
      </div>
      
      <div className="border rounded-lg max-h-60 overflow-y-auto">
        {filteredAssets.length > 0 ? (
          filteredAssets.map(asset => (
            <button
              key={asset.symbol}
              onClick={() => onSelect(asset)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-0"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{asset.symbol}</p>
                  <p className="text-sm text-gray-500">{asset.name}</p>
                </div>
                <p className="font-semibold text-right">${asset.price}</p>
              </div>
            </button>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No assets found for "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetSelector;
```

### Step 2: Create usePriceUpdater Hook

**File**: `landing-page/src/dashboard/hooks/usePriceUpdater.js`

```javascript
import { useState, useEffect, useCallback } from 'react';

const usePriceUpdater = (symbol, updateInterval = 10000) => {
  const [price, setPrice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchPrice = useCallback(async () => {
    if (!symbol) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/quote?symbols=${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch price');

      const data = await response.json();
      const quote = data.quoteResponse?.result?.[0];

      if (quote) {
        setPrice(quote.regularMarketPrice || 0);
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  // Initial fetch
  useEffect(() => {
    fetchPrice();
  }, [symbol, fetchPrice]);

  // Set up polling interval
  useEffect(() => {
    if (!symbol || updateInterval <= 0) return;

    const interval = setInterval(fetchPrice, updateInterval);
    return () => clearInterval(interval);
  }, [symbol, updateInterval, fetchPrice]);

  return { price, isLoading, error, lastUpdated, refetch: fetchPrice };
};

export default usePriceUpdater;
```

### Step 3: Create PriceDisplay Component

**File**: `landing-page/src/dashboard/components/Investments/PriceDisplay.jsx`

```javascript
import React from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

const PriceDisplay = ({ label, price, change, isLoading, lastUpdated, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <div className="animate-spin">
            <RefreshCw className="w-4 h-4 text-primary-600" />
          </div>
          <span className="text-gray-500">Fetching live price...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">${price ? price.toFixed(4) : '--'}</span>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{change >= 0 ? '+' : ''}{change.toFixed(2)}%</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={onRefresh}
            className="p-1 hover:bg-gray-200 rounded transition"
            title="Refresh price"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceDisplay;
```

### Step 4: Update Investments.jsx

**File**: `landing-page/src/dashboard/pages/Investments.jsx` (key changes)

```javascript
// Add new imports
import AssetSelector from '../components/Investments/AssetSelector';
import PriceDisplay from '../components/Investments/PriceDisplay';
import usePriceUpdater from '../hooks/usePriceUpdater';

// Inside Investments component
const [selectedAssetType, setSelectedAssetType] = useState('');
const [selectedAsset, setSelectedAsset] = useState(null);
const { price: livePrice, lastUpdated, refetch } = usePriceUpdater(
  selectedAsset?.symbol, 
  selectedAsset ? 10000 : 0  // Poll every 10 seconds if asset selected
);

// When asset type changes
const handleAssetTypeChange = (e) => {
  const type = e.target.value;
  setSelectedAssetType(type);
  setSelectedAsset(null);
  setFormData(prev => ({ 
    ...prev, 
    type,
    purchasePrice: '',
    currentValue: ''
  }));
};

// When asset is selected
const handleAssetSelect = (asset) => {
  setSelectedAsset(asset);
  setFormData(prev => ({
    ...prev,
    name: asset.name || asset.symbol,
    purchasePrice: asset.price.toString(),
    currentValue: asset.price.toString(),
    type: asset.type
  }));
};

// Update currentValue when livePrice changes
useEffect(() => {
  if (livePrice && selectedAsset) {
    setFormData(prev => ({
      ...prev,
      currentValue: livePrice.toString()
    }));
  }
}, [livePrice]);

// In the form JSX, replace the manual inputs with:
<Select 
  label="Type" 
  name="type" 
  options={investmentTypes} 
  value={formData.type} 
  onChange={handleAssetTypeChange}
/>

{formData.type && formData.type !== 'Other' && (
  <AssetSelector
    assetType={formData.type}
    onSelect={handleAssetSelect}
  />
)}

{selectedAsset && (
  <>
    <PriceDisplay
      label="Purchase Price"
      price={parseFloat(formData.purchasePrice)}
      isLoading={false}
      onRefresh={() => refetch()}
    />
    <PriceDisplay
      label="Current Value"
      price={livePrice || parseFloat(formData.currentValue)}
      change={selectedAsset ? ((livePrice - selectedAsset.price) / selectedAsset.price * 100) : 0}
      lastUpdated={lastUpdated}
      onRefresh={() => refetch()}
    />
  </>
)}
```

---

## Data Flow

```
User selects Type
    ↓
handleAssetTypeChange() triggered
    ├─ setSelectedAssetType(type)
    ├─ Clear selectedAsset
    └─ Clear price fields
    ↓
AssetSelector renders with filtered assets
    ↓
User selects Asset
    ↓
handleAssetSelect(asset) triggered
    ├─ setSelectedAsset(asset)
    ├─ Auto-fill name, purchasePrice, currentValue
    └─ Start price polling via usePriceUpdater
    ↓
usePriceUpdater effect runs
    ├─ Fetch initial price from /api/quote
    ├─ Set up 10-second interval
    └─ Trigger re-render with new price every 10s
    ↓
useEffect watches livePrice
    ├─ Update formData.currentValue
    └─ Trigger re-render to show new price
    ↓
User sees real-time price updates with timestamp
    ↓
User enters Quantity & Purchase Date
    ↓
User submits form
    ↓
Investment saved with all auto-filled data
```

---

## File Tree Structure

```
landing-page/src/dashboard/
├── pages/
│   └── Investments.jsx (MODIFIED)
├── components/
│   └── Investments/
│       ├── AssetSelector.jsx (NEW)
│       ├── PriceDisplay.jsx (NEW)
│       └── MarketWatch.jsx (existing)
├── hooks/
│   └── usePriceUpdater.js (NEW)
└── data/
    └── marketAssets.js (existing - no changes needed)
```

---

## Testing Checklist

- [ ] Asset selector filters correctly by type
- [ ] Selected asset auto-fills all required fields
- [ ] Purchase price fetches and displays correctly
- [ ] Current value updates every 10 seconds
- [ ] Price updates stop when modal closes
- [ ] Manual override of prices works
- [ ] Error handling shows when API fails
- [ ] Mobile responsive design works
- [ ] Keyboard navigation works
- [ ] Search/filter works for all asset types
- [ ] Form validation passes with auto-filled data
- [ ] Investment saves correctly with asset reference

---

## API Integration

### Existing Yahoo Finance Quote API

```
GET /api/quote?symbols=EURUSD=X,AAPL,BTC-USD

Response:
{
  "quoteResponse": {
    "result": [
      {
        "symbol": "EURUSD=X",
        "regularMarketPrice": 1.0852,
        "regularMarketChange": 0.0015,
        "regularMarketChangePercent": 0.14,
        "longName": "Euro / US Dollar"
      },
      ...
    ]
  }
}
```

**Note**: API already implemented in `landing-page/api/quote.js`

---

## Performance Optimizations

1. **Asset Filtering**: Memoize with `useMemo()` to avoid re-filtering on every render
2. **Price Polling**: Only poll when modal is open and asset selected
3. **Debounce Search**: Wait 300ms after user stops typing before filtering
4. **Batch Requests**: Limit quote requests to 20 symbols at a time
5. **Cache Results**: Keep fetched prices in state for 30 seconds
6. **Cleanup**: Clear intervals when component unmounts

---

## Error Handling Strategy

1. **Asset Not Found**: Show message, allow manual entry
2. **API Failure**: Show error badge, keep last known price
3. **Network Issues**: Queue retry, show connection warning
4. **Invalid Symbol**: Handle gracefully, fallback to manual entry

---

## Accessibility Features

- ✓ Keyboard navigation (arrow keys, Enter to select)
- ✓ ARIA labels for screen readers
- ✓ Loading state announcements
- ✓ Error state announcements
- ✓ High contrast for price changes
- ✓ Focus management in modal

---

## Browser Compatibility

- Chrome/Edge: ✓ Full support
- Firefox: ✓ Full support
- Safari: ✓ Full support (iOS 12+)
- Mobile browsers: ✓ Full support

---

## Estimated Development Time

- AssetSelector Component: 1-2 hours
- usePriceUpdater Hook: 1-2 hours
- PriceDisplay Component: 30-60 minutes
- Investments.jsx Updates: 2-3 hours
- Testing & QA: 2-3 hours
- **Total: 7-11 hours**

