const SERVICE_PRICE_MAP = {
  deep_cleaning: 129,
  plumbing: 89,
  electrician: 149,
  gardener: 79,
  snow_removal: 49
};

const normalizeServiceType = (value) => (value || '').toString().trim().toLowerCase().replace(/\s+/g, '_');

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
