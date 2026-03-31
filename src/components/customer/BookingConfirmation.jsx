import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  FaCheckCircle,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaTools,
  FaReceipt,
  FaCreditCard,
  FaMapMarkedAlt,
  FaSyncAlt
} from 'react-icons/fa';
import { bookingAPI, extractApiError, paymentAPI, SOCKET_BASE_URL } from '../../services/api';
import { formatServicePrice } from '../../utils/servicePricing';
import { SERVICE_LABELS } from '../../services/constants';
import { formatAddress } from '../../utils/address';
import ErrorMessage from '../shared/ErrorMessage';
import LiveTrackingMap from '../shared/LiveTrackingMap';

const TRACKABLE_STATUSES = ['Pending', 'In Progress'];
const PAYMENT_LABELS = {
  unpaid: 'Unpaid',
  pending: 'Payment Pending',
  paid: 'Paid',
  failed: 'Payment Failed',
  cancelled: 'Payment Cancelled'
};

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const bookingIdParam = params.get('id');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [creatingCheckout, setCreatingCheckout] = useState(false);
  const [tracking, setTracking] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [etaText, setEtaText] = useState('');

  const socketRef = useRef(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const response = await bookingAPI.getCustomerBookings();
        const bookings = response?.data?.data || [];

        if (!bookings.length) {
          setBooking(null);
          return;
        }

        let chosen = bookings[0];
        if (bookingIdParam) {
          const found = bookings.find((b) => b._id === bookingIdParam);
          if (found) chosen = found;
        }

        setBooking(chosen);
      } catch (err) {
        setError(extractApiError(err, 'Could not load booking confirmation'));
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingIdParam]);

  const formatted = useMemo(() => {
    if (!booking) return null;
    const dateObj = booking.date ? new Date(booking.date) : null;
    const serviceLabel = SERVICE_LABELS[booking.serviceType] || booking.serviceType;
    const basePrice = typeof booking.price === 'number' ? booking.price : null;
    const totalAmount = typeof booking.totalAmount === 'number'
      ? booking.totalAmount
      : (basePrice || 0) + (booking.extraFee || 0);

    return {
      id: booking._id,
      service: serviceLabel,
      provider: booking.providerId?.name || 'Assigned Provider',
      date: dateObj ? dateObj.toLocaleDateString() : '-',
      time: dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
      address: booking.address,
      status: booking.status,
      basePrice,
      price: formatServicePrice(booking.serviceType, booking.price),
      totalAmount,
      paymentStatus: booking.paymentStatus || 'unpaid',
      paymentPaidAt: booking.paymentPaidAt ? new Date(booking.paymentPaidAt).toLocaleString() : '',
      isEmergencyService: booking.isEmergencyService || false,
      extraFee: booking.extraFee || 0
    };
  }, [booking]);

  useEffect(() => {
    if (!booking?._id || !TRACKABLE_STATUSES.includes(booking.status)) {
      setTracking(null);
      setTrackingError('');
      setEtaText('');
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return undefined;
    }

    let isMounted = true;
    const token = localStorage.getItem('token');

    const clearPolling = () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };

    const loadTracking = async (silent = false) => {
      try {
        if (!silent) setTrackingLoading(true);
        const response = await bookingAPI.getTracking(booking._id);
        if (!isMounted) return;
        const trackingPayload = response?.data?.data || null;
        setTracking(trackingPayload);
        if (trackingPayload?.provider?.location) {
          setTrackingError('');
        }
      } catch (err) {
        if (!isMounted) return;
        setTrackingError(extractApiError(err, 'Live tracking is not available yet.'));
      } finally {
        if (isMounted && !silent) {
          setTrackingLoading(false);
        }
      }
    };

    const startPolling = () => {
      if (pollingRef.current) return;
      pollingRef.current = setInterval(() => {
        loadTracking(true);
      }, 5000);
    };

    loadTracking();
    // Keep polling until at least one provider location arrives. This covers the case where
    // the customer screen opens before the provider starts sharing.
    startPolling();

    if (token) {
      const socket = io(SOCKET_BASE_URL, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('joinBookingRoom', { bookingId: booking._id }, (ack) => {
          if (!isMounted) return;
          if (ack?.success && ack.data) {
            setTracking(ack.data);
            if (ack.data.provider?.location) {
              setTrackingError('');
              clearPolling();
            }
          }
        });
      });

      socket.on('locationUpdate', (payload) => {
        if (!isMounted) return;
        setTracking(payload);
        setTrackingError('');
        clearPolling();
      });

      socket.on('connect_error', () => {
        if (!isMounted) return;
        setTrackingError('Real-time connection is unavailable. Refreshing location automatically instead.');
      });
    }

    return () => {
      isMounted = false;
      clearPolling();
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [booking?._id, booking?.status]);

  const handleCheckout = async () => {
    if (!booking?._id) return;

    try {
      setCreatingCheckout(true);
      setPaymentError('');
      const response = await paymentAPI.createCheckoutSession(booking._id);
      const checkout = response?.data?.data;
      setBooking((prev) => (prev ? { ...prev, paymentStatus: checkout?.paymentStatus || 'pending' } : prev));

      if (checkout?.url) {
        window.location.assign(checkout.url);
        return;
      }

      throw new Error('Stripe checkout URL was not returned');
    } catch (err) {
      setPaymentError(extractApiError(err, 'Could not start payment checkout.'));
    } finally {
      setCreatingCheckout(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-confirmation-page">
        <div className="booking-container">
          <h1>Booking Confirmation</h1>
          <p>Loading booking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-confirmation-page">
        <div className="booking-container">
          <h1>Booking Confirmation</h1>
          <ErrorMessage message={error} className="form-error-global" />
          <div className="booking-confirmation-actions">
            <Link className="btn btn-primary" to="/services">Browse Services</Link>
            <Link className="btn btn-outline" to="/customer-dashboard">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!formatted) {
    return (
      <div className="booking-confirmation-page">
        <div className="booking-container">
          <h1>Booking Confirmation</h1>
          <p>No booking found. Please book a service first.</p>
          <div className="booking-confirmation-actions">
            <Link className="btn btn-primary" to="/services">Browse Services</Link>
            <Link className="btn btn-outline" to="/customer-dashboard">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  const destinationAddress = formatAddress(formatted.address);

  return (
    <div className="booking-confirmation-page">
      <div className="booking-container">
        <div className="booking-confirmation-header">
          <FaCheckCircle size={28} className="booking-confirmation-icon" />
          <div>
            <h1 className="booking-confirmation-title">Booking Confirmed!</h1>
            <p className="booking-confirmation-subtitle">Your service has been successfully scheduled.</p>
          </div>
        </div>

        <div className="booking-summary booking-confirmation-summary">
          <h3 className="booking-confirmation-summary-title"><FaReceipt /> Confirmation Details</h3>
          <div className="summary-item"><strong>Booking ID:</strong> {formatted.id}</div>
          <div className="summary-item"><strong><FaTools /> Service:</strong> {formatted.service}</div>
          <div className="summary-item"><strong>Provider:</strong> {formatted.provider}</div>
          <div className="summary-item"><strong><FaCalendarAlt /> Date:</strong> {formatted.date}</div>
          <div className="summary-item"><strong><FaClock /> Time:</strong> {formatted.time}</div>
          <div className="summary-item"><strong><FaMapMarkerAlt /> Address:</strong> {destinationAddress || '-'}</div>
          <div className="summary-item"><strong>Base Price:</strong> {formatted.price}</div>
          {formatted.isEmergencyService && (
            <div className="summary-item"><strong>Emergency Fee:</strong> +${formatted.extraFee}</div>
          )}
          <div className="summary-item"><strong>Total:</strong> ${formatted.totalAmount}</div>
          <div className="summary-item"><strong>Status:</strong> {formatted.status}</div>
        </div>

        <div className="booking-summary booking-payment-panel">
          <h3 className="booking-confirmation-summary-title"><FaCreditCard /> Payment</h3>
          <div className="payment-summary-row">
            <span className={`payment-status-badge payment-status-${formatted.paymentStatus}`}>
              {PAYMENT_LABELS[formatted.paymentStatus] || formatted.paymentStatus}
            </span>
            <span className="payment-total-copy">Amount due: ${formatted.totalAmount}</span>
          </div>
          {formatted.paymentPaidAt && (
            <p className="payment-panel-note">Paid on {formatted.paymentPaidAt}</p>
          )}
          {!formatted.paymentPaidAt && (
            <p className="payment-panel-note">Payments are processed securely with Stripe Checkout.</p>
          )}
          <ErrorMessage message={paymentError} />
          {formatted.paymentStatus !== 'paid' && (
            <button className="btn btn-primary" type="button" onClick={handleCheckout} disabled={creatingCheckout}>
              {creatingCheckout ? 'Redirecting to Stripe...' : 'Pay Now'}
            </button>
          )}
        </div>

        {TRACKABLE_STATUSES.includes(formatted.status) && (
          <div className="booking-summary booking-tracking-panel">
            <div className="payment-summary-row">
              <h3 className="booking-confirmation-summary-title"><FaMapMarkedAlt /> Live Tracking</h3>
              <button className="btn btn-outline btn-sm" type="button" onClick={() => bookingAPI.getTracking(booking._id).then((response) => setTracking(response?.data?.data || null)).catch((err) => setTrackingError(extractApiError(err, 'Could not refresh live tracking.')))}>
                <FaSyncAlt /> Refresh Location
              </button>
            </div>
            {trackingLoading ? (
              <p>Loading provider location...</p>
            ) : (
              <>
                <LiveTrackingMap
                  providerLocation={tracking?.provider?.location || null}
                  destinationAddress={destinationAddress}
                  onEtaChange={setEtaText}
                />
                <div className="tracking-panel-copy">
                  <p>
                    {tracking?.provider?.location
                      ? 'Your provider is sharing live location updates.'
                      : 'Waiting for your provider to start sharing live location from the provider dashboard.'}
                  </p>
                  {etaText && <p className="tracking-eta">{etaText}</p>}
                  {tracking?.provider?.location?.updatedAt && (
                    <p className="tracking-timestamp">
                      Last updated: {new Date(tracking.provider.location.updatedAt).toLocaleTimeString()}
                    </p>
                  )}
                  <ErrorMessage message={trackingError} />
                </div>
              </>
            )}
          </div>
        )}

        <div className="booking-actions booking-confirmation-actions">
          <Link className="btn btn-primary" to="/booking-history">View Booking History</Link>
          <Link className="btn btn-outline" to="/customer-dashboard">Back to Dashboard</Link>
          <button className="btn btn-outline" onClick={() => navigate('/services')} type="button">Book Another Service</button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
