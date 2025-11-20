const patients = [
  {
    id: 'P-001',
    name: 'John Doe',
    dob: '1985-03-12',
    gender: 'Male',
    phone: '+1 (555) 123-1111',
    address: '123 Maple St, Springfield',
    medical_history: ['Hypertension', 'Allergy: Penicillin'],
    medications: ['Lisinopril 10mg daily'],
    last_visit: '2025-01-10',
    primary_doctor: 'Dr. Alice Smith',
    vitals: { bp: '130/85', hr: 72, temp: '98.6 F' },
    notes: 'Follow-up recommended in 6 months.'
  },
  {
    id: 'P-002',
    name: 'Maria Gomez',
    dob: '1990-07-22',
    gender: 'Female',
    phone: '+1 (555) 987-2222',
    address: '456 Oak Ave, Springfield',
    medical_history: ['Asthma', 'Seasonal allergies'],
    medications: ['Albuterol inhaler as needed'],
    last_visit: '2025-02-02',
    primary_doctor: 'Dr. Brian Lee',
    vitals: { bp: '118/76', hr: 80, temp: '98.4 F' },
    notes: 'Breathing stable, advised to continue maintenance inhaler.'
  },
  {
    id: 'P-003',
    name: 'Liam Chen',
    dob: '1978-11-05',
    gender: 'Male',
    phone: '+1 (555) 456-3333',
    address: '789 Pine Rd, Springfield',
    medical_history: ['Type 2 Diabetes', 'High cholesterol'],
    medications: ['Metformin 500mg BID', 'Atorvastatin 20mg nightly'],
    last_visit: '2024-12-18',
    primary_doctor: 'Dr. Alice Smith',
    vitals: { bp: '125/82', hr: 76, temp: '98.7 F' },
    notes: 'A1C improving, reinforce diet and exercise.'
  }
];

module.exports = { patients };
