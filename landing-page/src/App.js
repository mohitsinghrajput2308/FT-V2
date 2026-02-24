import React from "react";
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

// Dashboard
import DashboardApp from "@/dashboard/DashboardApp";

// Page imports
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import CookiePolicy from "@/pages/CookiePolicy";
import GDPR from "@/pages/GDPR";
import AboutUs from "@/pages/AboutUs";
import Careers from "@/pages/Careers";
import PressKit from "@/pages/PressKit";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import HelpCenter from "@/pages/HelpCenter";
import APIDocs from "@/pages/APIDocs";
import Community from "@/pages/Community";
import Security from "@/pages/Security";
import Roadmap from "@/pages/Roadmap";
import Changelog from "@/pages/Changelog";
import FAQ from "@/pages/FAQ";

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
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <BrowserRouter>
        <AuthProvider>
          <div className="App">
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
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

