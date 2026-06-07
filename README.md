# 🚀 TalentMatch AI

*The new standard in hiring.* 

TalentMatch AI is an enterprise-grade, full-stack application built to seamlessly connect top-tier candidates with recruiters. It moves beyond standard job boards by leveraging Artificial Intelligence to analyze, parse, and perfectly match candidate skills to job requirements.

---

## ✨ Key Features

- **Intelligent Job Matching:** Uses an AI matching algorithm to compare a candidate's actual experience and skills with active job postings, generating an instant compatibility score.
- **AI Gap Analysis:** Acts as a career mentor by telling candidates exactly what skills they are missing for specific job roles so they can upskill efficiently.
- **AI Resume & CV Builder:** A fully dynamic, interactive builder that takes user inputs, utilizes AI to generate professional summary paragraphs, and exports natively to a styled PDF.
- **Dual Dashboards:** Specialized, ultra-premium Dark Mode interfaces separated for both Candidates and Recruiters.
- **Automated Screening:** Built-in tools for recruiters to instantly sort incoming applications by AI Match Score, saving hours of manual resume review.
- **Career Coach Ai:** resolve queries of candidate and recuiters

---

## Additional Features

- 🔔 Smart Deadline Notifications: Candidates receive alerts when job application deadlines are near.
- 🎤 AI Mock Interview: Practice job-specific interview questions before applying.
- 💾 Save Jobs: Bookmark jobs and access them later from the dashboard.
- 🤖 AI Resume Matching: AI analyzes resumes and recommends suitable jobs.
- 📈 Application Tracking: Monitor application status throughout the hiring process.
- 👨‍💼 Recruiter Dashboard: Manage jobs and review AI-ranked candidates.

---

## 💻 Technology Stack

**Frontend:**
- React.js + Vite
- TailwindCSS (Premium Zinc/Black Dark Mode Aesthetic)
- `@react-pdf/renderer` (Client-side PDF generation)
- Axios & React Router

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (NoSQL Database)
- JSON Web Tokens (JWT) for secure authentication
- OpenRouter API (LLM Integration for NLP tasks)

---

## 🔄 How It Works

### 👩‍💼 Candidate Workflow

```text
Sign Up
   ↓
Create Profile
   ↓
Upload Resume
   ↓
AI Resume Analysis
   ↓
View AI-Matched Jobs
   ↓
Save Jobs / Apply for Jobs
   ↓
Receive Deadline Notifications
   ↓
Take AI Mock Interview
   ↓
Get AI Feedback
   ↓
Submit Application
   ↓
Track Application Status
```

### 🏢 Recruiter Workflow

```text
Sign Up
   ↓
Create Company Profile
   ↓
Post Job Openings
   ↓
AI Candidate Matching
   ↓
Review Ranked Candidates
   ↓
Shortlist Applicants
   ↓
Schedule Interviews
   ↓
Hire Top Talent
```

---

## 🌟 Future Enhancements

- 🎥 Video-based AI interviews
- 📝 Skill assessment tests
- 💬 Real-time recruiter-candidate chat
- 🎯 Job recommendation engine
- 📊 Advanced analytics dashboard
- 📧 Email and mobile push notifications
- 🌍 Multi-language support

---

## ⚙️ Local Development Setup

To run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/lahari-cse/Talent_match-Ai.git
cd Talent_match-Ai
```

### 2. Setup the Backend
Open a terminal in the `backend` folder:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal in the `frontend` folder:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory with the following variable:
```env
VITE_API_URL=http://localhost:5000
```
Start the frontend server:
```bash
npm run dev
```

---

## 🌍 Live Deployment
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render
- **Database Hosting:** MongoDB Atlas

## Live Deployment Link
- **https://talent-match-ai-one.vercel.app/
