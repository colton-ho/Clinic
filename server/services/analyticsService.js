const { analytics } = require('../data/analytics');

function summaryHtml() {
  const sparkline = analytics.monthlyVisits
    .map((m) => `<div class="spark-bar" title="${m.month}: ${m.visits}">${m.visits}</div>`)
    .join('');

  return `
    <div class="card analytics-card">
      <h4>Operational Analytics</h4>
      <ul class="metric-list">
        <li><strong>Avg wait:</strong> ${analytics.avgWaitTimeMinutes} min</li>
        <li><strong>Satisfaction:</strong> ${analytics.satisfactionScore}/5</li>
        <li><strong>Admissions (24h):</strong> ${analytics.admissionsLast24h}</li>
        <li><strong>Top conditions:</strong> ${analytics.topConditions.join(', ')}</li>
      </ul>
      <div class="sparkline">${sparkline}</div>
      <div class="card-footer">Demo metrics only.</div>
    </div>
  `;
}

module.exports = { summaryHtml, analytics };
