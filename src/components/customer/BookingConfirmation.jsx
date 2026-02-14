import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTools, FaReceipt } from 'react-icons/fa';
import { bookingAPI, extractApiError } from '../../services/api';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const bookingIdParam = params.get('id');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    return {
      id: booking._id,
      service: booking.serviceType,
      provider: booking.providerId?.name || 'Assigned Provider',
      date: dateObj ? dateObj.toLocaleDateString() : '-',
      time: dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
      address: booking.address,
      status: booking.status
    };
  }, [booking]);

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
          <p>{error}</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <Link className="btn btn-primary" to="/services">Browse Services</Link>
            <Link className="btn btn-outline" to="/dashboard">Back to Dashboard</Link>
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
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaReceipt /> Confirmation Details</h3>
          <div className="summary-item"><strong>Booking ID:</strong> {formatted.id}</div>
          <div className="summary-item"><strong><FaTools /> Service:</strong> {formatted.service}</div>
          <div className="summary-item"><strong>Provider:</strong> {formatted.provider}</div>
          <div className="summary-item"><strong><FaCalendarAlt /> Date:</strong> {formatted.date}</div>
          <div className="summary-item"><strong><FaClock /> Time:</strong> {formatted.time}</div>
          <div className="summary-item"><strong><FaMapMarkerAlt /> Address:</strong> {formatted.address || '-'}</div>
          <div className="summary-item"><strong>Status:</strong> {formatted.status}</div>
        </div>

        <div className="booking-actions" style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" to="/booking-history">View Booking History</Link>
          <Link className="btn btn-outline" to="/dashboard">Back to Dashboard</Link>
          <button className="btn btn-outline" onClick={() => navigate('/services')} type="button">Book Another Service</button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
