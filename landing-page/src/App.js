import React, { Suspense } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { Showcase3DSection } from "@/components/Showcase3DSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { PricingSection } from "@/components/PricingSection";
import { ReviewSection } from "@/components/ReviewSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuthModal } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import ErrorBoundary from "@/components/ErrorBoundary";

// ─── Lazy-loaded routes (code-split per page) ──────────────────
const DashboardApp = React.lazy(() => import("@/dashboard/DashboardApp"));
const PrivacyPolicy = React.lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = React.lazy(() => import("@/pages/TermsOfService"));
const CookiePolicy = React.lazy(() => import("@/pages/CookiePolicy"));
const GDPR = React.lazy(() => import("@/pages/GDPR"));
const AboutUs = React.lazy(() => import("@/pages/AboutUs"));
const Careers = React.lazy(() => import("@/pages/Careers"));
const PressKit = React.lazy(() => import("@/pages/PressKit"));
const Contact = React.lazy(() => import("@/pages/Contact"));
const Blog = React.lazy(() => import("@/pages/Blog"));
const HelpCenter = React.lazy(() => import("@/pages/HelpCenter"));
const APIDocs = React.lazy(() => import("@/pages/APIDocs"));
const Community = React.lazy(() => import("@/pages/Community"));
const Security = React.lazy(() => import("@/pages/Security"));
const Roadmap = React.lazy(() => import("@/pages/Roadmap"));
const Changelog = React.lazy(() => import("@/pages/Changelog"));
const FAQ = React.lazy(() => import("@/pages/FAQ"));

// ─── Loading fallback ──────────────────────────────────────────
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#0f1117',
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid rgba(59, 130, 246, 0.15)',
      borderTopColor: '#3b82f6',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const LandingPage = () => {
  const { modalState, closeModal } = useAuthModal();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <Showcase3DSection />
      <HowItWorksSection />
      <PricingSection />
      <ReviewSection />
      <CTASection />
      <Footer />
      <AuthModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        initialView={modalState.view}
      />
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <BrowserRouter>
          <AuthProvider>
            <div className="App">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/dashboard/*" element={<DashboardApp />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/cookies" element={<CookiePolicy />} />
                  <Route path="/gdpr" element={<GDPR />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/press" element={<PressKit />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/api-docs" element={<APIDocs />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/security" element={<Security />} />
                  <Route path="/roadmap" element={<Roadmap />} />
                  <Route path="/changelog" element={<Changelog />} />
                  <Route path="/faq" element={<FAQ />} />
                </Routes>
              </Suspense>
            </div>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
