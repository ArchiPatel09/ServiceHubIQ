import React, { useState } from 'react';
import { FaStar, FaUserCircle } from 'react-icons/fa';

const RatingReview = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState([
    {
      id: 1,
      user: 'John Smith',
      rating: 5,
      comment: 'Excellent service! The plumber arrived on time and fixed the issue quickly.',
      date: '2024-01-15'
    },
    {
      id: 2,
      user: 'Sarah Johnson',
      rating: 4,
      comment: 'Good work, but could be faster. Overall satisfied with the service.',
      date: '2024-01-10'
    }
  ]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (rating === 0 || !review.trim()) return;

    const newReview = {
      id: reviews.length + 1,
      user: 'Current User',
      rating,
      comment: review,
      date: new Date().toISOString().split('T')[0]
    };

    setReviews([newReview, ...reviews]);
    setRating(0);
    setReview('');
    alert('Review submitted successfully!');
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="rating-review-section">
      <div className="rating-overview">
        <div className="average-rating">
          <h3>{averageRating}</h3>
          <div className="stars">
            {[...Array(5)].map((_, index) => (
              <FaStar 
                key={index} 
                className={`star ${index < Math.floor(averageRating) ? 'filled' : ''}`}
              />
            ))}
          </div>
          <p>{reviews.length} reviews</p>
        </div>
      </div>

      <div className="add-review">
        <h4>Add Your Review</h4>
        <form onSubmit={handleSubmitReview}>
          <div className="rating-input">
            <label>Rating:</label>
            <div className="star-rating">
              {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                  <label key={index}>
                    <input
                      type="radio"
                      name="rating"
                      value={ratingValue}
                      onClick={() => setRating(ratingValue)}
                      style={{ display: 'none' }}
                    />
                    <FaStar
                      className={`star ${ratingValue <= (hoverRating || rating) ? 'filled' : ''}`}
                      onMouseEnter={() => setHoverRating(ratingValue)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="review-input">
            <label>Your Review:</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with this service..."
              rows="4"
              className="form-control"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={rating === 0 || !review.trim()}
          >
            Submit Review
          </button>
        </form>
      </div>

      <div className="reviews-list">
        <h4>Customer Reviews</h4>
        {reviews.length > 0 ? (
          reviews.map((reviewItem) => (
            <div key={reviewItem.id} className="review-item">
              <div className="review-header">
                <div className="reviewer">
                  <FaUserCircle className="user-icon" />
                  <div>
                    <strong>{reviewItem.user}</strong>
                    <div className="review-date">{reviewItem.date}</div>
                  </div>
                </div>
                <div className="review-rating">
                  {[...Array(5)].map((_, index) => (
                    <FaStar 
                      key={index} 
                      className={`star ${index < reviewItem.rating ? 'filled' : ''}`}
                    />
                  ))}
                </div>
              </div>
              <p className="review-comment">{reviewItem.comment}</p>
            </div>
          ))
        ) : (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
};

export default RatingReview;