// Application State
let currentRole = null;
let symptomData = {};
let bookingData = {};
let conversationState = null;

// Sample Data
const patientsDatabase = [
  {
    id: "P-001",
    name: "John Smith",
    dob: "1990-05-15",
    last_visit: "2025-10-28",
    medical_history: "Hypertension",
    current_medications: "Lisinopril 10mg",
    phone: "555-0101"
  },
  {
    id: "P-002",
    name: "Sarah Johnson",
    dob: "1985-03-22",
    last_visit: "2025-10-25",
    medical_history: "Asthma, Allergies",
    current_medications: "Albuterol inhaler",
    phone: "555-0102"
  },
  {
    id: "P-003",
    name: "Michael Chen",
    dob: "1978-11-08",
    last_visit: "2025-10-24",
    medical_history: "Type 2 Diabetes",
    current_medications: "Metformin 500mg, Lisinopril 10mg",
    phone: "555-0103"
  }
];

const clinicInfo = {
  name: "Healthcare Plus Clinic",
  address: "123 Health Street, Medical District",
  phone: "555-0123",
  hours: {
    monday_friday: "9:00 AM - 6:00 PM",
    saturday: "9:00 AM - 1:00 PM",
    sunday: "Closed"
  },
  insurance: "Most major plans (Blue Cross, Aetna, Cigna, UnitedHealth)"
};

const doctors = [
  {
    name: "Dr. Sarah Lee",
    specialty: "General Practice",
    availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  },
  {
    name: "Dr. James Chen",
    specialty: "Pediatrics",
    availability: ["Tuesday", "Wednesday", "Thursday"]
  },
  {
    name: "Dr. Emily Wong",
    specialty: "Internal Medicine",
    availability: ["Monday", "Wednesday", "Friday"]
  }
];

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "04:00 PM", "04:30 PM", "05:00 PM"
];

const analyticsData = {
  total_patients: 127,
  new_patients: 23,
  returning_patients: 104,
  average_wait_time: 12,
  top_diagnoses: [
    { name: "Common Cold", count: 28 },
    { name: "Hypertension Check", count: 18 },
    { name: "Asthma Management", count: 12 },
    { name: "Routine Physical", count: 15 },
    { name: "Allergy Consultation", count: 10 }
  ],
  demographics: {
    age_range: "18-65",
    female: "55%",
    male: "45%",
    new: "18%",
    returning: "82%"
  }
};

const marketingTemplates = {
  "flu prevention": "🛡️ Flu Season Alert! Get your flu shot today at Healthcare Plus Clinic. Protect yourself and your loved ones. Our doctors can administer the vaccine during a quick office visit. Call us at 555-0123 to schedule! #FluVaccine #HealthcareFirst",
  "pediatric": "👶 Welcome to Our New Pediatric Care Center! Dr. James Chen brings 15 years of pediatric expertise to our team. From routine check-ups to specialized care, we're here for your child's health journey. Book your appointment today!",
  "health tips": "💪 Did you know? Regular health check-ups can catch issues early and save lives. Schedule your appointment with our expert doctors today. Healthcare Plus Clinic - Your Partner in Wellness!",
  "general": "✨ Healthcare Plus Clinic - Your trusted healthcare partner. Expert care, compassionate service. Book your appointment today! Call 555-0123 or visit us at 123 Health Street. #Healthcare #Wellness"
};

const clinicalProtocols = {
  "coma": [
    "Immediately ensure airway, breathing, circulation (ABC assessment)",
    "Call emergency services if not already in medical facility",
    "Monitor vital signs continuously",
    "Maintain patient dignity and comfort care",
    "Consult neurology specialist",
    "Note: This is emergency protocol guidance only - always follow established hospital procedures"
  ],
  "allergic reaction": [
    "Remove allergen source immediately",
    "Assess severity (mild vs. severe/anaphylaxis)",
    "If anaphylaxis: Administer epinephrine auto-injector IM immediately",
    "Call emergency services",
    "Position patient supine with legs elevated",
    "Monitor airway and breathing",
    "Note: This is emergency protocol guidance only - follow established hospital procedures"
  ]
};

