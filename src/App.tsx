import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ListView from "./components/ListView";
import SidebarNav from "./components/SidebarNav";
import ChapterDetailWrapper from "./components/ChapterDetailWrapper";
import AnalyticsPage from "./components/AnalyticsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex">
          <SidebarNav />
          <div className="flex-1 bg-gradient-bg">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/listview" element={<ListView />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/chapter/:collectionName" element={<ChapterDetailWrapper />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
