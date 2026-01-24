import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTools, FaHome, FaCalendarAlt, FaStar, FaShieldAlt, FaChartLine } from 'react-icons/fa';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          {/* Add logo to hero */}
          <div className="hero-logo">
            <img 
              src="/logo.png"  // From public folder
              alt="ServiceHubIQ" 
              className="hero-logo-image"
            />
          </div>
          
          <h1 className="hero-title">
            Welcome to <span className="brand">ServiceHubIQ</span>
          </h1>
          <p className="hero-subtitle">
            Your one-stop solution for all home maintenance needs across Canada
          </p>
          <p className="hero-description">
            Connect with verified professionals for plumbing, electrical work, 
            cleaning, snow removal, painting, and more. AI-powered matching for 
            better service and employment opportunities.
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

      {/* Features Section */}
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

      {/* Services Preview */}
      <section className="services-preview">
        <h2 className="section-title">Popular Services</h2>
        <div className="services-grid">
          {['Plumbing', 'Electrical', 'Cleaning', 'Snow Removal', 'Painting', 'Appliance Repair'].map((service) => (
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