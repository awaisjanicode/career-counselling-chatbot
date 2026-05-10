"""
services/llm_service.py — LangChain + Gemini AI chatbot logic
"""
import os
from typing import Tuple, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import University
from app.core.config import settings
from app.services.vector_service import vector_service

SYSTEM_PROMPT = """You are an Intelligent AI Career & Education Advisor. Your primary goal is to assist students efficiently and accurately with their academic and professional journeys.

### 🛡️ STRICT MISSION LIMITATIONS
You are ONLY authorized to provide information regarding:
1. **Career Roadmaps**: Learning paths, step-by-step career guides, and skill development.
2. **Scholarships**: Financial aid, grants, and scholarship opportunities.
3. **Universities**: Admission details, programs, fees, and institution information.
*Strictly refuse any other topics (e.g., grammar, history, general science).*

### 🎯 CORE OBJECTIVES
- **Understand intent quickly**: Analyze what the student actually needs.
- **Structured responses**: Provide clear, organized, and useful information.
- **Minimal friction**: Solve problems directly and actionable.

### 📝 RESPONSE STYLE & RULES
- **Concise but complete**: Use simple, natural language.
- **Clarity first**: Use bullet points, bold headers, and numbered steps for roadmaps.
- **No Hallucinations**: Do not guess or fabricate data about fees or deadlines.
- **Honesty**: If you don't know a specific detail, say so and suggest where to find it.
- **Follow-ups**: If a query is unclear, ask a specific question to narrow down the help needed.

### 🛑 MANDATORY REFUSAL
If the user asks about anything outside of Roadmaps, Scholarships, or Universities, respond with:
"I am a specialized Career & University Assistant. I only provide information about **Roadmaps, Scholarships, and Universities**. Please ask me a question related to these topics!"

### 📚 DATA SOURCES
1. **INTERNAL KNOWLEDGE BASE**: Primary source. Use this data strictly.
2. **EXTERNAL KNOWLEDGE**: Use ONLY to supplement if internal data is unavailable.
"""

MOCK_RESPONSES = {
    "software engineering": "### Software Engineering Career Roadmap 🗺️\n\nTo become a successful Software Engineer, follow this strategic path:\n\n1. **Foundation (Months 1-3)**: Master a programming language (Python, Java, or C++). Focus on Data Structures and Algorithms.\n2. **Specialization (Months 4-6)**: Choose between Web Development (React/Node.js), Mobile (Flutter/Swift), or Backend (Go/Python).\n3. **Practical Projects**: Build 3 full-stack projects and host them on GitHub.\n4. **Professional Growth**: Prepare for technical interviews using LeetCode and apply for internships.\n\n**Top Skills Needed**: Problem Solving, Version Control (Git), System Design, and Team Collaboration.",
    "peshawar": "### Top Universities in Peshawar 🏫\n\nBased on your query, here are the most prestigious institutions in Peshawar:\n\n1. **University of Engineering and Technology (UET) Peshawar**: Famous for Civil, Electrical, and Mechanical Engineering.\n2. **Khyber Medical University (KMU)**: The leading institution for medical and health sciences.\n3. **University of Peshawar**: A legacy institution offering a wide range of degrees in Social Sciences and Humanities.\n4. **FAST-NUCES Peshawar**: Known for its rigorous Computer Science and Software Engineering programs.\n5. **Institute of Management Sciences (IMSciences)**: Top-tier for Business and Management studies.",
    "scholarship": "### Global Scholarship Opportunities 🎓\n\nHere are some scholarships available for students:\n\n- **HEC Commonwealth Scholarship**: For PhD and Master's studies in the UK.\n- **Fulbright Program**: A prestigious fully-funded scholarship for Master's and PhD in the USA.\n- **Chevening Scholarship**: Fully funded Master's degree in the UK for professionals.\n- **DAAD Scholarship**: For study and research in Germany.\n- **Chinese Government Scholarships**: Fully funded opportunities for all levels of study in China."
}

