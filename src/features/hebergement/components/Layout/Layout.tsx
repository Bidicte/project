// ===== src/components/layout/Layout.tsx (Mise à jour) =====
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useAuth } from '../../contexts/AuthContext';
import { menuItems } from '../../data/mockData';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, logout } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return null; // ProtectedRoute handle this case
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : 'light'}`}>
      <Sidebar isOpen={sidebarOpen} menuItems={menuItems} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-16'}`}>
        <Header 
          toggleSidebar={toggleSidebar}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          user={user}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-8xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};