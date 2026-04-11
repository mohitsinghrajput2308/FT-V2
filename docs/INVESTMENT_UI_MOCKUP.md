# Investment Asset Selector - UI Mockup

## Current Form (Before Feature)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━─
    Add Investment Form
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━─

📝 Investment Name
┌─────────────────────────────────────────┐
│ EURUSD (or whatever user types)          │
└─────────────────────────────────────────┘

📊 Type
┌─────────────────────────────────────────┐
│ Stocks              ▼                    │
│  ├─ Stocks                               │
│  ├─ Mutual Funds                         │
│  ├─ Crypto                               │
│  └─ Forex                                │
└─────────────────────────────────────────┘

💰 Purchase Price (User Must Research)
┌─────────────────────────────────────────┐
│ 1.0852 (user types manually)             │
└─────────────────────────────────────────┘

💵 Current Value (User Must Research)
┌─────────────────────────────────────────┐
│ 1.0870 (user types manually)             │
└─────────────────────────────────────────┘

📦 Quantity
┌─────────────────────────────────────────┐
│ 10000                                    │
└─────────────────────────────────────────┘

📅 Purchase Date
┌─────────────────────────────────────────┐
│ 2026-04-07                               │
└─────────────────────────────────────────┘

[Cancel]  [Add Investment]

❌ Problems:
- User must manually research prices
- No real-time updates
- Easy to enter wrong/outdated prices
- Takes 3-5 minutes per investment
```

---

## New Form (After Feature Implementation)

### Step 1: Select Asset Type

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━─
    Add Investment Form
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━─

📝 Investment Name
┌─────────────────────────────────────────┐
│ Search or select an asset                │
└─────────────────────────────────────────┘

📊 Type (Select First)
┌─────────────────────────────────────────┐
│ Please select type...   ▼                │
│  ├─ Stocks                               │
│  ├─ Mutual Funds (ETF)                   │
│  ├─ Cryptocurrency                       │
│  ├─ Commodities                          │
│  ├─ Forex Pairs          ← SELECT THIS   │
│  ├─ Bonds                                │
│  └─ Other                                │
└─────────────────────────────────────────┘

[Still disabled - waiting for type selection]

✓ Next Step: Select a Forex pair below
```

### Step 2: Asset Type Selected (Forex)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━─
    Add Investment Form (Forex Selected)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━─

🔍 Search & Select Asset
┌─────────────────────────────────────────┐
│ Search: EUR                    🔄        │
├─────────────────────────────────────────┤
│ ✓ EUR/USD   | Euro / USD        | 1.0852│
│   GBP/EUR   | Pound / Euro      | 0.8550│
│ ✓ EUR/JPY   | Euro / Yen        | 163.40│
│   EUR/GBP   | Euro / Pound      | 0.8550│
│   AUD/USD   | Australian / USD  | 0.6520│
│   USD/JPY   | Dollar / Yen      | 150.20│
│   GBP/USD   | Pound / USD       | 1.2650│
│   USD/CAD   | Dollar / Canadian | 1.3520│
│                                          │
│                    [Load more...]        │
└─────────────────────────────────────────┘

📝 Investment Name
┌─────────────────────────────────────────┐
│ EUR/USD                          ✓       │
└─────────────────────────────────────────┘

📊 Type
┌─────────────────────────────────────────┐
│ Forex                                    │
└─────────────────────────────────────────┘

[Cancel]  [Continue]
```

### Step 3: Asset Selected + Auto-filled

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━─
    Add Investment Form (EUR/USD Selected)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━─

📝 Investment Name
┌─────────────────────────────────────────┐
│ EUR/USD                         [Change] │
└─────────────────────────────────────────┘

📊 Type
┌─────────────────────────────────────────┐
│ Forex                                    │
└─────────────────────────────────────────┘

💰 Purchase Price (AUTO-FILLED ✓)
┌─────────────────────────────────────────┐
│ 1.0852   📍 Live Price | [Manual Edit]  │
├─────────────────────────────────────────┤
│ ⓘ Fetched: 2:15 PM    [Refresh]        │
└─────────────────────────────────────────┘

💵 Current Value (LIVE UPDATING 🔄)
┌─────────────────────────────────────────┐
│ 1.0872   △ +0.0020 (+0.18%) 📈         │
├─────────────────────────────────────────┤
│ 🔄 Updating... Last: 2:16 PM [Refresh] │
└─────────────────────────────────────────┘

📦 Quantity (USER MUST ENTER)
┌─────────────────────────────────────────┐
│ [blank - user enters]                    │
└─────────────────────────────────────────┘

📅 Purchase Date
┌─────────────────────────────────────────┐
│ 2026-04-07                               │
└─────────────────────────────────────────┘

[Cancel]  [Add Investment]

✓ Benefits:
- Prices auto-filled from live market data
- Current value updates every 5-30 seconds
- No manual research needed
- Takes ~30 seconds per investment
- User can still override prices if needed
```

---

## Real-time Price Update Behavior

### Scenario: Price Movement During Form Fill

