import React, { useState } from 'react';
import { FaFilter, FaSearch, FaStar, FaCalendarAlt, FaTools } from 'react-icons/fa';

const BookingHistory = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock booking history data
  const bookings = [
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
  ];

  const filteredBookings = bookings.filter(booking => {
    if (filter !== 'all' && booking.status.toLowerCase() !== filter.toLowerCase()) {
      return false;
    }
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        booking.service.toLowerCase().includes(searchLower) ||
        booking.provider.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'badge-success';
      case 'upcoming': return 'badge-warning';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

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
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Bookings
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
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
                {booking.rating && (
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
                {booking.status === 'Upcoming' && (
                  <>
                    <button className="btn btn-outline btn-sm">Reschedule</button>
                    <button className="btn btn-danger btn-sm">Cancel</button>
                  </>
                )}
                {booking.status === 'Completed' && !booking.rating && (
                  <button className="btn btn-primary btn-sm">Rate Service</button>
                )}
                <button className="btn btn-outline btn-sm">View Details</button>
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
        <div className="stat-item">
          <h4>Total Bookings</h4>
          <p className="stat-number">{bookings.length}</p>
        </div>
        <div className="stat-item">
          <h4>Completed</h4>
          <p className="stat-number">{bookings.filter(b => b.status === 'Completed').length}</p>
        </div>
        <div className="stat-item">
          <h4>Average Rating</h4>
          <p className="stat-number">
            {(() => {
              const ratedBookings = bookings.filter(b => b.rating);
              if (ratedBookings.length === 0) return 'N/A';
              const avg = ratedBookings.reduce((sum, b) => sum + b.rating, 0) / ratedBookings.length;
              return avg.toFixed(1);
            })()}
          </p>
        </div>
        <div className="stat-item">
          <h4>Total Spent</h4>
          <p className="stat-number">
            ${bookings.reduce((sum, b) => sum + b.price, 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;