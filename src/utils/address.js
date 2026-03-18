export const formatAddress = (address) => {
  if (!address) return '';
  if (typeof address === 'string') return address;

  const formatted = address.formatted || '';
  if (formatted) return formatted;

  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.country,
    address.postalCode
  ].filter(Boolean);

  return parts.join(', ');
};

export const formatCityState = (address) => {
  if (!address || typeof address === 'string') return address || '';
  const parts = [address.city, address.state].filter(Boolean);
  return parts.join(', ');
};
