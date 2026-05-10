# 🎓 CareerPath AI: Comprehensive Technical Documentation & Viva Prep
**Prepared for Final Year Project Submission | AWKUM CS Department**

---

## 🏛️ Project Identity
*   **Developers**: Muhammad Danyal, Muhammad Awais, Usman Khan
*   **Supervisor**: Dr. Shahid Akbar
*   **Domain**: Artificial Intelligence / Natural Language Processing / Career Counseling
*   **AI Model**: Google Gemini 1.5 Flash (Multimodal)

---

## 🛠️ Section 1: Detailed Library Analysis
*This section explains exactly why we used each library and what "Job" it does in our project.*

### 🖥️ Backend Frameworks (Python)
1.  **FastAPI**: The core web framework. We chose this because it is high-performance, supports asynchronous code (essential for AI calls), and automatically generates Swagger UI documentation.
2.  **Uvicorn**: The ASGI (Asynchronous Server Gateway Interface) server that runs our FastAPI application. It is the "engine" that powers the backend.
3.  **LangChain**: An orchestration framework for AI. It allows us to manage conversation "Memory" (so the AI remembers previous questions) and "Prompt Templates" (the instructions we give the AI).
4.  **langchain-google-genai**: A specialized bridge library that connects LangChain to the Google Gemini models.
5.  **Google-GenerativeAI**: The official SDK from Google. We use this specifically for the **Vision** features (analyzing scholarship images).
6.  **PDFPlumber**: A library for extracting text from PDF files. Unlike other libraries, it handles complex layouts and tables very well, which is crucial for analyzing diverse student resumes.
7.  **Pydantic**: Used for data validation. It ensures that the data sent from the frontend (like chat messages) follows the correct format.
8.  **Python-Dotenv**: Loads our API keys from the `.env` file into the environment safely, keeping our keys hidden from the public code.
9.  **Python-Multipart**: Enables FastAPI to handle file uploads (the "multipart/form-data" format used for PDFs and Images).
10. **FAISS (CPU)**: Our **Vector Database**. It enables "Semantic Search" by storing university data as vectors and finding matches based on meaning, not just keywords.
11. **Sentence-Transformers**: The model used to create "Embeddings." It converts sentences into mathematical vectors that FAISS can understand.
12. **SQLAlchemy & Psycopg2**: Used for the relational part of our database (PostgreSQL). While FAISS handles AI search, SQLAlchemy handles structured data like user profiles.
13. **Python-Jose & Passlib**: These provide **Security**. They allow us to hash passwords and generate JWT (JSON Web Tokens) for secure user login.

### 🎨 Frontend Frameworks (React & Javascript)
1.  **React.js**: Our UI library. It allows us to build a "Single Page Application" (SPA) that is fast and doesn't require page reloads.
2.  **Tailwind CSS**: A utility-first CSS framework. We used it to create the "Glassmorphism" effect, the indigo gradients, and the modern dark mode.
3.  **Framer Motion**: The industry standard for React animations. It powers the smooth sidebar slides, the dashboard fade-ins, and the bouncing loading icons.
4.  **Lucide React**: A beautiful icon library. Every icon you see in the sidebar (Book, Code, Settings) comes from here.
5.  **Axios**: The "messenger" library. It sends the user's data to our FastAPI backend and brings the AI's response back to the UI.
6.  **React-Markdown & Remark-GFM**: These convert the raw text from the AI into beautiful formatted text (bolding, lists, tables).
7.  **HTML2Canvas & jsPDF**: Used together for the "Export PDF" feature. HTML2Canvas takes a screenshot of the chat, and jsPDF wraps it into a downloadable PDF document.

---

## 📂 Section 2: File-by-File Deep Dive

### 📁 Root Directory
*   **`SETUP.bat`**: A Windows batch script that automates the installation. It creates the virtual environment, installs Python packages, and runs `npm install`.
*   **`RUN_ALL.bat`**: Uses the `start` command to launch both the backend (FastAPI) and the frontend (React) in parallel with one double-click.

### 📁 Backend (`/backend`)
*   **`main.py`**: The "Grand Central Station." It initializes the API, sets up CORS (to allow the React frontend to connect), and includes the routes from other files.
*   **`app/services/llm_service.py`**: Contains the `LLMService` class. This is where we define the "System Prompt" (The instructions that tell Gemini to act as a career advisor).
*   **`app/services/cv_analyzer_service.py`**: Contains the logic for the **Neural Dashboard**. It parses PDFs and uses Vision to analyze images. It returns structured JSON data like "Match Score" and "Rewritten Bullets."
*   **`app/api/chat.py`**: Defines the POST endpoint `/chat`. It receives user text and returns the AI's reply.
*   **`app/api/cv_analyzer.py`**: Defines the POST endpoint `/cv-analyzer`. It handles file uploads and routes them to the analysis service.

