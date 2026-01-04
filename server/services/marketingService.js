const { escapeHtml } = require('./utils');
const { getMarketingMaterials } = require('./excelKnowledgeService');
const { marketingTemplates: fallbackTemplates } = require('../data/marketingTemplates');

function pickMarketingTemplate(query = '') {
  const knowledge = getMarketingMaterials();
  const normalized = String(query).toLowerCase();
  if (knowledge) {
    const usePromotion = normalized.includes('promotion') || normalized.includes('acquisition') || normalized.includes('campaign');
    return {
      source: 'excel',
      context: usePromotion ? knowledge.servicePromotion : knowledge.patientEducation,
      label: usePromotion ? knowledge.columns.servicePromotion : knowledge.columns.patientEducation
    };
  }
  // Fallback to old demo templates if Excel missing
  let template = fallbackTemplates[0];
  if (normalized.includes('newsletter')) template = fallbackTemplates.find((t) => t.id === 'newsletter') || template;
  if (normalized.includes('sms')) template = fallbackTemplates.find((t) => t.id === 'sms') || template;
  return { source: 'fallback', context: template, label: template.title };
}

function generateContent(query = '') {
  const selection = pickMarketingTemplate(query);
  const ctx = selection.context || {};

  if (selection.source === 'excel') {
    return `
      <div class="card">
        <h4>${escapeHtml(selection.label || 'Marketing Drafts')}</h4>
        ${ctx.goal ? `<p><strong>Goal:</strong> ${escapeHtml(ctx.goal)}</p>` : ''}
        ${ctx.smsDraft ? `<p><strong>SMS Draft:</strong><br>${escapeHtml(ctx.smsDraft)}</p>` : ''}
        ${ctx.socialPost ? `<p><strong>Social Post:</strong><br>${escapeHtml(ctx.socialPost)}</p>` : ''}
        ${ctx.leafletDraft ? `<p><strong>Leaflet Draft:</strong><br>${escapeHtml(ctx.leafletDraft)}</p>` : ''}
        <div class="card-footer">Content sourced from Excel knowledge base.</div>
      </div>
    `;
  }

  return `
    <div class="card">
      <h4>${escapeHtml(ctx.title)}</h4>
      <p>${escapeHtml(ctx.content)}</p>
      <div class="card-footer">Generated from demo template.</div>
    </div>
  `;
}

module.exports = { generateContent };
