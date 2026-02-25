# The Complete AI-First Documentation Guide for Building FinTrack

## Introduction

This guide provides comprehensive documentation for **FinTrack** — a Finance Management & Investment Tracker system built as both a **Website (Landing Page)** and a **Mobile App (React Native/Expo for Android)**. It follows the six canonical documents approach to eliminate AI hallucinations and ensure consistent, predictable builds.

**The six documents:**
1. **PRD.md** — WHAT to build
2. **APP_FLOW.md** — HOW users navigate
3. **TECH_STACK.md** — WHICH tools to use
4. **FRONTEND_GUIDELINES.md** — HOW it should look
5. **BACKEND_STRUCTURE.md** — HOW data works
6. **IMPLEMENTATION_PLAN.md** — WHAT ORDER to build

---

## Document 1: PRD.md (Product Requirements Document)

### Purpose

Your contract with AI. Defines **what** FinTrack is building, **who** it's for, and **what success looks like**. No ambiguity allowed.

### Best Practices

- Start with user goals and problems, not features
- Include explicit out-of-scope items to prevent scope creep
- Use SMART criteria for success metrics
- Keep it concise but comprehensive
- Use clear, specific language — no vague terms
- Include user stories in "As a [user], I want [goal], so that [benefit]" format

### Structure Template

```
# Product Requirements Document (PRD) — FinTrack

## 1. Product Overview
- **Project Title**: FinTrack — Finance Management & Investment Tracker
- **Version**: 1.0
- **Last Updated**: February 2026
- **Owner**: [Your Name]
- **Platforms**: Android (React Native/Expo) + Website (React Landing Page)

## 2. Problem Statement
Managing personal finances across multiple accounts, tracking daily expenses,
creating budgets, and monitoring investments is overwhelming for most users.
Existing solutions are either too complex (enterprise-level) or too basic
(simple calculators). FinTrack bridges this gap by providing an intuitive,
all-in-one finance management system with real-time investment tracking,
smart budget management, and detailed analytics — accessible on mobile and web.

## 3. Goals & Objectives

### Business Goals
- Achieve 10,000+ registered users within 6 months of launch
- Maintain 60%+ monthly active user retention rate
- Track $10M+ in aggregate user transactions within first year

### User Goals
- Effortlessly log and categorize income/expenses
- Set and monitor monthly budgets by category
- Track stock investments with real-time price updates
- Gain financial insights through visual analytics
- Access finances on-the-go via mobile app

## 4. Success Metrics
- **User Registration**: 1,000+ signups in first month
- **Daily Active Users**: 30%+ of registered users
- **Transaction Logging**: Avg 5+ transactions per user per week
- **Budget Adherence**: 70%+ users stay within budget
- **App Store Rating**: 4.5+ stars

## 5. Target Users & Personas

### Primary Persona: "Priya" — Young Professional
- **Demographics**: Age 22-35, salaried professional, tech-savvy
- **Pain Points**: Can't track where money goes, no savings discipline
- **Goals**: Track expenses, build savings, start investing
- **Technical Proficiency**: High (daily smartphone user)

### Secondary Persona: "Rajesh" — Small Business Owner
- **Demographics**: Age 30-50, runs a small business
- **Pain Points**: Mixing personal and business expenses, no budget visibility
- **Goals**: Separate expense tracking, investment portfolio management
- **Technical Proficiency**: Medium

### Tertiary Persona: "Anita" — College Student
- **Demographics**: Age 18-24, limited income (allowance/part-time)
- **Pain Points**: Runs out of money mid-month, no financial awareness
- **Goals**: Budget meals/entertainment, learn to save
- **Technical Proficiency**: High

## 6. Features & Requirements

### Must-Have Features (P0)

1. **User Authentication**
   - Description: Email/password signup and login via Supabase Auth
   - User Story: As a user, I want to create an account so that my data is secure
   - Acceptance Criteria:
     - [ ] User can register with email, password, username
     - [ ] User can login with email/password
     - [ ] User can logout
     - [ ] User can reset password via email
     - [ ] Session persists across app restarts (SecureStore)
   - Success Metric: 95%+ successful login rate

2. **Dashboard Overview**
   - Description: At-a-glance financial summary with key metrics
   - User Story: As a user, I want to see my financial status at a glance
   - Acceptance Criteria:
     - [ ] Shows total income, total expenses, net balance
     - [ ] Shows savings rate percentage
     - [ ] Shows recent transactions (last 5)
     - [ ] Shows top expense category
     - [ ] Shows monthly change indicator
   - Success Metric: Users check dashboard 3+ times/week

3. **Transaction Management**
   - Description: CRUD operations for income and expense transactions
   - User Story: As a user, I want to log my transactions so I can track spending
   - Acceptance Criteria:
     - [ ] Add income/expense with amount, category, description, date
     - [ ] Edit existing transactions
     - [ ] Delete transactions with confirmation
     - [ ] Filter by type (income/expense), category, date range
     - [ ] Sort by date, amount, category
     - [ ] Search transactions by description
   - Success Metric: Avg 5+ transactions logged per user per week

4. **Budget Management**
   - Description: Set monthly budgets per expense category with tracking
   - User Story: As a user, I want to set budgets so I can control spending
   - Acceptance Criteria:
     - [ ] Create budgets per category for each month/year
     - [ ] View budget vs actual spending progress bars
     - [ ] Color-coded alerts (green/yellow/red) for budget status
     - [ ] Edit and delete budgets
     - [ ] Show percentage used per category
   - Success Metric: 70%+ users set at least 3 budgets

5. **Investment Tracker**
   - Description: Track stock investments with purchase and current prices
   - User Story: As a user, I want to monitor my stock portfolio performance
   - Acceptance Criteria:
     - [ ] Add investment: stock symbol, quantity, purchase price, date
     - [ ] Display current price (manual or API)
     - [ ] Show gain/loss per investment (amount and percentage)
     - [ ] Show total portfolio value and total gain/loss
     - [ ] Edit and delete investments
   - Success Metric: Users with 2+ investments tracked

6. **Settings & Profile**
   - Description: User preferences and account management
   - User Story: As a user, I want to customize my app experience
   - Acceptance Criteria:
     - [ ] Toggle dark/light theme
     - [ ] View and edit username
     - [ ] Sign out functionality
     - [ ] Theme preference persists in database
   - Success Metric: 50%+ users customize theme

### Should-Have Features (P1)

1. **Visual Analytics & Charts**
   - Pie charts for expense breakdown
   - Line charts for monthly income vs expense trends
   - Bar charts for budget utilization

2. **Bill Reminders**
   - Set recurring bill reminders
   - Push notifications for upcoming bills

3. **Export Data**
   - Export transactions as CSV/PDF
   - Monthly financial summary reports

4. **Multi-Currency Support**
   - Support INR, USD, EUR, GBP
   - Currency conversion display

### Nice-to-Have Features (P2)

1. **AI-Powered Insights** — ML-based spending pattern analysis
2. **Bank Account Linking** — Auto-import transactions from bank APIs
3. **Social/Family Sharing** — Share budgets with family members
4. **Financial Goal Tracking** — Set and track savings goals with milestones
5. **Recurring Transactions** — Auto-log recurring subscriptions/salaries

## 7. Explicitly OUT OF SCOPE (V1)
- Cryptocurrency tracking
- Tax filing or tax calculation features
- Loan/EMI management
- Insurance management
- Direct bank account linking (Plaid/similar APIs)
- Social features (sharing, groups)
- Desktop application (Windows/Mac native)
- Offline-first mode with full sync
- Multi-language / internationalization
- Biometric authentication (fingerprint/face)

## 7.5 Platform Scope

### 📱 Mobile App (React Native/Expo — Android)
The mobile app is the **primary product** — all P0/P1/P2 features above apply to it.
Users interact with the app for daily finance management tasks.

### 🌐 Website (React Landing Page)
The website is a **marketing/conversion tool** — a single-page landing page with:

| Section | Purpose |
|---------|---------|
| **Navbar** | Navigation with theme toggle, login/signup CTAs |
| **Hero** | Value proposition, animated stats (100K+ users, ₹500Cr+ tracked, 4.9/5 rating) |
| **Features** | 6 feature cards: Expense Tracking, Budget Planning, AI Insights, Reports, Bill Reminders, Investment Portfolio |
| **3D Showcase** | Animated dashboard mockup demonstrating the app experience |
| **How It Works** | 4-step onboarding: Create Account → Add Finances → Track & Analyze → Achieve Goals |
| **Pricing** | 3 tiers with multi-currency: Free (₹0), Pro (₹199/mo), Business (₹399/mo) |
| **FAQ** | 8 common questions (data security, Indian investments, payment methods) |
| **CTA** | Final conversion prompt with trust indicators |
| **Footer** | Links (Product, Company, Resources, Legal), newsletter signup, social links |

**Website features NOT in scope**: The website is static/marketing only — no user dashboard, no transaction management, no authentication flow, no actual app functionality. Those are mobile-app-only.

## 8. User Scenarios

### Scenario 1: Daily Expense Logging
- **Context**: Priya buys coffee and lunch during work
- **Steps**:
  1. Opens FinTrack app
  2. Taps "Add Transaction" on Dashboard or Transactions screen
  3. Selects "Expense" type
  4. Enters ₹150, category "Food & Dining", description "Lunch"
  5. System saves and updates dashboard totals
- **Expected Outcome**: Transaction appears in list, dashboard balance updates
- **Edge Cases**: No internet → show error, negative amount → validation error

### Scenario 2: Monthly Budget Review
- **Context**: End of month, Rajesh checks budget utilization
- **Steps**:
  1. Opens Budget screen
  2. Views progress bars for each category
  3. Sees "Entertainment" is at 95% (red)
  4. Taps category to see individual transactions
  5. Decides to reduce spending next month
- **Expected Outcome**: Clear visual of over/under budget categories
- **Edge Cases**: No budget set → show "Create Budget" CTA

### Scenario 3: Investment Portfolio Check
- **Context**: Anita checks how her first stock is performing
- **Steps**:
  1. Opens Investments screen
  2. Sees portfolio summary (total value, total gain/loss)
  3. Views individual stock with purchase vs current price
  4. Sees +15% gain highlighted in green
- **Expected Outcome**: Clear portfolio performance view
- **Edge Cases**: Current price not available → show "N/A", API failure → show last known price

## 9. Dependencies & Constraints
- **Technical Constraints**: 
  - React Native/Expo (no native modules requiring ejection)
  - Supabase free tier limits (50,000 rows, 500MB storage)
  - No real-time stock API in V1 (manual entry)
- **Business Constraints**: Solo developer, limited budget (free tier services only)
- **External Dependencies**: 
  - Supabase (Auth + PostgreSQL database)
  - Expo SDK 54
  - React Navigation 7

## 10. Timeline & Milestones
- **MVP (V1.0)**: 4 weeks — Auth, Dashboard, Transactions, Budgets, Investments, Settings
- **V1.1**: 6 weeks — Charts/Analytics, Export, Bill Reminders
- **V2.0**: 12 weeks — AI Insights, Bank Linking, Goals

## 11. Risks & Assumptions
### Risks
- Supabase free tier limits → Migrate to paid plan if user growth exceeds limits
- Expo SDK breaking changes → Pin to SDK 54, test before upgrading
- React Native performance with large transaction lists → Implement pagination

### Assumptions
- Users have internet connectivity for all operations
- Users will manually enter transactions (no auto-import)
- Stock prices are entered manually in V1

## 12. Non-Functional Requirements
- **Performance**: App launch < 3s, screen transitions < 300ms
- **Security**: Supabase RLS on all tables, SecureStore for tokens, no plaintext passwords
- **Accessibility**: Minimum touch targets 44x44px, readable font sizes (14px+)
- **Scalability**: Supabase handles scaling, app supports 10,000+ transactions per user
- **Offline**: Graceful error handling when offline (no offline-first in V1)

## 13. References & Resources
- Supabase Docs: https://supabase.com/docs
- Expo Docs: https://docs.expo.dev
- React Navigation: https://reactnavigation.org
- React Native: https://reactnative.dev
```

### Sample AI Prompt for PRD Generation

```
Create a comprehensive Product Requirements Document (PRD) for FinTrack —
a Finance Management & Investment Tracker mobile app built with React Native/Expo
and Supabase backend.

Context:
- Target Users: Young professionals, small business owners, students in India
- Main Problem: No simple, unified app for expense tracking + budgets + investments
- Unique Value: All-in-one finance tool with beautiful UI, dark mode, real-time analytics

Structure the PRD with these sections:
1. PROBLEM STATEMENT — specific pain points for each persona
2. GOALS & OBJECTIVES — SMART business + user goals
3. SUCCESS METRICS — quantifiable metrics with targets
4. TARGET PERSONAS — 3 detailed personas (professional, business owner, student)
5. FEATURES & REQUIREMENTS — P0 (Auth, Dashboard, Transactions, Budgets, Investments, Settings),
   P1 (Charts, Reminders, Export), P2 (AI, Bank linking, Goals)
   For each: description, user story, 5+ acceptance criteria, success metric
6. EXPLICITLY OUT OF SCOPE — crypto, tax, loans, bank linking, i18n, biometrics
7. USER SCENARIOS — 3 end-to-end scenarios with edge cases
8. NON-FUNCTIONAL REQUIREMENTS — performance, security, accessibility, scalability
9. DEPENDENCIES & CONSTRAINTS — Supabase, Expo, React Navigation, free tier limits
10. TIMELINE — MVP in 4 weeks, V1.1 in 6, V2.0 in 12

CRITICAL: Use specific metrics, testable criteria, no vague language.
OUTPUT FORMAT: Markdown with clear headers and bullet points.
```

