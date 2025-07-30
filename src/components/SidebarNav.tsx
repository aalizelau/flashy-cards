import React from 'react';
import { Bars3Icon, HomeIcon, PlusIcon, BookOpenIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { icon: <Bars3Icon className="h-6 w-6" />, label: 'Menu' },
  { icon: <HomeIcon className="h-6 w-6" />, label: 'Home' },
  { icon: <PlusIcon className="h-6 w-6" />, label: 'Create' },
  { icon: <BookOpenIcon className="h-6 w-6" />, label: 'Browse' },
  { icon: <ChartBarIcon className="h-6 w-6" />, label: 'Analytics' },
  { icon: <UserGroupIcon className="h-6 w-6" />, label: 'Users' },
];

const SidebarNav: React.FC = () => {
  const navigate = useNavigate();
  return (
    <nav className="flex flex-col items-center bg-muted/30 backdrop-blur-lg h-screen w-16 py-4 shadow-lg border-r border-border">
      {navItems.map((item, idx) => (
        <button
          key={idx}
          className="mb-6 p-2 rounded hover:bg-gray-200 transition-colors"
          aria-label={item.label}
          onClick={
            item.label === 'Browse' ? () => navigate('/listview') : 
            item.label === 'Home' ? () => navigate('/') : 
            item.label === 'Analytics' ? () => navigate('/analytics') : 
            undefined
          }
        >
          {item.icon}
        </button>
      ))}
    </nav>
  );
};

export default SidebarNav;
