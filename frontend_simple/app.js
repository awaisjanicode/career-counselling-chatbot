const API = 'http://127.0.0.1:8000';
let sessionId = 'session_' + Date.now();
let activeTab = 'advisor';

// === TABS & NAVIGATION ===
function switchTab(tab) {
    activeTab = tab;
    // Update UI tabs
    ['advisor', 'unis', 'cv'].forEach(t => {
        const el = document.getElementById(t + 'Tab');
        if (t === tab) {
            el.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-primary');
            el.classList.remove('text-slate-500');
        } else {
            el.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-primary');
            el.classList.add('text-slate-500');
        }
    });

    // Handle tab specific logic
    if (tab === 'cv') {
        appendMsg("I've switched to CV Analysis mode. Please upload your resume (PDF or Image) using the attachment icon below, and I'll analyze it against ATS standards.", 'ai');
    } else if (tab === 'unis') {
        appendMsg("I'm now focusing on University searches. Ask me about admission criteria, fees, or specific programs in any institution.", 'ai');
    }
}

function newChat() {
    sessionId = 'session_' + Date.now();
    document.getElementById('chatMessages').innerHTML = '';
    // Show welcome screen again
    const messages = document.getElementById('chatMessages');
    const welcome = createWelcomeHTML();
    messages.appendChild(welcome);
}

function createWelcomeHTML() {
    const div = document.createElement('div');
    div.id = 'welcomeScreen';
    div.className = 'py-12 text-center';
    div.innerHTML = `
        <div class="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30 animate-float">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <h2 class="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">Hello, I'm APEX.</h2>
        <p class="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-md mx-auto mb-10">Your specialized AI advisor for Universities, Scholarships, and Career Roadmaps.</p>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <button onclick="sendFromWelcome('What career roadmap should I follow for Computer Science?')" class="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-primary/50 hover:shadow-lg transition-all text-left group">
                <span class="text-2xl group-hover:scale-110 transition-transform">🗺️</span>
                <div>
                    <h4 class="font-bold text-sm text-slate-900 dark:text-white">CS Career Roadmap</h4>
                    <p class="text-xs text-slate-500">Step-by-step learning path</p>
                </div>
            </button>
            <button onclick="sendFromWelcome('Tell me about top engineering universities in Peshawar')" class="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-primary/50 hover:shadow-lg transition-all text-left group">
                <span class="text-2xl group-hover:scale-110 transition-transform">🏫</span>
                <div>
                    <h4 class="font-bold text-sm text-slate-900 dark:text-white">Peshawar Universities</h4>
                    <p class="text-xs text-slate-500">Local admission details</p>
                </div>
            </button>
            <button onclick="sendFromWelcome('What scholarships are available for engineering students?')" class="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-primary/50 hover:shadow-lg transition-all text-left group">
                <span class="text-2xl group-hover:scale-110 transition-transform">🎓</span>
                <div>
                    <h4 class="font-bold text-sm text-slate-900 dark:text-white">Scholarships Search</h4>
                    <p class="text-xs text-slate-500">Financial aid opportunities</p>
                </div>
            </button>
            <button onclick="sendFromWelcome('How do I become a Data Scientist?')" class="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-primary/50 hover:shadow-lg transition-all text-left group">
                <span class="text-2xl group-hover:scale-110 transition-transform">📊</span>
                <div>
                    <h4 class="font-bold text-sm text-slate-900 dark:text-white">Data Science Path</h4>
                    <p class="text-xs text-slate-500">Skills and certifications</p>
                </div>
            </button>
        </div>
    `;
    return div;
}

// === CHAT LOGIC ===
function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
}

function autoGrow(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
}

function sendFromWelcome(text) {
    const input = document.getElementById('msgInput');
    input.value = text;
    send();
}

async function send() {
    const input = document.getElementById('msgInput');
    const text = input.value.trim();
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!text && !file) return;

    // Remove welcome screen if present
    const ws = document.getElementById('welcomeScreen');
    if (ws) ws.remove();

    // Add user message
    let userDisplay = text;
    if (file) userDisplay = `📎 ${file.name}\n\n${text}`;
    appendMsg(userDisplay, 'user');
    
    input.value = '';
    input.style.height = 'auto';
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;

    // Show typing
    const typing = appendTyping();

    try {
        let res;
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('job_description', text || "Analyze this CV.");
            res = await fetch(API + '/cv-analyzer/analyze', {
                method: 'POST',
                body: formData
            });
        } else {
            res = await fetch(API + '/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, session_id: sessionId })
            });
        }

        const data = await res.json();
        typing.remove();
        
        if (data.reply) {
            appendMsg(data.reply, 'ai');
        } else if (data.human_explanation) {
            // This is a CV analysis result
            appendMsg(data.human_explanation, 'ai', true, data);
        } else if (data.error) {
            appendMsg(`⚠️ **Error**: ${data.error}`, 'ai');
        } else if (data.detail) {
            // Handle FastAPI validation errors (422)
            const detail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
            appendMsg(`⚠️ **Validation Error**: ${detail}`, 'ai');
        } else {
            appendMsg("I've processed your request but didn't get a standard reply. Please try again.", 'ai');
        }
        
        fileInput.value = ''; // Reset file
    } catch (err) {
        typing.remove();
        appendMsg('⚠️ Could not connect to the backend. Make sure it is running on port 8000.', 'ai');
    } finally {
        sendBtn.disabled = false;
    }
}

