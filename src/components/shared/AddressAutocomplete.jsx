import React, { useEffect, useRef } from 'react';
import { loadGoogleMaps } from '../../utils/googleMaps';

const AddressAutocomplete = ({
  value,
  onChange,
  onSelect,
  name,
  placeholder,
  className,
  disabled,
  required = false
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    loadGoogleMaps()
      .then((google) => {
        if (!isMounted || !inputRef.current) return;
        if (autocompleteRef.current) return;

        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['address']
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          if (!place) return;

          const components = place.address_components || [];
          const getComponent = (type) =>
            components.find((component) => component.types.includes(type))?.long_name || '';

          const streetNumber = getComponent('street_number');
          const route = getComponent('route');
          const line1 = [streetNumber, route].filter(Boolean).join(' ').trim();
          const line2 = getComponent('subpremise');
          const city =
            getComponent('locality') ||
            getComponent('postal_town') ||
            getComponent('administrative_area_level_2');
          const state = getComponent('administrative_area_level_1');
          const country = getComponent('country');
          const postalCode = getComponent('postal_code');

          const formatted = place.formatted_address || place.name || line1;

          if (onSelect) {
            onSelect({
              line1,
              line2,
              city,
              state,
              country,
              postalCode,
              formatted
            });
          }
        });
      })
      .catch(() => {
        // silently fail; fallback to plain input
      });

    return () => {
      isMounted = false;
    };
  }, [onSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      autoComplete="off"
    />
  );
};

export default AddressAutocomplete;
