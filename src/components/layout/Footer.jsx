import React from 'react';
import { Link } from 'react-router-dom';
import { FaTools, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-logo">
              <FaTools className="footer-logo-icon" />
              <span className="footer-logo-text">ServiceHubIQ</span>
            </div>
            <p className="footer-description">
              Your one-stop solution for all home maintenance needs across Canada. 
              Connecting homeowners with verified professionals through AI-powered matching.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" className="social-link" target="_blank" rel="noopener noreferrer">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" className="social-link" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" className="social-link" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" className="social-link" target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h4 className="footer-title">Our Services</h4>
            <ul className="footer-links">
              <li>Plumbing</li>
              <li>Electrical Work</li>
              <li>Cleaning</li>
              <li>Snow Removal</li>
              <li>Painting</li>
              <li>Appliance Repair</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4 className="footer-title">Contact Us</h4>
            <ul className="contact-info">
              <li>
                <FaEnvelope className="contact-icon" />
                <span>support@servicehubiq.com</span>
              </li>
              <li>
                <FaPhone className="contact-icon" />
                <span>+1 (416) 555-0123</span>
              </li>
              <li>
                <FaMapMarkerAlt className="contact-icon" />
                <span>Toronto, Ontario, Canada</span>
              </li>
            </ul>
            <div className="newsletter">
              <h5>Stay Updated</h5>
              <div className="newsletter-form">
                <input type="email" placeholder="Your email" className="newsletter-input" />
                <button className="newsletter-btn">Subscribe</button>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} ServiceHubIQ. All rights reserved.</p>
          <p>INFO3220 Systems Project - Team Members: Archiben Patel, Kunj Lakhani, Sahil Halwawala, Yatri Patel</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;