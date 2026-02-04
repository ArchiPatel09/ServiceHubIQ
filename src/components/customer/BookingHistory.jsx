import React, { useMemo, useState } from 'react';
import { FaSearch, FaStar, FaCalendarAlt, FaTools, FaTimesCircle } from 'react-icons/fa';

const BOOKINGS_KEY = 'servicehubiq_bookings_v1';

const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeStatus = (status) => (status || '').toLowerCase();

const BookingHistory = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Fallback mock data (only used if localStorage is empty)
  const mockBookings = useMemo(() => ([
    {
      id: 1,
      service: 'Plumbing Repair',
      provider: 'ProFix Plumbing',
      date: '2024-01-15',
      time: '10:00 AM',
      status: 'Completed',
      rating: 5,
      price: 89,
      review: 'Excellent service, very professional'
    },
    {
      id: 2,
      service: 'Home Cleaning',
      provider: 'Sparkle Clean',
      date: '2024-01-10',
      time: '2:00 PM',
      status: 'Completed',
      rating: 4,
      price: 129,
      review: 'Good cleaning, but arrived 15 minutes late'
    },
    {
      id: 3,
      service: 'Electrical Installation',
      provider: 'SafeWatt Electric',
      date: '2024-01-05',
      time: '11:00 AM',
      status: 'Completed',
      rating: 5,
      price: 149,
      review: 'Perfect installation, highly recommended'
    },
    {
      id: 4,
      service: 'Appliance Repair',
      provider: 'FixIt Appliances',
      date: '2024-01-20',
      time: '9:00 AM',
      status: 'Upcoming',
      rating: null,
      price: 79,
      review: null
    }
  ]), []);

  // ✅ Load bookings from localStorage (created from ServiceBooking.jsx)
  const [bookings, setBookings] = useState(() => {
    const stored = safeParse(localStorage.getItem(BOOKINGS_KEY), []);
    return stored.length ? stored : mockBookings;
  });

  const persist = (next) => {
    setBookings(next);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(next));
  };

  const filteredBookings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      if (filter !== 'all') {
        if (normalizeStatus(booking.status) !== filter) return false;
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
      case 'completed': return 'badge-success';
      case 'upcoming': return 'badge-warning';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  // ✅ Simple rating modal state (presentation-ready)
  const [ratingModal, setRatingModal] = useState({ open: false, bookingId: null, rating: 5, review: '' });

  const openRating = (booking) => {
    setRatingModal({
      open: true,
      bookingId: booking.id,
      rating: booking.rating ?? 5,
      review: booking.review ?? ''
    });
  };

  const closeRating = () => setRatingModal({ open: false, bookingId: null, rating: 5, review: '' });

  const saveRating = () => {
    const next = bookings.map((b) => {
      if (b.id !== ratingModal.bookingId) return b;
      return {
        ...b,
        status: 'Completed',
        rating: Number(ratingModal.rating),
        review: ratingModal.review || null
      };
    });
    persist(next);
    closeRating();
  };

  const cancelBooking = (bookingId) => {
    const next = bookings.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
    persist(next);
  };

  // const markCompletedForDemo = (bookingId) => {
  //   // optional helper: makes demo easier if you want to rate something
  //   const next = bookings.map((b) => (b.id === bookingId ? { ...b, status: 'Completed' } : b));
  //   persist(next);
  // };

  const stats = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter(b => normalizeStatus(b.status) === 'completed').length;
    const rated = bookings.filter(b => typeof b.rating === 'number');

    const avgRating = rated.length
      ? (rated.reduce((sum, b) => sum + b.rating, 0) / rated.length).toFixed(1)
      : '—';

    const totalSpent = bookings
      .filter(b => normalizeStatus(b.status) !== 'cancelled')
      .reduce((sum, b) => sum + (Number(b.price) || 0), 0);

    return { total, completed, avgRating, totalSpent };
  }, [bookings]);

  return (
    <div className="booking-history-page">
      <div className="history-header">
        <h1>Service History</h1>
        <p>View and manage your past and upcoming service bookings</p>
      </div>

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
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All
          </button>
          <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
            Completed
          </button>
          <button className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`} onClick={() => setFilter('upcoming')}>
            Upcoming
          </button>
          <button className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')}>
            Cancelled
          </button>
        </div>
      </div>

      {filteredBookings.length > 0 ? (
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
                <div className={`booking-status ${getStatusBadgeClass(booking.status)}`}>
                  {booking.status}
                </div>
              </div>

              <div className="booking-details">
                <div className="detail-item">
                  <FaCalendarAlt className="detail-icon" />
                  <div>
                    <strong>Date:</strong> {booking.date} at {booking.time}
                  </div>
                </div>

                <div className="detail-item">
                  <strong>Price:</strong> ${booking.price}
                </div>

                {typeof booking.rating === 'number' && (
                  <div className="detail-item">
                    <FaStar className="detail-icon" />
                    <div>
                      <strong>Rating:</strong> {'★'.repeat(booking.rating)}
                      <span className="rating-text"> ({booking.rating}/5)</span>
                    </div>
                  </div>
                )}
              </div>

              {booking.review && (
                <div className="booking-review">
                  <strong>Your Review:</strong> {booking.review}
                </div>
              )}

              <div className="booking-actions">
                {normalizeStatus(booking.status) === 'upcoming' && (
                  <>
                    {/* ✅ Demo-safe actions that actually work */}
                    <button className="btn btn-danger btn-sm" onClick={() => cancelBooking(booking.id)}>
                      Cancel
                    </button>

                    {/* Optional demo helper: mark completed to allow rating */}
                    {/* <button className="btn btn-outline btn-sm" onClick={() => markCompletedForDemo(booking.id)}>
                      Mark Completed (Demo)
                    </button> */}
                  </>
                )}

                {normalizeStatus(booking.status) === 'completed' && typeof booking.rating !== 'number' && (
                  <button className="btn btn-primary btn-sm" onClick={() => openRating(booking)}>
                    Rate Service
                  </button>
                )}

                {/* ✅ Avoid broken routes in demo */}
                <button className="btn btn-outline btn-sm" disabled title="Details page planned for Sprint 2">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-history">
          <h3>No bookings found</h3>
          <p>Try adjusting your filters or book your first service!</p>
        </div>
      )}

      {/* Stats */}
      <div className="history-stats">
        <div className="stat-item">
          <h4>Total Bookings</h4>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-item">
          <h4>Completed</h4>
          <p className="stat-number">{stats.completed}</p>
        </div>
        <div className="stat-item">
          <h4>Average Rating</h4>
          <p className="stat-number">{stats.avgRating}</p>
        </div>
        <div className="stat-item">
          <h4>Total Spent</h4>
          <p className="stat-number">${stats.totalSpent}</p>
        </div>
      </div>

      {/* Rating Modal */}
      {ratingModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 9999
          }}
        >
          <div style={{ background: '#fff', borderRadius: 10, width: '100%', maxWidth: 520, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Rate Service</h3>
              <button className="btn btn-outline btn-sm" onClick={closeRating}>
                <FaTimesCircle />
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              <label><strong>Rating</strong></label>
              <select
                className="form-control"
                value={ratingModal.rating}
                onChange={(e) => setRatingModal(prev => ({ ...prev, rating: e.target.value }))}
              >
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div style={{ marginTop: 12 }}>
              <label><strong>Review (optional)</strong></label>
              <textarea
                className="form-control"
                rows="3"
                value={ratingModal.review}
                onChange={(e) => setRatingModal(prev => ({ ...prev, review: e.target.value }))}
                placeholder="Write a short review..."
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={closeRating}>Cancel</button>
              <button className="btn btn-primary" onClick={saveRating}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
