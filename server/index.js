const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const staffRoutes = require('./routes/staff');
const patientRoutes = require('./routes/patient');
const bookingRoutes = require('./routes/booking');
const reportRoutes = require('./routes/report');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic health endpoint for uptime checks
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'clinic-chatbot-demo' });
});

// API routes
app.use('/api/staff', staffRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/patient/bookings', bookingRoutes);
app.use('/api/patient/report', reportRoutes);

// Serve static frontend
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// Catch-all to serve SPA
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Clinic chatbot demo listening on http://localhost:${PORT}`);
});
