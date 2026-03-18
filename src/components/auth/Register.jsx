import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EMAIL_REGEX } from '../../utils/validation';
import { SERVICES } from '../../services/constants';
import AddressFields from '../shared/AddressFields';
import ErrorMessage from '../shared/ErrorMessage';
import Modal from '../shared/Modal';
import { getAddressFieldErrors } from '../../utils/addressValidation';
import { FaUser, FaEnvelope, FaLock, FaPhoneAlt, FaMapMarkerAlt, FaTools, FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      formatted: ''
    },
    provider_service: '',
    userType: 'customer',
    profile_image: ''
  });

  const [errors, setErrors] = useState({});
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleAddressSelect = (address) => {
    setFormData((prev) => ({ ...prev, address }));
    if (errors.addressFields) setErrors((prev) => ({ ...prev, addressFields: null }));
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

    if (formData.userType === 'provider' && !formData.provider_service) {
      newErrors.provider_service = 'Please select a service';
    }

    // Fix 6: block incomplete addresses before signup reaches the API.
    const addressFieldErrors = getAddressFieldErrors(formData.address);
    if (Object.keys(addressFieldErrors).length > 0) {
      newErrors.addressFields = addressFieldErrors;
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
      setSuccessModalOpen(true);
      setTimeout(() => navigate('/login', { replace: true }), 12000);
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
              <FaPhoneAlt className="input-icon" />
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
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Create a password (min. 6 characters)"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            <ErrorMessage message={errors.password} />
          </div>

          <div className="form-group">
            <label>
              <FaLock className="input-icon" />
              Confirm Password
            </label>
            <div className="password-field">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showConfirmPassword}
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            <ErrorMessage message={errors.confirmPassword} />
          </div>

          <div className="form-group">
            <label>
              <FaMapMarkerAlt className="input-icon" />
              Address
            </label>
            <AddressFields
              value={formData.address}
              onChange={handleAddressSelect}
              errors={errors.addressFields || {}}
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
              <label htmlFor="service-select">Service</label>
              <select
                id="service-select"
                name="provider_service"
                value={formData.provider_service}
                onChange={handleChange}
                className={`form-control ${errors.provider_service ? 'is-invalid' : ''}`}
                required
              >
                <option value="">Select service</option>
                {SERVICES.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.label}
                  </option>
                ))}
              </select>
              <ErrorMessage message={errors.provider_service} />
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

      <Modal
        open={successModalOpen}
        title="Account Created"
        onClose={() => setSuccessModalOpen(false)}
        actions={
          <button type="button" className="btn btn-primary" onClick={() => navigate('/login', { replace: true })}>
            Go to Sign In
          </button>
        }
      >
        <p>Your account was created successfully. We are redirecting you to sign in.</p>
      </Modal>
    </div>
  );
};

export default Register;
