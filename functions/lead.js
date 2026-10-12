const FOCUSES = [
  'Muscle Architecture & V-Taper Frame', 'Fat Loss & Body Recomposition',
  'Executive Strength, Posture & Longevity',
];
const WINDOWS = [
  'Early Morning (6:00 AM – 9:00 AM) — Executive Peak Slot',
  'Mid-Morning (9:00 AM – 12:00 PM)',
  'Afternoon & Evening (2:00 PM – 9:00 PM) — Prime Window',
];
function validateLead(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid request.');
  const fullName = typeof input.fullName === 'string' ? input.fullName.trim() : '';
  if (fullName.length < 2 || fullName.length > 120 || /[\r\n]/.test(fullName)) throw new Error('Invalid name.');
  if (!/^[a-f0-9-]{36}$/i.test(input.requestId || '')) throw new Error('Invalid request ID.');
  if (!/^\+9665\d{8}$/.test(input.whatsappMobile || '')) throw new Error('Invalid Saudi mobile number.');
  if (!FOCUSES.includes(input.primaryFocus)) throw new Error('Invalid primary focus.');
  if (!WINDOWS.includes(input.preferredTrainingWindow)) throw new Error('Invalid training window.');
  if (!['Yes', 'No'].includes(input.healthReadiness)) throw new Error('Invalid health readiness.');
  const healthDetails = input.healthReadiness === 'Yes' && typeof input.healthDetails === 'string' ? input.healthDetails.trim() : 'None';
  if (!healthDetails || healthDetails.length > 500) throw new Error('Invalid health details.');
  return { fullName, whatsappMobile: input.whatsappMobile, primaryFocus: input.primaryFocus,
    preferredTrainingWindow: input.preferredTrainingWindow, healthReadiness: input.healthReadiness,
    healthDetails, source: 'Kaizen Fitness Website' };
}
module.exports = { validateLead };
