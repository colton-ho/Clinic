const { doctors, timeSlots } = require('../data/doctors');
const { escapeHtml } = require('./utils');

const bookings = [];

function validateBookingPayload(body = {}) {
  const required = ['name', 'phone', 'doctorId', 'date', 'time'];
  const missing = required.filter((field) => !body[field]);
  if (missing.length) {
    return `Missing required fields: ${missing.join(', ')}`;
  }
  return null;
}

function slotExists(doctorId, date, time) {
  const daySlots = timeSlots.find((s) => s.doctorId === doctorId && s.date === date);
  return Boolean(daySlots && daySlots.times.includes(time));
}

function isSlotTaken(doctorId, date, time) {
  return bookings.some((b) => b.doctorId === doctorId && b.date === date && b.time === time);
}

function addBooking(body) {
  const validationError = validateBookingPayload(body);
  if (validationError) return { error: validationError };

  const { doctorId, date, time } = body;
  if (!slotExists(doctorId, date, time)) {
    return { error: 'Requested time slot is not available.' };
  }
  if (isSlotTaken(doctorId, date, time)) {
    return { error: 'That time slot is already booked.' };
  }
  const doctor = doctors.find((d) => d.id === doctorId);
  const booking = {
    id: `BK-${bookings.length + 1}`,
    name: body.name,
    phone: body.phone,
    doctorId,
    doctorName: doctor ? doctor.name : 'Clinic Provider',
    date,
    time,
    notes: body.notes || '',
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  return { booking };
}

function bookingConfirmationHtml(booking) {
  if (!booking) return '<div class="card error">No booking found.</div>';
  return `
    <div class="card">
      <h4>Appointment booked</h4>
      <p><strong>Patient:</strong> ${escapeHtml(booking.name)}</p>
      <p><strong>Doctor:</strong> ${escapeHtml(booking.doctorName)}</p>
      <p><strong>Date/Time:</strong> ${escapeHtml(booking.date)} at ${escapeHtml(booking.time)}</p>
      <p><strong>Contact:</strong> ${escapeHtml(booking.phone)}</p>
      <p><strong>Notes:</strong> ${escapeHtml(booking.notes || 'None')}</p>
      <div class="card-footer">Demo only — front desk will confirm by phone.</div>
    </div>
  `;
}

module.exports = {
  bookings,
  doctors,
  timeSlots,
  addBooking,
  isSlotTaken,
  slotExists,
  bookingConfirmationHtml
};
