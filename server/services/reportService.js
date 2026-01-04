const { latestSubmission } = require('./symptomService');
const { bookings } = require('./bookingService');
const { escapeHtml } = require('./utils');
const { getReportTemplates } = require('./excelKnowledgeService');

function latestBooking() {
  if (!bookings.length) return null;
  return bookings[bookings.length - 1];
}

function generateReportHtml() {
  const symptomData = latestSubmission();
  const booking = latestBooking();
  const template = (getReportTemplates() || [])[0];

  if (!symptomData && !booking) {
    const templateLines =
      template && template.sections && template.sections.lines && template.sections.lines.length
        ? `<div class="template-block"><h4>Sample Assessment</h4><p>${template.sections.lines.join('<br>')}</p></div>`
        : '';
    return `
      <div class="card error">No data available yet. Submit symptoms or book an appointment first.</div>
      ${templateLines}
    `;
  }

  return `
    <div class="card report-card">
      <h3>Consultation Report (Demo)</h3>
      <p class="muted">Not for real medical use.</p>
      ${
        symptomData
          ? `
        <h4>Symptoms</h4>
        <ul>
          <li><strong>Name:</strong> ${escapeHtml(symptomData.name)}, Age ${escapeHtml(symptomData.age)}</li>
          <li><strong>Description:</strong> ${escapeHtml(symptomData.description)}</li>
          <li><strong>Duration/Onset:</strong> ${escapeHtml(symptomData.duration)} / ${escapeHtml(
              symptomData.onset
            )}</li>
          <li><strong>Severity:</strong> ${escapeHtml(symptomData.severity)}</li>
          <li><strong>Associated:</strong> ${escapeHtml(symptomData.associatedSymptoms || 'None')}</li>
          <li><strong>Notes:</strong> ${escapeHtml(symptomData.notes || 'None')}</li>
        </ul>
      `
          : ''
      }
      ${
        booking
          ? `
        <h4>Appointment</h4>
        <ul>
          <li><strong>Patient:</strong> ${escapeHtml(booking.name)}</li>
          <li><strong>Doctor:</strong> ${escapeHtml(booking.doctorName)}</li>
          <li><strong>Date/Time:</strong> ${escapeHtml(booking.date)} at ${escapeHtml(booking.time)}</li>
          <li><strong>Contact:</strong> ${escapeHtml(booking.phone)}</li>
          <li><strong>Notes:</strong> ${escapeHtml(booking.notes || 'None')}</li>
        </ul>
      `
          : ''
      }
      ${
        template && template.sections && template.sections.lines && template.sections.lines.length
          ? `
        <h4>Reference Template (Excel)</h4>
        <p>${template.sections.lines.map((l) => escapeHtml(l)).join('<br>')}</p>
      `
          : ''
      }
      <div class="card-footer">Generated for training purposes only.</div>
    </div>
  `;
}

module.exports = { generateReportHtml, latestBooking };
