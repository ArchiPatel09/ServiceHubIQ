import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import {
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaCreditCard,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSearch,
  FaStar,
  FaSyncAlt,
  FaTools,
  FaUserTie
} from 'react-icons/fa';
import { bookingAPI, paymentAPI, ratingAPI, extractApiError, SOCKET_BASE_URL } from '../../services/api';
import { formatServicePrice } from '../../utils/servicePricing';
import { SERVICE_LABELS } from '../../services/constants';
import { formatAddress } from '../../utils/address';
import ErrorMessage from '../shared/ErrorMessage';
import Modal from '../shared/Modal';
import LiveTrackingMap from '../shared/LiveTrackingMap';

const HISTORY_FILTERS = ['all', 'pending', 'in progress', 'completed', 'cancelled'];
const TRACKABLE_STATUSES = ['Pending', 'In Progress'];
const PAYMENT_LABELS = {
  unpaid: 'Unpaid',
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  cancelled: 'Cancelled'
};

const toFilterBucket = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'in progress') return 'in progress';
  if (normalized === 'completed') return 'completed';
  if (normalized === 'cancelled') return 'cancelled';
  return 'pending';
};

const formatDate = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString();
};

const formatTime = (time, iso) => {
  if (time) return time;
  if (!iso) return '-';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Completed':
      return 'history-status-completed';
    case 'In Progress':
      return 'history-status-progress';
    case 'Cancelled':
      return 'history-status-cancelled';
    default:
      return 'history-status-pending';
  }
};

const canTrackBooking = (booking) => TRACKABLE_STATUSES.includes(booking.rawStatus) && !booking.isExpired;
const canPayBooking = (booking) => !booking.isExpired && !['Cancelled', 'Completed'].includes(booking.rawStatus) && !['paid', 'cancelled'].includes(booking.paymentStatus);
const canCancelBooking = (booking) => booking.rawStatus === 'Pending' && !booking.isExpired && booking.paymentStatus !== 'paid';

const mapBookingFromApi = (booking) => {
  const provider = booking.provider || booking.providerId || {};
  const rawStatus = booking.bookingStatus || booking.status || 'Pending';
  const serviceType = booking.serviceType || '';
  const providerCoordinates = booking.coordinates?.provider || provider.location || provider.currentLocation || null;
  const priceValue = typeof booking.price === 'number' ? booking.price : null;
  const totalAmount = typeof booking.totalAmount === 'number'
    ? booking.totalAmount
    : (priceValue || 0) + Number(booking.extraFee || 0);
  const isExpired = typeof booking.isExpired === 'boolean'
    ? booking.isExpired
    : (booking.date ? new Date(booking.date).getTime() < Date.now() && !['Completed', 'Cancelled'].includes(rawStatus) : false);

  return {
    ...booking,
    id: booking.id || booking._id,
    service: booking.serviceName || SERVICE_LABELS[serviceType] || serviceType,
    serviceType,
    providerName: provider.name || 'Assigned Provider',
    providerEmail: provider.email || '',
    providerPhone: provider.phone || '',
    providerService: provider.service || provider.providerService || '',
    providerLocationLabel: provider.locationLabel || formatAddress(provider.address),
    providerCoordinates,
    dateLabel: formatDate(booking.date),
    timeLabel: formatTime(booking.time, booking.date),
    rawStatus,
    filterBucket: toFilterBucket(rawStatus),
    price: formatServicePrice(serviceType, booking.price),
    priceValue,
    totalAmount,
    paymentStatus: booking.paymentStatus || 'unpaid',
    rating: typeof booking.rating === 'number' ? booking.rating : null,
    reviewText: booking.review || booking.reviewText || '',
    addressLabel: formatAddress(booking.address),
    isEmergencyService: Boolean(booking.isEmergencyService),
    extraFee: Number(booking.extraFee || 0),
    isExpired,
    detailsText: booking.details || '',
    coordinates: {
      provider: providerCoordinates,
      customer: booking.coordinates?.customer || null
    }
  };
};

