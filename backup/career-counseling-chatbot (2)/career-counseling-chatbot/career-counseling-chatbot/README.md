# AI-Powered Career Counseling Chatbot
**Final Year Project | Department of Computer Science | AWKUM**

---

## 🌟 Overview
The **AI-Powered Career Counseling Chatbot** is a comprehensive digital advisor designed to guide students through their academic and professional journeys. By leveraging Large Language Models (LLMs) and Vector Search, the system provides personalized career roadmaps, university recommendations, and ATS-optimized CV analysis.

## 🚀 Key Features
- **AI Career Advisor**: Natural language chat for personalized guidance on roadmaps, scholarships, and universities.
- **Neural CV Dashboard**: Professional visualization of ATS scores, technical metrics, and career optimization paths.
- **Multimodal Vision Support**: Upload images (JPG/PNG) of scholarships or university flyers for AI-powered visual analysis.
- **Integrated Project Credits**: Built-in developer and supervisor credits for formal academic presentation.
- **Smart University Search**: Searchable database of 280+ universities with admission details and fee structures.
- **Career Roadmaps**: Detailed, step-by-step learning paths for various technical and non-technical fields.
- **Scholarship Finder**: Intelligent search for financial aid and grant opportunities.

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI (Python 3.10+) |
| **Frontend** | React.js + Tailwind CSS + Lucide Icons |
| **AI / LLM** | LangChain + Google Gemini Pro (Flash) |
| **Vector DB** | FAISS + Sentence Transformers (all-MiniLM-L6-v2) |
| **Database** | PostgreSQL |
| **PDF Engine** | PDFPlumber |

---

## 📂 Project Structure
```text
career-counseling-chatbot/
├── backend/            # FastAPI Source Code
│   ├── app/            # Application logic (APIs, Services, Models)
│   ├── data/           # Database seeds and vector store
│   └── requirements.txt# Python dependencies
├── frontend/           # React Source Code
│   ├── src/            # Components, Pages, and Services
│   └── public/         # Static assets
├── data/               # Project-wide data assets
├── docs/               # Project documentation and reports
├── SETUP.bat           # Automated environment setup script
└── RUN_ALL.bat         # Single-command execution script
```

---

## ⚙️ Installation & Setup (Windows)

### 1. Database Configuration
1. Open PostgreSQL (pgAdmin or CMD) and create the database:
   ```bash
   psql -U postgres -c "CREATE DATABASE career_chatbot;"
   ```

### 2. Automated Setup
1. Double-click **`SETUP.bat`**. This will:
   - Create a Python virtual environment.
   - Install all required backend and frontend dependencies.
   - Prompt you to add your `GOOGLE_API_KEY` in `backend/.env`.

### 3. Running the Application
1. Double-click **`RUN_ALL.bat`**.
2. The **Frontend** will open at: `http://localhost:3000`
3. The **Backend API** will open at: `http://localhost:8000/docs`

---

## 👥 Development Team
- **Muhammad Danyal** (22145784)
- **Muhammad Awais** (22145824)
- **Usman Khan** (22140163)

**Supervisor:** Dr. Shahid Akbar — Department of Computer Science, AWKUM
