import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FaHome,
  FaTools,
  FaCalendarAlt,
  FaHistory,
  FaUser,
  FaSignOutAlt,
  FaChartLine,
  FaCaretDown,
  FaMoon,
  FaSun
} from 'react-icons/fa';

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('servicehubiq_user');
    logout();
    setDropdownOpen(false);
    navigate('/login', { replace: true });
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="ServiceHubIQ Logo" className="logo-image" />
            <span className="logo-text">ServiceHubIQ</span>
          </Link>

          {user && (
            <nav className="nav">
              <ul className="nav-list">
                <li className="nav-item">
                  <Link to="/" className="nav-link">
                    <FaHome className="nav-icon" />
                    <span>Home</span>
                  </Link>
                </li>

                {user.role === 'customer' && (
                  <>
                    <li className="nav-item">
                      <Link to="/services" className="nav-link">
                        <FaTools className="nav-icon" />
                        <span>Services</span>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/book-service" className="nav-link">
                        <FaCalendarAlt className="nav-icon" />
                        <span>Book Service</span>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/booking-history" className="nav-link">
                        <FaHistory className="nav-icon" />
                        <span>History</span>
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          )}

          <div className="header-actions">
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {isDark ? <FaSun /> : <FaMoon />}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>

            {user ? (
              <div className="user-menu-wrapper" ref={dropdownRef}>
                <button type="button" className="user-profile-btn" onClick={() => setDropdownOpen((prev) => !prev)}>
                  <div className="user-avatar">{userInitial}</div>
                  <div className="user-info">
                    <span className="user-name">{user.name || 'User'}</span>
                    <span className="user-role">{user.role || 'User'}</span>
                  </div>
                  <FaCaretDown className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />
                </button>

                <div className={`dropdown-menu ${dropdownOpen ? 'dropdown-open' : ''}`}>
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{userInitial}</div>
                    <div>
                      <div className="dropdown-name">{user.name || 'User'}</div>
                      <div className="dropdown-email">{user.email || 'user@example.com'}</div>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FaChartLine />
                    <span>Dashboard</span>
                  </Link>

                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FaUser />
                    <span>My Profile</span>
                  </Link>

                  <div className="dropdown-divider" />

                  <button type="button" className="dropdown-item logout-item" onClick={handleLogout}>
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-primary btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-outline btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
