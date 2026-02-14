import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCalendar, FaClock, FaHome, FaMapMarkerAlt, FaCreditCard, FaCheckCircle } from 'react-icons/fa';
import { bookingAPI, extractApiError, userAPI } from '../../services/api';

const SERVICE_TO_PROFESSION = {
  plumbing: 'plumber',
  cleaning: 'cleaner',
  electrical: 'electrician',
  snow_removal: 'gardener',
  painting: 'painter',
  appliance_repair: 'technician'
};

const ServiceBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service');

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const services = useMemo(
    () => [
      { id: 1, key: 'plumbing', name: 'Emergency Plumbing Service', provider: 'Provider assigned', price: 89 },
      { id: 2, key: 'cleaning', name: 'Complete Home Cleaning', provider: 'Provider assigned', price: 129 },
      { id: 3, key: 'electrical', name: 'Electrical Installation', provider: 'Provider assigned', price: 149 },
      { id: 4, key: 'snow_removal', name: 'Snow Removal Service', provider: 'Provider assigned', price: 49 },
      { id: 5, key: 'painting', name: 'Painting', provider: 'Provider assigned', price: 199 },
      { id: 6, key: 'appliance_repair', name: 'Appliance Repair', provider: 'Provider assigned', price: 79 }
    ],
    []
  );

  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

  const [bookingData, setBookingData] = useState({
    serviceId: null,
    serviceDate: '',
    serviceTime: '',
    address: '',
    specialInstructions: '',
    paymentMethod: 'credit_card'
  });

  const selectedService = useMemo(() => services.find((s) => s.id === bookingData.serviceId) || null, [services, bookingData.serviceId]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await userAPI.getProviders();
        setProviders(response?.data?.data || []);
      } catch (error) {
        setErrors((prev) => ({ ...prev, general: extractApiError(error, 'Failed to load providers') }));
      } finally {
        setLoadingProviders(false);
      }
    };

    fetchProviders();
  }, []);

  useEffect(() => {
    if (!preselectedService) return;
    const idNum = Number(preselectedService);
    const exists = services.some((s) => s.id === idNum);
    if (exists) {
      setBookingData((prev) => ({ ...prev, serviceId: idNum }));
      setStep(2);
    }
  }, [preselectedService, services]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (errors.general) setErrors((prev) => ({ ...prev, general: '' }));
  };

  const handleServiceSelect = (serviceId) => {
    setBookingData((prev) => ({ ...prev, serviceId }));
    setErrors((prev) => ({ ...prev, serviceId: '' }));
    setStep(2);
  };

  const handleTimeSelect = (time) => {
    setBookingData((prev) => ({ ...prev, serviceTime: time }));
    setErrors((prev) => ({ ...prev, serviceTime: '' }));
    setStep(4);
  };

  const validateConfirm = () => {
    const e = {};
    if (!bookingData.serviceId) e.serviceId = 'Please select a service';
    if (!bookingData.serviceDate) e.serviceDate = 'Please select a date';
    if (!bookingData.serviceTime) e.serviceTime = 'Please select a time';
    if (!bookingData.address.trim()) e.address = 'Address is required for booking';
    return e;
  };

  const timeTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
      hours = '00';
    }

    if (modifier === 'PM') {
      hours = String(Number(hours) + 12);
    }

    return `${hours.padStart(2, '0')}:${minutes}:00`;
  };

  const resolveProviderId = (serviceKey) => {
    if (!providers.length) return null;

    const desired = SERVICE_TO_PROFESSION[serviceKey];
    if (!desired) return providers[0]._id;

    const match = providers.find((p) => (p.profession || '').toLowerCase().includes(desired.toLowerCase()));
    return (match || providers[0])._id;
  };

  const handleSubmitBooking = async () => {
    const v = validateConfirm();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }

    const svc = services.find((s) => s.id === bookingData.serviceId);
    if (!svc) {
      setErrors({ general: 'Selected service not found. Please try again.' });
      setStep(1);
      return;
    }

    const providerId = resolveProviderId(svc.key);
    if (!providerId) {
      setErrors({ general: 'No providers available. Register a provider first and try again.' });
      return;
    }

    try {
      setSubmitting(true);
      const dateTime = `${bookingData.serviceDate}T${timeTo24Hour(bookingData.serviceTime)}`;

      const response = await bookingAPI.createBooking({
        providerId,
        serviceType: svc.name,
        address: bookingData.address,
        date: dateTime
      });

      const created = response?.data?.data;
      setSuccessMsg('Booking confirmed! Redirecting to Booking History...');
      setTimeout(() => navigate(`/booking-confirmation?id=${created?._id || ''}`), 700);
    } catch (error) {
      setErrors({ general: extractApiError(error, 'Booking failed. Please try again.') });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="service-booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <h1>Book a Service</h1>

          {successMsg && (
            <div className="alert alert-success" style={{ marginTop: 12 }}>
              <FaCheckCircle /> {successMsg}
            </div>
          )}
          {errors.general && (
            <div className="alert alert-danger" style={{ marginTop: 12 }}>
              {errors.general}
            </div>
          )}
          {loadingProviders && (
            <div className="alert alert-info" style={{ marginTop: 12 }}>
              Loading providers...
            </div>
          )}

          <div className="booking-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}><div className="step-number">1</div><div className="step-label">Service</div></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}><div className="step-number">2</div><div className="step-label">Date</div></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}><div className="step-number">3</div><div className="step-label">Time</div></div>
            <div className={`step ${step >= 4 ? 'active' : ''}`}><div className="step-number">4</div><div className="step-label">Confirm</div></div>
          </div>
        </div>

        <div className="booking-content">
          {step === 1 && (
            <div className="booking-step">
              <h2><FaHome /> Select Service Type</h2>
              {errors.serviceId && <div className="error-text" style={{ marginBottom: 10 }}>{errors.serviceId}</div>}
              <div className="service-grid">
                {services.map((service) => (
                  <div key={service.id} className={`service-option ${bookingData.serviceId === service.id ? 'selected' : ''}`} onClick={() => handleServiceSelect(service.id)} role="button" tabIndex={0}>
                    <h4>{service.name}</h4>
                    <p className="price">${service.price}</p>
                    <p className="description">Provider: {service.provider}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="booking-step">
              <h2><FaCalendar /> Select Date</h2>
              <input type="date" name="serviceDate" value={bookingData.serviceDate} onChange={handleInputChange} className={`form-control ${errors.serviceDate ? 'is-invalid' : ''}`} min={new Date().toISOString().split('T')[0]} />
              {errors.serviceDate && <div className="error-text">{errors.serviceDate}</div>}
              <div className="booking-actions" style={{ marginTop: 12 }}>
                <button className="btn btn-outline" onClick={() => setStep(1)} type="button">Back</button>
                <button className="btn btn-primary" onClick={() => bookingData.serviceDate && setStep(3)} type="button">Next: Select Time</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="booking-step">
              <h2><FaClock /> Select Time</h2>
              <div className="time-grid">
                {timeSlots.map((time) => (
                  <button key={time} className={`time-slot ${bookingData.serviceTime === time ? 'selected' : ''}`} onClick={() => handleTimeSelect(time)} type="button">{time}</button>
                ))}
              </div>
              {errors.serviceTime && <div className="error-text">{errors.serviceTime}</div>}
              <div className="booking-actions">
                <button className="btn btn-outline" onClick={() => setStep(2)} type="button">Back</button>
                <button className="btn btn-primary" onClick={() => bookingData.serviceTime && setStep(4)} type="button">Next: Confirm Details</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="booking-step">
              <h2><FaCreditCard /> Confirm Booking</h2>
              <div className="booking-summary">
                <h3>Booking Summary</h3>
                <div className="summary-item"><strong>Service:</strong> {selectedService?.name || '-'}</div>
                <div className="summary-item"><strong>Date:</strong> {bookingData.serviceDate || '-'}</div>
                <div className="summary-item"><strong>Time:</strong> {bookingData.serviceTime || '-'}</div>
                <div className="summary-total"><strong>Total:</strong> ${selectedService?.price ?? '-'}</div>
              </div>

              <div className="form-group">
                <label><FaMapMarkerAlt /> Service Address</label>
                <textarea name="address" value={bookingData.address} onChange={handleInputChange} className={`form-control ${errors.address ? 'is-invalid' : ''}`} placeholder="Enter the service address" rows="3" />
                {errors.address && <div className="error-text">{errors.address}</div>}
              </div>

              <div className="form-group">
                <label>Special Instructions</label>
                <textarea name="specialInstructions" value={bookingData.specialInstructions} onChange={handleInputChange} className="form-control" placeholder="Any special instructions for the provider" rows="3" />
              </div>

              <div className="booking-actions">
                <button className="btn btn-outline" onClick={() => setStep(3)} type="button">Back</button>
                <button className="btn btn-primary" onClick={handleSubmitBooking} type="button" disabled={submitting || loadingProviders}>
                  {submitting ? 'Booking...' : 'Confirm & Book'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/services')} type="button">
            Back to Services
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceBooking;