---

## Document 2: APP_FLOW.md (Application Flow & Navigation)

### Purpose

Maps every screen, every user path, every decision point in FinTrack. Prevents AI from guessing navigation patterns. Covers both the **mobile app** (React Native) and the **landing page** (React web).

### Best Practices

- Start with user goals, not screens
- Document entry points explicitly
- Show decision points and branching logic
- Include success paths AND error states
- Keep flows focused on single goals
- Document what triggers each flow

### Structure Template

```
# Application Flow Documentation — FinTrack

## 1. Entry Points

### Mobile App (React Native/Expo)
- **App Launch**: Shows Loading Screen → checks auth → Login OR Dashboard
- **Deep Link**: `fintrack://reset-password` (password reset from email)
- **Push Notification**: Opens relevant screen (future: bill reminders)

### Landing Page (Website)
- **Direct URL**: `https://financeflow.app` → Hero section
- **Search Engine**: SEO landing → Features/Pricing sections
- **Marketing Links**: Campaign-specific UTM tracking

## 2. Core User Flows

### Flow 1: User Registration (Mobile App)
**Goal**: Create a new FinTrack account
**Entry Point**: Login Screen → "Create Account" link

#### Happy Path
1. **Screen: Login Screen**
   - Elements: Email input, Password input, Login button, "Create Account" link
   - User Action: Taps "Create Account"
   - Trigger: Navigate to Register Screen

2. **Screen: Register Screen**
   - Elements: Username input, Email input, Password input, Confirm Password,
     Register button, "Already have account?" link
   - User Actions:
     - Enters username (3+ chars)
     - Enters valid email
     - Enters password (6+ chars)
     - Confirms password
   - Validation:
     - All fields required
     - Email format check
     - Password minimum length
     - Passwords must match
   - Trigger: Taps "Create Account" button

3. **System Action**: Supabase auth.signUp() + database trigger creates profile

4. **Screen: Dashboard**
   - User is auto-logged-in after successful registration
   - Shows empty state with "Add your first transaction" CTA
   - Success State: User is authenticated and ready to use app

#### Error States
- **Duplicate Email**
  - Display: Alert "This email is already registered. Please login instead."
  - Action: User taps OK, navigates to Login

- **Weak Password**
  - Display: Inline error "Password must be at least 6 characters"
  - Action: User strengthens password

- **Network Error**
  - Display: Alert "Network error. Please check your connection."
  - Action: User retries after connectivity restored

#### Edge Cases
- User closes app mid-registration → No partial data saved, must restart
- Email verification required by Supabase → Show verification prompt
- Rate limiting → Show "Too many attempts, try again later"

---

### Flow 2: Transaction Entry
**Goal**: Log a new income or expense transaction
**Entry Point**: Dashboard "+" button OR Transactions Screen "+" FAB

#### Happy Path
1. **Screen: Dashboard or Transactions**
   - User Action: Taps "+" / "Add Transaction" button
   - Trigger: Opens Add Transaction modal/screen

2. **Modal: Add Transaction**
   - Elements:
     - Type selector (Income/Expense tabs)
     - Amount input (numeric keyboard)
     - Category dropdown (context-based: expense or income categories)
     - Description text input (optional)
     - Date picker (defaults to today)
     - Save button
   - User Actions:
     - Selects type (Income or Expense)
     - Enters amount (e.g., 1500)
     - Picks category (e.g., "Food & Dining")
     - Optionally adds description
     - Optionally changes date
   - Validation:
     - Amount > 0, required
     - Category required
     - Date required (auto-filled)
   - Trigger: Taps "Save" / "Add Transaction"

3. **System Action**: Insert into Supabase `transactions` table with user_id

4. **Return: Updated Screen**
   - Transaction list refreshes showing new entry
   - Dashboard totals recalculate
   - Success: User sees transaction in list immediately

#### Error States
- **Invalid Amount**: Shows "Please enter a valid amount"
- **Network Error**: Shows error alert, data NOT saved
- **Server Error**: Shows "Something went wrong. Please try again."

---

### Flow 3: Budget Management
**Goal**: Create and monitor monthly budgets
**Entry Point**: Bottom tab bar → Budget icon (💰)

#### Happy Path
1. **Screen: Budget Screen**
   - Shows month/year selector at top
   - Displays category budget cards with progress bars
   - Each card: Category name, budget amount, spent amount, % used
   - Color coding: Green (<60%), Yellow (60-89%), Red (90%+)
   - "Add Budget" button

2. **Action: Add Budget**
   - Elements: Category picker, Amount input, Month/Year auto-set
   - User: Selects "Entertainment", enters ₹5,000
   - System: Inserts into `budgets` table (unique per user+category+month+year)

3. **Result**: New budget card appears with 0% progress bar

#### Error States
- **Duplicate**: "Budget for this category already exists this month"
- **Zero Amount**: "Budget amount must be greater than 0"

---

### Flow 4: Investment Portfolio
**Goal**: Track stock investments and performance
**Entry Point**: Bottom tab bar → Invest icon (📈)

#### Happy Path
1. **Screen: Investments Screen**
   - Portfolio summary: Total value, Total gain/loss, % change
   - List of investments: Symbol, Quantity, Purchase price, Current price, Gain/Loss
   - "Add Investment" button

2. **Action: Add Investment**
   - Elements: Stock symbol input, Quantity input, Purchase price input,
     Current price input (optional), Purchase date picker
   - System: Inserts into `investments` table

3. **Result**: Investment card appears with calculated gain/loss

---

## 3. Navigation Map

### Mobile App Navigation Tree

```
App Launch
├── Loading Screen (auth check)
│   ├── [Not Authenticated] → Auth Stack
│   │   ├── Login Screen
│   │   │   ├── "Create Account" → Register Screen
│   │   │   └── "Forgot Password" → Reset Password (via email)
│   │   └── Register Screen
│   │       └── "Already have account?" → Login Screen
│   └── [Authenticated] → Main App
│       ├── 📊 Dashboard (Home tab)
│       │   ├── Financial Summary Cards
│       │   ├── Recent Transactions List
│       │   └── Quick Add Transaction
│       ├── 💳 Transactions (Tab)
│       │   ├── Transaction List (filterable, searchable)
│       │   ├── Add Transaction Modal
│       │   ├── Edit Transaction Modal
│       │   └── Delete Transaction (confirmation)
│       ├── 💰 Budget (Tab)
│       │   ├── Month/Year Selector
│       │   ├── Budget Progress Cards
│       │   ├── Add Budget Modal
│       │   └── Edit/Delete Budget
│       ├── 📈 Investments (Tab)
│       │   ├── Portfolio Summary
│       │   ├── Investment List
│       │   ├── Add Investment Modal
│       │   └── Edit/Delete Investment
│       └── ⚙️ Settings (Tab)
│           ├── Profile Info
│           ├── Theme Toggle (Dark/Light)
│           └── Sign Out
```

### Landing Page Navigation

```
Landing Page (Single Page)
├── Navbar (fixed, glass-morphism)
│   ├── Logo → Scroll to top
│   ├── Features → Scroll to Features
│   ├── How It Works → Scroll to How It Works
│   ├── Pricing → Scroll to Pricing
│   ├── FAQ → Scroll to FAQ
│   ├── Log In → /login (future)
│   └── Get Started Free → /register (future)
├── Hero Section (3D animations, stats)
├── Features Section (6 feature cards)
├── How It Works (4-step process)
├── 3D Showcase Section (dark, animated stats)
├── Pricing Section (Free/Pro/Business tiers)
├── FAQ Section (accordion)
├── CTA Section (gradient, sign-up prompt)
└── Footer (links, newsletter, social)
```

### Navigation Rules
- **Authentication Required**: All main app screens (Dashboard, Transactions, Budget, Investments, Settings)
- **Redirect Logic**: Unauthenticated users → Login Screen always
- **Tab Persistence**: Tab state resets on tab switch (no deep state preservation in V1)
- **Back Button**: Android hardware back → exits app from Dashboard, goes back from other screens

## 4. Screen Inventory

### Screen: Login
- **Route**: Auth Stack → "Login"
- **Access**: Public (unauthenticated only)
- **Purpose**: Authenticate existing users
- **Key Elements**: Logo/emoji (💰), Email input, Password input, Login button,
  Create Account link, Forgot Password link
- **Actions**: Login → Dashboard, Create Account → Register, Forgot Password → Email reset
- **State Variants**: Default, Loading (spinner on button), Error (alert message)

### Screen: Register
- **Route**: Auth Stack → "Register"
- **Access**: Public
- **Purpose**: Create new user account
- **Key Elements**: Username/Email/Password/Confirm inputs, Register button, Login link
- **Actions**: Register → Dashboard, Login link → Login Screen
- **State Variants**: Default, Loading, Error, Success (auto-redirect)

### Screen: Dashboard
- **Route**: Main App → Tab "dashboard"
- **Access**: Authenticated
- **Purpose**: Financial overview at a glance
- **Key Elements**: Welcome header, Summary cards (income/expense/balance/savings rate),
  Recent transactions list, Quick action buttons
- **Actions**: Add Transaction → Modal, View All → Transactions tab
- **State Variants**: Loading (skeleton), Empty (no transactions CTA), Populated, Error

### Screen: Transactions
- **Route**: Main App → Tab "transactions"
- **Access**: Authenticated
- **Purpose**: Full transaction management
- **Key Elements**: Filter bar (type, category, date), Search bar, Transaction list,
  FAB (floating action button) for add
- **Actions**: Add → Modal, Edit → Modal, Delete → Confirmation, Filter → Filtered list
- **State Variants**: Loading, Empty, Filtered empty, Populated, Error

### Screen: Budget
- **Route**: Main App → Tab "budget"
- **Access**: Authenticated
- **Purpose**: Monthly budget tracking
- **Key Elements**: Month/year picker, Budget category cards with progress bars,
  Add budget button
- **Actions**: Add → Modal, Edit → Modal, Delete → Confirmation, Change month → Refresh
- **State Variants**: Loading, Empty (no budgets), Populated, Error

### Screen: Investments
- **Route**: Main App → Tab "investments"
- **Access**: Authenticated
- **Purpose**: Stock portfolio tracking
- **Key Elements**: Portfolio summary header, Investment list with gain/loss,
  Add investment button
- **Actions**: Add → Modal, Edit → Modal, Delete → Confirmation
- **State Variants**: Loading, Empty, Populated, Error

### Screen: Settings
- **Route**: Main App → Tab "settings"
- **Access**: Authenticated
- **Purpose**: User preferences and account
- **Key Elements**: Profile section (username, email), Theme toggle switch, Sign Out button
- **Actions**: Toggle theme → Updates immediately + saves to DB, Sign Out → Login Screen
- **State Variants**: Default, Loading (profile fetch)

## 5. Decision Points

### Decision: Authentication Status
```
IF user session exists AND is valid
THEN show: Main App (Dashboard as default tab)
ELSE
THEN show: Auth Stack (Login Screen)
```

### Decision: Transaction Type
```
IF user selects "Income"
THEN show: Income categories (Salary, Freelance, Business, etc.)
AND use: Green color accent
ELSE IF user selects "Expense"
THEN show: Expense categories (Food, Transport, Housing, etc.)
AND use: Red color accent
```

### Decision: Budget Alert Level
```
IF budget usage < 60%
THEN show: Green progress bar
ELSE IF budget usage >= 60% AND < 90%
THEN show: Yellow/amber progress bar
ELSE IF budget usage >= 90%
THEN show: Red progress bar with warning
```

### Decision: Investment Performance
```
IF current_price > purchase_price
THEN show: Green text with "+" prefix and ↑ arrow
ELSE IF current_price < purchase_price
THEN show: Red text with "-" prefix and ↓ arrow
ELSE
THEN show: Gray text with "0%" (no change)
```

### Decision: Theme
```
IF user.theme_preference === 'dark'
THEN apply: Dark color palette (background: #0F172A, text: #F8FAFC)
ELSE
THEN apply: Light color palette (background: #F8FAFC, text: #0F172A)
```

## 6. Error Handling Flows

### Network Offline
- Display: Alert "No internet connection. Please check your network."
- Actions: Retry button, dismiss
- Recovery: User restores connection and retries action

### Supabase Auth Error
- Display: Inline error below form field or Alert dialog
- Common: "Invalid credentials", "Email already registered", "Too many requests"
- Actions: User corrects input and retries

### Data Load Failure
- Display: Error state on screen with retry button
- Fallback: Show cached data if available (future), else empty state with error
- Recovery: Pull-to-refresh or retry button

## 7. Responsive Behavior

### Mobile App (Primary)
- Navigation: Custom bottom tab bar with emoji icons
- Forms: Full-screen modals with numeric keyboard for amounts
- Lists: Vertical scroll with pull-to-refresh
- Actions: FAB for primary actions, swipe for edit/delete (future)

### Web (Landing Page Only)
- Navigation: Full horizontal navbar with glass-morphism on scroll
- Mobile web: Hamburger menu with slide-out drawer
- Sections: Full-width with max-width container
- Animations: 3D floating elements, parallax, particle systems

## 8. Animation & Transitions

