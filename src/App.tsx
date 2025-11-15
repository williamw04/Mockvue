import { HashRouter, BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import DocumentPage from "./components/DocumentPage";
import { AIAssistant } from "./components/AIAssistant";
import { isElectron } from "./utils/platform";

// Use HashRouter for Electron, BrowserRouter for Web
const Router = isElectron() ? HashRouter : BrowserRouter;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/document" element={<DocumentPage />} />
        <Route path="/document/:id" element={<DocumentPage />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
      </Routes>
    </Router>
  );
}

export default App;