### 📁 Frontend (`/frontend/src`)
*   **`pages/ChatPage.js`**: The most complex file. It contains the Chat UI, the Logic for Voice input, the File Upload handling, and the **CVAnalysisDashboard** component (which renders the match score charts).
*   **`services/api.js`**: Centralizes all API calls. It defines `sendMessage` and `analyzeCV` functions.
*   **`index.css`**: Defines our global "Design Tokens" (the HSL colors, the fonts, and the custom scrollbar styles).

---

## 🌊 Section 3: The Complete Data Workflow
*How data travels through CareerPath AI:*

1.  **Selection**: User selects a PDF resume.
2.  **Frontend State**: React's `useState` stores the file. A `FileReader` creates a local preview URL.
3.  **API Request**: Axios sends the file to the Backend using `FormData`.
4.  **Backend Detection**: The `cv_analyzer.py` endpoint checks the file extension.
    *   **If PDF**: `PDFPlumber` extracts text.
    *   **If Image**: `base64` encoding is performed and sent to Gemini Vision.
5.  **AI Intelligence**: Gemini processes the data against the "Job Description" provided by the user.
6.  **Structured JSON**: The AI doesn't just send text; it sends a JSON object with percentages, lists of skills, and improvement tips.
7.  **Visual Dashboard**: React receives this JSON. The `CVAnalysisDashboard` component maps this data to progress bars, circular charts, and animated cards.

---

## 🧬 Section 4: Vector Database & RAG Workflow
*This section explains the "Advanced Intelligence" part of the project: How we find the right information for the student.*

### 1. What is a Vector Database?
Traditional databases (like SQL) search for exact words. A **Vector Database** (like FAISS or Pinecone) searches for **Meanings**. It stores text as a list of numbers called **Embeddings**.
*   **Example**: In a normal database, "Doctor" and "Physician" are different words. In a Vector Database, their "Vectors" are very close to each other because they mean the same thing.

### 2. The RAG (Retrieval-Augmented Generation) Process
We use a technique called **RAG**. Instead of letting the AI "guess" about universities, we give it the exact data from our database.

**The 4-Step Workflow:**
1.  **Embedding Generation**: We take our list of 280+ universities and convert them into mathematical vectors using an Embedding Model (e.g., `Sentence-Transformers`).
2.  **Vector Storage**: These vectors are stored in a **Vector Store** (FAISS). This is our "Knowledge Base."
3.  **Semantic Retrieval**: When a user asks *"Which college is best for medical in Mardan?"*, we convert their question into a vector and find the most "similar" university vectors in our store.
4.  **Augmentation**: We take those specific university details and say to Gemini: *"Here is the data for colleges in Mardan. Use this to answer the student."*

### 3. Why is this important for your Defense?
*   It proves the project isn't just a "wrapper" for ChatGPT.
*   It shows you are using **Modern AI Architecture** (RAG).
*   It ensures the AI doesn't "hallucinate" (make up fake fees or universities).

---

### 🛡️ Section 6: 35 Expert Viva Questions (Supervisor Defense)

### 🧩 Logic & AI
1. **How do you handle the "context" of a conversation?**
   * *Answer*: We use LangChain's memory management to pass previous chat history back to the model with every new request.
2. **What is the difference between "Generative AI" and "Vision AI" in your project?**
   * *Answer*: Generative AI creates the text roadmap, while Vision AI uses Computer Vision (via Gemini) to interpret pixels in an image (like a scholarship flyer).
3. **How do you ensure the AI doesn't hallucinate (make up facts)?**
   * *Answer*: We use a "System Prompt" that strictly limits the AI to academic and career topics and forces it to use our university database for facts.
4. **Why use JSON for the CV Analysis instead of plain text?**
   * *Answer*: JSON allows us to create a **Structured UI** (charts/bars). Plain text would be boring for the user to read.
5. **How does the "Neural Bullet Rewrite" work?**
   * *Answer*: We ask the LLM to apply the "X-Y-Z formula" (Accomplished X, measured by Y, by doing Z) to the user's original resume points.

### 🏗️ Architecture
6. **What is REST API?**
   * *Answer*: Representational State Transfer. It is the architectural style we use for our Backend-Frontend communication via HTTP.
7. **Explain the role of CORS.**
   * *Answer*: Cross-Origin Resource Sharing. It is a security feature that we configured to allow our Frontend (on Port 3000) to talk to our Backend (on Port 8000).
8. **What happens if the Google API is down?**
   * *Answer*: We have implemented `try-catch` blocks in the frontend to show a professional error message to the user instead of crashing.
9. **How do you manage Large File uploads?**
   * *Answer*: FastAPI's `UploadFile` uses a "spooled" file system, meaning it stays in memory for small files but moves to disk for large ones, preventing memory crashes.
