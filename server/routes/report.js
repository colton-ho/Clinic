const express = require('express');
const { generateReportHtml } = require('../services/reportService');

const router = express.Router();

router.post('/', (_req, res) => {
  return res.json({ reportHtml: generateReportHtml() });
});

module.exports = router;
