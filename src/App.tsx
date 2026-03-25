/* eslint-disable react-hooks/exhaustive-deps */
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import OnboardingFlow from "./components/onboarding/OnboardingFlow";
import StoriesPage from "./components/StoriesPage";
import DocumentPage from "./components/documents/DocumentPage";
import ProfilePage from "./components/ProfilePage";
import ResumeReviewPage from "./components/ResumeReviewPage";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import { useUser } from "./services";

// Use HashRouter for Electron compatibility
const Router = HashRouter;

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const userService = useUser();
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const profile = await userService.getUserProfile();

      setOnboardingComplete(profile?.onboardingCompleted || false);
    } catch (error) {
      console.error('Error checking onboarding:', error);
      setOnboardingComplete(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stories"
          element={
            <ProtectedRoute>
              <StoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/document"
          element={
            <ProtectedRoute>
              <DocumentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/document/:id"
          element={
            <ProtectedRoute>
              <DocumentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume-review"
          element={
            <ProtectedRoute>
              <ResumeReviewPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
