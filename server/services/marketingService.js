const { marketingTemplates } = require('../data/marketingTemplates');
const { escapeHtml } = require('./utils');

function generateContent(query = '') {
  const normalized = String(query).toLowerCase();
  let template = marketingTemplates[0];
  if (normalized.includes('newsletter')) template = marketingTemplates.find((t) => t.id === 'newsletter') || template;
  if (normalized.includes('sms')) template = marketingTemplates.find((t) => t.id === 'sms') || template;

  return `
    <div class="card">
      <h4>${escapeHtml(template.title)}</h4>
      <p>${escapeHtml(template.content)}</p>
      <div class="card-footer">Generated from demo template.</div>
    </div>
  `;
}

module.exports = { generateContent, marketingTemplates };
