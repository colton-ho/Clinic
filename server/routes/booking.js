const express = require('express');
const { addBooking, bookings, bookingConfirmationHtml, slotExists } = require('../services/bookingService');

const router = express.Router();

router.post('/', (req, res) => {
  const { booking, error } = addBooking(req.body || {});
  if (error) return res.status(400).json({ error });
  return res.json({ replyHtml: bookingConfirmationHtml(booking), booking });
});

router.get('/', (_req, res) => {
  return res.json({ bookings });
});

router.get('/availability/:doctorId/:date/:time', (req, res) => {
  const { doctorId, date, time } = req.params;
  const available = slotExists(doctorId, date, time);
  res.json({ available });
});

module.exports = router;
