import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaLock,
  FaCalendarAlt,
  FaHistory,
  FaTools,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const BOOKINGS_KEY_FALLBACK = 'servicehubiq_bookings_v1';
const MEMBER_SINCE_KEY = 'servicehubiq_member_since_v1';

const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const formatDate = (isoOrDateString) => {
  if (!isoOrDateString) return '—';
  const d = new Date(isoOrDateString);
  if (Number.isNaN(d.getTime())) return isoOrDateString;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
};

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
const isValidPhone = (phone) => {
  if (!phone) return true; // optional
  const digits = phone.replace(/[^\d]/g, '');
  return digits.length >= 10 && digits.length <= 15;
};

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' }); 
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const memberSince = useMemo(() => {
    if (user?.createdAt) return formatDate(user.createdAt);

    const existing = localStorage.getItem(MEMBER_SINCE_KEY);
    if (existing) return existing;

    const today = formatDate(new Date().toISOString());
    localStorage.setItem(MEMBER_SINCE_KEY, today);
    return today;
  }, [user?.createdAt]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || ''
  });

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: user?.bio || ''
    });
  }, [user]);

  const bookingStats = useMemo(() => {
    const raw = localStorage.getItem(BOOKINGS_KEY_FALLBACK);
    const bookings = safeParse(raw, []);
    const upcoming = bookings.filter(b => (b.status || '').toLowerCase() === 'upcoming').length;
    const completed = bookings.filter(b => (b.status || '').toLowerCase() === 'completed').length;
    const cancelled = bookings.filter(b => (b.status || '').toLowerCase() === 'cancelled').length;

    const last = bookings[0] || null; 
    return { upcoming, completed, cancelled, last };
  }, []);

  const accountInfo = [
    {
      label: 'Account Type',
      value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User',
      icon: <FaUser />
    },
    { label: 'Member Since', value: memberSince, icon: <FaCalendarAlt /> },
    { label: 'Account Status', value: 'Active', icon: <FaLock /> }
  ];

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required.';
    if (!formData.email.trim()) e.email = 'Email is required.';
    else if (!isValidEmail(formData.email)) e.email = 'Please enter a valid email.';
    if (!isValidPhone(formData.phone)) e.phone = 'Phone should be 10–15 digits.';
    return e;
  };

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (status.msg) setStatus({ type: '', msg: '' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setStatus({ type: '', msg: '' });
    setErrors({});
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: user?.bio || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      setStatus({ type: 'error', msg: 'Please fix the highlighted fields.' });
      return;
    }

    try {
      setSaving(true);
      setStatus({ type: '', msg: '' });

      if (typeof updateProfile === 'function') {
        const maybePromise = updateProfile(formData);
        if (maybePromise?.then) await maybePromise;
      }

      setIsEditing(false);
      setStatus({ type: 'success', msg: 'Profile updated successfully.' });
    } catch (err) {
      setStatus({
        type: 'error',
        msg: err?.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and account settings</p>
      </div>

      <div className="profile-container">
        { }
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <h3>{user?.name || 'User'}</h3>
            <p className="user-email">{user?.email}</p>
            {user?.role && (
              <div className={`user-badge user-badge-${user?.role}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </div>
            )}
          </div>

          <div className="account-info">
            <h4>Account Information</h4>
            {accountInfo.map((info, index) => (
              <div key={index} className="info-item">
                <div className="info-icon">{info.icon}</div>
                <div>
                  <div className="info-label">{info.label}</div>
                  <div className="info-value">{info.value}</div>
                </div>
              </div>
            ))}
          </div>

          {}
          <div className="account-info" style={{ marginTop: 16 }}>
            <h4>My Booking Summary</h4>

            <div className="info-item">
              <div className="info-icon"><FaHistory /></div>
              <div>
                <div className="info-label">Upcoming</div>
                <div className="info-value">{bookingStats.upcoming}</div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon"><FaTools /></div>
              <div>
                <div className="info-label">Completed</div>
                <div className="info-value">{bookingStats.completed}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <Link className="btn btn-outline btn-sm" to="/services">Browse Services</Link>
              <Link className="btn btn-primary btn-sm" to="/booking-history">View History</Link>
            </div>

            {bookingStats.last && (
              <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: '#f8fafc' }}>
                <strong>Last Booking:</strong>
                <div style={{ fontSize: 14 }}>
                  {bookingStats.last.service} — {bookingStats.last.date} at {bookingStats.last.time}
                </div>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="profile-content">
          <div className="profile-card">
            <div className="card-header">
              <h2>Personal Information</h2>

              {}
              {!isEditing ? (
                <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
                  <FaEdit /> Edit Profile
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={handleCancel} type="button">
                  Cancel
                </button>
              )}
            </div>

            {}
            {status.msg && (
              <div
                className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-danger'}`}
                style={{ marginTop: 12 }}
              >
                {status.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}{' '}
                {status.msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <FaUser className="input-icon" /> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    disabled={!isEditing || saving}
                    required
                  />
                  {errors.name && <div className="error-text">{errors.name}</div>}
                </div>

                <div className="form-group">
                  <label>
                    <FaEnvelope className="input-icon" /> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    disabled={!isEditing || saving}
                    required
                  />
                  {errors.email && <div className="error-text">{errors.email}</div>}
                </div>

                <div className="form-group">
                  <label>
                    <FaPhone className="input-icon" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    disabled={!isEditing || saving}
                    placeholder="(optional)"
                  />
                  {errors.phone && <div className="error-text">{errors.phone}</div>}
                </div>

                <div className="form-group">
                  <label>
                    <FaMapMarkerAlt className="input-icon" /> Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                    disabled={!isEditing || saving}
                    placeholder="(optional)"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Bio / About Me</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="form-control"
                    rows="4"
                    disabled={!isEditing || saving}
                    placeholder="Tell us a little about yourself..."
                  />
                </div>
              </div>

              {}
              {isEditing && (
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={handleCancel} disabled={saving}>
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="profile-card">
            <h2>Preferences</h2>
            <div className="preferences">
              <div className="preference-item">
                <h4>Email Notifications</h4>
                <p>Receive updates about your bookings and promotions</p>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <h4>SMS Notifications</h4>
                <p>Get service reminders via SMS</p>
                <label className="switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <h4>Marketing Communications</h4>
                <p>Receive newsletters and promotional offers</p>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
              Note: Preferences are UI-only for Sprint 1 (safe for checkpoint demo).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
