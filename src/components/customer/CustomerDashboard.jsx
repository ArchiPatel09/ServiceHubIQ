import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaCalendarAlt, 
  FaHistory, 
  FaStar, 
  FaTools, 
  FaHome,
  FaCreditCard,
  FaBell,
  FaUserFriends,
  FaChartLine,
  FaClock,
  FaArrowRight
} from 'react-icons/fa';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [notifications] = useState([
    { id: 1, title: 'Service Confirmed', message: 'Your plumbing service is confirmed for tomorrow', time: '2 hours ago', read: false },
    { id: 2, title: 'Rating Request', message: 'Rate your recent cleaning service', time: '1 day ago', read: true },
  ]);

  const upcomingBookings = [
    { id: 1, service: 'Plumbing Repair', provider: 'ProFix Plumbing', date: '2024-01-25', time: '10:00 AM', status: 'confirmed' },
    { id: 2, service: 'Home Cleaning', provider: 'Sparkle Clean', date: '2024-01-27', time: '2:00 PM', status: 'pending' },
  ];

  const recommendedServices = [
    { id: 1, name: 'Electrical Checkup', category: 'Electrical', price: 99, rating: 4.9 },
    { id: 2, name: 'Deep Cleaning', category: 'Cleaning', price: 149, rating: 4.8 },
  ];

  return (
    <div className="dashboard-page">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Welcome back, {user?.name || 'Customer'}! 👋</h1>
          <p>Here's what's happening with your home services today</p>
        </div>
        <div className="welcome-actions">
          <button className="btn btn-outline">
            <FaBell />
            <span>Notifications ({notifications.filter(n => !n.read).length})</span>
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
            <h3>2</h3>
            <p>Upcoming Bookings</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaHistory />
          </div>
          <div className="stat-content">
            <h3>12</h3>
            <p>Completed Services</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaStar />
          </div>
          <div className="stat-content">
            <h3>4.8</h3>
            <p>Average Rating</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon earning">
            <FaCreditCard />
          </div>
          <div className="stat-content">
            <h3>$1,245</h3>
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
              <Link to="/book-service" className="action-card">
                <div className="action-icon primary">
                  <FaCalendarAlt />
                </div>
                <div className="action-content">
                  <h4>Book Service</h4>
                  <p>Schedule new home service</p>
                </div>
              </Link>
              
              <Link to="/booking-history" className="action-card">
                <div className="action-icon secondary">
                  <FaHistory />
                </div>
                <div className="action-content">
                  <h4>Service History</h4>
                  <p>View past bookings</p>
                </div>
              </Link>
              
              <Link to="/providers" className="action-card">
                <div className="action-icon success">
                  <FaUserFriends />
                </div>
                <div className="action-content">
                  <h4>My Providers</h4>
                  <p>Favorite service providers</p>
                </div>
              </Link>
              
              <Link to="/profile" className="action-card">
                <div className="action-icon warning">
                  <FaCreditCard />
                </div>
                <div className="action-content">
                  <h4>Payments</h4>
                  <p>Manage payment methods</p>
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
                    <span className={`status-badge status-${booking.status}`}>
                      {booking.status}
                    </span>
                    <Link to={`/booking/${booking.id}`} className="btn btn-outline btn-xs">
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
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

          {/* Quick Stats */}
          <div className="dashboard-section">
            <h2><FaChartLine /> Quick Stats</h2>
            <div className="stats-mini">
              <div className="stat-mini">
                <div className="stat-label">Response Time</div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;