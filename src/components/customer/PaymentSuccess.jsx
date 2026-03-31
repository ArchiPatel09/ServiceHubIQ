import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { bookingAPI, paymentAPI, extractApiError } from '../../services/api';
import ErrorMessage from '../shared/ErrorMessage';

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const bookingId = params.get('bookingId');
  const sessionId = params.get('session_id');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBooking = async () => {
      try {
        setLoading(true);
        setError('');

        if (sessionId) {
          await paymentAPI.syncCheckoutSession(sessionId);
        }

        if (!bookingId) {
          setBooking(null);
          return;
        }

        const response = await bookingAPI.getCustomerBookings();
        const bookings = response?.data?.data || [];
        const matched = bookings.find((item) => item.id === bookingId || item._id === bookingId) || null;
        setBooking(matched);
      } catch (err) {
        setError(extractApiError(err, 'Could not verify payment status yet.'));
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId, sessionId]);

  return (
    <div className="payment-status-page">
      <div className="payment-status-card">
        <h1>Payment Successful</h1>
        <p>Your Stripe checkout has finished. We are syncing the final payment status with your booking.</p>
        <ErrorMessage message={error} />
        {loading ? (
          <p>Checking booking payment status...</p>
        ) : booking ? (
          <div className="payment-status-summary">
            <div><strong>Booking ID:</strong> {booking.id || booking._id}</div>
            <div><strong>Payment Status:</strong> {booking.paymentStatus || 'pending'}</div>
            <div><strong>Total:</strong> ${booking.totalAmount || booking.price || 0}</div>
          </div>
        ) : (
          <p>Your booking will appear here once payment sync completes.</p>
        )}

        <div className="payment-status-actions">
          <Link to={bookingId ? `/booking-confirmation?id=${bookingId}` : '/booking-history'} className="btn btn-primary">
            View Booking
          </Link>
          <Link to="/booking-history" className="btn btn-outline">
            Booking History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
