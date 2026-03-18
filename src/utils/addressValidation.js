export const REQUIRED_ADDRESS_FIELDS = ['line1', 'line2', 'city', 'state', 'country', 'postalCode'];

const ADDRESS_FIELD_LABELS = {
  line1: 'Address line 1',
  line2: 'Address line 2 / unit / suite',
  city: 'City',
  state: 'State / province',
  country: 'Country',
  postalCode: 'Postal code'
};

export const normalizeAddress = (address = {}) => ({
  line1: String(address.line1 || '').trim(),
  line2: String(address.line2 || '').trim(),
  city: String(address.city || '').trim(),
  state: String(address.state || '').trim(),
  country: String(address.country || '').trim(),
  postalCode: String(address.postalCode || '').trim(),
  formatted: String(address.formatted || '').trim()
});

export const isAddressComplete = (address = {}) => {
  const normalizedAddress = normalizeAddress(address);
  return REQUIRED_ADDRESS_FIELDS.every((field) => normalizedAddress[field]);
};

export const getAddressFieldErrors = (address = {}) => {
  const normalizedAddress = normalizeAddress(address);

  return REQUIRED_ADDRESS_FIELDS.reduce((errors, field) => {
    if (!normalizedAddress[field]) {
      errors[field] = `${ADDRESS_FIELD_LABELS[field]} is required.`;
    }
    return errors;
  }, {});
};

export const getAddressValidationMessage = (address = {}) => {
  return isAddressComplete(address)
    ? ''
    : 'All address fields are required, including unit or suite.';
};