// Utility Functions
function selectRole(role) {
  currentRole = role;
  document.getElementById('landing-page').classList.remove('active');
  
  if (role === 'staff') {
    document.getElementById('staff-page').classList.add('active');
    addStaffMessage('bot', 'Welcome to the Staff Dashboard! I can help you with patient records, analytics, marketing content, and clinical protocols. What would you like to know?');
  } else {
    document.getElementById('patient-page').classList.add('active');
    addPatientMessage('bot', 'Welcome to Healthcare Plus Clinic! I\'m here to assist you. How can I help you today?');
  }
}

function switchRole() {
  if (currentRole === 'staff') {
    document.getElementById('staff-page').classList.remove('active');
    document.getElementById('patient-page').classList.add('active');
    document.getElementById('patient-chat').innerHTML = '';
    currentRole = 'patient';
    conversationState = null;
    addPatientMessage('bot', 'Welcome to Healthcare Plus Clinic! I\'m here to assist you. How can I help you today?');
  } else {
    document.getElementById('patient-page').classList.remove('active');
    document.getElementById('staff-page').classList.add('active');
    document.getElementById('staff-chat').innerHTML = '';
    currentRole = 'staff';
    conversationState = null;
    addStaffMessage('bot', 'Welcome to the Staff Dashboard! I can help you with patient records, analytics, marketing content, and clinical protocols. What would you like to know?');
  }
}

function logout() {
  currentRole = null;
  conversationState = null;
  document.getElementById('staff-page').classList.remove('active');
  document.getElementById('patient-page').classList.remove('active');
  document.getElementById('landing-page').classList.add('active');
  document.getElementById('staff-chat').innerHTML = '';
  document.getElementById('patient-chat').innerHTML = '';
}

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
  } else {
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

// Staff Functions
function handleStaffKeyPress(event) {
  if (event.key === 'Enter') {
    sendStaffMessage();
  }
}

function quickQuery(query) {
  if (currentRole === 'staff') {
    document.getElementById('staff-input').value = query;
    sendStaffMessage();
  } else {
    document.getElementById('patient-input').value = query;
    sendPatientMessage();
  }
}

function sendStaffMessage() {
  const input = document.getElementById('staff-input');
  const message = input.value.trim();
  
  if (!message) return;
  
  addStaffMessage('user', message);
  input.value = '';
  
  setTimeout(() => {
    const response = processStaffQuery(message);
    addStaffMessage('bot', response);
  }, 300);
}

function processStaffQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  // Patient Lookup
  if (lowerQuery.includes('find patient') || lowerQuery.includes('show patient') || 
      lowerQuery.includes('patient record') || lowerQuery.includes('lookup') ||
      lowerQuery.includes('p-00')) {
    return findPatient(query);
  }
  
  // Analytics
  if (lowerQuery.includes('how many') || lowerQuery.includes('patients visited') || 
      lowerQuery.includes('analytics') || lowerQuery.includes('statistics') ||
      lowerQuery.includes('demographics') || lowerQuery.includes('wait time')) {
    return generateAnalytics();
  }
  
  // Marketing
  if (lowerQuery.includes('marketing') || lowerQuery.includes('generate') || 
      lowerQuery.includes('social media') || lowerQuery.includes('post') ||
      lowerQuery.includes('promotional') || lowerQuery.includes('campaign')) {
    return generateMarketing(query);
  }
  
  // Clinical Protocols
  if (lowerQuery.includes('coma') || lowerQuery.includes('protocol') ||
      lowerQuery.includes('allergic reaction') || lowerQuery.includes('emergency') ||
      lowerQuery.includes('what should i do')) {
    return getClinicalProtocol(query);
  }
  
  return "I can help you with:<br>• Patient record lookups (e.g., 'Find patient John Smith')<br>• Analytics and statistics (e.g., 'How many patients visited last week?')<br>• Marketing content generation (e.g., 'Generate social media post')<br>• Clinical protocols (e.g., 'Emergency protocol for allergic reaction')";
}

