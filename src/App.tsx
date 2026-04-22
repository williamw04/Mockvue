/* eslint-disable react-hooks/exhaustive-deps */
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import StoriesPage from './components/StoriesPage';
import DocumentPage from './components/documents/DocumentPage';
import ProfilePage from './components/ProfilePage';
import ResumeArchitectPage from './components/resume-architect/ResumeArchitectPage';
import PracticePage from './components/PracticePage';
import VoiceInterviewPracticePage from './components/VoiceInterviewPracticePage';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import CheatSheetListPage from './components/documents/CheatSheetListPage';
import CreateSheetWizard from './components/documents/CreateSheetWizard';
import { useUser } from './services';

// Use HashRouter for Electron compatibility
const Router = HashRouter;

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const userService = useUser();
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(true);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      await userService.getUserProfile();

      // Temporarily bypass onboarding check
      setOnboardingComplete(true);
    } catch (error) {
      console.error('Error checking onboarding:', error);
      // Temporarily bypass onboarding check
      setOnboardingComplete(true);
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
    <ErrorBoundary>
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
                <CheatSheetListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document/new"
            element={
              <ProtectedRoute>
                <CreateSheetWizard />
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
            path="/resume-architect"
            element={
              <ProtectedRoute>
                <ResumeArchitectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <PracticePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/voice"
            element={
              <ProtectedRoute>
                <VoiceInterviewPracticePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
