import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, ArrowUpCircle, ArrowDownCircle, Wallet,
    Target, PieChart, TrendingUp, Bell, Calculator, Settings,
    HelpCircle, List, Tags, ChevronLeft, ChevronRight, X, Terminal
} from 'lucide-react';

const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/dashboard/income', icon: ArrowUpCircle, label: 'Income' },
    { path: '/dashboard/expenses', icon: ArrowDownCircle, label: 'Expenses' },
    { path: '/dashboard/budgets', icon: Wallet, label: 'Budgets' },
    { path: '/dashboard/goals', icon: Target, label: 'Goals' },
    { path: '/dashboard/transactions', icon: List, label: 'Transactions' },
    { path: '/dashboard/reports', icon: PieChart, label: 'Reports' },
    { path: '/dashboard/investments', icon: TrendingUp, label: 'Investments' },
    { path: '/dashboard/bills', icon: Bell, label: 'Bills' },
    { path: '/dashboard/calculators', icon: Calculator, label: 'Calculators' },
    { path: '/dashboard/categories', icon: Tags, label: 'Categories' },
    { path: '/dashboard/api-docs', icon: Terminal, label: 'API Docs' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
    { path: '/dashboard/help', icon: HelpCircle, label: 'Help' },
];

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
    const location = useLocation();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 z-50 h-full
          bg-white dark:bg-dark-200 border-r border-gray-200 dark:border-dark-300
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-0
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-dark-300">
                    {!isCollapsed && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-success-500 rounded-lg flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-lg bg-gradient-to-r from-primary-600 to-success-600 bg-clip-text text-transparent">
                                FinanceTracker
                            </span>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="w-8 h-8 mx-auto bg-gradient-to-br from-primary-500 to-success-500 rounded-lg flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    onClick={onClose}
                                    className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${isActive
                                            ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-300'
                                        }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    {!isCollapsed && (
                                        <span className="font-medium">{item.label}</span>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Collapse Toggle */}
                <div className="hidden lg:block p-4 border-t border-gray-200 dark:border-dark-300">
                    <button
                        onClick={onToggleCollapse}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
              text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <>
                                <ChevronLeft className="w-5 h-5" />
                                <span className="text-sm">Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
