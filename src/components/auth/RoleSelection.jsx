import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SERVICES } from '../../services/constants';
import { FaUser, FaTools, FaArrowRight } from 'react-icons/fa';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState(user?.role || '');
  const [selectedService, setSelectedService] = useState(user?.provider_service || '');

  const roles = [
    {
      id: 'customer',
      title: 'Customer',
      icon: <FaUser />,
      description: 'Book services for your home or property',
      features: [
        'Browse and book services',
        'Track service history',
        'Rate providers',
        'Get recommendations'
      ]
    },
    {
      id: 'provider',
      title: 'Service Provider',
      icon: <FaTools />,
      description: 'Offer your skills and grow your business',
      features: [
        'Manage bookings',
        'Update availability',
        'Track performance',
        'Build your profile'
      ]
    }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;

    if (selectedRole === 'provider' && !selectedService) return;

    try {
      await updateProfile({
        role: selectedRole,
        provider_service: selectedRole === 'provider' ? selectedService : null
      });
    } catch {
      // no-op
    }

    if (selectedRole === 'provider') {
      navigate('/provider-dashboard');
    } else {
      navigate('/customer-dashboard');
    }
  };

  return (
    <div className="role-selection-page">
      <div className="container">
        <div className="role-header">
          <h1>Select Your Role</h1>
          <p className="subtitle">
            Choose how you want to use ServiceHubIQ. You can change this later in your profile.
          </p>
        </div>

        <div className="role-grid">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
              onClick={() => handleRoleSelect(role.id)}
            >
              <div className="role-icon">
                {role.icon}
              </div>
              <h3 className="role-title">{role.title}</h3>
              <p className="role-description">{role.description}</p>

              <ul className="role-features">
                {role.features.map((feature, index) => (
                  <li key={index} className="role-feature">
                    <FaArrowRight className="feature-icon" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`role-select-btn ${selectedRole === role.id ? 'active' : ''}`}
                onClick={() => handleRoleSelect(role.id)}
              >
                {selectedRole === role.id ? 'Selected' : 'Select'}
              </button>
            </div>
          ))}
        </div>

        {selectedRole === 'provider' && (
          <div className="form-group role-service-select">
            <label>Select Your Service</label>
            <select
              className="form-control"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="">Select service</option>
              {SERVICES.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="role-footer">
          <p className="current-user">
            Signed in as: <strong>{user?.email || 'User'}</strong>
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleContinue}
            disabled={!selectedRole || (selectedRole === 'provider' && !selectedService)}
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
