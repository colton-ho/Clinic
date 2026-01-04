const express = require('express');
const { findByQuery, patientCardHtml, findById } = require('../services/patientsService');
const { summaryHtml: analyticsHtml } = require('../services/analyticsService');
const { generateContent: marketingHtml } = require('../services/marketingService');
const { findProtocol, protocolHtml } = require('../services/clinicalProtocolsService');
const { generateLLMReply } = require('../services/llmService');
const { searchFaqs, getStaffFaqs, getBookingScript } = require('../services/excelKnowledgeService');

const router = express.Router();

function faqHtml(hit) {
  if (!hit) return '<div class="card error">No matching FAQ found.</div>';
  return `
    <div class="card">
      <h4>${hit.category}</h4>
      <p><strong>Q:</strong> ${hit.item.question}</p>
      <p><strong>A:</strong> ${hit.item.answer}</p>
      <div class="card-footer">From internal enquiries (Excel knowledge base).</div>
    </div>
  `;
}

function bookingScriptHtml(script = []) {
  if (!script.length) return '<div class="card error">No booking script found.</div>';
  const steps = script
    .map(
      (s) => `
      <li>
        <strong>${s.stepNumber} – ${s.category}</strong><br>
        ${s.prompt || 'Prompt N/A'}<br>
        ${s.options && s.options.length ? `<em>Options:</em> ${s.options.join(' | ')}` : ''}
      </li>`
    )
    .join('');
  return `
    <div class="card">
      <h4>Booking Script (Excel)</h4>
      <ol>${steps}</ol>
      <div class="card-footer">Sourced from booking sheet.</div>
    </div>
  `;
}

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const query = String(message).toLowerCase();

    if (
      query.includes('find patient') ||
      query.includes('show patient') ||
      query.includes('patient record') ||
      query.match(/p[-\s]?0{0,2}\d{1,3}/i)
    ) {
      const patient = findByQuery(message);
      return res.json({ replyHtml: patientCardHtml(patient) });
    }

    if (query.includes('analytics') || query.includes('statistics') || query.includes('wait time')) {
      return res.json({ replyHtml: analyticsHtml() });
    }

    if (query.includes('marketing') || query.includes('social') || query.includes('campaign')) {
      return res.json({ replyHtml: marketingHtml(message) });
    }

    if (query.includes('protocol') || query.includes('coma') || query.includes('stroke') || query.includes('allergic')) {
      const protocol = findProtocol(message);
      return res.json({ replyHtml: protocolHtml(protocol) });
    }

    if (query.includes('booking script') || query.includes('booking flow')) {
      return res.json({ replyHtml: bookingScriptHtml(getBookingScript()) });
    }

    const faqHit = searchFaqs(getStaffFaqs(), message);
    if (faqHit) {
      return res.json({ replyHtml: faqHtml(faqHit) });
    }

    const llmReply = await generateLLMReply('staff', message);
    return res.json({
      replyHtml: `<div class="card"><p>${llmReply}</p><div class="card-footer">Demo assistant only.</div></div>`
    });
  } catch (err) {
    console.error('Staff chat error', err);
    res.status(500).json({ error: 'Server error handling staff chat' });
  }
});

router.get('/patients/:id', (req, res) => {
  const patient = findById(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  return res.json(patient);
});

module.exports = router;
