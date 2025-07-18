import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import type { MenuItem, SubMenuItem } from '../../types/Dashboard/dashboardItems';

interface SidebarProps {
  isOpen: boolean;
  menuItems: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, menuItems }) => {
  const [openSections, setOpenSections] = useState<string[]>(['dashboard']);
  const location = useLocation();
  
  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  // Composant pour rendre un sous-menu récursivement
  const renderSubMenu = (subItems: SubMenuItem[], level: number = 1) => {
    const getMarginClass = (level: number) => {
      switch (level) {
        case 1: return 'ml-4';
        case 2: return 'ml-8';
        case 3: return 'ml-12';
        default: return 'ml-4';
      }
    };

    return subItems.map(subItem => (
      <div key={subItem.id} className={getMarginClass(level)}>
        <div className="flex">
          {subItem.hasSubmenu && subItem.submenuItems ? (
            <div className="w-full">
              <button
                onClick={() => toggleSection(subItem.id)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:text-white transition-colors ${
                  isActive(subItem.path) ? 'text-blue-400' : 'text-gray-300'
                }`}
              >
                <span>{subItem.label}</span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform ${
                    openSections.includes(subItem.id) ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openSections.includes(subItem.id) && (
                <div className="py-2 space-y-1">
                  {renderSubMenu(subItem.submenuItems, level + 1)}
                </div>
              )}
            </div>
          ) : (
            <Link
              to={subItem.path}
              className={`block w-full px-4 py-2 text-sm hover:text-white transition-colors ${
                isActive(subItem.path) ? 'text-blue-400' : 'text-gray-300'
              }`}
            >
              {subItem.label}
            </Link>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className={`bg-gray-900 text-white h-screen transition-all duration-300 ${isOpen ? 'w-80' : 'w-16'} fixed left-0 top-0 z-40`}>
      <div className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          {isOpen && <span className="font-bold text-xl">CHK WEBSERVICE</span>}
        </div>
      </div>

      
      
      <nav className="mt-8">
        {isOpen && <div className="px-4 mb-4 text-xs text-gray-400 uppercase">MENU</div>}
        
        {menuItems.map(item => (
          <div key={item.id} className="mb-1">
            <div className="flex">
              {item.hasSubmenu && !item.path ? (
                // Si c'est un élément avec sous-menu et pas de path (comme Exploitation), on ne fait pas de lien
                <div className="flex-1 flex items-center space-x-3 px-4 py-3">
                  <item.icon className="w-5 h-5" />
                  {isOpen && <span>{item.label}</span>}
                </div>
              ) : (
                // Sinon, on rend le lien normalement
                <Link
                  to={item.path}
                  className={`flex-1 flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 transition-colors ${
                    isActive(item.path) ? 'bg-blue-600 text-white' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {isOpen && <span>{item.label}</span>}
                </Link>
              )}
              
              {isOpen && item.hasSubmenu && (
                <button
                  onClick={() => toggleSection(item.id)}
                  className="px-2 py-3 hover:bg-gray-800 transition-colors"
                >
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform ${
                      openSections.includes(item.id) ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              )}
            </div>
            
            {isOpen && item.hasSubmenu && openSections.includes(item.id) && item.submenuItems && (
              <div className="ml-8 py-2 space-y-1">
                {renderSubMenu(item.submenuItems)}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};