### Mobile App
- **Tab Switch**: Instant render (no animation, state-based)
- **Modal Open**: React Native default slide-up
- **Button Press**: Opacity feedback (TouchableOpacity)
- **Loading**: ActivityIndicator spinner (indigo #6366F1)
- **Theme Toggle**: Instant color swap (no transition in V1)

### Landing Page
- **Page Load**: fade-in + slide-up (CSS keyframes)
- **Scroll**: Floating elements with parallax
- **Hover**: Scale(1.05) + shadow-xl on cards
- **Hero**: Blob animations (7s), floating coins (6s), particle system
- **3D Section**: rotate-3d (20s), shimmer (3s), holographic (8s)
```

### Sample AI Prompt for APP_FLOW Generation

```
Create comprehensive Application Flow documentation for FinTrack —
a Finance Management & Investment Tracker.

Context: React Native/Expo mobile app with Supabase backend.
Screens: Login, Register, Dashboard, Transactions, Budget, Investments, Settings.
Navigation: Custom bottom tab bar (no React Navigation Tab Navigator).

Generate:
1. ENTRY POINTS — App launch auth check, deep links for password reset
2. CORE USER FLOWS — Registration, Transaction Entry, Budget Management, Investment Tracking
   For EACH: Happy path (step-by-step with screen elements), Error states, Edge cases
3. NAVIGATION MAP — Full tree for Auth Stack + Main App with all tabs
4. SCREEN INVENTORY — Route, access level, purpose, key elements, actions, state variants
5. DECISION POINTS — Auth status, transaction type categories, budget alerts, theme
6. ERROR HANDLING — Network offline, auth errors, data load failures
7. RESPONSIVE BEHAVIOR — Mobile app vs landing page
8. ANIMATIONS — Mobile (minimal) vs Landing page (3D, particles, parallax)

CRITICAL: Every user action must have a clear next step. Document BOTH success and failure.
OUTPUT FORMAT: Markdown with navigation trees, decision logic blocks, clear sections.
```

---

## Document 3: TECH_STACK.md (Technology Stack)

### Purpose

Locks every dependency, tool, and version for FinTrack. Zero ambiguity on what to use across both the mobile app and landing page.

### Best Practices

- Specify EXACT versions (not "latest")
- Document WHY each choice was made
- Include setup/installation instructions
- List compatibility requirements
- Track security considerations
- Document update/upgrade policies

### Structure Template

```
# Technology Stack Documentation — FinTrack

## 1. Stack Overview
**Last Updated**: February 2026
**Version**: 1.0

### Architecture Pattern
- **Mobile App**: React Native (Expo managed workflow) + Supabase BaaS
- **Landing Page**: React SPA with Tailwind CSS + Shadcn UI
- **Backend**: Supabase (PostgreSQL + Auth + RLS + Realtime)
- **Pattern**: Client → Supabase SDK → PostgreSQL (Row Level Security)
- **Deployment**: Expo EAS (mobile), Vercel/Netlify (web)

---

## 2. Mobile App Stack (React Native/Expo)

### Core Framework
- **Framework**: Expo (Managed Workflow)
- **Version**: SDK 54 (~54.0.33)
- **Reason**: Rapid cross-platform development, OTA updates, no native config needed
- **Documentation**: https://docs.expo.dev
- **License**: MIT

### UI Library
- **Library**: React
- **Version**: 19.1.0
- **Reason**: Component-based, huge ecosystem, industry standard
- **Documentation**: https://react.dev

### Navigation
- **Libraries**:
  - @react-navigation/native: ^7.1.28
  - @react-navigation/native-stack: ^7.12.0
  - @react-navigation/bottom-tabs: ^7.12.0 (available but custom tab bar used)
- **Pattern**: Custom tab bar via state management (not Tab Navigator)
- **Reason**: Full control over tab bar styling and behavior
- **Documentation**: https://reactnavigation.org

### State Management
- **Approach**: React Context API + useState hooks
- **Auth State**: AuthContext (useAuth hook) — session, user, profile
- **Theme State**: ThemeContext (useTheme hook) — isDark, colors, toggle
- **Reason**: Lightweight for current scope, no extra dependency
- **Future**: Zustand if state complexity increases

### Backend / Database
- **Service**: Supabase
- **Library**: @supabase/supabase-js ^2.95.3
- **Database**: PostgreSQL (Supabase-hosted)
- **Auth**: Supabase Auth (email/password)
- **RLS**: Row Level Security on all tables
- **Reason**: Free tier, built-in auth, PostgreSQL, real-time capable
- **Documentation**: https://supabase.com/docs

### Secure Storage
- **Library**: expo-secure-store ^15.0.8
- **Use**: JWT token storage on native, localStorage fallback on web
- **Reason**: Encrypted storage on device, platform-aware adapter

### UI Enhancements
- **Linear Gradient**: expo-linear-gradient ^15.0.8
- **Safe Area**: react-native-safe-area-context ^5.6.2
- **Screens**: react-native-screens ^4.23.0
- **Status Bar**: expo-status-bar ~3.0.9
- **Web Support**: react-native-web ^0.21.0

### Type Safety
- **Language**: TypeScript ~5.9.2
- **Types**: @types/react ~19.1.0
- **Reason**: Type safety, better IDE support, fewer runtime errors

---

## 3. Landing Page Stack (React Web)

### Core Framework
- **Library**: React ^19.0.0
- **Build Tool**: Create React App + CRACO ^7.1.0
- **Reason**: Proven setup, easy customization via CRACO for Tailwind + path aliases
- **Entry Point**: `src/App.js` (BrowserRouter + ThemeProvider wrapper)

### Styling
- **Framework**: Tailwind CSS ^3.4.17
- **Strategy**: `darkMode: "class"` (toggle via `.dark` class on `<html>`)
- **Animations**: tailwindcss-animate ^1.0.7
- **Config**: Custom `tailwind.config.js` with Shadcn CSS variable-based colors
- **PostCSS**: Configured via `postcss.config.js` (Tailwind + Autoprefixer)

### UI Components
- **Library**: Shadcn UI (Radix-based) — **46 pre-built accessible primitives**
- **Config**: `components.json` for Shadcn CLI
- **Location**: `src/components/ui/` directory
- **Categories**:
  - Layout: card, separator, aspect-ratio, resizable-panel, scroll-area
  - Navigation: navigation-menu, menubar, tabs, breadcrumb, pagination, sidebar
  - Forms: button, input, label, textarea, checkbox, radio-group, select, switch, slider, toggle, toggle-group, input-otp, calendar, form
  - Feedback: alert, alert-dialog, dialog, drawer, sheet, toast, toaster, sonner, progress, skeleton
  - Data Display: accordion, avatar, badge, carousel, chart, collapsible, command, hover-card, popover, table, tooltip
  - Overlay: context-menu, dropdown-menu

### Additional Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react-router-dom | ^7.5.1 | Client-side routing (single `/` route) |
| lucide-react | ^0.507.0 | Consistent SVG icon set |
| recharts | ^3.6.0 | Data visualization (chart component) |
| react-hook-form | ^7.56.2 | Form state management |
| zod | ^3.24.4 | Schema validation |
| sonner | ^2.0.3 | Toast notification system |
| embla-carousel-react | ^8.6.0 | Carousel/slider |
| cmdk | ^1.1.1 | Command palette component |
| vaul | ^1.1.5 | Drawer component |
| react-day-picker | ^9.6.6 | Calendar/date picker |

### 3D / Animation Components (Custom)
| Component | Technology | Purpose |
|-----------|-----------|---------|
| `ParticleSystem.jsx` | Canvas API | 50-particle ambient animation |
| `WireframeMesh.jsx` | SVG | 3D wireframe background meshes |
| `FloatingCards3D.jsx` | CSS `perspective()` | Floating stat cards with 3D tilt |
| `DataStream.jsx` | Canvas API | Matrix-style vertical data flow |
| `Showcase3DSection.jsx` | CSS transforms | Dashboard mockup with animated charts |

### CSS Custom Animations (in `App.css`)
14 keyframe animations including: `float` (6s), `float-3d` (8s), `blob` (7s), `fade-in`, `slide-up`, `pulse-glow` (2s), `rotate-3d` (20s), `shimmer` (3s), `data-flow` (3s), `holographic` (8s), `wireframe-draw` (4s), `grid-move` (20s)

### Hooks
| Hook | File | Purpose |
|------|------|---------|
| `useTheme` | `hooks/useTheme.js` | Theme context (localStorage + system preference detection) |
| `useCurrency` | `hooks/useCurrency.js` | Multi-currency pricing (INR/USD/EUR/GBP with auto-detect) |
| `use-toast` | `hooks/use-toast.js` | Sonner toast notification management |

### Build Scripts
```json
{
  "start": "craco start",
  "build": "craco build",
  "test": "craco test"
}
```

### Package Manager
- **Tool**: Yarn 1.22.22

---

## 4. Database (Supabase PostgreSQL)

### Schema
- **Tables**: profiles, transactions, budgets, investments
- **Auth**: Supabase auth.users (managed)
- **Triggers**: Auto-create profile on signup, auto-update updated_at
- **Indexes**: idx_transactions_user_date (user_id, transaction_date DESC)
- **RLS**: Enabled on ALL tables — users can only access their own data

### Schema Management
- **Migrations**: SQL scripts run in Supabase SQL Editor
- **Schema File**: supabase_schema.sql
- **Backup Strategy**: Supabase handles automated backups (free tier: 7 days)

---

## 5. DevOps & Infrastructure

### Version Control
- **System**: Git
- **Platform**: GitHub
- **Branch Strategy**: main (production), develop (staging), feature/* (features)

### Mobile Deployment
- **Service**: Expo EAS Build + EAS Submit
- **Platforms**: Android (primary), iOS (future)
- **OTA Updates**: Expo Updates for JS-only changes

### Web Deployment
- **Frontend (Landing)**: Vercel or Netlify (static hosting)
- **Reason**: Free tier, auto-deploy from Git, edge CDN

### Monitoring
- **Error Tracking**: Console logs (V1), Sentry (future)
- **Analytics**: None in V1, Vercel Analytics / Mixpanel (future)

---

## 6. Development Tools

### Code Quality
- **Language**: TypeScript (strict where possible)
- **IDE**: VS Code with React Native Tools, TypeScript extensions

### Testing (Planned)
- **Unit Tests**: Jest (built into Expo)
- **E2E**: Detox (future) or Maestro
- **Coverage Target**: 60% for V1

---

## 7. Environment Variables

### Required Variables (Supabase)
```
SUPABASE_URL="https://[project-ref].supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIs..."
```

### Notes
- Currently hardcoded in src/lib/supabase.ts (move to .env for production)
- No server-side secrets needed (Supabase handles auth server-side)
- RLS policies enforce security at database level

---

## 8. Package.json Scripts

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  }
}
```

---

## 9. Dependencies Lock

### Mobile App Dependencies (Exact)
```json
{
  "@expo/metro-runtime": "~6.1.2",
  "@react-native-async-storage/async-storage": "^2.2.0",
  "@react-navigation/bottom-tabs": "^7.12.0",
  "@react-navigation/native": "^7.1.28",
  "@react-navigation/native-stack": "^7.12.0",
  "@supabase/supabase-js": "^2.95.3",
  "expo": "~54.0.33",
  "expo-linear-gradient": "^15.0.8",
  "expo-secure-store": "^15.0.8",
  "expo-status-bar": "~3.0.9",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "react-native": "0.81.5",
  "react-native-safe-area-context": "^5.6.2",
  "react-native-screens": "^4.23.0",
  "react-native-web": "^0.21.0"
}
```

### Dev Dependencies
```json
{
  "@types/react": "~19.1.0",
  "typescript": "~5.9.2"
}
```

---

## 10. Security Considerations

### Authentication
- Supabase Auth handles password hashing (bcrypt internally)
- JWT tokens managed by Supabase SDK
- Tokens stored in Expo SecureStore (encrypted on device)
- Auto-refresh tokens enabled

### Data Protection
- Row Level Security (RLS) on ALL tables
- Users can only SELECT/INSERT/UPDATE/DELETE their own rows
- auth.uid() function enforces user isolation
- No direct database access — all through Supabase client

### Rate Limiting
- Supabase handles API rate limiting
- Auth rate limits: Built-in by Supabase (configurable)

---

## 11. Version Upgrade Policy

### Expo SDK Updates
- Update when new stable SDK released (quarterly)
- Test on Android emulator before production
- Pin dependencies to Expo-compatible versions

### Supabase Updates
- Client library: Update monthly for bug fixes
- Database: Supabase manages PostgreSQL upgrades
- Test auth flows after any supabase-js upgrade
```

### Sample AI Prompt for TECH_STACK Generation

```
Create a Technology Stack document for FinTrack — a Finance Management & Investment
Tracker built with React Native/Expo and Supabase.

Context:
- Type: Mobile app (Android) + Landing page (React web)
- Scale: MVP / Solo developer
- Timeline: 4 weeks MVP

Generate for EACH technology: exact name, version, reason, documentation URL.

Sections:
1. STACK OVERVIEW — Expo managed + Supabase BaaS pattern
2. MOBILE APP STACK — Expo 54, React 19.1, React Navigation 7, Supabase JS 2.95,
   SecureStore, TypeScript 5.9
3. LANDING PAGE STACK — React + Tailwind + Shadcn + 3D animations
4. DATABASE — Supabase PostgreSQL, tables, RLS, triggers
5. DEVOPS — Git, Expo EAS, Vercel, monitoring plan
6. ENVIRONMENT VARIABLES — Supabase URL + Anon Key
7. DEPENDENCIES LOCK — Exact package.json with versions
8. SECURITY — RLS, SecureStore, Supabase Auth
9. UPGRADE POLICY — Expo SDK quarterly, Supabase monthly

CRITICAL: NO "latest" — use exact versions. Include documentation URLs.
OUTPUT FORMAT: Markdown with code blocks for configs.
```

---

## Document 4: FRONTEND_GUIDELINES.md (Frontend Design System)

### Purpose

Every visual decision locked down for FinTrack. Colors, fonts, spacing, components — for both the React Native mobile app and the landing page website. AI builds components exactly to spec.

### Best Practices

- Document components with usage examples
- Provide code snippets for each variant
- Include accessibility guidelines
- Document design tokens (colors, spacing, typography)
- Keep it concise and searchable

### Structure Template

```
# Frontend Design System & Guidelines — FinTrack

## 1. Design Principles

1. **Finance-First**: Colors and visual cues reinforce financial concepts
   (green = income/profit, red = expense/loss)
2. **Dark Mode Native**: Designed dark-first, light mode as alternative
3. **Clarity**: Clean layouts, generous spacing, readable numbers
4. **Consistency**: Same patterns across all screens (cards, modals, lists)
5. **Accessibility**: 44x44px touch targets, 14px+ font sizes, WCAG AA contrast

---

## 2. Design Tokens

### Color Palette (from theme.ts)

#### Brand Colors
```typescript
primary: '#6366F1'        // Indigo — Trust & Finance
primaryLight: '#818CF8'
primaryDark: '#4F46E5'
```

#### Semantic Colors
```typescript
accent: '#10B981'         // Emerald — Growth/Profit
accentLight: '#34D399'
warning: '#F59E0B'        // Amber — Caution/Budget warning
danger: '#EF4444'         // Red — Loss/Alert/Over budget
income: '#10B981'         // Green — Income
expense: '#EF4444'        // Red — Expense
```

#### Dark Theme (Default)
```typescript
background: '#0F172A'      // Slate 900
surface: '#1E293B'         // Slate 800
surfaceSecondary: '#334155'// Slate 700
text: '#F8FAFC'            // Slate 50
textSecondary: '#94A3B8'   // Slate 400
textMuted: '#64748B'       // Slate 500
border: '#334155'          // Slate 700
shadow: 'rgba(0, 0, 0, 0.3)'
```

#### Light Theme
```typescript
background: '#F8FAFC'      // Slate 50
surface: '#FFFFFF'
surfaceSecondary: '#F1F5F9'// Slate 100
text: '#0F172A'            // Slate 900
textSecondary: '#64748B'   // Slate 500
textMuted: '#94A3B8'       // Slate 400
border: '#E2E8F0'          // Slate 200
shadow: 'rgba(0, 0, 0, 0.1)'
```

#### Usage Rules
- **Primary (#6366F1)**: Buttons, active tab, links, focus indicators
- **Accent (#10B981)**: Income amounts, profit, positive changes, success
- **Danger (#EF4444)**: Expense amounts, loss, negative changes, errors, delete
- **Warning (#F59E0B)**: Budget alerts (60-89% used), caution states
- **Surface colors**: Card backgrounds, input backgrounds, modals
- **Text hierarchy**: text > textSecondary > textMuted

---

### Typography (React Native)

#### Font Sizes
```typescript
xs: 12    // Labels, timestamps, helper text
sm: 14    // Secondary text, descriptions
md: 16    // Body text, input values (default)
lg: 18    // Section headers, card titles
xl: 20    // Screen sub-headers
xxl: 24   // Screen headers
xxxl: 32  // Dashboard main numbers
display: 40  // Hero numbers (total balance)
```

#### Font Weights
```typescript
normal: '400'    // Body text
medium: '500'    // Labels, tab names
semibold: '600'  // Card titles, section headers
bold: '700'      // Screen headers, important numbers
```

#### Usage Guidelines
- **Screen titles**: xxxl (32px), bold
- **Card titles**: lg (18px), semibold
- **Body text**: md (16px), normal
- **Labels**: sm (14px), medium
- **Amounts/numbers**: xl+ (20px+), bold, monospace feel
- **Timestamps**: xs (12px), textMuted color

---

### Spacing Scale
```typescript
xs: 4     // Tight inline spacing
sm: 8     // Between related items
md: 16    // Default component padding
lg: 24    // Section padding, card padding
xl: 32    // Between sections
xxl: 48   // Screen-level margins
```

#### Usage Rules
- **Card padding**: lg (24)
- **List item padding**: md (16) vertical, md (16) horizontal
- **Between buttons**: sm (8)
- **Screen horizontal margin**: md (16) to lg (24)
- **Between sections**: xl (32)

---

### Border Radius
```typescript
sm: 8     // Buttons, small cards
md: 12    // Default cards, inputs
lg: 16    // Large cards, modals
xl: 24    // Pill buttons, tags
full: 9999 // Circular avatars, badges
```

---

### Shadows (React Native)
```typescript
// Small
{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }

// Medium
{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }

// Large
{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 }
```

---

## 3. Component Patterns (React Native)

### Summary Card (Dashboard)
```tsx
<View style={{
  backgroundColor: colors.surface,
  borderRadius: 12,
  padding: 24,
  ...Shadows.md,
}}>
  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Total Income</Text>
  <Text style={{ color: Colors.income, fontSize: 24, fontWeight: '700' }}>
    ₹{total.toLocaleString()}
  </Text>
</View>
```

### Transaction List Item
```tsx
<View style={{
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: 16,
  backgroundColor: colors.surface,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
}}>
  <View>
    <Text style={{ color: colors.text, fontSize: 16 }}>{description}</Text>
    <Text style={{ color: colors.textMuted, fontSize: 12 }}>{category} • {date}</Text>
  </View>
  <Text style={{
    color: type === 'income' ? Colors.income : Colors.expense,
    fontSize: 16, fontWeight: '600',
  }}>
    {type === 'income' ? '+' : '-'}₹{amount}
  </Text>
</View>
```

### Budget Progress Bar
```tsx
<View style={{ backgroundColor: colors.surfaceSecondary, borderRadius: 8, height: 8 }}>
  <View style={{
    backgroundColor: percentage < 60 ? Colors.accent :
                     percentage < 90 ? Colors.warning : Colors.danger,
    borderRadius: 8,
    height: 8,
    width: `${Math.min(percentage, 100)}%`,
  }} />
</View>
```

### Button (Primary)
```tsx
<TouchableOpacity style={{
  backgroundColor: Colors.primary,
  paddingVertical: 14,
  paddingHorizontal: 24,
  borderRadius: 12,
  alignItems: 'center',
}}>
  <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 16 }}>
    Add Transaction
  </Text>
</TouchableOpacity>
```

### Tab Bar Item
```tsx
<TouchableOpacity style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}>
  <Text style={{ fontSize: 20 }}>{icon}</Text>
  <Text style={{
    fontSize: 11,
    fontWeight: '500',
    color: isActive ? '#6366F1' : colors.textMuted,
  }}>
    {label}
  </Text>
</TouchableOpacity>
```

---

## 4. State Indicators

### Loading
- **Screen**: ActivityIndicator (indigo #6366F1), centered
- **Button**: Disabled + spinner inline
- **List**: Skeleton cards (future) or centered spinner

### Empty State
- Large emoji (e.g., 📊💳💰📈)
- Descriptive message ("No transactions yet")
- Primary CTA button ("Add your first transaction")

### Error State
- Alert dialog for network/auth errors
- Inline text for validation errors (red, below field)
- Never silently fail

---

## 5. Accessibility (React Native)
- Touch targets: minimum 44x44px
- Font sizes: minimum 12px (xs), body minimum 16px
- Color contrast: WCAG AA (4.5:1 for normal text)
- Active indicator: Color (#6366F1) for active tab
- Number formatting: Locale-aware with commas (toLocaleString)

---

## 6. Website Design System (Landing Page — Tailwind CSS)

> The website uses a different design system from the mobile app. While the mobile app uses React Native StyleSheet with an indigo-based palette, the website uses Tailwind CSS utility classes with a blue/teal gradient palette.

### Color Strategy (Website)

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| **Primary gradient** | `from-blue-600 to-teal-600` | Same |
| **Hover gradient** | `from-blue-700 to-teal-700` | Same |
| **Background** | `bg-white` | `bg-gray-900` |
| **Surface/Card** | `bg-white` | `bg-gray-800` |
| **Text primary** | `text-gray-900` | `text-white` |
| **Text secondary** | `text-gray-600` | `text-gray-300` |
| **Text muted** | `text-gray-500` | `text-gray-400` |
| **Border** | `border-gray-100` / `border-gray-200` | `border-gray-700` |
| **Hover border** | `border-blue-200` | `border-blue-600` |
| **Logo gradient** | `from-blue-500 to-teal-500` | Same |

### CSS Variables (Shadcn Design Tokens — `index.css`)

```css
/* Light Theme */
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --primary: 0 0% 9%;
  --secondary: 0 0% 96.1%;
  --muted: 0 0% 96.1%;
  --accent: 0 0% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --border: 0 0% 89.8%;
  --radius: 0.5rem;
  --chart-1: 12 76% 61%;   --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;
}

