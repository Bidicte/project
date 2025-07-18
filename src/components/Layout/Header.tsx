// ===== src/components/layout/Header.tsx (Mise à jour) =====
import React from 'react';
import { LayoutGrid, Menu } from 'lucide-react';
import { UserDropdown } from '../ui/UserDropdown';
import type { User } from '../../types/auth';

interface HeaderProps {
  toggleSidebar: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  user: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  toggleSidebar, 
  user,
  onLogout
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100  transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <LayoutGrid className="w-5 h-5" />
          </button>
          
          <UserDropdown user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
};