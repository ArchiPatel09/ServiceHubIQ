import React, { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTools, FaReceipt } from 'react-icons/fa';

const BOOKINGS_KEY = 'servicehubiq_bookings_v1';

const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const bookingIdParam = params.get('id'); // e.g. ?id=1700000000000

  const booking = useMemo(() => {
    const all = safeParse(localStorage.getItem(BOOKINGS_KEY), []);
    if (!all.length) return null;

    // If id exists in URL, find it, else show latest booking
    if (bookingIdParam) {
      const idNum = Number(bookingIdParam);
      return all.find(b => Number(b.id) === idNum) || all[0];
    }
    return all[0];
  }, [bookingIdParam]);

  if (!booking) {
    return (
      <div className="booking-confirmation-page">
        <div className="booking-container">
          <h1>Booking Confirmation</h1>
          <p>No booking found. Please book a service first.</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <Link className="btn btn-primary" to="/services">Browse Services</Link>
            <Link className="btn btn-outline" to="/dashboard">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-confirmation-page">
      <div className="booking-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <FaCheckCircle size={28} />
          <div>
            <h1 style={{ margin: 0 }}>Booking Confirmed!</h1>
            <p style={{ margin: 0, opacity: 0.8 }}>Your service has been successfully scheduled.</p>
          </div>
        </div>

        <div className="booking-summary" style={{ marginTop: 12 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaReceipt /> Confirmation Details
          </h3>

          <div className="summary-item">
            <strong>Booking ID:</strong> {booking.id}
          </div>

          <div className="summary-item">
            <strong><FaTools /> Service:</strong> {booking.service}
          </div>

          <div className="summary-item">
            <strong>Provider:</strong> {booking.provider || '—'}
          </div>

          <div className="summary-item">
            <strong><FaCalendarAlt /> Date:</strong> {booking.date}
          </div>

          <div className="summary-item">
            <strong><FaClock /> Time:</strong> {booking.time}
          </div>

          <div className="summary-item">
            <strong><FaMapMarkerAlt /> Address:</strong> {booking.address || '—'}
          </div>

          <div className="summary-total">
            <strong>Total:</strong> ${booking.price}
          </div>

          {booking.specialInstructions && (
            <div className="booking-review" style={{ marginTop: 10 }}>
              <strong>Special Instructions:</strong> {booking.specialInstructions}
            </div>
          )}
        </div>

        <div className="booking-actions" style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" to="/booking-history">View Booking History</Link>
          <Link className="btn btn-outline" to="/dashboard">Back to Dashboard</Link>
          <button className="btn btn-outline" onClick={() => navigate('/services')} type="button">
            Book Another Service
          </button>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7 }}>
          Note: For Sprint 1, bookings are stored in browser localStorage for demo persistence.
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
