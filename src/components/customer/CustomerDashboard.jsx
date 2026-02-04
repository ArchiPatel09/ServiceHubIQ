import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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

const BOOKINGS_KEY = 'servicehubiq_bookings_v1';

const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const CustomerDashboard = () => {
  const { user } = useAuth();

  // ✅ Keep your notifications (fine for Sprint 1)
  const [notifications] = useState([
    { id: 1, title: 'Service Confirmed', message: 'Your plumbing service is confirmed for tomorrow', time: '2 hours ago', read: false },
    { id: 2, title: 'Rating Request', message: 'Rate your recent cleaning service', time: '1 day ago', read: true },
  ]);

  // ✅ Real bookings (from localStorage) so demo feels “deep”
  const bookings = useMemo(() => {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    return safeParse(raw, []);
  }, []);

  const upcomingBookings = useMemo(() => {
    return bookings
      .filter(b => (b.status || '').toLowerCase() === 'upcoming')
      .slice(0, 3);
  }, [bookings]);

  const completedBookings = useMemo(() => {
    return bookings.filter(b => (b.status || '').toLowerCase() === 'completed');
  }, [bookings]);

  const stats = useMemo(() => {
    const upcoming = bookings.filter(b => (b.status || '').toLowerCase() === 'upcoming').length;
    const completed = bookings.filter(b => (b.status || '').toLowerCase() === 'completed').length;

    const rated = bookings.filter(b => typeof b.rating === 'number');
    const avgRating = rated.length
  ? (rated.reduce((sum, b) => sum + b.rating, 0) / rated.length).toFixed(1)
  : '-';

    const totalSpent = bookings
      .filter(b => (b.status || '').toLowerCase() !== 'cancelled')
      .reduce((sum, b) => sum + (Number(b.price) || 0), 0);

    return { upcoming, completed, avgRating, totalSpent };
  }, [bookings]);

  // ✅ Recommended stays UI-only, but keep ids consistent with your ServiceBooking if possible
  const recommendedServices = [
    { id: 1, name: 'Emergency Plumbing Service', category: 'Plumbing', price: 89, rating: 4.8 },
    { id: 2, name: 'Complete Home Cleaning', category: 'Cleaning', price: 129, rating: 4.9 },
    { id: 3, name: 'Electrical Installation', category: 'Electrical', price: 149, rating: 4.7 },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="dashboard-page">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Welcome back, {user?.name || 'Customer'}! 👋</h1>
          {/* <p>Checkpoint 1 Demo: Customer flow end-to-end (Register → Login → Book → History)</p> */}
        </div>
        <div className="welcome-actions">
          <button className="btn btn-outline" type="button">
            <FaBell />
            <span>Notifications ({unreadCount})</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon booking">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <h3>{stats.upcoming}</h3>
            <p>Upcoming Bookings</p>
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
          <div className="stat-icon">
            <FaStar />
          </div>
          <div className="stat-content">
            <h3>{stats.avgRating}</h3>
            <p>Average Rating</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon earning">
            <FaCreditCard />
          </div>
          <div className="stat-content">
            <h3>${stats.totalSpent}</h3>
            <p>Total Spent</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content-grid">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Quick Actions */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2><FaTools /> Quick Actions</h2>
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
                  <p>View bookings and cancel upcoming</p>
                </div>
              </Link>

              {/* ✅ Keep the card, but prevent broken routing during demo */}
              <button className="action-card" type="button" style={{ textAlign: 'left' }} disabled>
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
                  <p>Notifications & preferences</p>
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

          {/* Upcoming Bookings */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2><FaClock /> Upcoming Bookings</h2>
              <Link to="/booking-history" className="btn-text">
                View All
              </Link>
            </div>

            {upcomingBookings.length > 0 ? (
              <div className="bookings-list">
                {upcomingBookings.map(booking => (
                  <div key={booking.id} className="booking-item">
                    <div className="booking-info">
                      <h4>{booking.service}</h4>
                      <p className="booking-meta">{booking.provider}</p>
                      <p className="booking-time">
                        <FaCalendarAlt /> {booking.date} at {booking.time}
                      </p>
                    </div>
                    <div className="booking-status">
                      <span className="status-badge status-confirmed">upcoming</span>

                      {/* ✅ No broken “Details” route in checkpoint demo */}
                      <Link to="/booking-history" className="btn btn-outline btn-xs">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                <p style={{ margin: 0 }}>
                  No upcoming bookings yet. Go to <Link to="/services">Services</Link> and book one for the demo.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right">
          {/* Recommended Services */}
          <div className="dashboard-section">
            <h2><FaStar /> Recommended For You</h2>
            <div className="recommended-list">
              {recommendedServices.map(service => (
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

          {/* Quick Stats (UI-only; safe for demo) */}
          <div className="dashboard-section">
            <h2><FaChartLine /> Quick Stats</h2>
            <div className="stats-mini">
              <div className="stat-mini">
                <div className="stat-label">Avg Response Time</div>
                <div className="stat-value">45 min</div>
              </div>
              <div className="stat-mini">
                <div className="stat-label">Saved Providers</div>
                <div className="stat-value">3</div>
              </div>
              <div className="stat-mini">
                <div className="stat-label">This Month</div>
                <div className="stat-value">$285</div>
              </div>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, color: '#6b7280' }}>
              Note: Quick Stats are demo placeholders (Sprint 2 will connect to backend analytics).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
