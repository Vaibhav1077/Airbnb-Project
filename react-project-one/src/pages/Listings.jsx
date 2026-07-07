import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getListings } from '../api';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-toastify';
import CategoryFilter from '../components/CategoryFilter';
import './Listings.css';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getListings(category)
      .then((res) => setListings(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [category]);

  const handleWishlist = async (e, listingId) => {
    e.preventDefault(); // prevent Link navigation
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const added = await toggleWishlist(listingId);
      toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div>
      <CategoryFilter selected={category} onChange={setCategory} />
      {loading ? (
        <div className="loading">Loading listings...</div>
      ) : listings.length === 0 ? (
        <div className="no-results">No listings found for this category.</div>
      ) : (
        <div className="listings-grid">
          {listings.map((listing) => (
            <Link to={`/listings/${listing._id}`} key={listing._id} className="listing-card">
              <button
                className={`heart-btn ${isWishlisted(listing._id) ? 'hearted' : ''}`}
                onClick={(e) => handleWishlist(e, listing._id)}
                aria-label="Toggle wishlist"
              >
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                  <path d="M16 28c-.2 0-.5-.1-.7-.2C14.5 27.2 2 19.9 2 11.5 2 7.4 5.4 4 9.5 4c2.6 0 5 1.4 6.5 3.5C17.5 5.4 19.9 4 22.5 4 26.6 4 30 7.4 30 11.5c0 8.4-12.5 15.7-13.3 16.2-.2.2-.5.3-.7.3z" />
                </svg>
              </button>
              <div className="listing-img-container">
                <img
                  src={listing.image?.[0]?.url || 'https://via.placeholder.com/300x200'}
                  alt={listing.title}
                />
              </div>
              <div className="listing-info">
                <h3>{listing.title}</h3>
                <p className="listing-location">{listing.location}, {listing.country}</p>
                <p className="listing-price">
                  <span>&#8377;{listing.price?.toLocaleString('en-IN')}</span> / night
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
