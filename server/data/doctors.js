const doctors = [
  { id: 'D-001', name: 'Dr. Alice Smith', specialty: 'Cardiology' },
  { id: 'D-002', name: 'Dr. Brian Lee', specialty: 'Family Medicine' },
  { id: 'D-003', name: 'Dr. Chloe Patel', specialty: 'Neurology' }
];

// Demo time slots per doctor
const timeSlots = [
  { doctorId: 'D-001', date: '2025-03-01', times: ['09:00', '10:00', '11:00', '14:00'] },
  { doctorId: 'D-002', date: '2025-03-01', times: ['09:30', '11:30', '15:00'] },
  { doctorId: 'D-003', date: '2025-03-01', times: ['10:30', '13:00', '16:00'] }
];

module.exports = { doctors, timeSlots };
