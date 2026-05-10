import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import UniversitiesPage from "./pages/UniversitiesPage";
import CVAnalyzerPage from "./pages/CVAnalyzerPage";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col bg-white dark:bg-slate-950 overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-hidden flex flex-col">
          <Routes>
            <Route path="/"             element={<ChatPage />} />
            <Route path="/universities" element={<UniversitiesPage />} />
            <Route path="/cv-analyzer"  element={<CVAnalyzerPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}


export default App;
