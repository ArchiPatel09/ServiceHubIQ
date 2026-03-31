import React from 'react';
import { FaCheckCircle, FaMapMarkerAlt, FaTools } from 'react-icons/fa';
import StarDisplay from './StarDisplay';

const ServiceCard = ({ service, onBook, onViewDetails }) => {
  const {
    name,
    category,
    description,
    price,
    averageRating,
    totalReviews,
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
          <StarDisplay
            value={averageRating}
            totalReviews={totalReviews}
            showValue={totalReviews > 0}
            emptyText="No ratings yet"
          />
        </div>

        <div className="service-price">
          <span className="price-amount">${price}</span>
          <span className="price-unit">/service</span>
        </div>
      </div>

      <div className="service-card-footer service-card-actions">
        <button
          type="button"
          className="btn btn-outline btn-block"
          onClick={onViewDetails}
        >
          View Details
        </button>
        <button
          type="button"
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