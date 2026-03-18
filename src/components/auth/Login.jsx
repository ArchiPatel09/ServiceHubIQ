import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { EMAIL_REGEX } from '../../utils/validation';
import { SERVICES } from '../../services/constants';
import ErrorMessage from '../shared/ErrorMessage';
import { FaEnvelope, FaLock, FaUser, FaTools, FaGoogle, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';

const getDashboardPathForRole = (role) => {
  if (role === 'provider') return '/provider-dashboard';
  if (role === 'admin') return '/admin-dashboard';
  return '/customer-dashboard';
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, completeOAuthLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
    provider_service: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const oauthToken = searchParams.get('oauthToken');
    const oauthError = searchParams.get('oauthError');

    if (oauthError) {
      setErrors({ general: decodeURIComponent(oauthError) });
      return;
    }

    if (!oauthToken) return;

    const complete = async () => {
      try {
        setLoading(true);
        const oauthUser = await completeOAuthLogin(oauthToken);
        navigate(getDashboardPathForRole(oauthUser?.role), { replace: true });
      } catch (error) {
        setErrors({ general: error.message || 'Google login failed' });
      } finally {
        setLoading(false);
      }
    };

    complete();
  }, [searchParams, completeOAuthLogin, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'role' && value !== 'provider') {
        return { ...prev, role: value, provider_service: '' };
      }
      return { ...prev, [name]: value };
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (errors.general) setErrors((prev) => ({ ...prev, general: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

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

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    // Fix: provider service is a validation input and must match the stored provider profile.
    if (formData.role === 'provider' && !formData.provider_service) {
      newErrors.provider_service = 'Please select your service';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const loggedInUser = await login(
        formData.email.trim(),
        formData.password,
        formData.role,
        formData.role === 'provider' ? formData.provider_service : ''
      );

      const from = location.state?.from;
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      // Fix: post-login navigation is based on the authenticated user's stored role.
      navigate(getDashboardPathForRole(loggedInUser?.role));
    } catch (error) {
      setErrors({ general: error.message || 'Invalid credentials. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!formData.role) {
      setErrors({ role: 'Please select a role to continue with Google' });
      return;
    }

    // Fix: existing users still validate against DB role/service, while new Google users
    // can use the selected values only during first-time signup.
    if (formData.role === 'provider' && !formData.provider_service) {
      setErrors({ provider_service: 'Please select your service to continue with Google' });
      return;
    }
    window.location.href = authAPI.googleLoginUrl(formData.role, formData.provider_service);
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-login">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to ServiceHubIQ</p>

        <form onSubmit={handleSubmit} className="auth-form auth-form-login" noValidate>
          <ErrorMessage message={errors.general} className="form-error-global" />

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
            <ErrorMessage message={errors.email} />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-group has-toggle">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                disabled={loading}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            <ErrorMessage message={errors.password} />
          </div>

          <div className="form-options">
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <div className="form-group">
            <label>Login As:</label>
            <div className="role-options">
              <div className={`role-option ${formData.role === 'customer' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  id="customer"
                  name="role"
                  value="customer"
                  checked={formData.role === 'customer'}
                  onChange={handleChange}
                />
                <label htmlFor="customer">
                  <FaUser />
                  <span>Customer</span>
                </label>
              </div>

              <div className={`role-option ${formData.role === 'provider' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  id="provider"
                  name="role"
                  value="provider"
                  checked={formData.role === 'provider'}
                  onChange={handleChange}
                />
                <label htmlFor="provider">
                  <FaTools />
                  <span>Provider</span>
                </label>
              </div>

              <div className={`role-option ${formData.role === 'admin' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  id="admin"
                  name="role"
                  value="admin"
                  checked={formData.role === 'admin'}
                  onChange={handleChange}
                />
                <label htmlFor="admin">
                  <FaShieldAlt />
                  <span>Admin</span>
                </label>
              </div>
            </div>
            <ErrorMessage message={errors.role} />
          </div>

          {formData.role === 'provider' && (
            <div className="form-group">
              <label>Service</label>
              <select
                name="provider_service"
                value={formData.provider_service}
                onChange={handleChange}
                className={`form-control ${errors.provider_service ? 'is-invalid' : ''}`}
                disabled={loading}
              >
                <option value="">Select your service</option>
                {SERVICES.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.label}
                  </option>
                ))}
              </select>
              <ErrorMessage message={errors.provider_service} />
            </div>
          )}

          <div className="auth-actions">
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type="button"
              className="btn btn-outline btn-block google-signin-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <FaGoogle />
              <span>Continue with Google</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