function findPatient(query) {
  const lowerQuery = query.toLowerCase();
  
  // Search by ID or name
  const patient = patientsDatabase.find(p => 
    lowerQuery.includes(p.id.toLowerCase()) || 
    lowerQuery.includes(p.name.toLowerCase())
  );
  
  if (patient) {
    const card = document.createElement('div');
    card.className = 'patient-record';
    card.innerHTML = `
      <div class="record-header">
        <h3>Patient Record</h3>
        <span class="record-id">${patient.id}</span>
      </div>
      <div class="record-field">
        <span class="field-label">Full Name</span>
        <span class="field-value">${patient.name}</span>
      </div>
      <div class="record-field">
        <span class="field-label">Date of Birth</span>
        <span class="field-value">${patient.dob}</span>
      </div>
      <div class="record-field">
        <span class="field-label">Phone</span>
        <span class="field-value">${patient.phone}</span>
      </div>
      <div class="record-field">
        <span class="field-label">Last Visit</span>
        <span class="field-value">${patient.last_visit}</span>
      </div>
      <div class="record-field">
        <span class="field-label">Medical History</span>
        <span class="field-value">${patient.medical_history}</span>
      </div>
      <div class="record-field">
        <span class="field-label">Current Medications</span>
        <span class="field-value">${patient.current_medications}</span>
      </div>
    `;
    return card;
  }
  
  return "❌ Patient not found in database. Please verify the patient ID or name and try again.";
}

function generateAnalytics() {
  const card = document.createElement('div');
  card.className = 'analytics-card';
  
  let topDiagnosesHTML = '';
  analyticsData.top_diagnoses.forEach(diagnosis => {
    topDiagnosesHTML += `
      <div class="analytics-item">
        <span class="field-label">${diagnosis.name}</span>
        <span class="field-value">${diagnosis.count} patients</span>
      </div>
    `;
  });
  
  card.innerHTML = `
    <div class="card-header">
      <h3>📊 Clinic Analytics - Last Week</h3>
    </div>
    <div class="analytics-item">
      <span class="field-label">Total Patients</span>
      <span class="field-value"><strong>${analyticsData.total_patients}</strong></span>
    </div>
    <div class="analytics-item">
      <span class="field-label">New Patients</span>
      <span class="field-value">${analyticsData.new_patients}</span>
    </div>
    <div class="analytics-item">
      <span class="field-label">Returning Patients</span>
      <span class="field-value">${analyticsData.returning_patients}</span>
    </div>
    <div class="analytics-item">
      <span class="field-label">Average Wait Time</span>
      <span class="field-value">${analyticsData.average_wait_time} minutes</span>
    </div>
    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--color-card-border-inner);">
      <h4 style="margin-bottom: 12px;">Top 5 Diagnoses</h4>
      ${topDiagnosesHTML}
    </div>
    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--color-card-border-inner);">
      <h4 style="margin-bottom: 12px;">Patient Demographics</h4>
      <div class="analytics-item">
        <span class="field-label">Age Range</span>
        <span class="field-value">${analyticsData.demographics.age_range}</span>
      </div>
      <div class="analytics-item">
        <span class="field-label">Gender Distribution</span>
        <span class="field-value">Female: ${analyticsData.demographics.female}, Male: ${analyticsData.demographics.male}</span>
      </div>
      <div class="analytics-item">
        <span class="field-label">Patient Type</span>
        <span class="field-value">New: ${analyticsData.demographics.new}, Returning: ${analyticsData.demographics.returning}</span>
      </div>
    </div>
  `;
  return card;
}