/* Dark Theme */
.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 7%;
  --primary: 0 0% 98%;
  --secondary: 0 0% 14.9%;
  --muted: 0 0% 14.9%;
  --destructive: 0 62.8% 30.6%;
  --border: 0 0% 14.9%;
  --chart-1: 220 70% 50%;  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;   --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
}
```

### Typography (Website)
```css
body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
}
```

### 3D Animation Classes (Website — `App.css`)

| Animation | Duration | Effect |
|-----------|----------|--------|
| `float` | 6s | Y translation + rotation |
| `float-3d` | 8s | Perspective + XY rotation + Y translate |
| `blob` | 7s | XY translate + scale (background blobs) |
| `fade-in` | 1s | Opacity 0→1 |
| `slide-up` | 0.8s | Opacity + Y translate |
| `pulse-glow` | 2s | Box-shadow pulse (blue) |
| `rotate-3d` | 20s | 360° Y rotation |
| `shimmer` | 3s | Background position shift |
| `holographic` | 8s | 5-color gradient cycling |
| `wireframe-draw` | 4s | SVG stroke-dashoffset |
| `data-flow` | 3s | Y translate full viewport |
| `grid-move` | 20s | XY translate 50px |

**Animation delay classes:** `animation-delay-200`, `animation-delay-400`, `animation-delay-600`, `animation-delay-2000`, `animation-delay-4000`

### CSS Effect Classes (Website)

| Class | Effect |
|-------|--------|
| `.glass-effect` | Translucent background + `blur(10px)` + white border |
| `.gradient-text` | Blue→teal gradient text with `background-clip: text` |
| `.card-3d` | `preserve-3d` + hover rotateY/rotateX tilt |
| `.card-perspective` | `perspective(1000px)` with hover reset + shadow |
| `.neon-glow` | 4-layer blue text-shadow |
| `.holographic` | 5-color gradient cycling overlay |
| `.floating-coin` | Box-shadow + `preserve-3d` + gradient highlight |

### Theme Implementation (Website)

```jsx
// useTheme.js — Theme context with localStorage + system preference
const [theme, setTheme] = useState(() => {
  const saved = localStorage.getItem('fintrack-theme');
  if (saved) return saved;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
});

// Applies .dark class on <html> for Tailwind's class strategy
useEffect(() => {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
  localStorage.setItem('fintrack-theme', theme);
}, [theme]);
```

### Multi-Currency System (Website)

| Currency | Symbol | Free | Pro | Business | Payment Provider |
|----------|--------|------|-----|----------|-----------------|
| **USD** | $ | $0 | $9.99/mo | $29.99/mo | Stripe |
| **EUR** | € | €0 | €8.99/mo | €24.99/mo | Stripe |
| **GBP** | £ | £0 | £7.99/mo | £22.99/mo | Stripe |
| **INR** | ₹ | ₹0 | ₹199/mo | ₹399/mo | Stripe |
| **JPY** | ¥ | ¥0 | ¥1,480/mo | ¥4,480/mo | Stripe |
| **CAD** | C$ | C$0 | C$12.99/mo | C$39.99/mo | Stripe |
| **AUD** | A$ | A$0 | A$14.99/mo | A$44.99/mo | Stripe |
| **SGD** | S$ | S$0 | S$12.99/mo | S$39.99/mo | Stripe |

Auto-detection: Timezone map → Navigator language map → Default USD

### Responsive Breakpoints (Website)
- Mobile: default (full-width, stacked layouts)
- Tablet: `md:` (768px) — 2-column grids, hidden mobile menu
- Desktop: `lg:` (1024px) — 3-4 column grids, full navigation

### Global-First Design Patterns (Website)
- Auto-detects user's region via timezone and language maps
- Default currency: USD (fallback for unrecognized regions)
- 8 currencies supported natively (USD, EUR, GBP, INR, JPY, CAD, AUD, SGD)
- Global investment references (Stocks, ETFs, Bonds, Mutual Funds, Crypto)
- "Available Worldwide 🌍" in footer
- Stripe for all payments (40+ countries)
```

### Sample AI Prompt for FRONTEND_GUIDELINES Generation

```
Create Frontend Design System documentation for FinTrack —
covering BOTH the mobile app (React Native/Expo) AND the landing page website (React + Tailwind).

Context:
- Mobile App: Modern finance app with dark mode default, Indigo (#6366F1) brand color
- Website: Marketing landing page with blue/teal gradient palette, 3D animations
- Both platforms share: dark-first design, finance-focused visual language

Generate:
1. DESIGN TOKENS (Mobile) — exact hex codes from theme.ts, spacing, typography, shadows
2. COMPONENT PATTERNS (Mobile) — React Native StyleSheet code for cards, list items,
   buttons, progress bars, tab bar
3. STATE INDICATORS — Loading, empty, error patterns
4. ACCESSIBILITY — touch targets, font minimums, contrast ratios
5. WEBSITE DESIGN SYSTEM — Tailwind color strategy, CSS variables, Shadcn tokens
6. WEBSITE ANIMATIONS — 3D CSS classes, keyframe animations, effect classes
7. WEBSITE THEME — useTheme hook, localStorage persistence, system preference
8. WEBSITE PATTERNS — Multi-currency, responsive breakpoints, India-first design

CRITICAL: Mobile uses React Native StyleSheet (NOT CSS). Website uses Tailwind CSS (NOT StyleSheet).
OUTPUT FORMAT: Markdown with TypeScript/TSX and CSS code blocks.
```

