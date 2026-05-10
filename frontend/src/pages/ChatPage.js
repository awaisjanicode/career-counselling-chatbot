import React, { useState, useRef, useEffect } from "react";
import { sendMessage } from "../services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeCV } from "../services/api";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [unis, setUnis]       = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const bottomRef             = useRef(null);
  const textareaRef          = useRef(null);
  const chatRef              = useRef(null);
  const fileInputRef         = useRef(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);


  const handleSend = async () => {
    const text = input.trim();
    if ((!text && !selectedFile) || loading) return;

    setMessages((m) => [...m, { 
      role: "user", 
      text: selectedFile ? `📎 ${selectedFile.name}${text ? `\n\n${text}` : ""}` : text 
    }]);
    
    const currentFile = selectedFile;
    const currentText = text;
    
    setInput("");
    setSelectedFile(null);
    setLoading(true);

    try {
      let reply = "";
      let analysisData = null;

      if (currentFile) {
        // If there's a file, use the analyzeCV endpoint
        const res = await analyzeCV(currentFile, currentText || "General career advisory and resume evaluation.");
        if (res.data.error) {
           reply = `⚠️ **Error**: ${res.data.error}`;
        } else {
           analysisData = res.data;
           reply = res.data.human_explanation || "Analysis complete.";
        }
      } else {
        // Otherwise use regular chat
        const res = await sendMessage(currentText);
        reply = res.data.reply;
        setUnis(res.data.universities || []);
      }
      setMessages((m) => [...m, { role: "bot", text: reply, analysis: analysisData }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "bot", text: "⚠️ **Error**: Failed to process request. Please ensure the backend is running." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) {
      window.recognitionInstance?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    window.recognitionInstance = recognition;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
      setInput(transcript);
    };
    recognition.start();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExportPDF = async () => {
    if (!chatRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(chatRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Career_Conversation.pdf");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-1 h-full bg-white dark:bg-slate-950 transition-colors duration-300 overflow-hidden relative`}>
      {/* Project Info Sidebar */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl z-[100] border-l border-gray-200 dark:border-slate-800 p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-10">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white">Project Details</h2>
               <button 
                 onClick={() => setShowInfo(false)} 
                 className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white"
               >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>

            <div className="flex-1 space-y-10 overflow-y-auto no-scrollbar">
               <section>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-6 px-1">Development Team</h3>
                  <div className="space-y-4">
                     {[
                        { name: "Muhammad Danyal", id: "22145784" },
                        { name: "Muhammad Awais", id: "22145824" },
                        { name: "Usman Khan", id: "22140163" }
                     ].map((dev) => (
                        <div key={dev.id} className="group flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-transparent hover:border-indigo-500/20 transition-all">
                           <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                              {dev.name[0]}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{dev.name}</p>
                              <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">{dev.id}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>

               <section>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-6 px-1">Project Supervisor</h3>
                  <div className="p-5 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl">
                     <p className="text-sm font-bold text-gray-900 dark:text-white">Dr. Shahid Akbar</p>
                     <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2">Department of Computer Science</p>
                     <p className="text-[10px] text-gray-500 dark:text-slate-500 mt-1">Abdul Wali Khan University Mardan</p>
                  </div>
               </section>

               <section className="pt-10 border-t border-gray-100 dark:border-slate-800/50">
                  <div className="text-center">
                     <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                        FYP 2026 Submission
                     </p>
                     <p className="text-[9px] text-gray-300 dark:text-slate-600 mt-1">
                        AI-Powered Career Counseling Chatbot
                     </p>
                  </div>
               </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Premium Sidebar */}
      <aside className="hidden md:flex w-80 h-full flex-col sidebar-glass dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="p-6">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMessages([])} 
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all font-semibold text-sm text-gray-700 dark:text-slate-200"
          >
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
               </div>
               New Advisory
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2">
           <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6 px-2">Knowledge Domains</p>
           {[
             { t: "Medicine University Plan", i: "🩺", c: "bg-blue-500/10 text-blue-500" },
             { t: "Computer Science Roadmap", i: "💻", c: "bg-indigo-500/10 text-indigo-500" },
             { t: "Scholarships for 2026", i: "📜", c: "bg-amber-500/10 text-amber-500" },
             { t: "Top Engineering Schools", i: "⚙️", c: "bg-emerald-500/10 text-emerald-500" }
           ].map((item, i) => (
             <motion.button 
               key={i} 
               whileHover={{ x: 4 }}
               onClick={() => setInput(item.t)} 
               className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800/50 flex items-center gap-4 transition-all group mb-1"
             >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${item.c}`}>{item.i}</span>
                <span className="text-sm font-semibold text-gray-600 dark:text-slate-400 truncate group-hover:text-gray-900 dark:group-hover:text-white">{item.t}</span>
             </motion.button>
           ))}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-slate-800">
           <Link 
             to="/cv-analyzer"
             className="w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#d97757] to-[#e38d71] shadow-lg shadow-orange-500/20 hover:opacity-90 transition-all mb-4"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             ATS CV Analyzer
           </Link>
           <button 
             onClick={handleExportPDF}
             className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
             Export Intel
           </button>
           <button 
             onClick={() => setShowInfo(true)}
             className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all mt-1"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             Project Credits
           </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 relative overflow-hidden">
        {/* Background elements moved inside main */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="flex-1 overflow-y-auto">
          <div ref={chatRef} className="max-w-4xl mx-auto py-12 px-6 space-y-10">
            <AnimatePresence>
            {messages.length === 0 ? (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="py-24 text-center"
               >
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/30 animate-float">
                     <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h2 className="text-5xl font-heading font-extrabold text-gray-900 dark:text-white tracking-tighter mb-4">Hello, Student.</h2>
                  <p className="text-gray-500 dark:text-slate-400 font-medium text-lg max-w-md mx-auto">Your specialized AI advisor for Universities, Scholarships, and Career Roadmaps.</p>
               </motion.div>
            ) : (
              messages.map((m, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: m.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                  className={`flex gap-6 items-start ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-[10px] shadow-sm ${
                    m.role === "user" ? "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400" : "bg-indigo-600 text-white"
                  }`}>
                    {m.role === "user" ? "YOU" : "APEX"}
                  </div>
                  <div className={`flex-1 min-w-0 ${m.role === "user" ? "text-right" : ""}`}>
                     <div className={`inline-block text-left ${
                       m.role === "user" 
                       ? "bg-indigo-50 dark:bg-slate-900/80 border border-indigo-100 dark:border-slate-800 px-6 py-4 rounded-3xl rounded-tr-none shadow-sm max-w-xl" 
                       : "w-full"
                     }`}>
                        <div className={`prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-heading prose-headings:font-bold prose-headings:text-indigo-600 dark:prose-headings:text-indigo-400 ${
                          m.role === "user" ? "text-indigo-900 dark:text-indigo-100" : "text-gray-800 dark:text-slate-300"
                        }`}>
                           {m.analysis ? (
                             <CVAnalysisDashboard data={m.analysis} />
                           ) : (
                             <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                           )}
                        </div>
                     </div>
                  </div>
                </motion.div>
              ))
            )}
            </AnimatePresence>
            
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-6 items-start"
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                   <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
                <div className="flex items-center gap-1.5 pt-4">
                   <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.1s]"></div>
                   <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Minimalist Floating Input (Claude/ChatGPT Style) */}
        <div className="px-4 pb-2 w-full">
           <div className="max-w-3xl mx-auto relative">
              
               <div className="bg-gray-100 dark:bg-slate-900 rounded-[1.5rem] p-3 shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col transition-all focus-within:ring-1 focus-within:ring-indigo-500/20">
                 <textarea
                   ref={textareaRef}
                   className="w-full px-3 py-2 text-base bg-transparent focus:outline-none resize-none min-h-[44px] max-h-[300px] text-gray-900 dark:text-white placeholder-gray-500"
                   placeholder="Ask about career roadmaps, ATS resume scores, or university information..."
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyDown={handleKey}
                 />
                 <div className="flex items-center justify-between mt-1 px-1">
                    <div className="flex items-center gap-2">
                       <input 
                         type="file" 
                         ref={fileInputRef} 
                         onChange={handleFileSelect} 
                         className="hidden" 
                         accept=".pdf,.jpg,.jpeg,.png,.webp"
                       />
                       <motion.button 
                         whileHover={{ scale: 1.1 }}
                         whileTap={{ scale: 0.9 }}
                         onClick={() => fileInputRef.current?.click()}
                         className="p-2 text-gray-400 hover:text-indigo-500 transition-all"
                       >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                       </motion.button>
                       <motion.button 
                         whileHover={{ scale: 1.1 }}
                         whileTap={{ scale: 0.9 }}
                         onClick={handleVoice}
                         className={`p-2 rounded-xl transition-all ${isListening ? "text-red-500" : "text-gray-400 hover:text-indigo-500"}`}
                       >
                          <svg className={`w-5 h-5 ${isListening ? "animate-pulse" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                       </motion.button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <motion.button
                         whileHover={{ scale: (input.trim() || selectedFile) ? 1.1 : 1 }}
                         whileTap={{ scale: 0.9 }}
                         onClick={handleSend}
                         disabled={loading || (!input.trim() && !selectedFile)}
                         className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                           (input.trim() || selectedFile) ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-gray-300 dark:text-slate-600"
                         }`}
                       >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                       </motion.button>
                    </div>
                 </div>
                 
                 {/* File Preview */}
                 <AnimatePresence>
                   {selectedFile && (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: 10 }}
                       className="mt-3 p-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl flex items-center justify-between"
                     >
                        <div className="flex items-center gap-2">
                           {filePreview ? (
                             <img src={filePreview} alt="preview" className="w-10 h-10 rounded-lg object-cover border border-indigo-200" />
                           ) : (
                             <div className="p-1.5 bg-indigo-500 rounded-lg text-white">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                             </div>
                           )}
                           <div>
                              <p className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 truncate max-w-[200px]">{selectedFile.name}</p>
                              <p className="text-[9px] text-indigo-500 font-medium">{filePreview ? "Image ready" : "PDF ready"}</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => { setSelectedFile(null); setFilePreview(null); }}
                          className="p-1.5 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 transition-all"
                        >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
              <p className="text-center text-[9px] text-gray-400 dark:text-slate-500 font-medium mt-1">
                 CareerPath AI can make mistakes. Please double-check responses.
              </p>
           </div>
        </div>
      </main>
    </div>
  );
}



function CVAnalysisDashboard({ data }) {
   return (
      <div className="space-y-8 py-4">
         {/* Neural Match Score Header */}
         <div className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            
            <div className="relative w-32 h-32 flex items-center justify-center">
               <svg className="w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                  <motion.circle 
                     cx="64" cy="64" r="58" stroke="white" strokeWidth="8" fill="none"
                     strokeDasharray={364.4}
                     initial={{ strokeDashoffset: 364.4 }}
                     animate={{ strokeDashoffset: 364.4 - (364.4 * (data.match_score || 0)) / 100 }}
                     transition={{ duration: 1.5, ease: "easeOut" }}
                  />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold tracking-tighter">{data.match_score}%</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">Neural Match</span>
               </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
               <h3 className="text-2xl font-bold tracking-tight">Intelligence Analysis</h3>
               <p className="text-indigo-100/80 leading-relaxed font-medium">
                  {data.human_explanation}
               </p>
            </div>
         </div>

         {/* Parameters & Metrics */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-gray-100 dark:border-slate-800">
               <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  Analysis Parameters
               </h4>
               <div className="space-y-4">
                  {Object.entries(data.radar_metrics || {}).map(([key, val]) => (
                     <div key={key}>
                        <div className="flex justify-between text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-tighter mb-1.5">
                           <span>{key}</span>
                           <span>{val}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${val}%` }}
                              className="h-full bg-indigo-500 rounded-full"
                           />
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-gray-100 dark:border-slate-800">
               <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  Semantic Matches
               </h4>
               <div className="flex flex-wrap gap-2">
                  {(data.matched_skills || []).map(skill => (
                     <span key={skill} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-[11px] font-bold border border-emerald-500/10">
                        {skill}
                     </span>
                  ))}
               </div>
               <h4 className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-4 mt-8 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  Gap Identifiers
               </h4>
               <div className="flex flex-wrap gap-2">
                  {(data.missing_skills || []).map(skill => (
                     <span key={skill} className="px-3 py-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] font-bold border border-rose-500/10">
                        {skill}
                     </span>
                  ))}
               </div>
            </div>
         </div>

         {/* Strategic Optimization Path */}
         <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 px-1">Strategic Optimization Path</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {(data.improvement_suggestions || []).map((step, i) => (
                  <div key={i} className="group p-5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl hover:border-indigo-500/30 transition-all shadow-sm">
                     <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black mb-3">
                        {i + 1}
                     </div>
                     <p className="text-[13px] text-gray-700 dark:text-slate-300 leading-relaxed font-medium">
                        {step}
                     </p>
                  </div>
               ))}
            </div>
         </div>

         {/* Neural Bullet Rewrite Engine */}
         {data.rewritten_bullets && data.rewritten_bullets.length > 0 && (
            <div className="space-y-4 pt-4">
               <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-500 px-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  Neural Bullet Rewrite Engine
               </h4>
               <div className="space-y-3">
                  {data.rewritten_bullets.map((bullet, i) => (
                     <div key={i} className="p-5 bg-gray-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800/50 space-y-3">
                        <p className="text-[12px] text-gray-500 italic flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                           Original: {bullet.original}
                        </p>
                        <div className="flex gap-3">
                           <div className="pt-1 text-indigo-500">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                           </div>
                           <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
                              {bullet.rewritten}
                           </p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
}
