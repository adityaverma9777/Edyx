import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AssistantBubble from "./components/Layout/AssistantBubble";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Docs from "./pages/Docs";
import DevelopersPage from "./pages/DevelopersPage";
import AboutProject from "./pages/AboutProject";
import HallOfFame from "./pages/HallOfFame";
import PdfSummarizer from "./pages/PdfSummarizer";
import IconGenerator from "./pages/IconGenerator";
import YoutubeTranscriber from "./pages/YoutubeTranscriber";
import VoiceAssistantPage from "./pages/VoiceAssistantPage";

function App() {
  return (
    <Router>
      <AssistantBubble />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/evolutionlog" element={<DevelopersPage />} />
        <Route path="/about-project" element={<AboutProject />} />
        <Route path="/hall-of-fame" element={<HallOfFame />} />
        <Route path="/services/pdf-summarizer" element={<PdfSummarizer />} />
        <Route path="/services/icon-generator" element={<IconGenerator />} />
        <Route path="/services/youtube-transcriber" element={<YoutubeTranscriber />} />
        <Route path="/assistant" element={<VoiceAssistantPage />} />
      </Routes>
    </Router>
  );
}

export default App;
