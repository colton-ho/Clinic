// Application State
let currentRole = null;

// Generic helpers
async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {})
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error || 'Request failed';
    throw new Error(message);
  }
  return data;
}

function apiErrorCard(message) {
  return `<div class="card error">${message || 'Something went wrong. Please try again.'}</div>`;
}

// Role / navigation
function selectRole(role) {
  currentRole = role;
  document.getElementById('landing-page').classList.remove('active');

  if (role === 'staff') {
    document.getElementById('staff-page').classList.add('active');
    addStaffMessage(
      'bot',
      "Welcome to the Staff Dashboard! I can help with patient records, analytics, marketing content, and clinical protocols. What would you like to know?"
    );
  } else {
    document.getElementById('patient-page').classList.add('active');
    addPatientMessage(
      'bot',
      "Welcome to Healthcare Plus Clinic! I'm here to assist you. How can I help you today?"
    );
  }
}

function switchRole() {
  if (currentRole === 'staff') {
    document.getElementById('staff-page').classList.remove('active');
    document.getElementById('patient-page').classList.add('active');
    document.getElementById('patient-chat').innerHTML = '';
    currentRole = 'patient';
    addPatientMessage('bot', "Welcome to Healthcare Plus Clinic! I'm here to assist you. How can I help you today?");
  } else {
    document.getElementById('patient-page').classList.remove('active');
    document.getElementById('staff-page').classList.add('active');
    document.getElementById('staff-chat').innerHTML = '';
    currentRole = 'staff';
    addStaffMessage('bot', 'Welcome to the Staff Dashboard! Ask about patients, analytics, marketing, or protocols.');
  }
}

function logout() {
  currentRole = null;
  document.getElementById('staff-page').classList.remove('active');
  document.getElementById('patient-page').classList.remove('active');
  document.getElementById('landing-page').classList.add('active');
  document.getElementById('staff-chat').innerHTML = '';
  document.getElementById('patient-chat').innerHTML = '';
}

// Chat UI helpers
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function addStaffMessage(sender, content) {
  const chatDiv = document.getElementById('staff-chat');
  addMessage(chatDiv, sender, content);
}

function addPatientMessage(sender, content) {
  const chatDiv = document.getElementById('patient-chat');
  addMessage(chatDiv, sender, content);
}

function addMessage(chatDiv, sender, content) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = sender === 'user' ? '👤' : '🤖';

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';

  if (typeof content === 'string') {
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.innerHTML = content;
    contentDiv.appendChild(textDiv);
  } else if (content instanceof HTMLElement) {
    contentDiv.appendChild(content);
  }

  const timeDiv = document.createElement('div');
  timeDiv.className = 'message-time';
  timeDiv.textContent = getCurrentTime();
  contentDiv.appendChild(timeDiv);

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(contentDiv);
  chatDiv.appendChild(messageDiv);
  chatDiv.scrollTop = chatDiv.scrollHeight;
}

function quickQuery(query) {
  if (currentRole === 'staff') {
    sendStaffMessage(query);
  } else {
    sendPatientMessage(query);
  }
}

// Staff chat
function handleStaffKeyPress(event) {
  if (event.key === 'Enter') {
    sendStaffMessage();
  }
}

async function sendStaffMessage(manualMessage) {
  const input = document.getElementById('staff-input');
  const message = (manualMessage !== undefined ? manualMessage : input.value).trim();
  if (!message) return;
  if (manualMessage === undefined) input.value = '';

  addStaffMessage('user', message);
  try {
    const data = await postJson('/api/staff/chat', { message });
    addStaffMessage('bot', data.replyHtml);
  } catch (err) {
    console.error('Staff chat error', err);
    addStaffMessage('bot', apiErrorCard(err.message));
  }
}

// Patient chat
function handlePatientKeyPress(event) {
  if (event.key === 'Enter') {
    sendPatientMessage();
  }
}

async function sendPatientMessage(manualMessage) {
  const input = document.getElementById('patient-input');
  const message = (manualMessage !== undefined ? manualMessage : input.value).trim();
  if (!message) return;
  if (manualMessage === undefined) input.value = '';

  addPatientMessage('user', message);
  try {
    const data = await postJson('/api/patient/chat', { message });
    addPatientMessage('bot', data.replyHtml);
  } catch (err) {
    console.error('Patient chat error', err);
    addPatientMessage('bot', apiErrorCard(err.message));
  }
}

function startSymptomCollection() {
  sendPatientMessage('I want to report my symptoms');
}

function startBooking() {
  sendPatientMessage('I want to book an appointment');
}

async function generateReport() {
  addPatientMessage('user', 'Request consultation report');
  try {
    const data = await postJson('/api/patient/report', {});
    addPatientMessage('bot', data.reportHtml);
  } catch (err) {
    console.error('Report error', err);
    addPatientMessage('bot', apiErrorCard(err.message));
  }
}

// Dynamic form handling for symptom + booking forms
function formDataToObject(form) {
  return Array.from(new FormData(form).entries()).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});
}

document.addEventListener('submit', async (event) => {
  const form = event.target;
  if (form.id === 'symptom-form') {
    event.preventDefault();
    await submitSymptomForm(form);
  }
  if (form.id === 'booking-form') {
    event.preventDefault();
    await submitBookingForm(form);
  }
});

async function submitSymptomForm(form) {
  const payload = formDataToObject(form);
  addPatientMessage('user', 'Submitted symptom details');
  try {
    const data = await postJson('/api/patient/symptoms', payload);
    addPatientMessage('bot', data.replyHtml);
  } catch (err) {
    console.error('Symptom submission error', err);
    addPatientMessage('bot', apiErrorCard(err.message));
  }
}

async function submitBookingForm(form) {
  const payload = formDataToObject(form);
  addPatientMessage('user', 'Submitted booking request');
  try {
    const data = await postJson('/api/patient/bookings', payload);
    addPatientMessage('bot', data.replyHtml);
  } catch (err) {
    console.error('Booking submission error', err);
    addPatientMessage('bot', apiErrorCard(err.message));
  }
}

// Expose functions globally for inline handlers
window.selectRole = selectRole;
window.switchRole = switchRole;
window.logout = logout;
window.quickQuery = quickQuery;
window.handleStaffKeyPress = handleStaffKeyPress;
window.handlePatientKeyPress = handlePatientKeyPress;
window.sendStaffMessage = sendStaffMessage;
window.sendPatientMessage = sendPatientMessage;
window.startSymptomCollection = startSymptomCollection;
window.startBooking = startBooking;
window.generateReport = generateReport;
