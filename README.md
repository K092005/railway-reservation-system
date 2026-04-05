# 🚆 Railway Reservation System

A full-stack railway booking platform built with **OOP principles**, featuring AI-powered fare prediction.

## Tech Stack

- **Database** — MySQL (stored procedures, triggers)
- **Backend** — Node.js, Express, JWT Auth
- **Frontend** — Next.js 15, React
- **AI/ML** — Python, FastAPI, scikit-learn

## OOP Concepts Used

- **Classes & Objects** — User, Train, Booking, Ticket, Payment
- **Encapsulation** — Private fields with getters/setters
- **Inheritance** — Admin extends User, ACTicket extends Ticket
- **Polymorphism** — calculateFare(), generateTransactionId()

## Features

- User registration & login (JWT)
- Train search across 15+ stations
- Real-time seat availability
- Multi-passenger ticket booking
- Payment simulation (UPI, Card, Net Banking)
- Booking history & cancellation
- AI fare prediction (Gradient Boosting)
- Demand analysis (Random Forest)

## How to Run

### 1. Setup Database
```bash
mysql -u root < database/schema.sql
mysql -u root < database/stored_procedures.sql
mysql -u root < database/triggers.sql
mysql -u root < database/seed_data.sql
```

### 2. Backend
```bash
cd backend
npm install
node server.js          # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev             # http://localhost:3000
```

### 4. AI Service (Optional)
```bash
cd ai-service
pip install -r requirements.txt
python main.py          # http://localhost:8000
```

## Project Structure

```
railway-reservation/
├── database/           # SQL schema, stored procedures, triggers, seed data
├── backend/            # Node.js REST API with OOP models
├── frontend/           # Next.js 15 with glassmorphism UI
├── ai-service/         # Python FastAPI ML service
└── README.md
```

---
Built with Node.js • Next.js • MySQL • FastAPI • scikit-learn
