# 💰 Smart Expense Tracker (MERN + AI Chatbot)

An intelligent, full-stack personal finance application built with the **MERN** stack (MongoDB, Express, React, Node.js), featuring JWT authentication, comprehensive expense management, database-level analytics aggregations, and an **AI Chatbot powered by Google Gemini API (Flash model)** that answers natural-language questions about your spending.

---

## 🚀 Live Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite | High-performance SPA with client-side routing |
| **Routing** | React Router v6 | Declarative routing with protected session guards |
| **Styling** | Tailwind CSS | Curated dark mode, glassmorphism, glowing accents |
| **Visualizations** | Recharts | Interactive Donut/Pie charts & 6-month Area/Bar trends |
| **Icons** | Lucide React | Modern, crisp financial & UI iconography |
| **HTTP Client** | Axios | Configured with automatic JWT auth & 401 interceptors |
| **Backend** | Node.js, Express.js | RESTful API with modular MVC architecture |
| **Database** | MongoDB & Mongoose | Indexed schemas & multi-stage `$match`/`$group` pipelines |
| **Authentication**| JWT + bcryptjs | Secure salted password hashing and Bearer tokens |
| **AI Engine** | Google Gemini API (Flash) | Server-side financial context synthesis + LLM inference |

---

## 📂 Project Structure

```
expence tracker/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Me endpoints
│   │   ├── expenseController.js  # CRUD, pagination, filtering, search
│   │   ├── analyticsController.js# MongoDB Aggregation pipelines
│   │   └── chatController.js     # Context aggregator + Gemini Flash API
│   ├── middleware/
│   │   ├── auth.js               # JWT verification middleware
│   │   └── errorHandler.js       # Centralized JSON error handler
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt hooks
│   │   └── Expense.js            # Expense schema with enum & indexes
│   ├── routes/
│   │   ├── auth.js               # /api/auth routes
│   │   ├── expenses.js           # /api/expenses routes
│   │   ├── analytics.js          # /api/analytics routes
│   │   └── chat.js               # /api/chat route
│   ├── scripts/
│   │   ├── seed.js               # Database seeder with realistic sample records
│   │   └── testEndpoints.js      # Automated backend integration test suite
│   ├── .env.example              # Environment variables template
│   ├── .env                      # Local environment configuration
│   ├── package.json
│   └── server.js                 # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js          # Configured Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Responsive navigation with AI highlights
│   │   │   ├── ExpenseModal.jsx  # Add/Edit expense modal with category chips
│   │   │   ├── CategoryBadge.jsx # Color-coded category tags with icons
│   │   │   ├── StatCard.jsx      # Glassmorphic KPI metric cards
│   │   │   └── ProtectedRoute.jsx# Auth route wrapper
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state & token persistence
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Auth page with "Fill Demo Account" helper
│   │   │   ├── Signup.jsx        # Registration with validations
│   │   │   ├── Dashboard.jsx     # Financial overview & quick AI input
│   │   │   ├── Expenses.jsx      # Full CRUD with filters & pagination
│   │   │   ├── Analytics.jsx     # Recharts Category Donut & 6-Month Trend
│   │   │   └── Chat.jsx          # "Ask your expenses" Gemini AI chat interface
│   │   ├── App.jsx               # Routes setup
│   │   ├── main.jsx              # React DOM render
│   │   └── index.css             # Tailwind + custom glassmorphism styles
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## ⚡ Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or later (`node -v`)
- **npm**: v9.0.0 or later (`npm -v`)
- **MongoDB**: Local MongoDB community service running at `mongodb://127.0.0.1:27017` or a free cloud MongoDB Atlas cluster URI.

---

## 🛠️ Step-by-Step Installation & Setup

### 1. Configure the Backend

```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

Edit `backend/.env` with your values:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/expense_tracker
JWT_SECRET=super_secret_jwt_key_smart_expense_tracker_2026
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note on Gemini API Key:** You can obtain a free API key instantly at [Google AI Studio](https://aistudio.google.com/). If left blank or unconfigured, the app features an intelligent server-side fallback engine so that all AI chat features remain testable without errors.

#### (Optional) Seed the Database with Realistic Demo Data:
To test the analytics charts and AI chatbot with 30 diverse multi-month transactions:
```bash
npm run seed
```
> Demo credentials created: `demo@expensetracker.com` / `password123`

#### Start the Backend Server:
```bash
npm start
# or for live watch mode:
npm run dev
```
Backend will start on `http://localhost:5000` with status messages.

