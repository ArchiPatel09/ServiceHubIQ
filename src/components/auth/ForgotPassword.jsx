import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import { EMAIL_REGEX } from '../../utils/validation';
import ErrorMessage from '../shared/ErrorMessage';
import { authAPI, extractApiError } from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      await authAPI.forgotPassword({ email: email.trim() });
      setSubmitted(true);
    } catch (error) {
      setErrors({ general: extractApiError(error, 'Unable to start reset. Please try again.') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-subtitle">
          {submitted ? 'Check your email for reset instructions.' : 'We will send a reset link to your email.'}
        </p>

        {!submitted && (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <ErrorMessage message={errors.general} className="form-error-global" />
            <div className="form-group">
              <label>
                <FaEnvelope className="input-icon" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="Enter your email"
                disabled={loading}
              />
              <ErrorMessage message={errors.email} />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {submitted && (
          <div className="auth-actions">
            <Link to="/login" className="btn btn-primary btn-block">
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;