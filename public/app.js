const staffSection = document.getElementById('staff-section');
const patientSection = document.getElementById('patient-section');
const staffChat = document.getElementById('staff-chat');
const patientChat = document.getElementById('patient-chat');
const staffInput = document.getElementById('staff-input');
const patientInput = document.getElementById('patient-input');
const staffForm = document.getElementById('staff-form');
const patientForm = document.getElementById('patient-form');

let currentRole = null;

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function scrollToBottom(el) {
  requestAnimationFrame(() => {
    el.scrollTop = el.scrollHeight;
  });
}

function addMessage(container, role, contentHtml) {
  const row = document.createElement('div');
  row.className = `chat-row ${role === 'user' ? 'user' : 'bot'}`;

  const bubble = document.createElement('div');
  bubble.className = `bubble ${role === 'user' ? 'user' : 'bot'}`;
  bubble.innerHTML = contentHtml;
  row.appendChild(bubble);
  container.appendChild(row);
  scrollToBottom(container);

  wireDynamicForms(container);
}

function addStaffMessage(role, html) {
  addMessage(staffChat, role, html);
}

function addPatientMessage(role, html) {
  addMessage(patientChat, role, html);
}

async function apiPost(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) {
    const errMsg = data && data.error ? data.error : 'Unexpected error';
    throw new Error(errMsg);
  }
  return data;
}

function selectRole(role) {
  currentRole = role;
  staffSection.classList.toggle('hidden', role !== 'staff');
  patientSection.classList.toggle('hidden', role !== 'patient');
  if (role === 'staff' && !staffChat.dataset.welcomed) {
    addStaffMessage('bot', '<div class="card"><h4>Welcome, team member.</h4><p>Try "Find patient P-001" or "Show analytics".</p></div>');
    staffChat.dataset.welcomed = 'true';
  }
  if (role === 'patient' && !patientChat.dataset.welcomed) {
    addPatientMessage(
      'bot',
      '<div class="card"><h4>Hi there!</h4><p>I can share clinic hours, capture symptoms, book a visit, or create a report.</p></div>'
    );
    patientChat.dataset.welcomed = 'true';
  }
}

async function handleStaffSubmit(event) {
  event.preventDefault();
  const message = staffInput.value.trim();
  if (!message) return;
  addStaffMessage('user', escapeHtml(message));
  staffInput.value = '';
  try {
    const { replyHtml } = await apiPost('/api/staff/chat', { message });
    addStaffMessage('bot', replyHtml);
  } catch (err) {
    addStaffMessage('bot', `<div class="card error">Error: ${escapeHtml(err.message)}</div>`);
  }
}

async function handlePatientSubmit(event) {
  event.preventDefault();
  const message = patientInput.value.trim();
  if (!message) return;
  addPatientMessage('user', escapeHtml(message));
  patientInput.value = '';
  try {
    const { replyHtml } = await apiPost('/api/patient/chat', { message });
    addPatientMessage('bot', replyHtml);
  } catch (err) {
    addPatientMessage('bot', `<div class="card error">Error: ${escapeHtml(err.message)}</div>`);
  }
}

async function handleSymptomFormSubmit(form) {
  const formData = Object.fromEntries(new FormData(form).entries());
  addPatientMessage('user', 'Submitted symptoms.');
  try {
    const { replyHtml } = await apiPost('/api/patient/symptoms', formData);
    addPatientMessage('bot', replyHtml);
  } catch (err) {
    addPatientMessage('bot', `<div class="card error">Error: ${escapeHtml(err.message)}</div>`);
  }
}

async function handleBookingFormSubmit(form) {
  const formData = Object.fromEntries(new FormData(form).entries());
  addPatientMessage('user', 'Requested booking.');
  try {
    const { replyHtml } = await apiPost('/api/patient/bookings', formData);
    addPatientMessage('bot', replyHtml);
  } catch (err) {
    addPatientMessage('bot', `<div class="card error">Error: ${escapeHtml(err.message)}</div>`);
  }
}

function wireDynamicForms(container) {
  const symptomForm = container.querySelector('#symptom-form');
  if (symptomForm && !symptomForm.dataset.bound) {
    symptomForm.dataset.bound = 'true';
    symptomForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSymptomFormSubmit(symptomForm);
    });
  }

  const bookingForm = container.querySelector('#booking-form');
  if (bookingForm && !bookingForm.dataset.bound) {
    bookingForm.dataset.bound = 'true';
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleBookingFormSubmit(bookingForm);
    });
  }
}

document.querySelectorAll('.select-role').forEach((btn) => {
  btn.addEventListener('click', () => selectRole(btn.dataset.role));
});

document.querySelectorAll('.staff-action').forEach((btn) => {
  btn.addEventListener('click', () => {
    selectRole('staff');
    staffInput.value = btn.dataset.fill;
    staffInput.focus();
  });
});

document.querySelectorAll('.patient-action').forEach((btn) => {
  btn.addEventListener('click', () => {
    selectRole('patient');
    patientInput.value = btn.dataset.fill;
    patientInput.focus();
  });
});

document.getElementById('switch-to-patient').addEventListener('click', () => selectRole('patient'));
document.getElementById('switch-to-staff').addEventListener('click', () => selectRole('staff'));

staffForm.addEventListener('submit', handleStaffSubmit);
patientForm.addEventListener('submit', handlePatientSubmit);

// Start on role picker until user chooses; optionally pre-select patient for quick demo.
selectRole('patient');
