const { patients } = require('../data/patients');
const { escapeHtml, formatList } = require('./utils');

function findById(id) {
  return patients.find((p) => p.id.toLowerCase() === String(id).toLowerCase());
}

function findByName(name) {
  const query = String(name).toLowerCase();
  return patients.find((p) => p.name.toLowerCase().includes(query));
}

function findByQuery(rawQuery = '') {
  const query = String(rawQuery).trim().toLowerCase();
  if (!query) return null;
  const idMatch = query.match(/p[-\s]?0{0,2}\d{1,3}/i);
  if (idMatch) {
    const id = idMatch[0].toUpperCase().replace(/\s/, '');
    const match = findById(id);
    if (match) return match;
  }
  return findByName(query);
}

function patientCardHtml(patient) {
  if (!patient) return '<div class="card error">No matching patient record found.</div>';
  return `
    <div class="card patient-card">
      <div class="card-header">
        <div>
          <h4>${escapeHtml(patient.name)} <span class="muted">(${escapeHtml(patient.id)})</span></h4>
          <p class="muted">DOB: ${escapeHtml(patient.dob)} · ${escapeHtml(patient.gender)}</p>
        </div>
        <div class="tag">Primary: ${escapeHtml(patient.primary_doctor)}</div>
      </div>
      <div class="card-body">
        <p><strong>Phone:</strong> ${escapeHtml(patient.phone)}</p>
        <p><strong>Address:</strong> ${escapeHtml(patient.address)}</p>
        <p><strong>Medications:</strong> ${escapeHtml(formatList(patient.medications))}</p>
        <p><strong>History:</strong> ${escapeHtml(formatList(patient.medical_history))}</p>
        <p><strong>Vitals:</strong> BP ${escapeHtml(patient.vitals.bp)}, HR ${escapeHtml(patient.vitals.hr)} bpm, Temp ${escapeHtml(patient.vitals.temp)}</p>
        <p><strong>Last visit:</strong> ${escapeHtml(patient.last_visit)}</p>
        <p class="muted">${escapeHtml(patient.notes)}</p>
      </div>
      <div class="card-footer">Demo data only — not for real clinical use.</div>
    </div>
  `;
}

module.exports = {
  patients,
  findById,
  findByName,
  findByQuery,
  patientCardHtml
};
