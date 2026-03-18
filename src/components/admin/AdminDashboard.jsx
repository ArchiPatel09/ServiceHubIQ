import React, { useEffect, useState } from 'react';
import {
  FaUsers,
  FaTools,
  FaChartLine,
  FaShieldAlt,
  FaSyncAlt,
  FaClipboardList,
  FaStar
} from 'react-icons/fa';
import { adminAPI, extractApiError } from '../../services/api';
import ErrorMessage from '../shared/ErrorMessage';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    customerCount: 0,
    providerCount: 0,
    activeProviders: 0,
    averageRating: null
  });
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      const [metricsRes, usersRes, providersRes, bookingsRes, ratingsRes] = await Promise.all([
        adminAPI.getMetrics(),
        adminAPI.getUsers('customer'),
        // Fix 3: load providers from the dedicated admin endpoint so verification status reflects MongoDB.
        adminAPI.getProviders(),
        adminAPI.getBookings(),
        adminAPI.getRatings()
      ]);

      setMetrics(metricsRes?.data?.data || {});
      setUsers(usersRes?.data?.data || []);
      setProviders(providersRes?.data?.data || []);
      setBookings(bookingsRes?.data?.data || []);
      setRatings(ratingsRes?.data?.data || []);
    } catch (err) {
      setError(extractApiError(err, 'Failed to load admin data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const toggleSuspend = async (user) => {
    try {
      setActionLoading(user._id);
      await adminAPI.suspendUser(user._id, !user.isSuspended);
      await loadAdminData();
    } catch (err) {
      setError(extractApiError(err, 'Failed to update user status'));
    } finally {
      setActionLoading('');
    }
  };

  const toggleVerification = async (provider, nextVerified) => {
    try {
      setActionLoading(provider._id);
      await adminAPI.verifyProvider(provider._id, nextVerified);
      await loadAdminData();
    } catch (err) {
      setError(extractApiError(err, 'Failed to update provider verification'));
    } finally {
      setActionLoading('');
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      await adminAPI.cancelBooking(bookingId);
      await loadAdminData();
    } catch (err) {
      setError(extractApiError(err, 'Failed to cancel booking'));
    } finally {
      setActionLoading('');
    }
  };

  const removeRating = async (ratingId) => {
    try {
      setActionLoading(ratingId);
      await adminAPI.removeRating(ratingId);
      await loadAdminData();
    } catch (err) {
      setError(extractApiError(err, 'Failed to remove rating'));
    } finally {
      setActionLoading('');
    }
  };

  const customers = users.filter((u) => u.role === 'customer');

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage users, providers, bookings, and platform health</p>
      </div>

      <div className="admin-actions">
        <button className="btn btn-outline btn-sm" onClick={loadAdminData} disabled={loading}>
          <FaSyncAlt /> {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <ErrorMessage message={error} className="form-error-global" />

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon admin"><FaClipboardList /></div>
          <div className="stat-content">
            <h3>{metrics.totalBookings || 0}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon admin"><FaUsers /></div>
          <div className="stat-content">
            <h3>{metrics.customerCount || 0}</h3>
            <p>Customers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon admin"><FaTools /></div>
          <div className="stat-content">
            <h3>{metrics.activeProviders || 0}</h3>
            <p>Active Providers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon admin"><FaStar /></div>
          <div className="stat-content">
            <h3>{metrics.averageRating ?? '-'}</h3>
            <p>Average Rating</p>
          </div>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-panel">
          <h2><FaUsers /> Customers</h2>
          {loading ? (
            <div className="dashboard-loading">Loading customers...</div>
          ) : (
            <div className="admin-table">
              {customers.map((user) => (
                <div key={user._id} className="admin-row">
                  <div>
                    <strong>{user.name}</strong>
                    <div className="admin-muted">{user.email}</div>
                  </div>
                  <button
                    className={`btn btn-sm ${user.isSuspended ? 'btn-outline' : 'btn-primary'}`}
                    onClick={() => toggleSuspend(user)}
                    disabled={actionLoading === user._id}
                  >
                    {user.isSuspended ? 'Reinstate' : 'Suspend'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-panel">
          <h2><FaTools /> Providers</h2>
          {loading ? (
            <div className="dashboard-loading">Loading providers...</div>
          ) : (
            <div className="admin-table">
              {providers.map((provider) => (
                <div key={provider._id} className="admin-row">
                  <div>
                    <strong>{provider.name}</strong>
                    <div className="admin-muted">{provider.email}</div>
                    <div className="admin-badges">
                      <span
                        className={`admin-badge ${
                          provider.isVerified || provider.isProviderVerified ? 'verified' : 'pending'
                        }`}
                      >
                        {provider.isVerified || provider.isProviderVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>
                  <div className="admin-row-actions">
                    {!(provider.isVerified || provider.isProviderVerified) && (
                      <button
                        className="btn btn-outline btn-sm"
                        // Fix 3: the admin flow now verifies directly instead of using a separate approve button.
                        onClick={() => toggleVerification(provider, true)}
                        disabled={actionLoading === provider._id}
                      >
                        Verify
                      </button>
                    )}
                    <button
                      className={`btn btn-sm ${provider.isSuspended ? 'btn-outline' : 'btn-primary'}`}
                      onClick={() => toggleSuspend(provider)}
                      disabled={actionLoading === provider._id}
                    >
                      {provider.isSuspended ? 'Reinstate' : 'Suspend'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-panel">
          <h2><FaChartLine /> Bookings</h2>
          {loading ? (
            <div className="dashboard-loading">Loading bookings...</div>
          ) : (
            <div className="admin-table">
              {bookings.slice(0, 10).map((booking) => (
                <div key={booking._id} className="admin-row">
                  <div>
                    <strong>{booking.serviceType}</strong>
                    <div className="admin-muted">
                      {booking.customerId?.name || 'Customer'} -> {booking.providerId?.name || 'Provider'}
                    </div>
                    <div className="admin-muted">Status: {booking.status}</div>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => cancelBooking(booking._id)}
                    disabled={actionLoading === booking._id || booking.status === 'Cancelled'}
                  >
                    {booking.status === 'Cancelled' ? 'Cancelled' : 'Cancel'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-panel">
          <h2><FaShieldAlt /> Review Moderation</h2>
          {loading ? (
            <div className="dashboard-loading">Loading reviews...</div>
          ) : (
            <div className="admin-table">
              {ratings.slice(0, 10).map((rating) => (
                <div key={rating._id} className="admin-row">
                  <div>
                    <strong>{rating.providerId?.name || 'Provider'}</strong>
                    <div className="admin-muted">
                      {rating.customerId?.name || 'Customer'} - {rating.rating}/5
                    </div>
                    {rating.reviewText && <div className="admin-muted">"{rating.reviewText}"</div>}
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => removeRating(rating._id)}
                    disabled={actionLoading === rating._id || rating.isRemoved}
                  >
                    {rating.isRemoved ? 'Removed' : 'Remove'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
