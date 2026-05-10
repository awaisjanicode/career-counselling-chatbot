import json
import re
import google.generativeai as genai
from io import BytesIO
import pdfplumber
from app.core.config import settings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

RESUME_ANALYSIS_PROMPT = """
You are an expert ATS (Applicant Tracking System) Specialist and Career Coach. 
Analyze the provided RESUME against the JOB DESCRIPTION.

Output your analysis strictly in JSON format with the following keys:
- match_score: (int, 0-100) A realistic ATS compatibility score.
- radar_metrics: (object) Scores (0-100) for visual mapping: {"Technical": 0, "Experience": 0, "Soft Skills": 0, "Industry Knowledge": 0, "Education": 0}
- missing_skills: (list of strings) Key skills from JD missing in Resume.
- matched_skills: (list of strings) Skills found in both.
- improvement_suggestions: (list of strings) 3-5 actionable tips.
- human_explanation: (string) A professional summary of the match.
- rewritten_bullets: (list of objects) [{"original": "...", "rewritten": "..."}] 2-3 examples to improve impact.


Resume:
{resume_text}

Job Description:
{jd_text}
"""

COVER_LETTER_PROMPT = """
Act as a professional copywriter. Write a persuasive, tailored cover letter strictly between 250 and 400 words (minimum 250 words required by international standard).
Format the cover letter strictly according to international formal business letter rules, including:
- [Your Name/Contact Info]
- [Date]
- [Employer/Hiring Manager Contact Info]
- Professional Salutation (e.g., Dear Hiring Manager,)
- Opening Paragraph (State the role being applied for and a strong hook)
- 2-3 Body Paragraphs (Match the candidate's strengths from the resume to the job's key requirements)
- Closing Paragraph (Reiterate enthusiasm, include a call to action)
- Professional Sign-off (e.g., Sincerely, [Your Name])

Resume:
{resume_text}

Job Description:
{jd_text}
"""

INTERVIEW_PREP_PROMPT = """
You are a hiring manager. Based on the resume and JD, generate 30 challenging interview questions.
For each question, provide a 'talking_point' tip and a 'sample_answer' (a full, high-quality ideal response).

Output JSON: [{"question": "...", "talking_point": "...", "sample_answer": "..."}]

Resume:
{resume_text}

Job Description:
{jd_text}
"""

INTERVIEW_EVALUATION_PROMPT = """
You are an expert Interview Coach. 
You are evaluating a candidate's answer to an interview question.
Assess the answer based on correctness, completeness, and alignment with the provided Job Description and the candidate's Resume.

Question: {question}
Ideal/Sample Answer Idea: {sample_answer}
Candidate's Answer: {user_answer}

Resume Context:
{resume_text}

Job Description Context:
{jd_text}

Provide your feedback strictly in JSON format with the following keys:
- score: (int, 0-100) A rating of the answer quality.
- feedback: (string) A concise paragraph of constructive feedback.
- strengths: (list of strings) 1-3 strong points of the answer.
- areas_for_improvement: (list of strings) 1-3 areas to improve.
"""

MOCK_ANALYSIS = {
    "match_score": 85,
    "radar_metrics": {"Technical": 90, "Experience": 75, "Soft Skills": 80, "Industry Knowledge": 85, "Education": 95},
    "matched_skills": ["Python", "Machine Learning", "FastAPI", "SQL"],
    "missing_skills": ["Docker", "Kubernetes", "Cloud Deployment"],
    "improvement_suggestions": [
        "Include more quantifiable achievements in your previous roles.",
        "Add certifications related to Cloud Computing (AWS/GCP).",
        "Elaborate on your experience with Microservices architecture."
    ],
    "human_explanation": "Your profile is a strong match for the Software Engineer role. You have demonstrated technical expertise in Python and API development, though adding containerization skills would make you a top-tier candidate.",
    "rewritten_bullets": [
        {"original": "Worked on a chatbot using Python.", "rewritten": "Architected and deployed an AI-powered Career Counseling Chatbot using Python and FastAPI, improving student engagement by 40%."}
    ]
}

