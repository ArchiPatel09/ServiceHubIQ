import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AddressFields from './AddressFields';
import ErrorMessage from './ErrorMessage';
import { SERVICE_LABELS } from '../../services/constants';
import { getAddressFieldErrors } from '../../utils/addressValidation';
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
  if (!isoOrDateString) return '-';
  const d = new Date(isoOrDateString);
  if (Number.isNaN(d.getTime())) return isoOrDateString;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
};

const isValidPhone = (phone) => {
  if (!phone) return true;
  const digits = String(phone).replace(/[^\d]/g, '');
  return digits.length >= 10 && digits.length <= 15;
};

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const isProvider = user?.role === 'provider';

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
    address: user?.address || {
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      formatted: ''
    },
    profile_image: user?.profile_image || ''
  });

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || {
        line1: '',
        line2: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        formatted: ''
      },
      profile_image: user?.profile_image || ''
    });
  }, [user]);

  const bookingStats = useMemo(() => {
    const raw = localStorage.getItem(BOOKINGS_KEY_FALLBACK);
    const bookings = safeParse(raw, []);
    const upcoming = bookings.filter((b) => (b.status || '').toLowerCase() === 'upcoming').length;
    const completed = bookings.filter((b) => (b.status || '').toLowerCase() === 'completed').length;
    const last = bookings[0] || null;
    return { upcoming, completed, last };
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
    if (!isValidPhone(formData.phone)) e.phone = 'Phone should be 10-15 digits.';
    const addressFieldErrors = getAddressFieldErrors(formData.address);
    if (Object.keys(addressFieldErrors).length > 0) e.addressFields = addressFieldErrors;
    return e;
  };

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (status.msg) setStatus({ type: '', msg: '' });
  };

  const handleAddressSelect = (address) => {
    setFormData((prev) => ({ ...prev, address }));
    if (errors.addressFields) setErrors((prev) => ({ ...prev, addressFields: null }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setStatus({ type: '', msg: '' });
    setErrors({});
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || {
        line1: '',
        line2: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        formatted: ''
      },
      profile_image: user?.profile_image || ''
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
        const maybePromise = updateProfile({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          profile_image: formData.profile_image
        });
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

  const providerServiceLabel = isProvider
    ? SERVICE_LABELS[user?.provider_service || user?.providerService || ''] || 'Not set'
    : null;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and account settings</p>
      </div>

      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <div className="avatar-circle">{user?.name?.charAt(0) || 'U'}</div>
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
            {isProvider && (
              <div className="info-item">
                <div className="info-icon"><FaTools /></div>
                <div>
                  <div className="info-label">Service</div>
                  <div className="info-value">{providerServiceLabel}</div>
                </div>
              </div>
            )}
          </div>

          <div className="account-info profile-booking-summary">
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
            <div className="profile-booking-links">
              <Link className="btn btn-outline btn-sm" to="/services">Browse Services</Link>
              <Link className="btn btn-primary btn-sm" to="/booking-history">View History</Link>
            </div>
            {bookingStats.last && (
              <div className="profile-last-booking">
                <strong>Last Booking:</strong>
                <div className="profile-last-booking-meta">
                  {bookingStats.last.service} - {bookingStats.last.date} at {bookingStats.last.time}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="card-header">
              <h2>Personal Information</h2>
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

            {status.msg && status.type === 'success' && (
              <div className={`alert profile-status-alert ${status.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                {status.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />} {status.msg}
              </div>
            )}
            <ErrorMessage message={status.type === 'error' ? status.msg : ''} className="profile-status-alert" />

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label><FaUser className="input-icon" /> Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    disabled={!isEditing || saving}
                    required
                  />
                  <ErrorMessage message={errors.name} />
                </div>

                <div className="form-group">
                  <label><FaEnvelope className="input-icon" /> Email Address</label>
                  <input type="email" name="email" value={formData.email} className="form-control" disabled readOnly />
                  <small className="profile-preference-note">Email cannot be changed.</small>
                </div>

                <div className="form-group">
                  <label><FaPhone className="input-icon" /> Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    disabled={!isEditing || saving}
                    placeholder="(optional)"
                  />
                  <ErrorMessage message={errors.phone} />
                </div>

                <div className="form-group">
                  <label><FaMapMarkerAlt className="input-icon" /> Address</label>
                  <AddressFields
                    value={formData.address}
                    onChange={handleAddressSelect}
                    disabled={!isEditing || saving}
                    errors={errors.addressFields || {}}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Profile Image URL</label>
                  <input
                    type="text"
                    name="profile_image"
                    value={formData.profile_image}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing || saving}
                    placeholder="https://..."
                  />
                </div>
              </div>

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
        </div>
      </div>
    </div>
  );
};

export default Profile;
