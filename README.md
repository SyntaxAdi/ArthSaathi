<div align="center">
  <img src="public/logo.png" width="80px" alt="ArthSaathi Logo" />
  <h1>ArthSaathi</h1>
  <p><em>Your personal AI-powered financial companion for Indian youth.</em></p>

  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-F54F3D?style=flat" alt="Groq">
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat&logo=vercel" alt="Vercel">
</div>

---

## 📖 Overview

**ArthSaathi** ("Arth" = money, "Saathi" = companion) is a multilingual personal finance app built for Indian youth. It helps users track income and daily expenses, set savings goals, generate monthly financial health reports, and talk to an AI coach that gives personalised short-term and long-term financial plans — all in one place.

Built for the **AI Hackathon**, the app is fully deployed on Vercel with a Supabase PostgreSQL backend.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Monthly Planner** | Input income and category-wise expenses to generate a financial health score |
| 📅 **Daily Tracker** | Log daily expenses with custom categories and allocate to goals in real-time |
| 🎯 **Goals** | Set savings goals with target dates; track weekly progress |
| 📈 **Report** | Visual financial health report with score breakdown, savings rate, EMI ratio, and spending analysis |
| 🤖 **AI Coach** | Chat with ArthSaathi AI (LLaMA 3.3 70B via Groq) — send your monthly report for personalised short-term & long-term saving plans |
| 📥 **Goal Import** | AI-suggested goals from analysis can be imported to the Goals section with one click |
| 💬 **Persistent Chat** | Coach conversations persist per user in Supabase — survive page reloads across all devices |
| 👤 **Profile** | Manage name, language (EN / हिं / தமிழ் / मराठी), currency (₹ / $), number system (Indian / International), and display density |
| 🔐 **Auth** | Supabase email/password authentication with protected routes |
| 🌍 **Multilingual** | Full UI translation across all 4 pages in English, Hindi, Tamil, and Marathi |
| 🗑️ **Account Deletion** | Wipes all user data from Supabase (goals, entries, reports, categories, chat) |

---

## 🏗️ Project Structure

```
AI-Hackathon-Project/
├── public/
│   └── logo.png                  # ArthSaathi logo
├── src/
│   ├── App.jsx                   # Routes & global layout
│   ├── main.jsx                  # React entry point
│   ├── index.css                 # Global styles & Tailwind base
│   ├── context/
│   │   ├── AuthContext.jsx       # Supabase auth session provider
│   │   └── LanguageContext.jsx   # Language / currency / number format provider
│   ├── components/
│   │   ├── Sidebar.jsx           # App navigation sidebar
│   │   ├── Navbar.jsx            # Top navbar (mobile)
│   │   └── ProtectedRoute.jsx    # Auth guard for private routes
│   ├── pages/
│   │   ├── LandingPage.jsx       # Public landing page
│   │   ├── AuthPage.jsx          # Login / Sign up
│   │   ├── DashboardPage.jsx     # Monthly planner + Daily tracker
│   │   ├── GoalsPage.jsx         # Savings goals tracker
│   │   ├── ReportPage.jsx        # Financial health report
│   │   ├── CoachPage.jsx         # AI chat coach with report analysis
│   │   └── ProfilePage.jsx       # User settings & account management
│   └── lib/
│       ├── supabaseClient.js     # Supabase client initialisation
│       ├── db.js                 # All Supabase read/write functions
│       └── translations.js       # All UI strings in EN / हिं / தமிழ் / मराठी
├── supabase_setup.sql            # SQL to create all tables + RLS policies
├── tailwind.config.js
├── vite.config.js
├── postcss.config.js
└── .env.local                    # (gitignored) — see Environment Variables
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-username/AI-Hackathon-Project.git
cd AI-Hackathon-Project

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your keys (see below)

# 4. Set up Supabase tables
# Run supabase_setup.sql in your Supabase SQL Editor

# 5. Start the dev server
npm run dev
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GROQ_API_KEY=your-groq-api-key
```

> ⚠️ Never commit `.env.local` — it is gitignored by default.

---

## 🗄️ Database Setup

Run the contents of `supabase_setup.sql` in your **Supabase SQL Editor** to create all required tables with Row Level Security:

| Table | Purpose |
|---|---|
| `monthly_reports` | Stores income + expense breakdowns per user |
| `daily_entries` | Individual daily expense logs |
| `goals` | Savings goals with target amount, date, and weekly history |
| `custom_categories` | User-defined expense categories |
| `hidden_categories` | Records which default categories a user has hidden |
| `coach_messages` | Persisted AI coach chat history per user |

Additionally, run this SQL for the `coach_messages` table (if not already in `supabase_setup.sql`):

```sql
CREATE TABLE coach_messages (
    id              bigserial PRIMARY KEY,
    user_id         uuid REFERENCES auth.users NOT NULL,
    role            text NOT NULL CHECK (role IN ('user', 'ai')),
    content         text NOT NULL,
    tags            jsonb DEFAULT '[]',
    suggested_goals jsonb DEFAULT '[]',
    is_report_msg   boolean DEFAULT false,
    is_analysis     boolean DEFAULT false,
    created_at      timestamptz DEFAULT now()
);

ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own messages"
    ON coach_messages FOR ALL USING (auth.uid() = user_id);
```

---

## 🌐 Deployment (Vercel)

1. Push your repo to GitHub
2. Import the project in [vercel.com](https://vercel.com)
3. Add the following **Environment Variables** in Vercel project settings:

   | Key | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `VITE_GROQ_API_KEY` | Your Groq API key |

4. Deploy — Vercel will run `npm run build` automatically.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5 |
| **Styling** | Tailwind CSS 3, Framer Motion |
| **Icons** | Lucide React |
| **Routing** | React Router DOM v7 |
| **Backend / DB** | Supabase (PostgreSQL + Auth + RLS) |
| **AI** | Groq API — LLaMA 3.3 70B Versatile |
| **Deployment** | Vercel |

---

## 📜 License

MIT — feel free to fork and build on top of this.

---

<div align="center">
  <p>Made with ❤️ for Indian youth, by Indian youth.</p>
  <p><strong>ArthSaathi</strong> — Start telling your money where to go.</p>
</div>