function generateMarketing(query) {
  const lowerQuery = query.toLowerCase();
  let template = marketingTemplates.general;
  
  if (lowerQuery.includes('flu')) {
    template = marketingTemplates['flu prevention'];
  } else if (lowerQuery.includes('pediatric') || lowerQuery.includes('child')) {
    template = marketingTemplates['pediatric'];
  } else if (lowerQuery.includes('health tip') || lowerQuery.includes('wellness')) {
    template = marketingTemplates['health tips'];
  }
  
  const card = document.createElement('div');
  card.className = 'analytics-card';
  card.innerHTML = `
    <div class="card-header">
      <h3>📱 Generated Marketing Content</h3>
    </div>
    <div style="padding: 16px; background: var(--color-bg-1); border-radius: var(--radius-base); line-height: 1.6;">
      ${template}
    </div>
    <div style="margin-top: 12px; font-size: var(--font-size-sm); color: var(--color-text-secondary);">
      💡 <em>This content is ready for social media posting, email campaigns, or promotional materials. Customize as needed for your specific channels.</em>
    </div>
  `;
  return card;
}

function getClinicalProtocol(query) {
  const lowerQuery = query.toLowerCase();
  let protocol = null;
  let title = '';
  
  if (lowerQuery.includes('coma')) {
    protocol = clinicalProtocols.coma;
    title = 'Emergency Protocol: Coma Management';
  } else if (lowerQuery.includes('allergic') || lowerQuery.includes('allergy')) {
    protocol = clinicalProtocols['allergic reaction'];
    title = 'Emergency Protocol: Allergic Reaction';
  }
  
  if (protocol) {
    const card = document.createElement('div');
    card.className = 'protocol-card';
    
    let stepsHTML = '<ul class="protocol-steps">';
    protocol.forEach(step => {
      stepsHTML += `<li>${step}</li>`;
    });
    stepsHTML += '</ul>';
    
    card.innerHTML = `
      <div class="card-header">
        <h3>🏥 ${title}</h3>
      </div>
      ${stepsHTML}
      <div class="warning-note">
        ⚠️ <strong>Important:</strong> This is guidance only. Always follow your facility's established protocols and consult with supervising physicians.
      </div>
    `;
    return card;
  }
  
  return "I can provide clinical protocols for:<br>• Coma management<br>• Allergic reactions<br>Please specify which protocol you need.";
}

// Patient Functions
function handlePatientKeyPress(event) {
  if (event.key === 'Enter') {
    sendPatientMessage();
  }
}

function sendPatientMessage() {
  const input = document.getElementById('patient-input');
  const message = input.value.trim();
  
  if (!message) return;
  
  addPatientMessage('user', message);
  input.value = '';
  
  setTimeout(() => {
    const response = processPatientQuery(message);
    addPatientMessage('bot', response);
  }, 300);
}

function processPatientQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  // Clinic Information
  if (lowerQuery.includes('hours') || lowerQuery.includes('open') || lowerQuery.includes('time')) {
    return getClinicHours();
  }
  
  if (lowerQuery.includes('location') || lowerQuery.includes('address') || lowerQuery.includes('where')) {
    return `📍 <strong>Our Location:</strong><br>${clinicInfo.address}<br><br>📞 <strong>Phone:</strong> ${clinicInfo.phone}`;
  }
  
  if (lowerQuery.includes('doctor') || lowerQuery.includes('physician')) {
    return getDoctorsList();
  }
  
  if (lowerQuery.includes('insurance')) {
    return `💳 <strong>Insurance Accepted:</strong><br>${clinicInfo.insurance}<br><br>Please bring your insurance card to your appointment. We'll verify coverage before your visit.`;
  }
  
  if (lowerQuery.includes('book') || lowerQuery.includes('appointment')) {
    return "To book an appointment, please click the 'Book Appointment' button in the sidebar, or I can help you with that now. You'll need to provide your name, phone number, preferred date, and doctor.";
  }
  
  return "I can help you with:<br>• Clinic hours and location<br>• Available doctors and specialties<br>• Insurance information<br>• Booking appointments<br>• Reporting symptoms<br>• Requesting consultation reports<br><br>What would you like to know?";
}