const BookingHistory = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedBookingId, setExpandedBookingId] = useState('');
  const [processingPaymentId, setProcessingPaymentId] = useState('');
  const [cancellingBookingId, setCancellingBookingId] = useState('');
  const [actionErrors, setActionErrors] = useState({});
  const [actionSuccess, setActionSuccess] = useState({});
  const [trackingBookingId, setTrackingBookingId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [trackingEta, setTrackingEta] = useState('');

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, reviewText: '' });
  const [savingReview, setSavingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const socketRef = useRef(null);
  const pollingRef = useRef(null);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bookingAPI.getCustomerBookings();
      const data = response?.data?.data || [];
      setBookings(data.map(mapBookingFromApi));
    } catch (err) {
      setError(extractApiError(err, 'Failed to load booking history'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    if (!trackingBookingId) {
      setTrackingData(null);
      setTrackingError('');
      setTrackingEta('');
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

    const booking = bookings.find((item) => item.id === trackingBookingId);
    if (!booking || !canTrackBooking(booking)) {
      setTrackingBookingId('');
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
        const response = await bookingAPI.getTracking(booking.id);
        if (!isMounted) return;
        const payload = response?.data?.data || null;
        setTrackingData(payload);
        if (payload?.provider?.location) {
          setTrackingError('');
        }
      } catch (err) {
        if (!isMounted) return;
        setTrackingError(extractApiError(err, 'Live tracking is not available yet.'));
      } finally {
        if (!silent && isMounted) {
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
    startPolling();

    if (token) {
      const socket = io(SOCKET_BASE_URL, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('joinBookingRoom', { bookingId: booking.id }, (ack) => {
          if (!isMounted) return;
          if (ack?.success && ack.data) {
            setTrackingData(ack.data);
            if (ack.data.provider?.location) {
              setTrackingError('');
              clearPolling();
            }
          }
        });
      });

      socket.on('locationUpdate', (payload) => {
        if (!isMounted) return;
        setTrackingData(payload);
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
  }, [bookings, trackingBookingId]);

  const filteredBookings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return bookings.filter((booking) => {
      if (filter !== 'all' && booking.filterBucket !== filter) return false;
      if (!term) return true;

      return [
        booking.service,
        booking.providerName,
        booking.addressLabel,
        booking.rawStatus,
        booking.paymentStatus
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [bookings, filter, searchTerm]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter((booking) => booking.rawStatus === 'Completed').length;
    const paid = bookings.filter((booking) => booking.paymentStatus === 'paid').length;
    return { total, completed, paid };
  }, [bookings]);

  const clearBookingMessage = (bookingId) => {
    setActionErrors((prev) => ({ ...prev, [bookingId]: '' }));
    setActionSuccess((prev) => ({ ...prev, [bookingId]: '' }));
  };

  const handleToggleExpand = (bookingId) => {
    setExpandedBookingId((prev) => {
      const nextValue = prev === bookingId ? '' : bookingId;
      if (!nextValue && trackingBookingId === bookingId) {
        setTrackingBookingId('');
      }
      return nextValue;
    });
  };

  const handlePayNow = async (booking) => {
    clearBookingMessage(booking.id);

    try {
      setProcessingPaymentId(booking.id);
      const response = await paymentAPI.createCheckoutSession(booking.id);
      const checkout = response?.data?.data;

      setBookings((prev) =>
        prev.map((item) =>
          item.id === booking.id
            ? { ...item, paymentStatus: checkout?.paymentStatus || 'pending' }
            : item
        )
      );

      if (!checkout?.url) {
        throw new Error('Stripe checkout URL was not returned');
      }

      window.location.assign(checkout.url);
    } catch (err) {
      setActionErrors((prev) => ({
        ...prev,
        [booking.id]: extractApiError(err, 'Could not start Stripe checkout for this booking.')
      }));
    } finally {
      setProcessingPaymentId('');
    }
  };

  const handleCancelBooking = async (booking) => {
    clearBookingMessage(booking.id);

    try {
      setCancellingBookingId(booking.id);
      const response = await bookingAPI.cancelBooking(booking.id);
      const updated = mapBookingFromApi(response?.data?.data || {});

      setBookings((prev) => prev.map((item) => (item.id === booking.id ? updated : item)));
      setActionSuccess((prev) => ({ ...prev, [booking.id]: 'Booking cancelled successfully.' }));

      if (trackingBookingId === booking.id) {
        setTrackingBookingId('');
      }
    } catch (err) {
      setActionErrors((prev) => ({
        ...prev,
        [booking.id]: extractApiError(err, 'Could not cancel this booking.')
      }));
    } finally {
      setCancellingBookingId('');
    }
  };

  const handleToggleTracking = (booking) => {
    clearBookingMessage(booking.id);
    setExpandedBookingId(booking.id);

    if (trackingBookingId === booking.id) {
      setTrackingBookingId('');
      return;
    }

    setTrackingData(null);
    setTrackingError('');
    setTrackingEta('');
    setTrackingBookingId(booking.id);
  };

  const refreshTracking = async (booking) => {
    try {
      setTrackingLoading(true);
      const response = await bookingAPI.getTracking(booking.id);
      setTrackingData(response?.data?.data || null);
      setTrackingError('');
    } catch (err) {
      setTrackingError(extractApiError(err, 'Could not refresh live tracking.'));
    } finally {
      setTrackingLoading(false);
    }
  };

  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setReviewForm({ rating: booking.rating || 5, reviewText: booking.reviewText || '' });
    setReviewError('');
    setReviewSuccess('');
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedBooking(null);
    setReviewForm({ rating: 5, reviewText: '' });
    setReviewError('');
    setReviewSuccess('');
  };

  const saveReview = async () => {
    const ratingValue = Number(reviewForm.rating);
    const reviewText = reviewForm.reviewText.trim();

    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      setReviewError('Please select a rating between 1 and 5.');
      return;
    }

    try {
      setSavingReview(true);
      setReviewError('');

      await ratingAPI.submitRating({
        bookingId: selectedBooking.id,
        rating: ratingValue,
        reviewText
      });

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBooking.id
            ? { ...booking, rating: ratingValue, reviewText: reviewText || '' }
            : booking
        )
      );

      setReviewSuccess('Your review has been saved!');
      setTimeout(closeReviewModal, 1200);
    } catch (err) {
      setReviewError(extractApiError(err, 'Failed to save review. Please try again.'));
    } finally {
      setSavingReview(false);
    }
  };

  const renderStars = (value, interactive = false, onSelect = () => {}) => {
    if (!interactive) {
      return (
        <span className="rating-pill" aria-label={`Rated ${value} out of 5`}>
          <FaStar className="rating-pill-icon" />
          {value}/5
        </span>
      );
    }

    return (
      <div className="star-rating" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star ${star <= value ? 'filled' : ''}`}
            onClick={() => onSelect(star)}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <FaStar />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="booking-history-page">
      <div className="history-header">
        <h1>Service History</h1>
        <p>View, pay for, track, and manage your past and upcoming service bookings.</p>
      </div>

      <ErrorMessage message={error} className="form-error-global" />

      <div className="history-controls">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search services, providers, or addresses..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          {HISTORY_FILTERS.map((item) => (
            <button
              key={item}
              className={`filter-btn ${filter === item ? 'active' : ''}`}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item === 'all' ? 'All' : item.replace(/\b\w/g, (char) => char.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="empty-history"><h3>Loading bookings...</h3></div>
      ) : filteredBookings.length > 0 ? (
        <div className="bookings-list history-accordion-list">
          {filteredBookings.map((booking) => {
            const expanded = expandedBookingId === booking.id;
            const showingTracking = trackingBookingId === booking.id;
            const paymentLabel = PAYMENT_LABELS[booking.paymentStatus] || booking.paymentStatus;

            return (
              <div key={booking.id} className={`booking-card booking-history-card ${expanded ? 'expanded' : ''}`}>
                <button
                  type="button"
                  className="booking-history-summary"
                  onClick={() => handleToggleExpand(booking.id)}
                >
                  <div className="booking-history-summary-main">
                    <div className="booking-title">
                      <FaTools className="service-icon" />
                      <div>
                        <h3>{booking.service}</h3>
                        <p className="provider-name">by {booking.providerName}</p>
                      </div>
                    </div>
                    <div className="booking-history-summary-meta">
                      <span><FaCalendarAlt /> {booking.dateLabel}</span>
                      <span><FaClock /> {booking.timeLabel}</span>
                    </div>
                  </div>

                  <div className="booking-history-summary-side">
                    <span className={`booking-status-badge ${getStatusBadgeClass(booking.rawStatus)}`}>
                      {booking.rawStatus}
                    </span>
                    <span className={`payment-status-badge payment-status-${booking.paymentStatus}`}>
                      {paymentLabel}
                    </span>
                    <span className="accordion-toggle-icon">
                      {expanded ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </div>
                </button>

                <div className={`history-accordion-body ${expanded ? 'expanded' : ''}`}>
                  <div className="history-accordion-inner">
                    <div className="booking-history-detail-grid">
                      <div className="booking-history-detail-card">
                        <h4><FaTools /> Service Details</h4>
                        <p><strong>Service:</strong> {booking.service}</p>
                        <p><strong>Base Price:</strong> {booking.price}</p>
                        {booking.isEmergencyService && (
                          <p><strong>Emergency Fee:</strong> +${booking.extraFee}</p>
                        )}
                        <p><strong>Total:</strong> ${booking.totalAmount}</p>
                        <p><strong>Booking Status:</strong> {booking.rawStatus}</p>
                        <p><strong>Payment Status:</strong> {paymentLabel}</p>
                        {booking.detailsText && (
                          <p><strong>Notes:</strong> {booking.detailsText}</p>
                        )}
                      </div>

                      <div className="booking-history-detail-card">
                        <h4><FaUserTie /> Provider Details</h4>
                        <p><strong>Provider:</strong> {booking.providerName}</p>
                        {booking.providerService && <p><strong>Service Type:</strong> {booking.providerService}</p>}
                        {booking.providerEmail && <p><strong>Email:</strong> {booking.providerEmail}</p>}
                        {booking.providerPhone && (
                          <p><strong><FaPhoneAlt /> Phone:</strong> {booking.providerPhone}</p>
                        )}
                        {booking.providerLocationLabel && (
                          <p><strong>Provider Location:</strong> {booking.providerLocationLabel}</p>
                        )}
                      </div>

                      <div className="booking-history-detail-card">
                        <h4><FaMapMarkerAlt /> Booking Details</h4>
                        <p><strong>Address:</strong> {booking.addressLabel || '-'}</p>
                        <p><strong>Date:</strong> {booking.dateLabel}</p>
                        <p><strong>Time:</strong> {booking.timeLabel}</p>
                        {booking.isExpired && (
                          <p className="history-expired-note">This booking is expired. Payment and cancellation are disabled.</p>
                        )}
                        {booking.reviewText && (
                          <p><strong>Your Review:</strong> {booking.reviewText}</p>
                        )}
                        {typeof booking.rating === 'number' && (
                          <div className="detail-item booking-rating-inline">
                            <strong>Your Rating:</strong> {renderStars(booking.rating)}
                          </div>
                        )}
                      </div>
                    </div>

                    <ErrorMessage message={actionErrors[booking.id]} />
                    {actionSuccess[booking.id] && (
                      <p className="history-success-text">{actionSuccess[booking.id]}</p>
                    )}

                    <div className="booking-history-actions">
                      {canPayBooking(booking) && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handlePayNow(booking)}
                          disabled={processingPaymentId === booking.id}
                        >
                          <FaCreditCard /> {processingPaymentId === booking.id ? 'Redirecting...' : 'Pay Now'}
                        </button>
                      )}

                      {canTrackBooking(booking) && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleToggleTracking(booking)}
                        >
                          <FaMapMarkedAlt /> {showingTracking ? 'Hide Tracking' : 'Track Provider'}
                        </button>
                      )}

                      {canCancelBooking(booking) && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm history-cancel-btn"
                          onClick={() => handleCancelBooking(booking)}
                          disabled={cancellingBookingId === booking.id}
                        >
                          {cancellingBookingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}

                      {booking.rawStatus === 'Completed' && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => openReviewModal(booking)}
                        >
                          {booking.rating ? 'Edit Review' : 'Rate & Review'}
                        </button>
                      )}

                      {booking.rawStatus === 'Cancelled' && (
                        <button type="button" className="btn btn-outline btn-sm" disabled>
                          Booking Cancelled
                        </button>
                      )}
                    </div>

                    {showingTracking && (
                      <div className="booking-history-tracking-shell">
                        <div className="payment-summary-row">
                          <h4 className="booking-confirmation-summary-title"><FaMapMarkedAlt /> Provider Tracking</h4>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => refreshTracking(booking)}
                          >
                            <FaSyncAlt /> Refresh Location
                          </button>
                        </div>

                        {trackingLoading ? (
                          <p>Loading provider location...</p>
                        ) : (
                          <>
                            <LiveTrackingMap
                              providerLocation={trackingData?.provider?.location || booking.coordinates.provider || null}
                              destinationAddress={booking.addressLabel}
                              onEtaChange={setTrackingEta}
                            />
                            <div className="tracking-panel-copy">
                              <p>
                                {trackingData?.provider?.location || booking.coordinates.provider
                                  ? 'Live location is available for this booking.'
                                  : 'Waiting for the provider to start sharing location.'}
                              </p>
                              {trackingEta && <p className="tracking-eta">{trackingEta}</p>}
                              {(trackingData?.provider?.location?.updatedAt || booking.coordinates.provider?.updatedAt) && (
                                <p className="tracking-timestamp">
                                  Last updated: {new Date(trackingData?.provider?.location?.updatedAt || booking.coordinates.provider?.updatedAt).toLocaleTimeString()}
                                </p>
                              )}
                              <ErrorMessage message={trackingError} />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-history">
          <h3>No bookings found</h3>
          <p>Try adjusting your filters or book your first service.</p>
        </div>
      )}

      <div className="history-stats">
        <div className="stat-item"><h4>Total Bookings</h4><p className="stat-number">{stats.total}</p></div>
        <div className="stat-item"><h4>Completed</h4><p className="stat-number">{stats.completed}</p></div>
        <div className="stat-item"><h4>Paid</h4><p className="stat-number">{stats.paid}</p></div>
      </div>

      <Modal
        open={reviewModalOpen}
        title="Rate Your Service"
        onClose={closeReviewModal}
        actions={
          <>
            <button type="button" className="btn btn-outline" onClick={closeReviewModal}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={saveReview}
              disabled={savingReview}
            >
              {savingReview ? 'Saving...' : 'Save Review'}
            </button>
          </>
        }
      >
        <p className="review-modal-meta">
          <strong>{selectedBooking?.service}</strong> - by {selectedBooking?.providerName}
        </p>

        <ErrorMessage message={reviewError} />
        {reviewSuccess && <p className="review-success-text">{reviewSuccess}</p>}

        <div className="form-group">
          <label><strong>Rating</strong></label>
          {renderStars(
            reviewForm.rating,
            true,
            (star) => setReviewForm((prev) => ({ ...prev, rating: star }))
          )}
          <p className="rating-helper-text">{reviewForm.rating} / 5 stars selected</p>
        </div>

        <div className="form-group">
          <label htmlFor="review-textarea"><strong>Review</strong> (optional)</label>
          <textarea
            id="review-textarea"
            rows={4}
            className="form-control"
            placeholder="Share your experience with this service..."
            value={reviewForm.reviewText}
            onChange={(event) => setReviewForm((prev) => ({ ...prev, reviewText: event.target.value }))}
            maxLength={1000}
          />
          <p className="review-char-count">{reviewForm.reviewText.length}/1000</p>
        </div>
      </Modal>
    </div>
  );
};

export default BookingHistory;
