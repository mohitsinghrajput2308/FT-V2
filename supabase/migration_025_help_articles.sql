-- =====================================================
-- Migration: Create help_articles table for HelpCenter
-- =====================================================
-- This table stores knowledge base articles for the help center
-- Articles are publicly viewable but some may be restricted by subscription tier

BEGIN;

-- Create help_articles table
CREATE TABLE IF NOT EXISTS public.help_articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Article metadata
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  
  -- Category and access control
  category VARCHAR(50) NOT NULL CHECK (category IN ('getting_started', 'account_billing', 'features_howttos', 'troubleshooting')),
  min_subscription_tier VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (min_subscription_tier IN ('free', 'pro', 'business')),
  
  -- Ordering and visibility
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (public read access based on subscription)
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All users can view published articles (free tier articles always visible)
CREATE POLICY "Public articles are viewable by all"
  ON public.help_articles FOR SELECT
  USING (is_published = true AND min_subscription_tier = 'free');

-- RLS Policy: Pro users can view pro+free articles
CREATE POLICY "Pro users can view pro and free articles"
  ON public.help_articles FOR SELECT
  USING (
    is_published = true 
    AND (
      min_subscription_tier = 'free' 
      OR (
        auth.uid() IS NOT NULL 
        AND EXISTS (
          SELECT 1 FROM public.subscriptions s 
          WHERE s.user_id = auth.uid() 
          AND s.plan IN ('pro', 'business')
        )
      )
    )
  );

