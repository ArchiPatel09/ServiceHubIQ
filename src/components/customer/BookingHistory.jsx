import React, { useEffect, useMemo, useState } from 'react';
import { FaSearch, FaStar, FaCalendarAlt, FaTools } from 'react-icons/fa';
import { bookingAPI, extractApiError } from '../../services/api';

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

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingAPI.getCustomerBookings();
        const data = response?.data?.data || [];

        const mapped = data.map((booking) => ({
          id: booking._id,
          service: booking.serviceType,
          provider: booking.providerId?.name || 'Assigned Provider',
          date: formatDate(booking.date),
          time: formatTime(booking.date),
          status: statusToUi(booking.status),
          rawStatus: booking.status,
          price: '-',
          rating: null,
          review: null
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

    const avgRating = rated.length ? (rated.reduce((sum, b) => sum + b.rating, 0) / rated.length).toFixed(1) : '-';

    return { total, completed, avgRating };
  }, [bookings]);

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
                      <strong>Rating:</strong> {'*'.repeat(booking.rating)}
                      <span className="rating-text"> ({booking.rating}/5)</span>
                    </div>
                  </div>
                )}
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

      <div className="history-stats">
        <div className="stat-item"><h4>Total Bookings</h4><p className="stat-number">{stats.total}</p></div>
        <div className="stat-item"><h4>Completed</h4><p className="stat-number">{stats.completed}</p></div>
        <div className="stat-item"><h4>Average Rating</h4><p className="stat-number">{stats.avgRating}</p></div>
      </div>
    </div>
  );
};

export default BookingHistory;
