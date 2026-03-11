import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SERVICES } from '../../services/constants';
import { useAuth } from '../../context/AuthContext';
import { FaTools, FaHome, FaCalendarAlt, FaStar, FaShieldAlt, FaChartLine } from 'react-icons/fa';

const SEARCH_PLACEHOLDERS = [
  'Find a plumber near you...',
  'Book an electrician...',
  'Schedule garden cleaning...'
];

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholderText, setPlaceholderText] = useState('');

  useEffect(() => {
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId;

    const tick = () => {
      const phrase = SEARCH_PLACEHOLDERS[phraseIndex];

      if (isDeleting) {
        charIndex -= 1;
      } else {
        charIndex += 1;
      }

      const nextText = phrase.slice(0, charIndex);
      setPlaceholderText(nextText);

      if (!isDeleting && nextText === phrase) {
        isDeleting = true;
        timeoutId = setTimeout(tick, 1200);
        return;
      }

      if (isDeleting && nextText.length === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % SEARCH_PLACEHOLDERS.length;
      }

      const delay = isDeleting ? 55 : 95;
      timeoutId = setTimeout(tick, delay);
    };

    timeoutId = setTimeout(tick, 400);
    return () => clearTimeout(timeoutId);
  }, []);

  const normalize = (value) => value.toLowerCase().replace(/[_-]/g, ' ').trim();
  const stem = (value) => normalize(value).split(' ')[0].slice(0, 5);

  const handleSearch = () => {
    const rawTerm = searchQuery.trim();
    if (!rawTerm) return;

    const term = normalize(rawTerm);
    const termStem = stem(term);

    const isServiceQuery = SERVICES.some(({ id, label }) => {
      const labelNorm = normalize(label);
      const idNorm = normalize(id);

      if (labelNorm.includes(term) || term.includes(labelNorm) || idNorm.includes(term) || term.includes(idNorm)) {
        return true;
      }

      if (!termStem) return false;
      return stem(labelNorm) === termStem || stem(idNorm) === termStem;
    });

    if (isServiceQuery) {
      navigate(`/services?search=${encodeURIComponent(rawTerm)}`);
    }
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-logo">
            <img src="/logo.png" alt="ServiceHubIQ" className="hero-logo-image" />
          </div>

          <h1 className="hero-title">
            Welcome to <span className="brand">ServiceHubIQ</span>
          </h1>
          <p className="hero-subtitle">Your one-stop solution for all home maintenance needs across Canada</p>

          <div className="home-search-wrapper">
            <input
              type="text"
              className="home-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder={placeholderText || SEARCH_PLACEHOLDERS[0]}
              aria-label="Search for home services"
            />
          </div>

          <p className="hero-description">
            Connect with verified professionals for deep cleaning, plumbing, electrical work, gardening, and snow removal.
            AI-powered matching for better service and employment opportunities.
          </p>

          <div className="hero-buttons">
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Sign In
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Why Choose ServiceHubIQ?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FaTools className="feature-icon" />
            <h3>Verified Professionals</h3>
            <p>All service providers are verified, trained, and background-checked</p>
          </div>

          <div className="feature-card">
            <FaChartLine className="feature-icon" />
            <h3>AI-Powered Matching</h3>
            <p>Smart job matching and demand forecasting for better service delivery</p>
          </div>

          <div className="feature-card">
            <FaCalendarAlt className="feature-icon" />
            <h3>Easy Booking</h3>
            <p>Book one-time or recurring services with transparent pricing</p>
          </div>

          <div className="feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>Service Guarantee</h3>
            <p>Quality assurance with ratings, reviews, and service history tracking</p>
          </div>

          <div className="feature-card">
            <FaStar className="feature-icon" />
            <h3>Flexible Employment</h3>
            <p>Helping skilled workers, students, and new immigrants find opportunities</p>
          </div>

          <div className="feature-card">
            <FaHome className="feature-icon" />
            <h3>Nationwide Coverage</h3>
            <p>Available across Canada with localized service providers</p>
          </div>
        </div>
      </section>

      <section className="services-preview">
        <h2 className="section-title">Popular Services</h2>
        <div className="services-grid">
          {['Deep Cleaning', 'Plumbing', 'Electrician', 'Gardener', 'Snow Removal'].map((service) => (
            <div key={service} className="service-tag">
              {service}
            </div>
          ))}
        </div>
        <Link to="/services" className="btn btn-outline">
          View All Services
        </Link>
      </section>
    </div>
  );
};

export default HomePage;