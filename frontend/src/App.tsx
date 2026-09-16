// ============================================================
// ISutra — App Router Configuration
// Phase 2: Enterprise Navigation and Workflow Routes
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import RequirementReviewPage from './pages/RequirementReviewPage';
import RecommendationsResultsPage from './pages/RecommendationsResultsPage';
import RequirementGapAnalysisPage from './pages/RequirementGapAnalysisPage';
import AnalysisHistoryPage from './pages/AnalysisHistoryPage';
import StandardsSearchPage from './pages/StandardsSearchPage';
import StandardDetailsPage from './pages/StandardDetailsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analyze" element={<DashboardPage />} />
          <Route path="/analysis/:id/review" element={<RequirementReviewPage />} />
          <Route path="/analysis/:id/recommendations" element={<RecommendationsResultsPage />} />
          <Route path="/analysis/:id/recommendations/:standardId/gap-analysis" element={<RequirementGapAnalysisPage />} />
          <Route path="/history" element={<AnalysisHistoryPage />} />
          <Route path="/standards" element={<StandardsSearchPage />} />
          <Route path="/standards/:id" element={<StandardDetailsPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/about" element={<AboutPage />} />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
