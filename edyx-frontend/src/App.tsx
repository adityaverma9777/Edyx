import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Docs from "./pages/Docs";
import DevelopersPage from "./pages/DevelopersPage";
import AboutProject from "./pages/AboutProject";
import HallOfFame from "./pages/HallOfFame";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/developers" element={<DevelopersPage />} />
        <Route path="/about-project" element={<AboutProject />} />
        <Route path="/hall-of-fame" element={<HallOfFame />} />
      </Routes>
    </Router>
  );
}

export default App;
