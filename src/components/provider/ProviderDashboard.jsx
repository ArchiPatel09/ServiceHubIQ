import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI, ratingAPI, extractApiError, SOCKET_BASE_URL } from '../../services/api';
import { SERVICE_LABELS } from '../../services/constants';
import ErrorMessage from '../shared/ErrorMessage';
import { formatAddress } from '../../utils/address';
import {
  FaBriefcase,
  FaCalendarCheck,
  FaStar,
  FaClipboardList,
  FaClock,
  FaSyncAlt,
  FaRegStar,
  FaMapMarkedAlt,
  FaLocationArrow
} from 'react-icons/fa';

const toUiDate = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleString();
};

const nextStatus = (status) => {
  if (status === 'Pending') return 'In Progress';
  if (status === 'In Progress') return 'Completed';
  return null;
};

const canShareTracking = (booking) => ['Pending', 'In Progress'].includes(booking.status);

const getStarSizeClass = (size) => {
  if (size <= 13) return 'star-size-sm';
  if (size <= 16) return 'star-size-md';
  return 'star-size-lg';
};

const StarDisplay = ({ value, size = 16, showValue = false }) => {
  if (value === null || value === undefined) {
    return <span className="star-display-empty">No ratings yet</span>;
  }

  const sizeClass = getStarSizeClass(size);

  return (
    <span className={`star-display ${sizeClass}`.trim()}>
      {[1, 2, 3, 4, 5].map((s) => (
        <FaStar
          key={s}
          className={`star-icon ${s <= Math.round(value) ? 'filled' : ''}`}
        />
      ))}
      {showValue && <strong className="star-display-value">{value.toFixed(1)}</strong>}
    </span>
  );
};

