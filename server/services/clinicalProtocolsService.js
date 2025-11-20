const { clinicalProtocols } = require('../data/clinicalProtocols');
const { escapeHtml } = require('./utils');

function findProtocol(query = '') {
  const normalized = String(query).toLowerCase();
  if (normalized.includes('stroke')) return clinicalProtocols.find((p) => p.id === 'stroke');
  if (normalized.includes('allergic') || normalized.includes('anaphylaxis'))
    return clinicalProtocols.find((p) => p.id === 'allergic-reaction');
  if (normalized.includes('coma') || normalized.includes('unresponsive'))
    return clinicalProtocols.find((p) => p.id === 'coma');
  return null;
}

function protocolHtml(protocol) {
  if (!protocol) return '<div class="card error">No matching protocol found for that query.</div>';
  const steps = protocol.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  return `
    <div class="card protocol-card">
      <h4>${escapeHtml(protocol.name)}</h4>
      <ol>${steps}</ol>
      <div class="card-footer">Demo protocol. Confirm with on-call physician.</div>
    </div>
  `;
}

module.exports = { findProtocol, protocolHtml, clinicalProtocols };
