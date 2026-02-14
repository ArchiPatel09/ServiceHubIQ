import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EMAIL_REGEX } from '../../utils/validation';
import ErrorMessage from '../shared/ErrorMessage';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaTools } from 'react-icons/fa';

const PROVIDER_PROFESSIONS = ['Plumber', 'Electrician', 'Gardener', 'Cleaner', 'Carpenter'];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    profession: '',
    userType: 'customer'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.userType === 'provider' && !formData.profession) {
      newErrors.profession = 'Please select a profession';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await register({
        ...formData,
        email: formData.email.trim()
      });
      navigate('/login', { replace: true });
    } catch (error) {
      setErrors({ general: error.message || 'Registration failed. Please try again.' });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Your Account</h2>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <ErrorMessage message={errors.general} className="form-error-global" />

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
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="Enter your full name"
            />
            <ErrorMessage message={errors.name} />
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
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="Enter your email"
            />
            <ErrorMessage message={errors.email} />
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
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label>
              <FaLock className="input-icon" />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Create a password (min. 6 characters)"
            />
            <ErrorMessage message={errors.password} />
          </div>

          <div className="form-group">
            <label>
              <FaLock className="input-icon" />
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              placeholder="Confirm your password"
            />
            <ErrorMessage message={errors.confirmPassword} />
          </div>

          <div className="form-group">
            <label>
              <FaMapMarkerAlt className="input-icon" />
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter your address"
            />
          </div>

          <div className="form-group">
            <label>I want to join as:</label>
            <div className="role-selection">
              {['customer', 'provider'].map((role) => (
                <div key={role} className="role-option">
                  <input
                    type="radio"
                    id={role}
                    name="userType"
                    value={role}
                    checked={formData.userType === role}
                    onChange={handleChange}
                  />
                  <label htmlFor={role} className="role-label">
                    {role === 'provider' ? <FaTools /> : <FaUser />} {role.charAt(0).toUpperCase() + role.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {formData.userType === 'provider' && (
            <div className="form-group">
              <label htmlFor="profession-select">Profession</label>
              <select
                id="profession-select"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                className={`form-control ${errors.profession ? 'is-invalid' : ''}`}
                required
              >
                <option value="">Select profession</option>
                {PROVIDER_PROFESSIONS.map((profession) => (
                  <option key={profession} value={profession}>
                    {profession}
                  </option>
                ))}
              </select>
              <ErrorMessage message={errors.profession} />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block">
            Create Account
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