const ProviderDashboard = () => {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [trackingBookingId, setTrackingBookingId] = useState('');
  const [trackingMessage, setTrackingMessage] = useState('');

  const [ratingProfile, setRatingProfile] = useState(null);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [ratingsError, setRatingsError] = useState('');

  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastPositionRef = useRef(null);
  const activeBookingRef = useRef('');

  const loadBookings = async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError('');
      const response = await bookingAPI.getProviderBookings();
      setBookings(response?.data?.data || []);
    } catch (err) {
      setError(extractApiError(err, 'Failed to load provider bookings'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadRatingProfile = async () => {
    try {
      setLoadingRatings(true);
      setRatingsError('');
      const response = await ratingAPI.getMyRatingProfile();
      setRatingProfile(response?.data?.data || null);
    } catch (err) {
      setRatingsError(extractApiError(err, 'Failed to load ratings'));
    } finally {
      setLoadingRatings(false);
    }
  };

  useEffect(() => {
    loadBookings();
    loadRatingProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!trackingBookingId) return;

    const activeBooking = bookings.find((booking) => booking._id === trackingBookingId);
    if (!activeBooking || !canShareTracking(activeBooking)) {
      stopSharingLocation();
    }
  }, [bookings, trackingBookingId]);

  const ensureSocket = () => {
    if (socketRef.current) {
      return socketRef.current;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    const socket = io(SOCKET_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      setTrackingMessage('Live tracking connected.');
      if (activeBookingRef.current) {
        socket.emit('joinBookingRoom', { bookingId: activeBookingRef.current });
        if (lastPositionRef.current) {
          socket.emit('updateLocation', {
            bookingId: activeBookingRef.current,
            ...lastPositionRef.current
          });
        }
      }
    });

    socket.on('connect_error', () => {
      setTrackingMessage('Live socket unavailable. Using direct location updates instead.');
    });

    socketRef.current = socket;
    return socket;
  };

  const pushLocationUpdate = async (bookingId, coords) => {
    const payload = { bookingId, lat: coords.lat, lng: coords.lng };
    const socket = ensureSocket();

    if (socket?.connected) {
      return new Promise((resolve) => {
        socket.emit('updateLocation', payload, async (ack) => {
          if (ack?.success) {
            setTrackingMessage('Live location shared successfully.');
            resolve(true);
            return;
          }

          try {
            await bookingAPI.updateLiveLocation(bookingId, coords);
            setTrackingMessage('Live location shared using direct updates.');
            resolve(true);
          } catch (err) {
            setError(extractApiError(err, 'Failed to share live location'));
            resolve(false);
          }
        });
      });
    }

    try {
      await bookingAPI.updateLiveLocation(bookingId, coords);
      setTrackingMessage('Live location shared using direct updates.');
      return true;
    } catch (err) {
      setError(extractApiError(err, 'Failed to share live location'));
      return false;
    }
  };

  const stopSharingLocation = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (socketRef.current && activeBookingRef.current) {
      socketRef.current.emit('leaveBookingRoom', { bookingId: activeBookingRef.current });
    }

    activeBookingRef.current = '';
    setTrackingBookingId('');
    setTrackingMessage('Location sharing stopped.');
  };

  const startSharingLocation = async (booking) => {
    if (!navigator.geolocation) {
      setError('Browser geolocation is not supported. Live tracking is unavailable on this device.');
      return;
    }

    if (trackingBookingId && trackingBookingId !== booking._id) {
      stopSharingLocation();
    }

    setError('');
    setTrackingBookingId(booking._id);
    activeBookingRef.current = booking._id;
    setTrackingMessage('Waiting for live location permission...');

    const socket = ensureSocket();
    if (socket?.connected) {
      socket.emit('joinBookingRoom', { bookingId: booking._id });
    }

    const publishCoordinates = async (coords) => {
      lastPositionRef.current = coords;
      await pushLocationUpdate(booking._id, coords);
    };

    // Publish one immediate location snapshot so customers can see the provider right away,
    // even before watchPosition delivers follow-up updates.
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await publishCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (geoError) => {
        setError(
          geoError.code === 1
            ? 'Location access was denied. Please allow location sharing to enable live tracking.'
            : 'Could not read your current location. Please try again.'
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000
      }
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        await publishCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (geoError) => {
        setError(
          geoError.code === 1
            ? 'Location access was denied. Please allow location sharing to enable live tracking.'
            : 'Could not read your current location. Please try again.'
        );
        stopSharingLocation();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000
      }
    );
  };

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

  const providerServiceLabel =
    SERVICE_LABELS[user?.provider_service || user?.providerService || ''] || 'Service Provider';

  const avgRating = ratingProfile?.stats?.averageRating ?? null;
  const totalReviews = ratingProfile?.stats?.totalReviews ?? 0;
  const recentReviews = ratingProfile?.reviews || [];

  return (
    <div className="provider-dashboard">
      <div className="dashboard-header">
        <h1>Provider Dashboard</h1>
        <p>Welcome back, {user?.name} ({providerServiceLabel})</p>
      </div>

      <ErrorMessage message={error} />

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon"><FaBriefcase /></div>
          <div className="stat-content"><h3>{stats.total}</h3><p>Total Jobs</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaClock /></div>
          <div className="stat-content"><h3>{stats.pending}</h3><p>Pending</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaClipboardList /></div>
          <div className="stat-content"><h3>{stats.inProgress}</h3><p>In Progress</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaCalendarCheck /></div>
          <div className="stat-content"><h3>{stats.completed}</h3><p>Completed</p></div>
        </div>
      </div>

      <div className="provider-tracking-banner">
        <div>
          <h3><FaMapMarkedAlt /> Live Tracking</h3>
          <p>{trackingMessage || 'Start sharing location on an active booking to enable customer live tracking.'}</p>
        </div>
        {trackingBookingId && (
          <button type="button" className="btn btn-outline btn-sm" onClick={stopSharingLocation}>
            Stop Sharing
          </button>
        )}
      </div>

      <div className="dashboard-section rating-section">
        <div className="section-header provider-section-header">
          <h2><FaStar /> My Rating Profile</h2>
        </div>

        {loadingRatings ? (
          <div className="dashboard-loading">Loading ratings...</div>
        ) : ratingsError ? (
          <ErrorMessage message={ratingsError} />
        ) : (
          <div className="provider-rating-panel">
            <div className="rating-summary">
              <div className="rating-average">
                {avgRating !== null ? avgRating.toFixed(1) : '-'}
              </div>
              <StarDisplay value={avgRating} size={18} />
              <div className="rating-count">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            <div className="rating-bars">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = recentReviews.filter((r) => r.rating === star).length;
                const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                const pctClass = `rating-bar-fill rating-bar-${Math.round(pct / 10) * 10}`;
                return (
                  <div key={star} className="rating-bar-row">
                    <span className="rating-bar-label">{star}</span>
                    <FaStar className="rating-bar-star" />
                    <div className="rating-bar-track">
                      <div className={pctClass} />
                    </div>
                    <span className="rating-bar-pct">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {recentReviews.length > 0 ? (
          <div className="recent-reviews">
            <h4 className="recent-reviews-title">Recent Reviews</h4>
            <div className="recent-reviews-list">
              {recentReviews.map((review) => (
                <div key={review.id} className="provider-review-card">
                  <div className="provider-review-header">
                    <div>
                      <span className="provider-review-name">{review.customerName}</span>
                      <span className="provider-review-date">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <StarDisplay value={review.rating} size={13} />
                  </div>
                  {review.reviewText && (
                    <p className="provider-review-text">"{review.reviewText}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-reviews">
            <FaRegStar size={32} />
            <p>No reviews yet.</p>
            <p>Reviews appear here once customers rate completed bookings.</p>
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="section-header provider-section-header">
          <h2><FaClipboardList /> Assigned Bookings</h2>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => loadBookings(true)}
            disabled={refreshing || loading}
          >
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
              const serviceLabel = SERVICE_LABELS[booking.serviceType] || booking.serviceType;
              const isSharingThisBooking = trackingBookingId === booking._id;

              return (
                <div key={booking._id} className="job-card">
                  <div className="job-info">
                    <h4>{serviceLabel}</h4>
                    <p className="job-customer">Customer: {customer.name || 'Unknown'}</p>
                    <p className="job-date">Scheduled: {toUiDate(booking.date)}</p>
                    <p className="job-date">Address: {formatAddress(booking.address) || '-'}</p>
                    <p className="job-date">
                      Status: {booking.status}
                      {booking.isEmergencyService && (
                        <span className="booking-emergency-tag">Emergency</span>
                      )}
                    </p>
                    {typeof booking.rating === 'number' && (
                      <p className="job-rating">
                        Customer rating: <StarDisplay value={booking.rating} size={13} />
                      </p>
                    )}
                  </div>
                  <div className="provider-job-actions provider-job-actions-extended">
                    {canShareTracking(booking) && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => (isSharingThisBooking ? stopSharingLocation() : startSharingLocation(booking))}
                        type="button"
                      >
                        <FaLocationArrow /> {isSharingThisBooking ? 'Stop Live Tracking' : 'Share Live Location'}
                      </button>
                    )}
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
