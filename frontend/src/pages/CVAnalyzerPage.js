import React, { useState } from "react";
import { 
  analyzeCV, 
  generateCoverLetter, 
  getInterviewPrep, 
  evaluateInterviewAnswer, 
  bulkAnalyzeCVs 
} from "../services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import html2pdf from 'html2pdf.js';



export default function CVAnalyzerPage() {
  const [activeTab, setActiveTab] = useState("analysis");
  const [file, setFile] = useState(null);
  const [bulkFiles, setBulkFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Results
  const [analysisResult, setAnalysisResult] = useState(null);
  const [bulkResults, setBulkResults] = useState([]);
  const [coverLetter, setCoverLetter] = useState("");
  const [interviewQs, setInterviewQs] = useState([]);
  const [evaluations, setEvaluations] = useState({}); // { qIndex: result }
  const [userAnswers, setUserAnswers] = useState({});

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleBulkFilesChange = (e) => {
    if (e.target.files) {
      setBulkFiles(Array.from(e.target.files));
    }
  };

  const runAnalysis = async () => {
    if (!file || !jobDescription) return setError("Resume and Job Description required.");
    setLoading(true); setError(null);
    try {
      const res = await analyzeCV(file, jobDescription);
      if (res.data.error) {
        setError(res.data.error);
        setAnalysisResult(null);
      } else {
        setAnalysisResult(res.data);
      }
    } catch (err) { 
      setError(err.response?.data?.detail || "Error occurred connecting to server."); 
    }
    finally { setLoading(false); }
  };

  const runBulkRanking = async () => {
    if (bulkFiles.length === 0 || !jobDescription) return setError("Multiple resumes and Job Description required.");
    setLoading(true); setError(null);
    try {
      const res = await bulkAnalyzeCVs(bulkFiles, jobDescription);
      setBulkResults(res.data);
    } catch (err) { setError("Error in bulk ranking."); }
    finally { setLoading(false); }
  };

  const createCoverLetter = async () => {
    if (!file || !jobDescription) return setError("Resume and Job Description required.");
    setLoading(true); setError(null);
    try {
      const res = await generateCoverLetter(file, jobDescription);
      setCoverLetter(res.data.cover_letter);
    } catch (err) { setError("Error generating cover letter."); }
    finally { setLoading(false); }
  };

  const prepInterview = async () => {
    if (!file || !jobDescription) return setError("Resume and Job Description required.");
    setLoading(true); setError(null);
    try {
      const res = await getInterviewPrep(file, jobDescription);
      setInterviewQs(res.data);
    } catch (err) { setError("Error generating questions."); }
    finally { setLoading(false); }
  };

  const submitEvaluation = async (qIndex) => {
    const answer = userAnswers[qIndex];
    if (!answer) return;
    setLoading(true);
    try {
      const q = interviewQs[qIndex];
      const res = await evaluateInterviewAnswer({
        question: q.question,
        sample_answer: q.sample_answer,
        user_answer: answer,
        resume_text: "Refers to uploaded file", 
        job_description: jobDescription
      });
      setEvaluations(prev => ({ ...prev, [qIndex]: res.data }));
    } catch (err) { setError("Evaluation failed."); }
    finally { setLoading(false); }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('analysis-report');
    const opt = {
      margin:       10,
      filename:     'AI_Resume_Optimization_Report.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };


  const tabs = [
    { id: "analysis", label: "Intelligence Core", icon: "⚡" },
    { id: "bulk", label: "Talent Ranker", icon: "🏆" },
    { id: "letter", label: "Cover Lab", icon: "✉️" },
    { id: "interview", label: "Interview Lab", icon: "🎙️" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <header className="h-20 shrink-0 glass dark:bg-slate-900/40 backdrop-blur-md border-b border-white/20 dark:border-white/5 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h1 className="text-lg font-heading font-bold text-gray-900 dark:text-white tracking-tight">AI CV Analyzer</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none mt-1">Neural Framework 4.0</p>
          </div>
        </div>
        
        <div className="hidden lg:flex bg-gray-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-800">
           {tabs.map(tab => (
             <button 
               key={tab.id} 
               onClick={() => setActiveTab(tab.id)}
               className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                 activeTab === tab.id 
                 ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700" 
                 : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
               }`}
             >
               <span>{tab.icon}</span>
               {tab.label}
             </button>
           ))}
        </div>
      </header>

      <div className="flex-1 p-10 overflow-y-auto">
        {/* Mobile Tab Selector */}
        <div className="lg:hidden flex overflow-x-auto gap-2 mb-8 pb-2">
           {tabs.map(tab => (
             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 whitespace-nowrap rounded-xl text-xs font-bold ${activeTab === tab.id ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-slate-900 text-gray-500"}`}>{tab.label}</button>
           ))}
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: Input Control */}
          <div className="lg:col-span-4 space-y-8">
             <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-100/50 dark:shadow-none"
             >
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                   </div>
                   <h3 className="font-heading font-bold text-gray-900 dark:text-white">Analysis Parameters</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                      {activeTab === "bulk" ? "Resumes (Multiple PDF)" : "Resume (Single PDF)"}
                    </label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        multiple={activeTab === "bulk"} 
                        accept=".pdf" 
                        onChange={activeTab === "bulk" ? handleBulkFilesChange : handleFileChange} 
                        className="w-full text-xs text-gray-500 dark:text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-indigo-50 dark:file:bg-slate-800 file:text-indigo-600 dark:file:text-indigo-400 file:font-bold hover:file:opacity-80 transition-all border border-dashed border-gray-200 dark:border-slate-800 p-4 rounded-2xl" 
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Target Job Description</label>
                    <textarea 
                      className="w-full h-80 p-6 text-sm bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none font-medium text-gray-900 dark:text-white transition-all" 
                      placeholder="Paste the Job Description to calibrate AI comparison..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={activeTab === "analysis" ? runAnalysis : activeTab === "bulk" ? runBulkRanking : activeTab === "letter" ? createCoverLetter : prepInterview}
                    disabled={loading}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                       <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                       <span>
                         {activeTab === "analysis" ? "⚡ GENERATE ANALYSIS" : activeTab === "bulk" ? "🏆 RANK TALENT" : activeTab === "letter" ? "✨ DRAFT LETTER" : "🚀 PREP LAB"}
                       </span>
                    )}
                  </motion.button>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-xl border border-amber-100 dark:border-amber-900/50 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center animate-pulse shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       </div>
                       <div className="flex-1">
                          <p className="uppercase tracking-widest text-[9px] mb-1">Neural Sync in Progress</p>
                          {error.includes("429") || error.includes("RESOURCE_EXHAUSTED") ? 
                            "The high-precision model is recalibrating due to heavy load. Please allow 30 seconds for neural sync." : 
                            error
                          }
                       </div>
                    </motion.div>
                  )}

                </div>
             </motion.div>
          </div>

          {/* RIGHT: Dynamic Output */}
          <div className="lg:col-span-8">
             <AnimatePresence mode="wait">
               {activeTab === "analysis" && analysisResult && (
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }} 
                    className="space-y-8"
                 >
                    {/* Header with Download Button */}
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white">Analysis Insight</h3>
                       <button 
                         onClick={handleDownloadPDF}
                         className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                         Download Official Report
                       </button>
                    </div>

                    <div id="analysis-report" className="space-y-8 p-4 bg-white dark:bg-slate-950 rounded-[2rem]">
                        {/* Dynamic Analytics Header */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                      {/* Score Circle */}
                      <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl text-center relative overflow-hidden flex flex-col justify-center items-center">
                         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
                         <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">Neural Match Score</div>
                         <div className="text-8xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-4 leading-none">
                            {analysisResult.match_score}%
                         </div>
                         <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-widest leading-none">ATS Compatibility</p>
                      </div>

                      {/* Radar Chart */}
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl relative overflow-hidden h-[300px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={
                            Object.keys(analysisResult.radar_metrics || {}).map(key => ({
                              subject: key,
                              A: analysisResult.radar_metrics[key],
                              fullMark: 100,
                            }))
                          }>
                            <PolarGrid stroke="#e2e8f0" strokeOpacity={0.2} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                            <Radar
                              name="Candidate Profile"
                              dataKey="A"
                              stroke="#6366f1"
                              fill="#6366f1"
                              fillOpacity={0.4}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-lg">
                       <h4 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">AI Human Interpretation</h4>
                       <p className="text-base text-gray-600 dark:text-slate-400 font-medium italic leading-relaxed">
                         "{analysisResult.human_explanation}"
                       </p>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="bg-emerald-50/30 dark:bg-emerald-500/5 p-8 rounded-[2rem] border border-emerald-100/50 dark:border-emerald-500/10">
                          <h4 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-6">Semantic Matches</h4>
                          <div className="flex flex-wrap gap-2">
                             {analysisResult.matched_skills?.map((s, i) => <span key={i} className="px-4 py-1.5 bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl shadow-sm">{s}</span>)}
                          </div>
                       </div>
                       <div className="bg-rose-50/30 dark:bg-rose-500/5 p-8 rounded-[2rem] border border-rose-100/50 dark:border-rose-500/10">
                          <h4 className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-[0.2em] mb-6">Gap Identifiers</h4>
                          <div className="flex flex-wrap gap-2">
                             {analysisResult.missing_skills?.map((s, i) => <span key={i} className="px-4 py-1.5 bg-white dark:bg-slate-800 border border-rose-100 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl shadow-sm">{s}</span>)}
                          </div>
                       </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-lg">
                       <h4 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Strategic Optimization Path</h4>
                       <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysisResult.improvement_suggestions?.map((s, i) => (
                            <li key={i} className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-sm text-gray-700 dark:text-slate-300 font-medium hover:scale-[1.02] transition-transform">
                               <span className="w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold shadow-lg shadow-indigo-500/20">{i+1}</span>
                               {s}
                            </li>
                          ))}
                       </ul>
                    </div>

                    {analysisResult.rewritten_bullets && (
                      <div className="bg-slate-950 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border border-slate-800">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                         <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] mb-8 relative z-10">Neural Bullet Rewrite Engine</h4>
                         <div className="space-y-6 relative z-10">
                            {analysisResult.rewritten_bullets.map((b, i) => (
                              <div key={i} className="space-y-3 group p-4 rounded-2xl hover:bg-white/5 transition-colors border-l-2 border-indigo-500/30 pl-6">
                                 <div className="text-xs text-slate-500 line-through decoration-slate-700 italic">{b.original}</div>
                                 <div className="text-sm font-bold text-emerald-400 leading-relaxed flex gap-2">
                                   <span className="shrink-0 text-white opacity-40">✨</span>
                                   {b.rewritten}
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                    )}
                    </div>
                 </motion.div>


               )}

               {activeTab === "bulk" && bulkResults.length > 0 && (
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-2xl overflow-hidden">
                    <div className="p-8 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                       <div>
                         <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white tracking-tight">Talent Benchmarking</h3>
                         <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1">Cross-Residency Ranking Matrix</p>
                       </div>
                       <div className="px-4 py-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase">{bulkResults.length} Candidates</div>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-slate-800">
                       {bulkResults.sort((a, b) => (b.analysis?.match_score || 0) - (a.analysis?.match_score || 0)).map((r, i) => (
                         <motion.div 
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: i * 0.05 }}
                           key={i} 
                           className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all group"
                         >
                            <div className="flex items-center gap-6">
                               <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm ${
                                 i === 0 ? "bg-amber-100 text-amber-600" : i === 1 ? "bg-slate-100 text-slate-500" : i === 2 ? "bg-orange-100 text-orange-600" : "bg-gray-50 dark:bg-slate-800 text-gray-400"
                               }`}>#{i+1}</div>
                               <div>
                                  <div className="text-base font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{r.filename}</div>
                                  <div className="flex gap-3 mt-1">
                                    <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">{r.analysis?.tier || "Candidate"}</span>
                                    <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold">•</span>
                                    <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest">{r.analysis?.matched_skills?.length || 0} Skills Detected</span>
                                  </div>
                               </div>
                            </div>
                            <div className="flex items-center gap-6">
                               <div className="hidden sm:block h-2 w-24 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-600" style={{ width: `${r.analysis?.match_score || 0}%` }}></div>
                                </div>
                               <div className={`text-3xl font-heading font-black ${r.analysis?.match_score >= 70 ? "text-emerald-500" : r.analysis?.match_score >= 40 ? "text-orange-500" : "text-rose-500"}`}>
                                  {r.analysis?.match_score || 0}%
                               </div>
                            </div>
                         </motion.div>
                       ))}
                    </div>
                 </motion.div>
               )}

               {activeTab === "letter" && coverLetter && (
                 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-2xl relative">
                    <div className="absolute top-8 right-8 flex gap-2">
                       <button 
                        onClick={() => {
                          navigator.clipboard.writeText(coverLetter);
                          alert("Copied to clipboard!");
                        }} 
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-white transition-all border border-gray-100 dark:border-slate-700"
                       >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                       </button>
                    </div>
                    <div className="prose prose-slate dark:prose-invert max-w-none text-base font-medium leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-slate-300">
                       {coverLetter}
                    </div>
                 </motion.div>
               )}

               {activeTab === "interview" && interviewQs.length > 0 && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10 pb-24">
                    <header className="text-center space-y-2">
                       <h2 className="text-4xl font-heading font-extrabold text-gray-900 dark:text-white tracking-tighter">Simulation Lab</h2>
                       <p className="text-gray-500 dark:text-slate-500 font-medium uppercase text-[10px] tracking-[0.3em]">30 Targeted Behavioral & Technical Challenges</p>
                    </header>

                    {interviewQs.map((q, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        key={i} 
                        className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl space-y-6"
                      >
                         <div className="flex items-start gap-6">
                            <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-lg shadow-indigo-500/20">{i+1}</div>
                            <div>
                               <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2">Scenario Analysis Required</div>
                               <h4 className="text-xl font-heading font-bold text-gray-900 dark:text-white leading-tight">{q.question}</h4>
                            </div>
                         </div>
                         
                         <div className="bg-indigo-50/50 dark:bg-indigo-500/5 p-5 rounded-2xl text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 italic flex gap-3">
                            <span className="shrink-0">💡</span>
                            Strategy: {q.talking_point}
                         </div>
                         
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Your Virtual Response</label>
                            <textarea 
                              className="w-full h-40 p-6 text-sm bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none font-medium text-gray-900 dark:text-white transition-all"
                              placeholder="Draft your professional response here..."
                              value={userAnswers[i] || ""}
                              onChange={(e) => setUserAnswers(prev => ({...prev, [i]: e.target.value}))}
                            />
                            <motion.button 
                              whileHover={{ x: 5 }}
                              onClick={() => submitEvaluation(i)}
                              disabled={loading || !userAnswers[i]}
                              className="px-8 py-3 bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
                            >
                               {loading ? "EVALUATING..." : "SUBMIT FOR NEURAL FEEDBACK"}
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </motion.button>
                         </div>

                         {evaluations[i] && (
                           <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-6 p-8 bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-[2rem] text-white space-y-6 shadow-2xl relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                              <div className="flex items-center justify-between relative z-10">
                                 <div>
                                   <h5 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em]">Evaluation Scorecard</h5>
                                   <p className="text-xs text-slate-500 mt-1">Algorithmic Performance Rating</p>
                                 </div>
                                 <div className="text-5xl font-heading font-black text-emerald-400">{evaluations[i].score}<span className="text-xl text-slate-700">/100</span></div>
                              </div>
                              <p className="text-sm text-slate-300 italic leading-relaxed relative z-10 bg-white/5 p-4 rounded-xl border border-white/5">"{evaluations[i].feedback}"</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                 <div className="space-y-3">
                                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                       Competitive Strengths
                                    </div>
                                    <ul className="text-xs space-y-2 text-slate-400 font-medium">
                                       {evaluations[i].strengths?.map((s, j) => <li key={j} className="flex gap-2"><span>•</span>{s}</li>)}
                                    </ul>
                                 </div>
                                 <div className="space-y-3">
                                    <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
                                       <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                       Optimization Required
                                    </div>
                                    <ul className="text-xs space-y-2 text-slate-400 font-medium">
                                       {evaluations[i].areas_for_improvement?.map((s, j) => <li key={j} className="flex gap-2"><span>•</span>{s}</li>)}
                                    </ul>
                                 </div>
                              </div>
                           </motion.div>
                         )}
                      </motion.div>
                    ))}
                 </motion.div>
               )}

               {!analysisResult && !coverLetter && bulkResults.length === 0 && interviewQs.length === 0 && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[60vh] flex flex-col items-center justify-center text-center p-10">
                    <div className="w-32 h-32 bg-gray-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-6xl mb-8 border border-gray-100 dark:border-slate-800 animate-float">🔮</div>
                    <h3 className="text-3xl font-heading font-extrabold text-gray-900 dark:text-white tracking-tighter mb-3">Initialize Analysis Core</h3>
                    <p className="text-base font-medium text-gray-500 dark:text-slate-400 max-w-sm mx-auto">Upload your academic documents and calibrate the AI using a target Job Description.</p>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

