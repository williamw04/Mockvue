import { HashRouter, BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import MyEditor from "./components/MyEditor";
import { isElectron } from "./utils/platform";

// Use HashRouter for Electron, BrowserRouter for Web
const Router = isElectron() ? HashRouter : BrowserRouter;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/document" element={<MyEditor />} />
        <Route path="/document/:id" element={<MyEditor />} />
      </Routes>
    </Router>
  );
}

export default App;