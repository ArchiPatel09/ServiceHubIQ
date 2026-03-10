export const SERVICES = [
  { id: 'deep_cleaning', label: 'Deep Cleaning' },
  { id: 'plumbing', label: 'Plumbing' },
  { id: 'electrician', label: 'Electrician' },
  { id: 'gardener', label: 'Gardener' },
  { id: 'snow_removal', label: 'Snow Removal' }
];

export const SERVICE_IDS = SERVICES.map((s) => s.id);

export const SERVICE_LABELS = SERVICES.reduce((acc, service) => {
  acc[service.id] = service.label;
  return acc;
}, {});

export const CANADIAN_CITIES = [
  'Toronto, ON',
  'Vancouver, BC',
  'Montreal, QC',
  'Calgary, AB',
  'Ottawa, ON',
  'Edmonton, AB',
  'Winnipeg, MB',
  'Halifax, NS',
  'Quebec City, QC',
  'Hamilton, ON',
  'London, ON',
  'Victoria, BC'
];

export const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
];

export const ROLES = {
  CUSTOMER: 'customer',
  PROVIDER: 'provider'
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const STORAGE_KEYS = {
  BOOKINGS: 'servicehubiq_bookings_v1'
};
