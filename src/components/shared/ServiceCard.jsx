import React from 'react';
import { FaStar, FaMapMarkerAlt, FaTools, FaCheckCircle } from 'react-icons/fa';

const ServiceCard = ({ service, onBook }) => {
  const { 
    name, 
    category, 
    description, 
    price, 
    rating, 
    reviews, 
    provider, 
    location, 
    available 
  } = service;

  return (
    <div className="service-card">
      <div className="service-card-header">
        <div className="service-category">
          <FaTools className="category-icon" />
          <span>{category}</span>
        </div>
        {available && (
          <div className="service-availability">
            <FaCheckCircle className="available-icon" />
            <span>Available</span>
          </div>
        )}
      </div>

      <div className="service-card-body">
        <h3 className="service-name">{name}</h3>
        <p className="service-description">{description}</p>
        
        <div className="service-provider">
          <strong>Provider:</strong> {provider}
        </div>

        <div className="service-location">
          <FaMapMarkerAlt className="location-icon" />
          <span>{location}</span>
        </div>

        <div className="service-rating">
          <div className="stars">
            {[...Array(5)].map((_, index) => (
              <FaStar 
                key={index} 
                className={`star ${index < Math.floor(rating) ? 'filled' : ''}`}
              />
            ))}
          </div>
          <span className="rating-text">
            {rating} ({reviews} reviews)
          </span>
        </div>

        <div className="service-price">
          <span className="price-amount">${price}</span>
          <span className="price-unit">/service</span>
        </div>
      </div>

      <div className="service-card-footer">
        <button 
          className="btn btn-primary btn-block"
          onClick={onBook}
          disabled={!available}
        >
          {available ? 'Book Now' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;