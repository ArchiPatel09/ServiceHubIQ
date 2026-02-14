import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceCard from '../shared/ServiceCard';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaUndo } from 'react-icons/fa';

const ServiceBrowser = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('');

  const categories = [
    'All Services',
    'Plumbing',
    'Electrical',
    'Cleaning',
    'Snow Removal',
    'Painting',
    'Appliance Repair',
    'Gardening',
    'Carpentry',
    'HVAC'
  ];

  const locations = [
    'Toronto, ON',
    'Vancouver, BC',
    'Montreal, QC',
    'Calgary, AB',
    'Ottawa, ON',
    'Edmonton, AB',
    'Winnipeg, MB',
    'Halifax, NS'
  ];

  const mockServices = useMemo(
    () => [
      {
        id: 1,
        name: 'Emergency Plumbing Service',
        category: 'Plumbing',
        description: '24/7 emergency plumbing services for leaks, clogs, and repairs',
        price: 89,
        rating: 4.8,
        reviews: 124,
        provider: 'ProFix Plumbing',
        location: 'Toronto, ON',
        available: true
      },
      {
        id: 2,
        name: 'Complete Home Cleaning',
        category: 'Cleaning',
        description: 'Professional deep cleaning for homes and apartments',
        price: 129,
        rating: 4.9,
        reviews: 256,
        provider: 'Sparkle Clean',
        location: 'Vancouver, BC',
        available: true
      },
      {
        id: 3,
        name: 'Electrical Installation',
        category: 'Electrical',
        description: 'Safe and certified electrical installations and repairs',
        price: 149,
        rating: 4.7,
        reviews: 89,
        provider: 'SafeWatt Electric',
        location: 'Montreal, QC',
        available: true
      },
      {
        id: 4,
        name: 'Snow Removal Service',
        category: 'Snow Removal',
        description: 'Residential and commercial snow clearing',
        price: 49,
        rating: 4.6,
        reviews: 187,
        provider: 'SnowClear Pro',
        location: 'Calgary, AB',
        available: true
      }
    ],
    []
  );

  useEffect(() => {
    setServices(mockServices);
    setFilteredServices(mockServices);
  }, [mockServices]);

  useEffect(() => {
    let filtered = services;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(term) ||
          service.category.toLowerCase().includes(term) ||
          service.description.toLowerCase().includes(term) ||
          service.provider.toLowerCase().includes(term)
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((service) => service.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (selectedLocation) {
      filtered = filtered.filter((service) => service.location.toLowerCase().includes(selectedLocation.toLowerCase()));
    }

    setFilteredServices(filtered);
  }, [searchTerm, selectedCategory, selectedLocation, services]);

  const handleBookService = (serviceId) => {
    navigate(`/book-service?service=${serviceId}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLocation('');
  };

  const activeFiltersCount = (searchTerm.trim() ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0) + (selectedLocation ? 1 : 0);

  return (
    <div className="service-browser">
      <div className="browser-header">
        <h2>Find Professional Services</h2>
        <p>Browse and book verified service professionals across Canada</p>
      </div>

      <div className="browser-controls">
        <div className="search-box services-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search services, categories, providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters services-filters">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map((category) => (
                <option key={category} value={category === 'All Services' ? 'all' : category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <FaMapMarkerAlt className="filter-icon" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="filter-select"
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {activeFiltersCount > 0 && (
            <button type="button" className="btn btn-outline services-clear-btn" onClick={clearFilters} title="Clear filters">
              <FaUndo />
              Clear ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {filteredServices.length > 0 ? (
        <div className="services-grid">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} onBook={() => handleBookService(service.id)} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <h3>No services found</h3>
          <p>Try adjusting your search criteria or clear the filters.</p>
          <button type="button" className="btn btn-primary" onClick={clearFilters}>
            Show All Services
          </button>
        </div>
      )}

      <div className="services-stats">
        <div className="stat-card">
          <h4>{services.length}+</h4>
          <p>Services Available</p>
        </div>
        <div className="stat-card">
          <h4>4.8+</h4>
          <p>Average Rating</p>
        </div>
        <div className="stat-card">
          <h4>50+</h4>
          <p>Cities Covered</p>
        </div>
        <div className="stat-card">
          <h4>24/7</h4>
          <p>Support Availability</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceBrowser;
