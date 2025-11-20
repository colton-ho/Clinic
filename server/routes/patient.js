const express = require('express');
const { doctors, timeSlots } = require('../data/doctors');
const { addSymptomSubmission, summaryHtml: symptomSummaryHtml } = require('../services/symptomService');
const { generateReportHtml } = require('../services/reportService');
const { generateLLMReply } = require('../services/llmService');

const router = express.Router();

const clinicInfoHtml = `
  <div class="card">
    <h4>Clinic Info</h4>
    <p>We are open Mon-Fri 8am–6pm, Sat 9am–2pm.</p>
    <p>Address: 123 Wellness Blvd, Springfield. Phone: +1 (555) 555-0100</p>
    <p class="muted">This chatbot is for demo purposes and not medical advice.</p>
  </div>
`;

function symptomFormHtml() {
  return `
    <div class="card">
      <h4>Tell us about your symptoms</h4>
      <form id="symptom-form" class="chat-form">
        <div class="two-col">
          <label>Name<input required name="name" /></label>
          <label>Age<input required name="age" type="number" min="1" /></label>
        </div>
        <label>Duration<input name="duration" placeholder="e.g., 3 days" /></label>
        <label>Description<textarea required name="description" placeholder="Describe your symptoms"></textarea></label>
        <label>Onset<input name="onset" placeholder="sudden / gradual" /></label>
        <label>Severity<select name="severity" required>
          <option value="">Choose</option>
          <option>Mild</option>
          <option>Moderate</option>
          <option>Severe</option>
        </select></label>
        <label>Associated symptoms<input name="associatedSymptoms" placeholder="e.g., fever, nausea" /></label>
        <label>Notes<textarea name="notes" placeholder="Anything else we should know?"></textarea></label>
        <button type="submit" class="primary-btn">Submit symptoms</button>
      </form>
      <div class="card-footer">Do not submit real PHI — demo only.</div>
    </div>
  `;
}

function bookingFormHtml() {
  const doctorOptions = doctors.map((d) => `<option value="${d.id}">${d.name} (${d.specialty})</option>`).join('');
  const dateOptions = [...new Set(timeSlots.map((s) => s.date))]
    .map((d) => `<option>${d}</option>`)
    .join('');

  return `
    <div class="card">
      <h4>Book an appointment</h4>
      <form id="booking-form" class="chat-form">
        <label>Name<input required name="name" /></label>
        <label>Phone<input required name="phone" /></label>
        <label>Doctor<select required name="doctorId"><option value="">Choose</option>${doctorOptions}</select></label>
        <label>Date<select required name="date"><option value="">Pick a date</option>${dateOptions}</select></label>
        <label>Time<input required name="time" placeholder="e.g., 09:00" /></label>
        <label>Notes<textarea name="notes" placeholder="Optional notes"></textarea></label>
        <button type="submit" class="primary-btn">Confirm booking</button>
      </form>
      <div class="card-footer">Demo scheduler — staff will confirm.</div>
    </div>
  `;
}

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const query = String(message).toLowerCase();

    if (query.includes('hour') || query.includes('open') || query.includes('location') || query.includes('address')) {
      return res.json({ replyHtml: clinicInfoHtml });
    }

    if (query.includes('symptom') || query.includes('feel') || query.includes('pain') || query.includes('cough')) {
      return res.json({ replyHtml: symptomFormHtml() });
    }

    if (query.includes('book') || query.includes('appointment') || query.includes('schedule')) {
      return res.json({ replyHtml: bookingFormHtml() });
    }

    if (query.includes('report')) {
      return res.json({ replyHtml: generateReportHtml() });
    }

    const llmReply = await generateLLMReply('patient', message);
    return res.json({
      replyHtml: `<div class="card"><p>${llmReply}</p><div class="card-footer">Demo only — not medical advice.</div></div>`
    });
  } catch (err) {
    console.error('Patient chat error', err);
    res.status(500).json({ error: 'Server error handling patient chat' });
  }
});

router.post('/symptoms', (req, res) => {
  const { submission, error } = addSymptomSubmission(req.body || {});
  if (error) return res.status(400).json({ error });
  return res.json({ replyHtml: symptomSummaryHtml(submission), submission });
});

module.exports = router;
