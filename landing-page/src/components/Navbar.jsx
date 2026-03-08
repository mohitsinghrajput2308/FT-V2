import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { useAuthModal } from '../context/AuthContext';
import logo from '../assets/logo.png';

export const Navbar = () => {
  const { openLogin, openRegister } = useAuthModal();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // When mounted on client, now we can show the UI
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/#features' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Feedback', href: '/feedback' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' }
  ];

  const ThemeToggle = () => {
    if (!mounted) return <div className="p-2 w-9 h-9" />;
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="text-gray-300 hover:text-white hover:bg-white/10"
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all" />
        ) : (
          <Moon className="h-5 w-5 rotate-0 scale-100 transition-all" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
      ? 'bg-[#0A0A0B] backdrop-blur-xl border-b border-white/10 shadow-2xl'
      : 'bg-[#0A0A0B]/90 backdrop-blur-xl border-b border-white/5'
      }`}>
      <div className="w-full px-6 sm:px-10 lg:px-12">
        <div className="flex justify-between items-center h-28">
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
            <img
              src={logo}
              alt="FinTrack Logo"
              className="h-24 w-auto transform transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-x-16">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  if (link.href.startsWith('/#')) {
                    // anchor on home page — navigate there (browser will scroll to hash)
                    window.location.href = link.href;
                  } else {
                    navigate(link.href);
                  }
                }}
                className="text-gray-300 hover:text-white font-bold transition-all duration-200 px-2"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10"
              onClick={openLogin}
            >
              Log In
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-6 shadow-md shadow-blue-600/20 transition-all duration-300 transform hover:scale-105"
              onClick={openRegister}
            >
              Get Started Free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white hover:text-gray-300 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0A0A0B] border-t border-white/10 py-6 px-4 animate-slide-up">
            <div className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-300 hover:text-white text-lg font-medium transition-colors duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    if (link.href.startsWith('/#')) {
                      window.location.href = link.href;
                    } else {
                      navigate(link.href);
                    }
                  }}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex items-center justify-between py-2 border-t border-white/5 mt-2">
                <span className="text-sm font-medium text-gray-400">Theme</span>
                <ThemeToggle />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Button
                  variant="outline"
                  className="border-white/10 text-gray-300 hover:bg-white/5"
                  onClick={() => { openLogin(); setIsMobileMenuOpen(false); }}
                >
                  Log In
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                  onClick={() => { openRegister(); setIsMobileMenuOpen(false); }}
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
