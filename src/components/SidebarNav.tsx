import React from 'react';
import { Bars3Icon, HomeIcon, PlusIcon, BookOpenIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const navItems = [
  { icon: <Bars3Icon className="h-6 w-6" />, label: 'Menu' },
  { icon: <HomeIcon className="h-6 w-6" />, label: 'Home' },
  { icon: <PlusIcon className="h-6 w-6" />, label: 'Create' },
  { icon: <BookOpenIcon className="h-6 w-6" />, label: 'Browse' },
  { icon: <ChartBarIcon className="h-6 w-6" />, label: 'Statistics' },
  { icon: <UserGroupIcon className="h-6 w-6" />, label: 'Users' },
];

const SidebarNav: React.FC = () => {
  return (
    <nav className="flex flex-col items-center bg-white/80 backdrop-blur-lg h-screen w-16 py-4 shadow-lg border-r border-gray-200">
      {navItems.map((item, idx) => (
        <button key={idx} className="mb-6 p-2 rounded hover:bg-gray-200 transition-colors" aria-label={item.label}>
          {item.icon}
        </button>
      ))}
    </nav>
  );
};

export default SidebarNav;
