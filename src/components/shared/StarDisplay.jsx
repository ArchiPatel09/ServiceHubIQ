import React from 'react';
import { FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa';

const getStarSizeClass = (size) => {
  if (size <= 13) return 'star-size-sm';
  if (size <= 16) return 'star-size-md';
  return 'star-size-lg';
};

const StarDisplay = ({
  value,
  size = 16,
  showValue = false,
  totalReviews = null,
  showReviewCount = totalReviews !== null,
  emptyText = 'No ratings yet',
  className = ''
}) => {
  const numericValue = Number(value);
  const reviewCount = Number(totalReviews || 0);

  if (!Number.isFinite(numericValue) || (showReviewCount && reviewCount <= 0)) {
    return <span className={`star-display-empty ${className}`.trim()}>{emptyText}</span>;
  }

  const sizeClass = getStarSizeClass(size);

  return (
    <span className={`star-display ${sizeClass} ${className}`.trim()}>
      {[1, 2, 3, 4, 5].map((star) => {
        const diff = numericValue - (star - 1);
        if (diff >= 1) {
          return <FaStar key={star} className="star-icon filled" />;
        }

        if (diff >= 0.5) {
          return <FaStarHalfAlt key={star} className="star-icon filled" />;
        }

        return <FaRegStar key={star} className="star-icon" />;
      })}
      {showValue && <strong className="star-display-value">{numericValue.toFixed(1)}</strong>}
      {showReviewCount && (
        <span className="star-display-meta">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
      )}
    </span>
  );
};

export default StarDisplay;