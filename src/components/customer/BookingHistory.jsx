import React, { useEffect, useMemo, useState } from 'react';
import { FaSearch, FaStar, FaCalendarAlt, FaTools } from 'react-icons/fa';
import { bookingAPI, ratingAPI, extractApiError } from '../../services/api';
import { formatServicePrice } from '../../utils/servicePricing';
import { SERVICE_LABELS } from '../../services/constants';
import ErrorMessage from '../shared/ErrorMessage';
import Modal from '../shared/Modal';

const normalizeStatus = (status) => (status || '').toLowerCase();

const statusToUi = (status) => {
  if (status === 'Pending') return 'Upcoming';
  if (status === 'In Progress') return 'In Progress';
  if (status === 'Completed') return 'Completed';
  if (status === 'Cancelled') return 'Cancelled';
  return status || 'Unknown';
};

const formatDate = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString();
};

const formatTime = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const BookingHistory = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, reviewText: '' });
  const [savingReview, setSavingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingAPI.getCustomerBookings();
        const data = response?.data?.data || [];

        const mapped = data.map((booking) => ({
          id: booking._id,
          providerId: booking.providerId,
          service: SERVICE_LABELS[booking.serviceType] || booking.serviceType,
          provider: booking.providerId?.name || 'Assigned Provider',
          date: formatDate(booking.date),
          time: formatTime(booking.date),
          status: statusToUi(booking.status),
          rawStatus: booking.status,
          price: formatServicePrice(booking.serviceType, booking.price),
          rating: typeof booking.rating === 'number' ? booking.rating : null,
          reviewText: booking.review || null,
          isEmergencyService: booking.isEmergencyService || false,
          extraFee: booking.extraFee || 0
        }));

        setBookings(mapped);
      } catch (err) {
        setError(extractApiError(err, 'Failed to load booking history'));
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return bookings.filter((b) => {
      if (filter !== 'all' && normalizeStatus(b.status) !== filter) return false;
      if (term) {
        return b.service.toLowerCase().includes(term) || b.provider.toLowerCase().includes(term);
      }
      return true;
    });
  }, [bookings, filter, searchTerm]);

  const getStatusBadgeClass = (status) => {
    switch (normalizeStatus(status)) {
      case 'completed':
        return 'badge-success';
      case 'in progress':
        return 'badge-warning';
      case 'upcoming':
        return 'badge-secondary';
      case 'cancelled':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  const stats = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter((b) => normalizeStatus(b.status) === 'completed').length;
    const rated = bookings.filter((b) => typeof b.rating === 'number');
    const avgRating = rated.length
      ? (rated.reduce((sum, b) => sum + b.rating, 0) / rated.length).toFixed(1)
      : '-';
    return { total, completed, avgRating };
  }, [bookings]);

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
        prev.map((b) =>
          b.id === selectedBooking.id
            ? { ...b, rating: ratingValue, reviewText: reviewText || null }
            : b
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
        <p>View and manage your past and upcoming service bookings</p>
      </div>

      <ErrorMessage message={error} className="form-error-global" />

      <div className="history-controls">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search services or providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          {['all', 'completed', 'upcoming', 'in progress', 'cancelled'].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f.replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="empty-history"><h3>Loading bookings...</h3></div>
      ) : filteredBookings.length > 0 ? (
        <div className="bookings-list">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div className="booking-title">
                  <FaTools className="service-icon" />
                  <div>
                    <h3>{booking.service}</h3>
                    <p className="provider-name">by {booking.provider}</p>
                    {booking.isEmergencyService && (
                      <span className="booking-emergency-badge">
                        Emergency Service (+${booking.extraFee})
                      </span>
                    )}
                  </div>
                </div>
                <div className={`booking-status ${getStatusBadgeClass(booking.status)}`}>
                  {booking.status}
                </div>
              </div>

              <div className="booking-details">
                <div className="detail-item">
                  <FaCalendarAlt className="detail-icon" />
                  <div><strong>Date:</strong> {booking.date} at {booking.time}</div>
                </div>
                <div className="detail-item">
                  <strong>Price:</strong> {booking.price}
                </div>
                {typeof booking.rating === 'number' && (
                  <div className="detail-item booking-rating">
                    <strong>Your Rating:</strong> {renderStars(booking.rating)}
                  </div>
                )}
              </div>

              {booking.reviewText && (
                <div className="booking-review">
                  <strong>Your review:</strong> {booking.reviewText}
                </div>
              )}

              {normalizeStatus(booking.status) === 'completed' && (
                <div className="booking-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    type="button"
                    onClick={() => openReviewModal(booking)}
                  >
                    {booking.rating ? 'Edit Review' : 'Rate & Review'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-history">
          <h3>No bookings found</h3>
          <p>Try adjusting your filters or book your first service!</p>
        </div>
      )}

      <div className="history-stats">
        <div className="stat-item"><h4>Total Bookings</h4><p className="stat-number">{stats.total}</p></div>
        <div className="stat-item"><h4>Completed</h4><p className="stat-number">{stats.completed}</p></div>
        <div className="stat-item"><h4>Average Rating</h4><p className="stat-number">{stats.avgRating}</p></div>
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
          <strong>{selectedBooking?.service}</strong> - by {selectedBooking?.provider}
        </p>

        <ErrorMessage message={reviewError} />
        {reviewSuccess && (
          <p className="review-success-text">{reviewSuccess}</p>
        )}

        <div className="form-group">
          <label><strong>Rating</strong></label>
          {renderStars(
            reviewForm.rating,
            true,
            (star) => setReviewForm((prev) => ({ ...prev, rating: star }))
          )}
          <p className="rating-helper-text">
            {reviewForm.rating} / 5 stars selected
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="review-textarea"><strong>Review</strong> (optional)</label>
          <textarea
            id="review-textarea"
            rows={4}
            className="form-control"
            placeholder="Share your experience with this service..."
            value={reviewForm.reviewText}
            onChange={(e) =>
              setReviewForm((prev) => ({ ...prev, reviewText: e.target.value }))
            }
            maxLength={1000}
          />
          <p className="review-char-count">
            {reviewForm.reviewText.length}/1000
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default BookingHistory;
