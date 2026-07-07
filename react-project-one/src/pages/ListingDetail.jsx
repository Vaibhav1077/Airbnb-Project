import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListing, addReview, deleteReview } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import BookingForm from '../components/BookingForm';
import './ListingDetail.css';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchListing = () => {
    getListing(id)
      .then((res) => setListing(res.data))
      .catch(() => toast.error('Listing not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmitting(true);
    try {
      await addReview(id, reviewForm);
      toast.success('Review added');
      setReviewForm({ rating: 5, comment: '' });
      fetchListing();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(id, reviewId);
      toast.success('Review deleted');
      fetchListing();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete review');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!listing) return <div className="loading">Listing not found</div>;

  return (
    <div className="detail-page">
      <div className="detail-header">
        <h1>{listing.title}</h1>
        <p className="detail-location">{listing.location}, {listing.country}</p>
      </div>

      <div className="detail-images">
        {listing.image?.map((img, i) => (
          <img key={i} src={img.url} alt={`${listing.title} ${i + 1}`} />
        ))}
      </div>

      <div className="detail-content">
        <div className="detail-main">
          <div className="detail-host">
            {listing.owner && (
              <p>Hosted by <strong>{listing.owner.username}</strong></p>
            )}
          </div>
          <p className="detail-description">{listing.description}</p>
          <p className="detail-category">Category: <span>{listing.category_type}</span></p>

          {/* Reviews Section */}
          <div className="reviews-section">
            <h2>Reviews ({listing.reviews?.length || 0})</h2>

            {user && (
              <form className="review-form" onSubmit={handleReviewSubmit}>
                <div className="rating-input">
                  <label>Rating:</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  placeholder="Write your review..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  required
                  rows={3}
                />
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Submit Review'}
                </button>
              </form>
            )}

            <div className="reviews-list">
              {listing.reviews?.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <strong>@{review.author?.username || 'Anonymous'}</strong>
                    <span className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  </div>
                  <p>{review.comment}</p>
                  {user && review.author?._id === user._id && (
                    <button className="btn-delete-review" onClick={() => handleDeleteReview(review._id)}>
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="price-card">
            <p className="price-amount">&#8377;{listing.price?.toLocaleString('en-IN')} <span>/ night</span></p>
            <BookingForm listing={listing} />
          </div>
        </div>
      </div>
    </div>
  );
}
