import { Routes, Route } from "react-router-dom";
import Index from "../pages/Index";
import Dashboard from "../features/dashboard/pages/Dashboard";
import TestSession from "../features/test/pages/TestSession";
import NotFound from "../pages/NotFound";
import AllDecks from "../features/collections/components/AllDecks";
import DeckDetail from "../features/collections/components/DeckDetail";
import AnalyticsPage from "../features/analytics/components/Analytics";
import CreateDeck from "../features/decks/components/CreateDeck";
import EditDeck from "../features/decks/components/EditDeck";
import Login from "../features/auth/components/login";
import Onboarding from "../features/auth/components/Onboarding";
import Settings from "../features/settings/pages/Settings";
import AllCommunityDecks from "../features/community/components/AllCommunityDecks";
import ProtectedRoute from "../shared/components/auth/ProtectedRoute";

export const AppRouter = () => (
  <Routes>
    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/login" element={<Login />} />
    <Route path="/onboarding" element={<ProtectedRoute requireOnboarding={false}><Onboarding /></ProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/create-deck" element={<ProtectedRoute><CreateDeck /></ProtectedRoute>} />
    <Route path="/edit-deck/:deckId" element={<ProtectedRoute><EditDeck /></ProtectedRoute>} />
    <Route path="/test/:deckId" element={<ProtectedRoute><TestSession /></ProtectedRoute>} />
    <Route path="/test" element={<ProtectedRoute><TestSession /></ProtectedRoute>} />
    <Route path="/all-decks" element={<ProtectedRoute><AllDecks /></ProtectedRoute>} />
    <Route path="/decks/:collectionName" element={<ProtectedRoute><DeckDetail /></ProtectedRoute>} />
    <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
    <Route path="/community" element={<ProtectedRoute><AllCommunityDecks /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
  </Routes>
);