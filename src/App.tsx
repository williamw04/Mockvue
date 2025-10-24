import { HashRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import MyEditor from "./components/MyEditor";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/document" element={<MyEditor />} />
      </Routes>
    </HashRouter>
  );
}

export default App;