```
TIME →

[T₀] User selects EUR/USD
  Purchase Price: 1.0852 ✓
  Current Value: 1.0852 🔄

[T₅s] Market moves
  Current Value: 1.0857 🔄 (green ↑ +0.05)

[T₁₀s] Market continues
  Current Value: 1.0865 🔄 (green ↑ +0.13)

[T₁₅s] Market fluctuates
  Current Value: 1.0860 🔄 (green ↑ +0.08)

[T₂₀s] User still filling form
  Status: "Last updated 2:16 PM"

[Submit] Investment saved with:
{
  name: "EUR/USD",
  type: "Forex",
  purchasePrice: 1.0852,      // Purchase price at time of selection
  currentValue: 1.0860,        // Current market price
  quantity: 10000,
  purchaseDate: "2026-04-07",
  lastFetched: "2:16:20 PM"
}
```

---

## Asset Selection Examples

### Example 1: Selecting Stock

```
1️⃣ Select Type: Stocks

2️⃣ Search Assets:
   "MSFT" → Microsoft Corp. | $415.50
   
3️⃣ Click MSFT
   ✓ Purchase Price: 415.50
   ✓ Current Value: 415.50 (live updating)
   
4️⃣ Enter Quantity: 100
   Enter Date: 2026-04-01
   
5️⃣ Submit ✓
```

### Example 2: Selecting Cryptocurrency

```
1️⃣ Select Type: Cryptocurrency

2️⃣ Search Assets:
   "BTC" → Bitcoin | $65,000.50
   
3️⃣ Click BTC
   ✓ Purchase Price: 65000.50
   ✓ Current Value: 65000.50 (live updating)
   
4️⃣ Enter Quantity: 0.5
   Enter Date: 2026-04-07
   
5️⃣ Submit ✓
```

### Example 3: Selecting Commodity

```
1️⃣ Select Type: Commodities

2️⃣ Search Assets:
   "Gold" → Gold vs US Dollar | $2,150.50
   
3️⃣ Click Gold
   ✓ Purchase Price: 2150.50
   ✓ Current Value: 2150.50 (live updating)
   
4️⃣ Enter Quantity: 10 (troy oz)
   Enter Date: 2026-04-07
   
5️⃣ Submit ✓
```

---

## Loading & Error States

### Loading State (While Fetching Price)

```
💰 Purchase Price
┌─────────────────────────────────────────┐
│ 🔄 Fetching live price...                │
└─────────────────────────────────────────┘

💵 Current Value
┌─────────────────────────────────────────┐
│ 🔄 Fetching live price...                │
└─────────────────────────────────────────┘
```

### Error State (Network Issue)

```
💰 Purchase Price
┌─────────────────────────────────────────┐
│ ⚠️  Could not fetch price (retry)        │
│    Please enter manually or:   [Retry]   │
├─────────────────────────────────────────┤
│ [      ]                                 │
└─────────────────────────────────────────┘

💵 Current Value
┌─────────────────────────────────────────┐
│ --  (Price unavailable)                  │
└─────────────────────────────────────────┘
```

### Success State (Data Fetched)

```
💰 Purchase Price
┌─────────────────────────────────────────┐
│ ✓ 1.0852  Last updated: 2:15 PM        │
└─────────────────────────────────────────┘

💵 Current Value
┌─────────────────────────────────────────┐
│ ✓ 1.0865 (△ +0.13%) 🔄 Updating...    │
└─────────────────────────────────────────┘
```

---

## Mobile Responsive Design

### Mobile View (Vertical Layout)

```
┌─────────────────────┐
│ Add Investment ✕    │
├─────────────────────┤
│                     │
│ 📊 Type            │
│ ┌─────────────────┐ │
│ │ Forex        ▼ │ │
│ └─────────────────┘ │
│                     │
│ 🔍 Select Asset    │
│ ┌─────────────────┐ │
│ │ EUR → Search  × │ │
│ ├─────────────────┤ │
│ │ EUR/USD 1.0852 │ │
│ │ GBP/USD 1.2650 │ │
│ │ USD/JPY 150.20 │ │
│ └─────────────────┘ │
│                     │
│ 💰 Buy: 1.0852     │
│ 💵 Now: 1.0865 📈  │
│                     │
│ 📦 Quantity: [ ]   │
│ 📅 Date: [__ / __] │
│                     │
│ [Cancel] [Add]     │
└─────────────────────┘
```

---

## Integration Points

### 1. Investments.jsx Changes
- Add state for `selectedAssetType`, `selectedAsset`
- Add asset selector component
- Add real-time price updater effect hook
- Update form validation

### 2. New Component: AssetSelector
- Searchable dropdown/combobox
- Filter `STOCK_FOREX_UNIVERSE` by type
- Display: `SYMBOL | Name | Price`
- Keyboard navigation support

### 3. New Component: PriceUpdater
- Real-time price display
- Update interval: 5-30 seconds
- Show loading/error states
- Manual refresh button

### 4. API Integration
- Use existing `/api/quote` endpoint
- Batch requests for multiple assets (limit 20/request)
- Cache results for 30 seconds

### 5. Data Layer
- Reference existing `STOCK_FOREX_UNIVERSE`
- Filter by asset type automatically
- Support custom assets in "Other" category

---

## Success Metrics

| Metric | Before | After | Goal |
|--------|--------|-------|------|
| Time to add investment | 3-5 min | 30 sec | ✓ 10x faster |
| Manual research required | Yes | No | ✓ Eliminated |
| Price accuracy | Manual entry ± | Live market ✓ | ✓ 100% accurate |
| Real-time updates | No | Yes | ✓ 5-30 sec |
| User satisfaction | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Expected improvement |