function getClinicHours() {
  return `
    🕐 <strong>Our Opening Hours:</strong><br><br>
    <strong>Monday - Friday:</strong> ${clinicInfo.hours.monday_friday}<br>
    <strong>Saturday:</strong> ${clinicInfo.hours.saturday}<br>
    <strong>Sunday:</strong> ${clinicInfo.hours.sunday}<br><br>
    📞 Call us at ${clinicInfo.phone} to schedule an appointment!
  `;
}

function getDoctorsList() {
  let html = '<strong>👨‍⚕️ Our Medical Team:</strong><br><br>';
  doctors.forEach(doctor => {
    html += `<strong>${doctor.name}</strong> - ${doctor.specialty}<br>`;
    html += `Available: ${doctor.availability.join(', ')}<br><br>`;
  });
  return html;
}

function startSymptomCollection() {
  conversationState = 'symptom_collection';
  symptomData = {};
  
  const form = document.createElement('div');
  form.className = 'symptom-form';
  form.innerHTML = `
    <h3>Symptom Assessment</h3>
    <p style="margin-bottom: 16px; color: var(--color-text-secondary);">Please provide information about your current symptoms:</p>
    
    <div class="form-group">
      <label class="form-label">Temperature</label>
      <div class="radio-group">
        <label class="radio-option">
          <input type="radio" name="temperature" value="Normal (98.6°F)" checked>
          <span>Normal (98.6°F)</span>
        </label>
        <label class="radio-option">
          <input type="radio" name="temperature" value="Fever (>100.4°F)">
          <span>Fever (&gt;100.4°F)</span>
        </label>
        <label class="radio-option">
          <input type="radio" name="temperature" value="Not measured">
          <span>Not measured</span>
        </label>
      </div>
    </div>
    
    <div class="form-group">
      <label class="form-label">Pain Level (1-10)</label>
      <input type="number" class="form-control" id="pain-level" min="1" max="10" value="5">
    </div>
    
    <div class="form-group">
      <label class="form-label">Duration</label>
      <input type="text" class="form-control" id="duration" placeholder="e.g., 3 days, 12 hours">
    </div>
    
    <div class="form-group">
      <label class="form-label">Symptom Description</label>
      <textarea class="form-control" id="symptom-desc" rows="3" placeholder="Please describe your symptoms in detail..."></textarea>
    </div>
    
    <div class="form-group">
      <label class="form-label">Onset</label>
      <div class="radio-group">
        <label class="radio-option">
          <input type="radio" name="onset" value="Sudden" checked>
          <span>Sudden</span>
        </label>
        <label class="radio-option">
          <input type="radio" name="onset" value="Gradual">
          <span>Gradual</span>
        </label>
        <label class="radio-option">
          <input type="radio" name="onset" value="Uncertain">
          <span>Uncertain</span>
        </label>
      </div>
    </div>
    
    <div class="form-actions">
      <button class="btn btn--primary" onclick="submitSymptoms()">Submit Symptoms</button>
      <button class="btn btn--outline" onclick="cancelForm()">Cancel</button>
    </div>
  `;
  
  addPatientMessage('bot', form);
}

function submitSymptoms() {
  const temperature = document.querySelector('input[name="temperature"]:checked').value;
  const painLevel = document.getElementById('pain-level').value;
  const duration = document.getElementById('duration').value;
  const description = document.getElementById('symptom-desc').value;
  const onset = document.querySelector('input[name="onset"]:checked').value;
  
  if (!duration || !description) {
    alert('Please fill in all required fields.');
    return;
  }
  
  symptomData = {
    temperature,
    painLevel,
    duration,
    description,
    onset,
    timestamp: new Date().toISOString()
  };
  
  const summary = document.createElement('div');
  summary.className = 'booking-confirmation';
  summary.innerHTML = `
    <div class="card-header">
      <h3>✅ Symptoms Recorded</h3>
    </div>
    <div class="record-field">
      <span class="field-label">Temperature</span>
      <span class="field-value">${temperature}</span>
    </div>
    <div class="record-field">
      <span class="field-label">Pain Level</span>
      <span class="field-value">${painLevel}/10</span>
    </div>
    <div class="record-field">
      <span class="field-label">Duration</span>
      <span class="field-value">${duration}</span>
    </div>
    <div class="record-field">
      <span class="field-label">Onset</span>
      <span class="field-value">${onset}</span>
    </div>
    <div class="record-field">
      <span class="field-label">Description</span>
      <span class="field-value">${description}</span>
    </div>
    <div style="margin-top: 16px; padding: 12px; background: var(--color-bg-3); border-radius: var(--radius-base);">
      ℹ️ Your symptoms have been recorded. Our medical team will review this information. Please book an appointment if you need immediate care.
    </div>
  `;
  
  addPatientMessage('bot', summary);
  conversationState = null;
}

