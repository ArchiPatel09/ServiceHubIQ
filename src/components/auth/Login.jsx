import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { EMAIL_REGEX } from '../../utils/validation';
import ErrorMessage from '../shared/ErrorMessage';
import { FaEnvelope, FaLock, FaUser, FaTools } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, completeOAuthLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const oauthToken = searchParams.get('oauthToken');
    if (!oauthToken) return;

    const complete = async () => {
      try {
        setLoading(true);
        const oauthUser = await completeOAuthLogin(oauthToken);
        if (oauthUser?.role === 'provider') {
          navigate('/provider-dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
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
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      await login(formData.email.trim(), formData.password, formData.role);

      const from = location.state?.from;
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      if (formData.role === 'provider') {
        navigate('/provider-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setErrors({ general: error.message || 'Invalid credentials. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = authAPI.googleLoginUrl();
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to ServiceHubIQ</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
            <ErrorMessage message={errors.password} />
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
            </div>
            <ErrorMessage message={errors.role} />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <button type="button" className="btn btn-outline btn-block" onClick={handleGoogleLogin} disabled={loading}>
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
