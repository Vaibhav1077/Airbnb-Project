import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getListings } from '../api';
import CategoryFilter from '../components/CategoryFilter';
import './Listings.css';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => {
    setLoading(true);
    getListings(category)
      .then((res) => setListings(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [category]);

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
