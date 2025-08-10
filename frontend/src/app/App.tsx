import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useLocation } from "react-router-dom";
import SidebarNav from "@/shared/components/layout/SidebarNav";
import { AppRouter } from "./router";
import { AuthProvider } from "@/features/auth/contexts/AuthContext";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isOnboardingPage = location.pathname === '/onboarding';
  const hideLayout = isLoginPage || isOnboardingPage;

  return (
    <div className="flex">
      {!hideLayout && <SidebarNav />}
      <div className={`flex-1 bg-gradient-bg ${hideLayout ? 'w-full' : ''}`}>
        <AppRouter />
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
