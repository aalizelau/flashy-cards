import React, { useState, useEffect } from 'react';
import {
  Bars3Icon,
  HomeIcon,
  PlusIcon,
  BookOpenIcon,
  ChartBarIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { icon: HomeIcon, label: 'Home', path: '/dashboard' },
  { icon: PlusIcon, label: 'Create', path: '/create-deck' },
  { icon: BookOpenIcon, label: 'Browse', path: '/all-decks' },
  { icon: ChartBarIcon, label: 'Analytics', path: '/analytics' },
  { icon: UserGroupIcon, label: 'Users', path: null },
];

const SidebarNav: React.FC = () => {
  const [sidebarState, setSidebarState] = useState<'full' | 'compact' | 'hidden'>('full');
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string | null) => path && location.pathname === path;

  const handleResize = () => {
    const mobile = window.innerWidth < 640; // Tailwind `sm` breakpoint
    setIsMobile(mobile);
    if (mobile && sidebarState !== 'hidden') {
      setSidebarState('hidden');
    } else if (!mobile && sidebarState === 'hidden') {
      setSidebarState('compact'); // or 'full' if preferred
    }
  };

  useEffect(() => {
    handleResize(); // init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarState(sidebarState === 'full' ? 'hidden' : 'full');
    } else {
      setSidebarState(sidebarState === 'full' ? 'compact' : 'full');
    }
  };

  const ToggleButton = (
    <button
      onClick={toggleSidebar}
      className="fixed top-2 left-2 p-1 z-50 rounded hover:bg-gray-100 "
      aria-label="Toggle Sidebar"
    >
      {sidebarState === 'full' ? (
        <XMarkIcon className="h-6 w-6 text-gray-700" />
      ) : (
        <Bars3Icon className="h-6 w-6 text-gray-700" />
      )}
    </button>
  );

  const renderNavItems = () =>
    navItems.map((item, idx) => {
      const active = isActive(item.path);
      const Icon = item.icon;
      return (
        <button
          key={idx}
          className={`mb-4 flex items-center gap-3 w-full px-2 py-2 rounded transition-colors ${
            active
              ? 'bg-gray-200 text-gray-700'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          aria-label={item.label}
          onClick={() => {
            if (item.path) {
              navigate(item.path);
              if (isMobile) setSidebarState('hidden');
            }
          }}
        >
          <Icon className="h-6 w-6 min-w-[2rem] " />
          <span className={`text-sm font-medium transition-all duration-200 whitespace-nowrap
              ${sidebarState === 'full'
                ? 'opacity-100 ml-2 w-auto'
                : 'opacity-0 ml-0 w-0 overflow-hidden'
            }`}
          >
            {item.label}
          </span>
        </button>
      );
    });

  return (
    <>

      {/* Shared toggle button */}
      {ToggleButton}

      {/* Sidebar */}
      {sidebarState !== 'hidden' && (
        <div
          className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-30 py-4 px-2 flex flex-col items-center transition-all duration-300 ease-in-out
          ${
            sidebarState === 'full'
              ? 'w-48'
              : sidebarState === 'compact'
              ? 'w-16'
              : 'w-0'
          }`}
        >
          <div className="mt-10 flex flex-col w-full items-start">
            {renderNavItems()}
          </div>
        </div>
      )}

      {/* Content push (optional – if you want content to slide) */}
      <div
        className={`transition-all duration-300 ${
          isMobile
            ? ''
            : sidebarState === 'full'
            ? 'sm:ml-48'
            : sidebarState === 'compact'
            ? 'sm:ml-16'
            : ''
        }`}
      >
        {/* Your main content here */}
      </div>
    </>
  );
};

export default SidebarNav;
