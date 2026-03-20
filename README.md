# EventFlow Analytics

A full-stack event analytics platform that helps event organizers manage events, track participant engagement, and get AI-powered recommendations — all from a single dashboard.

## Features

- **Event Management** — Create, update, and delete events with details like category, location, and dates
- **Participant Registration** — Register participants for events and track their data
- **Analytics Dashboard** — Visualize views, registrations, activity over time, age distribution, and events by category
- **ML-Powered Recommendations** — Get smart suggestions on the best day, category, and timing for future events based on past engagement
- **JWT Authentication** — Secure login and registration with role-based access

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS, Recharts |
| Backend | Node.js, Express 5, JWT, bcryptjs |
| Database | PostgreSQL |
| ML Service | Python, Flask, scikit-learn, pandas, numpy |

## Project Structure

```
event-analytics-platform/
├── backend/              # Express REST API
│   └── src/
│       ├── config/       # Database connection
│       ├── controllers/  # Route handlers (auth, events, analytics)
│       ├── middleware/   # JWT auth middleware
│       ├── routes/       # API routes
│       └── server.js
├── frontend/             # Next.js app
│   └── src/
│       ├── app/          # Pages (dashboard, events, analytics, recommendations)
│       ├── components/   # Navbar
│       ├── context/      # Auth context
│       └── lib/          # API client
├── ml-service/           # Flask recommendation engine
│   ├── app.py
│   ├── recommendations.py
│   └── requirements.txt
└── database/
    └── schema.sql        # PostgreSQL schema
```

## Getting Started

### Prerequisites

- Node.js >= 18
- Python >= 3.10
- PostgreSQL

### 1. Database Setup

Create a PostgreSQL database and run the schema:

```bash
psql -U postgres -c "CREATE DATABASE eventflow;"
psql -U postgres -d eventflow -f database/schema.sql
```

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/eventflow
JWT_SECRET=your_jwt_secret
```

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

### 3. ML Service

```bash
cd ml-service
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

Create a `.env` file in `ml-service/`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/eventflow
FLASK_PORT=5001
```

```bash
python app.py
```

The ML service will be available at `http://localhost:5001`.

### 4. Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ML_URL=http://localhost:5001
```

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new organizer |
| POST | `/api/auth/login` | Login and receive a JWT token |

### Events
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | Get all events |
| POST | `/api/events` | Create a new event |
| GET | `/api/events/:id` | Get event by ID (logs a view) |
| PUT | `/api/events/:id` | Update an event |
| DELETE | `/api/events/:id` | Delete an event |
| POST | `/api/events/:id/register` | Register a participant |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/dashboard` | Get dashboard stats for the logged-in organizer |
| GET | `/api/analytics/event/:id` | Get analytics for a specific event |

### ML Recommendations
| Method | Endpoint | Description |
|---|---|---|
| GET | `/recommendations/:organizer_id` | Get all recommendations |
| GET | `/recommendations/:organizer_id/day` | Best day to host an event |
| GET | `/recommendations/:organizer_id/category` | Best event category |
| GET | `/recommendations/:organizer_id/timing` | Best timing recommendation |
| GET | `/recommendations/:organizer_id/engagement` | Engagement insights |