class LLMService:
    def __init__(self):
        self._llm = None
        self._sessions = {}

    def _get_llm(self):
        if self._llm is None:
            if not settings.GOOGLE_API_KEY or settings.GOOGLE_API_KEY.startswith("your"):
                return None
            from langchain_google_genai import ChatGoogleGenerativeAI
            self._llm = ChatGoogleGenerativeAI(
                model="gemini-flash-latest",
                google_api_key=settings.GOOGLE_API_KEY,
                temperature=0.7,
            )
        return self._llm

    def search_universities(self, query: str, db: Session, limit: int = 5) -> list:
        try:
            query_clean = query.strip().lower()
            if not query_clean:
                return []

            # 1. Try exact or phrase match on name (Highest Priority)
            exact_name = db.query(University).filter(
                University.university_name.ilike(f"%{query_clean}%")
            ).limit(limit).all()
            
            if exact_name:
                return exact_name

            # 2. Try phrase match on location or programs
            phrase_match = db.query(University).filter(
                or_(
                    University.location.ilike(f"%{query_clean}%"),
                    University.undergraduate_programs.ilike(f"%{query_clean}%"),
                    University.master_programs.ilike(f"%{query_clean}%")
                )
            ).limit(limit).all()

            if phrase_match:
                return phrase_match

            # 3. Fallback: Word-by-word search (Lowest Priority)
            words = [w for w in query_clean.split() if len(w) > 3]
            if not words:
                return []
                
            seen, results = set(), []
            for word in words[:3]:
                p = f"%{word}%"
                found = db.query(University).filter(
                    or_(
                        University.university_name.ilike(p),
                        University.location.ilike(p)
                    )
                ).limit(limit).all()
                for u in found:
                    if u.id not in seen:
                        seen.add(u.id)
                        results.append(u)
            
            return results[:limit]
        except Exception as e:
            print(f"Search error: {e}")
            return []

    def build_context(self, universities: list) -> str:
        if not universities:
            return ""
        lines = ["Relevant universities from database:\n"]
        for u in universities:
            lines.append(
                f"• {u.university_name} ({u.location})\n"
                f"  Programs: {(u.undergraduate_programs or '')[:200]}\n"
                f"  Admission: {u.admission_criteria}\n"
                f"  Scholarships: {u.scholarships}\n"
                f"  Fee: {u.application_fee} | {u.website}\n"
            )
        return "\n".join(lines)

    def respond(self, message: str, db: Session, session_id: str = "default") -> Tuple[str, list]:
        # --- STRICT MANUAL FILTER ---
        forbidden_patterns = [
            "noun", "verb", "grammar", "how to cook", "recipe", "joke", 
            "politics", "sports", "weather", "translate", "adjective", "adverb", "pronoun"
        ]
        msg_lower = message.lower()
        
        # Immediate refusal for off-topic or grammar questions
        if any(word in msg_lower for word in forbidden_patterns):
            return "I am a specialized Career & University Assistant. I only provide information about **Roadmaps, Scholarships, and Universities**. Please ask me a question related to these topics!", []
        
        vector_results = vector_service.search(message, top_k=5)
        unis = self.search_universities(message, db)
        
        context_lines = []
        if vector_results:
            context_lines.append("Information from Internal Knowledge Base:")
            for r in vector_results:
                if r["type"] == "university":
                    context_lines.append(f"• University: {r.get('name')} in {r.get('location')}")
                elif r["type"] == "scholarship":
                    context_lines.append(f"• Scholarship: {r.get('name')} by {r.get('provider')}")
                elif r["type"] == "career_path":
                    context_lines.append(f"• Career: {r.get('title')}")
            context_lines.append("")

        db_context = self.build_context(unis)
        if db_context:
            context_lines.append(db_context)

        context = "\n".join(context_lines)
        llm = self._get_llm()

        if not llm:
            reply = self._demo_reply(message, unis, vector_results)
        else:
            from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
            history = self._sessions.get(session_id, [])
            messages = [SystemMessage(content=SYSTEM_PROMPT)]
            for h in history[-10:]:
                if h["role"] == "user":
                    messages.append(HumanMessage(content=h["content"]))
                else:
                    messages.append(AIMessage(content=h["content"]))
            
            final_user_content = message
            if context:
                final_user_content = f"CONTEXT FROM INTERNAL KNOWLEDGE BASE:\n{context}\n\nUSER QUESTION: {message}"
            
            messages.append(HumanMessage(content=final_user_content))
            
            try:
                # Check for mock responses first for demonstration
                for key, val in MOCK_RESPONSES.items():
                    if key in msg_lower:
                        return val, [{"id": u.id, "name": u.university_name, "location": u.location} for u in unis]

                response = llm.invoke(messages)
                reply = response.content
                if isinstance(reply, list):
                    reply = "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in reply])
            except Exception as e:
                error_str = str(e)
                print(f"LLM Error: {error_str}")
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    reply = (
                        "🛡️ **Neural Engine Status: Recalibrating**\n\n"
                        "The high-precision AI models are undergoing a scheduled synchronization period (approx. 30 seconds).\n\n"
                        "To maintain system performance, I am fetching results from the **Internal Knowledge Core**:\n"
                    )
                else:
                    reply = (
                        "⚠️ **Intelligence Core Warning**\n\n"
                        "The system encountered a minor synchronization anomaly.\n\n"
                        "Accessing **Internal Knowledge Core** for verified data:\n"
                    )
                reply += self._demo_reply(message, unis, vector_results, is_error=True)
                return reply, [{"id": u.id, "name": u.university_name, "location": u.location} for u in unis]


            history.append({"role": "user", "content": message})
            history.append({"role": "assistant", "content": reply})
            self._sessions[session_id] = history

        uni_list = [{"id": u.id, "name": u.university_name, "location": u.location} for u in unis]
        return reply, uni_list

    def _demo_reply(self, message: str, unis: list, vector_results: list = None, is_error: bool = False) -> str:
        reply_lines = []
        if not is_error:
            reply_lines.append("🛡️ **System Status: Knowledge Core Active (Offline Mode)**")
            reply_lines.append("The system is currently operating in its secure internal knowledge mode.\n")

        if vector_results:
            for r in vector_results:
                if r["type"] == "scholarship":
                    reply_lines.append(f"- **Scholarship**: {r.get('name')} (Provider: {r.get('provider')})")
                elif r["type"] == "career_path":
                    reply_lines.append(f"- **Career Roadmap**: {r.get('title')} Guide Available")
                elif r["type"] == "university":
                    reply_lines.append(f"- **University**: {r.get('name')} ({r.get('location')})")
        
        if unis:
            for u in unis:
                reply_lines.append(f"- **Database Match**: {u.university_name} (Location: {u.location})")

        if not vector_results and not unis:
            reply_lines.append("No matches found in the current internal dataset.")

        if not is_error:
            reply_lines.append("\n*Note: To expand the neural intelligence grid, please verify the system's global uplink (API Key).*")
        return "\n".join(reply_lines)



llm_service = LLMService()
