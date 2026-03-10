import React, { useEffect, useMemo, useState } from 'react';
import { FaSearch, FaStar, FaCalendarAlt, FaTools, FaTimes } from 'react-icons/fa';
import { bookingAPI, extractApiError } from '../../services/api';
import { formatServicePrice } from '../../utils/servicePricing';
import { SERVICE_LABELS } from '../../services/constants';

const normalizeStatus = (status) => (status || '').toLowerCase();

const statusToUi = (status) => {
  if (status === 'Pending') return 'Upcoming';
  if (status === 'In Progress') return 'In Progress';
  if (status === 'Completed') return 'Completed';
  return status || 'Unknown';
};

const formatDate = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString();
};

const formatTime = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const BookingHistory = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, review: '' });
  const [savingReview, setSavingReview] = useState(false);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingAPI.getCustomerBookings();
        const data = response?.data?.data || [];

        const mapped = data.map((booking) => {
          const serviceLabel = SERVICE_LABELS[booking.serviceType] || booking.serviceType;
          return {
            id: booking._id,
            service: serviceLabel,
            provider: booking.providerId?.name || 'Assigned Provider',
            date: formatDate(booking.date),
            time: formatTime(booking.date),
            status: statusToUi(booking.status),
            rawStatus: booking.status,
            price: formatServicePrice(booking.serviceType, booking.price),
            rating: typeof booking.rating === 'number' ? booking.rating : null,
            review: booking.review || null
          };
        });

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

    return bookings.filter((booking) => {
      if (filter !== 'all' && normalizeStatus(booking.status) !== filter) {
        return false;
      }

      if (term) {
        return (
          (booking.service || '').toLowerCase().includes(term) ||
          (booking.provider || '').toLowerCase().includes(term)
        );
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
    setSelectedBookingId(booking.id);
    setReviewForm({
      rating: booking.rating || 5,
      review: booking.review || ''
    });
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedBookingId('');
    setReviewForm({ rating: 5, review: '' });
  };

  const saveReview = async () => {
    const ratingValue = Number(reviewForm.rating);
    const reviewText = reviewForm.review.trim();

    try {
      setSavingReview(true);
      setError('');
      await bookingAPI.submitReview(selectedBookingId, {
        rating: ratingValue,
        review: reviewText
      });

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBookingId
            ? { ...booking, rating: ratingValue, review: reviewText || null }
            : booking
        )
      );
      closeReviewModal();
    } catch (err) {
      setError(extractApiError(err, 'Failed to save review'));
    } finally {
      setSavingReview(false);
    }
  };

  const renderStars = (value, interactive = false, onSelect = () => {}) => (
    <div className="star-rating" role={interactive ? 'radiogroup' : undefined} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${star <= value ? 'filled' : ''}`}
          onClick={() => interactive && onSelect(star)}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          disabled={!interactive}
        >
          <FaStar />
        </button>
      ))}
    </div>
  );

  return (
    <div className="booking-history-page">
      <div className="history-header">
        <h1>Service History</h1>
        <p>View and manage your past and upcoming service bookings</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

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
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
          <button className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`} onClick={() => setFilter('upcoming')}>Upcoming</button>
          <button className={`filter-btn ${filter === 'in progress' ? 'active' : ''}`} onClick={() => setFilter('in progress')}>In Progress</button>
        </div>
      </div>

      {loading ? (
        <div className="empty-history">
          <h3>Loading bookings...</h3>
        </div>
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
                  </div>
                </div>
                <div className={`booking-status ${getStatusBadgeClass(booking.status)}`}>{booking.status}</div>
              </div>

              <div className="booking-details">
                <div className="detail-item">
                  <FaCalendarAlt className="detail-icon" />
                  <div>
                    <strong>Date:</strong> {booking.date} at {booking.time}
                  </div>
                </div>
                <div className="detail-item">
                  <strong>Price:</strong> {booking.price}
                </div>
                {typeof booking.rating === 'number' && (
                  <div className="detail-item">
                    <FaStar className="detail-icon" />
                    <div>
                      <strong>Rating:</strong> {renderStars(booking.rating)}
                      <span className="rating-text"> ({booking.rating}/5)</span>
                    </div>
                  </div>
                )}
              </div>

              {booking.review && (
                <div className="booking-review">
                  <strong>Your review:</strong> {booking.review}
                </div>
              )}

              {normalizeStatus(booking.status) === 'completed' && (
                <div className="booking-actions">
                  <button className="btn btn-primary btn-sm" type="button" onClick={() => openReviewModal(booking)}>
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

      {reviewModalOpen && (
        <div className="review-modal-overlay" role="dialog" aria-modal="true">
          <div className="review-modal">
            <div className="review-modal-header">
              <h3>Rate Your Service</h3>
              <button type="button" className="review-modal-close" onClick={closeReviewModal}>
                <FaTimes />
              </button>
            </div>

            <div className="form-group">
              <label>Rating</label>
              {renderStars(reviewForm.rating, true, (star) => setReviewForm((prev) => ({ ...prev, rating: star })))}
            </div>

            <div className="form-group">
              <label htmlFor="review-textarea">Review</label>
              <textarea
                id="review-textarea"
                rows={4}
                className="form-control"
                placeholder="Write your review about this service"
                value={reviewForm.review}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, review: e.target.value }))}
              />
            </div>

            <div className="review-modal-actions">
              <button type="button" className="btn btn-outline" onClick={closeReviewModal}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={saveReview} disabled={savingReview}>
                {savingReview ? 'Saving...' : 'Save Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
