import React, { useState, useEffect } from "react";
import { searchUniversities } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

export default function UniversitiesPage() {
  const [results, setResults]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [query, setQuery]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  
  // Selection for comparison
  const [selectedIds, setSelectedIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const search = async (q = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchUniversities(q);
      setResults(res.data.universities || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setResults([]);
      setError("⚠️ Connection Error: I could not reach the server. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { search(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    search(query);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectedUnis = results.filter(u => selectedIds.includes(u.id));

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-12 pb-24 px-6 relative transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[50%] h-[30%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-5xl mx-auto relative">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-widest border border-indigo-500/20">Academic Portal</span>
            </div>
            <h1 className="text-4xl font-heading font-extrabold text-gray-900 dark:text-white tracking-tighter">University Explorer</h1>
            <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">Discover and compare 2026 academic opportunities.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 px-6 py-3 rounded-2xl shadow-sm self-start min-w-[120px]">
              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Global Records</span>
              <span className="text-2xl font-heading font-bold text-indigo-600 dark:text-indigo-400">{total}</span>
            </div>
            {selectedIds.length > 0 && (
              <motion.button 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setShowCompare(true)}
                disabled={selectedIds.length < 2}
                className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all shadow-xl ${
                  selectedIds.length >= 2 
                  ? "bg-indigo-600 text-white shadow-indigo-500/30 hover:scale-105 active:scale-95" 
                  : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed"
                }`}
              >
                Compare Benchmarks ({selectedIds.length})
              </motion.button>
            )}
          </div>
        </motion.header>

        {/* Search bar */}
        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSearch} 
          className="relative group mb-12"
        >
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] pl-14 pr-32 py-5 text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-lg shadow-gray-100/50 dark:shadow-none text-gray-900 dark:text-white"
            placeholder="Search by institution name, city, or academic discipline..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="absolute right-3 top-3 bottom-3 bg-indigo-600 text-white px-8 rounded-[1.25rem] text-sm font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
            Query
          </button>
        </motion.form>

        {/* Selected bar indicator */}
        {selectedIds.length > 0 && selectedIds.length < 2 && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-indigo-500/10 dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 px-5 py-3 rounded-xl mb-8 text-xs font-bold flex items-center gap-3 border border-indigo-500/20"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            Select at least one more institution to unlock full comparison analytics.
          </motion.div>
        )}

        {error && <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl mb-10">{error}</div>}

        {loading && (
          <div className="flex justify-center py-24">
             <div className="flex gap-2">
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.1s]"></div>
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
             </div>
          </div>
        )}

        {/* Results grid */}
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
          {results.map((u, idx) => (
            <motion.div 
              key={u.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => toggleSelect(u.id)}
              className={`bg-white dark:bg-slate-900 border rounded-[2rem] p-8 transition-all group cursor-pointer relative overflow-hidden ${
                selectedIds.includes(u.id) 
                ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-2xl shadow-indigo-500/10" 
                : "border-gray-100 dark:border-slate-800 hover:shadow-2xl hover:shadow-indigo-500/5 dark:hover:bg-slate-800/80"
              }`}
            >
              {selectedIds.includes(u.id) && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
              )}
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${
                      selectedIds.includes(u.id) ? "bg-indigo-600 border-indigo-600" : "bg-transparent border-gray-300 dark:border-slate-700"
                    }`}>
                      {selectedIds.includes(u.id) && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-indigo-500/10">Accredited</span>
                    <span className="text-sm font-semibold text-gray-400 dark:text-slate-500">{u.location}</span>
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-4">{u.name}</h2>
                  <div className="flex flex-wrap gap-2">
                    {u.programs?.split(',').map((p, pIdx) => (
                      <span key={pIdx} className="text-[11px] font-semibold bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-4 py-1.5 rounded-xl border border-gray-100 dark:border-slate-700/50">{p.trim()}</span>
                    ))}
                  </div>
                </div>
                
                <div className="md:text-right flex flex-col gap-3 min-w-[180px]">
                  <div className="bg-indigo-50 dark:bg-slate-950/50 rounded-2xl p-5 border border-indigo-100 dark:border-slate-800 shadow-sm">
                     <span className="text-[10px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-widest block mb-2">Academic Budget</span>
                     <p className="text-lg font-heading font-bold text-indigo-900 dark:text-indigo-100">{u.fee || "Contact Registrar"}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>

        {results.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 bg-white dark:bg-slate-900 border border-dashed border-gray-200 dark:border-slate-800 rounded-[3rem]"
          >
            <p className="text-gray-400 dark:text-slate-600 font-medium text-lg">No institutions found matching your query.</p>
          </motion.div>
        )}
      </div>

      {/* Comparison Modal */}
      <AnimatePresence>
      {showCompare && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-900 w-full max-w-7xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/10"
          >
            <div className="p-10 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
              <div>
                <h2 className="text-3xl font-heading font-extrabold text-gray-900 dark:text-white tracking-tighter">Benchmarking Analytics</h2>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1">Direct comparative analysis of selected institutions.</p>
              </div>
              <button 
                onClick={() => setShowCompare(false)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-95"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-10">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-6 text-left text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest bg-gray-50/50 dark:bg-slate-800/30 border-b border-gray-100 dark:border-slate-800 w-64 rounded-tl-3xl">Strategic Feature</th>
                    {selectedUnis.map(u => (
                      <th key={u.id} className="p-6 text-left border-b border-gray-100 dark:border-slate-800 min-w-[300px]">
                        <p className="text-xl font-heading font-bold text-indigo-600 dark:text-indigo-400 mb-1">{u.name}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest">{u.location}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                  {[
                    { label: "💰 Annual Tuition Fee", key: "fee" },
                    { label: "🎓 Academic Programs", key: "programs" },
                    { label: "🎁 Financial Aid/Scholarships", key: "scholarships" },
                    { label: "🌐 Digital Portal", key: "website", isLink: true },
                  ].map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-500/5 transition-colors">
                      <td className="p-6 text-xs font-bold text-gray-600 dark:text-slate-400 bg-gray-50/30 dark:bg-slate-800/20 whitespace-nowrap">{row.label}</td>
                      {selectedUnis.map(u => (
                        <td key={u.id} className="p-6 text-sm text-gray-700 dark:text-slate-300 leading-relaxed font-medium">
                          {row.isLink && u[row.key] ? (
                            <a href={u[row.key]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                              Access Portal
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                          ) : (
                            u[row.key] || <span className="text-gray-300 dark:text-slate-700 italic">Data Pending</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-8 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 flex justify-end items-center gap-6">
              <button 
                onClick={() => setSelectedIds([])}
                className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
              >
                Reset Analytics
              </button>
              <button 
                onClick={() => setShowCompare(false)}
                className="px-10 py-3 bg-indigo-600 text-white rounded-[1.25rem] text-sm font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
              >
                Close Engine
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}


