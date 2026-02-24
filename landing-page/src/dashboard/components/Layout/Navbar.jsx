import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';

const Navbar = ({ onMenuClick }) => {
    const { theme, toggleTheme } = useTheme();
    const { currentUser, logout } = useAuth();
    const { pendingBillsCount } = useFinance();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="h-16 bg-white dark:bg-dark-200 border-b border-gray-200 dark:border-dark-300 px-4 flex items-center justify-between sticky top-0 z-30">
            {/* Left side */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                >
                    <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="hidden sm:block">
                    <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Welcome back, {currentUser?.name?.split(' ')[0] || 'User'}! 👋
                    </h1>
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                    title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                    {theme === 'light' ? (
                        <Moon className="w-5 h-5 text-gray-600" />
                    ) : (
                        <Sun className="w-5 h-5 text-yellow-400" />
                    )}
                </button>

                {/* Notifications */}
                <Link
                    to="/dashboard/bills"
                    className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                >
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    {pendingBillsCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {pendingBillsCount > 9 ? '9+' : pendingBillsCount}
                        </span>
                    )}
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-success-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                        <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {currentUser?.name || 'User'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-200 rounded-lg shadow-lg border border-gray-200 dark:border-dark-300 py-1 animate-fade-in">
                            <div className="px-4 py-2 border-b border-gray-200 dark:border-dark-300">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {currentUser?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {currentUser?.email}
                                </p>
                            </div>
                            <Link
                                to="/dashboard/profile"
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300"
                            >
                                <User className="w-4 h-4" />
                                Profile
                            </Link>
                            <Link
                                to="/dashboard/settings"
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300"
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </Link>
                            <hr className="my-1 border-gray-200 dark:border-dark-300" />
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-danger-600 dark:text-danger-400 hover:bg-gray-100 dark:hover:bg-dark-300 w-full"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
