import React, { useEffect, useMemo, useState } from 'react';
import { DirectionsRenderer, GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';

const DEFAULT_CENTER = { lat: 43.6532, lng: -79.3832 };

const MapRenderer = ({ providerLocation, destinationAddress, onEtaChange }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'servicehubiq-live-tracking-map',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  const [destinationPosition, setDestinationPosition] = useState(null);
  const [directions, setDirections] = useState(null);

  useEffect(() => {
    if (!isLoaded || !destinationAddress || !window.google?.maps) {
      setDestinationPosition(null);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: destinationAddress }, (results, status) => {
      if (status === 'OK' && results?.[0]?.geometry?.location) {
        const location = results[0].geometry.location;
        setDestinationPosition({ lat: location.lat(), lng: location.lng() });
      } else {
        setDestinationPosition(null);
      }
    });
  }, [destinationAddress, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !providerLocation || !destinationAddress || !window.google?.maps) {
      setDirections(null);
      onEtaChange?.('');
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: providerLocation,
        destination: destinationAddress,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);
          const leg = result.routes?.[0]?.legs?.[0];
          onEtaChange?.(leg?.duration?.text ? `Estimated arrival: ${leg.duration.text}` : '');
        } else {
          setDirections(null);
          onEtaChange?.('');
        }
      }
    );
  }, [destinationAddress, isLoaded, onEtaChange, providerLocation]);

  const center = useMemo(() => {
    if (providerLocation) return providerLocation;
    if (destinationPosition) return destinationPosition;
    return DEFAULT_CENTER;
  }, [destinationPosition, providerLocation]);

  if (loadError) {
    return <div className="tracking-map-fallback">Google Maps could not be loaded for live tracking.</div>;
  }

  if (!isLoaded) {
    return <div className="tracking-map-fallback">Loading live map...</div>;
  }

  return (
    <GoogleMap mapContainerClassName="live-tracking-map-canvas" center={center} zoom={12}>
      {destinationPosition && <MarkerF position={destinationPosition} label="C" />}
      {providerLocation && <MarkerF position={providerLocation} label="P" />}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#2563eb',
              strokeOpacity: 0.85,
              strokeWeight: 5
            }
          }}
        />
      )}
    </GoogleMap>
  );
};

const LiveTrackingMap = ({ providerLocation, destinationAddress, onEtaChange }) => {
  if (!process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
    return <div className="tracking-map-fallback">Add `REACT_APP_GOOGLE_MAPS_API_KEY` to enable live map tracking.</div>;
  }

  return (
    <div className="live-tracking-map-shell">
      <MapRenderer
        providerLocation={providerLocation}
        destinationAddress={destinationAddress}
        onEtaChange={onEtaChange}
      />
    </div>
  );
};

export default LiveTrackingMap;
