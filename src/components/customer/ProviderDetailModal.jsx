import React, { useEffect, useMemo, useState } from 'react';
import { FaClock, FaMapMarkerAlt, FaPhoneAlt, FaStar } from 'react-icons/fa';
import Modal from '../shared/Modal';
import ErrorMessage from '../shared/ErrorMessage';
import StarDisplay from '../shared/StarDisplay';
import { extractApiError, ratingAPI } from '../../services/api';
import { formatAddress } from '../../utils/address';

const formatReviewDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString();
};

const ProviderDetailModal = ({ open, provider, onClose, onBook }) => {
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fallbackStats = useMemo(
    () => ({
      averageRating: Number(provider?.averageRating || 0),
      totalReviews: Number(provider?.totalReviews || 0)
    }),
    [provider]
  );

  useEffect(() => {
    if (!open || !provider?.id) {
      setStats({ averageRating: 0, totalReviews: 0 });
      setReviews([]);
      setError('');
      setLoading(false);
      return undefined;
    }

    let isActive = true;

    const loadProviderDetails = async () => {
      try {
        setLoading(true);
        setError('');
        setStats(fallbackStats);

        const [statsResponse, reviewsResponse] = await Promise.all([
          ratingAPI.getProviderStats(provider.id),
          ratingAPI.getProviderReviews(provider.id, 6)
        ]);

        if (!isActive) return;

        setStats({
          averageRating: Number(statsResponse?.data?.data?.averageRating || 0),
          totalReviews: Number(statsResponse?.data?.data?.totalReviews || 0)
        });
        setReviews(reviewsResponse?.data?.data || []);
      } catch (err) {
        if (!isActive) return;
        setStats(fallbackStats);
        setReviews([]);
        setError(extractApiError(err, 'Failed to load provider rating details.'));
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadProviderDetails();

    return () => {
      isActive = false;
    };
  }, [open, provider, fallbackStats]);

  if (!provider) {
    return null;
  }

  const actions = (
    <>
      <button type="button" className="btn btn-outline" onClick={onClose}>
        Close
      </button>
      <button type="button" className="btn btn-primary" onClick={() => onBook(provider.serviceKey)}>
        Book Now
      </button>
    </>
  );

  return (
    <Modal open={open} title={provider.provider} onClose={onClose} actions={actions} className="provider-detail-modal">
      <div className="provider-detail-summary">
        <div>
          <span className="provider-detail-label">Service</span>
          <p className="provider-detail-value">{provider.category}</p>
        </div>
        <div>
          <span className="provider-detail-label">Price</span>
          <p className="provider-detail-value">${provider.price}/service</p>
        </div>
      </div>

      <div className="provider-detail-meta">
        <div className="provider-detail-meta-item">
          <FaMapMarkerAlt />
          <span>{provider.location || formatAddress(provider.address) || 'Location not set'}</span>
        </div>
        {provider.phone ? (
          <div className="provider-detail-meta-item">
            <FaPhoneAlt />
            <span>{provider.phone}</span>
          </div>
        ) : null}
        <div className="provider-detail-meta-item">
          <FaClock />
          <span>{provider.available ? 'Available to book' : 'Currently unavailable'}</span>
        </div>
      </div>

      <div className="provider-detail-rating-card">
        <div>
          <span className="provider-detail-label">Average Rating</span>
          <div className="provider-detail-rating-row">
            <StarDisplay
              value={stats.averageRating}
              totalReviews={stats.totalReviews}
              showValue
              size={18}
              emptyText="No ratings yet"
            />
          </div>
        </div>
        <div className="provider-detail-score">
          <FaStar />
          <strong>{stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : 'New'}</strong>
        </div>
      </div>

      <ErrorMessage message={error} className="form-error-global" />

      {loading ? (
        <div className="provider-detail-empty">Loading provider reviews...</div>
      ) : reviews.length > 0 ? (
        <div className="provider-detail-reviews">
          <h4>Recent Reviews</h4>
          <div className="provider-detail-review-list">
            {reviews.map((review) => (
              <article key={review.id} className="provider-detail-review-item">
                <div className="provider-detail-review-header">
                  <div>
                    <strong>{review.customerName}</strong>
                    <p>{formatReviewDate(review.createdAt)}</p>
                  </div>
                  <StarDisplay value={review.rating} size={13} showValue={false} showReviewCount={false} />
                </div>
                <p className="provider-detail-review-text">{review.reviewText || 'Customer left a star rating without a written review.'}</p>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="provider-detail-empty">No ratings yet. Be the first customer to leave feedback after a completed booking.</div>
      )}
    </Modal>
  );
};

export default ProviderDetailModal;