---

## Document 5: BACKEND_STRUCTURE.md (Backend Architecture)

### Purpose

Defines FinTrack's backend: database schema, API patterns, authentication, and security. FinTrack uses **Supabase** as a Backend-as-a-Service (BaaS) — no custom server code.

### Best Practices

- Document every table with column types and constraints
- Include relationship diagrams
- Document all RLS policies
- Show exact API call patterns
- Include data validation rules
- Document error codes and handling

### Structure Template

```
# Backend Architecture — FinTrack

## 1. Architecture Overview

### Pattern: Supabase BaaS (Backend-as-a-Service)
```
Client (React Native) → Supabase JS SDK → Supabase API → PostgreSQL
                                        ↕
                                  Supabase Auth (JWT)
                                  Row Level Security
```

### Why Supabase?
- No custom server needed (reduced complexity)
- Built-in PostgreSQL with RLS (security at database level)
- Built-in Auth (JWT tokens, session management)
- Real-time capabilities (future: live updates)
- Free tier sufficient for MVP
- Open source, no vendor lock-in risk

---

## 2. Database Schema

### Entity Relationship Diagram
```
auth.users (Supabase managed)
    │  PK: id (UUID)
    │
    ├──── profiles (1:1)
    │     PK: id (UUID, FK → auth.users)
    │     email, username, theme_preference, created_at
    │
    ├──── transactions (1:many)
    │     PK: id (UUID)
    │     FK: user_id → auth.users
    │     type, amount, category, description,
    │     transaction_date, created_at, updated_at
    │
    ├──── budgets (1:many)
    │     PK: id (UUID)
    │     FK: user_id → auth.users
    │     category, amount, month, year,
    │     created_at, updated_at
    │     UNIQUE: (user_id, category, month, year)
    │
    └──── investments (1:many)
          PK: id (UUID)
          FK: user_id → auth.users
          symbol, quantity, purchase_price, current_price,
          purchase_date, created_at, updated_at
```

### Table: profiles
```sql
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    theme_preference TEXT DEFAULT 'dark'
        CHECK (theme_preference IN ('light', 'dark')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **Notes**: Auto-created via trigger on auth.users insert
- **Cascade**: Deletes when auth.users row is deleted

### Table: transactions
```sql
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **Constraints**: type must be 'income' or 'expense', amount > 0
- **Index**: `idx_transactions_user_date` on (user_id, transaction_date DESC)

### Table: budgets
```sql
CREATE TABLE public.budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category, month, year)
);
```
- **Unique Constraint**: One budget per category per month per user

### Table: investments
```sql
CREATE TABLE public.investments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    quantity DECIMAL(10,4) NOT NULL CHECK (quantity > 0),
    purchase_price DECIMAL(12,2) NOT NULL CHECK (purchase_price > 0),
    current_price DECIMAL(12,2) CHECK (current_price >= 0),
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 3. Row Level Security (RLS) Policies

### Pattern: Users can ONLY access their own data

#### profiles
```sql
-- SELECT
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT USING (auth.uid() = id);

-- UPDATE
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);
```

#### transactions
```sql
-- SELECT
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT USING (auth.uid() = user_id);

-- INSERT
CREATE POLICY "Users can insert own transactions"
    ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "Users can update own transactions"
    ON transactions FOR UPDATE USING (auth.uid() = user_id);

-- DELETE
CREATE POLICY "Users can delete own transactions"
    ON transactions FOR DELETE USING (auth.uid() = user_id);
```

#### budgets & investments
Same pattern: `auth.uid() = user_id` on all CRUD operations.

---

## 4. API Patterns (Supabase Client SDK)

### Authentication
```typescript
// Sign Up
const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { username } }
});

// Sign In
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// Sign Out
const { error } = await supabase.auth.signOut();

// Reset Password
const { error } = await supabase.auth.resetPasswordForEmail(email);

// Session listener
supabase.auth.onAuthStateChange((event, session) => { ... });
```

### CRUD Operations
```typescript
// SELECT (all user's transactions, sorted by date)
const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false });

// INSERT
const { data, error } = await supabase
    .from('transactions')
    .insert({ user_id, type, amount, category, description, transaction_date })
    .select()
    .single();

// UPDATE
const { data, error } = await supabase
    .from('transactions')
    .update({ amount, category, description })
    .eq('id', transactionId)
    .select()
    .single();

// DELETE
const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId);
```

### Aggregation Queries
```typescript
// Monthly totals for Dashboard
const { data } = await supabase
    .from('transactions')
    .select('type, amount')
    .gte('transaction_date', startOfMonth)
    .lte('transaction_date', endOfMonth);

const income = data.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
const expenses = data.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
```

---

## 5. Database Triggers

### Auto-create profile on signup
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Auto-update updated_at
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to: transactions, budgets, investments
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 6. Data Validation

### Client-Side (React Native)
- Amount > 0 (numeric check)
- Category required (non-empty string)
- Type must be 'income' or 'expense'
- Date required (defaults to today)
- Email format validation (registration)
- Password length >= 6 characters

### Server-Side (PostgreSQL CHECK constraints)
- `amount > 0` (transactions, budgets, investments)
- `type IN ('income', 'expense')` (transactions)
- `month >= 1 AND month <= 12` (budgets)
- `year >= 2020` (budgets)
- `quantity > 0` (investments)
- `theme_preference IN ('light', 'dark')` (profiles)

---

## 7. Error Handling

### Supabase Error Structure
```typescript
type SupabaseError = {
    message: string;   // Human-readable error
    details: string;   // Detailed error info
    hint: string;      // Suggestions for fixing
    code: string;      // PostgreSQL error code
}
```

### Common Errors & Handling
| Error | Code | User Message |
|-------|------|-------------|
| Duplicate email | 23505 | "Email already registered" |
| Invalid credentials | - | "Invalid email or password" |
| RLS violation | 42501 | "Permission denied" (should not occur) |
| Network timeout | - | "Network error. Check connection." |
| Rate limited | 429 | "Too many attempts. Try later." |
| Validation fail | 23514 | "Invalid data. Check your inputs." |

---

## 8. Performance Considerations

### Indexes
- `idx_transactions_user_date`: Optimizes transaction list queries (sorted by date)
- Primary key indexes: Auto-created on all `id` columns
- Unique constraint index: `budgets(user_id, category, month, year)`

