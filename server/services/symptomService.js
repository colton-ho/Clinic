const { escapeHtml } = require('./utils');

const symptomSubmissions = [];

function validateSymptomPayload(body = {}) {
  const required = ['name', 'age', 'description', 'severity'];
  const missing = required.filter((field) => !body[field]);
  if (missing.length) {
    return `Missing required fields: ${missing.join(', ')}`;
  }
  return null;
}

function addSymptomSubmission(body) {
  const error = validateSymptomPayload(body);
  if (error) {
    return { error };
  }
  const submission = {
    id: `SYM-${symptomSubmissions.length + 1}`,
    name: body.name,
    age: body.age,
    duration: body.duration || 'Unspecified',
    description: body.description,
    onset: body.onset || 'Unspecified',
    severity: body.severity,
    associatedSymptoms: body.associatedSymptoms || '',
    notes: body.notes || '',
    createdAt: new Date().toISOString()
  };
  symptomSubmissions.push(submission);
  return { submission };
}

function latestSubmission() {
  if (!symptomSubmissions.length) return null;
  return symptomSubmissions[symptomSubmissions.length - 1];
}

function summaryHtml(submission) {
  if (!submission) return '<div class="card error">No symptoms captured yet.</div>';
  return `
    <div class="card">
      <h4>Symptoms captured</h4>
      <p><strong>Name:</strong> ${escapeHtml(submission.name)}, <strong>Age:</strong> ${escapeHtml(submission.age)}</p>
      <p><strong>Description:</strong> ${escapeHtml(submission.description)}</p>
      <p><strong>Duration:</strong> ${escapeHtml(submission.duration)} · <strong>Onset:</strong> ${escapeHtml(
        submission.onset
      )}</p>
      <p><strong>Severity:</strong> ${escapeHtml(submission.severity)}</p>
      <p><strong>Associated:</strong> ${escapeHtml(submission.associatedSymptoms || 'None')}</p>
      <p><strong>Notes:</strong> ${escapeHtml(submission.notes || 'None')}</p>
      <div class="card-footer">Thank you. A clinician will review.</div>
    </div>
  `;
}

module.exports = {
  addSymptomSubmission,
  latestSubmission,
  summaryHtml,
  symptomSubmissions
};
