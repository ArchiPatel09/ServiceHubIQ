// src/pages/ProviderDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaBriefcase, 
  FaCalendarCheck, 
  FaMoneyBillWave, 
  FaStar, 
  FaChartLine,
  FaClipboardList,
  FaUserFriends,
  FaHistory,
  FaStarHalfAlt
} from 'react-icons/fa';

const ProviderDashboard = () => {
  const { user } = useAuth();

  // Mock provider data
  const providerStats = {
    totalJobs: 45,
    completedJobs: 42,
    pendingJobs: 3,
    earnings: 3850,
    rating: 4.8,
    responseRate: 95,
    repeatCustomers: 12
  };

  // Recent jobs
  const recentJobs = [
    { id: 1, service: 'Plumbing Repair', customer: 'John Smith', date: '2024-01-18', amount: 120, rating: 5 },
    { id: 2, service: 'Leak Fix', customer: 'Sarah Johnson', date: '2024-01-17', amount: 85, rating: 4 },
    { id: 3, service: 'Pipe Installation', customer: 'Mike Wilson', date: '2024-01-16', amount: 200, rating: 5 }
  ];

  // Recent ratings
  const recentRatings = [
    { id: 1, customer: 'John Smith', rating: 5, comment: 'Excellent work! Very professional.', date: '2024-01-18' },
    { id: 2, customer: 'Sarah Johnson', rating: 4, comment: 'Good service, arrived on time.', date: '2024-01-17' },
    { id: 3, customer: 'Emma Brown', rating: 5, comment: 'Highly recommended!', date: '2024-01-16' }
  ];

  return (
    <div className="provider-dashboard">
      <div className="dashboard-header">
        <h1>Provider Dashboard</h1>
        <p>Welcome back, {user?.name} ({user?.serviceType || 'Service Provider'})</p>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FaBriefcase />
          </div>
          <div className="stat-content">
            <h3>{providerStats.totalJobs}</h3>
            <p>Total Jobs</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaMoneyBillWave />
          </div>
          <div className="stat-content">
            <h3>${providerStats.earnings}</h3>
            <p>Total Earnings</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaStar />
          </div>
          <div className="stat-content">
            <h3>{providerStats.rating}</h3>
            <p>Average Rating</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaUserFriends />
          </div>
          <div className="stat-content">
            <h3>{providerStats.repeatCustomers}</h3>
            <p>Repeat Customers</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="quick-links-section">
        <h2>Quick Access</h2>
        <div className="quick-links">
          <Link to="/provider-history" className="quick-link">
            <FaHistory />
            <div>
              <h4>Work History</h4>
              <p>View all your completed jobs</p>
            </div>
          </Link>
          
          <div className="quick-link">
            <FaStarHalfAlt />
            <div>
              <h4>Ratings & Reviews</h4>
              <p>See what customers say about you</p>
            </div>
          </div>
          
          <Link to="/profile" className="quick-link">
            <FaUserFriends />
            <div>
              <h4>Profile & Settings</h4>
              <p>Update your information</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Jobs</h2>
          <Link to="/provider-history" className="btn btn-outline btn-sm">
            View All
          </Link>
        </div>
        <div className="jobs-list">
          {recentJobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-info">
                <h4>{job.service}</h4>
                <p className="job-customer">{job.customer}</p>
                <p className="job-date">{job.date}</p>
              </div>
              <div className="job-details">
                <div className="job-amount">${job.amount}</div>
                <div className="job-rating">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < job.rating ? 'star-filled' : 'star-empty'} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Ratings */}
      <div className="ratings-section">
        <h2>Recent Ratings</h2>
        <div className="ratings-list">
          {recentRatings.map(rating => (
            <div key={rating.id} className="rating-card">
              <div className="rating-header">
                <div className="rating-customer">
                  <strong>{rating.customer}</strong>
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < rating.rating ? 'star-filled' : 'star-empty'} />
                    ))}
                  </div>
                </div>
                <div className="rating-date">{rating.date}</div>
              </div>
              <p className="rating-comment">{rating.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;