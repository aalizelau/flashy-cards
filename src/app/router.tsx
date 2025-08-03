import { Routes, Route } from "react-router-dom";
import Index from "../pages/Index";
import Dashboard from "../features/dashboard/pages/Dashboard";
import TestSession from "../features/test/pages/TestSession";
import NotFound from "../pages/NotFound";
import ListView from "../features/collections/components/ListView";
import ChapterDetail from "../features/collections/components/ChapterDetail";
import AnalyticsPage from "../features/analytics/components/Analytics";
import CreateDeck from "../features/decks/components/CreateDeck";

export const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/create-deck" element={<CreateDeck />} />
    <Route path="/test/:deckId" element={<TestSession />} />
    <Route path="/listview" element={<ListView />} />
    <Route path="/chapter/:collectionName" element={<ChapterDetail />} />
    <Route path="/analytics" element={<AnalyticsPage />} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);