class CVAnalyzerService:
    def __init__(self):
        self.llm = None
        if settings.GOOGLE_API_KEY:
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-flash-latest",
                google_api_key=settings.GOOGLE_API_KEY,
                temperature=0.2
            )

    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        try:
            with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
                text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            
            # Clean text
            text = re.sub(r'\s+', ' ', text).strip()
            return text
        except Exception as e:
            raise Exception(f"Error extracting PDF: {str(e)}")

    async def analyze_visual(self, image_bytes: bytes, query: str):
        """Analyze an image (scholarship, degree, etc.) using Gemini Vision."""
        if not self.llm:
            return {"error": "Google API Key not configured"}

        try:
            # We use the same LLM instance (Gemini Flash is multimodal)
            message = HumanMessage(
                content=[
                    {"type": "text", "text": f"Analyze this image based on the following request: {query}"},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{self._bytes_to_base64(image_bytes)}"},
                    },
                ]
            )
            response = self.llm.invoke([message])
            return {"analysis": response.content}
        except Exception as e:
            return {"error": str(e)}

    def _bytes_to_base64(self, data: bytes) -> str:
        import base64
        return base64.b64encode(data).decode("utf-8")

    def _parse_json_response(self, content):
        """Helper to safely parse JSON from LLM response, handling markdown blocks."""
        if isinstance(content, list):
            content = "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in content])
        
        # Remove markdown code blocks if present
        text = re.sub(r"```json\s*", "", content)
        text = re.sub(r"```\s*", "", text)
        text = text.strip()
        
        try:
            return json.loads(text)
        except Exception as e:
            # Fallback: try to find the first { and last }
            try:
                start = text.find("{")
                end = text.rfind("}") + 1
                if start != -1 and end != 0:
                    return json.loads(text[start:end])
                
                # Try list format [ ]
                start = text.find("[")
                end = text.rfind("]") + 1
                if start != -1 and end != 0:
                    return json.loads(text[start:end])
            except:
                pass
            raise Exception(f"Failed to parse AI response as JSON: {str(e)}")

    async def analyze_cv(self, resume_text: str, jd_text: str):
        if not self.llm:
            return {"error": "Google API Key not configured"}

        try:
            # Check for demo mode/fallback
            if not self.llm or "exceeded" in str(self.llm):
                return MOCK_ANALYSIS

            prompt = RESUME_ANALYSIS_PROMPT.replace("{resume_text}", resume_text).replace("{jd_text}", jd_text)
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return self._parse_json_response(response.content)
        except Exception as e:
            if "RESOURCE_EXHAUSTED" in str(e):
                return MOCK_ANALYSIS
            return {"error": str(e)}

    async def generate_cover_letter(self, resume_text: str, jd_text: str):
        if not self.llm:
            return {"error": "Google API Key not configured"}

        try:
            prompt = COVER_LETTER_PROMPT.replace("{resume_text}", resume_text).replace("{jd_text}", jd_text)
            response = self.llm.invoke([HumanMessage(content=prompt)])
            content = response.content
            if isinstance(content, list):
                content = "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in content])
            return {"cover_letter": content}
        except Exception as e:
            return {"error": str(e)}

    async def generate_interview_prep(self, resume_text: str, jd_text: str):
        if not self.llm:
            return {"error": "Google API Key not configured"}

        try:
            prompt = INTERVIEW_PREP_PROMPT.replace("{resume_text}", resume_text).replace("{jd_text}", jd_text)
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return self._parse_json_response(response.content)
        except Exception as e:
            return {"error": str(e)}

    async def evaluate_interview_answer(self, question: str, sample_answer: str, user_answer: str, resume_text: str, jd_text: str):
        if not self.llm:
            return {"error": "Google API Key not configured"}

        try:
            prompt = INTERVIEW_EVALUATION_PROMPT.replace("{question}", question)\
                .replace("{sample_answer}", sample_answer)\
                .replace("{user_answer}", user_answer)\
                .replace("{resume_text}", resume_text)\
                .replace("{jd_text}", jd_text)
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return self._parse_json_response(response.content)
        except Exception as e:
            return {"error": str(e)}

cv_analyzer_service = CVAnalyzerService()
