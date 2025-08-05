import React from 'react';
import { Bars3Icon, HomeIcon, PlusIcon, BookOpenIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { icon: <Bars3Icon className="h-6 w-6" />, label: 'Menu', path: null },
  { icon: <HomeIcon className="h-6 w-6" />, label: 'Home', path: '/dashboard' },
  { icon: <PlusIcon className="h-6 w-6" />, label: 'Create', path: '/create-deck' },
  { icon: <BookOpenIcon className="h-6 w-6" />, label: 'Browse', path: '/all-decks' },
  { icon: <ChartBarIcon className="h-6 w-6" />, label: 'Analytics', path: '/analytics' },
  { icon: <UserGroupIcon className="h-6 w-6" />, label: 'Users', path: null },
];

const SidebarNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string | null) => {
    if (!path) return false;
    return location.pathname === path;
  };

  return (
    <nav className="flex flex-col items-center h-screen w-16 py-4 border-r border-gray-200">
      {navItems.map((item, idx) => {
        const active = isActive(item.path);
        return (
          <button
            key={idx}
            className={`mb-6 p-2 rounded transition-colors ${
              active 
                ? 'bg-gray-200 text-gray-600' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
            aria-label={item.label}
            onClick={item.path ? () => navigate(item.path) : undefined}
          >
            {item.icon}
          </button>
        );
      })}
    </nav>
  );
};

export default SidebarNav;
