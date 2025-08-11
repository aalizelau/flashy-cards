import React, { useState, useEffect } from 'react';
import {
  HomeIcon,
  PlusIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Settings,
  User,
  LogOut,
  ChevronDown,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  ChartColumnIncreasing,
  Shapes
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "@/features/auth/contexts/AuthContext";

const navItems = [
  { icon: HomeIcon, label: 'Home', path: '/dashboard' },
  { icon: PlusIcon, label: 'Create', path: '/create-deck' },
  { icon: BookOpenIcon, label: 'Browse', path: '/all-decks' },
  { icon: ChartColumnIncreasing, label: 'Analytics', path: '/analytics' },
  { icon: Shapes, label: 'Community', path: null },
];

const BREAKPOINTS = {
  MOBILE: 640 // Tailwind `sm` breakpoint
} as const;

const SIDEBAR_WIDTHS = {
  hidden: "w-0",
  compact: "w-16", 
  full: "w-48",
  menu: "w-40"
} as const;

const SidebarNav: React.FC = () => {
  const [sidebarState, setSidebarState] = useState<'full' | 'compact' | 'hidden'>('full');
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string | null) => path && location.pathname === path;
  const showLabels = sidebarState === 'full';

  // Get user display name, fallback to email or "User"
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  
  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleResize = () => {
    const mobile = window.innerWidth < BREAKPOINTS.MOBILE;
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
      className="fixed top-2 left-3 p-2 z-50 rounded hover:bg-gray-100  "
      aria-label="Toggle Sidebar"
    >
      {sidebarState === 'full' ? (
        <PanelLeftClose className="h-6 w-6 text-gray-500" strokeWidth={1.5} />
      ) : (
        <PanelLeftOpen className="h-6 w-6 text-gray-500" strokeWidth={1.5} />
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
          className={` flex items-center  w-full px-2 py-2 rounded transition-colors ${
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
          <Icon className="h-6 w-6 min-w-[2rem] " strokeWidth={1.5} />
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
          className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-30 py-3 px-2 flex flex-col items-center transition-all duration-300 ease-in-out
          ${
            sidebarState === 'full'
              ? SIDEBAR_WIDTHS.full
              : sidebarState === 'compact'
              ? SIDEBAR_WIDTHS.compact
              : SIDEBAR_WIDTHS.hidden
          }`}
        >
          {/* Navigation Items */}
          <div className="mt-16 flex flex-col w-full items-start flex-1 space-y-2">
            {renderNavItems()}
          </div>
          
          {/* User Profile Section - Fixed at bottom */}
          <div className=" border-t border-gray-200 w-full mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full flex items-center gap-3 px-3 h-auto hover:bg-gray-100 transition-all",
                showLabels ? "justify-start" : "justify-center"
              )}
            >
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                {displayName?.charAt(0)}
              </div>
              {showLabels && (
                <>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {displayName}
                    </div>
                    <div className="text-xs text-gray-500">
                      Free
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="w-40 bg-white border border-gray-200 "
            side={showLabels ? "top" : "right"}
            sideOffset={8}
          >
            <DropdownMenuItem 
              className="hover:bg-gray-100 cursor-pointer"
              onClick={() => navigate('/settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-100">
              <User className="mr-2 h-4 w-4" />
              Preferences
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-100">
              <HelpCircle className="mr-2 h-4 w-4" />
              Learn more
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="hover:bg-red-100 text-red-600 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
