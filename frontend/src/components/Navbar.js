import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const navLinks = [
    { name: "Advisor", path: "/" },
    { name: "Universities", path: "/universities" },
    { name: "CV Analyzer", path: "/cv-analyzer" }
  ];

  return (
    <nav className="h-16 glass dark:bg-slate-900/40 backdrop-blur-md border-b border-white/20 dark:border-white/5 px-8 flex items-center justify-between sticky top-0 z-[60] transition-colors duration-300">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-all">
            C
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-gray-900 dark:text-white">CareerPath AI</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                location.pathname === link.path 
                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                : "text-gray-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800/50"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-indigo-500 transition-all border border-gray-200 dark:border-slate-700 mr-2"
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.364 17.636l-.707.707M6.364 6.364l-.707.707m12.728 12.728l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>

        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">Powered by</span>
          <span className="text-[11px] font-extrabold text-[#d97757] dark:text-orange-400">Google Gemini</span>
        </div>
        <div className="w-9 h-9 rounded-xl border border-white/20 dark:border-white/10 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
           <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
        </div>
      </div>
    </nav>
  );
}


