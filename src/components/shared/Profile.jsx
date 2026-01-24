import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaEdit, FaLock, FaCalendarAlt } from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
  };

  const accountInfo = [
    { label: 'Account Type', value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1), icon: <FaUser /> },
    { label: 'Member Since', value: 'January 2024', icon: <FaCalendarAlt /> },
    { label: 'Account Status', value: 'Active', icon: <FaLock /> }
  ];

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and account settings</p>
      </div>

      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <h3>{user?.name || 'User'}</h3>
            <p className="user-email">{user?.email}</p>
            <div className={`user-badge user-badge-${user?.role}`}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </div>
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
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="card-header">
              <h2>Personal Information</h2>
              <button 
                className={`btn ${isEditing ? 'btn-secondary' : 'btn-outline'}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <FaSave /> : <FaEdit />}
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <FaUser className="input-icon" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaEnvelope className="input-icon" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaPhone className="input-icon" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaMapMarkerAlt className="input-icon" />
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                    disabled={!isEditing}
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
                    disabled={!isEditing}
                    placeholder="Tell us a little about yourself..."
                  />
                </div>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        address: user?.address || '',
                        bio: user?.bio || ''
                      });
                    }}
                  >
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;