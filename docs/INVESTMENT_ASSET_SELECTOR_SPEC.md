# Investment Asset Selector Feature Specification

## Overview
This specification outlines the dynamic asset selection feature for the Investment section of FinTrack. When users select an investment type (Stock, Forex, Crypto, etc.), the system will display built-in assets for that category and automatically populate real-time pricing data.

---

## Feature Requirements

### 1. Dynamic Asset Type Selection

#### Current Behavior
- User selects a generic investment type (e.g., "Stocks", "Forex", "Crypto")
- User manually enters asset name and pricing

#### **New Behavior**
- **Step 1**: User selects investment type from dropdown
  - `Stocks`
  - `Mutual Funds (ETF)`
  - `Cryptocurrency`
  - `Commodities (Gold, Silver, etc.)`
  - `Forex Pairs`
  - `Bonds`
  - `Indices`
  - `Options`
  - `Futures`
  - `Other` (custom entry)

### 2. Built-in Asset Display

#### Asset Categories with Predefined Assets

**Stocks** (50+ assets)
- Example: AAPL, MSFT, NVDA, GOOGL, AMZN, TSLA, etc.

**Forex Pairs** (10+ pairs)
- EUR/USD
- GBP/USD
- USD/JPY
- USD/CAD
- AUD/USD
- And more...

**Cryptos** (7+ assets)
- Bitcoin (BTC)
- Ethereum (ETH)
- Solana (SOL)
- Binance Coin (BNB)
- Ripple (XRP)
- Cardano (ADA)
- Avalanche (AVAX)

**Commodities** (10+ assets)
- Gold (XAUUSD)
- Silver (XAGUSD)
- Platinum (XPTUSD)
- Palladium (XPDUSD)

**ETFs** (6+ assets)
- SPY, QQQ, DIA, VTI, ARKK, GLD, etc.

**Indices** (5+ assets)
- S&P 500, NASDAQ-100, Dow Jones, Russell 2000, VIX

### 3. Asset Selection Behavior

#### When User Selects Asset Type:
1. **Modal/Form Updates**: Form displays a searchable dropdown or asset selector specific to that category
2. **Asset List Displays**: Built-in assets for that type appear as selectable options
3. **Search Functionality**: User can search/filter to find specific assets (e.g., type "EUR" to find EUR/USD)

#### When User Selects Specific Asset (e.g., EUR/USD):
1. **Automatic Purchase Price Fill**: 
   - `purchasePrice` field auto-populates with current market price
   - Example: User selects EUR/USD → `purchasePrice` = 1.0852

2. **Auto-fetch Current Price**:
   - System immediately fetches current price via Yahoo Finance API
   - Pre-fills `currentValue` field with live market price
   - Timestamp stored for reference

3. **Real-time Price Updates**:
   - Current value updates in real-time as market prices move
   - Update interval: Every 5-30 seconds (configurable)
   - Only updates while modal is open or investments page is active
   - Visual indicator (spinner/badge) shows last update time

### 4. UI/UX Enhancements

#### Investment Form Modal Updates

**Before Selecting Asset Type**:
```
- Investment Name: [open text input]
- Type: [dropdown - Stocks, Forex, Crypto, etc.]
```

**After Selecting Asset Type (e.g., Forex)**:
```
- Investment Name: [searchable asset dropdown - populated with Forex pairs]
  Options: EUR/USD, GBP/USD, USD/JPY, etc.
- Type: [Forex - locked/readonly]
- Search Bar: [Type to filter assets]
```

**After Selecting Asset (e.g., EUR/USD)**:
```
- Investment Name: [EUR/USD - populated from selection]
- Type: [Forex - locked/readonly]
- Purchase Price: [1.0852 - auto-filled from current market price]
- Current Value: [1.0852 - auto-filled, live updating]
- Quantity: [blank - user enters]
- Purchase Date: [today's date by default]
- Status Badge: [Last updated: 2:15 PM] [Refresh button]
```

#### Key UI Elements

1. **Asset Selector Component**
   - Searchable dropdown/combobox
   - Display format: `SYMBOL | Full Name | Current Price`
   - Example: `EUR/USD | Euro / US Dollar | 1.0852`

2. **Price Update Indicator**
   - Shows "Fetching..." while loading
   - Shows last update timestamp
   - Refresh button for manual update
   - Color change indicator (green ↑ for gains, red ↓ for losses)

3. **Real-time Price Badge**
   - Displays current price with change percentage
   - Updates asynchronously without blocking form

### 5. Technical Implementation

#### Data Source
- Use `STOCK_FOREX_UNIVERSE` from `/landing-page/src/dashboard/data/marketAssets.js`
- Already contains 100+ pre-defined assets with types

#### API Integration
- **Fetch Quote URL**: `/api/quote?symbols=EUR/USD,EURUSD=X`
- **Fetch Search**: `/api/search?q=EUR`
- Uses Yahoo Finance API backend

#### State Management
- Add state for: `selectedAssetType`, `selectedAsset`, `livePrice`, `lastUpdateTime`
- Implement real-time subscription/polling for price updates

#### Components Involved
- `Investments.jsx` - Main investment page
- `Modal` component - Already exists
- **New**: Asset Selector Component
- **New**: Price Badge/Real-time Display Component