-- RLS Policy: Business users can view all published articles
CREATE POLICY "Business users can view all articles"
  ON public.help_articles FOR SELECT
  USING (
    is_published = true 
    AND (
      min_subscription_tier = 'free' 
      OR (
        auth.uid() IS NOT NULL 
        AND EXISTS (
          SELECT 1 FROM public.subscriptions s 
          WHERE s.user_id = auth.uid() 
          AND s.plan = 'business'
        )
      )
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_help_articles_category 
  ON public.help_articles(category);
CREATE INDEX IF NOT EXISTS idx_help_articles_published 
  ON public.help_articles(is_published);
CREATE INDEX IF NOT EXISTS idx_help_articles_sort_order 
  ON public.help_articles(sort_order);

-- Insert help articles data
INSERT INTO public.help_articles (title, slug, content, excerpt, category, min_subscription_tier, sort_order) VALUES

-- Getting Started (12 articles)
('How to Create an Account', 'how-to-create-account', 'Click "Get Started" on the homepage, then fill in your details including your full name, email, unique User ID, and set a security question. Verify your email address and you''ll be ready to start tracking your finances in under 2 minutes.', 'Quick steps to create your FinTrack account', 'getting_started', 'free', 1),
('Setting Up Your Profile', 'setting-up-profile', 'Navigate to Profile in the dashboard to add your personal information. You can upload a profile picture, add your phone number, occupation, and bio. Your profile is private and only used to personalize your experience.', 'Complete your profile for a personalized experience', 'getting_started', 'free', 2),
('Linking Your First Account', 'linking-first-account', 'Go to Dashboard > Connect Accounts. FinTrack supports CSV import and Plaid integration for direct bank connections. Simply follow the secure authentication flow. Your credentials are never stored—only encrypted transaction data.', 'Connect your bank or financial accounts securely', 'getting_started', 'free', 3),
('Understanding the Dashboard', 'understanding-dashboard', 'Your dashboard provides an at-a-glance overview of your finances: total balance, recent transactions, budget status, and upcoming bills. Charts and insights update automatically as you add transactions.', 'Navigate and understand your dashboard overview', 'getting_started', 'free', 4),
('First Steps with Transactions', 'first-steps-transactions', 'Start by adding transactions manually or importing from your bank. Go to Income or Expenses, click "Add", then enter the amount, category, date, and optional description. Transactions are categorized automatically.', 'Add your first income and expense transactions', 'getting_started', 'free', 5),
('Setting Your First Budget', 'setting-first-budget', 'Navigate to Budgets > Create Budget. Choose a category, set your monthly limit, and define your spending control level. FinTrack will alert you if you approach or exceed your limit.', 'Create a monthly budget for any category', 'getting_started', 'free', 6),
('Creating Financial Goals', 'creating-financial-goals', 'Go to Goals > Add Goal. Enter your goal name, target amount, deadline, and priority level. Track your progress toward each goal and celebrate milestones as you save.', 'Set financial goals and track progress', 'getting_started', 'free', 7),
('Setting Up Bill Reminders', 'setting-up-bill-reminders', 'Navigate to Bills > Add Bill. Enter the bill name, amount, due date, category, and priority. You''ll receive notifications before due dates never miss an important payment.', 'Create reminders for recurring bills and payments', 'getting_started', 'free', 8),
('Importing Data from CSV', 'importing-data-csv', 'Go to Settings > Import Data. Download our CSV template, fill it with your transaction history, and upload. Your data will be processed and categorized automatically.', 'Bulk import historical transactions from CSV', 'getting_started', 'free', 9),
('Mobile App Setup', 'mobile-app-setup', 'Download FinTrack from your app store, sign in with your credentials, and enjoy the same features on mobile. Your data syncs instantly across devices.', 'Get FinTrack on your mobile device', 'getting_started', 'free', 10),
('Enable Two-Factor Authentication', 'enable-2fa', 'Go to Settings > Security > Two-Factor Authentication. Scan the QR code with an authenticator app like Google Authenticator or Authy. You''ll need a code every time you log in for extra security.', 'Add an extra layer of security to your account', 'getting_started', 'free', 11),
('Customizing Your Preferences', 'customizing-preferences', 'In Settings, choose your preferred currency (8 options), date format, and notification preferences. Your dashboard will display all amounts in your chosen currency.', 'Personalize your app settings and preferences', 'getting_started', 'free', 12),

-- Account & Billing (8 articles)
('How to Reset Your Password', 'reset-password', 'Click "Forgot Password" on the login screen. Enter your email, and we''ll send you a secure reset link. Create a new password and log in immediately. Never share this link with anyone.', 'Recover access to your account', 'account_billing', 'free', 1),
('Updating Your Email Address', 'updating-email', 'Go to Settings > Account > Email Address. Enter your new email and verify it. Your old email will stop receiving notifications once you confirm the change.', 'Change the email associated with your account', 'account_billing', 'free', 2),
('Viewing Your Subscription Plan', 'viewing-subscription-plan', 'Go to Settings > Subscription. You''ll see your current plan (Free/Pro/Business), renewal date, and features included. Upgrade or downgrade anytime.', 'Check your current plan and billing details', 'account_billing', 'free', 3),
('Upgrading to a Paid Plan', 'upgrading-paid-plan', 'Visit Pricing on the homepage or go to Settings > Subscription. Choose Pro ($9.99/month) or Business ($24.99/month). Start your 14-day free trial immediately.', 'Upgrade for advanced features and priority support', 'account_billing', 'free', 4),
('Canceling Your Subscription', 'canceling-subscription', 'Go to Settings > Subscription > Manage Plan > Cancel. Your access to Pro/Business features continues until the end of your current billing cycle. Your data is never deleted.', 'Cancel your paid plan anytime', 'account_billing', 'free', 5),
('Understanding What''s Included in Each Plan', 'plan-comparison', 'Free: unlimited transactions, 2 budgets, 2 goals. Pro: multi-currency, advanced reports, priority email support. Business: all Pro features plus API access and custom categories.', 'Compare features across Free, Pro, and Business plans', 'account_billing', 'free', 6),
('Privacy and Your Data', 'privacy-data', 'Your financial data is encrypted at rest with AES-256, encrypted in transit with TLS 1.2+, and protected by row-level database security. We never sell or share your data with third parties.', 'Learn how your data is protected and used', 'account_billing', 'free', 7),
('Contact Support for Billing Issues', 'billing-support', 'Go to Help > Contact Support to submit a billing question. Pro users get 2-hour response times, Business users get 1-hour response times. Free users typically receive responses within 24 hours.', 'Get help with billing and payment issues', 'account_billing', 'free', 8),

-- Features & How-Tos (15 articles)
('How to Track Expenses', 'track-expenses', 'Go to Expenses, click "Add Expense", enter the amount, category, and date. Add notes for context. Expenses are categorized automatically and appear in your budget tracking.', 'Log and categorize your spending', 'features_howttos', 'free', 1),
('How to Track Income', 'track-income', 'Navigate to Income, click "Add Income", enter the amount, source (salary, freelance, investment, etc.), and date. Income is tracked separately from expenses for clarity.', 'Record all forms of income', 'features_howttos', 'free', 2),
('Using Budget Alerts', 'using-budget-alerts', 'Set budget limits in the Budgets section. FinTrack shows progress bars with color-coded warnings: green (on-track), yellow (caution at 80%), red (over-budget). Adjust budgets anytime.', 'Get alerted when you''re approaching budget limits', 'features_howttos', 'free', 3),
('Analyzing Your Spending Patterns', 'analyzing-spending-patterns', 'Go to Reports > Spending Analysis. View breakdowns by category, time period, and trends. Compare month-to-month spending to identify ways to save.', 'Understand where your money goes', 'features_howttos', 'free', 4),
('Using Advanced Reports (Pro)', 'advanced-reports-pro', 'Pro and Business plans include detailed reports: savings rate, investment returns, cash flow analysis, and custom date ranges. Export as PDF or CSV for further analysis.', 'Generate comprehensive financial reports', 'features_howttos', 'pro', 5),
('Creating Custom Categories', 'creating-custom-categories', 'Go to Settings > Categories > Add Custom Category. Create categories for specific needs (e.g., "Dog Grooming", "Side Gigs"). They''ll appear in transaction dropdowns.', 'Tailor categories to match your life', 'features_howttos', 'free', 6),
('Using Financial Calculators', 'using-financial-calculators', 'Access EMI Calculator, SIP Calculator, and Compound Interest Calculator in the Calculators section. Free users can run 5 calculations per month; Pro/Business have unlimited.', 'Plan your finances with powerful tools', 'features_howttos', 'free', 7),
('Setting Up Investment Tracking', 'investment-tracking', 'Go to Investments, click "Add Investment", select the asset type (stocks, mutual funds, crypto, etc.), enter quantity and purchase price. FinTrack tracks current values and returns.', 'Monitor your investment portfolio', 'features_howttos', 'free', 8),
('Exporting Your Data', 'exporting-data', 'Go to Settings > Data > Export. Choose CSV or JSON format and select a date range. Your data exports within seconds and is ready to analyze in Excel or other tools.', 'Download your financial data anytime', 'features_howttos', 'free', 9),
('Using Multi-Currency Support (Pro)', 'multi-currency-pro', 'Pro and Business users can switch between 8 currencies. Go to Settings > Preferences > Currency. All amounts convert automatically using live exchange rates.', 'Track finances across multiple currencies', 'features_howttos', 'pro', 10),
('Setting Up Recurring Transactions', 'recurring-transactions-pro', 'Pro users: go to Bills and check "Make Recurring". Choose frequency (weekly, monthly, yearly). Transactions auto-create on the specified date.', 'Automate recurring income and expenses', 'features_howttos', 'pro', 11),
('Understanding Net Worth Tracking', 'net-worth-tracking', 'Your net worth = total assets (investments, cash) - total liabilities (loans, credit cards). FinTrack calculates this automatically and shows how it changes over time.', 'Monitor your overall financial health', 'features_howttos', 'free', 12),
('Using Search and Filters', 'search-filters', 'Click the search icon in any list (transactions, budgets, goals). Filter by date range, category, amount, or keyword. Results update instantly as you type.', 'Find transactions and data quickly', 'features_howttos', 'free', 13),
('Sharing Reports with Family', 'sharing-reports', 'Business users can create shareable reports with view-only access. Go to Reports > Share. Recipients see a summary without access to sensitive details.', 'Collaborate on family finances safely', 'features_howttos', 'business', 14),
('API Access for Developers (Business)', 'api-access-business', 'Business users get full API access to build custom integrations. Visit API Docs for endpoints, authentication, and rate limits. Generate API keys in Settings.', 'Build custom applications with your data', 'features_howttos', 'business', 15),

-- Troubleshooting (10 articles)
('Why Isn''t My Bank Connection Working?', 'bank-connection-issues', 'Verify your login credentials are correct. If still failing, try: 1) Log out and back in, 2) Disconnect and reconnect the account, 3) Try CSV import temporarily. Contact support if the issue persists.', 'Resolve bank connection and sync problems', 'troubleshooting', 'free', 1),
('Transactions Not Appearing', 'transactions-missing', 'Transactions may take 30 seconds to 5 minutes to sync. Try refreshing the page (F5). Check your bank to confirm the transaction posted. If missing, add it manually.', 'Find and fix missing transactions', 'troubleshooting', 'free', 2),
('Login Issues and Account Access', 'login-issues', 'Can''t log in? 1) Check your email and password, 2) Try "Forgot Password", 3) Check email spam folder for verification emails, 4) Contact support if error persists.', 'Regain access to your account', 'troubleshooting', 'free', 3),
('Budget Calculations Seem Wrong', 'budget-calculation-issues', 'Budgets show spending in the current calendar month only. Transactions in future months don''t count yet. Edit the budget to adjust the limit if needed.', 'Verify your budget calculations are accurate', 'troubleshooting', 'free', 4),
('Mobile App Won''t Sync', 'mobile-sync-issues', 'Ensure you''re connected to WiFi or mobile data. Try logging out and back in. If still failing, uninstall and reinstall the app. Check app permissions in Settings.', 'Fix sync issues between devices', 'troubleshooting', 'free', 5),
('Slow App Performance', 'slow-performance', 'If the app feels slow: 1) Refresh the page, 2) Clear browser cache, 3) Close other apps/tabs, 4) Update your browser, 5) Try a different browser.', 'Speed up FinTrack and improve performance', 'troubleshooting', 'free', 6),
('Categories Missing or Incorrect', 'category-issues', 'Go to Settings > Categories to verify all your categories exist. Custom categories persist but may need to be reapplied to old transactions. Bulk-edit is available in Pro plan.', 'Fix category and classification problems', 'troubleshooting', 'free', 7),
('Unable to Export Data', 'export-issues', 'Go to Settings > Data > Export. Choose a date range and format. If export fails: 1) Try a smaller date range, 2) Clear browser cache, 3) Try a different browser.', 'Resolve data export problems', 'troubleshooting', 'free', 8),
('Payment Failed or Not Processing', 'payment-issues', 'Verify your card details and billing address match your bank records. Check for 3D Secure prompts. Ensure funds are available. Contact your bank if declined.', 'Troubleshoot payment and upgrade issues', 'troubleshooting', 'free', 9),
('Still Having Issues?', 'cant-find-answer', 'If you can''t find the answer here, go to Help > Contact Support. Include details about what you''re trying to do and any error messages. Our team typically responds within 2-24 hours depending on your plan.', 'Get direct support from our team', 'troubleshooting', 'free', 10);

COMMIT;

-- Add comment for documentation
COMMENT ON TABLE public.help_articles IS 'Knowledge base articles for the help center. Visibility is controlled by subscription tier through RLS policies.';
