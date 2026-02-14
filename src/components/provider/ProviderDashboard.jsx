import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI, extractApiError } from '../../services/api';
import {
  FaBriefcase,
  FaCalendarCheck,
  FaStar,
  FaClipboardList,
  FaClock,
  FaSyncAlt
} from 'react-icons/fa';

const toUiDate = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString();
};

const nextStatus = (status) => {
  if (status === 'Pending') return 'In Progress';
  if (status === 'In Progress') return 'Completed';
  return null;
};

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const loadBookings = async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      const response = await bookingAPI.getProviderBookings();
      const data = response?.data?.data || [];
      setBookings(data);
    } catch (err) {
      setError(extractApiError(err, 'Failed to load provider bookings'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === 'Pending').length;
    const inProgress = bookings.filter((b) => b.status === 'In Progress').length;
    const completed = bookings.filter((b) => b.status === 'Completed').length;

    return { total, pending, inProgress, completed };
  }, [bookings]);

  const recentBookings = useMemo(
    () => [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8),
    [bookings]
  );

  const handleAdvanceStatus = async (booking) => {
    const target = nextStatus(booking.status);
    if (!target) return;

    try {
      setUpdatingId(booking._id);
      await bookingAPI.updateBookingStatus(booking._id, target);
      await loadBookings(true);
    } catch (err) {
      setError(extractApiError(err, 'Failed to update booking status'));
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="provider-dashboard">
      <div className="dashboard-header">
        <h1>Provider Dashboard</h1>
        <p>
          Welcome back, {user?.name} ({user?.profession || 'Service Provider'})
        </p>
      </div>

      {error && <p className="form-error-message">{error}</p>}

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FaBriefcase />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Jobs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaClipboardList />
          </div>
          <div className="stat-content">
            <h3>{stats.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaCalendarCheck />
          </div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header provider-section-header">
          <h2>
            <FaStar /> Assigned Bookings
          </h2>
          <button className="btn btn-outline btn-sm" onClick={() => loadBookings(true)} disabled={refreshing || loading}>
            <FaSyncAlt /> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="dashboard-loading">Loading bookings...</div>
        ) : recentBookings.length === 0 ? (
          <div className="dashboard-empty-message">No assigned bookings yet.</div>
        ) : (
          <div className="jobs-list">
            {recentBookings.map((booking) => {
              const target = nextStatus(booking.status);
              const customer = booking.customerId || {};

              return (
                <div key={booking._id} className="job-card">
                  <div className="job-info">
                    <h4>{booking.serviceType}</h4>
                    <p className="job-customer">Customer: {customer.name || 'Unknown'}</p>
                    <p className="job-date">Scheduled: {toUiDate(booking.date)}</p>
                    <p className="job-date">Address: {booking.address}</p>
                    <p className="job-date">Status: {booking.status}</p>
                  </div>
                  <div className="provider-job-actions">
                    {target ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAdvanceStatus(booking)}
                        disabled={updatingId === booking._id}
                      >
                        {updatingId === booking._id ? 'Updating...' : `Mark ${target}`}
                      </button>
                    ) : (
                      <button className="btn btn-outline btn-sm" disabled>
                        Completed
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="quick-links-section">
        <h2>Quick Access</h2>
        <div className="quick-links">
          <Link to="/profile" className="quick-link">
            <FaClipboardList />
            <div>
              <h4>Profile</h4>
              <p>Update your provider details</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