### 6. Form Validation Rules

After asset selection:
- ✅ `Investment Name` - Auto-filled from asset selection
- ✅ `Type` - Auto-filled from asset type
- ✅ `Purchase Price` - Auto-filled from market price (user can override)
- ⚠️ `Current Value` - Auto-filled, user can edit, real-time updates
- ❌ `Quantity` - **Required user input**
- ❌ `Purchase Date` - **Required user input** (defaults to today)

### 7. Error Handling

1. **Asset Not Found**: Show warning if selected asset not in universe
2. **API Failure**: Show error, allow manual price entry
3. **Price Update Failure**: Show last known price with warning badge
4. **Network Issues**: Queue update, retry after connection restored

### 8. Performance Considerations

- **Lazy Load Asset Lists**: Don't fetch all asset data until type is selected
- **Debounce Search**: Wait 300ms after user stops typing before searching
- **Batch Quote Requests**: Request up to 20 quotes at once
- **Cache Prices**: Cache for 30 seconds to avoid redundant requests
- **Stop Updates**: Disable real-time updates when modal closes

---

## Implementation Workflow

### Phase 1: Asset Selector Component
1. Create searchable asset dropdown component
2. Filter assets by selected type
3. Format asset display (SYMBOL | Name | Price)

### Phase 2: Auto-fill Logic
1. When asset selected, fetch current price from Yahoo Finance
2. Pre-fill `purchasePrice` and `currentValue` with live price
3. Store selected asset reference in form state

### Phase 3: Real-time Updates
1. Set up price polling/subscription interval
2. Update `currentValue` as prices move
3. Show update indicator and timestamp
4. Stop updates when modal closes

### Phase 4: UI Polish
1. Add loading states
2. Add error boundaries
3. Add refresh button
4. Format price displays with currency symbols
5. Add keyboard navigation for asset selection

### Phase 5: Testing & Optimization
1. Test with different asset types
2. Test network failures and recovery
3. Performance test with rapid modal open/close
4. Mobile responsiveness test

---

## Data Flow Diagram

```
User Selects Investment Type
    ↓
Asset Dropdown Populated (filtered from STOCK_FOREX_UNIVERSE)
    ↓
User Searches/Selects Asset (e.g., "EUR/USD")
    ↓
System Fetches Live Price from /api/quote?symbols=EURUSD=X
    ↓
Auto-fill Purchase Price & Current Value
    ↓
Set Real-time Update Interval (5-30 sec)
    ↓
Every Interval: Fetch Latest Price
    ↓
Update Current Value Display + Timestamp
    ↓
User Enters Quantity & Purchase Date
    ↓
User Clicks Submit
    ↓
Create Investment with Asset Reference
```

---

## API Endpoints Used

### Yahoo Finance Quote API
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

### Yahoo Finance Search API
```
GET /api/search?q=EUR
Response:
{
  "quotes": [
    {
      "symbol": "EURUSD=X",
      "shortName": "EUR/USD",
      "longName": "Euro / US Dollar",
      "quoteType": "CURRENCY"
    },
    ...
  ]
}
```

---

## Browser Storage

### LocalStorage for Watchlist (Already Exists)
```javascript
// Example: fintrack_watchlist_custom
[
  { id: 'CUSTOM1', symbol: 'CUSTOM1', name: 'My Custom Asset', type: 'Stock', price: 100 }
]
```

### Session Storage for Real-time Updates (New)
- Cache fetched prices for 30 seconds
- Clear on modal close

---

## Accessibility & Mobile Considerations

1. ✅ Keyboard navigation for asset selector
2. ✅ ARIA labels for real-time updates
3. ✅ Responsive dropdown on mobile
4. ✅ Touch-friendly asset selection
5. ✅ High contrast for price changes (green/red)

---

## Success Metrics

- ✅ Asset selection reduces manual data entry by 90%
- ✅ Real-time price updates refresh within 30 seconds
- ✅ No performance degradation on investments page
- ✅ Mobile users can select assets efficiently
- ✅ User can override auto-filled prices if needed

---

## Example User Flow

### Before Feature
1. Click "Add Investment"
2. Type name manually: "EURUSD"
3. Select type: "Forex"
4. Manually research and enter purchase price: 1.0852
5. Manually research and enter current price: 1.0870
6. Enter quantity: 10000
7. Set purchase date
8. Click Submit

**Time: ~3-5 minutes** ⏱️

### After Feature
1. Click "Add Investment"
2. Select type: "Forex"
3. Start typing: "EUR" → See "EUR/USD | Euro / US Dollar | 1.0852"
4. Click EUR/USD
   - Purchase Price auto-fills: 1.0852
   - Current Value auto-fills: 1.0852
   - Updates in real-time
5. Enter quantity: 10000
6. Click Submit

**Time: ~30 seconds** ⏱️

---

## Notes

- This feature leverages the existing `STOCK_FOREX_UNIVERSE` data (100+ assets)
- Yahoo Finance API is already integrated (`/api/quote` and `/api/search`)
- Real-time updates can be implemented with polling (simple) or WebSocket (advanced)
- Users can still manually enter custom assets by selecting "Other"
