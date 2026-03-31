import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentCancel = () => {
  const [params] = useSearchParams();
  const bookingId = params.get('bookingId');

  return (
    <div className="payment-status-page">
      <div className="payment-status-card">
        <h1>Payment Cancelled</h1>
        <p>Your booking is still saved. You can return and complete payment whenever you are ready.</p>

        <div className="payment-status-actions">
          <Link to={bookingId ? `/booking-confirmation?id=${bookingId}` : '/booking-history'} className="btn btn-primary">
            Retry Payment
          </Link>
          <Link to="/services" className="btn btn-outline">
            Browse Services
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
