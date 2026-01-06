# MedInsight AI - Medical Report Analysis Platform

A comprehensive AI-powered platform to help patients understand their medical test reports through automated parsing, analysis, and patient-friendly explanations.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Tech Stack](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi)
![Tech Stack](https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai)
![Tech Stack](https://img.shields.io/badge/SQLite-Local%20DB-003B57?logo=sqlite)
![Tech Stack](https://img.shields.io/badge/Supabase-Auth-3ECF8E?logo=supabase)

## ✨ Features

- **📄 Report Upload & Analysis** - Upload PDF or image medical reports for instant AI analysis
- **📅 Report Date Selection** - Specify the date of the medical report (defaults to today)
- **🔬 Medical Term Simplification** - Complex terminology explained in simple language
- **🚨 Abnormal Value Detection** - Automatic flagging with color-coded indicators (🟢🟡🔴)
- **💡 Health Insights & Alerts** - Clear guidance for values needing attention
- **📊 Visual Analytics** - Interactive charts for understanding health data
- **🏥 Health Score** - Overall health score (0-100) based on test results
- **👨‍👩‍👧 Family Profiles** - Manage health profiles for family members
- **📈 Historical Tracking** - Track and compare test results over time
- **💬 AI Follow-up Chat** - Ask questions about your results

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, Tailwind CSS, Framer Motion, Recharts |
| Backend | FastAPI (Python) |
| AI | OpenAI GPT-4 / GPT-3.5 |
| Database | SQLite (local, zero configuration) |
| Auth | Supabase Auth (free tier) |
| Hosting | Vercel (Frontend), Any Python host (Backend) |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- OpenAI API Key
- Supabase Account (free - for authentication only)

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

### Backend Setup

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your OpenAI API key
cd app
python -m uvicorn main:app --reload --port 8000
```

### Database

The backend uses **SQLite** - no setup required! The database file `medinsight.db` is created automatically when you start the server.

To view the database:
- Install VS Code extension "SQLite Viewer"
- Or use: `sqlite3 medinsight.db` then `.tables` and `SELECT * FROM reports;`

### Authentication (Supabase)

1. Create a free Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Add to `frontend/.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

> **Note:** Supabase is only used for authentication. All data is stored locally in SQLite.

## 📁 Project Structure

```
medicalRepoInterpret/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   │   ├── dashboard/   # Report upload & analysis
│   │   │   ├── history/     # Historical tracking
│   │   │   ├── compare/     # Compare reports
│   │   │   ├── family/      # Family members
│   │   │   ├── profile/     # Health profile
│   │   │   └── auth/        # Authentication
│   │   ├── components/      # React components
│   │   ├── contexts/        # Auth context
│   │   └── lib/             # API client
│
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── main.py          # Entry point
│   │   ├── database.py      # SQLite config
│   │   ├── routers/         # API endpoints
│   │   │   ├── reports.py   # Report upload/analysis
│   │   │   ├── insights.py  # AI insights
│   │   │   └── users.py     # Profile & family
│   │   ├── services/        # Business logic
│   │   ├── models/          # SQLAlchemy models
│   │   └── prompts/         # AI prompts
│   └── requirements.txt
```

## 🔐 Data Privacy

- **Anonymous users**: Can analyze reports but data is NOT saved
- **Logged in users**: Reports and results saved to local SQLite database
- **No cloud storage**: All data stays on your machine
- **Authentication only**: Supabase is used only for user login

## 🎨 UI Features

- **Dark Mode** - Premium dark theme with glassmorphism
- **Responsive** - Works on desktop, tablet, and mobile
- **Animations** - Smooth transitions with Framer Motion
- **Color-coded** - Status indicators for easy reading

## ⚠️ Disclaimer

> **Medical Disclaimer**: This platform does not provide medical diagnosis. The information provided is for educational purposes only and should not be considered medical advice. Always consult a qualified healthcare professional for proper diagnosis and treatment.

## 📄 License

MIT License - Built for hackathon demonstration purposes.