### Query Optimization
- Select only needed columns when possible
- Use `.limit()` for paginated lists
- Filter server-side with `.eq()`, `.gte()`, `.lte()` (not client-side)
- Aggregate on client for simple sums (complexity doesn't justify DB functions yet)

### Caching Strategy (V1)
- No caching in V1 — every screen fetch is live
- Future: React Query or SWR for client-side cache + stale-while-revalidate
```

### Sample AI Prompt for BACKEND_STRUCTURE Generation

```
Create Backend Architecture documentation for FinTrack using Supabase BaaS.

Context:
- No custom server — Supabase handles everything
- Database: PostgreSQL with RLS
- Auth: Supabase Auth (email/password, JWT)
- Tables: profiles, transactions, budgets, investments

Generate:
1. ARCHITECTURE — Client → Supabase SDK → PostgreSQL pattern
2. SCHEMA — All 4 tables with exact SQL, constraints, relationships
3. RLS POLICIES — auth.uid() = user_id pattern for all CRUD
4. API PATTERNS — Supabase JS SDK examples for auth + CRUD
5. TRIGGERS — Profile auto-create, updated_at auto-update
6. VALIDATION — Client-side (React) + Server-side (CHECK constraints)
7. ERROR HANDLING — Common errors table with codes and user messages
8. PERFORMANCE — Indexes, query optimization, caching plan

CRITICAL: SQL must match supabase_schema.sql exactly.
OUTPUT FORMAT: Markdown with SQL and TypeScript code blocks.
```

---

## Document 6: IMPLEMENTATION_PLAN.md (Build Roadmap)

### Purpose

Step-by-step build order for FinTrack. What to build first, what depends on what, and measurable success criteria for each phase. Prevents AI from building features out of order.

### Best Practices

- Order by dependency (foundations → features → polish)
- Each phase should be independently testable
- Include clear success criteria for each phase
- Reference other documents for specs
- Include duration estimates
- Document risk mitigation strategies

### Structure Template

```
# Implementation Plan — FinTrack MVP

## Phase 0: Project Foundation (Days 1-2)

### Goals
- Set up development environment
- Configure Supabase project
- Initialize React Native/Expo project

### Tasks
1. Create Expo project with TypeScript template
   ```bash
   npx create-expo-app@latest fintrack --template blank-typescript
   ```
2. Install core dependencies
   ```bash
   npx expo install @react-navigation/native @react-navigation/native-stack
   npx expo install react-native-screens react-native-safe-area-context
   npx expo install @supabase/supabase-js expo-secure-store
   npx expo install expo-linear-gradient expo-status-bar
   ```
3. Create Supabase project at supabase.com
4. Run `supabase_schema.sql` in Supabase SQL Editor
5. Set up directory structure:
   ```
   src/
   ├── components/     # Reusable UI components
   ├── constants/      # theme.ts, categories
   ├── hooks/          # useAuth, useTheme
   ├── lib/            # supabase.ts client
   ├── navigation/     # RootNavigator
   ├── screens/        # Screen components
   └── types/          # database.ts types
   ```
6. Configure Supabase client in `src/lib/supabase.ts`
7. Set up Git repository and initial commit

### Success Criteria
- [ ] Expo app runs on Android emulator
- [ ] Supabase dashboard accessible with 4 tables created
- [ ] RLS policies active on all tables
- [ ] TypeScript compiles without errors
- [ ] Directory structure matches spec

### References
- TECH_STACK.md: §2 (Mobile App Stack), §4 (Database)
- BACKEND_STRUCTURE.md: §2 (Schema), §3 (RLS)

---

## Phase 1: Design System & Theme (Days 2-3)

### Goals
- Implement design tokens as code
- Create theme provider with dark/light mode
- Build reusable base components

### Tasks
1. Create `src/constants/theme.ts` with all design tokens
   - Colors (primary, accent, danger, warning, light/dark palettes)
   - Spacing (xs through xxl)
   - Border radius, font sizes, font weights, shadows
2. Create `src/hooks/useTheme.tsx` — ThemeProvider + context
   - isDark state, colors accessor, toggleTheme function
   - Persist theme preference
3. Update `App.tsx` with ThemeProvider wrapper
4. Create base components (optional, for consistency):
   - Card component (surface background, shadow, radius)
   - Button component (primary, outline, danger variants)

### Success Criteria
- [ ] Theme toggles between light and dark modes
- [ ] All design tokens match FRONTEND_GUIDELINES.md values
- [ ] Components render correctly in both themes
- [ ] StatusBar style updates with theme

### References
- FRONTEND_GUIDELINES.md: §2 (Design Tokens), §3 (Components)

---

## Phase 2: Authentication (Days 3-5)

### Goals
- Implement Supabase Auth flow
- Create Login and Register screens
- Set up auth state management

### Tasks
1. Create `src/hooks/useAuth.tsx` — AuthProvider + context
   - Session state, user state, profile state
   - signUp(), signIn(), signOut(), resetPassword(), updateProfile()
   - Auto-fetch profile on auth state change
   - onAuthStateChange listener
2. Create `src/screens/LoginScreen.tsx`
   - Email + password inputs
   - Login button with loading state
   - "Create Account" navigation link
   - Error handling (invalid credentials, network)
3. Create `src/screens/RegisterScreen.tsx`
   - Username + Email + Password + Confirm Password
   - Registration with profile creation
   - Validation (all fields, password match, email format)
4. Create `src/navigation/RootNavigator.tsx`
   - Conditional rendering: authenticated → MainApp, else → AuthStack
   - Loading screen while checking session
5. Verify database trigger creates profile on signup

### Success Criteria
- [ ] User can register with email/password/username
- [ ] User can login with existing credentials
- [ ] User can logout and is redirected to Login
- [ ] Password reset email sends successfully
- [ ] Session persists after app restart
- [ ] Profile auto-created in profiles table
- [ ] Error messages display correctly

### References
- PRD.md: §6.1 (Authentication feature)
- APP_FLOW.md: §2.1 (Registration flow), §5 (Auth decision)
- BACKEND_STRUCTURE.md: §4 (Auth API), §5 (Triggers)

---

## Phase 3: Dashboard (Days 5-7)

### Goals
- Build the main Dashboard screen
- Display financial summary cards
- Show recent transactions
- Implement custom tab bar navigation

### Tasks
1. Create `src/screens/DashboardScreen.tsx`
   - Welcome header with username
   - Summary cards: Total Income, Total Expenses, Balance, Savings Rate
   - Recent transactions list (last 5)
   - "Add Transaction" quick action
2. Implement custom tab bar in `RootNavigator.tsx`
   - 5 tabs: Dashboard (📊), Transactions (💳), Budget (💰), Investments (📈), Settings (⚙️)
   - Active state with primary color
   - Custom styling per FRONTEND_GUIDELINES
3. Fetch transactions from Supabase for calculations
4. Handle empty state (new user, no data)

### Success Criteria
- [ ] Dashboard displays correct financial totals
- [ ] Custom tab bar renders with correct icons
- [ ] Tab switching works between all 5 screens
- [ ] Empty state shows when no transactions exist
- [ ] Pull-to-refresh updates data
- [ ] Loading state displays while fetching

### References
- PRD.md: §6.2 (Dashboard feature)
- APP_FLOW.md: §3 (Navigation Map)
- FRONTEND_GUIDELINES.md: §3 (Summary Card, Tab Bar)

---

## Phase 4: Transaction Management (Days 7-10)

### Goals
- Full CRUD for transactions
- Filter and search functionality
- Category management

### Tasks
1. Create `src/screens/TransactionsScreen.tsx`
   - Transaction list with FlatList
   - Filter by type (All/Income/Expense)
   - Search by description
   - FAB "+" button for adding
2. Create Add Transaction modal/screen
   - Type toggle (Income/Expense)
   - Amount input (numeric)
   - Category picker (dynamic based on type)
   - Description input (optional)
   - Date picker
   - Save to Supabase
3. Create Edit Transaction functionality
   - Pre-fill form with existing data
   - Update in Supabase
4. Create Delete with confirmation dialog
5. Define categories in `src/types/database.ts`
   - Expense: Food, Transport, Housing, Utilities, Entertainment, Shopping, Health, Education, Other
   - Income: Salary, Freelance, Business, Investments, Gift, Other

### Success Criteria
- [ ] Transactions list loads and displays correctly
- [ ] Add transaction saves to database and refreshes list
- [ ] Edit updates existing transaction
- [ ] Delete removes with confirmation
- [ ] Filter by type works
- [ ] Search by description works
- [ ] Categories change based on selected type (income vs expense)
- [ ] Dashboard updates after transaction changes

### References
- PRD.md: §6.3 (Transaction Management)
- APP_FLOW.md: §2.2 (Transaction Entry flow)
- BACKEND_STRUCTURE.md: §4 (CRUD Operations)

---

## Phase 5: Budget Management (Days 10-12)

### Goals
- Monthly budget creation and tracking
- Progress visualization (progress bars)
- Budget vs actual spending comparison

### Tasks
1. Create `src/screens/BudgetScreen.tsx`
   - Month/year selector
   - Budget cards with progress bars per category
   - Color-coded: green (<60%), yellow (60-89%), red (90%+)
   - "Add Budget" button
2. Create Add/Edit Budget modal
   - Category picker (expense categories only)
   - Amount input
   - Month/Year (default: current)
3. Calculate spending: Sum transactions for matching category + month
4. Handle unique constraint (one budget per category per month)

### Success Criteria
- [ ] Budget cards display with correct progress
- [ ] Colors change based on spending percentage
- [ ] Add budget with unique constraint works
- [ ] Month/year switching refreshes budgets
- [ ] Spending calculation matches actual transactions
- [ ] Edit and delete budgets work

### References
- PRD.md: §6.4 (Budget Management)
- APP_FLOW.md: §2.3 (Budget flow), §5 (Budget Alert decision)

---

## Phase 6: Investment Tracker (Days 12-14)

### Goals
- Stock portfolio tracking
- Gain/loss calculation
- Portfolio summary

### Tasks
1. Create `src/screens/InvestmentsScreen.tsx`
   - Portfolio summary header (total value, total gain/loss, % change)
   - Investment list: symbol, quantity, purchase price, current price, gain/loss
   - Green/red color for gain/loss
   - "Add Investment" button
2. Create Add/Edit Investment modal
   - Symbol, quantity, purchase price, current price (optional), purchase date
3. Calculate gain/loss per investment and portfolio total
4. Handle missing current_price (show "N/A")

### Success Criteria
- [ ] Investment list displays with gain/loss calculations
- [ ] Portfolio summary shows correct totals
- [ ] Green/red colors for profit/loss
- [ ] Add, edit, delete investments work
- [ ] Handles missing current_price gracefully

### References
- PRD.md: §6.5 (Investment Tracker)
- APP_FLOW.md: §2.4 (Investment flow), §5 (Performance decision)

---

## Phase 7: Settings & Polish (Days 14-16)

### Goals
- Settings screen with profile and theme
- Final UI polish and bug fixes
- Error handling improvements

### Tasks
1. Create `src/screens/SettingsScreen.tsx`
   - Profile section: username, email (read-only)
   - Theme toggle switch (dark/light)
   - Sign out button with confirmation
   - Theme saves to profiles table
2. Polish all screens
   - Consistent spacing, colors, typography
   - Loading states on all data-fetching screens
   - Empty states with CTAs
   - Error alerts for all failure cases
3. Test full app flow end-to-end
4. Fix any visual or functional bugs

### Success Criteria
- [ ] Theme toggle works and persists across sessions
- [ ] Sign out clears session and returns to Login
- [ ] All screens handle loading, empty, and error states
- [ ] Navigation flows smoothly between all screens
- [ ] No TypeScript compilation errors
- [ ] App runs without crashes on Android

### References
- PRD.md: §6.6 (Settings), §12 (Non-Functional Requirements)
- APP_FLOW.md: §4 (Screen Inventory — all state variants)

---

## Phase 8: Website Landing Page (Days 10-16, Parallel Track)

### Goals
- Build the complete marketing landing page website
- This phase runs IN PARALLEL with mobile app Phases 5-7
- Result: Fully functional single-page React landing page

### Tasks
1. Initialize project with CRA + CRACO
   ```bash
   npx create-react-app frontend
   cd frontend && yarn add @craco/craco tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
2. Configure Shadcn UI: `components.json`, path aliases (@/ → src/), install all 46 UI primitives
3. Set up `index.css` with Tailwind imports + CSS variables (Shadcn tokens, light/dark)
4. Create `App.css` with all 14 custom animations (float, blob, holographic, etc.)
5. Build `hooks/useTheme.js` (localStorage + system preference + class toggling)
6. Build `hooks/useCurrency.js` (INR/USD/EUR/GBP auto-detect + pricing data)
7. Build page sections (in order):
   - `Navbar.jsx` — Glass-morphism, theme toggle, mobile hamburger
   - `HeroSection.jsx` — Particles, wireframe, floating coins, credit card, stats
   - `FeaturesSection.jsx` — 6 feature cards with 3D hover
   - `Showcase3DSection.jsx` — Dark section, data streams, animated dashboard
   - `HowItWorksSection.jsx` — 4-step process with connectors
   - `PricingSection.jsx` — 3 tiers with currency switcher
   - `FAQSection.jsx` — 8 items with Radix accordion
   - `CTASection.jsx` — Gradient CTA with floating elements
   - `Footer.jsx` — Links, newsletter, social, "Made in India"
8. Build custom animation components: `ParticleSystem.jsx`, `WireframeMesh.jsx`, `FloatingCards3D.jsx`, `DataStream.jsx`
9. Assemble in `App.js` with BrowserRouter + ThemeProvider
10. Test responsive: mobile, tablet (`md:`), desktop (`lg:`)
11. Deploy to Vercel/Netlify

### Success Criteria
- [ ] All 9 sections render correctly
- [ ] Dark/light theme toggles smoothly with 0.3s transition
- [ ] Currency switcher updates pricing across all sections
- [ ] Auto-detects Indian users → INR pricing
- [ ] 3D hover effects on feature cards work
- [ ] Particle system and wireframe meshes animate
- [ ] Mobile hamburger menu opens/closes
- [ ] All animations perform at 60fps
- [ ] Responsive on mobile/tablet/desktop
- [ ] `craco build` succeeds without errors

### References
- PRD.md: §7.5 (Platform Scope — Website)
- TECH_STACK.md: §3 (Landing Page Stack)
- FRONTEND_GUIDELINES.md: §6 (Website Design System)
- APP_FLOW.md: §3 (Landing Page Navigation)

---

## Risk Mitigation

### Technical Risks
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Supabase free tier limits | High | Monitor usage, optimize queries, plan upgrade |
| Expo SDK incompatibility | Medium | Pin to SDK 54, test before upgrading |
| React Native performance | Medium | FlatList for lists, limit re-renders, pagination |
| Auth token expiry | Low | Supabase auto-refresh, test session recovery |

### Timeline Risks
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Feature creep | High | Strict adherence to PRD P0 features only |
| Complex state management | Medium | Keep Context API simple, extract hooks |
| UI bugs in dark/light modes | Low | Test both themes per phase |

---

## Overall Success Criteria (MVP)
- [ ] All 6 P0 features functional (Auth, Dashboard, Transactions, Budgets, Investments, Settings)
- [ ] Both dark and light themes working correctly
- [ ] RLS preventing cross-user data access
- [ ] App launches in < 3 seconds
- [ ] Screen transitions feel smooth (< 300ms)
- [ ] No crashes on Android (Samsung Galaxy, Pixel devices)
- [ ] All CRUD operations work with proper error handling

---

## Post-MVP Roadmap
1. **V1.1 (Weeks 5-6)**: Charts/analytics, export data, bill reminders
2. **V1.2 (Weeks 7-8)**: Multi-currency, recurring transactions
3. **V2.0 (Weeks 9-12)**: AI insights, financial goals, advanced analytics
4. **V3.0 (Future)**: Bank linking, social/family features, iOS release
```

### Sample AI Prompt for IMPLEMENTATION_PLAN Generation

```
Create a phased Implementation Plan for FinTrack — a Finance Management &
Investment Tracker built with React Native/Expo and Supabase.

Context:
- Solo developer, 4-week MVP timeline
- 6 core features: Auth, Dashboard, Transactions, Budgets, Investments, Settings
- Stack: Expo 54, Supabase, React Navigation, TypeScript
- Design: Dark mode default, Indigo brand color

Generate 8 phases:
1. PROJECT SETUP (Days 1-2) — Expo init, Supabase setup, directory structure
2. DESIGN SYSTEM (Days 2-3) — Theme tokens, ThemeProvider, base components
3. AUTH (Days 3-5) — Supabase Auth, Login/Register screens, AuthProvider
4. DASHBOARD (Days 5-7) — Summary cards, recent transactions, custom tab bar
5. TRANSACTIONS (Days 7-10) — Full CRUD, filters, search, categories
6. BUDGETS (Days 10-12) — Monthly budgets, progress bars, spending calc
7. INVESTMENTS (Days 12-14) — Portfolio tracking, gain/loss, add/edit/delete
8. SETTINGS & POLISH (Days 14-16) — Theme toggle, profile, bug fixes

For EACH phase:
- Goals (2-3 sentences)
- Tasks (numbered, specific, with code snippets where helpful)
- Success criteria (checkboxes, testable)
- References (to other documentation sections)

Also include:
- RISK MITIGATION — Technical + timeline risks table
- OVERALL SUCCESS CRITERIA — MVP completion checklist
- POST-MVP ROADMAP — V1.1, V1.2, V2.0, V3.0 milestones

CRITICAL: Each phase must be independently testable. Order by dependency.
OUTPUT FORMAT: Markdown with tables, checklists, code blocks.
```

---

## Security Hardening (Applied Patches)

This section documents all security vulnerabilities identified and the fixes applied.

### 🔐 Fix 1: Credential Management (HIGH — FIXED ✅)

**Problem:** Supabase URL and anon key were hardcoded in `src/lib/supabase.ts`, exposing them in Git history, APK decompilation, and OTA updates.

**Fix Applied:**
- Created `.env` file with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Updated `supabase.ts` to read from `process.env.EXPO_PUBLIC_*`
- Added runtime validation — app crashes fast if credentials are missing
- Added `.env`, `.env.local`, `.env.production` to `.gitignore`
- Updated `app.json` with `extra` config for Expo Constants fallback

**Files Changed:** `.env` (new), `src/lib/supabase.ts`, `.gitignore`, `app.json`

### 🔐 Fix 2: Rate Limiting & Input Validation (HIGH — FIXED ✅)

**Problem:** No client-side rate limiting on login, signup, or password reset. No input validation. Brute-force attacks possible.

**Fix Applied in `src/hooks/useAuth.tsx`:**

| Protection | Configuration |
|-----------|---------------|
| **Max attempts** | 5 per minute window |
| **Lockout** | 5 minutes after max attempts exceeded |
| **Cooldown** | 3 seconds between attempts |
| **Email validation** | Format check, max 254 chars, trimmed + lowercased |
| **Password validation** | Min 6 chars, max 128 chars |
| **Username validation** | Max 50 chars, alphanumeric + `_`, `-`, space only |
| **Profile updates** | Whitelisted fields only (username, theme_preference) |
| **Removed** | `console.log` of user credentials in signup flow |

### 🔐 Fix 3: Input Sanitization — Database (HIGH — FIXED ✅)

**Problem:** `category`, `description`, `stock_symbol` fields had no length limits or pattern validation in the schema.

**Fix Applied in `supabase_security_patch.sql`:**

```sql
-- Transactions
category          <= 50 chars, pattern: ^[a-zA-Z0-9\s\-&']+$
description       <= 500 chars (or NULL), no <>{} chars (HTML injection block)
transaction_date  <= CURRENT_DATE + 1 (no future dates)
amount            <= 999,999,999.99

-- Budgets
category          <= 50 chars, same pattern

-- Investments
stock_symbol      <= 20 chars, pattern: ^[A-Z0-9\.\-]+$
purchase_price    <= 99,999,999.99
current_price     <= 99,999,999.99

-- Profiles
username          <= 50 chars, pattern: ^[a-zA-Z0-9_\-\s]+$
```

### 🔐 Fix 4: Audit Logging (MEDIUM — FIXED ✅)

**Problem:** No record of who deleted transactions, failed logins, or account changes.

**Fix Applied:** Created `audit_logs` table with full forensic logging:
- RLS enabled (users see only their own logs)
- Auto-audit triggers on **all sensitive tables** (transactions, budgets, investments)
- Logs full `old_data` + `new_data` (JSONB) for INSERT/UPDATE/DELETE
- Tracks `table_name`, `record_id`, `user_id`, timestamp
- Audit logs are **immutable** — UPDATE and DELETE blocked by RLS
- Indexed by `(user_id, created_at DESC)` for fast queries

### 🔐 Fix 5: Soft Delete for Transactions (MEDIUM — FIXED ✅)

**Problem:** Hard-deleting transactions is irreversible and prevents audit trails.

**Fix Applied:**
- Added `deleted_at TIMESTAMP` column (NULL = active)
- Updated RLS policies to filter by `deleted_at IS NULL` for normal queries
- Separate policy for viewing deleted transactions (recovery)
- Data retention function: permanently purge soft-deleted records after 90 days

### 🔐 Fix 6: Type Safety Strengthened (MEDIUM — FIXED ✅)

**Problem:** `category: string` in TypeScript allowed any value despite the database having valid categories.

**Fix Applied in `src/types/database.ts`:**
- `Transaction.category` is now `ExpenseCategory | IncomeCategory` (strict union type)
- `Transaction.description` is now `string | null` (matches DB)
- `Transaction.deleted_at` added for soft-delete support
- `Investment` fields annotated with max bounds matching DB constraints

### ⚠️ Remaining Items (Future Phases)

| Issue | Severity | Status | When to Fix |
|-------|----------|--------|-------------|
| Field-level encryption for amounts | Medium | 📋 Planned | Post-MVP |
| Supabase Pro + India region (DPDP Act) | Medium | 📋 Planned | Before production launch |
| Offline-first with sync | Low | 📋 Planned | Post-MVP (PRD §12: out of scope) |
| React Query migration (performance) | Low | 📋 Planned | Post-MVP |
| Accessibility labels on all components | Medium | 📋 Planned | Phase 7 (Polish) |
| Comprehensive E2E testing | Medium | 📋 Planned | Pre-launch |
| Data residency compliance | High | 📋 Planned | Before production launch |
| Disaster recovery / cross-region backup | Medium | 📋 Planned | Post-MVP |

### How to Apply the Security Patch

1. **Environment variables:** Already applied to source code. Just ensure `.env` file exists with valid credentials.
2. **Database patch:** Run `supabase_security_patch.sql` in your Supabase SQL Editor (Dashboard → SQL → New Query → paste → Run).
3. **Verify:** After running the patch, test that existing transactions and profiles still work correctly.
4. **Validate:** Run `node scripts/validate-security.js` — all 9 checks must pass.
5. **Reference:** See `SECURITY.md` for the full security & compliance guide.

---

## 🏢 Multi-Tenant SaaS Architecture (White-Label Ready)

> **Migration file:** `supabase_multitenant_migration.sql`
> **Run AFTER:** `supabase_schema.sql` AND `supabase_security_patch.sql`

This section documents the multi-tenant architecture that converts FinTrack from a single-user personal finance app into a **white-label SaaS framework** that can be sold to businesses, accounting firms, and fintech startups.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    ORGANIZATION (Tenant)                 │
│  ┌───────────────────────────────────────────────────┐  │
│  │ branding_settings (logo, colors, features, etc.)  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │  OWNER  │  │  ADMIN  │  │ MANAGER │  │ MEMBER  │   │
│  │ (role)  │  │ (role)  │  │ (role)  │  │ (role)  │   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │
│       │            │            │            │          │
│  ┌────┴────────────┴────────────┴────────────┴────┐    │
│  │           ALL DATA SCOPED BY org_id            │    │
│  │  transactions | budgets | investments | logs   │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Schema Changes

#### New Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `organizations` | Tenant container | `id`, `name`, `slug`, `plan`, `max_users`, `is_active` |
| `branding_settings` | White-label config per org | `app_name`, `logo_url`, `primary_color`, `default_currency`, `feature_flags` |
| `invitations` | Team invite system | `email`, `role`, `token`, `status`, `expires_at` |

#### Modified Tables (added `organization_id`)

| Table | New Column | Impact |
|-------|-----------|--------|
| `profiles` | `organization_id`, `role`, `is_active` | Every user belongs to an org with a role |
| `transactions` | `organization_id` | All transactions scoped to org |
| `budgets` | `organization_id` | All budgets scoped to org |
| `investments` | `organization_id` | All investments scoped to org |
| `audit_logs` | `organization_id` | All audit logs scoped to org |

### 🔐 RBAC (Role-Based Access Control)

#### Role Hierarchy

| Role | Level | Permissions |
|------|-------|-------------|
| **owner** | 5 | Full control — billing, delete org, transfer ownership |
| **admin** | 4 | Manage members, change roles, update branding, delete any data |
| **manager** | 3 | Edit/delete any member's transactions/budgets/investments |
| **member** | 2 | Create/edit/delete own data, view org-wide data |
| **viewer** | 1 | Read-only access to all org data |

#### Permission Matrix

| Action | Owner | Admin | Manager | Member | Viewer |
|--------|-------|-------|---------|--------|--------|
| View org data | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create transactions | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit own transactions | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit others' transactions | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete any transaction | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage team members | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update branding | ✅ | ✅ | ❌ | ❌ | ❌ |
| Send invitations | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage billing/plan | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete organization | ✅ | ❌ | ❌ | ❌ | ❌ |

#### Helper Functions (PostgreSQL)

```sql
-- Get current user's organization
SELECT public.get_user_org_id();

-- Get current user's role
SELECT public.get_user_role();

-- Check if user has at least 'manager' level
SELECT public.has_role('manager');  -- returns true/false
```

#### TypeScript Usage

```typescript
import { hasRole, UserRole, ROLE_HIERARCHY } from '@/types/database';

// Check permissions in app code
const canEditOthersData = hasRole(currentUser.role, 'manager');
const canManageTeam = hasRole(currentUser.role, 'admin');
const canDeleteOrg = hasRole(currentUser.role, 'owner');

// Conditionally render UI
{canManageTeam && <TeamManagementPanel />}
{canEditOthersData && <EditButton />}
```

### 🎨 White-Label Branding System

Each organization has a `branding_settings` row that controls:

#### Visual Customization

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `app_name` | string | "FinTrack" | Displayed in header, title, emails |
| `logo_url` | URL | null | Custom logo (max 500 chars) |
| `favicon_url` | URL | null | Custom favicon |
| `primary_color` | hex | #3B82F6 | Main brand color |
| `secondary_color` | hex | #14B8A6 | Accent/secondary color |
| `accent_color` | hex | #06B6D4 | Tertiary/highlight color |
| `footer_text` | string | "© 2026 FinTrack..." | Footer copyright text |
| `support_email` | email | null | Support contact |

#### Functional Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `default_currency` | enum | USD | 15 currencies supported |
| `default_theme` | enum | dark | light or dark |
| `supported_currencies` | array | [USD,EUR,GBP,INR] | Which currencies to show |
| `custom_categories` | JSONB | null | Override default expense/income categories |

#### Feature Flags

```json
{
    "investments": true,
    "budgets": true,
    "reports": true,
    "export_csv": true,
    "export_pdf": false,
    "ai_insights": false,
    "multi_currency": true,
    "team_collaboration": false,
    "api_access": false
}
```

Buyers can toggle features on/off per organization. This lets you sell tiered plans or customize per client.

#### Usage in App

```typescript
// Fetch branding for current org
const { data: branding } = await supabase
    .from('branding_settings')
    .select('*')
    .single();

// Apply branding
document.title = branding.app_name;
setCSSVariable('--primary-color', branding.primary_color);

// Check feature flags
if (branding.feature_flags.investments) {
    showInvestmentTab();
}
```

### 📨 Invitation System

#### Flow

```
Admin → Creates Invitation → Email sent with token
  ↓
Invitee → Clicks link → Signs up → Profile linked to org with assigned role
  ↓
Invitation status → 'accepted'
```

#### States

| Status | Description |
|--------|-------------|
| `pending` | Awaiting acceptance (7-day expiry) |
| `accepted` | User joined the organization |
| `expired` | Token expired (after 7 days) |
| `revoked` | Admin cancelled the invitation |

### 💰 Plan Configuration

| Plan | Max Users | Monthly Price (USD) | Key Features |
|------|-----------|-------------------|-------------|
| **Free** | 1 | $0 | Transactions, budgets, basic reports |
| **Pro** | 5 | $9.99 | + Investments, CSV export, multi-currency |
| **Business** | 25 | $29.99 | + PDF export, team collaboration, AI insights |
| **Enterprise** | Unlimited | Custom | + API access, custom integrations, SLA |

Plan limits are enforced at both the database level (trigger `check_plan_limits`) and application level (TypeScript `PLAN_LIMITS` constant).

### 🚀 Deployment Guide for Buyers

#### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose region closest to your users
3. Note your `Project URL` and `anon key`

#### Step 2: Run Database Migrations (in order)

```
1. supabase_schema.sql              ← Base tables
2. supabase_security_patch.sql      ← Security constraints + audit logs
3. supabase_multitenant_migration.sql ← Multi-tenant + RBAC + white-label
```

Run each in: Dashboard → SQL Editor → New Query → Paste → Run

#### Step 3: Configure Environment

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Step 4: Customize Branding

After the first user signs up, update `branding_settings` in Supabase:

```sql
UPDATE branding_settings SET
    app_name = 'YourBrand Finance',
    primary_color = '#FF6B35',
    secondary_color = '#004E64',
    default_currency = 'EUR',
    footer_text = '© 2026 YourBrand. All rights reserved.',
    support_email = 'support@yourbrand.com',
    feature_flags = '{
        "investments": true,
        "budgets": true,
        "reports": true,
        "export_csv": true,
        "export_pdf": true,
        "ai_insights": false,
        "multi_currency": true,
        "team_collaboration": true,
        "api_access": false
    }'
WHERE organization_id = 'your-org-uuid';
```

#### Step 5: Build and Deploy

```bash
# Mobile app
npx expo build:android   # or eas build --platform android

# Landing page
cd "landing page/frontend"
npm run build
# Deploy dist/ to Vercel, Netlify, or your host
```

### SQL Migration Execution Order

```
supabase_schema.sql                   ← STEP 1 (required)
    ↓
supabase_security_patch.sql           ← STEP 2 (required)
    ↓
supabase_multitenant_migration.sql    ← STEP 3 (required for SaaS)
```

**Important:** The multi-tenant migration drops and recreates some RLS policies. Always run in the correct order.

---

## 🛡️ Authentication Hardening (OAuth + OTP + CAPTCHA)

> **Migration file:** `supabase_auth_hardening.sql`
> **Run AFTER:** `supabase_multitenant_migration.sql`

This section documents the enhanced authentication system that ensures only real, verified humans can access the application.

### Authentication Methods

#### Supported OAuth Providers

| Provider | Supabase Key | Notes |
|----------|-------------|-------|
| **Google** | `google` | Most common, recommended as primary |
| **Microsoft** | `azure` | Best for enterprise/B2B clients |
| **Apple** | `apple` | Required for iOS App Store compliance |
| **GitHub** | `github` | Popular with developer-focused products |

OAuth users are **automatically verified** — no OTP needed since the provider already confirmed their identity.

#### Email + Password Registration

For email/password signups, the following verification flow is enforced:

```
User signs up → Account created (unverified) → 6-digit OTP sent to email
    ↓
User enters OTP → ✅ Verified (full access)
                → ❌ Wrong code → Attempts remaining decremented
                                → 0 attempts left → 🔒 12-hour lockout
```

### 📧 Email Verification (OTP) System

#### Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Code length | 6 digits | Cryptographically random |
| Code expiry | 10 minutes | Auto-expires after this period |
| Cooldown between requests | 59 seconds | Prevents OTP spam |
| Max verification attempts | 3 | Per OTP code |
| Lockout duration | 12 hours | After all attempts exhausted |
| User feedback | Real-time | Shows attempts remaining |

#### OTP Verification Flow (Detailed)

```
STEP 1: User signs up with email + password
    → Account created in auth.users
    → Profile created (email_verified = false)
    → OTP generated (6-digit, random)
    → OTP stored in email_verifications table
    → OTP sent to user's email (via SendGrid/Resend)
    → 59-second cooldown timer starts

STEP 2: User enters OTP code
    → System checks:
        ├── Is account locked? → Show lockout timer
        ├── Is OTP expired? → Ask for new code
        ├── Is OTP correct?
        │   ├── YES → email_verified = true, full access granted ✅
        │   └── NO  → attempts_used++
        │            → Show: "X attempt(s) remaining"
        │            └── If 0 remaining → Lock for 12 hours 🔒

STEP 3 (if locked): User returns after 12hrs
    → Lockout cleared
    → User can request new OTP
    → 3 fresh attempts granted
```

#### User Feedback Messages

| Scenario | Message Shown to User |
|----------|----------------------|
| OTP sent | "Verification code sent to user@email.com" |
| Correct code | "Email verified successfully! ✅" |
| Wrong code (2 left) | "Incorrect verification code. 2 attempt(s) remaining." |
| Wrong code (1 left) | "Incorrect verification code. 1 attempt(s) remaining." |
| Wrong code (0 left) | "Incorrect code. All attempts used. Account locked for 12 hours." |
| Cooldown active | "Please wait 42 seconds before requesting a new code." |
| Account locked | "Account verification locked. Please try again after 12 hours." |
| OTP expired | "No active verification code found. Please request a new one." |

#### Database Functions

```sql
-- Generate new OTP (respects cooldown + lockout)
SELECT public.create_otp('user-uuid', 'user@email.com');
-- Returns: { success: true, otp: "482917", expires_in_seconds: 600, max_attempts: 3 }

-- Verify OTP (handles attempt counting + lockout)
SELECT public.verify_otp('user-uuid', '482917');
-- Returns: { success: true, message: "Email verified!" }
-- Or:      { success: false, error: "Incorrect code. 2 attempt(s) remaining.", attempts_left: 2 }
-- Or:      { success: false, error: "Account locked.", locked: true }
```

#### TypeScript Usage

```typescript
const { 
    signUp, signInWithProvider, 
    sendVerificationOTP, verifyOTP, 
    otpState, isEmailVerified 
} = useAuth();

// OAuth sign-in (auto-verified, no OTP needed)
await signInWithProvider('google');

// Email sign-up (triggers OTP automatically)
await signUp('user@email.com', 'SecurePass123', 'username');

// Verify OTP
const { error, attemptsLeft } = await verifyOTP('482917');
if (error) {
    console.log(`Error: ${error.message}`);
    console.log(`Attempts remaining: ${attemptsLeft}`);
}

// Check OTP state for UI
console.log(otpState.cooldownSeconds);  // 42 (countdown timer)
console.log(otpState.attemptsLeft);     // 2
console.log(otpState.isLocked);         // false
console.log(otpState.message);          // "Incorrect code. 2 attempt(s) remaining."

// Block unverified users
if (!isEmailVerified) {
    showVerificationScreen();
}
```

### 🤖 CAPTCHA Integration (Anti-Bot)

#### Provider: Cloudflare Turnstile (Recommended)

| Feature | Turnstile | reCAPTCHA v3 | hCaptcha |
|---------|-----------|-------------|----------|
| Free tier | ✅ Unlimited | ✅ 1M/month | ✅ Limited |
| Privacy | ✅ No tracking | ❌ Google tracking | ✅ Privacy-first |
| Invisible mode | ✅ | ✅ | ❌ |
| Supabase native | ✅ Built-in | ❌ | ✅ Built-in |

#### Supabase CAPTCHA Setup

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile → Add Site
2. Get your **Site Key** and **Secret Key**
3. In Supabase Dashboard → Auth → Settings → Enable CAPTCHA
4. Select "Turnstile" and enter your Secret Key
5. Add the Site Key to your `.env`:

```env
EXPO_PUBLIC_CAPTCHA_SITE_KEY=0x4AAAA...your-turnstile-site-key
```

#### Where CAPTCHA is Required

| Action | CAPTCHA Required | Why |
|--------|-----------------|-----|
| Sign Up | ✅ Yes | Prevents bot account creation |
| Sign In | ✅ Yes | Prevents credential stuffing |
| Password Reset | ✅ Yes | Prevents email spam attacks |
| OTP Verification | ❌ No | Already rate-limited + locked |

#### CAPTCHA in the App

```typescript
// Pass captchaToken from Turnstile widget to auth methods
const { error } = await signUp(email, password, username, captchaToken);
const { error } = await signIn(email, password, captchaToken);
const { error } = await resetPassword(email, captchaToken);
```

### Password Requirements (Updated)

| Rule | Requirement |
|------|-------------|
| Minimum length | 8 characters (was 6) |
| Maximum length | 128 characters |
| Uppercase | At least 1 uppercase letter required |
| Lowercase | At least 1 lowercase letter required |
| Number | At least 1 number required |
| Special characters | Recommended but not required |

### Schema Changes (Auth Hardening)

#### New Tables

| Table | Purpose |
|-------|---------|
| `email_verifications` | Stores OTP codes, attempts, expiry, lockout status |
| `captcha_verifications` | Audit log for CAPTCHA challenges (anti-fraud) |

#### Modified Tables

| Table | New Columns |
|-------|------------|
| `profiles` | `email_verified`, `auth_provider`, `verification_locked_until` |

### SQL Migration Execution Order (Updated)

```
supabase_schema.sql                   ← STEP 1 (required)
    ↓
supabase_security_patch.sql           ← STEP 2 (required)
    ↓
supabase_multitenant_migration.sql    ← STEP 3 (required for SaaS)
    ↓
supabase_auth_hardening.sql           ← STEP 4 (required for auth security)
    ↓
supabase_2fa_migration.sql            ← STEP 5 (required for 2FA)
```

---

## 🔐 Two-Factor Authentication (2FA/TOTP)

> **Migration file:** `supabase_2fa_migration.sql`
> **Run AFTER:** `supabase_auth_hardening.sql`

This section documents the TOTP-based two-factor authentication system with backup recovery codes.

### 2FA Setup Flow

```
STEP 1: User navigates to Security Settings
    → Clicks "Enable 2FA"
    → System generates TOTP secret (20 bytes, base32)
    → Creates otpauth:// URI for QR code
    → Stores encrypted secret in totp_secrets (not yet verified)

STEP 2: User scans QR code
    → Opens Google Authenticator / Microsoft Authenticator
    → Scans the QR code (or enters secret manually)
    → Authenticator starts generating 6-digit codes

STEP 3: User confirms with TOTP code
    → Enters the current 6-digit code from authenticator
    → System verifies the code matches
    → ✅ Mark as verified + enabled
    → Generate 8 backup recovery codes
    → Display codes to user (ONE TIME ONLY)
    → User saves codes securely

STEP 4: All future logins require 2FA
    → Password → ✅ → 2FA code prompt → ✅ → Access granted
```

### QR Code Details

| Parameter | Value |
|-----------|-------|
| URI format | `otpauth://totp/FinTrack:{email}?secret={base32}&issuer=FinTrack&algorithm=SHA1&digits=6&period=30` |
| Algorithm | SHA1 (universal compatibility) |
| Digits | 6 |
| Period | 30 seconds |
| Issuer | "FinTrack" (shown in authenticator app) |

### Backup Recovery Codes

| Feature | Detail |
|---------|--------|
| Count | 8 codes per user |
| Format | `XXXX-XXXX` (uppercase hex) |
| Storage | SHA-256 hashed (never stored in plaintext) |
| Usage | One-time use only |
| Verification | Hash comparison via `verify_backup_code()` RPC |
| Regeneration | Only on new 2FA setup (old codes deleted) |

### 2FA Brute-Force Protection

| Trigger | Action |
|---------|--------|
| 5 failed TOTP attempts in 10 minutes | 🔒 2FA locked for 30 minutes |
| 5 failed backup code attempts in 10 minutes | 🔒 2FA locked for 30 minutes |
| All 8 backup codes used | Must re-setup 2FA to get new codes |

### Database Functions (2FA)

```sql
-- Generate 8 backup codes (deletes old ones)
SELECT public.generate_backup_codes('user-uuid');
-- Returns: { success: true, codes: ["A3F2-B7C1", ...], message: "Save these codes..." }

-- Verify a backup code (one-time use)
SELECT public.verify_backup_code('user-uuid', 'A3F2-B7C1');
-- Returns: { success: true, remaining_codes: 7 }

-- Check 2FA status
SELECT public.get_tfa_status('user-uuid');
-- Returns: { is_enabled: true, remaining_backup_codes: 7, last_used: "..." }
```

### TypeScript Usage (2FA)

```typescript
const {
    setup2FA, verify2FASetup, verify2FALogin,
    verifyBackupCode, disable2FA, get2FAStatus,
    tfaState
} = useAuth();

// 1. Setup: Generate QR code
const { error, qrCodeUri, secret } = await setup2FA();
// Display qrCodeUri as a QR code image for user to scan

// 2. Confirm: User enters code from authenticator
const { error, backupCodes } = await verify2FASetup('482917');
// Display backupCodes to user (one-time display!)

// 3. Login: After password, prompt for 2FA code
const { error } = await verify2FALogin('593721');

// 4. Backup: Use backup code instead of TOTP
const { error, remainingCodes } = await verifyBackupCode('A3F2-B7C1');

// 5. Disable: Requires password confirmation
const { error } = await disable2FA('userPassword123');

// 6. Check status
const status = await get2FAStatus();
console.log(status?.remaining_backup_codes); // 7

// 7. Use tfaState for UI
console.log(tfaState.isEnabled);      // true/false
console.log(tfaState.isSettingUp);     // true during setup
console.log(tfaState.qrCodeUri);       // otpauth://...
console.log(tfaState.backupCodes);     // ['A3F2-B7C1', ...] (only after setup)
console.log(tfaState.isLocked);        // true if brute-force locked
```

### Schema Changes (2FA)

#### New Tables

| Table | Purpose |
|-------|---------|
| `totp_secrets` | Stores encrypted TOTP secret, per user (unique) |
| `backup_codes` | 8 hashed recovery codes, one-time use |
| `tfa_attempts` | Audit log of all 2FA verification attempts |

#### Modified Tables

| Table | New Columns |
|-------|------------|
| `profiles` | `tfa_enabled`, `tfa_locked_until` |

---

## Conclusion: Using This Documentation Guide


### How to Use These 6 Documents

| Document | When to Reference | Key Use |
|----------|-------------------|---------| 
| **PRD.md** | Starting any feature | "What should this feature do?" (§7.5 for platform scope) |
| **APP_FLOW.md** | Building screens/navigation | "Where does this screen go?" (Mobile + Website flows) |
| **TECH_STACK.md** | Adding dependencies | "What version should I use?" (§2 Mobile, §3 Website) |
| **FRONTEND_GUIDELINES.md** | Styling any component | "What color/spacing/font?" (§2-5 Mobile, §6 Website) |
| **BACKEND_STRUCTURE.md** | Database queries | "What's the table schema?" (Shared Supabase backend) |
| **IMPLEMENTATION_PLAN.md** | Planning sprints | "What should I build next?" (Phases 0-7 Mobile, Phase 8 Website) |

### Dual-Platform Reference Guide

| Question | Mobile App Answer | Website Answer |
|----------|------------------|----------------|
| **"What color palette?"** | Indigo #6366F1 (FRONTEND_GUIDELINES §2) | Blue-teal gradient (FRONTEND_GUIDELINES §6) |
| **"What styling approach?"** | React Native StyleSheet (FRONTEND_GUIDELINES §3) | Tailwind CSS utilities (FRONTEND_GUIDELINES §6) |
| **"What UI library?"** | Custom components (FRONTEND_GUIDELINES §3) | Shadcn/Radix 46 primitives (TECH_STACK §3) |
| **"What navigation?"** | Custom tab bar + stack (APP_FLOW §3) | Single page scroll + anchor links (APP_FLOW §3) |
| **"What theme system?"** | ThemeContext + useTheme hook (theme.ts) | useTheme.js + localStorage + Tailwind class (FRONTEND_GUIDELINES §6) |
| **"What animations?"** | Minimal — opacity, spinner (APP_FLOW §8) | 14 CSS animations + 7 effect classes (FRONTEND_GUIDELINES §6) |
| **"What backend?"** | Supabase (BACKEND_STRUCTURE — same for both) | N/A — static marketing page |

### AI Prompting Strategy

When using AI to build FinTrack, always specify the **platform** and attach relevant document sections:

```
Build the Dashboard screen for the FinTrack MOBILE APP.

Refer to:
- PRD.md §6.2 for feature requirements
- APP_FLOW.md §4 (Dashboard screen inventory) for elements and states
- FRONTEND_GUIDELINES.md §2-3 for colors, spacing, components (MOBILE)
- BACKEND_STRUCTURE.md §4 for Supabase query patterns
- TECH_STACK.md §2 for mobile library versions

CRITICAL: Use React Native StyleSheet, NOT Tailwind CSS.
Use ONLY the technologies specified in TECH_STACK.md §2.
```

```
Update the HeroSection for the FinTrack WEBSITE landing page.

Refer to:
- PRD.md §7.5 for website scope and section descriptions
- APP_FLOW.md §3 (Landing Page Navigation) for structure
- FRONTEND_GUIDELINES.md §6 for website design system (Tailwind, animations, theme)
- TECH_STACK.md §3 for website library versions
- IMPLEMENTATION_PLAN.md Phase 8 for build order

CRITICAL: Use Tailwind CSS utilities, NOT React Native StyleSheet.
Use ONLY the technologies specified in TECH_STACK.md §3.
```

### Key Principles

1. **Always specify the platform** — "Mobile App" or "Website" in every AI prompt
2. **AI reads docs before writing code** — Reference specific sections with §numbers
3. **No hallucination** — If it's not in the docs, it's not in the project
4. **Different styling per platform** — Mobile = StyleSheet, Website = Tailwind CSS
5. **Out of scope = out of code** — Respect the boundaries in PRD.md §7
6. **Consistency within each platform** — Same patterns, same colors, same API patterns
7. **Test each phase** — Use success criteria from IMPLEMENTATION_PLAN.md
8. **Update docs as code evolves** — Documents are living, keep them current

---

*This guide was generated based on the actual FinTrack codebase analysis including: `App.tsx`, `RootNavigator.tsx`, `useAuth.tsx`, `useTheme.tsx`, `theme.ts`, `supabase.ts`, `database.ts`, `supabase_schema.sql`, `package.json` (mobile app), and `App.js`, `Navbar.jsx`, `HeroSection.jsx`, `FeaturesSection.jsx`, `Showcase3DSection.jsx`, `HowItWorksSection.jsx`, `PricingSection.jsx`, `FAQSection.jsx`, `CTASection.jsx`, `Footer.jsx`, `useTheme.js`, `useCurrency.js`, `App.css`, `index.css`, `tailwind.config.js`, `package.json` (landing page).*