---

### 2. Configure & Run the Frontend

In a new terminal window:
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend will be running on `http://localhost:5173`.

---

## 🧪 Running Automated Verification Tests

The backend includes a comprehensive automated test script that exercises all 10 API endpoints:
```bash
cd backend
node scripts/testEndpoints.js
```
**Tests Verified:**
1. Health check (`/api/health`)
2. User registration (`POST /api/auth/register`)
3. User login (`POST /api/auth/login`)
4. Current profile retrieval (`GET /api/auth/me`)
5. Expense creation with positive validations (`POST /api/expenses`)
6. Expense pagination, category filter & search (`GET /api/expenses`)
7. Expense update (`PUT /api/expenses/:id`)
8. MongoDB aggregation analytics (`GET /api/analytics/summary`)
9. Gemini AI chatbot inference (`POST /api/chat`)
10. Expense deletion (`DELETE /api/expenses/:id`)

---

## 🧠 Technical Highlights for Interview

### 1. MongoDB Aggregation Pipeline Architecture
Rather than retrieving raw documents and performing calculations in JavaScript (which leads to severe memory and performance bottlenecks on large datasets), the application leverages native multi-stage MongoDB aggregations:

```javascript
// Category-wise Breakdown Pipeline
[
  { $match: { userId: userObjectId } },
  { $group: {
      _id: '$category',
      totalAmount: { $sum: '$amount' },
      count: { $sum: 1 }
    }
  },
  { $sort: { totalAmount: -1 } },
  { $project: {
      _id: 0,
      category: '$_id',
      totalAmount: { $round: ['$totalAmount', 2] },
      count: 1
    }
  }
]
```

```javascript
// 6-Month Monthly Trend Pipeline
[
  { $match: { userId: userObjectId, date: { $gte: sixMonthsAgo } } },
  { $group: {
      _id: {
        year: { $year: '$date' },
        month: { $month: '$date' }
      },
      totalAmount: { $sum: '$amount' },
      count: { $sum: 1 }
    }
  },
  { $sort: { '_id.year': 1, '_id.month': 1 } }
]
```

### 2. AI Chatbot Context Synthesis
When a user asks `"How much did I spend on Food this month?"` or `"What are my highest expenses?"`:
1. The backend authenticates the user via JWT.
2. An aggregation pipeline generates a compact financial summary (Current Month Spend, Category Totals, Lifetime Spend, and the last 20 Transactions).
3. A strict system prompt feeds the structured JSON context into Google Gemini Flash, instructing the model to answer **only** using this data and politely decline questions outside the domain.
4. The response is returned to the frontend as clean Markdown.

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`)
- `POST /api/auth/login` — Sign in (`email`, `password`)
- `GET /api/auth/me` — Get authenticated user details *(Protected)*

### Expenses
- `GET /api/expenses` — Query expenses (`page`, `limit`, `category`, `startDate`, `endDate`, `search`, `sortBy`, `sortOrder`) *(Protected)*
- `POST /api/expenses` — Create expense (`amount`, `category`, `description`, `date`) *(Protected)*
- `GET /api/expenses/:id` — Get expense by ID *(Protected)*
- `PUT /api/expenses/:id` — Update expense *(Protected)*
- `DELETE /api/expenses/:id` — Delete expense *(Protected)*

### Analytics
- `GET /api/analytics/summary` — Returns current month totals, 6-month trends, and category breakdown *(Protected)*

### AI Chatbot
- `POST /api/chat` — Body: `{ "message": "What is my biggest expense category?" }` *(Protected)*

---

## 🎨 UI & UX Design Highlights
- **Curated Palette**: Deep navy/slate dark mode with rich violet/brand accents and category color-coding.
- **Glassmorphism**: Backdrop blur modal windows, translucent card layers, and subtle ambient hover glows.
- **Micro-Interactions**: Animated chart tooltips, smooth table pagination, toast feedback, and AI thinking bubbles.
- **One-Click Demo Account**: Quickly evaluate all features using the **"Click to auto-fill seeded Demo Account"** button on the login screen.