10. **Explain the Project's "States."**
    * *Answer*: We have several states: `loading` (shows spinner), `messages` (chat history), `showInfo` (sidebar visibility), and `selectedFile` (staged upload).

### 🎨 Design & UX
11. **Why did you use HSL colors instead of Hex codes?**
    * *Answer*: HSL (Hue, Saturation, Lightness) makes it easier to create "Theme Tints" (like semi-transparent indigo) for a premium look.
12. **How does the Circular Progress bar work?**
    * *Answer*: It is an SVG circle where we dynamically change the `stroke-dashoffset` property using a mathematical formula based on the percentage.
13. **What is "Multimodal Interaction"?**
    * *Answer*: It means the user can interact via Text, Voice, PDF, or Images.
14. **How do you handle "Dark Mode"?**
    * *Answer*: We use Tailwind's `dark` class, which is toggled on the root `<html>` element.
15. **What is the purpose of `framer-motion`'s `AnimatePresence`?**
    * *Answer*: It allows elements to animate *out* (exit) when they are removed from the screen, like the sidebar sliding away.

### 🛡️ Security & Performance
16. **Is the API Key safe in the `.env` file?**
    * *Answer*: Yes, because the `.env` file is never included in the browser-side code; it stays strictly on the server.
17. **How do you optimize PDF text extraction?**
    * *Answer*: We strip extra whitespaces and newlines using Regular Expressions (`re` library) before sending text to the AI.
18. **Why did you use `axios` instead of the built-in `fetch`?**
    * *Answer*: Axios automatically transforms JSON data and has better error handling for complex requests.
19. **What is the "Context Window" limit of your system?**
    * *Answer*: Since we use Gemini 1.5 Flash, it can handle up to 1 million tokens, which is far more than any student's chat history will ever reach.
20. **How do you handle multiple group members working on the same code?**
    * *Answer*: We use a modular structure where UI, Services, and APIs are in separate files to prevent "merge conflicts."

### 🎓 Academic Values
21. **How is this project beneficial for AWKUM?**
    * *Answer*: It automates the initial step of career counseling, allowing human counselors to focus on more complex student problems.
22. **What is the "Innovation" here?**
    * *Answer*: The innovation is the **Neural Match Score Dashboard**—taking traditional ATS logic and making it visually interactive for the student.
23. **How do you verify the accuracy of the University data?**
    * *Answer*: We used a curated dataset of official university fee structures as a "Source of Truth" for the AI.
24. **Can this be integrated with the University's Admission portal?**
    * *Answer*: Yes, the modular FastAPI structure allows us to easily add an "Apply Now" endpoint in the future.
25. **What are the ethical considerations of AI in career counseling?**
    * *Answer*: We include a disclaimer that the AI can make mistakes and that it should be used as a "supplement" to human advice, not a replacement.

### 🚀 Future & Scaling
26. **How would you add "User Login"?**
    * *Answer*: By adding JWT (JSON Web Tokens) authentication and a PostgreSQL database to store user profiles.
27. **Could you make this a Mobile App?**
    * *Answer*: Yes, the React code can be easily adapted to React Native, or the FastAPI backend can serve as the API for an Android/iOS app.
28. **How would you implement "Real-time University updates"?**
    * *Answer*: By adding a Web Scraper service that automatically checks university websites for fee changes.
29. **What is the "RAG" technique?**
    * *Answer*: Retrieval-Augmented Generation. We "Retrieved" university data from our local DB and "Augmented" the AI's prompt with it.
30. **Why is AI better than a simple search engine for this?**
    * *Answer*: A search engine gives links; AI gives **Reasoning**. It tells you *why* a career suits you, not just that it exists.

### 🔐 Security & Database
31. **Why do you use both FAISS and PostgreSQL?**
    * *Answer*: FAISS is for **Unstructured AI Search** (meanings), while PostgreSQL is for **Structured Data** (tables like users, university lists) that require ACID compliance.
32. **What is JWT?**
    * *Answer*: JSON Web Token. It is a secure way to transmit information between the frontend and backend as a JSON object, used for user authentication.
33. **How do you protect passwords?**
    * *Answer*: We use `Passlib` with the `bcrypt` hashing algorithm. We never store plain-text passwords in the database.
34. **What is an "Embedding Model"?**
    * *Answer*: It is a neural network (like `all-MiniLM-L6-v2`) that converts text into a coordinate in high-dimensional space.
35. **How does the system handle "No Result" from the Vector DB?**
    * *Answer*: We set a "Similarity Threshold." If no university is close enough in meaning, the AI gracefully informs the student that no exact match was found.

---
**This documentation is a complete technical asset for your project defense.**
*Finalized on 2026-05-06 for Muhammad Danyal and Team.*
