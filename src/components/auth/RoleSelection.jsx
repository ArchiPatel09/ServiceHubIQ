import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added useNavigate
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaTools, FaUserShield, FaArrowRight } from 'react-icons/fa';

const RoleSelection = () => {
  const navigate = useNavigate(); // Added useNavigate
  const { user, updateRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState(user?.role || '');

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
        'Get AI recommendations'
      ]
    },
    {
      id: 'provider',
      title: 'Service Provider',
      icon: <FaTools />,
      description: 'Offer your skills and grow your business',
      features: [
        'Find job opportunities',
        'Manage bookings',
        'Get performance insights',
        'Access AI job matching'
      ]
    },
    {
      id: 'admin',
      title: 'Administrator',
      icon: <FaUserShield />,
      description: 'Manage platform operations and users',
      features: [
        'Monitor platform activity',
        'Manage user accounts',
        'View analytics',
        'Handle disputes'
      ]
    }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  // In RoleSelection.jsx, fix the handleContinue function:
const handleContinue = () => {
  if (selectedRole) {
    // Update user role in context
    updateRole(selectedRole);
    
    // Navigate based on role
    switch(selectedRole) {
      case 'customer':
        navigate('/dashboard');
        break;
      case 'provider':
        navigate('/provider-dashboard');
        break;
      case 'admin':
        navigate('/admin-dashboard');
        break;
      default:
        navigate('/dashboard');
    }
  }
};

  return (
    <div className="role-selection-page">
      <div className="container">
        <div className="role-header">
          <h1>Select Your Role</h1>
          <p className="subtitle">
            Choose how you want to use ServiceHubIQ. You can change this later in settings.
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

        <div className="role-footer">
          <p className="current-user">
            Signed in as: <strong>{user?.email || 'User'}</strong>
          </p>
          <button 
            className="btn btn-primary btn-lg"
            onClick={handleContinue}
            disabled={!selectedRole}
          >
            Continue to Dashboard
          </button>
          <p className="note">
            You can change your role anytime from your profile settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;