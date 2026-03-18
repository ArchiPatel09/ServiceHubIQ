import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCalendar, FaClock, FaHome, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';
import { bookingAPI, extractApiError, userAPI } from '../../services/api';
import { SERVICES, SERVICE_LABELS, TIME_SLOTS } from '../../services/constants';
import { getServicePrice } from '../../utils/servicePricing';
import AddressFields from '../shared/AddressFields';
import ErrorMessage from '../shared/ErrorMessage';
import Modal from '../shared/Modal';
import { getAddressFieldErrors } from '../../utils/addressValidation';

const SERVICE_START_HOUR = 8;  // 8:00 AM
const SERVICE_END_HOUR = 18;   // 6:00 PM (inclusive)
const EMERGENCY_FEE = 50;

function parseDisplayTime(timeStr) {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return { hours, minutes };
}

function getAvailableTimeSlots(selectedDate) {
  if (!selectedDate) return TIME_SLOTS;

  const todayStr = new Date().toISOString().split('T')[0];
  if (selectedDate !== todayStr) return TIME_SLOTS;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return TIME_SLOTS.filter((slot) => {
    const { hours, minutes } = parseDisplayTime(slot);
    const slotMinutes = hours * 60 + minutes;
    return slotMinutes > currentMinutes;
  });
}

function isOutsideServiceHours(timeStr) {
  if (!timeStr) return false;
  const { hours, minutes } = parseDisplayTime(timeStr);
  const totalMinutes = hours * 60 + minutes;
  return totalMinutes < SERVICE_START_HOUR * 60 || totalMinutes > SERVICE_END_HOUR * 60;
}

function getTimeSlotLabel(timeStr) {
  return isOutsideServiceHours(timeStr) ? `Emergency (+$${EMERGENCY_FEE})` : 'Regular';
}

function timeTo24Hour(time12h) {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = String(Number(hours) + 12);
  return `${hours.padStart(2, '0')}:${minutes}:00`;
}

const ServiceBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service');

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successBookingId, setSuccessBookingId] = useState('');
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [providerAvailabilityError, setProviderAvailabilityError] = useState('');
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  const services = useMemo(
    () =>
      SERVICES.map((service) => ({
        id: service.id,
        key: service.id,
        name: SERVICE_LABELS[service.id],
        provider: 'Provider assigned',
        price: getServicePrice(service.id) || 0
      })),
    []
  );

  const [bookingData, setBookingData] = useState({
    serviceId: null,
    serviceDate: '',
    serviceTime: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      formatted: ''
    },
    specialInstructions: '',
    paymentMethod: 'credit_card',
    isEmergencyService: false,
    extraFee: 0
  });

  const selectedService = useMemo(
    () => services.find((s) => s.id === bookingData.serviceId) || null,
    [services, bookingData.serviceId]
  );

  const availableTimeSlots = useMemo(
    () => getAvailableTimeSlots(bookingData.serviceDate),
    [bookingData.serviceDate]
  );

  useEffect(() => {
    if (bookingData.serviceTime && !availableTimeSlots.includes(bookingData.serviceTime)) {
      setBookingData((prev) => ({ ...prev, serviceTime: '' }));
    }
  }, [availableTimeSlots, bookingData.serviceTime]);

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
    const exists = services.some((s) => s.id === preselectedService);
    if (exists) {
      setBookingData((prev) => ({ ...prev, serviceId: preselectedService }));
      setStep(2);
    }
  }, [preselectedService, services]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'serviceDate' ? { serviceTime: '' } : {})
    }));
    setProviderAvailabilityError('');
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (errors.general) setErrors((prev) => ({ ...prev, general: '' }));
    if (name === 'serviceDate') setStep(3);
  };

  const handleAddressChange = (address) => {
    setBookingData((prev) => ({ ...prev, address }));
    if (errors.addressFields) setErrors((prev) => ({ ...prev, addressFields: null }));
  };

  const handleServiceSelect = (serviceId) => {
    setBookingData((prev) => ({ ...prev, serviceId }));
    setProviderAvailabilityError('');
    setErrors((prev) => ({ ...prev, serviceId: '' }));
    setStep(2);
  };

  const handleTimeSelect = (time) => {
    setBookingData((prev) => ({
      ...prev,
      serviceTime: time,
      isEmergencyService: false,
      extraFee: 0
    }));
    setProviderAvailabilityError('');
    setErrors((prev) => ({ ...prev, serviceTime: '' }));
    setStep(4);
  };

  const validateConfirm = () => {
    const e = {};
    if (!bookingData.serviceId) e.serviceId = 'Please select a service';
    if (!bookingData.serviceDate) e.serviceDate = 'Please select a date';
    if (!bookingData.serviceTime) e.serviceTime = 'Please select a time';
    const addressFieldErrors = getAddressFieldErrors(bookingData.address);
    if (Object.keys(addressFieldErrors).length > 0) {
      e.addressFields = addressFieldErrors;
    }

    if (bookingData.serviceDate && bookingData.serviceTime) {
      const slots = getAvailableTimeSlots(bookingData.serviceDate);
      if (!slots.includes(bookingData.serviceTime)) {
        e.serviceTime = 'Selected time is no longer available. Please choose a future time slot.';
      }
    }

    return e;
  };

  const normalizeRole = (value) =>
    String(value || '').trim().toLowerCase().replace(/\s+/g, '_');

  const resolveProviderId = (serviceKey) => {
    if (!providers.length) return null;
    const desired = normalizeRole(serviceKey);
    const match = providers.find((p) => {
      const ps = normalizeRole(p.provider_service || p.providerService);
      return ps === desired;
    });
    return match ? match._id : null;
  };

  const handleConfirmClick = () => {
    const v = validateConfirm();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }

    if (isOutsideServiceHours(bookingData.serviceTime)) {
      setEmergencyModalOpen(true);
    } else {
      submitBooking(false);
    }
  };

  const handleEmergencyConfirm = () => {
    setEmergencyModalOpen(false);
    setBookingData((prev) => ({
      ...prev,
      isEmergencyService: true,
      extraFee: EMERGENCY_FEE
    }));
    submitBooking(true);
  };

  const handleEmergencyCancel = () => {
    setEmergencyModalOpen(false);
    navigate('/services');
  };

  const submitBooking = async (isEmergency) => {
    const svc = services.find((s) => s.id === bookingData.serviceId);
    if (!svc) {
      setErrors({ general: 'Selected service not found. Please try again.' });
      setStep(1);
      return;
    }

    const providerId = resolveProviderId(svc.key);
    if (!providerId) {
      setProviderAvailabilityError('No provider available for this service right now. Please try again later.');
      return;
    }

    try {
      setSubmitting(true);
      setProviderAvailabilityError('');
      const dateTime = `${bookingData.serviceDate}T${timeTo24Hour(bookingData.serviceTime)}`;

      const response = await bookingAPI.createBooking({
        providerId,
        serviceType: svc.key,
        address: bookingData.address,
        date: dateTime,
        time: bookingData.serviceTime,
        details: bookingData.specialInstructions,
        isEmergencyService: isEmergency,
        extraFee: isEmergency ? EMERGENCY_FEE : 0
      });

      const created = response?.data?.data;
      const id = created?._id || '';
      setSuccessBookingId(id);
      setSuccessModalOpen(true);
      setTimeout(() => navigate(`/booking-confirmation?id=${id}`), 1200);
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
          <ErrorMessage message={errors.general} className="form-error-global" />
          {loadingProviders && (
            <div className="alert alert-info booking-alert">
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
              <ErrorMessage message={errors.serviceId} />
              <div className="service-grid">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`service-option ${bookingData.serviceId === service.id ? 'selected' : ''}`}
                    onClick={() => handleServiceSelect(service.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleServiceSelect(service.id)}
                  >
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
              <input
                type="date"
                name="serviceDate"
                value={bookingData.serviceDate}
                onChange={handleInputChange}
                className={`form-control ${errors.serviceDate ? 'is-invalid' : ''}`}
                min={new Date().toISOString().split('T')[0]}
              />
              <ErrorMessage message={errors.serviceDate} />
              <div className="booking-actions booking-actions-spaced">
                <button className="btn btn-outline" onClick={() => setStep(1)} type="button">Back</button>
                <button className="btn btn-primary" onClick={() => bookingData.serviceDate && setStep(3)} type="button">Next: Select Time</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="booking-step">
              <h2><FaClock /> Select Time</h2>

              {bookingData.serviceDate === new Date().toISOString().split('T')[0] && (
                <p className="booking-time-notice">
                  Only future time slots are shown for today.
                </p>
              )}

              <p className="booking-hours-notice">
                Regular hours: 8:00 AM - 6:00 PM. Slots outside these hours incur a $50 emergency fee.
              </p>

              {availableTimeSlots.length === 0 ? (
                <div className="alert alert-warning">
                  No time slots available for today. Please select a future date.
                </div>
              ) : (
                <div className="time-grid">
                  {availableTimeSlots.map((time) => {
                    const isEmergency = isOutsideServiceHours(time);
                    return (
                      <button
                        key={time}
                        className={`time-slot ${bookingData.serviceTime === time ? 'selected' : ''} ${isEmergency ? 'time-slot-emergency' : ''}`}
                        onClick={() => handleTimeSelect(time)}
                        type="button"
                        title={isEmergency ? `Emergency slot - $${EMERGENCY_FEE} extra fee applies` : ''}
                      >
                        <span className="time-slot-time">{time}</span>
                        <span className={`time-slot-meta ${isEmergency ? 'time-slot-meta-emergency' : 'time-slot-meta-regular'}`}>
                          {getTimeSlotLabel(time)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <ErrorMessage message={errors.serviceTime} />
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
                <div className="summary-item"><strong>Base Price:</strong> ${selectedService?.price ?? '-'}</div>
                {isOutsideServiceHours(bookingData.serviceTime) && (
                  <div className="summary-item summary-emergency">
                    <strong>Emergency Fee:</strong> +${EMERGENCY_FEE}
                  </div>
                )}
                <div className="summary-total">
                  <strong>Total:</strong> ${selectedService ? selectedService.price + (isOutsideServiceHours(bookingData.serviceTime) ? EMERGENCY_FEE : 0) : '-'}
                </div>
              </div>

              <div className="form-group">
                <label><FaMapMarkerAlt /> Service Address</label>
                <AddressFields
                  value={bookingData.address}
                  onChange={handleAddressChange}
                  errors={errors.addressFields || {}}
                />
              </div>

              <div className="form-group">
                <label>Special Instructions</label>
                <textarea
                  name="specialInstructions"
                  value={bookingData.specialInstructions}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Any special instructions for the provider"
                  rows="3"
                />
              </div>

              <ErrorMessage message={providerAvailabilityError} />

              <div className="booking-actions">
                <button className="btn btn-outline" onClick={() => setStep(3)} type="button">Back</button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmClick}
                  type="button"
                  disabled={submitting || loadingProviders}
                >
                  {submitting ? 'Booking...' : 'Confirm & Book'}
                </button>
              </div>
            </div>
          )}
        </div>

        <Modal
          open={successModalOpen}
          title="Booking Confirmed"
          onClose={() => setSuccessModalOpen(false)}
          actions={
            <button type="button" className="btn btn-primary" onClick={() => navigate(`/booking-confirmation?id=${successBookingId}`)}>
              View Confirmation
            </button>
          }
        >
          <p>Your booking was successful. Redirecting you to the confirmation page.</p>
        </Modal>

        <Modal
          open={emergencyModalOpen}
          title="Outside Regular Service Hours"
          onClose={handleEmergencyCancel}
          actions={
            <>
              <button type="button" className="btn btn-outline" onClick={handleEmergencyCancel}>
                Cancel - Back to Services
              </button>
              <button type="button" className="btn btn-primary" onClick={handleEmergencyConfirm} disabled={submitting}>
                {submitting ? 'Booking...' : `Yes - Book for $${(selectedService?.price || 0) + EMERGENCY_FEE}`}
              </button>
            </>
          }
        >
          <p>
            This booking is <strong>outside regular service hours</strong> (8:00 AM - 6:00 PM).
          </p>
          <p>
            Emergency service requires an additional <strong>${EMERGENCY_FEE} fee</strong>.
          </p>
          <p className="booking-hours-notice">
            Do you want to continue with the emergency booking?
          </p>
        </Modal>

        <div className="booking-footer-actions">
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/services')} type="button">
            Back to Services
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceBooking;
