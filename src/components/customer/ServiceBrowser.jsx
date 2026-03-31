import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaFilter, FaMapMarkerAlt, FaSearch, FaUndo } from 'react-icons/fa';
import ProviderDetailModal from './ProviderDetailModal';
import ServiceCard from '../shared/ServiceCard';
import ErrorMessage from '../shared/ErrorMessage';
import { extractApiError, userAPI } from '../../services/api';
import { CANADIAN_CITIES, SERVICES, SERVICE_LABELS } from '../../services/constants';
import { formatCityState } from '../../utils/address';
import { getServicePrice } from '../../utils/servicePricing';

const ServiceBrowser = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [providers, setProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    const term = searchParams.get('search') || '';
    setSearchTerm(term);
  }, [searchParams]);

  const categories = ['All Services', ...SERVICES.map((service) => SERVICE_LABELS[service.id])];
  const locations = CANADIAN_CITIES;

  useEffect(() => {
    const loadProviders = async () => {
      try {
        setLoading(true);
        setError('');
        const serviceParam =
          selectedCategory === 'all'
            ? undefined
            : Object.keys(SERVICE_LABELS).find((key) => SERVICE_LABELS[key] === selectedCategory);

        const response = await userAPI.getProviders(serviceParam, selectedLocation || undefined);
        setProviders(response?.data?.data || []);
      } catch (err) {
        setError(extractApiError(err, 'Failed to load providers'));
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, [selectedCategory, selectedLocation]);

  const services = useMemo(() => {
    return providers.map((provider) => {
      const serviceId = provider.provider_service || provider.providerService;
      const serviceLabel = SERVICE_LABELS[serviceId] || 'Service';
      const price = getServicePrice(serviceId);

      return {
        id: provider._id,
        serviceKey: serviceId,
        name: `${serviceLabel} Service`,
        category: serviceLabel,
        description: `Provided by ${provider.name}`,
        price: price || 0,
        averageRating: Number(provider.averageRating || 0),
        totalReviews: Number(provider.totalReviews || 0),
        provider: provider.name,
        location: formatCityState(provider.address) || 'Location not set',
        address: provider.address,
        phone: provider.phone,
        available: true
      };
    });
  }, [providers]);

  const filteredServices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return services.filter((service) => {
      if (!term) return true;
      return (
        service.name.toLowerCase().includes(term) ||
        service.category.toLowerCase().includes(term) ||
        service.description.toLowerCase().includes(term) ||
        service.provider.toLowerCase().includes(term) ||
        service.location.toLowerCase().includes(term)
      );
    });
  }, [services, searchTerm]);

  const handleBookService = (serviceKey) => {
    navigate(`/book-service?service=${serviceKey}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLocation('');
  };

  const activeFiltersCount =
    (searchTerm.trim() ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0) + (selectedLocation ? 1 : 0);

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
            placeholder="Search services, providers, locations..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters services-filters">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
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
              onChange={(event) => setSelectedLocation(event.target.value)}
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

      <ErrorMessage message={error} className="form-error-global" />

      {loading ? (
        <div className="empty-history">
          <h3>Loading services...</h3>
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="services-grid">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBook={() => handleBookService(service.serviceKey)}
              onViewDetails={() => setSelectedProvider(service)}
            />
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

      <ProviderDetailModal
        open={Boolean(selectedProvider)}
        provider={selectedProvider}
        onClose={() => setSelectedProvider(null)}
        onBook={handleBookService}
      />
    </div>
  );
};

export default ServiceBrowser;