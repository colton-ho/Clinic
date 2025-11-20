# Healthcare Plus Clinic – AI Chatbot Demo

Full-stack training demo that mirrors a clinic chatbot experience. A static frontend (staff + patient flows) talks to a Node.js + Express backend with rule-based logic and in-memory data. No real PHI; for demos only.

## Tech Stack
- Node.js + Express (backend)
- Vanilla HTML/CSS/JS (frontend served from `public/`)
- In-memory data modules for patients, analytics, protocols, bookings, and symptoms

## Getting Started
```bash
npm install
npm run dev   # starts Express with nodemon on http://localhost:3000
# or
npm start
```

## Environment
Copy `.env.example` to `.env` as needed:
```
PORT=3000
# OPENAI_API_KEY=your-key-here   # optional; llmService is stubbed by default
```

## API Overview
- `POST /api/staff/chat` – staff chatbot queries (patient lookup, analytics, marketing, protocols). Returns `{ replyHtml }`.
- `GET /api/staff/patients/:id` – fetch a demo patient record (JSON).
- `POST /api/patient/chat` – patient chatbot queries (info, symptom flow, booking flow, report). Returns `{ replyHtml }`.
- `POST /api/patient/symptoms` – submit symptom form; stores in memory. Returns `{ replyHtml, submission }`.
- `POST /api/patient/bookings` – create a booking if slot is valid and free. Returns `{ replyHtml, booking }`.
- `GET /api/patient/bookings` – list current in-memory bookings.
- `POST /api/patient/report` – generate a consultation report from stored symptom + booking data. Returns `{ reportHtml }`.
- `GET /health` – health check.

Responses are HTML snippets ready to insert into the chat UI to keep the prototype simple.

## Architecture
- `public/` – static frontend (role picker, staff and patient chat surfaces). Frontend uses `fetch` to call backend APIs and renders the returned HTML inside chat bubbles.
- `server/data/` – demo datasets (patients, doctors, analytics, marketing templates, clinical protocols).
- `server/services/` – business logic modules (lookup, analytics, marketing, protocols, symptoms, bookings, reports, optional LLM stub).
- `server/routes/` – Express routers for staff, patient, bookings, and reports.
- `server/index.js` – Express app wiring, static file serving, and route mounting.

## Safety Notes
- Do not use in production or for real medical advice.
- Inputs are minimally validated and escaped; still avoid real PHI.
- Any LLM integration is disabled by default and requires an API key plus careful review.