function startBooking() {
  conversationState = 'booking';
  bookingData = {};
  
  const form = document.createElement('div');
  form.className = 'booking-form';
  
  let doctorOptions = '';
  doctors.forEach(doctor => {
    doctorOptions += `<option value="${doctor.name}">${doctor.name} - ${doctor.specialty}</option>`;
  });
  
  let timeOptions = '';
  timeSlots.forEach(slot => {
    timeOptions += `<option value="${slot}">${slot}</option>`;
  });
  
  form.innerHTML = `
    <h3>Book an Appointment</h3>
    <p style="margin-bottom: 16px; color: var(--color-text-secondary);">Fill in your details to schedule an appointment:</p>
    
    <div class="form-group">
      <label class="form-label">Full Name</label>
      <input type="text" class="form-control" id="booking-name" placeholder="Enter your full name">
    </div>
    
    <div class="form-group">
      <label class="form-label">Phone Number</label>
      <input type="tel" class="form-control" id="booking-phone" placeholder="555-0000">
    </div>
    
    <div class="form-group">
      <label class="form-label">Select Doctor</label>
      <select class="form-control" id="booking-doctor">
        ${doctorOptions}
      </select>
    </div>
    
    <div class="form-group">
      <label class="form-label">Preferred Date</label>
      <input type="date" class="form-control" id="booking-date" min="2025-11-01">
    </div>
    
    <div class="form-group">
      <label class="form-label">Preferred Time</label>
      <select class="form-control" id="booking-time">
        ${timeOptions}
      </select>
    </div>
    
    <div class="form-actions">
      <button class="btn btn--primary" onclick="submitBooking()">Confirm Booking</button>
      <button class="btn btn--outline" onclick="cancelForm()">Cancel</button>
    </div>
  `;
  
  addPatientMessage('bot', form);
}

function submitBooking() {
  const name = document.getElementById('booking-name').value.trim();
  const phone = document.getElementById('booking-phone').value.trim();
  const doctor = document.getElementById('booking-doctor').value;
  const date = document.getElementById('booking-date').value;
  const time = document.getElementById('booking-time').value;
  
  if (!name || !phone || !date) {
    alert('Please fill in all required fields.');
    return;
  }
  
  const bookingId = 'BK-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  bookingData = {
    bookingId,
    name,
    phone,
    doctor,
    date,
    time,
    timestamp: new Date().toISOString()
  };
  
  const confirmation = document.createElement('div');
  confirmation.className = 'booking-confirmation';
  confirmation.innerHTML = `
    <div class="card-header">
      <h3>✅ Appointment Confirmed</h3>
      <span class="record-id">${bookingId}</span>
    </div>
    <div class="record-field">
      <span class="field-label">Patient Name</span>
      <span class="field-value">${name}</span>
    </div>
    <div class="record-field">
      <span class="field-label">Phone</span>
      <span class="field-value">${phone}</span>
    </div>
    <div class="record-field">
      <span class="field-label">Doctor</span>
      <span class="field-value">${doctor}</span>
    </div>
    <div class="record-field">
      <span class="field-label">Date</span>
      <span class="field-value">${date}</span>
    </div>
    <div class="record-field">
      <span class="field-label">Time</span>
      <span class="field-value">${time}</span>
    </div>
    <div class="record-field">
      <span class="field-label">Location</span>
      <span class="field-value">${clinicInfo.address}</span>
    </div>
    <div style="margin-top: 16px; padding: 12px; background: var(--color-bg-3); border-radius: var(--radius-base);">
      ✉️ A confirmation has been sent to your phone. Please arrive 10 minutes early. Call ${clinicInfo.phone} if you need to reschedule.
    </div>
  `;
  
  addPatientMessage('bot', confirmation);
  conversationState = null;
}

