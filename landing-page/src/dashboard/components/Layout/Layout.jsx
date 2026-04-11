import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Toast from '../Common/Toast';
import LiveChatBot from '../LiveChatBot';
import { useSubscription } from '../../../hooks/useSubscription';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { isPro, isBusiness } = useSubscription();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-100 transition-colors duration-300">
            <Toast />
            {(isPro || isBusiness) && <LiveChatBot />}
            <div className="flex">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    isCollapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
                <div className="flex-1 flex flex-col min-h-screen">
                    <Navbar onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 p-4 md:p-6 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Layout;
