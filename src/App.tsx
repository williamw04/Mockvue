import { HashRouter, BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import DocumentPage from "./components/DocumentPage";
import DocumentPageWithAI from "./components/DocumentPageWithAI";
import ErrorBoundary from "./components/ErrorBoundary";
import { isElectron } from "./utils/platform";

// Use HashRouter for Electron, BrowserRouter for Web
const Router = isElectron() ? HashRouter : BrowserRouter;

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/document" element={<DocumentPage />} />
          <Route path="/document/:id" element={<DocumentPage />} />
          <Route path="/ai-document" element={<DocumentPageWithAI />} />
          <Route path="/ai-document/:id" element={<DocumentPageWithAI />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;