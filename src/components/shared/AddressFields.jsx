import React from 'react';
import AddressAutocomplete from './AddressAutocomplete';
import ErrorMessage from './ErrorMessage';

const AddressFields = ({ value = {}, onChange, disabled = false, errors = {} }) => {
  const handleFieldChange = (field, fieldValue) => {
    if (typeof onChange !== 'function') return;
    onChange({
      ...value,
      [field]: fieldValue
    });
  };

  const handleSelect = (selected) => {
    if (typeof onChange !== 'function') return;
    onChange({
      ...value,
      ...selected,
      line2: value.line2 || selected.line2 || ''
    });
  };

  return (
    <div className="address-grid">
      <div className="form-group full-width">
        <label>Address Line 1</label>
        <AddressAutocomplete
          name="address_line1"
          value={value.line1 || value.formatted || ''}
          onChange={(e) => handleFieldChange('line1', e.target.value)}
          onSelect={handleSelect}
          className={`form-control ${errors.line1 ? 'is-invalid' : ''}`.trim()}
          placeholder="Start typing your address"
          disabled={disabled}
          required
        />
        <ErrorMessage message={errors.line1} />
      </div>

      <div className="form-group full-width">
        <label>Address Line 2 / Unit / Suite</label>
        <input
          type="text"
          className={`form-control ${errors.line2 ? 'is-invalid' : ''}`.trim()}
          value={value.line2 || ''}
          onChange={(e) => handleFieldChange('line2', e.target.value)}
          placeholder="Apartment, suite, unit, etc."
          disabled={disabled}
          required
        />
        <ErrorMessage message={errors.line2} />
      </div>

      <div className="form-group">
        <label>City</label>
        <input
          type="text"
          className={`form-control ${errors.city ? 'is-invalid' : ''}`.trim()}
          value={value.city || ''}
          onChange={(e) => handleFieldChange('city', e.target.value)}
          disabled={disabled}
          required
        />
        <ErrorMessage message={errors.city} />
      </div>

      <div className="form-group">
        <label>State / Province</label>
        <input
          type="text"
          className={`form-control ${errors.state ? 'is-invalid' : ''}`.trim()}
          value={value.state || ''}
          onChange={(e) => handleFieldChange('state', e.target.value)}
          disabled={disabled}
          required
        />
        <ErrorMessage message={errors.state} />
      </div>

      <div className="form-group">
        <label>Country</label>
        <input
          type="text"
          className={`form-control ${errors.country ? 'is-invalid' : ''}`.trim()}
          value={value.country || ''}
          onChange={(e) => handleFieldChange('country', e.target.value)}
          disabled={disabled}
          required
        />
        <ErrorMessage message={errors.country} />
      </div>

      <div className="form-group">
        <label>Postal Code</label>
        <input
          type="text"
          className={`form-control ${errors.postalCode ? 'is-invalid' : ''}`.trim()}
          value={value.postalCode || ''}
          onChange={(e) => handleFieldChange('postalCode', e.target.value)}
          disabled={disabled}
          required
        />
        <ErrorMessage message={errors.postalCode} />
      </div>
    </div>
  );
};

export default AddressFields;
