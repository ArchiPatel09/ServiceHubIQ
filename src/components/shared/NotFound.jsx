import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <div className="error-icon">
            <FaExclamationTriangle />
          </div>
          <h1>404 - Page Not Found</h1>
          <p className="error-message">
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </p>
          
          <div className="suggestions">
            <h3>Here are some helpful links:</h3>
            <div className="suggestion-links">
              <Link to="/" className="suggestion-link">
                <FaHome /> Home Page
              </Link>
              <Link to="/services" className="suggestion-link">
                <FaSearch /> Browse Services
              </Link>
              <Link to="/dashboard" className="suggestion-link">
                Your Dashboard
              </Link>
              <Link to="/contact" className="suggestion-link">
                Contact Support
              </Link>
            </div>
          </div>
          
          <div className="search-box">
            <h4>Search our site:</h4>
            <div className="search-wrapper">
              <input 
                type="text" 
                placeholder="What are you looking for?" 
                className="search-input"
              />
              <button className="btn btn-primary">
                <FaSearch />
              </button>
            </div>
          </div>
          
          <Link to="/" className="btn btn-primary btn-lg">
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;