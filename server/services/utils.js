function escapeHtml(input = '') {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatList(items = []) {
  return items && items.length ? items.join(', ') : 'None noted';
}

module.exports = { escapeHtml, formatList };
