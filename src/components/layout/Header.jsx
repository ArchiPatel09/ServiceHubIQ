import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaHome, 
  FaTools, 
  FaCalendarAlt, 
  FaHistory, 
  FaUser, 
  FaSignOutAlt,
  FaChartLine,
  FaCaretDown,
  FaCog
} from 'react-icons/fa';

const Header = () => {
  const { user, logout } = useAuth();
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
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const getDashboardPath = () => {
    switch(user?.role) {
      case 'customer': return '/dashboard';
      case 'provider': return '/provider-dashboard';
      case 'admin': return '/admin-dashboard';
      default: return '/';
    }
  };

  console.log('Header - User exists?', !!user);
  console.log('Header - User data:', user);

  const styles = {
    header: {
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      padding: '0.75rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 1rem',
    },
    headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      textDecoration: 'none',
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1f2937',
    },
    logoImage: {
      height: '40px', // Adjust height as needed
      width: 'auto',
    },
    nav: {
      display: 'flex',
      gap: '1.5rem',
    },
    navList: {
      display: 'flex',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      gap: '1.5rem',
      alignItems: 'center',
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      textDecoration: 'none',
      color: '#4b5563',
      padding: '0.5rem',
      borderRadius: '6px',
      transition: 'background-color 0.2s',
    },
    userMenuWrapper: {
      position: 'relative',
    },
    userProfileBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem 1rem',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    userAvatar: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      fontSize: '1rem',
    },
    userInfo: {
      textAlign: 'left',
    },
    userName: {
      display: 'block',
      fontWeight: '600',
      fontSize: '0.875rem',
      color: '#1f2937',
    },
    userRole: {
      display: 'block',
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.125rem',
    },
    dropdownMenu: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: '0',
      width: '280px',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      overflow: 'hidden',
    },
    dropdownHeader: {
      padding: '1.25rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    dropdownAvatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.25rem',
      fontWeight: '600',
    },
    dropdownDivider: {
      height: '1px',
      backgroundColor: '#e5e7eb',
      margin: '0.5rem 0',
    },
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.875rem 1.25rem',
      color: '#4b5563',
      textDecoration: 'none',
      backgroundColor: 'transparent',
      border: 'none',
      width: '100%',
      textAlign: 'left',
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    authButtons: {
      display: 'flex',
      gap: '0.5rem',
    },
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.headerContent}>
          {/* Logo - Updated to use logo.png */}
          <Link to="/" style={styles.logo}>
            <img 
              src="/logo.png" 
              alt="ServiceHubIQ Logo" 
              style={styles.logoImage}
            />
            <span>ServiceHubIQ</span>
          </Link>

          {/* Navigation - Show only if user is logged in */}
          {user && (
            <nav style={styles.nav}>
              <ul style={styles.navList}>
                <li>
                  <Link to="/" style={styles.navLink}>
                    <FaHome />
                    <span>Home</span>
                  </Link>
                </li>

                {user.role === 'customer' && (
                  <>
                    <li>
                      <Link to="/services" style={styles.navLink}>
                        <FaTools />
                        <span>Services</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/book-service" style={styles.navLink}>
                        <FaCalendarAlt />
                        <span>Book Service</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/booking-history" style={styles.navLink}>
                        <FaHistory />
                        <span>History</span>
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          )}

          {/* User Actions */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {user ? (
              <div style={styles.userMenuWrapper} ref={dropdownRef}>
                <button 
                  style={styles.userProfileBtn}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                  <div style={styles.userAvatar}>
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div style={styles.userInfo}>
                    <span style={styles.userName}>
                      {user.name || 'User'}
                    </span>
                    <span style={styles.userRole}>
                      {user.role === 'customer' ? '👤 Customer' : 
                       user.role === 'provider' ? '🔧 Provider' : 
                       '👑 Admin'}
                    </span>
                  </div>
                  <FaCaretDown style={{ 
                    color: '#9ca3af',
                    transition: 'transform 0.2s',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)'
                  }} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div style={styles.dropdownMenu}>
                    <div style={styles.dropdownHeader}>
                      <div style={styles.dropdownAvatar}>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '1.125rem' }}>
                          {user.name || 'User'}
                        </div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                          {user.email || 'user@example.com'}
                        </div>
                      </div>
                    </div>
                    
                    <div style={styles.dropdownDivider}></div>
                    
                    <Link 
                      to="/profile" 
                      style={styles.dropdownItem}
                      onClick={() => setDropdownOpen(false)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <FaUser style={{ color: '#6b7280' }} />
                      <span>My Profile</span>
                    </Link>
                    
                    <Link 
                      to={getDashboardPath()} 
                      style={styles.dropdownItem}
                      onClick={() => setDropdownOpen(false)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <FaChartLine style={{ color: '#6b7280' }} />
                      <span>Dashboard</span>
                    </Link>
                    
                    <Link 
                      to="/settings" 
                      style={styles.dropdownItem}
                      onClick={() => setDropdownOpen(false)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <FaCog style={{ color: '#6b7280' }} />
                      <span>Settings</span>
                    </Link>
                    
                    <div style={styles.dropdownDivider}></div>
                    
                    <button 
                      style={{
                        ...styles.dropdownItem,
                        color: '#dc2626'
                      }}
                      onClick={handleLogout}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <FaSignOutAlt style={{ color: '#dc2626' }} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={styles.authButtons}>
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