function cancelForm() {
  conversationState = null;
  addPatientMessage('bot', 'Form cancelled. How else can I help you today?');
}

function generateReport() {
  const reportId = 'RPT-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const report = document.createElement('div');
  report.className = 'medical-report';
  report.innerHTML = `
    <div style="text-align: center; padding-bottom: 16px; border-bottom: 2px solid var(--color-primary); margin-bottom: 16px;">
      <h2 style="color: var(--color-primary); margin-bottom: 8px;">${clinicInfo.name}</h2>
      <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">${clinicInfo.address} | ${clinicInfo.phone}</p>
    </div>
    
    <div class="card-header">
      <h3>Medical Consultation Report</h3>
      <span class="record-id">${reportId}</span>
    </div>
    
    <div class="record-field">
      <span class="field-label">Report Date</span>
      <span class="field-value">${currentDate}</span>
    </div>
    <div class="record-field">
      <span class="field-label">Patient Name</span>
      <span class="field-value">${bookingData.name || 'Demo Patient'}</span>
    </div>
    <div class="record-field">
      <span class="field-label">Visit Type</span>
      <span class="field-value">Consultation</span>
    </div>
    <div class="record-field">
      <span class="field-label">Attending Physician</span>
      <span class="field-value">${bookingData.doctor || 'Dr. Sarah Lee'}</span>
    </div>
    
    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--color-card-border-inner);">
      <h4 style="margin-bottom: 12px;">Chief Complaint</h4>
      <p>${symptomData.description || 'Patient presented for routine consultation and health assessment.'}</p>
    </div>
    
    <div style="margin-top: 16px;">
      <h4 style="margin-bottom: 12px;">Vital Signs</h4>
      <div class="record-field">
        <span class="field-label">Temperature</span>
        <span class="field-value">${symptomData.temperature || '98.6°F (Normal)'}</span>
      </div>
      <div class="record-field">
        <span class="field-label">Blood Pressure</span>
        <span class="field-value">120/80 mmHg</span>
      </div>
      <div class="record-field">
        <span class="field-label">Heart Rate</span>
        <span class="field-value">72 bpm</span>
      </div>
      <div class="record-field">
        <span class="field-label">Respiratory Rate</span>
        <span class="field-value">16 breaths/min</span>
      </div>
    </div>
    
    <div style="margin-top: 16px;">
      <h4 style="margin-bottom: 12px;">Assessment</h4>
      <p>Patient examined and evaluated. All vital signs within normal limits. No acute concerns identified at this time.</p>
    </div>
    
    <div style="margin-top: 16px;">
      <h4 style="margin-bottom: 12px;">Treatment Plan</h4>
      <ul style="list-style-position: inside; color: var(--color-text-secondary);">
        <li>Continue current health maintenance practices</li>
        <li>Monitor symptoms and report any changes</li>
        <li>Follow up as needed or annually for routine check-up</li>
      </ul>
    </div>
    
    <div style="margin-top: 16px;">
      <h4 style="margin-bottom: 12px;">Follow-up Recommendations</h4>
      <p>Return to clinic if symptoms worsen or new concerns arise. Schedule routine follow-up in 12 months.</p>
    </div>
    
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--color-card-border-inner);">
      <p style="font-size: var(--font-size-sm);"><strong>Physician Signature:</strong> ____________________</p>
      <p style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 8px;">This is a demonstration report. For official medical records, please contact the clinic.</p>
    </div>
  `;
  
  addPatientMessage('bot', report);
}