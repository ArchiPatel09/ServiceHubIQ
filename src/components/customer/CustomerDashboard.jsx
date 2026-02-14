import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI, extractApiError } from '../../services/api';
import {
  FaCalendarAlt,
  FaHistory,
  FaStar,
  FaTools,
  FaCreditCard,
  FaBell,
  FaUserFriends,
  FaChartLine,
  FaClock,
  FaArrowRight
} from 'react-icons/fa';

const toUiDate = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString();
};

const toUiTime = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingError, setBookingError] = useState('');

  const [notifications] = useState([
    { id: 1, title: 'Service Confirmed', message: 'Your booking has been created', time: '2 hours ago', read: false },
    { id: 2, title: 'Status Update', message: 'Track your booking progress from dashboard', time: '1 day ago', read: true }
  ]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoadingBookings(true);
        setBookingError('');
        const response = await bookingAPI.getCustomerBookings();
        setBookings(response?.data?.data || []);
      } catch (error) {
        setBookingError(extractApiError(error, 'Failed to load bookings'));
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, []);

  const upcomingBookings = useMemo(
    () => bookings.filter((b) => b.status === 'Pending' || b.status === 'In Progress').slice(0, 3),
    [bookings]
  );

  const stats = useMemo(() => {
    const pending = bookings.filter((b) => b.status === 'Pending').length;
    const inProgress = bookings.filter((b) => b.status === 'In Progress').length;
    const completed = bookings.filter((b) => b.status === 'Completed').length;

    return {
      pending,
      inProgress,
      completed,
      totalSpent: '--'
    };
  }, [bookings]);

  const recommendedServices = [
    { id: 1, name: 'Emergency Plumbing Service', category: 'Plumbing', price: 89, rating: 4.8 },
    { id: 2, name: 'Complete Home Cleaning', category: 'Cleaning', price: 129, rating: 4.9 },
    { id: 3, name: 'Electrical Installation', category: 'Electrical', price: 149, rating: 4.7 }
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Welcome back, {user?.name || 'Customer'}!</h1>
        </div>
        <div className="welcome-actions">
          <button className="btn btn-outline" type="button">
            <FaBell />
            <span>Notifications ({unreadCount})</span>
          </button>
        </div>
      </div>

      {bookingError && <p className="form-error-message">{bookingError}</p>}

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon booking">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending Bookings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaHistory />
          </div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed Services</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon earning">
            <FaCreditCard />
          </div>
          <div className="stat-content">
            <h3>{stats.totalSpent}</h3>
            <p>Total Spent</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="dashboard-left">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <FaTools /> Quick Actions
              </h2>
              <Link to="/services" className="btn-text">
                View All <FaArrowRight />
              </Link>
            </div>

            <div className="action-grid">
              <Link to="/services" className="action-card">
                <div className="action-icon primary">
                  <FaTools />
                </div>
                <div className="action-content">
                  <h4>Browse Services</h4>
                  <p>Find and compare services</p>
                </div>
              </Link>

              <Link to="/book-service" className="action-card">
                <div className="action-icon secondary">
                  <FaCalendarAlt />
                </div>
                <div className="action-content">
                  <h4>Book Service</h4>
                  <p>Schedule a new home service</p>
                </div>
              </Link>

              <Link to="/booking-history" className="action-card">
                <div className="action-icon success">
                  <FaHistory />
                </div>
                <div className="action-content">
                  <h4>Service History</h4>
                  <p>View booking progress</p>
                </div>
              </Link>

              <button className="action-card" type="button" disabled>
                <div className="action-icon warning">
                  <FaUserFriends />
                </div>
                <div className="action-content">
                  <h4>My Providers</h4>
                  <p>Coming in Sprint 2</p>
                </div>
              </button>

              <Link to="/settings" className="action-card">
                <div className="action-icon warning">
                  <FaCreditCard />
                </div>
                <div className="action-content">
                  <h4>Settings</h4>
                  <p>Notifications and preferences</p>
                </div>
              </Link>

              <Link to="/profile" className="action-card">
                <div className="action-icon warning">
                  <FaCreditCard />
                </div>
                <div className="action-content">
                  <h4>My Profile</h4>
                  <p>Update profile details</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <FaClock /> Recent Bookings
              </h2>
              <Link to="/booking-history" className="btn-text">
                View All
              </Link>
            </div>

            {loadingBookings ? (
              <div className="dashboard-loading">Loading bookings...</div>
            ) : upcomingBookings.length > 0 ? (
              <div className="bookings-list">
                {upcomingBookings.map((booking) => (
                  <div key={booking._id} className="booking-item">
                    <div className="booking-info">
                      <h4>{booking.serviceType}</h4>
                      <p className="booking-meta">{booking.providerId?.name || 'Assigned Provider'}</p>
                      <p className="booking-time">
                        <FaCalendarAlt /> {toUiDate(booking.date)} at {toUiTime(booking.date)}
                      </p>
                    </div>
                    <div className="booking-status">
                      <span className={`status-badge ${
                        booking.status === 'Pending' ? 'status-pending' : booking.status === 'In Progress' ? 'status-in-progress' : 'status-completed'
                      }`}>
                        {booking.status}
                      </span>

                      <Link to="/booking-history" className="btn btn-outline btn-xs">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty-message">
                <p>
                  No active bookings yet. Go to <Link to="/services">Services</Link> and create one.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-right">
          <div className="dashboard-section">
            <h2>
              <FaStar /> Recommended For You
            </h2>
            <div className="recommended-list">
              {recommendedServices.map((service) => (
                <div key={service.id} className="recommended-item">
                  <div className="service-info">
                    <h4>{service.name}</h4>
                    <p className="service-category">{service.category}</p>
                    <div className="service-rating">
                      <FaStar /> {service.rating}
                    </div>
                  </div>
                  <div className="service-actions">
                    <div className="service-price">${service.price}</div>
                    <Link to={`/book-service?service=${service.id}`} className="btn btn-primary btn-xs">
                      Book Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-section">
            <h2>
              <FaChartLine /> Quick Stats
            </h2>
            <div className="stats-mini">
              <div className="stat-mini">
                <div className="stat-label">Pending</div>
                <div className="stat-value">{stats.pending}</div>
              </div>
              <div className="stat-mini">
                <div className="stat-label">In Progress</div>
                <div className="stat-value">{stats.inProgress}</div>
              </div>
              <div className="stat-mini">
                <div className="stat-label">Completed</div>
                <div className="stat-value">{stats.completed}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
