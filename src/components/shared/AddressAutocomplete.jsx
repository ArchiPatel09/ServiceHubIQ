import React, { useEffect, useRef } from 'react';
import { loadGoogleMaps } from '../../utils/googleMaps';

const AddressAutocomplete = ({
  value,
  onChange,
  onSelect,
  name,
  placeholder,
  className,
  disabled
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
          const formatted = place?.formatted_address || place?.name || '';
          if (formatted && onSelect) {
            onSelect(formatted);
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
      autoComplete="off"
    />
  );
};

export default AddressAutocomplete;
