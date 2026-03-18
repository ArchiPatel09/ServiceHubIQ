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

const formatHourSlot = (hour) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
};

// Fix 2: expose the full booking day so emergency slots can be selected too.
export const TIME_SLOTS = Array.from({ length: 18 }, (_, index) => formatHourSlot(index + 6));

export const ROLES = {
  CUSTOMER: 'customer',
  PROVIDER: 'provider',
  ADMIN: 'admin'
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