// === MESSAGES UI ===
function appendMsg(text, role, isAnalysis = false, data = null) {
    const area = document.getElementById('chatMessages');
    const row = document.createElement('div');
    row.className = `flex gap-6 items-start ${role === 'user' ? 'flex-row-reverse' : ''}`;
    
    const icon = document.createElement('div');
    icon.className = `w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-[10px] shadow-sm ${
        role === 'user' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' : 'bg-primary text-white shadow-primary/20'
    }`;
    icon.textContent = role === 'user' ? 'YOU' : 'APEX';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = `flex-1 min-w-0 ${role === 'user' ? 'text-right' : ''}`;

    const bubble = document.createElement('div');
    bubble.className = `inline-block text-left ${
        role === 'user' 
        ? 'bg-primary/5 dark:bg-slate-900/80 border border-primary/10 dark:border-slate-800 px-6 py-4 rounded-3xl rounded-tr-none shadow-sm max-w-xl' 
        : 'w-full'
    }`;
    
    const textDiv = document.createElement('div');
    textDiv.className = `msg-bubble prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed ${
        role === 'user' ? 'text-slate-900 dark:text-slate-100' : 'text-slate-800 dark:text-slate-300'
    }`;
    textDiv.innerHTML = md(text, isAnalysis, data);

    bubble.appendChild(textDiv);
    contentWrapper.appendChild(bubble);
    row.appendChild(icon);
    row.appendChild(contentWrapper);
    
    area.appendChild(row);
    scrollBottom();
}

function appendTyping() {
    const area = document.getElementById('chatMessages');
    const row = document.createElement('div');
    row.className = 'flex gap-6 items-start';
    
    row.innerHTML = `
        <div class="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <div class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
        <div class="flex items-center gap-1.5 pt-4">
            <div class="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
            <div class="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.1s]"></div>
            <div class="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
        </div>
    `;
    
    area.appendChild(row);
    scrollBottom();
    return row;
}

function scrollBottom() {
    const s = document.getElementById('chatScroll');
    s.scrollTo({ top: s.scrollHeight, behavior: 'smooth' });
}

// === UTILS ===
function renderCVAnalysis(data) {
    return `
        <div class="space-y-6 py-2">
            <div class="bg-gradient-to-br from-primary to-indigo-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div class="flex items-center gap-6 relative z-10">
                    <div class="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center">
                        <span class="text-2xl font-bold">${data.match_score}%</span>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold">ATS Match Score</h3>
                        <p class="text-indigo-100 text-sm leading-relaxed">${data.human_explanation}</p>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <h4 class="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Matched Skills</h4>
                    <div class="flex flex-wrap gap-1.5">
                        ${data.matched_skills.map(s => `<span class="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold border border-emerald-500/10">${s}</span>`).join('')}
                    </div>
                </div>
                <div class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <h4 class="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-3">Skill Gaps</h4>
                    <div class="flex flex-wrap gap-1.5">
                        ${data.missing_skills.map(s => `<span class="px-2 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-bold border border-rose-500/10">${s}</span>`).join('')}
                    </div>
                </div>
            </div>

            <div class="space-y-3">
                <h4 class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Optimization Steps</h4>
                <div class="grid grid-cols-1 gap-2">
                    ${data.improvement_suggestions.map((s, i) => `<div class="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-medium"><span class="text-primary mr-2">${i+1}.</span> ${s}</div>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function md(text, isAnalysis = false, data = null) {
    if (isAnalysis && data) return renderCVAnalysis(data);
    if (!text) return '';
    let h = esc(text);
    h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/\*(.+?)\*/g, '<em>$1</em>');
    h = h.replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 rounded">$1</code>');
    h = h.replace(/^### (.+)$/gm, '<h4 class="font-bold text-lg mt-4">$1</h4>');
    h = h.replace(/^## (.+)$/gm, '<h3 class="font-bold text-xl mt-6">$1</h3>');
    h = h.replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>');
    h = h.replace(/^\d+\.\s(.+)$/gm, '<li class="ml-4">$1</li>');
    h = h.replace(/\n{2,}/g, '</p><p>');
    h = h.replace(/\n/g, '<br>');
    return '<p>' + h + '</p>';
}

function esc(s) {
    const d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
}

// === THEME ===
let isDark = localStorage.getItem('theme') !== 'light';
function applyTheme() {
    if (isDark) {
        document.documentElement.classList.add('dark');
        document.getElementById('moonIcon').classList.add('hidden');
        document.getElementById('sunIcon').classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('moonIcon').classList.remove('hidden');
        document.getElementById('sunIcon').classList.add('hidden');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
applyTheme();

function toggleTheme() {
    isDark = !isDark;
    applyTheme();
}

// === MODALS & UI ===
function showCredits() { document.getElementById('creditsModal').classList.remove('hidden'); }
function hideCredits() { document.getElementById('creditsModal').classList.add('hidden'); }
function triggerFile() { document.getElementById('fileInput').click(); }
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        appendMsg(`Selected file: ${file.name}. Click send to analyze.`, 'ai');
    }
}

// === VOICE ===
function toggleVoice() {
    alert('Voice input activated. Please speak now.');
    // Simple mock for voice in this version
}
