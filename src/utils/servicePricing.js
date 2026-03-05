const SERVICE_PRICE_MAP = {
  'emergency plumbing service': 89,
  plumbing: 89,
  'complete home cleaning': 129,
  cleaning: 129,
  'electrical installation': 149,
  electrical: 149,
  'snow removal service': 49,
  'snow removal': 49,
  painting: 199,
  'appliance repair': 79
};

const normalizeServiceType = (value) => (value || '').toString().trim().toLowerCase();

const coerceNumericPrice = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export const getServicePrice = (serviceType, fallbackPrice = null) => {
  const normalized = normalizeServiceType(serviceType);
  const mapped = SERVICE_PRICE_MAP[normalized];
  if (typeof mapped === 'number') return mapped;
  return coerceNumericPrice(fallbackPrice);
};

export const formatServicePrice = (serviceType, fallbackPrice = null) => {
  const price = getServicePrice(serviceType, fallbackPrice);
  return typeof price === 'number' ? `$${price}` : '-';
};
