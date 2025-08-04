import { Routes, Route } from "react-router-dom";
import Index from "../pages/Index";
import Dashboard from "../features/dashboard/pages/Dashboard";
import TestSession from "../features/test/pages/TestSession";
import NotFound from "../pages/NotFound";
import AllDecks from "../features/collections/components/AllDecks";
import DeckDetail from "../features/collections/components/DeckDetail";
import AnalyticsPage from "../features/analytics/components/Analytics";
import CreateDeck from "../features/decks/components/CreateDeck";

export const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/create-deck" element={<CreateDeck />} />
    <Route path="/test/:deckId" element={<TestSession />} />
    <Route path="/test" element={<TestSession />} />
    <Route path="/all-decks" element={<AllDecks />} />
    <Route path="/decks/:collectionName" element={<DeckDetail />} />
    <Route path="/analytics" element={<AnalyticsPage />} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);