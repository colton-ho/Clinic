const clinicalProtocols = [
  {
    id: 'stroke',
    name: 'Suspected Stroke Protocol',
    steps: [
      'Call stroke alert and notify neurology immediately.',
      'Assess FAST: Facial droop, Arm drift, Speech difficulty, Time of onset.',
      'Check vitals, blood glucose, establish IV access, draw labs.',
      'Prepare for CT head without contrast within 20 minutes.',
      'Keep NPO, monitor airway, avoid lowering BP unless directed.'
    ]
  },
  {
    id: 'allergic-reaction',
    name: 'Allergic Reaction Protocol',
    steps: [
      'Assess airway, breathing, circulation; apply oxygen as needed.',
      'Epinephrine IM for signs of anaphylaxis; start IV and fluids.',
      'Administer antihistamines and corticosteroids per standing orders.',
      'Observe for biphasic reaction; arrange transfer if unstable.'
    ]
  },
  {
    id: 'coma',
    name: 'Unresponsive / Coma Protocol',
    steps: [
      'Call code; assess responsiveness and pulse; start CPR if pulseless.',
      'Check blood glucose immediately; treat hypoglycemia if present.',
      'Secure airway, place on monitor, obtain IV access, draw labs.',
      'Arrange stat imaging and neurology consult.'
    ]
  }
];

module.exports = { clinicalProtocols };
