import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Wishlist.css';

export default function Wishlist() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getWishlist()
      .then((res) => setListings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleRemove = async (id) => {
    try {
      await removeFromWishlist(id);
      setListings((prev) => prev.filter((l) => l._id !== id));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    }
  };

  if (!user) {
    return (
      <div className="wishlist-page">
        <h1>My Wishlist</h1>
        <p className="empty-message">Please <Link to="/login">log in</Link> to view your wishlist.</p>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading wishlist...</div>;

  return (
    <div className="wishlist-page">
      <h1>My Wishlist</h1>
      {listings.length === 0 ? (
        <p className="empty-message">
          Your wishlist is empty. <Link to="/">Browse listings</Link> and save your favorites!
        </p>
      ) : (
        <div className="wishlist-grid">
          {listings.map((listing) => (
            <div key={listing._id} className="wishlist-card">
              <button
                className="wishlist-remove"
                onClick={() => handleRemove(listing._id)}
                aria-label="Remove from wishlist"
              >
                &times;
              </button>
              <Link to={`/listings/${listing._id}`} className="wishlist-link">
                <div className="wishlist-img-container">
                  <img
                    src={listing.image?.[0]?.url || 'https://via.placeholder.com/300x200'}
                    alt={listing.title}
                  />
                </div>
                <div className="wishlist-info">
                  <h3>{listing.title}</h3>
                  <p className="wishlist-location">{listing.location}, {listing.country}</p>
                  <p className="wishlist-price">
                    <span>&#8377;{listing.price?.toLocaleString('en-IN')}</span> / night
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
