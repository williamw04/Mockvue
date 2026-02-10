import { HashRouter, BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { AIAssistant } from "./components/AIAssistant";
import OnboardingFlow from "./components/onboarding/OnboardingFlow";
import StoriesPage from "./components/StoriesPage";
import { isElectron } from "./utils/platform";
import { useUser } from "./services";

// Use HashRouter for Electron, BrowserRouter for Web
const Router = isElectron() ? HashRouter : BrowserRouter;

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
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
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
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <AIAssistant />
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
      </Routes>
    </Router>
  );
}

export default App;