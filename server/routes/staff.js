const express = require('express');
const { findByQuery, patientCardHtml, findById } = require('../services/patientsService');
const { summaryHtml: analyticsHtml } = require('../services/analyticsService');
const { generateContent: marketingHtml } = require('../services/marketingService');
const { findProtocol, protocolHtml } = require('../services/clinicalProtocolsService');
const { generateLLMReply } = require('../services/llmService');

const router = express.Router();

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
